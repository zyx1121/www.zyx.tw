/**
 * WebGL2 version of the renderer's shark rasteriser. One fragment per grid
 * cell runs the same shape test as sampleShark (centre plus 4 sub-samples)
 * for every shark, and the result comes back with one readPixels.
 *
 * The CPU path costs ~37k shape samples per frame, each walking a 20-node
 * spine; on a JS engine without JIT that alone takes 200+ ms. Here it is a
 * few hundred microseconds of GPU work plus a small readback.
 */

export const GPU_SPINE_NODES = 20
/** Texels per shark row: spine nodes, then 3 parameter texels. */
const ROW = GPU_SPINE_NODES + 3
export const GPU_MAX_SHARKS = 32
const MAX_KINDS = 16
const MAX_VARIETIES = 16
const LUT = 1024

export interface GpuKind {
  halfWidth: (s: number) => number
  pectoral: [number, number, number, number]
  falcate: boolean
  pelvic: [number, number, number, number]
  caudal: number
  dorsal: [number, number]
  secondDorsal: [number, number]
  head?: { span: number; sweep: number; depth: number; notch: number }
  eye: [number, number] | null
  gills: [number, number]
  /** 0 none, 1 tiger bars, 2 zebra spots and ridges. */
  markType: number
  koi: boolean
  /** Widest point off the spine, as a fraction of length. */
  maxReach: number
  /** Glow ring around the body, as a fraction of length; 0 for none. */
  halo: number
}

export interface GpuVariety {
  tancho: boolean
  /** Up to 2 layers: keep, cell, radius. */
  patches: { keep: number; cell: number; radius: number }[]
}

