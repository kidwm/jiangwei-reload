const form = document.querySelector("form");
const host = document.querySelector("#host");
const status = document.querySelector("#status");
const launcher = document.body;
const connection = document.querySelector("#connection");
const requirements = document.querySelector("#requirements");
const button = form.querySelector("button");
const standalone = matchMedia("(display-mode: standalone)");
let permission;
let attempt;

function canConnect() {
  return (standalone.matches || navigator.standalone === true) && permission?.state === "granted";
}
function updateLauncher() {
  const allowed = canConnect();
  connection.hidden = !allowed;
  requirements.hidden = allowed;
  button.disabled = !allowed || !!attempt;
  if (!allowed) {
    attempt?.abort();
    status.textContent = "";
  }
}
const addressKey = "jw-reload-host";
try {
  host.value = localStorage.getItem(addressKey) ?? "";
} catch { /* Storage is optional. */ }
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

function serverOrigin(value) {
  const match = /^(\d{1,3}(?:\.\d{1,3}){3}):(\d{1,5})$/.exec(value.trim());
  if (match) {
    const ip = match[1].split(".").map(Number);
    const port = Number(match[2]);
    if (
      ip.every((n) => n <= 255) && port > 0 && port <= 65535 &&
      (ip[0] === 10 || ip[0] === 192 && ip[1] === 168 ||
        ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31)
    ) {
      return new URL("http://" + ip.join(".") + ":" + port).origin;
    }
  }
  throw Error("請輸入區網 IPv4 位址和埠號，例如 192.168.50.20:8788。");
}
async function read(url, signal) {
  const response = await fetch(url, {
    signal,
    redirect: "error",
    credentials: "omit",
    cache: "no-store",
  });
  if (!response.ok) {
    throw Error(
      response.status === 503
        ? "此遊戲版本尚未提供簽章，請掃描主機的 QR Code。"
        : "主機回應 HTTP " + response.status,
    );
  }
  return response;
}
async function digest(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))));
}
async function loadGame(server, signal) {
  const [key, release] = await Promise.all([
    read("/public-key.json", signal).then((r) => r.json()),
    read(server + "/api/lan/release", signal).then((r) => r.json()),
  ]);
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    key,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
  if (
    !await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      publicKey,
      Uint8Array.from(atob(release.signature), (ch) => ch.charCodeAt(0)),
      new TextEncoder().encode(release.payload),
    )
  ) {
    throw Error("遊戲發行簽章驗證失敗。");
  }
  const releaseFiles = JSON.parse(release.payload);
  const bytes = await (await read(server + "/", signal)).arrayBuffer();
  if (!releaseFiles.documents.includes(await digest(bytes))) {
    throw Error("遊戲畫面與發行簽章不符。");
  }
  const page = new DOMParser().parseFromString(new TextDecoder().decode(bytes), "text/html");
  const entries = [];
  for (const script of page.querySelectorAll("script")) {
    const url = new URL(script.getAttribute("src"), server);
    if (
      script.type !== "module" || url.origin !== server ||
      !Object.hasOwn(releaseFiles.modules, url.pathname)
    ) throw Error("遊戲入口無效。");
    const js = await (await read(url, signal)).arrayBuffer();
    if (await digest(js) !== releaseFiles.modules[url.pathname]) {
      throw Error("遊戲程式與發行簽章不符。");
    }
    entries.push(new Blob([js], { type: "text/javascript" }));
    script.remove();
  }
  if (!entries.length) throw Error("找不到遊戲入口。");
  signal.throwIfAborted();
  for (const node of page.head.querySelectorAll("style, meta[name^=jwzr-]")) {
    document.head.append(document.importNode(node, true));
  }
  document.documentElement.dataset.serverOrigin = server;
  document.body.replaceWith(document.importNode(page.body, true));
  for (const blob of entries) {
    const url = URL.createObjectURL(blob);
    try {
      await import(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canConnect() || attempt) return;
  attempt = new AbortController();
  updateLauncher();
  try {
    const server = serverOrigin(host.value);
    try {
      localStorage.setItem(addressKey, host.value.trim());
    } catch { /* optional */ }
    status.textContent = "正在連線並驗證遊戲…";
    await loadGame(server, AbortSignal.any([attempt.signal, AbortSignal.timeout(30000)]));
  } catch (error) {
    const message = error instanceof TypeError || error.name === "TimeoutError"
      ? "無法連到主機。請確認 IP、埠號及瀏覽器的區網權限，或掃描主機的 QR Code。"
      : error.message;
    if (!launcher.isConnected) {
      document.body.replaceWith(launcher);
      delete document.documentElement.dataset.serverOrigin;
    }
    if (!attempt.signal.aborted) status.textContent = message;
  } finally {
    attempt = undefined;
    updateLauncher();
  }
});
standalone.addEventListener("change", updateLauncher);
try {
  permission = await navigator.permissions.query({ name: "local-network" });
  permission.addEventListener("change", updateLauncher);
  updateLauncher();
} catch { /* Browsers without a queryable LAN permission keep the project link. */ }
