// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: "expo",
  rules: {
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "generic",
      },
    ],
  },
};
