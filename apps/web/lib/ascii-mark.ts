import * as THREE from "three"

import type { SceneV1 } from "@workspace/3d"
import { buildShapeGeometry } from "@workspace/3d/geometry"

import type { Obstacle } from "@/lib/pond/obstacle"
import { cellSize, glyphFont } from "@/lib/pond/renderer"

/**
 * The home's mark in characters: the zyx mark extruded in 3D, swaying
 * slowly, drawn on the pond's character grid. Each frame renders the lit
 * mesh at one pixel per cell, then a pass over the screen draws each covered
 * cell as a glyph from the ramp, denser where the face catches more light,
 * over the page color. The covered cells go to the pond as an obstacle, so
 * the fish and koi swim around the mark.
 */
export const MARK = {
  /** Glyphs from empty to full. */
  ramp: " .:-=+*#%@",
  /** The mark's width as a share of the viewport's shorter side. */
  size: 0.5,
  /** Radians either way the mark sways by itself, around y and around x. */
  sway: [0.55, 0.18],
  /** Radians per second of each sway. */
  swaySpeed: [0.35, 0.23],
  /** Radians a drag turns the mark per CSS pixel. */
  drag: 0.008,
  /** The spring that brings a thrown mark back to face front. */
  stiffness: 6,
  damping: 3,
  /** Frames between obstacle updates. */
  maskEvery: 3,
  /** Vertical field of view, in degrees. */
  fov: 30,
} as const

