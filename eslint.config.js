// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // Downgraded to a warning: this app relies on effects that reset form
      // state on open and clear stale data before a dependency-driven fetch,
      // which the rule flags everywhere even though neither pattern is a bug.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
