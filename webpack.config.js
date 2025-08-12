const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    bundle: ["./example/src/index.js"],
  },
  devtool: "eval",
  output: {
    path: path.join(__dirname, "example"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /node_modules/,
      },
    ],
  },
};
