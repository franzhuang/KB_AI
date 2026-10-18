/**
 * LexCraft 司法AI工具交換所 - 純靜態展示版資料庫與演算法引擎 (GitHub Pages 專用)
 * 確保在無 Python/FastAPI 後端環境下，仍能 100% 擬真展示所有搜尋、分類、排序與工具互動
 */

const STATIC_DB = {
  categories: [
    {
      id: "doc-drafting",
      name: "文書撰擬與函件格式",
      icon: "file-text",
      desc: "存證信函、支付命令、起訴答辯狀等書狀自動排版與生成",
      count: 4
    },
    {
      id: "privacy-evidence",
      name: "案卷隱私與證據處置",
      icon: "shield-check",
      desc: "個資去識別化、卷證 OCR 識別提取、PDF 騎縫章與防偽浮水印",
      count: 5
    },
    {
      id: "timeline-schedule",
      name: "程序管轄與時限排程",
      icon: "clock",
      desc: "訴訟上訴在途期間、調查程序時限提醒、強制執行消滅時效警報",
      count: 3
    },
    {
      id: "case-research",
      name: "判決檢索與實務爭點",
      icon: "search",
      desc: "判決書 AI 主文與爭點萃取、同類量刑比對、民刑裁判要旨對照",
      count: 4
    },
    {
      id: "contract-review",
      name: "契約審查與法規遵循",
      icon: "check-circle",
      desc: "商務合約紅線風險標註、勞基法合規檢核、營業秘密條款審查",
      count: 3
    },
    {
      id: "cost-calc",
      name: "費用試算與執行工具",
      icon: "calculator",
      desc: "司法院裁判費級距即時試算、民法法定遲延利息精算、執行規費核算",
      count: 3
    }
  ],
  tools: [
    {
      id: "tool-legal-letter",
      name: "郵局存證信函標準排版生成器",
      category_id: "doc-drafting",
      category_name: "文書撰擬與函件格式",
      author: "黃耀平律師建置 (整合原生引擎)",
      author_title: "執業律師 / 開源貢獻者",
      description: "嚴格遵循中華郵政存證信函官方標準格式（每頁10行、每行20格、滿頁200字）。自動計算行格、切分分頁，支援主旨與說明二段式排版及標準 ODT/PDF 匯出。",
      tags: ["存證信函", "文書排版", "郵局規格", "ODT匯出", "PDF生成"],
      rating: 4.95,
      rating_count: 142,
      url: "legal_letter.html",
      is_integrated: true,
      created_at: "2026-10-15T10:00:00Z"
    },
    {
      id: "tool-deid",
      name: "案卷個資去識別化系統 (De-ID & Re-ID)",
      category_id: "privacy-evidence",
      category_name: "案卷隱私與證據處置",
      author: "隱私合規小組",
      author_title: "法學博士 / 科技法務長",
      description: "律師與法官專用機敏卷證遮蔽引擎。支援身分證字號、姓名、住址、車牌、金融帳號自動遮蔽與雙向對照還原代碼表，純本地運算確保當事人隱私。",
      tags: ["個資去識別化", "卷證遮蔽", "反向還原", "隱私合規", "離線隱私"],
      rating: 4.92,
      rating_count: 118,
      url: "deid.html",
      is_integrated: true,
      created_at: "2026-10-16T14:30:00Z"
    },
    {
      id: "tool-event-reminder",
      name: "職場調查與法律程序時限管家",
      category_id: "timeline-schedule",
      category_name: "程序管轄與時限排程",
      author: "勞資程序法務組",
      author_title: "勞動法專門律師",
      description: "精準控管法規調查程序時效、申訴處理期限、訴訟抗告日數。自動扣除例假日與在途期間，提供階段倒數計時與時效警示看板。",
      tags: ["時限管理", "程序法", "霸凌調查", "時效警報", "排程追蹤"],
      rating: 4.88,
      rating_count: 96,
      url: "events_reminder.html",
      is_integrated: true,
      created_at: "2026-10-16T18:00:00Z"
    },
    {
      id: "tool-pdf-watermark",
      name: "卷證 PDF 騎縫章與防偽浮水印添加器",
      category_id: "privacy-evidence",
      category_name: "案卷隱私與證據處置",
      author: "陳冠宇 律師",
      author_title: "冠宇法律事務所 所長",
      description: "提供律師事務所整卷專用 PDF 批次加蓋數位騎縫章、事務所浮水印、機密閱卷標記與頁碼編排，防止當事人或對造未授權複印外流。",
      tags: ["PDF加浮水印", "騎縫章", "卷證防偽", "浮水印", "律師閱卷"],
      rating: 4.85,
      rating_count: 87,
      url: "pdf_watermark.html",
      is_integrated: true,
      created_at: "2026-10-17T09:15:00Z"
    },
    {
      id: "tool-legal-ocr",
      name: "裁判書與訴訟證據手寫 OCR 智能萃取",
      category_id: "privacy-evidence",
      category_name: "案卷隱私與證據處置",
      author: "張法官 (技術研究)",
      author_title: "地方法院法官 / AI裁判研究",
      description: "針對模糊裁判掃描檔、早期手寫借據、當事人 Line 截圖對話進行光學字元辨識 (OCR)，支援表格還原與段落智能排版修正。",
      tags: ["ocr", "文字辨識", "借據手寫", "Line對話整理", "掃描檔提取"],
      rating: 4.82,
      rating_count: 75,
      url: "legal_ocr.html",
      is_integrated: true,
      created_at: "2026-10-17T11:20:00Z"
    },
    {
      id: "tool-court-fee-calc",
      name: "民事訴訟裁判費與執行費即時試算器",
      category_id: "cost-calc",
      category_name: "費用試算與執行工具",
      author: "蔡明哲 律師",
      author_title: "金融訴訟特聘律師",
      description: "依民事訴訟法第77條之13及司法院最新級距標準，精確計算第一審、第二審、第三審上訴裁判費及強制執行聲請費用，自動產出繳款分析單。",
      tags: ["裁判費計算", "訴訟規費", "執行費", "利息試算", "司法院標準"],
      rating: 4.79,
      rating_count: 64,
      url: "fee_calc.html",
      is_integrated: true,
      created_at: "2026-10-17T16:00:00Z"
    },
    {
      id: "tool-judgment-extractor",
      name: "判決書爭點萃取與判決主文結構化 AI",
      category_id: "case-research",
      category_name: "判決檢索與實務爭點",
      author: "法學數據實驗室",
      author_title: "司法科技研發小組",
      description: "上傳長篇判決書（數萬字），秒速提煉：原告主張、被告答辯、法院心證判斷要旨、核心爭點與法律依據，支援一鍵輸出心智圖格式。",
      tags: ["判決爭點", "主文摘要", "法學研究", "裁判比對", "心證分析"],
      rating: 4.76,
      rating_count: 59,
      url: "judgment_extractor.html",
      is_integrated: true,
      created_at: "2026-10-18T08:00:00Z"
    },
    {
      id: "tool-contract-redline",
      name: "商務合約紅線風險與霸王條款審查 AI",
      category_id: "contract-review",
      category_name: "契約審查與法規遵循",
      author: "全球跨國法務組",
      author_title: "資深國際企業法務長",
      description: "針對買賣、委任、承攬、股權轉讓合約自動進行紅線標註（Redline），標出違約金過高、管轄約定不利、不可抗力條款陷阱。",
      tags: ["合約審查", "紅線比對", "風險評估", "霸王條款", "履約爭議"],
      rating: 4.73,
      rating_count: 52,
      url: "contract_redline.html",
      is_integrated: true,
      created_at: "2026-10-18T10:30:00Z"
    }
  ],
  reviews: {
    "tool-legal-letter": [
      {
        id: "r-1",
        author: "黃律師 (台北律師公會)",
        rating: 5,
        content: "完全命中郵局每頁200字的規格！以前用 Word 排版存證信函常常在換頁處字數爆掉，這個小工具直接幫我精算行格，輸出 ODT 格式非常精準，太實用了！",
        created_at: "2026-10-16T11:20:00Z"
      },
      {
        id: "r-2",
        author: "郭法務長",
        rating: 5,
        content: "內建的主旨與說明二段式組織非常細膩，公司催款跟終止租約函件現在都用這套處理，節省大量行政助理時間。",
        created_at: "2026-10-17T15:10:00Z"
      }
    ],
    "tool-deid": [
      {
        id: "r-3",
        author: "李律師 (刑事法專委)",
        rating: 5,
        content: "純前端本地運算最符合律師倫理規範，完全不必擔心把卷證上傳到未知伺服器。而且還能反向還原代碼表，非常強大！",
        created_at: "2026-10-17T09:40:00Z"
      }
    ]
  },
  announcements: [
    {
      id: "ann-1",
      title: "【官方公告】司法AI工具交換所正式上線：由黃耀平律師建置",
      date: "2026-10-18",
      tag: "平台發布",
      important: true,
      content: "本平台專為律師、法官、法務等司法界同仁打造，提供存證信函排版、卷證去識別化、程序時限控管等自製工具，支援即時檢索與同儕互評。"
    },
    {
      id: "ann-2",
      title: "【實務指引】生成式 AI 使用指引與當事人個資保護要點宣導",
      date: "2026-10-15",
      tag: "倫理指引",
      important: false,
      content: "提醒會員使用各類 AI 輔助文書處理時，強烈建議搭配本平台內建之「個資去識別化系統 (De-ID)」，確保當事人身分證號、病歷與金融隱私不致外洩。"
    }
  ],
  messages: [
    {
      id: "msg-1",
      author: "黃耀平律師 (建置者)",
      badge: "執業律師",
      channel: "general",
      content: "歡迎各位司法先進蒞臨！本平台展示各類司法實務專用小工具，歡迎同行交流與指教！",
      time: "14:20"
    },
    {
      id: "msg-2",
      author: "張法官",
      badge: "司法官",
      channel: "prompts",
      content: "在起草裁判或書狀時，結合實務要旨庫的 Few-Shot Prompt 效果非常好。",
      time: "15:05"
    }
  ]
};