const SHADE_VERTEX = /* glsl */ `
varying vec3 vNormal;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

// Light in red, coverage in alpha.
const SHADE_FRAGMENT = /* glsl */ `
uniform vec3 uLight;
varying vec3 vNormal;
void main() {
  float lit = max(dot(normalize(vNormal), uLight), 0.0);
  gl_FragColor = vec4(0.15 + 0.85 * lit, 0.0, 0.0, 1.0);
}`

const GLYPH_VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

// Cells count from the top left, as the pond's; the shade target's rows
// count from the bottom.
const GLYPH_FRAGMENT = /* glsl */ `
uniform sampler2D uShade;
uniform sampler2D uAtlas;
uniform vec2 uCell;
uniform vec2 uGrid;
uniform float uHeight;
uniform float uGlyphs;
uniform vec3 uInk;
uniform vec3 uPage;
void main() {
  vec2 p = vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y);
  vec2 cell = floor(p / uCell);
  if (cell.x >= uGrid.x || cell.y >= uGrid.y) discard;
  vec4 shade = texelFetch(uShade, ivec2(cell.x, uGrid.y - 1.0 - cell.y), 0);
  if (shade.a < 0.5) discard;
  float glyph = clamp(floor(shade.r * (uGlyphs - 1.0) + 0.5), 1.0, uGlyphs - 1.0);
  vec2 inCell = fract(p / uCell);
  float ink = texture2D(uAtlas, vec2((glyph + inCell.x) / uGlyphs, inCell.y)).r;
  gl_FragColor = vec4(mix(uPage, uInk, ink), 1.0);
}`

/** A CSS color as linear 0 to 1 channels the shader writes out unchanged. */
function channels(color: string, probe: CanvasRenderingContext2D) {
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data
  return new THREE.Vector3(r / 255, g / 255, b / 255)
}

export class AsciiMark {
  private renderer: THREE.WebGLRenderer
  private camera = new THREE.PerspectiveCamera(MARK.fov, 1, 1, 10)
  private shadeScene = new THREE.Scene()
  private glyphScene = new THREE.Scene()
  private glyphCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private mesh: THREE.Mesh
  private shadeMaterial: THREE.ShaderMaterial
  private glyphMaterial: THREE.ShaderMaterial
  private target = new THREE.WebGLRenderTarget(1, 1)
  private atlas: THREE.CanvasTexture | null = null
  private probe = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  })!
  private pixels = new Uint8Array(0)
  private mask = new Uint8Array(0)
  private reading = false
  private disposed = false
  private cols = 0
  private rows = 0
  private cellW = 0
  private cellH = 0
  private width = 0
  private height = 0
  private raf = 0
  private last = 0
  private time = 0
  private frame = 0
  private yaw = 0
  private spin = 0
  private dragging: { x: number; t: number; id: number } | null = null
  /** Sway amplitude, 0 for reduced motion. */
  private motion = 1

  constructor(
    private canvas: HTMLCanvasElement,
    shape: SceneV1["shape"],
    private obstacle: Obstacle,
    /** The pond's cell scale, so the mark draws on the pond's grid. */
    private cellScale: number
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    })
    this.renderer.setClearColor(0x000000, 0)

    this.shadeMaterial = new THREE.ShaderMaterial({
      vertexShader: SHADE_VERTEX,
      fragmentShader: SHADE_FRAGMENT,
      uniforms: {
        // From the upper left, in front.
        uLight: { value: new THREE.Vector3(-0.45, 0.55, 0.7).normalize() },
      },
    })
    this.mesh = new THREE.Mesh(buildShapeGeometry(shape), this.shadeMaterial)
    this.shadeScene.add(this.mesh)

    this.glyphMaterial = new THREE.ShaderMaterial({
      vertexShader: GLYPH_VERTEX,
      fragmentShader: GLYPH_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uShade: { value: this.target.texture },
        uAtlas: { value: null },
        uCell: { value: new THREE.Vector2() },
        uGrid: { value: new THREE.Vector2() },
        uHeight: { value: 0 },
        uGlyphs: { value: MARK.ramp.length },
        uInk: { value: new THREE.Vector3(1, 1, 1) },
        uPage: { value: new THREE.Vector3(0, 0, 0) },
      },
    })
    this.glyphScene.add(
      new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.glyphMaterial)
    )

    canvas.addEventListener("pointerdown", this.onPointerDown)
    canvas.addEventListener("pointermove", this.onPointerMove)
    canvas.addEventListener("pointerup", this.onPointerUp)
    canvas.addEventListener("pointercancel", this.onPointerUp)
  }

  /** Fit the grid to the canvas, on the pond's cells. */
  resize(family: string) {
    const { width, height } = this.canvas.getBoundingClientRect()
    if (width < 1 || height < 1) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cell = cellSize(width, this.cellScale)
    this.width = width
    this.height = height
    this.cellW = cell.width
    this.cellH = cell.height
    this.cols = Math.ceil(width / cell.width)
    this.rows = Math.ceil(height / cell.height)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(width, height, false)
    this.target.setSize(this.cols, this.rows)
    this.pixels = new Uint8Array(this.cols * this.rows * 4)
    this.mask = new Uint8Array(this.cols * this.rows)

    // The camera sees the whole grid, one target pixel per cell.
    const gridW = this.cols * cell.width
    const gridH = this.rows * cell.height
    const distance =
      gridH / 2 / Math.tan(THREE.MathUtils.degToRad(MARK.fov / 2))
    this.camera.aspect = gridW / gridH
    this.camera.position.set(0, 0, distance)
    this.camera.near = distance / 10
    this.camera.far = distance * 10
    this.camera.updateProjectionMatrix()
    this.mesh.scale.setScalar((Math.min(width, height) * MARK.size) / 2)

    const buffer = this.renderer.getDrawingBufferSize(new THREE.Vector2())
    const uniforms = this.glyphMaterial.uniforms
    uniforms.uCell!.value.set(
      (cell.width * buffer.x) / width,
      (cell.height * buffer.y) / height
    )
    uniforms.uGrid!.value.set(this.cols, this.rows)
    uniforms.uHeight!.value = buffer.y
    this.atlas?.dispose()
    this.atlas = this.buildAtlas(
      uniforms.uCell!.value.x,
      uniforms.uCell!.value.y,
      family
    )
    uniforms.uAtlas!.value = this.atlas
    this.frame = 0
    this.draw()
  }

  /** The text and page colors, as CSS colors. */
  setColors(ink: string, page: string) {
    const uniforms = this.glyphMaterial.uniforms
    uniforms.uInk!.value = channels(ink, this.probe)
    uniforms.uPage!.value = channels(page, this.probe)
    this.draw()
  }

  /** Sway by itself, or hold still and turn only by hand. */
  setMotion(sway: boolean) {
    this.motion = sway ? 1 : 0
    this.start()
  }

  start() {
    cancelAnimationFrame(this.raf)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.canvas.removeEventListener("pointerdown", this.onPointerDown)
    this.canvas.removeEventListener("pointermove", this.onPointerMove)
    this.canvas.removeEventListener("pointerup", this.onPointerUp)
    this.canvas.removeEventListener("pointercancel", this.onPointerUp)
    this.obstacle.clear()
    this.mesh.geometry.dispose()
    this.shadeMaterial.dispose()
    this.glyphMaterial.dispose()
    this.target.dispose()
    this.atlas?.dispose()
    this.renderer.dispose()
  }

  private tick = (now: number) => {
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    this.time += dt * this.motion
    if (!this.dragging) {
      // A spring back to the nearest whole turn, so a throw spins and then
      // settles facing front.
      const rest = Math.round(this.yaw / (Math.PI * 2)) * Math.PI * 2
      this.spin +=
        (-(this.yaw - rest) * MARK.stiffness - this.spin * MARK.damping) * dt
      this.yaw += this.spin * dt
    }
    this.draw()
    const settled =
      !this.dragging &&
      Math.abs(this.spin) < 1e-3 &&
      Math.abs(this.yaw - Math.round(this.yaw / (Math.PI * 2)) * Math.PI * 2) <
        1e-3
    // Held still, the loop stops once the mark has settled.
    if (this.motion || !settled) this.raf = requestAnimationFrame(this.tick)
  }

  private draw() {
    if (!this.cols || !this.atlas) return
    const [swayY, swayX] = MARK.sway
    const [speedY, speedX] = MARK.swaySpeed
    this.mesh.rotation.set(
      swayX * Math.sin(this.time * speedX) * this.motion,
      this.yaw + swayY * Math.sin(this.time * speedY) * this.motion,
      0
    )
    const renderer = this.renderer
    renderer.setRenderTarget(this.target)
    renderer.render(this.shadeScene, this.camera)
    if (this.frame++ % MARK.maskEvery === 0 && !this.reading) this.readMask()
    renderer.setRenderTarget(null)
    renderer.render(this.glyphScene, this.glyphCamera)
  }

  /**
   * Read the covered cells back without waiting for the GPU: the pond reads
   * its own state back every frame, and a blocking read here would make it
   * wait for the mark's frame too. The obstacle lags a frame or two.
   */
  private readMask() {
    const { cols, rows, pixels } = this
    this.reading = true
    this.renderer
      .readRenderTargetPixelsAsync(this.target, 0, 0, cols, rows, pixels)
      .then(() => {
        // A resize since the read started makes it stale.
        if (!this.disposed && pixels === this.pixels) this.updateObstacle()
      })
      .catch(() => undefined)
      .finally(() => {
        this.reading = false
      })
  }

  /** The covered cells, top row first, to the pond. */
  private updateObstacle() {
    const { cols, rows, pixels, mask } = this
    for (let row = 0; row < rows; row++) {
      const from = (rows - 1 - row) * cols
      for (let col = 0; col < cols; col++) {
        mask[row * cols + col] = pixels[(from + col) * 4 + 3]! > 127 ? 1 : 0
      }
    }
    this.obstacle.update(mask, cols, rows, this.cellW, this.cellH)
  }

  /** The ramp's glyphs side by side, one cell each, white on clear. */
  private buildAtlas(cellW: number, cellH: number, family: string) {
    const w = Math.round(cellW)
    const h = Math.round(cellH)
    const atlas = document.createElement("canvas")
    atlas.width = w * MARK.ramp.length
    atlas.height = h
    const ctx = atlas.getContext("2d")!
    ctx.fillStyle = "white"
    ctx.font = glyphFont(h, family)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    Array.from(MARK.ramp).forEach((glyph, index) => {
      ctx.fillText(glyph, index * w + w / 2, h / 2)
    })
    const texture = new THREE.CanvasTexture(atlas)
    texture.flipY = false
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }

  /** Whether a point on the canvas is over the mark. */
  private covers(x: number, y: number) {
    const col = Math.floor(x / this.cellW)
    const row = Math.floor(y / this.cellH)
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return false
    return this.mask[row * this.cols + col] === 1
  }

  private local(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  private onPointerDown = (event: PointerEvent) => {
    const { x, y } = this.local(event)
    if (!this.covers(x, y)) return
    this.canvas.setPointerCapture(event.pointerId)
    this.dragging = {
      x: event.clientX,
      t: event.timeStamp,
      id: event.pointerId,
    }
    this.spin = 0
    this.canvas.dataset.dragging = ""
    this.start()
  }

  private onPointerMove = (event: PointerEvent) => {
    const dragging = this.dragging
    if (!dragging || dragging.id !== event.pointerId) {
      const { x, y } = this.local(event)
      if (this.covers(x, y)) this.canvas.dataset.over = ""
      else delete this.canvas.dataset.over
      return
    }
    const turn = (event.clientX - dragging.x) * MARK.drag
    const dt = Math.max(1 / 240, (event.timeStamp - dragging.t) / 1000)
    dragging.x = event.clientX
    dragging.t = event.timeStamp
    this.yaw += turn
    // The spin it is thrown with, from the last few moves.
    this.spin += (turn / dt - this.spin) * 0.5
  }

  private onPointerUp = (event: PointerEvent) => {
    if (this.dragging?.id !== event.pointerId) return
    this.dragging = null
    delete this.canvas.dataset.dragging
  }
}
