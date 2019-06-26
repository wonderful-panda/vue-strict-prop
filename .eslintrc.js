module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ["standard"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json"
  },
  rules: {
    // disable rules which don't work in TypeScript
    "no-undef": "off",
    "no-unused-vars": "off",
    "space-infix-ops": "off",
    "no-useless-constructor": "off",
    "import/export": "off",

    // disable rules which conflict with Prettier
    indent: "off",
    semi: "off",
    quotes: "off",
    "space-before-function-paren": "off",
    "react/jsx-indent": "off",
    "react/jsx-indent-props": "off",

    // other code style
    yoda: "off",
    "linebreak-style": ["error", "unix"]
  }
};
