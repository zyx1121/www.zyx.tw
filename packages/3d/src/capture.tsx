import { useThree } from "@react-three/fiber"
import {
  BloomEffect,
  EffectPass,
  type Effect,
  type EffectComposer,
  type Pass,
} from "postprocessing"
import { useImperativeHandle, type Ref, type RefObject } from "react"
import * as THREE from "three"

import { BackdropEffect } from "./backdrop"

export type CaptureOptions = {
  /** The image's size in pixels. The canvas's aspect ratio frames it as on screen. */
  width: number
  height: number
  type: "image/png" | "image/jpeg"
  /** JPEG quality, 0 to 1; the browser's default when left out. */
  quality?: number
  /** PNG only: leaves the background color out, so the alpha is the shape's coverage. */
  transparent?: boolean
}

export type CaptureSize = { width: number; height: number }

/** What a `<Scene3D>` ref holds. */
export type Scene3DHandle = {
  /** Renders the view as it is on screen at another size, into an image file. */
  capture(options: CaptureOptions): Promise<Blob>
  /** The size capture renders for a request: the same aspect ratio, shrunk to what this GPU can hold. */
  captureSize(width: number, height: number): CaptureSize
}

/**
 * Chrome shrinks a WebGL canvas past 5760 x 5760 pixels of area, an 8K UHD
 * frame's worth, to avoid running out of memory, so a capture asks for no
 * more: 8K fits a 16:9 canvas, and a squarer one shrinks.
 */
const MAX_CAPTURE_AREA = 5760 * 5760

/**
 * Browsers don't say how much GPU memory is free, so an export's full-size
 * buffers stay under this many bytes, multisamples included: a 16:10 4K
 * frame keeps 4 of them, and 8K renders without.
 */
const CAPTURE_MEMORY = 1.25e9

/**
 * Bytes per pixel of those buffers: the canvas's color and depth (4 + 4),
 * then each of the composer's two buffers' half-float color and depth
 * (8 + 4), once more for every multisample.
 */
function bytesPerPixel(samples: number) {
  return 8 + 2 * 12 * (1 + samples)
}

/** Gives a `<Scene3D>` ref its capture methods; renders nothing. */
export function SceneCapture({
  ref,
  composer,
}: {
  ref?: Ref<Scene3DHandle>
  composer: RefObject<EffectComposer | null>
}) {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  useImperativeHandle(
    ref,
    () => ({
      captureSize: (width, height) => fitCapture(gl, width, height),
      capture: async (options) => {
        const current = composer.current
        if (!current) throw new Error("The scene hasn't rendered yet")
        return capture(gl, camera, current, options)
      },
    }),
    [gl, camera, composer]
  )
  return null
}

/** Scales the size down, keeping its aspect ratio, until the GPU's and the browser's limits allow it. */
function fitCapture(
  gl: THREE.WebGLRenderer,
  width: number,
  height: number
): CaptureSize {
  if (!(width >= 1 && height >= 1 && width * height < Infinity)) {
    throw new RangeError(`Can't capture ${width} x ${height}`)
  }
  const context = gl.getContext()
  const side = Math.min(
    gl.capabilities.maxTextureSize,
    context.getParameter(context.MAX_RENDERBUFFER_SIZE) as number
  )
  const [maxWidth = side, maxHeight = side] = context.getParameter(
    context.MAX_VIEWPORT_DIMS
  ) as Int32Array
  const scale = Math.min(
    1,
    Math.min(side, maxWidth) / width,
    Math.min(side, maxHeight) / height,
    Math.sqrt(MAX_CAPTURE_AREA / (width * height)),
    Math.sqrt(CAPTURE_MEMORY / (width * height * bytesPerPixel(0)))
  )
  return {
    width: Math.max(1, Math.floor(Math.round(width) * scale)),
    height: Math.max(1, Math.floor(Math.round(height) * scale)),
  }
}

/**
 * Resizes the canvas and the composer to the image, renders one frame, reads
 * it, and puts everything back, all in one task: the page never paints the
 * resized canvas, and the drawing buffer needn't be preserved to be read.
 */
