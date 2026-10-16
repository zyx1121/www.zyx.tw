import { createEffectComponent } from "@react-three/postprocessing"
import { BlendFunction, Effect } from "postprocessing"
import * as THREE from "three"

const fragmentShader = /* glsl */ `
uniform vec3 color;
uniform sampler2D map;
uniform bool useMap;
uniform vec2 scale;
uniform float aspect;
uniform sampler2D mask;
uniform bool useMask;
uniform vec2 maskTexel;
uniform float lensStrength;
uniform vec2 pan;
uniform vec2 cursor;
uniform float cursorMass;
uniform vec3 ringColor;
uniform float ringStrength;

vec4 cubic(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x;
  float y = s.y - 4.0 * s.x;
  float z = s.z - 4.0 * s.y + 6.0 * s.x;
  return vec4(x, y, z, 6.0 - x - y - z) * (1.0 / 6.0);
}

// The mask at a mip level through a cubic B-spline, from 4 bilinear reads.
// Plain bilinear magnification of a coarse level shows its texels as
// blocks; the spline keeps a soft edge smooth however far it's enlarged.
float maskSmooth(vec2 uv, int level) {
  vec2 size = vec2(textureSize(mask, level));
  vec2 coord = uv * size - 0.5;
  vec2 f = fract(coord);
  coord -= f;
  vec4 xc = cubic(f.x);
  vec4 yc = cubic(f.y);
  vec4 c = coord.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 o = (c + vec4(xc.yw, yc.yw) / s) / size.xxyy;
  float lod = float(level);
  float a = textureLod(mask, o.xz, lod).r;
  float b = textureLod(mask, o.yz, lod).r;
  float d = textureLod(mask, o.xw, lod).r;
  float e = textureLod(mask, o.yw, lod).r;
  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);
  return mix(mix(e, d, sx), mix(b, a, sx), sy);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Clamped in case an effect upstream leaves alpha outside [0, 1].
  float coverage = clamp(inputColor.a, 0.0, 1.0);
  vec3 under = color;
  if (useMap) {
    vec2 source = uv;
    if (useMask && lensStrength > 0.0) {
      // Light passing a mass bends toward it. The mass is the shape's
      // silhouette: its slope, summed over coarser and coarser mip levels,
      // points toward the silhouette and falls off with distance much like
      // gravity, so the bending follows the shape as it turns. Light seen
      // here comes from further in, toward the mass.
      vec2 pull = vec2(0.0);
      for (int level = 0; level < 8; level++) {
        float lod = float(level);
        vec2 step = maskTexel * exp2(lod);
        float dx = textureLod(mask, uv + vec2(step.x, 0.0), lod).r
          - textureLod(mask, uv - vec2(step.x, 0.0), lod).r;
        float dy = textureLod(mask, uv + vec2(0.0, step.y), lod).r
          - textureLod(mask, uv - vec2(0.0, step.y), lod).r;
        pull += vec2(dx, dy) * step.y;
      }
      source = uv + pull / vec2(aspect, 1.0) * lensStrength;
    }
    if (cursorMass > 0.0) {
      // The pointer is a small mass too: light near it bends in toward it,
      // less and less further out.
      vec2 offset = (uv - cursor) * vec2(aspect, 1.0);
      float r = max(length(offset), 1e-4);
      float reach = exp(-pow(r / (cursorMass * 8.0), 2.0));
      float bend = cursorMass * cursorMass / (r + cursorMass) * reach;
      source -= offset / r * bend / vec2(aspect, 1.0);
    }
    // pan slides the picture: clouds drifting, and the sky's share of the
    // parallax.
    under = texture2D(map, (source - 0.5) * scale + 0.5 + pan).rgb;
    if (useMask && ringStrength > 0.0) {
      // A photon ring: light hugging the silhouette just outside its edge, a
      // thin bright line over a wider, fainter glow.
      // Its inner edge is the frame's own sharp silhouette; outward it
      // fades with the blurred mask.
      float near = maskSmooth(uv, 2);
      float far = maskSmooth(uv, 4);
      float ring = smoothstep(0.0, 0.6, max(near - coverage, 0.0)) * 0.8
        + max(far - coverage, 0.0) * 0.4;
      under += ringColor * ring * ringStrength;
    }
  }
  outputColor = vec4(inputColor.rgb + under * (1.0 - coverage), 1.0);
}
`

