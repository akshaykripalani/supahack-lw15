# LLM Breakout (Slop Edition)

A single-round Breakout clone whose brick layout is generated from an LLM paragraph. Destroy bricks to earn a percentage score.

## Quick Start

### 1. Frontend (React + Vite)
```powershell
cd frontend
npm i            # install deps
npm run dev      # open http://localhost:5173
```

### 2. Backend (FastAPI)
```powershell
cd backend
uv init          # if first time – generates pyproject
uv venv
actvenv          # activates venv (alias)
uv sync --locked # install deps from uv.lock (or `uv add <pkg>` to modify)
uv run uvicorn app:app --reload  # http://localhost:8000
```

The game queries `/api/layout` on the backend to turn your text prompt into a paragraph.

### 3. Supabase
Create a table matching `supabase/upsert_score.sql`, then expose the public anon key in `frontend/src/lib/supabase.ts`.

---

Use the **Slopify** button for LinkedIn-flavoured chaos (nine-ball mode).
