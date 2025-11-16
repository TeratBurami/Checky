export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.js",
    "!babel.config.js",
    "!jest.config.js",
    "!index.js",
    "!**/node_modules/**",
    "!**/tests/**",
    "!**/coverage/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"]
};
