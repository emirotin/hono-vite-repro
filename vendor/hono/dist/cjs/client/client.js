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
var client_exports = {};
__export(client_exports, {
  hc: () => hc
});
module.exports = __toCommonJS(client_exports);
var import_cookie = require("../utils/cookie");
var import_utils = require("./utils");
const createProxy = (callback, path) => {
  const proxy = new Proxy(() => {
  }, {
    get(_obj, key) {
      if (typeof key !== "string" || key === "then") {
        return void 0;
      }
      return createProxy(callback, [...path, key]);
    },
    apply(_1, _2, args) {
      return callback({
        path,
        args
      });
    }
  });
  return proxy;
};
class ClientRequestImpl {
  constructor(url, method) {
    this.queryParams = void 0;
    this.pathParams = {};
    this.cType = void 0;
    this.fetch = (args, opt) => {
      if (args) {
        if (args.query) {
          for (const [k, v] of Object.entries(args.query)) {
            if (v === void 0) {
              continue;
            }
            this.queryParams || (this.queryParams = new URLSearchParams());
            if (Array.isArray(v)) {
              for (const v2 of v) {
                this.queryParams.append(k, v2);
              }
            } else {
              this.queryParams.set(k, v);
            }
          }
        }
        if (args.form) {
          const form = new FormData();
          for (const [k, v] of Object.entries(args.form)) {
            form.append(k, v);
          }
          this.rBody = form;
        }
        if (args.json) {
          this.rBody = JSON.stringify(args.json);
          this.cType = "application/json";
        }
        if (args.param) {
          this.pathParams = args.param;
        }
      }
      let methodUpperCase = this.method.toUpperCase();
      let setBody = !(methodUpperCase === "GET" || methodUpperCase === "HEAD");
      const headerValues = {
        ...args?.header ?? {},
        ...opt?.headers ? opt.headers : {}
      };
      if (args?.cookie) {
        const cookies = [];
        for (const [key, value] of Object.entries(args.cookie)) {
          cookies.push((0, import_cookie.serialize)(key, value, { path: "/" }));
        }
        headerValues["Cookie"] = cookies.join(",");
      }
      if (this.cType) {
        headerValues["Content-Type"] = this.cType;
      }
      const headers = new Headers(headerValues ?? void 0);
      let url = this.url;
      url = (0, import_utils.removeIndexString)(url);
      url = (0, import_utils.replaceUrlParam)(url, this.pathParams);
      if (this.queryParams) {
        url = url + "?" + this.queryParams.toString();
      }
      methodUpperCase = this.method.toUpperCase();
      setBody = !(methodUpperCase === "GET" || methodUpperCase === "HEAD");
      return (opt?.fetch || fetch)(url, {
        body: setBody ? this.rBody : void 0,
        method: methodUpperCase,
        headers
      });
    };
    this.url = url;
    this.method = method;
  }
}
const hc = (baseUrl, options) => createProxy((opts) => {
  const parts = [...opts.path];
  let method = "";
  if (/^\$/.test(parts[parts.length - 1])) {
    const last = parts.pop();
    if (last) {
      method = last.replace(/^\$/, "");
    }
  }
  const path = parts.join("/");
  const url = (0, import_utils.mergePath)(baseUrl, path);
  if (method === "url") {
    if (opts.args[0] && opts.args[0].param) {
      return new URL((0, import_utils.replaceUrlParam)(url, opts.args[0].param));
    }
    return new URL(url);
  }
  const req = new ClientRequestImpl(url, method);
  if (method) {
    options ?? (options = {});
    const args = (0, import_utils.deepMerge)(options, { ...opts.args[1] ?? {} });
    return req.fetch(opts.args[0], args);
  }
  return req;
}, []);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hc
});
