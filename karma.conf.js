// webpack is configured via karma-webpack; no direct usage here.

const { TEST_BROWSER } = process.env;
const runOnNode = TEST_BROWSER === "ChromeHeadless";

module.exports = function (config) {
  config.set({
    browsers: [TEST_BROWSER || "Chrome"],
    singleRun: runOnNode,
    autoWatch: !runOnNode,
  frameworks: ["jasmine", "webpack"],
    files: ["./test/**/*.spec.js"],
    reporters: [runOnNode ? "spec" : "kjhtml"],
    preprocessors: {
      "./test/**/*.js": ["webpack", "sourcemap"], // preprocess with webpack
    },
    webpack: {
      mode: "none",
      watch: false,
      module: {
        rules: [
          { test: /\.js$/, exclude: /node_modules/, use: ["babel-loader"] },
        ],
      },
      externals: {},
    },
  });
};
