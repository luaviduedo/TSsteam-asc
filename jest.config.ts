import type { Config } from "jest";

const config: Config = {
  verbose: true,
  transform: {
    "\\.[jt]sx?$": [
      "ts-jest",
      {
        "ts-jest": {
          useESM: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^tests/(.*)$": "<rootDir>/src/tests/$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  testTimeout: 60000,
};

export default config;
