"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var deno_exports = {};
__export(deno_exports, {
  denoFileSystemModule: () => import_ssg.denoFileSystemModule,
  serveStatic: () => import_serve_static.serveStatic,
  toSSG: () => import_ssg.toSSG
});
module.exports = __toCommonJS(deno_exports);
var import_serve_static = require("./serve-static");
var import_ssg = require("./ssg");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  denoFileSystemModule,
  serveStatic,
  toSSG
});
