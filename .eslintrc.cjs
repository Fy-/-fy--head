/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  plugins: ["@typescript-eslint", "prettier"],
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".mjs", ".ts", ".d.ts", ".tsx"] },
    },
  },
  parser: "vue-eslint-parser",
  extends: [
    "plugin:vue/vue3-essential",
    "@vue/prettier",
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  rules: {
    "vue/valid-v-for": "off",
    "vue/html-indent": "off",
    "vue/singleline-html-element-content-newline": 0,

    camelcase: ["error", { properties: "never" }],
    //"no-console": ["warn", { allow: ["error"] }],
    "no-empty": ["error", { allowEmptyCatch: true }],
    "prefer-const": [
      "warn",
      { destructuring: "all", ignoreReadBeforeAssign: true },
    ],
    "prefer-arrow-callback": [
      "error",
      { allowNamedFunctions: false, allowUnboundThis: true },
    ],
    // prettier
    "prettier/prettier": "error",
  },
};
