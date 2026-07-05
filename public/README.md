# 系統自訂 Logo 上傳指引 (Custom Logo Guide)

您可以在此資料夾上傳您的自訂 Logo，以替換網頁左上角的預設圖示。

### 使用步驟：
1. 將您的 Logo 圖片（推薦使用正方形或圓形，去背的 PNG 格式最佳）命名為 `logo.png`。
2. 上傳或移動至此 `public/` 資料夾中（路徑為 `public/logo.png`）。
3. 重新整理網頁後，系統即會自動載入您的自訂 Logo！

---

### 常見問答 (FAQ)：
* **若沒有上傳 `logo.png` 會怎樣？**
  系統已建立安全的 fallback 機制，若找不到自訂 Logo，會自動且無縫地顯示預設的急診動態心率圖示（Activity Pulse Icon）。
* **支援其他格式嗎？**
  請儘量使用命名為 `logo.png` 的檔案。若需要變更為其他檔名或格式，可以在 `src/components/Navbar.tsx` 中修改圖片的 `src` 屬性。
