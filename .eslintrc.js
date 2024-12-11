// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["plugin:drizzle/recommended", "eslint:recommended", "expo"],
  plugins: ["drizzle"],
  rules: {
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "generic",
      },
    ],
  },
};