const VERT = `#version 300 es
void main() {
  // One triangle that covers the viewport.
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D uSharks;
uniform sampler2D uWidth;
uniform int uCount;
uniform vec2 uCell;
uniform vec4 uPect[${MAX_KINDS}];
uniform vec4 uPelv[${MAX_KINDS}];
uniform vec4 uDors[${MAX_KINDS}];
uniform vec4 uEyeG[${MAX_KINDS}];
uniform vec4 uHead[${MAX_KINDS}];
uniform vec4 uMisc[${MAX_KINDS}];
uniform vec4 uKoiA[${MAX_VARIETIES}];
uniform vec4 uKoiP0[${MAX_VARIETIES}];
uniform vec4 uKoiP1[${MAX_VARIETIES}];

out uvec4 outCell;

const int N = ${GPU_SPINE_NODES};
const float PI = 3.141592653589793;
const int FLAG_BODY = 1;
const int FLAG_EDGE = 2;
const int FLAG_FIN = 3;
const int FLAG_RIDGE = 4;
const int FLAG_EYE = 5;
const int FLAG_MARK = 6;
const int FLAG_HALO = 7;

vec2 sp[N];
float arcs[N];
float L;
float arcTotal;
float finL;
float finR;
int kind;
int sid;
int variety;

uint hash3u(int x, int y, int z) {
  uint h = (uint(x) * 374761393u) ^ (uint(y) * 668265263u) ^ (uint(z) * 1442695041u);
  h = (h ^ (h >> 13u)) * 1274126177u;
  h ^= h >> 16u;
  return h;
}

float hash3(int x, int y, int z) {
  return float(hash3u(x, y, z)) / 4294967296.0;
}

float halfWidth(float s) {
  float x = clamp(s, 0.0, 1.0) * float(${LUT - 1});
  int i = int(floor(x));
  int j = min(i + 1, ${LUT - 1});
  return mix(texelFetch(uWidth, ivec2(i, kind), 0).r, texelFetch(uWidth, ivec2(j, kind), 0).r, x - float(i));
}

bool inTriangle(vec2 p, vec2 a, vec2 b, vec2 c) {
  float d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
  float d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
  float d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
  bool neg = d1 < 0.0 || d2 < 0.0 || d3 < 0.0;
  bool pos = d1 > 0.0 || d2 > 0.0 || d3 > 0.0;
  return !(neg && pos);
}

bool marked(float s, float v, float across) {
  int mt = int(uMisc[kind].y);
  if (mt == 1) {
    if (s < 0.2 || s > 0.9 || across > 0.85) return false;
    float wobble = 0.35 * sin((v / L) * 25.0 + s * 5.0);
    float bar = sin(s * PI * 2.0 * 9.0 + wobble);
    return bar > 0.65 - 0.5 * smoothstep(0.2, 0.42, s) + 0.4 * smoothstep(0.8, 0.9, s);
  }
  if (mt == 2) {
    if (s < 0.07) return false;
    float gu = s / 0.06;
    float gv = v / (L * 0.045);
    int cu = int(floor(gu));
    int cv = int(floor(gv));
    float jx = hash3(cu, cv, sid) * 0.5 + 0.25;
    float jy = hash3(cu, cv, sid + 11) * 0.5 + 0.25;
    float dx = gu - float(cu) - jx;
    float dy = gv - float(cv) - jy;
    return dx * dx + dy * dy < 0.08;
  }
  return false;
}

bool koiBlob(float s, float v, vec4 p, int li) {
  float gu = s / p.y;
  float gv = v / (L * p.y * 0.85);
  int cu = int(floor(gu));
  int cv = int(floor(gv));
  int seed = sid * 7 + li * 101;
  for (int du = 0; du <= 1; du++) {
    for (int dv = 0; dv <= 1; dv++) {
      int iu = cu + du;
      int iv = cv + dv;
      if (hash3(iu, iv, seed + 23) >= p.x) continue;
      float jx = hash3(iu, iv, seed) - 0.5;
      float jy = hash3(iu, iv, seed + 11) - 0.5;
      float dx = gu - float(iu) - jx;
      float dy = gv - float(iv) - jy;
      if (dx * dx + dy * dy < p.z) return true;
    }
  }
  return false;
}

int koiLayer(float s, float v) {
  vec4 a = uKoiA[variety];
  if (a.x > 0.5) {
    float du = (s - 0.07) / 0.045;
    float dv = v / (L * 0.05);
    return du * du + dv * dv < 1.0 ? 1 : 0;
  }
  if (s < 0.03 || s > 0.8) return 0;
  int n = int(a.y);
  if (n >= 2 && koiBlob(s, v, uKoiP1[variety], 1)) return 2;
  if (n >= 1 && koiBlob(s, v, uKoiP0[variety], 0)) return 1;
  return 0;
}

// Result of one sample, as globals to keep the shader simple.
int hitFlag;
float hitShade;
float hitS;
float hitV;
float hitDist;
int hitLayer;

bool sampleShark(vec2 p, bool wantLayer) {
  float best = 1e30;
  float bestS = 0.0;
  float bestSign = 1.0;
  vec2 bestN = vec2(0.0);
  for (int k = 0; k < N - 1; k++) {
    vec2 a = sp[k];
    vec2 d = sp[k + 1] - a;
    float len2 = dot(d, d);
    if (len2 == 0.0) len2 = 1.0;
    float u = clamp(dot(p - a, d) / len2, 0.0, 1.0);
    vec2 q = a + d * u;
    vec2 e = p - q;
    float d2 = dot(e, e);
    if (d2 < best) {
      best = d2;
      float len = sqrt(len2);
      bestS = (arcs[k] + u * len) / arcTotal;
      bestSign = d.x * (p.y - a.y) - d.y * (p.x - a.x) >= 0.0 ? 1.0 : -1.0;
      bestN = vec2(-d.y / len, d.x / len) * bestSign;
    }
  }

  float a = sqrt(best);
  float s = bestS;
  float u = s * L;
  float w = halfWidth(s) * L;
  hitDist = a;
  hitS = s;
  hitV = a * bestSign;
  hitLayer = 0;

  vec4 head = uHead[kind];
  if (head.x > 0.0 && u < L * (head.y + head.z + head.w)) {
    float span = L * head.x;
    float r = a / span;
    float front = L * head.y * r * r + L * head.w * max(0.0, 1.0 - r / 0.14);
    float depth = L * head.z * (1.0 - 0.2 * r * r * r * r);
    if (r <= 1.0 && u >= front && u <= front + depth) {
      hitFlag = r > 0.84 ? FLAG_EYE : FLAG_BODY;
      hitShade = r > 0.84 ? 0.0 : 0.62 - 0.2 * r + (u < front + L * 0.012 ? 0.1 : 0.0);
      return true;
    }
  }

  vec4 dors = uDors[kind];
  vec4 eyeg = uEyeG[kind];
  vec4 misc = uMisc[kind];
  bool isKoi = misc.z > 0.5;

  if (a <= w) {
    float across = a / (w == 0.0 ? 1.0 : w);
    float facing = (bestN.x * -0.6 + bestN.y * -0.8) * across;
    float shade = 0.58 - across * across * 0.42 + facing * 0.26;
    int flag = FLAG_BODY;
    if (s > dors.x && s < dors.y && across < 0.3) {
      flag = FLAG_RIDGE;
      shade = 1.0;
    } else if (s > dors.z && s < dors.w && across < 0.4) {
      shade = max(shade, 0.82);
    } else if (eyeg.x >= 0.0 && s > eyeg.x && s < eyeg.y && across > 0.6) {
      flag = FLAG_EYE;
      shade = 0.0;
    } else if (s > eyeg.z && s < eyeg.w && across > 0.58) {
      if (int(floor(((s - eyeg.z) / (eyeg.w - eyeg.z)) * 5.0)) % 2 == 0) shade *= 0.45;
    } else if (s < 0.05) {
      shade = max(shade, 0.7);
    } else if (int(misc.y) == 2 && s > 0.08 && s < 0.55 && (across < 0.1 || abs(across - 0.6) < 0.08)) {
      shade = max(shade, 0.8);
    } else if (marked(s, a * bestSign, across)) {
      flag = FLAG_MARK;
    }
    hitFlag = flag;
    hitShade = shade;
    if (isKoi) {
      if (flag == FLAG_RIDGE || flag == FLAG_MARK) hitFlag = FLAG_BODY;
      if (flag == FLAG_RIDGE) hitShade = 0.85;
      if (wantLayer) hitLayer = koiLayer(s, a * bestSign);
    }
    return true;
  }

  float tip = bestSign > 0.0 ? finR : finL;
  vec4 pc = uPect[kind];
  vec2 pa = vec2(u, a);
  if (
    inTriangle(pa, vec2(L * pc.x, 0.0), vec2(L * pc.y, 0.0), vec2(L * pc.z, tip)) &&
    !(pc.w > 0.5 && inTriangle(pa, vec2(L * pc.y, 0.0), vec2(L * (pc.y + (pc.z - pc.y) * 0.33), tip * 0.55), vec2(L * pc.z, tip)))
  ) {
    hitFlag = marked(s, a * bestSign, 0.0) ? FLAG_MARK : FLAG_FIN;
    hitShade = 0.38 + 0.22 * (1.0 - clamp(a / tip, 0.0, 1.0));
    return true;
  }
  vec4 pv = uPelv[kind];
  if (
    inTriangle(pa, vec2(L * pv.x, 0.0), vec2(L * pv.y, 0.0), vec2(L * pv.z, L * pv.w)) ||
    (misc.x > 0.0 && inTriangle(pa, vec2(L * 0.86, 0.0), vec2(L * 0.95, 0.0), vec2(L, L * misc.x)))
  ) {
    hitFlag = FLAG_FIN;
    hitShade = 0.36;
    return true;
  }
  return false;
}

void main() {
  int c = int(gl_FragCoord.x);
  int r = int(gl_FragCoord.y);
  vec2 cell = vec2(float(c), float(r)) * uCell;
  vec2 centre = cell + uCell * 0.5;
  float diag = length(uCell);
  uvec4 result = uvec4(0u);

  for (int j = 0; j < ${GPU_MAX_SHARKS}; j++) {
    if (j >= uCount) break;
    vec4 box = texelFetch(uSharks, ivec2(N + 2, j), 0);
    if (centre.x < box.x || centre.y < box.y || centre.x > box.z || centre.y > box.w) continue;

    vec4 p0 = texelFetch(uSharks, ivec2(N, j), 0);
    vec4 p1 = texelFetch(uSharks, ivec2(N + 1, j), 0);
    L = p0.x;
    kind = int(p0.y);
    sid = int(p0.z);
    arcTotal = p0.w;
    finL = p1.x;
    finR = p1.y;
    variety = int(p1.z);
    float skipBeyond = p1.w + diag;
    for (int k = 0; k < N; k++) {
      vec4 t = texelFetch(uSharks, ivec2(k, j), 0);
      sp[k] = t.xy;
      arcs[k] = t.z;
    }

    bool centreHit = sampleShark(centre, true);
    if (!centreHit && hitDist > skipBeyond) continue;
    int flag = hitFlag;
    float shade = hitShade;
    float s = hitS;
    float v = hitV;
    int layer = hitLayer;

    int hits = centreHit ? 1 : 0;
    if (sampleShark(cell + uCell * vec2(0.25, 0.3), false)) hits++;
    if (sampleShark(cell + uCell * vec2(0.75, 0.3), false)) hits++;
    if (sampleShark(cell + uCell * vec2(0.25, 0.72), false)) hits++;
    if (sampleShark(cell + uCell * vec2(0.75, 0.72), false)) hits++;
    if (hits == 0) {
      // Easter-egg glow: a soft ring just outside the body, under anything else.
      float halo = uMisc[kind].w * L;
      float outside = hitDist - halfWidth(hitS) * L;
      if (halo > 0.0 && outside < halo && result.x == 0u) {
        result = uvec4(uint(FLAG_HALO) | (uint(j) << 16u), floatBitsToUint(1.0 - outside / halo), hash3u(c, r, sid), 2u);
      }
      continue;
    }
    float coverage = float(hits) / 5.0;

    uint key = hash3u(int(floor(s * 52.0 + 0.5)), int(floor(v / (uCell.x * 0.9) + 0.5)), sid);
    if (centreHit && coverage >= 0.6) {
      result = uvec4(uint(flag) | (uint(layer) << 8u) | (uint(j) << 16u), floatBitsToUint(shade), key, 1u);
    } else {
      result = uvec4(uint(FLAG_EDGE) | (uint(j) << 16u), floatBitsToUint(coverage), key, 0u);
    }
  }
  outCell = result;
}`

