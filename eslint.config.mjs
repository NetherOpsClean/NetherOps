// @ts-check

import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["node_modules/*", "dist/*", "commitlint.config.js"]),

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    name: "infra/typescript-typed-rules",
    files: ["**/*.ts", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
  },
  {
    name: "infra/general-rules",
    rules: {
      semi: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]);
