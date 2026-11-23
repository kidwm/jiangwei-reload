import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCfAuth } from "@cloudflare/workers-auth/cf";
import blake3 from "blake3-wasm";

const project = "jiangwei-reload";
const mode = process.argv[2];
if (process.argv.length !== 3 || !["production", "preview"].includes(mode)) {
  throw new Error("Usage: npm run pages:deploy -- preview|production");
}
const cwd = fileURLToPath(new URL("../", import.meta.url));
const git = (...args) => execFileSync("git", args, { cwd });
const commit = git("rev-parse", "HEAD").toString().trim();
const message = git("show", "-s", "--format=%s", commit).toString().trim();

// Read one immutable source tree. Only these regular blobs belong on the public origin.
const names = [
  "_headers", "apple-touch-icon.png", "favicon.ico", "favicon.svg", "icon-192.png",
  "icon-512.png", "icon-maskable-512.png", "index.html", "launcher.css", "launcher.js",
  "manifest.webmanifest", "public-key.json", "sw.js",
];
const tree = git("ls-tree", "-z", commit + ":pwa").toString().split("\0").filter(Boolean);
assert.deepEqual(tree.map(line => {
  const match = /^100644 blob [0-9a-f]+\t(.+)$/.exec(line);
  assert.ok(match, "Expected regular public file: " + line);
  return match[1];
}).sort(), names);
const read = name => git("show", commit + ":pwa/" + name);
const headers = read("_headers");
const mime = {
  css: "text/css", html: "text/html", ico: "image/vnd.microsoft.icon", js: "application/javascript",
  json: "application/json", png: "image/png", svg: "image/svg+xml", webmanifest: "application/manifest+json",
};
const manifest = {};
const files = [];
for (const name of names.filter(name => name !== "_headers")) {
  const ext = extname(name).slice(1);
  const value = read(name).toString("base64");
  const key = blake3.hash(value + ext).toString("hex").slice(0, 32);
  manifest["/" + name] = key;
  files.push({ key, value, base64: true, metadata: { contentType: mime[ext] } });
}

// cf exposes deployment creation but not the asset operations. Its own OAuth
// library obtains the project upload JWT through the same selected cf identity.
const profile = process.env.CLOUDFLARE_AUTH_PROFILE || "default";
const cli = fileURLToPath(new URL("../node_modules/cf/bin/cf", import.meta.url));
const cf = (...args) => JSON.parse(execFileSync(process.execPath, [cli, ...args, "--profile", profile], {
  cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"],
}));
const details = cf("pages", "get", project);
assert.equal(details.subdomain, project + ".pages.dev");
assert.equal(details.production_branch, "main");
assert.equal(details.source?.type ?? null, null, "Expected Direct Upload project");

const auth = createCfAuth({
  userAgent: "jiangwei-reload-pages", logger: { ...console, debug() {} },
  select() { throw new Error("Set CLOUDFLARE_ACCOUNT_ID to select the Pages account."); },
  prompt() { throw new Error("Run cf auth login or set CLOUDFLARE_API_TOKEN."); },
  isNoDefaultValueProvidedError: () => false,
});
auth.setProfile(profile);
const account = await auth.requireAuth({});
async function api(path, token, body) {
  const response = await fetch("https://api.cloudflare.com/client/v4" + path, {
    method: body ? "POST" : "GET", redirect: "error", signal: AbortSignal.timeout(60000),
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(path + " HTTP " + response.status + " " + JSON.stringify(result.errors));
  }
  return result.result;
}
const { jwt } = await api("/accounts/" + account + "/pages/projects/" + project + "/upload-token",
  auth.requireApiToken().apiToken);
assert.ok(jwt, "Missing project upload authorization");
// The entire launcher is about 180 KiB. A single upload also works on a cold asset cache.
await api("/pages/assets/upload", jwt, files);
await api("/pages/assets/upsert-hashes", jwt, { hashes: Object.values(manifest) });

const temp = await mkdtemp(join(tmpdir(), "jiangwei-reload-pages-"));
try {
  const file = join(temp, "_headers");
  await writeFile(file, headers);
  const deployment = cf("pages", "deployments", "create", project,
    "--branch", mode === "production" ? "main" : "pwa-preview",
    "--manifest", JSON.stringify(manifest), "--file", file,
    "--commit-hash", commit, "--commit-message", message, "--commit-dirty", "false");
  assert.equal(deployment.environment, mode);
  console.log(JSON.stringify({ project, commit, environment: mode, uploaded: files.length, id: deployment.id, url: deployment.url }, null, 2));
} finally {
  await rm(temp, { recursive: true, force: true });
}
