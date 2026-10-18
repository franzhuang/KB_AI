#!/usr/bin/env bash
# LexCraft 司法智作啟動腳本
# 採用指定之 uv/web_crawler Python 虛擬環境

VENV_PYTHON="/home/pc/downloads/Tools/uv/web_crawler/.venv/bin/python"
VENV_UVICORN="/home/pc/downloads/Tools/uv/web_crawler/.venv/bin/uvicorn"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "錯誤: 找不到 Python 環境於 $VENV_PYTHON"
    exit 1
fi

PORT="${PORT:-8080}"
echo "=========================================="
echo "⚖️  LexCraft 司法智作 - 司法專業人士 AI 創作交流平台"
echo "🌐 伺服器啟動於: http://localhost:${PORT}"
echo "🐍 Python 環境: $VENV_PYTHON"
echo "=========================================="

exec "$VENV_UVICORN" app:app --host 0.0.0.0 --port "$PORT" --reload
