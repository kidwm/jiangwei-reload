# 固定 PWA 入口

此庫維護 [Chrome 安裝入口](https://jiangwei-reload.pages.dev/) 的靜態檔案。Cloudflare Pages
專案為 `jiangwei-reload`，正式分支為 `main`，由維護者使用 Direct Upload 發布。
推送 Git 提交後仍需執行部署。桌面版下載與歷版說明見 [README](README.md)。

## 部署

使用 Node.js 24.22 以上的 24.x 版本，在此庫根目錄執行以下命令。`npm ci` 依鎖檔安裝
Cloudflare CLI `cf` 1.0.0-rc.4。首次登入需要在 Cloudflare 網頁核准裝置授權。

```sh
npm ci
npx cf auth login --scopes account:read user:read pages:read pages:write
npx cf auth whoami
npx cf pages get jiangwei-reload
```

若本機原有的 Node.js 版本較舊，可透過 npm 在單一命令內使用支援的版本，
例如 `npm exec --yes --package=node@24.22.3 -- npm ci`。部署時同樣可執行
`npm exec --yes --package=node@24.22.3 -- npm run pages:deploy -- preview`。

自動化環境可透過環境變數提供限該帳號的 Pages Write API token
（`CLOUDFLARE_API_TOKEN`）及 `CLOUDFLARE_ACCOUNT_ID`。使用具名 cf 設定檔時請匯出
`CLOUDFLARE_AUTH_PROFILE`。金鑰與憑證只放在本機憑證庫或執行環境。

1. 提交要發布的檔案。部署腳本從本 checkout 的 Git HEAD 讀取 `pwa/` 的 13 個檔案，
   包括未壓縮的入口與六個圖示。未提交的修改不會上線。新增或更名檔案時同步更新腳本的檔案清單、
   MIME 類型及 Service Worker 快取清單。
2. 建立預覽，使用命令輸出的部署網址核對內容。

   ```sh
   npm run pages:deploy -- preview
   npm run pages:verify -- https://<部署編號>.jiangwei-reload.pages.dev/
   ```

3. 在相同提交發布正式版。核對專案目前的 `canonical_deployment.id` 與新部署編號，
   等待 `latest_stage.status` 為 `success`，再比對正式網址。

   ```sh
   npm run pages:deploy -- production
   npx cf pages get jiangwei-reload
   npm run pages:verify
   ```

驗證程式會將 12 個公開檔案與 checkout 逐一比對 SHA-256，並逐項比對 `pwa/_headers`
指定的回應標頭。瀏覽器驗收使用 Mac Chrome 獨立設定檔，安裝 PWA 後分別在分頁與獨立視窗
切換 local-network 權限。只有獨立視窗的 granted 狀態應顯示可送出的連線表單。
同一視窗撤銷授權後應立即回到安裝說明與 GitHub 連結。

`cf pages deploy` 在此版本不支援既有 Pages 專案。`tools/deploy-pages.mjs` 透過 cf 的
官方驗證函式庫取得該專案的短效上傳授權，依 Pages Direct Upload 流程上傳內容與雜湊。
接著用 `cf pages deployments create` 傳送 manifest、Git SHA、分支與 `_headers`。
此版 cf 的 `--file` 對應 multipart 的 `_headers` 欄位。升級 cf 或其驗證函式庫時，
先在同專案預覽網址驗收標頭與內容，再執行正式部署。查閱歷次部署可用
`npx cf pages deployments list --project-name jiangwei-reload`。

[cf 安裝與登入](https://developers.cloudflare.com/cf/get-started/) ·
[Pages 部署 API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/methods/create/) ·
[Cloudflare 的資產上傳實作](https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/src/pages/upload.ts)

## 與桌面版同步

- 網頁、樣式、啟動程式、Service Worker 與回應標頭在本庫修改。Service Worker 快取固定入口、
  圖示、manifest 與公鑰。變更離線內容時檢查快取版號與舊快取清理。
- 圖示由桌面專案的 SVG 原稿產生。更新圖示時，將六個 Web 圖檔同步至本庫的 `pwa/`。
  桌面主機另持有本機副本，供 QR Code 直連與加入主畫面使用。Linux 打包也使用 512 px 圖示。
- 修改 `manifest.webmanifest` 時同步桌面主機的副本。保留根路徑的應用程式 ID、啟動網址與
  standalone 模式，已安裝的捷徑會繼續使用相同的正式來源。
- `public-key.json` 為瀏覽器使用的 P-256 驗章公鑰。桌面建置端比對公私鑰後簽署遠端
  HTML 與 JS 的 SHA-256 清單。輪替公鑰時須協調已發布桌面版本的相容性。遊戲程式、素材、
  存檔由玩家的區網主機供應，iPad Safari 沿用主機 QR Code。
