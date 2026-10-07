import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    include: ["lib/**/*.test.ts"],
    // Vitest blanks every .css module it does not process, `?raw` imports included;
    // styles.test.ts reads the lib stylesheets as text.
    css: { include: [/\/lib\/.+\.css/] },
  },
});
