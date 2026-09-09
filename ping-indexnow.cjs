#!/usr/bin/env node
/**
 * Ping IndexNow (Bing/Yandex) after deploy so new URLs get crawled faster.
 * Usage: node ping-indexnow.cjs
 * Requires: indexnow-key.txt at site root (served at /indexnow-key.txt).
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { ROOT, ORIGIN, publicPages } = require("./shared/site");

const KEY_FILE = path.join(ROOT, "indexnow-key.txt");
const HOST = "krivatechnologies.com";

function ensureKey() {
  if (fs.existsSync(KEY_FILE)) {
    return fs.readFileSync(KEY_FILE, "utf8").trim();
  }
  const key =
    "kriva-" +
    require("crypto").randomBytes(16).toString("hex");
  fs.writeFileSync(KEY_FILE, key + "\n");
  console.log("Created indexnow-key.txt — deploy and verify at " + ORIGIN + "/indexnow-key.txt");
  return key;
}

function ping(key, urlList) {
  const body = JSON.stringify({
    host: HOST,
    key,
    keyLocation: ORIGIN + "/indexnow-key.txt",
    urlList,
  });
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.indexnow.org",
        path: "/indexnow",
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, data }));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const key = ensureKey();
  const urls = publicPages().map((p) => p.url);
  const res = await ping(key, urls.slice(0, 100));
  console.log("IndexNow status:", res.status);
  if (res.data) console.log(res.data);
  console.log("Pinged " + Math.min(urls.length, 100) + " URLs.");
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
