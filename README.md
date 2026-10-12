# 三國志姜維傳．RELOAD

本專案仍在開發中。各版本的遊玩範圍、更新內容與已知問題，請參閱該版本的 Release 說明。

## 下載與使用前準備

[下載最新版本](https://github.com/kidwm/jiangwei-reload/releases/latest)

請在 Release 頁面的 **Assets** 下載對應平台的 ZIP 檔：

| 平台        | 適用電腦          |
| ----------- | ----------------- |
| macOS ARM64 | Apple Silicon Mac |
| Windows x64 | 64 位元 Windows   |
| Linux x64   | x86_64 Linux      |

請準備完整的《姜維傳 1.28》遊戲資料夾。下載包只包含 RELOAD
程式與介面，圖像、音樂及其他原版資料會直接從遊戲資料夾讀取，不需要預先轉換素材，也不需要另外安裝
Deno。

GitHub 自動提供的 `Source code` 壓縮檔不是可直接執行的程式包。

### 系統需求

- **macOS**：Apple Silicon，macOS 12.0 以上。目前開發與啟動驗證環境為 macOS
  26.3.1，其他版本尚未完成驗收。
- **Windows**：64 位元 Windows，需安裝 WebView2 執行環境。
- **Linux**：圖形桌面環境、WebKitGTK 4.1、GTK 3、glibc 2.34 以上，以及提供 `GLIBCXX_3.4.30` 的
  libstdc++。

## 解壓與啟動

### macOS

將完整的 `JW_RELOAD.app` 放進原版遊戲資料夾，雙擊開啟。

本開發版尚未經 Apple 公證。若首次開啟被阻擋，請依「系統設定 →
隱私權與安全性」的提示確認開啟，並允許程式存取遊戲資料夾。

### Windows

將 `JW_RELOAD.cmd` 與完整的 `JW_RELOAD` 資料夾一起放進原版遊戲資料夾，雙擊 `JW_RELOAD.cmd`。

兩者須放在同一層，並保留資料夾內的 `JW_RELOAD.exe`、`JW_RELOAD.dll` 與其他支援檔案。

### Linux

將完整的 `JW_RELOAD` 資料夾放進原版遊戲資料夾。

在原版遊戲資料夾開啟終端機，執行：

```sh
./JW_RELOAD/JW_RELOAD
```

請保留同一資料夾中的 `JW_RELOAD.so` 與其他支援檔案。

ZIP 已保存啟動檔的執行權限。若解壓工具未保留權限，請執行：

```sh
chmod +x ./JW_RELOAD/JW_RELOAD
```

## 存檔與讀檔

預設與原版共用遊戲資料夾中的 `Sv00` 至 `Sv09` 存檔槽位。**覆寫前，請先備份要保留的原版存檔。**

每個槽位的以下檔案應一起保留：

```text
SvNNb.e5s
SvNNd.e5s
SvNNe.e5s
SvNNs.e5s
SvNN.jwzr.json
```

其中 `NN` 為槽位編號。附加的 `.jwzr.json` 用於保留 RELOAD 的亂數狀態；原版續玩使用四個 `.e5s`
檔案。附加檔沿用原有名稱，更新程式時請保留。

支援的關卡與保存節點請參閱各版 Release 說明。

### 戰場自動存檔

環境設定中的「戰場自動存檔」預設開啟，可自行關閉。自動存檔使用獨立的 `SvAuto[bdes].e5s` 與
`SvAuto.jwzr.json`，不覆寫十個編號存檔槽。

讀取列表有自動存檔時，會置頂顯示 **Auto**。原版不列出 `SvAuto`；要回原版續玩， 請先在 RELOAD 讀取
Auto，再手動另存編號槽位。

## 更新程式

先關閉程式，再替換：

- **macOS**：`JW_RELOAD.app`
- **Windows**：`JW_RELOAD.cmd` 與完整的 `JW_RELOAD` 程式資料夾
- **Linux**：完整的 `JW_RELOAD` 程式資料夾

請保留原版遊戲素材、編號存檔、`SvNN.jwzr.json`、完整的 `SvAuto` 檔案與存檔備份資料夾。

## 常見問題

### 找不到原版資料

確認程式放在包含《姜維傳 1.28》原版遊戲資料的正確資料夾，並完整解壓下載包。

### 無法儲存

確認遊戲資料夾可寫入，並等待目前的操作或演出完成。

### 視窗過小

放大視窗，依畫面的尺寸提示恢復遊戲。

### Windows 無法啟動

確認完整解壓，並檢查 WebView2 執行環境是否已安裝。

若顯示找不到 `MSVCP140.dll`，請將 **Microsoft Visual C++ Redistributable（v14）的 x64 與 x86
兩種版本都下載並安裝**。即使使用 64 位元 Windows，也請安裝兩種版本：

- [下載 x64 版本](https://aka.ms/vc14/vc_redist.x64.exe)
- [下載 x86 版本](https://aka.ms/vc14/vc_redist.x86.exe)
- [Microsoft 官方說明](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)

依安裝程式提示完成安裝；若要求重新啟動電腦，請先重新啟動，再開啟 `JW_RELOAD.cmd`。

### Linux 無法啟動或沒有音樂

確認啟動檔具執行權限，並檢查上述系統元件。

若缺少 `libwebkit2gtk-4.1.so.0`，需安裝發行版提供的 WebKitGTK 4.1 執行元件。

若診斷資訊顯示不支援 MP3，請檢查 GStreamer 音訊外掛，並提供診斷報告。
