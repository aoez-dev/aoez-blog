import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Maintainability limits. Keep functions small; split instead of raising a limit. */
const maintainability = {
  complexity: ["error", 5],
  "max-depth": ["error", 3],
  "max-nested-callbacks": ["error", 3],
  "max-params": ["error", 4],
  "max-lines-per-function": [
    "error",
    { max: 40, skipBlankLines: true, skipComments: true },
  ],
  "max-lines": [
    "error",
    { max: 250, skipBlankLines: true, skipComments: true },
  ],
  "no-else-return": "error",
  "no-nested-ternary": "error",
  eqeqeq: ["error", "always"],
  "prefer-const": "error",
};

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  { rules: { "no-console": "error" } },
  {
    files: ["src/**/*.{ts,astro}", "scripts/**/*.mjs"],
    rules: maintainability,
  },
  {
    // content, not logic: the CV data may be long
    files: ["src/data/**/*.ts"],
    rules: { "max-lines": "off" },
  },
  {
    files: ["**/*.test.ts"],
    rules: { "max-lines-per-function": "off" },
  },
  { ignores: ["dist/**", ".astro", "public/pagefind/**", "src/data/blog/**"] },
];
