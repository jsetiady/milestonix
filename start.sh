#!/bin/bash
# Quick-start script for QA Timeline Dashboard

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> QA Timeline Dashboard"
echo ""

# Backend
if [ ! -d ".venv" ]; then
  echo "[1/4] Creating Python virtual environment..."
  python3 -m venv .venv
fi

echo "[2/4] Installing backend dependencies..."
source .venv/bin/activate
pip install -q -r backend/requirements.txt

echo "[3/4] Starting backend (port 8000)..."
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "      Backend PID: $BACKEND_PID"

# Frontend
echo "[4/4] Starting frontend (port 5173)..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "      Installing Node dependencies (first run)..."
  npm install
fi
npm run dev &
FRONTEND_PID=$!
echo "      Frontend PID: $FRONTEND_PID"

echo ""
echo "✓ Dashboard running at http://localhost:5173"
echo "  API docs at     http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