type BackdropOptions = {
  color?: THREE.ColorRepresentation
  map?: THREE.Texture | null
}

/**
 * Lays the background under the frame once tone mapping is done, so it
 * shows exactly as picked; tone mapping it would turn white gray and pull
 * saturated colors toward gray. The scene renders over transparent black,
 * which leaves the frame premultiplied, so "over" is rgb + under * (1 - a).
 *
 * The background is a color, or an image cropped like CSS `center / cover`
 * that can bend around a silhouette like light past a black hole.
 */
export class BackdropEffect extends Effect {
  constructor({ color = "#000000", map = null }: BackdropOptions = {}) {
    super("BackdropEffect", fragmentShader, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, THREE.Uniform>([
        ["color", new THREE.Uniform(new THREE.Color(color))],
        ["map", new THREE.Uniform(map)],
        ["useMap", new THREE.Uniform(map !== null)],
        ["scale", new THREE.Uniform(new THREE.Vector2(1, 1))],
        ["aspect", new THREE.Uniform(1)],
        ["mask", new THREE.Uniform(null)],
        ["useMask", new THREE.Uniform(false)],
        ["maskTexel", new THREE.Uniform(new THREE.Vector2(1, 1))],
        ["lensStrength", new THREE.Uniform(0)],
        ["pan", new THREE.Uniform(new THREE.Vector2(0, 0))],
        ["cursor", new THREE.Uniform(new THREE.Vector2(0.5, 0.5))],
        ["cursorMass", new THREE.Uniform(0)],
        ["ringColor", new THREE.Uniform(new THREE.Color("#fff1d6"))],
        ["ringStrength", new THREE.Uniform(0)],
      ]),
    })
  }

  #uniform<T>(name: string) {
    return this.uniforms.get(name) as THREE.Uniform<T>
  }

  /** The uniform's own Color, so a `color` prop updates it in place. */
  get color(): THREE.Color {
    return this.#uniform<THREE.Color>("color").value
  }

  set map(map: THREE.Texture | null) {
    this.#uniform<THREE.Texture | null>("map").value = map
    this.#uniform<boolean>("useMap").value = map !== null
    if (map) {
      // Sideways the image repeats, for drifting clouds; give it one that
      // tiles. Up and down it only shifts a little, so the edge row holds.
      map.wrapS = THREE.RepeatWrapping
      map.wrapT = THREE.ClampToEdgeWrapping
      map.needsUpdate = true
    }
  }

  /** Slides the image, in uv of the image. */
  setPan(x: number, y: number) {
    this.#uniform<THREE.Vector2>("pan").value.set(x, y)
  }

  /** A point mass at the pointer, in canvas uv, with its Einstein radius as a fraction of the height. */
  setCursor(x: number, y: number, mass: number) {
    this.#uniform<THREE.Vector2>("cursor").value.set(x, y)
    this.#uniform<number>("cursorMass").value = mass
  }

  /** How bright the photon ring around the silhouette is. 0 turns it off. */
  setRing(strength: number) {
    this.#uniform<number>("ringStrength").value = strength
  }

  /** Crops the image like `center / cover` for a canvas of this aspect. */
  setAspect(aspect: number) {
    const image = this.#uniform<THREE.Texture | null>("map").value?.image as
      { width: number; height: number } | undefined
    this.#uniform<number>("aspect").value = aspect
    if (!image) return
    const ratio = aspect / (image.width / image.height)
    this.#uniform<THREE.Vector2>("scale").value.set(
      ratio > 1 ? 1 : ratio,
      ratio > 1 ? 1 / ratio : 1
    )
  }

  /**
   * The lens: a mipmapped silhouette of the mass, covering the whole frame,
   * and how hard it bends the image. 0 turns it off.
   */
  setLens(
    mask: THREE.Texture | null,
    width: number,
    height: number,
    strength: number
  ) {
    this.#uniform<THREE.Texture | null>("mask").value = mask
    this.#uniform<boolean>("useMask").value = mask !== null
    this.#uniform<THREE.Vector2>("maskTexel").value.set(1 / width, 1 / height)
    this.#uniform<number>("lensStrength").value = strength
  }
}

// createEffectComponent applies props to the live effect; wrapEffect would
// rebuild it, and recompile the pass, on every color change.
export const Backdrop = createEffectComponent<
  typeof BackdropEffect,
  BackdropOptions
>(BackdropEffect)
