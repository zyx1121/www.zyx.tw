import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    // react-three-fiber JSX (<primitive>, <ambientLight>, ...) takes three.js
    // props the DOM-oriented rule doesn't recognize
    files: ["components/good.tsx"],
    rules: { "react/no-unknown-property": "off" },
  },
]
