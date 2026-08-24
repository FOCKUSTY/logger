import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      outDirs: ["dist/types"],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
      },
      name: "fockLogger",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "fs",
        "fs/promises",
        "path",
        "tty",
        "util",
        "process",
      ],
    },
    sourcemap: true,
    minify: false,
    target: "node18",
    outDir: "dist",
  },
});