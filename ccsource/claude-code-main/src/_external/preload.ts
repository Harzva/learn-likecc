/**
 * Bun preload script for LikeCode
 * Injects global MACRO constants and bun:bundle shim
 */

import { plugin } from "bun";

const version = process.env.CLI_VERSION || "1.0.0-likecode";

// Global MACRO constants used throughout the codebase
(globalThis as any).MACRO = {
  VERSION: version,
  BUILD_TIME: new Date().toISOString(),
  PACKAGE_URL: "https://github.com/likecode/likecode",
  NATIVE_PACKAGE_URL: "",
  VERSION_CHANGELOG: "",
  FEEDBACK_CHANNEL: "",
  ISSUES_EXPLAINER: "https://github.com/likecode/likecode/issues",
};

// Shim bun:bundle feature flags - all features disabled for external build
plugin({
  name: "bun-bundle-shim",
  setup(build) {
    build.module("bun:bundle", () => ({
      exports: {
        feature: (_name: string): boolean => false,
      },
      loader: "object",
    }));
  },
});
