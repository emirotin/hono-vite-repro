import buildCfWorker from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      build: {
        rollupOptions: {
          input: "./src/client.tsx",
          output: {
            entryFileNames: "static/[name].js",
          },
        },
      },
    };
  }

  return {
    plugins: [
      buildCfWorker(),
      devServer({
        entry: "src/index.tsx",
      }),
    ],
  };
});
