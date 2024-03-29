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
var hooks_exports = {};
__export(hooks_exports, {
  STASH_EFFECT: () => STASH_EFFECT,
  startTransition: () => startTransition,
  startViewTransition: () => startViewTransition,
  use: () => use,
  useCallback: () => useCallback,
  useDeferredValue: () => useDeferredValue,
  useEffect: () => useEffect,
  useLayoutEffect: () => useLayoutEffect,
  useMemo: () => useMemo,
  useRef: () => useRef,
  useState: () => useState,
  useTransition: () => useTransition,
  useViewTransition: () => useViewTransition
});
module.exports = __toCommonJS(hooks_exports);
var import_constants = require("../constants");
var import_render = require("../dom/render");
const STASH_SATE = 0;
const STASH_EFFECT = 1;
const STASH_CALLBACK = 2;
const STASH_USE = 3;
const STASH_MEMO = 4;
const STASH_REF = 5;
const resolvedPromiseValueMap = /* @__PURE__ */ new WeakMap();
const isDepsChanged = (prevDeps, deps) => !prevDeps || !deps || prevDeps.length !== deps.length || deps.some((dep, i) => dep !== prevDeps[i]);
let viewTransitionState = void 0;
const documentStartViewTransition = (cb) => {
  if (document?.startViewTransition) {
    return document.startViewTransition(cb);
  } else {
    cb();
    return { finished: Promise.resolve() };
  }
};
let updateHook = void 0;
const viewTransitionHook = (context, node, cb) => {
  const state = [true, false];
  let lastVC = node.vC;
  return documentStartViewTransition(() => {
    if (lastVC === node.vC) {
      viewTransitionState = state;
      cb(context);
      viewTransitionState = void 0;
      lastVC = node.vC;
    }
  }).finished.then(() => {
    if (state[1] && lastVC === node.vC) {
      state[0] = false;
      viewTransitionState = state;
      cb(context);
      viewTransitionState = void 0;
    }
  });
};
const startViewTransition = (callback) => {
  updateHook = viewTransitionHook;
  try {
    callback();
  } finally {
    updateHook = void 0;
  }
};
const useViewTransition = () => {
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    return [false, () => {
    }];
  }
  if (viewTransitionState) {
    viewTransitionState[1] = true;
  }
  return [!!viewTransitionState?.[0], startViewTransition];
};
const pendingStack = [];
const runCallback = (type, callback) => {
  pendingStack.push(type);
  try {
    callback();
  } finally {
    pendingStack.pop();
  }
};
const startTransition = (callback) => {
  runCallback(1, callback);
};
const startTransitionHook = (callback) => {
  runCallback(2, callback);
};
const useTransition = () => {
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    return [false, () => {
    }];
  }
  const [context] = buildData;
  return [context[0] === 2, startTransitionHook];
};
const useDeferredValue = (value) => {
  const buildData = import_render.buildDataStack.at(-1);
  if (buildData) {
    buildData[0][0] = 1;
  }
  return value;
};
const setShadow = (node) => {
  if (node.vC) {
    node.s = node.vC;
    node.vC = void 0;
  }
  ;
  node.s?.forEach(setShadow);
};
const useState = (initialState) => {
  var _a;
  const resolveInitialState = () => typeof initialState === "function" ? initialState() : initialState;
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    return [resolveInitialState(), () => {
    }];
  }
  const [, node] = buildData;
  const stateArray = (_a = node[import_constants.DOM_STASH][1])[STASH_SATE] || (_a[STASH_SATE] = []);
  const hookIndex = node[import_constants.DOM_STASH][0]++;
  return stateArray[hookIndex] || (stateArray[hookIndex] = [
    resolveInitialState(),
    (newState) => {
      const localUpdateHook = updateHook;
      const stateData = stateArray[hookIndex];
      if (typeof newState === "function") {
        newState = newState(stateData[0]);
      }
      if (newState !== stateData[0]) {
        stateData[0] = newState;
        if (pendingStack.length) {
          const pendingType = pendingStack.at(-1);
          (0, import_render.update)([pendingType, false, localUpdateHook], node).then((node2) => {
            if (!node2 || pendingType !== 2) {
              return;
            }
            const lastVC = node2.vC;
            const addUpdateTask = () => {
              setTimeout(() => {
                if (lastVC !== node2.vC) {
                  return;
                }
                const shadowNode = Object.assign({}, node2);
                shadowNode.vC = void 0;
                (0, import_render.build)([], shadowNode, void 0);
                setShadow(shadowNode);
                node2.s = shadowNode.s;
                (0, import_render.update)([0, false, localUpdateHook], node2);
              });
            };
            if (localUpdateHook) {
              requestAnimationFrame(addUpdateTask);
            } else {
              addUpdateTask();
            }
          });
        } else {
          (0, import_render.update)([0, false, localUpdateHook], node);
        }
      }
    }
  ]);
};
const useEffectCommon = (index, effect, deps) => {
  var _a;
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    return;
  }
  const [, node] = buildData;
  const effectDepsArray = (_a = node[import_constants.DOM_STASH][1])[STASH_EFFECT] || (_a[STASH_EFFECT] = []);
  const hookIndex = node[import_constants.DOM_STASH][0]++;
  const [prevDeps, , prevCleanup] = effectDepsArray[hookIndex] || (effectDepsArray[hookIndex] = []);
  if (isDepsChanged(prevDeps, deps)) {
    if (prevCleanup) {
      prevCleanup();
    }
    const runner = () => {
      data[index] = void 0;
      data[2] = effect();
    };
    const data = [deps, void 0, void 0, void 0];
    data[index] = runner;
    effectDepsArray[hookIndex] = data;
  }
};
const useEffect = (effect, deps) => useEffectCommon(3, effect, deps);
const useLayoutEffect = (effect, deps) => useEffectCommon(1, effect, deps);
const useCallback = (callback, deps) => {
  var _a;
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    return callback;
  }
  const [, node] = buildData;
  const callbackArray = (_a = node[import_constants.DOM_STASH][1])[STASH_CALLBACK] || (_a[STASH_CALLBACK] = []);
  const hookIndex = node[import_constants.DOM_STASH][0]++;
  const prevDeps = callbackArray[hookIndex];
  if (isDepsChanged(prevDeps?.[1], deps)) {
    callbackArray[hookIndex] = [callback, deps];
  } else {
    callback = callbackArray[hookIndex][0];
  }
  return callback;
};
const useRef = (initialValue) => {
  var _a;
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    return { current: initialValue };
  }
  const [, node] = buildData;
  const refArray = (_a = node[import_constants.DOM_STASH][1])[STASH_REF] || (_a[STASH_REF] = []);
  const hookIndex = node[import_constants.DOM_STASH][0]++;
  return refArray[hookIndex] || (refArray[hookIndex] = { current: initialValue });
};
const use = (promise) => {
  var _a;
  const cachedRes = resolvedPromiseValueMap.get(promise);
  if (cachedRes) {
    if (cachedRes.length === 2) {
      throw cachedRes[1];
    }
    return cachedRes[0];
  }
  promise.then(
    (res2) => resolvedPromiseValueMap.set(promise, [res2]),
    (e) => resolvedPromiseValueMap.set(promise, [void 0, e])
  );
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    throw promise;
  }
  const [, node] = buildData;
  const promiseArray = (_a = node[import_constants.DOM_STASH][1])[STASH_USE] || (_a[STASH_USE] = []);
  const hookIndex = node[import_constants.DOM_STASH][0]++;
  promise.then(
    (res2) => {
      promiseArray[hookIndex] = [res2];
    },
    (e) => {
      promiseArray[hookIndex] = [void 0, e];
    }
  );
  const res = promiseArray[hookIndex];
  if (res) {
    if (res.length === 2) {
      throw res[1];
    }
    return res[0];
  }
  throw promise;
};
const useMemo = (factory, deps) => {
  var _a;
  const buildData = import_render.buildDataStack.at(-1);
  if (!buildData) {
    return factory();
  }
  const [, node] = buildData;
  const memoArray = (_a = node[import_constants.DOM_STASH][1])[STASH_MEMO] || (_a[STASH_MEMO] = []);
  const hookIndex = node[import_constants.DOM_STASH][0]++;
  const prevDeps = memoArray[hookIndex];
  if (isDepsChanged(prevDeps?.[1], deps)) {
    memoArray[hookIndex] = [factory(), deps];
  }
  return memoArray[hookIndex][0];
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  STASH_EFFECT,
  startTransition,
  startViewTransition,
  use,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  useViewTransition
});
