/**
 * WebGL2 version of the renderer's wake diffusion: a 5-tap blur with decay on
 * the energy field and a plain decay on the heat field, one fragment per cell.
 * Both fields go up and come back as whole typed arrays, so no JS loop touches
 * the 20k+ cells.
 */

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uEnergy;
uniform sampler2D uHeat;
uniform vec2 uDecay;  // energy, heat

layout(location = 0) out float outEnergy;
layout(location = 1) out float outHeat;

void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  ivec2 last = textureSize(uEnergy, 0) - 1;
  float e = texelFetch(uEnergy, p, 0).r;
  // Edge cells reuse their own value, as in the CPU loop.
  float l = texelFetch(uEnergy, ivec2(max(p.x - 1, 0), p.y), 0).r;
  float r = texelFetch(uEnergy, ivec2(min(p.x + 1, last.x), p.y), 0).r;
  float u = texelFetch(uEnergy, ivec2(p.x, max(p.y - 1, 0)), 0).r;
  float d = texelFetch(uEnergy, ivec2(p.x, min(p.y + 1, last.y)), 0).r;
  outEnergy = (e * 4.0 + l + r + u + d) * 0.125 * uDecay.x;
  outHeat = texelFetch(uHeat, p, 0).r * uDecay.y;
}`

export class GpuField {
  private gl: WebGL2RenderingContext
  private prog: WebGLProgram
  private inE: WebGLTexture
  private inH: WebGLTexture
  private outE: WebGLTexture
  private outH: WebGLTexture
  private fbo: WebGLFramebuffer
  private uDecay: WebGLUniformLocation | null
  private cols = 0
  private rows = 0

  /** Returns null when single-channel float targets can't be rendered and read back directly. */
  static create(): GpuField | null {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl2", {
        antialias: false,
        depth: false,
        stencil: false,
      })
      if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null
      return new GpuField(gl)
    } catch (err) {
      console.warn("ascii-sharks: GPU wake unavailable, using CPU", err)
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
    this.uDecay = gl.getUniformLocation(prog, "uDecay")
    gl.uniform1i(gl.getUniformLocation(prog, "uEnergy"), 0)
    gl.uniform1i(gl.getUniformLocation(prog, "uHeat"), 1)
    const tex = () => {
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      return t
    }
    this.inE = tex()
    this.inH = tex()
    this.outE = tex()
    this.outH = tex()
    this.fbo = gl.createFramebuffer()!
    gl.bindVertexArray(gl.createVertexArray())
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    gl.pixelStorei(gl.PACK_ALIGNMENT, 1)
  }

  private resize(cols: number, rows: number) {
    const gl = this.gl
    this.cols = cols
    this.rows = rows
    for (const t of [this.inE, this.inH, this.outE, this.outH]) {
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R32F,
        cols,
        rows,
        0,
        gl.RED,
        gl.FLOAT,
        null
      )
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.outE,
      0
    )
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT1,
      gl.TEXTURE_2D,
      this.outH,
      0
    )
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("framebuffer")
    // Reading RED/FLOAT straight into the field arrays is optional in WebGL2; check it once.
    gl.readBuffer(gl.COLOR_ATTACHMENT0)
    if (
      gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT) !== gl.RED ||
      gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE) !== gl.FLOAT
    ) {
      throw new Error("RED/FLOAT readback unsupported")
    }
  }

  /** Blur and decay `energy`, decay `heat`, both in place. */
  diffuse(
    energy: Float32Array,
    heat: Float32Array,
    cols: number,
    rows: number,
    energyDecay: number,
    heatDecay: number
  ) {
    const gl = this.gl
    if (cols !== this.cols || rows !== this.rows) this.resize(cols, rows)
    gl.useProgram(this.prog)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.inE)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      cols,
      rows,
      gl.RED,
      gl.FLOAT,
      energy
    )
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.inH)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.FLOAT, heat)
    gl.uniform2f(this.uDecay, energyDecay, heatDecay)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
    gl.viewport(0, 0, cols, rows)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.readBuffer(gl.COLOR_ATTACHMENT0)
    gl.readPixels(0, 0, cols, rows, gl.RED, gl.FLOAT, energy)
    gl.readBuffer(gl.COLOR_ATTACHMENT1)
    gl.readPixels(0, 0, cols, rows, gl.RED, gl.FLOAT, heat)
  }
}
