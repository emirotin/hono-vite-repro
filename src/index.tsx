import { Hono } from "hono";
import { renderer } from "./renderer";

const app = new Hono();

app.get("*", renderer);

app.get("/", (c) => {
  return c.render(<h1>Hi</h1>);
});

export default app;
