// Compare the deployed bytes and headers with the public checkout.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";

const base = new URL(process.argv[2] ?? "https://jiangwei-reload.pages.dev/");
const source = new URL("../pwa/", import.meta.url);
const headers = (await readFile(new URL("_headers", source), "utf8")).trim().split(/\r?\n/);
assert.equal(headers.shift(), "/*");
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const assets = {};
for (const name of (await readdir(source)).sort()) {
  if (name === "_headers") continue;
  const response = await fetch(new URL(name === "index.html" ? "/" : name, base), {
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30000)
  });
  assert.equal(response.status, 200, name);
  for (const rule of headers) {
    const separator = rule.indexOf(":");
    assert.ok(separator > 0, rule);
    const header = rule.slice(0, separator).trim();
    assert.equal(response.headers.get(header), rule.slice(separator + 1).trim(), name + " " + header);
  }
  const hash = sha256(await response.bytes());
  assert.equal(hash, sha256(await readFile(new URL(name, source))), name);
  assets[name] = { sha256: hash, type: response.headers.get("content-type") };
}
console.log(JSON.stringify({ url: base.href, testedAt: new Date().toISOString(), headers, assets }, null, 2));
