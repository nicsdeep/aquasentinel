import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Screens parked while dashboards are rebuilt one at a time (src/_parked/README.md).
    "src/_parked/**",
    // Dev tool run with node, not part of the app.
    "scripts/**",
  ]),
]);

export default eslintConfig;
