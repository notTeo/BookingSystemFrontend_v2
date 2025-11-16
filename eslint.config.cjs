// Flat ESLint config for Vite + React + TypeScript + Prettier (ESLint v9)

const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");
const importPlugin = require("eslint-plugin-import");
const promisePlugin = require("eslint-plugin-promise");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  // 1) Ignored stuff
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/"],
  },

  // 2) JS/JSX files
  {
    files: ["**/*.{js,cjs,mjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
      promise: promisePlugin,
    },
    rules: {
      // React basics
      "react/react-in-jsx-scope": "off", // Vite/React 17+
      "react/prop-types": "off",

      // Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Imports
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
        },
      ],

      // Promises
      "promise/always-return": "off",
      "promise/catch-or-return": ["warn", { allowFinally: true }],

      "no-console": "off",
    },
  },

  // 3) TS/TSX files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        // set 'project' to "tsconfig.json" later if you want type-aware linting
        project: false,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
      promise: promisePlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["tsconfig.json"],
        },
        node: { extensions: [".js", ".ts", ".jsx", ".tsx"] },
      },
    },
    rules: {
      // TS hygiene
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/require-await": "off",

      // React
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Imports
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
        },
      ],
      "import/no-unresolved": "off", // TS handles this

      // Promises
      "promise/always-return": "off",
      "promise/catch-or-return": ["warn", { allowFinally: true }],

      "no-return-await": "warn",
      "no-console": "off",
    },
  },

  // 4) Prettier – last, to disable conflicting stylistic rules
  prettierConfig,
];