// 本地即時搜尋演算法 (純前端執行)
function staticSearch(query, mode = "fast") {
  const q = (query || "").trim().toLowerCase();
  if (!q) return { query: "", mode, results: [], ai_insight: null, count: 0 };

  const tools = [...STATIC_DB.tools];

  if (mode === "fast") {
    const scored = [];
    for (const t of tools) {
      let score = 0;
      let reason = "";
      const name = t.name.toLowerCase();
      const desc = t.description.toLowerCase();
      const cat = t.category_name.toLowerCase();
      const tags = t.tags.map(x => x.toLowerCase());

      if (name.startsWith(q)) {
        score += 100;
        reason = "名稱前綴匹配";
      } else if (name.includes(q)) {
        score += 80;
        reason = "名稱包含關鍵字";
      }

      for (const tag of tags) {
        if (tag === q) {
          score += 90;
          reason = `標籤 #${tag}`;
          break;
        } else if (tag.includes(q)) {
          score += 60;
          reason = `標籤匹配 #${tag}`;
          break;
        }
      }

      if (cat.includes(q)) score += 40;
      if (desc.includes(q)) score += 30;

      // 司法同義詞加權
      const legalSynonyms = {
        "存證": ["tool-legal-letter", "存證信函"],
        "去識別": ["tool-deid", "個資去識別化"],
        "個資": ["tool-deid", "個資去識別化"],
        "時限": ["tool-event-reminder", "程序時限"],
        "期限": ["tool-event-reminder", "程序時限"],
        "浮水印": ["tool-pdf-watermark", "浮水印與騎縫章"],
        "ocr": ["tool-legal-ocr", "OCR文字辨識"],
        "裁判費": ["tool-court-fee-calc", "裁判費試算"]
      };

      for (const [key, val] of Object.entries(legalSynonyms)) {
        if (q.includes(key) && (t.id === val[0] || t.name.includes(val[1]))) {
          score += 95;
          reason = `司法詞意對應 (${key} ➔ ${val[1]})`;
        }
      }

      if (score > 0) {
        const finalScore = score + (t.rating * 5);
        scored.push({ tool: t, score: finalScore, match_reason: reason });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const results = scored.map(x => x.tool);
    return { query, mode: "fast", results, ai_insight: null, count: results.length };
  } else {
    // AI 語意情境推論
    let insight = null;
    let matchedIds = [];
    if (q.includes("存證") || q.includes("催告") || q.includes("還錢") || q.includes("本票") || q.includes("租約")) {
      matchedIds.push("tool-legal-letter");
      insight = "偵測到您的需求為「實體法上意思表示或時效中斷之正式催告」。推薦使用【郵局存證信函標準排版生成器】，精準遵循郵局200字規格並支援主旨二段式組織。";
    } else if (q.includes("個資") || q.includes("遮蔽") || q.includes("身分證") || q.includes("去識別")) {
      matchedIds.push("tool-deid");
      insight = "偵測到您的需求為「案卷機敏個資保護」。推薦使用【案卷個資去識別化系統】，純前端離線運算，杜絕個資外洩爭議。";
    } else if (q.includes("時限") || q.includes("天數") || q.includes("期限") || q.includes("在途")) {
      matchedIds.push("tool-event-reminder");
      insight = "偵測到您的需求為「程序法上法定期間控管與調查時限追蹤」。推薦使用【職場調查與法律程序時限管家】。";
    } else if (q.includes("浮水印") || q.includes("騎縫") || q.includes("防偽")) {
      matchedIds.push("tool-pdf-watermark");
      insight = "偵測到您的需求為「卷證與機密文件防拷與閱卷防偽」。推薦使用【卷證 PDF 騎縫章與防偽浮水印添加器】。";
    } else if (q.includes("ocr") || q.includes("辨識") || q.includes("借據") || q.includes("截圖")) {
      matchedIds.push("tool-legal-ocr");
      insight = "偵測到您的需求為「訴訟書證或裁判掃描檔文字化」。推薦使用【裁判書與訴訟證據手寫 OCR 智能萃取】。";
    }

    let topTools = tools.filter(t => matchedIds.includes(t.id));
    let others = tools.filter(t => !matchedIds.includes(t.id) && (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    ));

    let allResults = [...topTools, ...others];
    if (allResults.length === 0) {
      allResults = [...tools].sort((a, b) => b.rating - a.rating).slice(0, 4);
      insight = `司法 AI 助理已為您分析查詢「${query}」，並為您推薦司法界同儕評分最高之精選專用工具。`;
    }

    return { query, mode: "ai", results: allResults, ai_insight: insight, count: allResults.length };
  }
}
