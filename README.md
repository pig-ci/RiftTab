# Rift Tab · 極簡專注頁面

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Vanilla JS](https://img.shields.io/badge/Made%20with-Vanilla%20JS-blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> 一個乾淨、專注、帶有白噪音與番茄鐘的極簡專注頁面。

---

## 功能特點

- **即時時鐘** – 顯示當前時間與日期（自動更新）
- **智慧番茄鐘**  
  - 專注 25 分鐘 / 休息 5 分鐘（循環）  
  - 點擊計時器開始／暫停，雙擊重置  
  - 時間與模式自動儲存於 `localStorage`，重新整理不遺失  
  - 完成時播放提示音
- **查字區（芫荽字體）**  
  - 輸入中文字（最多 4 字），按下 `Enter` 以大號字體顯示  
  - 點擊大字即可重新編輯  
  - 文字自動儲存，刷新頁面後保留
- **白噪音**  
  - 低通濾波白噪音，有助於專注  
  - 可調節音量（滑桿）  
  - 按鈕顯示 `WHITE NOISE` / `STOP NOISE` 狀態
- **極簡暗色主題** – 低對比度、低飽和度設計，減少視覺干擾
- **本地儲存** – 所有設定（番茄鐘進度、查字內容、音量）自動保存在瀏覽器中

---

## 技術細節

- **純原生 JavaScript** – 無第三方框架或函式庫
- **CSS 變數** – 便於自訂主題色彩
- **Web Audio API** – 產生白噪音與提示音
- **localStorage 封裝** – 安全的資料持久化（含 `try-catch` 保護）
- **Google Fonts** – 使用「Iansui」芫荽字體（僅中文）

---

## 自訂設定

### 修改番茄鐘時長
在 `script.js` 中調整以下變數：
```javascript
// 專注與休息時間（單位：秒）
const FOCUS_TIME = 25 * 60;   // 25 分鐘
const BREAK_TIME = 5 * 60;    // 5 分鐘
```

### 調整白噪音音質
修改 `filter.frequency.value`（目前為 800 Hz）：
```javascript
filter.frequency.value = 800; // 提高則更明亮，降低則更低沉
```

### 自訂主題色
在 `style.css` 的 `:root` 中修改：
```css
--bg-color: #001;       /* 背景色 */
--text-color: #fff;     /* 主要文字 */
--muted-color: #666;    /* 次要文字 */
--accent-color: #0070f3;/* 強調色（目前未使用） */
```

---

## 未來可能擴充

- [ ] 自訂番茄鐘時長（設定面板）
- [ ] 多種白噪音類型（粉紅噪音、布朗噪音）
- [ ] 待辦清單整合
- [ ] 鍵盤快捷鍵提示

---

## 貢獻

歡迎提出 Issue 或 Pull Request！  
請確保程式碼風格一致，並測試基本功能不受影響。

---

## 授權

本專案採用 [MIT 授權條款](./LICENSE)。

---

## 感謝

- [Iansui 字體](https://fonts.google.com/noto/specimen/Noto+Sans+TC) – 由 Google Fonts 提供
- 靈感來自各種極簡儀表板與 New Tab 擴充功能
