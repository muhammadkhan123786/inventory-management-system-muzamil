import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Disable default ESLint ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Turn off 'no-var'
      "no-var": "off",

      // Turn off TypeScript 'any' warnings
      "@typescript-eslint/no-explicit-any": "off",

      // Turn off spacing rules (everything related)
      "indent": "off",
      "space-before-function-paren": "off",
      "space-in-parens": "off",
      "keyword-spacing": "off",
      "comma-spacing": "off",
      "object-curly-spacing": "off",
      "array-bracket-spacing": "off",
      "semi": "off",
    },
  },
]);
