import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // macOS AppleDouble files on network volumes (._foo.test.ts) are not tests
    exclude: ["**/node_modules/**", "**/._*"],
  },
});
