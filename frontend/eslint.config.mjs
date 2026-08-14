import js from "@eslint/js";
export default [
  js.configs.recommended,
  {
    rules: {
      "no-undef": "error"
    },
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly"
      }
    }
  }
];
