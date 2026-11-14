# 三國志姜維傳．RELOAD

本專案仍在開發中。各版本的遊玩範圍、更新內容與已知問題，請參閱該版本的 Release 說明。

## 下載與使用前準備

[下載最新版本](https://github.com/kidwm/jiangwei-reload/releases/latest) ·
[歷版更新紀錄](https://github.com/kidwm/jiangwei-reload/blob/main/CHANGELOG.md)

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

首次啟動時，在黑底啟動頁點擊畫面，或按 Enter／Space 進入標題。音樂尚未就緒時仍可繼續操作。

## 區網遊玩

1. 在電腦的原生選單選「JW_RELOAD → 區網伺服器…」。若正在遊戲中，請先保存，啟動時會返回標題。
2. 將另一台裝置連上同一區網，掃描 QR Code 或開啟複製的完整連線網址，再點 Click to Start。
3. 在觸控操作提示選「開啟環境設定」，到「戰場」勾選「顯示取消目標選取按鈕視窗」，再按「確定」。

在戰場上用一根手指拖曳地圖即可移動視野。點一下部隊查看情報，再點同一部隊選取。
選擇攻擊、策略或道具的目標時，先點一下查看預測，再點同一目標確認。點別的目標會改為預覽該目標。
縮小圖仍可從戰場選單開啟。要調整遊戲畫面的大小，請使用環境設定的畫面倍率。

每次僅限一台遠端裝置遊玩，進度儲存在主機電腦。遊玩期間請保持電腦與程式開啟，結束前先在遠端保存。
遠端「結束遊戲」只結束連線，主機關閉區網伺服器後返回本機標題。

## 存檔與讀檔

預設與原版共用遊戲資料夾中的 `Sv00` 至 `Sv09` 存檔槽位。**覆寫前，請先備份要保留的原版存檔。**

每個槽位的以下檔案應一起保留：

```text
SvNNb.e5s
SvNNd.e5s
SvNNe.e5s
SvNNs.e5s
```

其中 `NN` 為槽位編號。正式存檔與一般槽位匯出的 ZIP 只使用這四個 `.e5s`
檔案，每次讀檔重新設定亂數種子。

支援的關卡與保存節點請參閱[歷版更新紀錄](https://github.com/kidwm/jiangwei-reload/blob/main/CHANGELOG.md)。

### 戰場自動存檔

環境設定中的「戰場自動存檔」預設開啟，可自行關閉。自動存檔使用獨立的 `SvAuto[bdes].e5s`
四檔，不覆寫十個編號存檔槽。

讀取列表有自動存檔時，會置頂顯示 **Auto**。原版不列出 `SvAuto`；要回原版續玩， 請先在 RELOAD 讀取
Auto，再手動另存編號槽位。

## 更新程式

先關閉程式，再替換：

- **macOS**：`JW_RELOAD.app`
- **Windows**：`JW_RELOAD.cmd` 與完整的 `JW_RELOAD` 程式資料夾
- **Linux**：完整的 `JW_RELOAD` 程式資料夾

請保留原版遊戲素材、編號存檔、完整的 `SvAuto` 檔案與存檔備份資料夾。

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

從「問題回報」匯出診斷 ZIP 時，系統需提供 `zenity` 或 `kdialog` 選檔工具。

若診斷資訊顯示不支援 MP3，請檢查 GStreamer 音訊外掛，並提供診斷報告。

## 問題回報

請在 [GitHub Issues](https://github.com/kidwm/jiangwei-reload/issues) 回報問題，附上 RELOAD
版本、作業系統版本、關卡／回合、重現步驟、預期與實際結果，以及必要的截圖。

1. 在關閉或重新載入程式前，從「說明」選單開啟「問題回報」（瀏覽器開發版沿「開發測試 →
   診斷資訊」），按「更新報告」及「複製診斷報告」，
   將完整文字提供給開發人員。錯誤視窗也有「複製診斷報告」。
2. 若無法自動複製，報告會被選取，請按 `Ctrl+C` 或 `⌘C` 手動複製。
3. 桌面回報窗讀取最後收到的診斷，不載入遊戲音訊；主畫面卡住時仍可嘗試開啟，但不保證能避開共享原生服務的阻塞。
   「匯出目前狀態 ZIP」可自行選擇檔名與位置，一起保存原版四檔及 `diagnostics.json`。
   主畫面無回應時匯出會取消，請另外提供正式存檔或 Auto。 開發版另可在「開發測試 →
   進度檔案」按「匯出目前狀態 ZIP」，方便重現目前整備、戰場或戰後進度。
   請先等待行動、交談或交易結束；匯出不會覆寫存檔槽位，戰後檔讀回會從必要戰後劇情起點重播。

如果程式卡住、無法開啟回報視窗，重新啟動後請立即複製診斷報告，報告可能包含前次執行留下的紀錄。
也可附上遊戲資料夾中 `.jwzr-diagnostics/last-session.json` 與 `last-stall.json`（若存在）。
前次執行紀錄只供緊接的下一次啟動取出，請避免連續重啟；疑似卡住紀錄不代表已確定原因。 macOS
若能在強制結束前操作「活動監視器」，可另保存遊戲主程序及其 WebContent／GPU 程序的取樣。

報告可能包含本機路徑，提供前可自行檢視。請將複製的報告文字與匯出的存檔 ZIP 附在問題回報中。
