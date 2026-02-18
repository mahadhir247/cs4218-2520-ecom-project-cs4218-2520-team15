export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["models/**", "controllers/**", "helpers/**", "middlewares/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },

  // mock env variables
  setupFiles: ["<rootDir>/setEnvVars.js"]
};
