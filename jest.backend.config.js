export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["models/**", "controllers/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