export class GpuRaster {
  private gl: WebGL2RenderingContext
  private prog: WebGLProgram
  private sharkTex: WebGLTexture
  private outTex: WebGLTexture
  private fbo: WebGLFramebuffer
  private uCount: WebGLUniformLocation | null
  private uCell: WebGLUniformLocation | null
  private cols = 0
  private rows = 0
  /** Packed shark rows, RGBA32F, ROW texels per shark. */
  readonly sharkData = new Float32Array(ROW * GPU_MAX_SHARKS * 4)
  out = new Uint32Array(0)

  /** Returns null when WebGL2 or integer render targets are missing; the caller keeps the CPU path. */
  static create(kinds: GpuKind[], varieties: GpuVariety[]): GpuRaster | null {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl2", {
        antialias: false,
        depth: false,
        stencil: false,
      })
      if (!gl) return null
      return new GpuRaster(gl, kinds, varieties)
    } catch (err) {
      console.warn("ascii-sharks: GPU rasteriser unavailable, using CPU", err)
      return null
    }
  }

  private constructor(
    gl: WebGL2RenderingContext,
    kinds: GpuKind[],
    varieties: GpuVariety[]
  ) {
    this.gl = gl
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(sh) ?? "shader")
      return sh
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(prog) ?? "link")
    this.prog = prog
    gl.useProgram(prog)

    // Per-kind constants.
    const vec = (pick: (k: GpuKind) => number[]) => {
      const a = new Float32Array(MAX_KINDS * 4)
      kinds.forEach((k, i) => a.set(pick(k), i * 4))
      return a
    }
    const set = (name: string, data: Float32Array) =>
      gl.uniform4fv(gl.getUniformLocation(prog, name), data)
    set(
      "uPect",
      vec((k) => [
        k.pectoral[0],
        k.pectoral[1],
        k.pectoral[2],
        k.falcate ? 1 : 0,
      ])
    )
    set(
      "uPelv",
      vec((k) => k.pelvic)
    )
    set(
      "uDors",
      vec((k) => [...k.dorsal, ...k.secondDorsal])
    )
    set(
      "uEyeG",
      vec((k) => [...(k.eye ?? [-1, -1]), ...k.gills])
    )
    set(
      "uHead",
      vec((k) =>
        k.head
          ? [k.head.span, k.head.sweep, k.head.depth, k.head.notch]
          : [0, 0, 0, 0]
      )
    )
    set(
      "uMisc",
      vec((k) => [k.caudal, k.markType, k.koi ? 1 : 0, k.halo])
    )

    const koiA = new Float32Array(MAX_VARIETIES * 4)
    const koiP0 = new Float32Array(MAX_VARIETIES * 4)
    const koiP1 = new Float32Array(MAX_VARIETIES * 4)
    varieties.forEach((v, i) => {
      koiA.set([v.tancho ? 1 : 0, v.patches.length, 0, 0], i * 4)
      const [a, b] = v.patches
      if (a) koiP0.set([a.keep, a.cell, a.radius, 0], i * 4)
      if (b) koiP1.set([b.keep, b.cell, b.radius, 0], i * 4)
    })
    set("uKoiA", koiA)
    set("uKoiP0", koiP0)
    set("uKoiP1", koiP1)

    // Half-width profiles baked into a lookup table, one row per kind.
    const lut = new Float32Array(LUT * kinds.length)
    kinds.forEach((k, row) => {
      for (let i = 0; i < LUT; i++)
        lut[row * LUT + i] = k.halfWidth(i / (LUT - 1))
    })
    const widthTex = this.texture(
      gl.R32F,
      LUT,
      kinds.length,
      gl.RED,
      gl.FLOAT,
      lut
    )
    this.sharkTex = this.texture(
      gl.RGBA32F,
      ROW,
      GPU_MAX_SHARKS,
      gl.RGBA,
      gl.FLOAT,
      null
    )
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, widthTex)
    gl.uniform1i(gl.getUniformLocation(prog, "uWidth"), 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.sharkTex)
    gl.uniform1i(gl.getUniformLocation(prog, "uSharks"), 0)

    this.outTex = gl.createTexture()!
    this.fbo = gl.createFramebuffer()!
    this.uCount = gl.getUniformLocation(prog, "uCount")
    this.uCell = gl.getUniformLocation(prog, "uCell")
    gl.bindVertexArray(gl.createVertexArray())
  }

  private texture(
    internal: number,
    w: number,
    h: number,
    format: number,
    type: number,
    data: ArrayBufferView | null
  ) {
    const gl = this.gl
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return tex
  }

  /** Write one shark's row; call before run(). */
  setShark(
    j: number,
    spine: Float32Array,
    arc: Float32Array,
    p: {
      L: number
      kind: number
      id: number
      arcTotal: number
      finL: number
      finR: number
      variety: number
      skip: number
    },
    box: [number, number, number, number]
  ) {
    const d = this.sharkData
    const base = j * ROW * 4
    for (let k = 0; k < GPU_SPINE_NODES; k++) {
      d[base + k * 4] = spine[k * 2]!
      d[base + k * 4 + 1] = spine[k * 2 + 1]!
      d[base + k * 4 + 2] = arc[k]!
      d[base + k * 4 + 3] = 0
    }
    const q = base + GPU_SPINE_NODES * 4
    d.set(
      [
        p.L,
        p.kind,
        p.id,
        p.arcTotal,
        p.finL,
        p.finR,
        p.variety,
        p.skip,
        ...box,
      ],
      q
    )
  }

  /** Rasterise `count` sharks into a cols x rows grid; returns 4 uints per cell. */
  run(count: number, cols: number, rows: number, cw: number, ch: number) {
    const gl = this.gl
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols
      this.rows = rows
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, this.outTex)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA32UI,
        cols,
        rows,
        0,
        gl.RGBA_INTEGER,
        gl.UNSIGNED_INT,
        null
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.outTex,
        0
      )
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        throw new Error("framebuffer")
      this.out = new Uint32Array(cols * rows * 4)
      gl.activeTexture(gl.TEXTURE0)
    }
    gl.bindTexture(gl.TEXTURE_2D, this.sharkTex)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      ROW,
      GPU_MAX_SHARKS,
      gl.RGBA,
      gl.FLOAT,
      this.sharkData
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
    gl.viewport(0, 0, cols, rows)
    gl.uniform1i(this.uCount, count)
    gl.uniform2f(this.uCell, cw, ch)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.readPixels(0, 0, cols, rows, gl.RGBA_INTEGER, gl.UNSIGNED_INT, this.out)
    return this.out
  }
}
