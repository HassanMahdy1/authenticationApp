import js from "@eslint/js";
import globals from "globals";
// eslint-disable-next-line import/extensions
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: globals.node
    },
    plugins: {
      js,
      import: importPlugin
    },
    extends: [js.configs.recommended],
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "req|res|next" }],
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "import/extensions": ["error", "always", { js: "always" }]
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js"]
        }
      }
    }
  }
]);
