/**
 * WebGL2 version of World.stepFish: one fragment per fish runs the boids
 * update (separation, alignment, cohesion, mill, flee, alarm relay, walls,
 * current, speed limits) against every other fish.
 *
 * The CPU still owns the Fish objects, because sharks eat them, splashes push
 * them and schools respawn. Each step packs the fish into a texture, runs one
 * pass and reads the new state back: ~340 fish, so both copies are small.
 *
 * Unlike the CPU loop, every fish sees its neighbours' previous state (a
 * Jacobi update instead of Gauss-Seidel); at 60 Hz the schools look the same.
 */
import type { Fish, Shark } from "./world"
import type { Species } from "./species"

export const GPU_MAX_FISH = 1024
const MAX_SHARKS = 32
const MAX_SPECIES = 8

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D uA;
uniform sampler2D uB;
uniform int uCount;
uniform int uSharkCount;
uniform uint uSeed;
uniform float uDt;
uniform float uTime;
uniform vec2 uSize;
uniform vec4 uWorld;    // perception, foreignSep, calmDecay, contagion
uniform vec4 uPointer;  // x, y, active
uniform vec4 uSp0[${MAX_SPECIES}];  // cruise, maxSpeed, minSpeed, jitter
uniform vec4 uSp1[${MAX_SPECIES}];  // align, cohesion, mill, verticalDrag
uniform vec2 uSep[${MAX_SPECIES}];
uniform vec4 uShark[${MAX_SHARKS}];       // length, heading, node0 x, node0 y
uniform vec4 uSharkN[${MAX_SHARKS * 2}];  // nodes 3, 6, 9, 12

layout(location = 0) out vec4 outA;
layout(location = 1) out vec4 outB;

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;
const float SEPARATION_K = 420.0;
const float ALIGN_K = 1.4;
const float COHESION_K = 1.0;
const float FLEE_K = 1100.0;
const float BLIND_COS = -0.6;

float rand(int i, uint salt) {
  uint h = (uint(i) * 374761393u) ^ (uSeed * 668265263u) ^ (salt * 1442695041u);
  h = (h ^ (h >> 13u)) * 1274126177u;
  h ^= h >> 16u;
  return float(h) / 4294967296.0;
}

float angleDiff(float a, float b) {
  float d = mod(b - a + PI, TAU) - PI;
  return d;
}

vec2 current(vec2 p, float t) {
  const float K1 = 1.0 / 260.0;
  const float K2 = 1.0 / 310.0;
  const float K3 = 1.0 / 190.0;
  float a = p.x * K1 + t * 0.07;
  float b = p.y * K2 - t * 0.05;
  float c = (p.x + p.y) * K3 + t * 0.11;
  return vec2(
    -K2 * sin(a) * sin(b) + 0.5 * K3 * cos(c),
    -K1 * cos(a) * cos(b) - 0.5 * K3 * cos(c)
  ) * 3400.0;
}

