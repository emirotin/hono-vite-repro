// src/jsx/hooks/index.ts
import { DOM_STASH } from "../constants.js";
import { buildDataStack, update, build } from "../dom/render.js";
var STASH_SATE = 0;
var STASH_EFFECT = 1;
var STASH_CALLBACK = 2;
var STASH_USE = 3;
var STASH_MEMO = 4;
var STASH_REF = 5;
var resolvedPromiseValueMap = /* @__PURE__ */ new WeakMap();
var isDepsChanged = (prevDeps, deps) => !prevDeps || !deps || prevDeps.length !== deps.length || deps.some((dep, i) => dep !== prevDeps[i]);
var viewTransitionState = void 0;
var documentStartViewTransition = (cb) => {
  if (document?.startViewTransition) {
    return document.startViewTransition(cb);
  } else {
    cb();
    return { finished: Promise.resolve() };
  }
};
var updateHook = void 0;
var viewTransitionHook = (context, node, cb) => {
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
var startViewTransition = (callback) => {
  updateHook = viewTransitionHook;
  try {
    callback();
  } finally {
    updateHook = void 0;
  }
};
var useViewTransition = () => {
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return [false, () => {
    }];
  }
  if (viewTransitionState) {
    viewTransitionState[1] = true;
  }
  return [!!viewTransitionState?.[0], startViewTransition];
};
var pendingStack = [];
var runCallback = (type, callback) => {
  pendingStack.push(type);
  try {
    callback();
  } finally {
    pendingStack.pop();
  }
};
var startTransition = (callback) => {
  runCallback(1, callback);
};
var startTransitionHook = (callback) => {
  runCallback(2, callback);
};
var useTransition = () => {
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return [false, () => {
    }];
  }
  const [context] = buildData;
  return [context[0] === 2, startTransitionHook];
};
var useDeferredValue = (value) => {
  const buildData = buildDataStack.at(-1);
  if (buildData) {
    buildData[0][0] = 1;
  }
  return value;
};
var setShadow = (node) => {
  if (node.vC) {
    node.s = node.vC;
    node.vC = void 0;
  }
  ;
  node.s?.forEach(setShadow);
};
var useState = (initialState) => {
  var _a;
  const resolveInitialState = () => typeof initialState === "function" ? initialState() : initialState;
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return [resolveInitialState(), () => {
    }];
  }
  const [, node] = buildData;
  const stateArray = (_a = node[DOM_STASH][1])[STASH_SATE] || (_a[STASH_SATE] = []);
  const hookIndex = node[DOM_STASH][0]++;
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
          update([pendingType, false, localUpdateHook], node).then((node2) => {
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
                build([], shadowNode, void 0);
                setShadow(shadowNode);
                node2.s = shadowNode.s;
                update([0, false, localUpdateHook], node2);
              });
            };
            if (localUpdateHook) {
              requestAnimationFrame(addUpdateTask);
            } else {
              addUpdateTask();
            }
          });
        } else {
          update([0, false, localUpdateHook], node);
        }
      }
    }
  ]);
};
var useEffectCommon = (index, effect, deps) => {
  var _a;
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return;
  }
  const [, node] = buildData;
  const effectDepsArray = (_a = node[DOM_STASH][1])[STASH_EFFECT] || (_a[STASH_EFFECT] = []);
  const hookIndex = node[DOM_STASH][0]++;
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
var useEffect = (effect, deps) => useEffectCommon(3, effect, deps);
var useLayoutEffect = (effect, deps) => useEffectCommon(1, effect, deps);
var useCallback = (callback, deps) => {
  var _a;
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return callback;
  }
  const [, node] = buildData;
  const callbackArray = (_a = node[DOM_STASH][1])[STASH_CALLBACK] || (_a[STASH_CALLBACK] = []);
  const hookIndex = node[DOM_STASH][0]++;
  const prevDeps = callbackArray[hookIndex];
  if (isDepsChanged(prevDeps?.[1], deps)) {
    callbackArray[hookIndex] = [callback, deps];
  } else {
    callback = callbackArray[hookIndex][0];
  }
  return callback;
};
var useRef = (initialValue) => {
  var _a;
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return { current: initialValue };
  }
  const [, node] = buildData;
  const refArray = (_a = node[DOM_STASH][1])[STASH_REF] || (_a[STASH_REF] = []);
  const hookIndex = node[DOM_STASH][0]++;
  return refArray[hookIndex] || (refArray[hookIndex] = { current: initialValue });
};
var use = (promise) => {
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
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    throw promise;
  }
  const [, node] = buildData;
  const promiseArray = (_a = node[DOM_STASH][1])[STASH_USE] || (_a[STASH_USE] = []);
  const hookIndex = node[DOM_STASH][0]++;
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
var useMemo = (factory, deps) => {
  var _a;
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return factory();
  }
  const [, node] = buildData;
  const memoArray = (_a = node[DOM_STASH][1])[STASH_MEMO] || (_a[STASH_MEMO] = []);
  const hookIndex = node[DOM_STASH][0]++;
  const prevDeps = memoArray[hookIndex];
  if (isDepsChanged(prevDeps?.[1], deps)) {
    memoArray[hookIndex] = [factory(), deps];
  }
  return memoArray[hookIndex][0];
};
export {
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
};
