import { defineConfig } from "tsup";
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

type Target = "chrome" | "firefox";
const TARGET = (process.env.TARGET ?? "chrome") as Target;

export default defineConfig({
  clean: true,

  entry: [
    "src/background.ts",
    "src/blocked.ts",
    "src/options.ts",
  ],

  env: {
    TARGET,
  },

  outDir: `dist/${TARGET}`,
  target: "es2022",
  format: "esm",

  bundle: true,
  splitting: true,
  treeshake: true,
  noExternal: ["dayjs"],

  outExtension() {
    return { js: ".js" };
  },

  esbuildOptions(options) {
    options.chunkNames = "chunks/[name]-[hash]";
  },

  async onSuccess() {
    const outDir = `dist/${TARGET}`;
    if (!existsSync(outDir)) {
      await mkdir(outDir, { recursive: true });
    }

    const files = [
      "icon_64.png",
      "icon_256.png",
      "common.css",
      "blocked.css",
      "blocked.html",
      "options.css",
      "options.html",
      `manifest-${TARGET}.json`,
    ];

    await Promise.all(
      files.map((file) =>
        copyFile(
          `public/${file}`,
          `${outDir}/${file.replace(`-${TARGET}`, "")}`,
        ),
      ),
    );
  },
});
