// src/adapter/deno/index.ts
import { serveStatic } from "./serve-static.js";
import { toSSG, denoFileSystemModule } from "./ssg.js";
export {
  denoFileSystemModule,
  serveStatic,
  toSSG
};
