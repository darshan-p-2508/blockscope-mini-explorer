import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Blockchain } from "./blockchain.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const blockchain = new Blockchain();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 16_384) throw new Error("request body too large (maximum 16 KB)");
  }
  if (!body) return {};
  try { return JSON.parse(body); }
  catch { throw new Error("request body must be valid JSON"); }
}

async function serveStatic(urlPath, res) {
  const requested = urlPath === "/" ? "index.html" : decodeURIComponent(urlPath.slice(1));
  const resolved = path.resolve(PUBLIC, requested);
  if (!resolved.startsWith(PUBLIC + path.sep) && resolved !== PUBLIC) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  try {
    const info = await stat(resolved);
    if (!info.isFile()) throw new Error("not a file");
    const data = await readFile(resolved);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(resolved)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'"
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const method = req.method || "GET";
  const route = url.pathname;

  if (route.startsWith("/api/")) {
    if (method === "OPTIONS") {
      res.writeHead(204, { "Allow": "GET, POST, OPTIONS" }); res.end(); return;
    }
    try {
      if (method === "GET" && route === "/api/health") {
        return sendJson(res, 200, { ok: true, name: "BlockScope", version: "0.1.0", uptimeSeconds: Math.floor(process.uptime()) });
      }
      if (method === "GET" && route === "/api/stats") return sendJson(res, 200, blockchain.getStats());
      if (method === "GET" && route === "/api/chain") return sendJson(res, 200, blockchain.exportChain());
      if (method === "GET" && route === "/api/blocks") return sendJson(res, 200, { blocks: blockchain.getBlocks() });
      if (method === "GET" && route.startsWith("/api/blocks/")) {
        const raw = route.slice("/api/blocks/".length);
        if (!/^\d+$/.test(raw)) return sendJson(res, 400, { error: "block height must be a non-negative integer" });
        const block = blockchain.getBlock(Number(raw));
        return block ? sendJson(res, 200, { block }) : sendJson(res, 404, { error: "block not found" });
      }
      if (method === "GET" && route === "/api/transactions") return sendJson(res, 200, { transactions: blockchain.getTransactions() });
      if (method === "GET" && route.startsWith("/api/transactions/")) {
        const id = decodeURIComponent(route.slice("/api/transactions/".length));
        const transaction = blockchain.getTransaction(id);
        return transaction ? sendJson(res, 200, { transaction }) : sendJson(res, 404, { error: "transaction not found" });
      }
      if (method === "GET" && route === "/api/balances") return sendJson(res, 200, { balances: blockchain.getBalances() });
      if (method === "POST" && route === "/api/transactions") {
        const body = await readJson(req);
        const transaction = blockchain.addTransaction(body);
        return sendJson(res, 201, { transaction, message: "Transaction added to pending pool" });
      }
      if (method === "POST" && route === "/api/mine") {
        const body = await readJson(req);
        const block = blockchain.minePendingTransactions(body.miner || "miner");
        return sendJson(res, 201, { block, validation: blockchain.validateChain() });
      }
      if (method === "GET" && route === "/api/validate") return sendJson(res, 200, blockchain.validateChain());
      return sendJson(res, 404, { error: "API route not found" });
    } catch (error) {
      const status = /too large/i.test(error.message) ? 413 : 400;
      return sendJson(res, status, { error: error.message || "request failed" });
    }
  }

  if (method !== "GET" && method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }); res.end("Method not allowed"); return;
  }
  return serveStatic(route, res);
});

server.listen(PORT, HOST, () => {
  console.log(`BlockScope running at http://${HOST}:${PORT}`);
  console.log("Local educational chain only. In-memory state resets on restart.");
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
