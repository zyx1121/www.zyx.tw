import { config } from "@workspace/eslint-config/react-internal"

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // react-three-fiber JSX (<mesh>, <meshPhysicalMaterial>, ...) takes
    // three.js props the DOM-oriented rule doesn't recognize
    files: ["src/**/*.tsx"],
    rules: { "react/no-unknown-property": "off" },
  },
]
