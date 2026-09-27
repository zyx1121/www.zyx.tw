import type { ParamDefs } from "./params"

/** Extrusion of the SVG outline, in scene units: the shape's longer side is 2. */
export const shapeControls = {
  depth: {
    type: "number",
    label: "Depth",
    min: 0.02,
    max: 1,
    step: 0.01,
    default: 0.25,
  },
  bevel: {
    type: "number",
    label: "Bevel",
    min: 0,
    max: 0.1,
    step: 0.005,
    default: 0.03,
  },
  bevelSegments: {
    type: "number",
    fixed: true,
    label: "Bevel segments",
    min: 1,
    max: 12,
    step: 1,
    default: 8,
  },
  curveSegments: {
    type: "number",
    fixed: true,
    label: "Curve segments",
    min: 4,
    max: 64,
    step: 1,
    default: 48,
  },
} satisfies ParamDefs

export const environmentControls = {
  intensity: {
    type: "number",
    fixed: true,
    label: "Intensity",
    min: 0,
    max: 3,
    step: 0.01,
    default: 1,
  },
  rotation: {
    type: "number",
    fixed: true,
    label: "Rotation",
    min: 0,
    max: 360,
    step: 1,
    default: 0,
  },
  background: { type: "boolean", label: "Show as background", default: false },
} satisfies ParamDefs

export const stagingControls = {
  background: { type: "color", label: "Background", default: "#0a0a0a" },
  lightAzimuth: {
    type: "number",
    fixed: true,
    label: "Light direction",
    min: 0,
    max: 360,
    step: 1,
    default: 45,
  },
  lightElevation: {
    type: "number",
    fixed: true,
    label: "Light height",
    min: 0,
    max: 90,
    step: 1,
    default: 45,
  },
  lightIntensity: {
    type: "number",
    fixed: true,
    label: "Light intensity",
    min: 0,
    max: 5,
    step: 0.01,
    default: 2,
  },
} satisfies ParamDefs
