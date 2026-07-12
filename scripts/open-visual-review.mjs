#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, normalize, resolve, sep } from "node:path";
import { spawn } from "node:child_process";

const defaultFile = "templates/visual-review/mockup.html";

function printHelp() {
  console.log(`GIQO Visual Review launcher

Usage:
  node scripts/open-visual-review.mjs [html-file] [--port 8765] [--host 127.0.0.1] [--mode comment|edit] [--actual URL] [--no-open]

Examples:
  node scripts/open-visual-review.mjs
  node scripts/open-visual-review.mjs templates/visual-review/wireframe.html
  node scripts/open-visual-review.mjs ./ui-review/mockup.html --port 9000
  node scripts/open-visual-review.mjs ./ui-review/mockup.html --mode edit --actual http://localhost:3000
  node scripts/open-visual-review.mjs --no-open
`);
}

function parseArgs(argv) {
  const options = {
    file: defaultFile,
    host: "127.0.0.1",
    port: 8765,
    mode: "comment",
    actual: "",
    openBrowser: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--no-open") {
      options.openBrowser = false;
      continue;
    }
    if (arg === "--host") {
      options.host = argv[index + 1] || options.host;
      index += 1;
      continue;
    }
    if (arg === "--port") {
      options.port = Number.parseInt(argv[index + 1] || String(options.port), 10);
      index += 1;
      continue;
    }
    if (arg === "--mode") {
      options.mode = argv[index + 1] || options.mode;
      index += 1;
      continue;
    }
    if (arg === "--actual") {
      options.actual = argv[index + 1] || options.actual;
      index += 1;
      continue;
    }
    if (!arg.startsWith("--")) {
      options.file = arg;
    }
  }

  if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) {
    throw new Error("Port must be an integer between 1 and 65535.");
  }
  if (!["comment", "edit"].includes(options.mode)) {
    throw new Error("Mode must be either comment or edit.");
  }

  return options;
}

function contentType(pathname) {
  const types = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
  };
  return types[extname(pathname)] || "application/octet-stream";
}

function openUrl(url) {
  const commands = {
    darwin: ["open", [url]],
    linux: ["xdg-open", [url]],
    win32: ["cmd", ["/c", "start", "", url]],
  };
  const command = commands[process.platform];
  if (!command) {
    console.log(`Open this URL manually: ${url}`);
    return;
  }
  const child = spawn(command[0], command[1], { detached: true, stdio: "ignore" });
  child.unref();
}

function safePath(root, requestUrl) {
  const url = new URL(requestUrl, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const requested = pathname === "/" ? "mockup.html" : pathname.slice(1);
  const fullPath = normalize(join(root, requested));
  const rootWithSeparator = root.endsWith(sep) ? root : `${root}${sep}`;
  if (fullPath !== root && !fullPath.startsWith(rootWithSeparator)) {
    return null;
  }
  return fullPath;
}

function serve(root) {
  return createServer((request, response) => {
    const filePath = safePath(root, request.url || "/");
    if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": contentType(filePath) });
    createReadStream(filePath).pipe(response);
  });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const filePath = isAbsolute(options.file) ? options.file : resolve(process.cwd(), options.file);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error(`Review HTML file not found: ${filePath}`);
  }
  const root = resolve(filePath, "..");
  const fileName = filePath.split(sep).pop();
  const query = new URLSearchParams({ mode: options.mode });
  if (options.actual) {
    query.set("actual", options.actual);
  }
  const url = `http://${options.host}:${options.port}/${encodeURIComponent(fileName)}?${query.toString()}`;
  const server = serve(root);

  server.listen(options.port, options.host, () => {
    console.log(`GIQO Visual Review is running at ${url}`);
    console.log("Press Ctrl+C to stop the server.");
    if (options.openBrowser) {
      openUrl(url);
    }
  });

  server.on("error", (error) => {
    console.error(error.message);
    process.exit(1);
  });
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
