import { render } from "hono/jsx/dom";

import { App } from "./App";

const root = document.getElementById("app-root");
if (root) {
  render(<App />, root);
}
