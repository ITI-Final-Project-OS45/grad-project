module.exports = {
  root: true,
  extends: ["@repo/eslint-config/library"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
};
