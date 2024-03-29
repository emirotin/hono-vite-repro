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
var render_exports = {};
__export(render_exports, {
  build: () => build,
  buildDataStack: () => buildDataStack,
  render: () => render,
  update: () => update
});
module.exports = __toCommonJS(render_exports);
var import_constants = require("../constants");
var import_context = require("../context");
var import_hooks = require("../hooks");
var import_context2 = require("./context");
const eventAliasMap = {
  Change: "Input",
  DoubleClick: "DblClick"
};
const nameSpaceMap = {
  svg: "http://www.w3.org/2000/svg",
  math: "http://www.w3.org/1998/Math/MathML"
};
const buildDataStack = [];
let nameSpaceContext = void 0;
const isNodeString = (node) => Array.isArray(node);
const getEventSpec = (key) => {
  const match = key.match(/^on([A-Z][a-zA-Z]+?)((?<!Pointer)Capture)?$/);
  if (match) {
    const [, eventName, capture] = match;
    return [(eventAliasMap[eventName] || eventName).toLowerCase(), !!capture];
  }
  return void 0;
};
const applyProps = (container, attributes, oldAttributes) => {
  attributes || (attributes = {});
  for (const [key, value] of Object.entries(attributes)) {
    if (!oldAttributes || oldAttributes[key] !== value) {
      const eventSpec = getEventSpec(key);
      if (eventSpec) {
        if (typeof value !== "function") {
          throw new Error(`Event handler for "${key}" is not a function`);
        }
        if (oldAttributes) {
          container.removeEventListener(eventSpec[0], oldAttributes[key], eventSpec[1]);
        }
        container.addEventListener(eventSpec[0], value, eventSpec[1]);
      } else if (key === "dangerouslySetInnerHTML" && value) {
        container.innerHTML = value.__html;
      } else if (key === "ref") {
        if (typeof value === "function") {
          value(container);
        } else if ("current" in value) {
          value.current = container;
        }
      } else if (key === "style") {
        if (typeof value === "string") {
          container.style.cssText = value;
        } else {
          container.style.cssText = "";
          Object.assign(container.style, value);
        }
      } else {
        const nodeName = container.nodeName;
        if (key === "value") {
          if (nodeName === "INPUT" || nodeName === "TEXTAREA" || nodeName === "SELECT") {
            ;
            container.value = value === null || value === void 0 || value === false ? null : value;
            if (nodeName === "TEXTAREA") {
              container.textContent = value;
              continue;
            } else if (nodeName === "SELECT") {
              if (container.selectedIndex === -1) {
                ;
                container.selectedIndex = 0;
              }
              continue;
            }
          }
        } else if (key === "checked" && nodeName === "INPUT" || key === "selected" && nodeName === "OPTION") {
          ;
          container[key] = value;
        }
        if (value === null || value === void 0 || value === false) {
          container.removeAttribute(key);
        } else if (value === true) {
          container.setAttribute(key, "");
        } else if (typeof value === "string" || typeof value === "number") {
          container.setAttribute(key, value);
        } else {
          container.setAttribute(key, value.toString());
        }
      }
    }
  }
  if (oldAttributes) {
    for (const [key, value] of Object.entries(oldAttributes)) {
      if (!(key in attributes)) {
        const eventSpec = getEventSpec(key);
        if (eventSpec) {
          container.removeEventListener(eventSpec[0], value, eventSpec[1]);
        } else if (key === "ref") {
          if (typeof value === "function") {
            value(null);
          } else {
            value.current = null;
          }
        } else {
          container.removeAttribute(key);
        }
      }
    }
  }
};
const invokeTag = (context, node) => {
  if (node.s) {
    const res = node.s;
    node.s = void 0;
    return res;
  }
  node[import_constants.DOM_STASH][0] = 0;
  buildDataStack.push([context, node]);
  const func = node.tag[import_constants.DOM_RENDERER] || node.tag;
  try {
    return [
      func.call(null, {
        ...node.props,
        children: node.children
      })
    ];
  } finally {
    buildDataStack.pop();
  }
};
const getNextChildren = (node, container, nextChildren, childrenToRemove, callbacks) => {
  childrenToRemove.push(...node.vR);
  if (typeof node.tag === "function") {
    node[import_constants.DOM_STASH][1][import_hooks.STASH_EFFECT]?.forEach((data) => callbacks.push(data));
  }
  node.vC.forEach((child) => {
    if (isNodeString(child)) {
      nextChildren.push(child);
    } else {
      if (typeof child.tag === "function" || child.tag === "") {
        child.c = container;
        getNextChildren(child, container, nextChildren, childrenToRemove, callbacks);
      } else {
        nextChildren.push(child);
        childrenToRemove.push(...child.vR);
      }
    }
  });
};
const findInsertBefore = (node) => {
  if (!node) {
    return null;
  } else if (node.e) {
    return node.e;
  }
  if (node.vC) {
    for (let i = 0, len = node.vC.length; i < len; i++) {
      const e = findInsertBefore(node.vC[i]);
      if (e) {
        return e;
      }
    }
  }
  return findInsertBefore(node.nN);
};
const removeNode = (node) => {
  if (!isNodeString(node)) {
    node[import_constants.DOM_STASH]?.[1][import_hooks.STASH_EFFECT]?.forEach((data) => data[2]?.());
    node.vC?.forEach(removeNode);
  }
  node.e?.remove();
  node.tag = void 0;
};
const apply = (node, container) => {
  if (node.tag === void 0) {
    return;
  }
  node.c = container;
  applyNodeObject(node, container);
};
const applyNode = (node, container) => {
  if (isNodeString(node)) {
    container.textContent = node[0];
  } else {
    applyNodeObject(node, container);
  }
};
const findChildNodeIndex = (childNodes, child) => {
  if (!child) {
    return;
  }
  for (let i = 0, len = childNodes.length; i < len; i++) {
    if (childNodes[i] === child) {
      return i;
    }
  }
  return;
};
const applyNodeObject = (node, container) => {
  const next = [];
  const remove = [];
  const callbacks = [];
  getNextChildren(node, container, next, remove, callbacks);
  const childNodes = container.childNodes;
  let offset = findChildNodeIndex(childNodes, findInsertBefore(node.nN)) ?? findChildNodeIndex(childNodes, next.find((n) => n.e)?.e) ?? childNodes.length;
  for (let i = 0, len = next.length; i < len; i++, offset++) {
    const child = next[i];
    let el;
    if (isNodeString(child)) {
      if (child.e && child[1]) {
        child.e.textContent = child[0];
      }
      child[1] = false;
      el = child.e || (child.e = document.createTextNode(child[0]));
    } else {
      el = child.e || (child.e = child.n ? document.createElementNS(child.n, child.tag) : document.createElement(child.tag));
      applyProps(el, child.props, child.pP);
      applyNode(child, el);
    }
    if (childNodes[offset] !== el && childNodes[offset - 1] !== child.e) {
      container.insertBefore(el, childNodes[offset] || null);
    }
  }
  remove.forEach(removeNode);
  callbacks.forEach(([, cb]) => cb?.());
  requestAnimationFrame(() => {
    callbacks.forEach(([, , , cb]) => cb?.());
  });
};
const build = (context, node, topLevelErrorHandlerNode, children) => {
  if (node.tag === void 0) {
    return;
  }
  let errorHandler;
  children || (children = typeof node.tag == "function" ? invokeTag(context, node) : node.children);
  if (children[0]?.tag === "") {
    errorHandler = children[0][import_constants.DOM_ERROR_HANDLER];
    topLevelErrorHandlerNode || (topLevelErrorHandlerNode = node);
  }
  const oldVChildren = node.vC ? [...node.vC] : [];
  const vChildren = [];
  const vChildrenToRemove = [];
  let prevNode;
  try {
    children.flat().forEach((c) => {
      let child = buildNode(c);
      if (child) {
        if (prevNode) {
          prevNode.nN = child;
        }
        prevNode = child;
        if (typeof child.tag === "function" && import_context.globalContexts.length > 0) {
          child[import_constants.DOM_STASH][2] = import_context.globalContexts.map((c2) => [c2, c2.values.at(-1)]);
        }
        let oldChild;
        const i = oldVChildren.findIndex((c2) => c2.key === child.key);
        if (i !== -1) {
          oldChild = oldVChildren[i];
          oldVChildren.splice(i, 1);
        }
        if (oldChild) {
          if (isNodeString(child)) {
            if (!isNodeString(oldChild)) {
              vChildrenToRemove.push(oldChild);
            } else {
              if (oldChild[0] !== child[0]) {
                oldChild[0] = child[0];
                oldChild[1] = true;
              }
              child = oldChild;
            }
          } else if (oldChild.tag !== child.tag) {
            vChildrenToRemove.push(oldChild);
          } else {
            oldChild.pP = oldChild.props;
            oldChild.props = child.props;
            oldChild.children = child.children;
            child = oldChild;
          }
        } else if (!isNodeString(child) && nameSpaceContext) {
          const ns = (0, import_context.useContext)(nameSpaceContext);
          if (ns) {
            child.n = ns;
          }
        }
        if (!isNodeString(child)) {
          build(context, child, topLevelErrorHandlerNode);
        }
        vChildren.push(child);
      }
    });
    node.vC = vChildren;
    vChildrenToRemove.push(...oldVChildren);
    node.vR = vChildrenToRemove;
  } catch (e) {
    if (errorHandler) {
      const fallback = errorHandler(
        e,
        () => update([0, false, context[2]], topLevelErrorHandlerNode)
      );
      if (fallback) {
        if (context[0] === 1) {
          context[1] = true;
        } else {
          build(context, node, topLevelErrorHandlerNode, [fallback]);
        }
        return;
      }
    }
    throw e;
  }
};
const buildNode = (node) => {
  if (node === void 0 || node === null || typeof node === "boolean") {
    return void 0;
  } else if (typeof node === "string" || typeof node === "number") {
    return [node.toString(), true];
  } else {
    if (typeof node.tag === "function") {
      ;
      node[import_constants.DOM_STASH] = [0, []];
    } else {
      const ns = nameSpaceMap[node.tag];
      if (ns) {
        ;
        node.n = ns;
        nameSpaceContext || (nameSpaceContext = (0, import_context2.createContext)(""));
        node.children = [
          {
            tag: nameSpaceContext.Provider,
            props: {
              value: ns
            },
            children: node.children
          }
        ];
      }
    }
    return node;
  }
};
const replaceContainer = (node, from, to) => {
  if (node.c === from) {
    node.c = to;
    node.vC.forEach((child) => replaceContainer(child, from, to));
  }
};
const updateSync = (context, node) => {
  node[import_constants.DOM_STASH][2]?.forEach(([c, v]) => {
    c.values.push(v);
  });
  build(context, node, void 0);
  node[import_constants.DOM_STASH][2]?.forEach(([c]) => {
    c.values.pop();
  });
  if (context[0] !== 1 || !context[1]) {
    apply(node, node.c);
  }
};
const updateMap = /* @__PURE__ */ new WeakMap();
const update = async (context, node) => {
  const existing = updateMap.get(node);
  if (existing) {
    existing[0](void 0);
  }
  let resolve;
  const promise = new Promise((r) => resolve = r);
  updateMap.set(node, [
    resolve,
    () => {
      if (context[2]) {
        context[2](context, node, (context2) => {
          updateSync(context2, node);
        }).then(() => resolve(node));
      } else {
        updateSync(context, node);
        resolve(node);
      }
    }
  ]);
  await Promise.resolve();
  const latest = updateMap.get(node);
  if (latest) {
    updateMap.delete(node);
    latest[1]();
  }
  return promise;
};
const render = (jsxNode, container) => {
  const node = buildNode({ tag: "", children: [jsxNode] });
  build([], node, void 0);
  const fragment = document.createDocumentFragment();
  apply(node, fragment);
  replaceContainer(node, fragment, container);
  container.replaceChildren(fragment);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  build,
  buildDataStack,
  render,
  update
});
