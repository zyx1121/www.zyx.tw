/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow longer subject lines so descriptions can have a bit of personality.
    "subject-max-length": [2, "always", 100],
  },
}