void main() {
  int i = int(gl_FragCoord.x);
  vec4 A = texelFetch(uA, ivec2(i, 0), 0);
  vec4 B = texelFetch(uB, ivec2(i, 0), 0);
  int bits = int(B.w);
  bool alive = (bits & 32) != 0;
  if (i >= uCount || !alive) {
    outA = A;
    outB = B;
    return;
  }
  int species = bits & 15;
  float millDir = (bits & 16) != 0 ? -1.0 : 1.0;
  vec2 pos = A.xy;
  vec2 vel = A.zw;
  float alarm0 = B.x;
  float phase = B.y;
  float turn = B.z;

  vec4 sp0 = uSp0[species];
  vec4 sp1 = uSp1[species];
  float R = uWorld.x;
  float R2 = R * R;
  float foreignSep = uWorld.y;

  float spread = 1.0 + 1.8 * alarm0;
  vec2 sep = uSep[species] * spread;
  float speed = length(vel);
  if (speed == 0.0) speed = 1.0;
  vec2 h = vel / speed;

  vec2 acc = vec2(0.0);
  vec2 s = vec2(0.0);
  vec2 av = vec2(0.0);
  vec2 cm = vec2(0.0);
  float n = 0.0;
  float neighbourAlarm = 0.0;

  for (int j = 0; j < ${GPU_MAX_FISH}; j++) {
    if (j >= uCount) break;
    if (j == i) continue;
    vec4 oB = texelFetch(uB, ivec2(j, 0), 0);
    int ob = int(oB.w);
    if ((ob & 32) == 0) continue;
    vec4 oA = texelFetch(uA, ivec2(j, 0), 0);
    vec2 d = oA.xy - pos;
    float d2 = dot(d, d);
    if (d2 >= R2 || d2 <= 1e-6) continue;
    float dl = sqrt(d2);
    if (dot(d, h) / dl <= BLIND_COS) continue;
    vec2 q = d / sep;
    float q2 = dot(q, q);
    if (q2 < 1.0) {
      float ql = sqrt(q2);
      if (ql == 0.0) ql = 1e-3;
      s -= q * ((1.0 - ql) / ql);
    }
    if ((ob & 15) == species) {
      av += oA.zw;
      cm += d;
      n += 1.0;
    } else if (dl < foreignSep) {
      s -= d * (((1.0 - dl / foreignSep) / dl) * 0.6);
    }
    neighbourAlarm = max(neighbourAlarm, oB.x);
  }

  acc += s * SEPARATION_K;
  if (n > 0.0) {
    float alignK = ALIGN_K * sp1.x;
    float cohesionK = COHESION_K * sp1.y * (1.0 - 0.8 * alarm0);
    acc += (av / n - vel) * alignK + (cm / n) * cohesionK;
    if (sp1.z > 0.0) {
      float cl = length(cm);
      if (cl == 0.0) cl = 1.0;
      acc += vec2(-cm.y, cm.x) / cl * millDir * sp1.z * (1.0 - alarm0);
    }
  }

  float fear = 0.0;
  for (int j = 0; j < ${MAX_SHARKS}; j++) {
    if (j >= uSharkCount) break;
    vec4 sh = uShark[j];
    vec4 n1 = uSharkN[j * 2];
    vec4 n2 = uSharkN[j * 2 + 1];
    float fearR = sh.x * 0.6 + 60.0;
    vec2 nodes[5] = vec2[5](sh.zw, n1.xy, n1.zw, n2.xy, n2.zw);
    float best = 1e30;
    vec2 bn = vec2(0.0);
    for (int k = 0; k < 5; k++) {
      vec2 e = pos - nodes[k];
      float e2 = dot(e, e);
      if (e2 < best) {
        best = e2;
        bn = nodes[k];
      }
    }
    float d = sqrt(best);
    if (d >= fearR || d < 1e-3) continue;
    float w = 1.0 - d / fearR;
    w *= w;
    vec2 away = (pos - bn) / d;
    vec2 sh2 = vec2(cos(sh.y), sin(sh.y));
    float side = sh2.x * (pos.y - sh.w) - sh2.y * (pos.x - sh.z) >= 0.0 ? 1.0 : -1.0;
    acc += (away * 0.7 + vec2(-sh2.y, sh2.x) * side * 0.9) * FLEE_K * w;
    fear = max(fear, sqrt(w));
  }

  if (uPointer.z > 0.5) {
    const float pr = 130.0;
    vec2 e = pos - uPointer.xy;
    float d = length(e);
    if (d < pr && d > 1e-3) {
      float w = (1.0 - d / pr) * (1.0 - d / pr);
      acc += e / d * FLEE_K * w;
      fear = max(fear, sqrt(w) * 0.8);
    }
  }

  float alarm = max(alarm0 * uWorld.z, fear);
  float relayed = neighbourAlarm * 0.86;
  if (relayed > alarm) alarm += (relayed - alarm) * uWorld.w;

  const float m = 36.0;
  if (pos.x < m) acc.x += (m - pos.x) * 7.0;
  else if (pos.x > uSize.x - m) acc.x -= (pos.x - (uSize.x - m)) * 7.0;
  if (pos.y < m) acc.y += (m - pos.y) * 7.0;
  else if (pos.y > uSize.y - m) acc.y -= (pos.y - (uSize.y - m)) * 7.0;

  vec2 cur = current(pos, uTime);
  acc += cur * 0.5 + (vec2(rand(i, 1u), rand(i, 2u)) - 0.5) * sp0.w;
  acc.y -= vel.y * sp1.w * (1.0 - 0.7 * alarm);

  float preferred = sp0.x * (1.0 + 1.3 * alarm);
  acc += (preferred - speed) * h * 1.6;

  float before = atan(vel.y, vel.x);
  vel += acc * uDt;
  float maxSpeed = sp0.y * (1.0 + 1.8 * alarm);
  float sl = length(vel);
  if (sl > maxSpeed) vel *= maxSpeed / sl;
  else if (sl < sp0.z && sl > 1e-3) vel *= sp0.z / sl;
  turn += (angleDiff(before, atan(vel.y, vel.x)) / uDt - turn) * min(1.0, uDt * 8.0);
  phase += uDt * (7.0 + length(vel) * 0.12);
  pos = clamp(pos + vel * uDt, vec2(-60.0), uSize + 60.0);

  outA = vec4(pos, vel);
  outB = vec4(alarm, phase, turn, B.w);
}`

const UNIFORMS = [
  "uCount",
  "uSharkCount",
  "uSeed",
  "uDt",
  "uTime",
  "uSize",
  "uWorld",
  "uPointer",
  "uSp0",
  "uSp1",
  "uSep",
  "uShark",
  "uSharkN",
] as const
type Uniform = (typeof UNIFORMS)[number]

export class GpuFish {
  private gl: WebGL2RenderingContext
  private prog: WebGLProgram
  private inA: WebGLTexture
  private inB: WebGLTexture
  private fbo: WebGLFramebuffer
  private u = {} as Record<Uniform, WebGLUniformLocation | null>
  private a = new Float32Array(GPU_MAX_FISH * 4)
  private b = new Float32Array(GPU_MAX_FISH * 4)
  private seed = 1

  /** Returns null without WebGL2 float render targets; the caller keeps the CPU loop. */
  static create(): GpuFish | null {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl2", {
        antialias: false,
        depth: false,
        stencil: false,
      })
      if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null
      return new GpuFish(gl)
    } catch (err) {
      console.warn("ascii-sharks: GPU fish unavailable, using CPU", err)
      return null
    }
  }

  private constructor(gl: WebGL2RenderingContext) {
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
    for (const name of UNIFORMS) {
      this.u[name] = gl.getUniformLocation(prog, name)
    }

    const tex = () => {
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA32F,
        GPU_MAX_FISH,
        1,
        0,
        gl.RGBA,
        gl.FLOAT,
        null
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      return t
    }
    this.inA = tex()
    this.inB = tex()
    const outA = tex()
    const outB = tex()
    this.fbo = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      outA,
      0
    )
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT1,
      gl.TEXTURE_2D,
      outB,
      0
    )
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("framebuffer")

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.inA)
    gl.uniform1i(gl.getUniformLocation(prog, "uA"), 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.inB)
    gl.uniform1i(gl.getUniformLocation(prog, "uB"), 1)
    gl.bindVertexArray(gl.createVertexArray())
  }

  setSpecies(species: Species[], sepX: number[], sepY: number[]) {
    const gl = this.gl
    const sp0 = new Float32Array(MAX_SPECIES * 4)
    const sp1 = new Float32Array(MAX_SPECIES * 4)
    const sep = new Float32Array(MAX_SPECIES * 2)
    species.forEach((sp, i) => {
      sp0.set([sp.cruise, sp.maxSpeed, sp.minSpeed, sp.jitter], i * 4)
      sp1.set([sp.align, sp.cohesion, sp.mill, sp.verticalDrag], i * 4)
      sep.set([sepX[i]!, sepY[i]!], i * 2)
    })
    gl.useProgram(this.prog)
    gl.uniform4fv(this.u.uSp0, sp0)
    gl.uniform4fv(this.u.uSp1, sp1)
    gl.uniform2fv(this.u.uSep, sep)
  }

  /** One boids step for every live fish, written back into the Fish objects. */
  step(
    fish: Fish[],
    sharks: Shark[],
    dt: number,
    time: number,
    width: number,
    height: number,
    world: {
      perception: number
      foreignSep: number
      calmDecay: number
      contagion: number
    },
    pointer: { x: number; y: number; active: boolean }
  ) {
    const { gl, a, b, u } = this
    const count = fish.length
    for (let i = 0; i < count; i++) {
      const f = fish[i]!
      a[i * 4] = f.x
      a[i * 4 + 1] = f.y
      a[i * 4 + 2] = f.vx
      a[i * 4 + 3] = f.vy
      b[i * 4] = f.alarm
      b[i * 4 + 1] = f.phase
      b[i * 4 + 2] = f.turn
      b[i * 4 + 3] = f.species | (f.millDir < 0 ? 16 : 0) | (f.alive ? 32 : 0)
    }

    const shark = new Float32Array(MAX_SHARKS * 4)
    const sharkN = new Float32Array(MAX_SHARKS * 8)
    const sc = Math.min(sharks.length, MAX_SHARKS)
    for (let j = 0; j < sc; j++) {
      const sh = sharks[j]!
      const n = sh.nodes
      shark.set([sh.length, sh.heading, n[0]!, n[1]!], j * 4)
      sharkN.set(
        [n[6]!, n[7]!, n[12]!, n[13]!, n[18]!, n[19]!, n[24]!, n[25]!],
        j * 8
      )
    }

    gl.useProgram(this.prog)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.inA)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, count, 1, gl.RGBA, gl.FLOAT, a, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.inB)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, count, 1, gl.RGBA, gl.FLOAT, b, 0)

    gl.uniform1i(u.uCount, count)
    gl.uniform1i(u.uSharkCount, sc)
    gl.uniform1ui(u.uSeed, this.seed++)
    gl.uniform1f(u.uDt, dt)
    gl.uniform1f(u.uTime, time)
    gl.uniform2f(u.uSize, width, height)
    gl.uniform4f(
      u.uWorld,
      world.perception,
      world.foreignSep,
      world.calmDecay,
      world.contagion
    )
    gl.uniform4f(u.uPointer, pointer.x, pointer.y, pointer.active ? 1 : 0, 0)
    gl.uniform4fv(u.uShark, shark)
    gl.uniform4fv(u.uSharkN, sharkN)

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
    gl.viewport(0, 0, count, 1)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.readBuffer(gl.COLOR_ATTACHMENT0)
    gl.readPixels(0, 0, count, 1, gl.RGBA, gl.FLOAT, a)
    gl.readBuffer(gl.COLOR_ATTACHMENT1)
    gl.readPixels(0, 0, count, 1, gl.RGBA, gl.FLOAT, b)

    for (let i = 0; i < count; i++) {
      const f = fish[i]!
      if (!f.alive) continue
      f.x = a[i * 4]!
      f.y = a[i * 4 + 1]!
      f.vx = a[i * 4 + 2]!
      f.vy = a[i * 4 + 3]!
      f.alarm = b[i * 4]!
      f.phase = b[i * 4 + 1]!
      f.turn = b[i * 4 + 2]!
    }
  }
}
