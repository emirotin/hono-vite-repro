import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html>
      <head>
        <link href="/static/style.css" rel="stylesheet" />
        <title>{title}</title>
        <script
          type="module"
          src={import.meta.env.PROD ? "/static/client.js" : "/src/client.tsx"}
        />
      </head>
      <body>
        {children}
        <div id="app-root" />
      </body>
    </html>
  );
});
