import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const outDir = path.join(root, "out");
const indexPath = path.join(outDir, "index.html");

fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(
    indexPath,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PKM</title>
    <meta name="robots" content="noindex" />
    <style>
      html, body { height: 100%; margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #0b0d14; color: #e6e9ff; }
      .wrap { height: 100%; display: grid; place-items: center; padding: 24px; }
      .card { max-width: 560px; width: 100%; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px 16px; background: rgba(255,255,255,0.03); }
      h1 { margin: 0 0 8px; font-size: 18px; }
      p { margin: 0; line-height: 1.4; opacity: 0.8; font-size: 13px; }
      code { background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Capacitor WebDir Placeholder</h1>
        <p>
          This app is configured to load PK-Manager from <code>server.url</code> in
          <code>capacitor.config.ts</code>. Set <code>CAPACITOR_SERVER_URL</code> to your deployed
          frontend URL before building the APK, then run <code>npx cap sync android</code>.
        </p>
      </div>
    </div>
  </body>
</html>
`,
    "utf8",
  );
}

console.log(`Capacitor webDir ready: ${path.relative(root, indexPath)}`);

