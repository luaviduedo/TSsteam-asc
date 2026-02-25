import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export const testEnvironment = "node";
export const transform = {
  ...tsJestTransformCfg,
};
export const transformIgnorePatterns = [
  "/node_modules/(?!(your-problematic-package|another-esm-package)/)",
];
