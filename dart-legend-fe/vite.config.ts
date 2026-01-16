import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import ResizeImage from "vite-plugin-resize-image/vite";
import MinifyCssModule from "vite-minify-css-module/vite";
import { manualChunksPlugin } from "vite-plugin-webpackchunkname";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  const isDev = mode !== "production";

  return {
    plugins: [
      manualChunksPlugin(),
      react(),
      MinifyCssModule({
        cleanCSS: {
          level: {
            2: {
              mergeSemantically: true,
              restructureRules: true,
            },
          },
        },
      }),
      nodePolyfills({
        protocolImports: true,
      }),
    ],
    css: {
      devSourcemap: isDev,
    },
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "src") },
        { find: "buffer", replacement: "buffer" },
      ],
    },
    define: {
      global: "window",
    },
    optimizeDeps: {
      esbuildOptions: {},
      include: ["buffer"],
    },
    build: {
      rollupOptions: {
        external: [],
      },
    },
    preview: {
      // allowedHosts: ["app.dartlegends.tech"],
      allowedHosts: ["http://localhost:3579"],
    },
  };
});