function capture(
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera,
  composer: EffectComposer,
  {
    width: askedWidth,
    height: askedHeight,
    type,
    quality,
    transparent,
  }: CaptureOptions
): Promise<Blob> {
  const { width, height } = fitCapture(gl, askedWidth, askedHeight)
  const size = gl.getSize(new THREE.Vector2())
  const pixelRatio = gl.getPixelRatio()
  const screen = gl.getDrawingBufferSize(new THREE.Vector2())
  const samples = composer.multisampling
  const transmissionScale = gl.transmissionResolutionScale
  const effects = composer.passes.flatMap(effectsOf)
  const backdrops = effects.filter((effect) => effect instanceof BackdropEffect)
  const opacities = backdrops.map((backdrop) => backdrop.opacity)
  const restoreCamera = reframe(camera, width / height, size.x / size.y)
  try {
    gl.setDrawingBufferSize(width, height, 1)
    const context = gl.getContext()
    if (
      context.drawingBufferWidth !== width ||
      context.drawingBufferHeight !== height
    ) {
      throw new Error(
        `This browser draws at most ${context.drawingBufferWidth} x ${context.drawingBufferHeight} here; pick a smaller size`
      )
    }
    composer.multisampling = samplesFor(width * height, samples)
    composer.setSize(width, height, false)
    // Glow blurs across a fixed number of mip levels, so how far it reaches
    // is a share of the frame it runs on; at the on-screen size it keeps its
    // look. Glass refracts a copy of the frame, which that size also serves.
    for (const effect of effects) {
      if (effect instanceof BloomEffect) effect.setSize(screen.x, screen.y)
    }
    gl.transmissionResolutionScale = Math.min(1, screen.x / width)
    if (transparent && type === "image/png") {
      for (const backdrop of backdrops) backdrop.opacity = 0
    }
    composer.render()
    // toBlob copies the frame now and encodes it later.
    return toBlob(gl.domElement, type, quality)
  } finally {
    for (const [i, backdrop] of backdrops.entries()) {
      backdrop.opacity = opacities[i] ?? 1
    }
    gl.transmissionResolutionScale = transmissionScale
    restoreCamera()
    composer.multisampling = samples
    gl.setDrawingBufferSize(size.x, size.y, pixelRatio)
    composer.setSize(size.x, size.y, false)
    // Resizing cleared the canvas; draw the view again before the page paints.
    composer.render()
  }
}

/**
 * The composer's multisampling, halved until its buffers fit CAPTURE_MEMORY,
 * or none. Large frames give it up first: their pixels are small, and any
 * smaller view of them antialiases itself.
 */
function samplesFor(pixels: number, samples: number) {
  for (let count = samples; count >= 2; count = Math.floor(count / 2)) {
    if (pixels * bytesPerPixel(count) <= CAPTURE_MEMORY) return count
  }
  return 0
}

/** EffectPass keeps its effects in a field its types mark private. */
function effectsOf(pass: Pass): Effect[] {
  return pass instanceof EffectPass
    ? (pass as unknown as { effects: Effect[] }).effects
    : []
}

/**
 * Points the camera for an image of another aspect ratio as FitCamera would
 * for a canvas of that shape, and returns how to put it back.
 */
function reframe(camera: THREE.Camera, aspect: number, current: number) {
  if (!(camera instanceof THREE.PerspectiveCamera)) return () => {}
  const before = { aspect: camera.aspect, position: camera.position.clone() }
  camera.aspect = aspect
  camera.position.multiplyScalar(fitDistance(aspect) / fitDistance(current))
  camera.updateProjectionMatrix()
  return () => {
    camera.aspect = before.aspect
    camera.position.copy(before.position)
    camera.updateProjectionMatrix()
  }
}

/** How far FitCamera backs the camera off at an aspect ratio, as a multiple of its distance. */
export function fitDistance(aspect: number) {
  return 1 / Math.min(1, aspect)
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The browser couldn't encode the image")),
      type,
      quality
    )
  )
}
