#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LexCraft 司法智作 - 司法專業人士 AI 創作與小工具交流平台
後端核心程式 (FastAPI + 異步支援)
"""

import os
import sys
import json
import base64
import zlib
import io
import time
import uuid
import tempfile
import subprocess
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Request, HTTPException, Form, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# 匯入同目錄下的存證信函模組
import fill_legal_letter_填入存證信函 as fl

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "database.json")
DE_ID_WEB_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "de-ID", "de-ID-web"))
EVENT_REMINDER_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "events_reminder"))

app = FastAPI(title="LexCraft 司法智作", version="2.0.0")

# 確保靜態目錄存在
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# 掛載 de-ID-web 的靜態資源（若存在）
if os.path.exists(DE_ID_WEB_DIR):
    app.mount("/deid-static", StaticFiles(directory=DE_ID_WEB_DIR), name="deid-static")

# 讀寫資料庫輔助函式
def load_db() -> Dict[str, Any]:
    if not os.path.exists(DB_FILE):
        return {"categories": [], "tools": [], "reviews": {}, "messages": [], "announcements": []}
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(data: Dict[str, Any]):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ================= 数据模型 =================
class ReviewCreate(BaseModel):
    author: str = Field(..., min_length=1)
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=2)

class ToolCreate(BaseModel):
    name: str = Field(..., min_length=2)
    category_id: str
    author: str = Field(..., min_length=2)
    author_title: Optional[str] = "執業律師"
    description: str = Field(..., min_length=10)
    tags: List[str] = []
    url: Optional[str] = ""
    tool_type: Optional[str] = "web" # web, prompt, python, link
    code_or_prompt: Optional[str] = ""

class MessageCreate(BaseModel):
    author: str = Field(..., min_length=1)
    channel: str = "general"
    content: str = Field(..., min_length=1)
    badge: Optional[str] = "認證律師"

class LegalLetterRequest(BaseModel):
    sender_name: str
    sender_addr: str
    recipient_name: str
    recipient_addr: str
    copy_recipient_name: Optional[str] = ""
    copy_recipient_addr: Optional[str] = ""
    subject: Optional[str] = ""  # 選填主旨：若有填則格式化為 一、主旨： 二、說明：
    content: str
    font_size: Optional[float] = 16.0
    output_format: Optional[str] = "odt" # odt or pdf
    keep_blank_pages: Optional[bool] = False

# ================= API 路由 =================

@app.get("/api/categories")
async def get_categories():
    db = load_db()
    # 即時計算每個分類工具數量
    counts = {}
    for t in db.get("tools", []):
        cat_id = t.get("category_id")
        counts[cat_id] = counts.get(cat_id, 0) + 1
    
    cats = db.get("categories", [])
    for c in cats:
        c["count"] = counts.get(c["id"], 0)
    return cats

@app.get("/api/tools")
async def get_tools(category: Optional[str] = None, sort: Optional[str] = "rating", query: Optional[str] = None):
    db = load_db()
    tools = db.get("tools", [])

    if category:
        tools = [t for t in tools if t.get("category_id") == category]

    if query:
        q = query.lower().strip()
        tools = [
            t for t in tools if (
                q in t.get("name", "").lower() or
                q in t.get("description", "").lower() or
                any(q in tag.lower() for tag in t.get("tags", [])) or
                q in t.get("category_name", "").lower()
            )
        ]

    # 排序：預設分數最高的放上面
    if sort == "rating":
        tools.sort(key=lambda x: (x.get("rating", 0), x.get("rating_count", 0)), reverse=True)
    elif sort == "newest":
        tools.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    elif sort == "hot":
        tools.sort(key=lambda x: x.get("rating_count", 0), reverse=True)

    return tools

@app.get("/api/tools/{tool_id}")
async def get_tool_detail(tool_id: str):
    db = load_db()
    tools = [t for t in db.get("tools", []) if t.get("id") == tool_id]
    if not tools:
        raise HTTPException(status_code=404, detail="工具不存在")
    tool = tools[0]
    reviews = db.get("reviews", {}).get(tool_id, [])
    return {"tool": tool, "reviews": reviews}

@app.post("/api/tools")
async def create_tool(payload: ToolCreate):
    db = load_db()
    cat_map = {c["id"]: c["name"] for c in db.get("categories", [])}
    if payload.category_id not in cat_map:
        raise HTTPException(status_code=400, detail="所選分類不存在")

    new_id = f"tool-{uuid.uuid4().hex[:8]}"
    tool_url = payload.url.strip() if payload.url else f"/tools/custom/{new_id}"
    
    new_tool = {
        "id": new_id,
        "name": payload.name.strip(),
        "category_id": payload.category_id,
        "category_name": cat_map[payload.category_id],
        "author": payload.author.strip(),
        "author_title": payload.author_title.strip() if payload.author_title else "認證律師",
        "description": payload.description.strip(),
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "rating": 5.0,  # 初始自評
        "rating_count": 1,
        "url": tool_url,
        "is_integrated": False,
        "tool_type": payload.tool_type,
        "code_or_prompt": payload.code_or_prompt,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    db.setdefault("tools", []).insert(0, new_tool)
    # 初始化評價
    db.setdefault("reviews", {})[new_id] = [
        {
            "id": f"r-{uuid.uuid4().hex[:6]}",
            "author": payload.author,
            "rating": 5,
            "content": "作者自發發布！歡迎全台司法同儕測試與交流指導。",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
    ]
    save_db(db)
    return new_tool

@app.post("/api/tools/{tool_id}/review")
async def add_tool_review(tool_id: str, payload: ReviewCreate):
    db = load_db()
    tools = [t for t in db.get("tools", []) if t.get("id") == tool_id]
    if not tools:
        raise HTTPException(status_code=404, detail="工具不存在")
    tool = tools[0]

    reviews = db.setdefault("reviews", {}).setdefault(tool_id, [])
    new_rev = {
        "id": f"r-{uuid.uuid4().hex[:6]}",
        "author": payload.author.strip(),
        "rating": payload.rating,
        "content": payload.content.strip(),
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    reviews.insert(0, new_rev)

    # 重新精算平均分
    total_stars = sum(r["rating"] for r in reviews)
    count = len(reviews)
    new_rating = round(total_stars / count, 2)
    tool["rating"] = new_rating
    tool["rating_count"] = count

    save_db(db)
    return {"status": "success", "rating": new_rating, "rating_count": count, "reviews": reviews}

# ================= AI 與即時高超搜尋 API =================
@app.get("/api/search")
async def search_endpoint(q: str = "", mode: str = "fast"):
    """
    雙模搜尋演算法：
    - fast: 高速前綴、拼音、模糊、標籤加權演算法，毫秒級即時下拉反饋
    - ai: 司法語意與意圖推論分析
    """
    db = load_db()
    tools = db.get("tools", [])
    query = q.strip()
    if not query:
        return {"query": "", "mode": mode, "results": [], "ai_insight": None}

    q_lower = query.lower()

    if mode == "fast":
        # 高超即時演算法評分
        scored = []
        for t in tools:
            name = t.get("name", "").lower()
            desc = t.get("description", "").lower()
            tags = [tag.lower() for tag in t.get("tags", [])]
            cat = t.get("category_name", "").lower()

            score = 0
            match_type = ""

            # 1. 完全或前綴命中名稱
            if name.startswith(q_lower):
                score += 100
                match_type = "名稱前綴完全匹配"
            elif q_lower in name:
                score += 80
                match_type = "名稱包含關鍵字"
            
            # 2. 標籤命中
            for tag in tags:
                if q_lower == tag:
                    score += 90
                    match_type = f"核心標籤 #{tag}"
                    break
                elif q_lower in tag:
                    score += 60
                    match_type = f"標籤匹配 #{tag}"
                    break

            # 3. 類別命中
            if q_lower in cat:
                score += 40
                if not match_type: match_type = f"分類「{t.get('category_name')}」"

            # 4. 描述命中
            if q_lower in desc:
                score += 30
                if not match_type: match_type = "功能描述相符"

            # 司法關鍵字特殊對照補正（例如輸入「存證」直出存證信函；輸入「脫敏」或「個資」直出去識別化）
            synonyms = {
                "存證": ["存證信函", "tool-legal-letter"],
                "存信": ["存證信函", "tool-legal-letter"],
                "郵局": ["存證信函", "tool-legal-letter"],
                "去識別": ["個資去識別化", "tool-deid"],
                "脫敏": ["個資去識別化", "tool-deid"],
                "個資": ["個資去識別化", "tool-deid"],
                "遮蔽": ["個資去識別化", "tool-deid"],
                "時限": ["職場調查與法律程序時限管家", "tool-event-reminder"],
                "期限": ["職場調查與法律程序時限管家", "tool-event-reminder"],
                "時效": ["職場調查與法律程序時限管家", "tool-event-reminder"],
                "霸凌": ["職場調查與法律程序時限管家", "tool-event-reminder"],
                "浮水印": ["卷證 PDF 騎縫章與防偽浮水印添加器", "tool-pdf-watermark"],
                "騎縫": ["卷證 PDF 騎縫章與防偽浮水印添加器", "tool-pdf-watermark"],
                "ocr": ["裁判書與訴訟證據手寫 OCR 智能萃取", "tool-legal-ocr"],
                "辨識": ["裁判書與訴訟證據手寫 OCR 智能萃取", "tool-legal-ocr"],
                "掃描": ["裁判書與訴訟證據手寫 OCR 智能萃取", "tool-legal-ocr"],
                "裁判費": ["民事訴訟裁判費與執行費即時試算器", "tool-court-fee-calc"],
                "訴訟費": ["民事訴訟裁判費與執行費即時試算器", "tool-court-fee-calc"],
                "執行費": ["民事訴訟裁判費與執行費即時試算器", "tool-court-fee-calc"],
                "爭點": ["判決書爭點萃取與判決主文結構化 AI", "tool-judgment-extractor"],
                "合約": ["商務合約紅線風險與霸王條款審查 AI", "tool-contract-redline"],
                "審約": ["商務合約紅線風險與霸王條款審查 AI", "tool-contract-redline"],
            }

            for key, val in synonyms.items():
                if key in q_lower and (t["id"] == val[1] or val[0] in t["name"]):
                    score += 95
                    match_type = f"精準司法詞意對應 ({key} ➔ {val[0]})"

            if score > 0:
                # 結合評分權重（分數高排名更靠前）
                final_score = score + (t.get("rating", 0) * 5)
                scored.append({
                    "tool": t,
                    "score": final_score,
                    "match_reason": match_type
                })

        # 排序：分數最高最前面
        scored.sort(key=lambda x: x["score"], reverse=True)
        results = [item["tool"] for item in scored]
        return {
            "query": query,
            "mode": "fast",
            "results": results,
            "ai_insight": None,
            "count": len(results)
        }

    else:
        # AI 語意搜尋與司法情境分析
        # 解析意圖並給予專業司法建議
        intent_map = [
            {
                "keywords": ["催告", "還錢", "欠錢", "本票", "終止租約", "違約通知", "存證", "發信", "履約"],
                "tool_id": "tool-legal-letter",
                "insight": "偵測到您的需求為「實體法上意思表示或時效中斷之正式催告」。建議使用【郵局存證信函標準排版生成器】，精準遵循郵局官方200字規格排版並留存法定發信憑證。"
            },
            {
                "keywords": ["個資", "遮蔽", "保護", "當事人", "身分證", "住址", "去識別", "隱私", "閱卷", "外洩", "馬賽克"],
                "tool_id": "tool-deid",
                "insight": "偵測到您的需求為「司法訴訟卷宗或裁判草稿個資合規保護」。推薦使用【案卷個資去識別化系統】，本地離線處理，杜絕個資法爭議並保留雙向代碼還原表。"
            },
            {
                "keywords": ["天數", "期限", "時效", "調查", "申訴", "霸凌", "在途期間", "上訴抗告", "排程"],
                "tool_id": "tool-event-reminder",
                "insight": "偵測到您的需求為「程序法上法定期間控管與調查時限追蹤」。推薦使用【職場調查與法律程序時限管家】，防止逾越法定救濟或調查期限。"
            },
            {
                "keywords": ["浮水印", "騎縫章", "防偽", "印章", "複印", "蓋章", "掃描防盜"],
                "tool_id": "tool-pdf-watermark",
                "insight": "偵測到您的需求為「卷證與機密文件防拷與防外洩處置」。推薦使用【卷證 PDF 騎縫章與防偽浮水印添加器】，保障事務所閱卷版權。"
            },
            {
                "keywords": ["辨識", "圖片文字", "手寫", "借條", "截圖", "ocr", "打字", "轉文字"],
                "tool_id": "tool-legal-ocr",
                "insight": "偵測到您的需求為「實體訴訟證據、古老裁判或對話截圖文字化」。推薦使用【裁判書與訴訟證據手寫 OCR 智能萃取】。"
            },
            {
                "keywords": ["裁判費", "多少錢", "規費", "上訴費", "執行費", "利息", "年息"],
                "tool_id": "tool-court-fee-calc",
                "insight": "偵測到您的需求為「訴訟費用標的核算與司法規費試算」。推薦使用【民事訴訟裁判費與執行費即時試算器】。"
            },
            {
                "keywords": ["爭點", "裁判要旨", "判決分析", "心證", "同案判決"],
                "tool_id": "tool-judgment-extractor",
                "insight": "偵測到您的需求為「實務裁判心證結構化研析」。推薦使用【判決書爭點萃取與判決主文結構化 AI】。"
            },
            {
                "keywords": ["合約", "條款", "陷阱", "違約金", "管轄權", "審約"],
                "tool_id": "tool-contract-redline",
                "insight": "偵測到您的需求為「商務合約紅線風險與不利條款審查」。推薦使用【商務合約紅線風險與霸王條款審查 AI】。"
            }
        ]

        matched_tool_ids = []
        ai_insight = None

        for item in intent_map:
            if any(k in q_lower for k in item["keywords"]):
                matched_tool_ids.append(item["tool_id"])
                if not ai_insight:
                    ai_insight = item["insight"]

        # 整理推薦結果
        top_tools = [t for t in tools if t["id"] in matched_tool_ids]
        other_tools = [t for t in tools if t["id"] not in matched_tool_ids and (
            q_lower in t.get("name", "").lower() or
            q_lower in t.get("description", "").lower() or
            any(q_lower in tag.lower() for tag in t.get("tags", []))
        )]

        all_results = top_tools + other_tools
        # 如果還是沒有，按最高評分推薦熱門司法工具
        if not all_results:
            all_results = sorted(tools, key=lambda x: x.get("rating", 0), reverse=True)[:4]
            ai_insight = f"司法 AI 助理已為您深度理解查詢「{query}」，並為您推薦司法界同儕評分最高的精選專用工具。"
        elif not ai_insight:
            ai_insight = f"司法 AI 助理分析：「{query}」涉及專業法律作業流程，已依據法律實務效度與評分加權排序最佳工具。"

        return {
            "query": query,
            "mode": "ai",
            "results": all_results,
            "ai_insight": ai_insight,
            "count": len(all_results)
        }

# ================= 聊天室與公告 API =================
@app.get("/api/chat/messages")
async def get_messages(channel: str = "general"):
    db = load_db()
    msgs = db.get("messages", [])
    if channel != "all":
        msgs = [m for m in msgs if m.get("channel", "general") == channel]
    return msgs

@app.post("/api/chat/messages")
async def send_message(payload: MessageCreate):
    db = load_db()
    new_msg = {
        "id": f"msg-{uuid.uuid4().hex[:6]}",
        "author": payload.author.strip(),
        "badge": payload.badge or "認證律師",
        "channel": payload.channel,
        "content": payload.content.strip(),
        "time": datetime.now().strftime("%H:%M")
    }
    db.setdefault("messages", []).append(new_msg)
    save_db(db)
    return new_msg

@app.get("/api/announcements")
async def get_announcements():
    db = load_db()
    return db.get("announcements", [])

# ================= 存證信函生成 API =================
@app.post("/api/legal-letter/generate")
async def generate_legal_letter(req: LegalLetterRequest):
    """
    調用現有的 fill_legal_letter_填入存證信函.py 引擎生成 ODT 或 PDF
    """
    try:
        # 解碼內建 ODT 範本
        raw_b64 = fl.EMBEDDED_ODT_TEMPLATE_B64.strip()
        compressed_bytes = base64.b64decode(raw_b64)
        template_bytes = zlib.decompress(compressed_bytes)

        # 整理內文段落：若有主旨則依標準組織「一、主旨：」「二、說明：」
        paragraphs = []
        if req.subject and req.subject.strip():
            paragraphs.append(f"一、主旨：{req.subject.strip()}")
            paragraphs.append("二、說明：")
            for p in req.content.split("\n"):
                p_clean = p.strip()
                if p_clean:
                    paragraphs.append(p_clean)
        else:
            paragraphs = [p for p in req.content.split("\n") if p.strip()]

        data = {
            "sender_name": req.sender_name.strip(),
            "sender_addr": req.sender_addr.strip(),
            "recipient_name": req.recipient_name.strip(),
            "recipient_addr": req.recipient_addr.strip(),
            "copy_recipient_name": req.copy_recipient_name.strip() if req.copy_recipient_name else "",
            "copy_recipient_addr": req.copy_recipient_addr.strip() if req.copy_recipient_addr else "",
            "paragraphs": paragraphs
        }

        # 建立暫存檔
        tmp_dir = tempfile.mkdtemp(prefix="legal_letter_")
        odt_out = os.path.join(tmp_dir, "存證信函.odt")

        fl.fill_odt(
            template_bytes=template_bytes,
            output_path=odt_out,
            data=data,
            keep_blank_pages=req.keep_blank_pages,
            font_size=req.font_size
        )

        if req.output_format.lower() == "pdf":
            pdf_path = fl.convert_to_pdf(odt_out, tmp_dir)
            if pdf_path and os.path.exists(pdf_path):
                return FileResponse(
                    pdf_path,
                    media_type="application/pdf",
                    filename="存證信函.pdf"
                )
            else:
                # 若無 libreoffice，退回提供 ODT 並提示
                return FileResponse(
                    odt_out,
                    media_type="application/vnd.oasis.opendocument.text",
                    filename="存證信函.odt"
                )

        return FileResponse(
            odt_out,
            media_type="application/vnd.oasis.opendocument.text",
            filename="存證信函.odt"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"存證信函生成失敗: {str(e)}")

# ================= 網頁頁面路由 (HTML) =================

def get_template(filename: str) -> str:
    path = os.path.join(STATIC_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@app.get("/", response_class=HTMLResponse)
@app.get("/index.html", response_class=HTMLResponse)
async def page_index():
    return HTMLResponse(content=get_template("index.html"))

@app.get("/tools", response_class=HTMLResponse)
@app.get("/tools.html", response_class=HTMLResponse)
async def page_tools():
    return HTMLResponse(content=get_template("tools.html"))

@app.get("/tools/legal-letter", response_class=HTMLResponse)
@app.get("/legal_letter.html", response_class=HTMLResponse)
async def page_legal_letter():
    return HTMLResponse(content=get_template("legal_letter.html"))

@app.get("/tools/de-id", response_class=HTMLResponse)
@app.get("/deid.html", response_class=HTMLResponse)
async def page_deid():
    return HTMLResponse(content=get_template("deid.html"))

@app.get("/tools/event-reminder", response_class=HTMLResponse)
@app.get("/events_reminder.html", response_class=HTMLResponse)
async def page_event_reminder():
    return HTMLResponse(content=get_template("events_reminder.html"))

@app.get("/tools/pdf-watermark", response_class=HTMLResponse)
@app.get("/pdf_watermark.html", response_class=HTMLResponse)
async def page_pdf_watermark():
    return HTMLResponse(content=get_template("pdf_watermark.html"))

@app.get("/tools/legal-ocr", response_class=HTMLResponse)
@app.get("/legal_ocr.html", response_class=HTMLResponse)
async def page_legal_ocr():
    return HTMLResponse(content=get_template("legal_ocr.html"))

@app.get("/chat", response_class=HTMLResponse)
@app.get("/chat.html", response_class=HTMLResponse)
async def page_chat():
    return HTMLResponse(content=get_template("chat.html"))

@app.get("/bulletin", response_class=HTMLResponse)
@app.get("/bulletin.html", response_class=HTMLResponse)
async def page_bulletin():
    return HTMLResponse(content=get_template("bulletin.html"))

# 嵌入 de-ID 與 events-reminder 原始 iframe 的代理路徑
@app.get("/embed/de-id", response_class=HTMLResponse)
async def embed_deid():
    index_path = os.path.join(DE_ID_WEB_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            html = f.read()
        # 替換靜態資源路徑讓其正常運作
        html = html.replace('href="css/', 'href="/deid-static/css/')
        html = html.replace('src="js/', 'src="/deid-static/js/')
        return HTMLResponse(content=html)
    return HTMLResponse(content="<h3>de-ID-web 目錄未找到</h3>")

@app.get("/embed/event-reminder", response_class=HTMLResponse)
async def embed_event_reminder():
    index_path = os.path.join(EVENT_REMINDER_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h3>events_reminder 目錄未找到</h3>")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
