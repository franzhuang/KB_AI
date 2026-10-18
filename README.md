# 司法AI工具交換所 (LexCraft)

> **法學智慧，為實務而生**  
> 由 **黃耀平律師** 建置，專為法官、檢察官、律師與法務專業人員打造的自製工具樞紐與實務交流平台。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-brightgreen)](https://franzhuang.github.io/KB_AI/)

---

## 🌟 平台特色

1. **極簡現代設計**：首頁以高質感亮色系法學象牙白為底，主體採用視覺置中偏上的智慧搜尋框，去除雜訊干擾。
2. **雙模搜尋演算法**：
   - **毫秒級即時搜尋**：鍵入即時比對（例如輸入「存證」立刻出現「存證信函」），同行評分最高的優質工具自動置頂。
   - **司法情境 AI 診斷**：針對案情與程序需求進行深度語意理解，推薦對應實務工具。
3. **實務自製小工具整合**：
   - **📄 存證信函自動排版器**：支援「主旨（選填）」二段式排版（`一、主旨：`、`二、說明：`），動態提供郵局專用 10×20 格擬真稿紙預覽與 ODT/PDF 匯出。
   - **🔒 個資去識別化沙盒**：瀏覽器端純前端本機演算法，快速遮蔽身分證字號、姓名、住址、車牌等敏感情資，附反向精準還原機制，零資料外流風險。
   - **⏱️ 訴訟程序時限管家**：法定期間、在途期間、不變期間自動倒數試算與日曆匯出。
   - **🖨️ PDF 騎縫章浮水印**：卷證防偽浮水印與跨頁騎縫章排版加蓋。
   - **🔍 卷證 OCR 萃取**：裁判書與掃描卷證文字快速辨識、段落重整與修復。
4. **社群與市集**：
   - 6 大實務分類（文書起草、卷證處理、時限程序、個資合規、研究檢索、綜合輔助）。
   - 線上評分與實務心得評論系統。
   - 司法交流室（分頻道聊天室）與重要規範公告欄。
5. **雙模部署架構**：
   - **GitHub Pages 純靜態展示**：支援無後端純前端離線展示（以 `static-store.js` 本地離線資料庫運行）。
   - **FastAPI 完整後端**：提供完整 RESTful API、動態 ODT 文件生成與持久化資料儲存。

---

## 📁 專案結構

```
.
├── index.html                     # 極簡首頁（雙模智慧搜尋框與分類導覽）
├── legal_letter.html              # 存證信函自動排版器（含主旨二段式、10×20 郵局稿紙預覽）
├── deid.html                      # 本地離線個資去識別化沙盒
├── events_reminder.html           # 訴訟程序時限管家
├── pdf_watermark.html             # PDF 騎縫章與防偽浮水印工具
├── legal_ocr.html                 # 卷證與裁判書 OCR 萃取工具
├── tools.html                     # 6 大分類 AI 工具市集與發布表單
├── chat.html                      # 司法實務交流室
├── bulletin.html                  # 司法公告欄與專業倫理守則
├── static-store.js                # GitHub Pages 純靜態展示核心（本地資料庫與搜尋引擎）
├── app.py                         # FastAPI 後端服務與 API
├── database.json                  # 工具、評分與分類持久化資料庫
├── fill_legal_letter_填入存證信函.py # 存證信函 ODT 生成核心模組
├── run.sh                         # 本地一鍵啟動腳本
├── static/                        # 靜態資源同步鏡像
└── README.md                      # 專案說明文件
```

---

## 🚀 快速啟動

### 方式 A：本地啟動（FastAPI 後端完整功能）

```bash
# 賦予執行權限並啟動伺服器
chmod +x run.sh
./run.sh
```

預設伺服器運行於 `http://localhost:8080`。

若需自訂連接埠：
```bash
PORT=8000 ./run.sh
```

### 方式 B：GitHub Pages 純靜態展示

1. 前往 GitHub Repository 設定：`Settings` -> `Pages`。
2. 在 **Branch** 選擇 `main`，資料夾選擇 `/ (root)`。
3. 儲存後即可直接透過 GitHub Pages 網址線上瀏覽與體驗全站功能。

---

## ⚖️ 專業倫理與免責聲明

本平台小工具為輔助性質，產出內容（如存證信函稿件、時效試算等）仍應由具執業資格之法律專業人員依個案實情審閱確認。本平台處理敏感資訊均優先採純本機端端演算法，恪遵律師法與當事人個人資料保護法之規範。

---

**建置者**：黃耀平律師  
**專案網址**：https://github.com/franzhuang/KB_AI
