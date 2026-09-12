# 🦇 Auror — Command Center Backend

> **Team:** Incognito  
> **Lead Backend Developer:** Puranjay Sharma   
> **Aesthetic:** Dark, Tactical "Batman/Oracle" Command Center  
> **Mission:** Redefining campus recruitment and hackathon team formation by eliminating resume fraud through cryptographic & AI zero-day code verification.

---

## ⚡ Core Capabilities

1. **Multi-Tenant Hard Isolation**: All database operations (`placements`, `users`, `verifications`) are strictly routed and scoped via `university_id` foreign keys and JWT claims. Thapar data never bleeds into VIT.
2. **The Ingestion Engine**: Receives messy, unstructured campus placement announcement emails, parses them through our **Unified LLM API Gateway**, and extracts clean, structured placement records (`company_name`, `role`, `ctc`, `tech_stack`).
3. **The Interrogation Room (Anti-Cheat Engine)**: Takes a candidate's claimed skill (e.g. `React`, `Python`, `Docker`), dynamically generates an authentic, adversarial **zero-day broken code challenge** with subtle bugs and initiates a hard 5-minute (300-second) server-side timed test.
4. **LLM Strict Judge**: Rigorously evaluates candidate submissions against original bugs, generating pass/fail verdicts and annotated code feedback.
5. **Unified LLM API Gateway**: Provider-agnostic engine using Gemini 1.5 Flash as primary, with automatic fallback routing to OpenAI-compatible endpoints (Groq / Llama-3-70B / OpenAI).
6. **Flasgger / Swagger UI**: Full interactive documentation and testing console.

---

## 📁 Architecture & File Layout

```
backend/
├── app/
│   ├── __init__.py               # Flask app factory + extensions + JWT error handlers
│   ├── config.py                 # Configuration loader (.env aware)
│   ├── extensions.py             # SQLAlchemy, Marshmallow, JWT, Migrate, Swagger, CORS
│   │
│   ├── models/
│   │   ├── university.py         # Tenant Root (universities)
│   │   ├── user.py               # User identity & roles (students, admins)
│   │   ├── placement.py          # Structured placement records (hard tenant isolation)
│   │   └── verification.py       # Anti-cheat zero-day challenges & submissions
│   │
│   ├── schemas.py                # Marshmallow strict serialization & request validation
│   │
│   ├── routes/
│   │   ├── auth.py               # /api/auth: GitHub OAuth + dev tokens + /me
│   │   ├── ingest.py             # /api/ingest: Email webhook ingestion + tenant placement lists
│   │   ├── assessment.py         # /api/assessment: Interrogation Room zero-day challenge generator
│   │   ├── submit.py             # /api/submit: Real-time solution grading + 300s timeout check
│   │   └── health.py             # /api/health & /api/seed
│   │
│   └── services/
│       ├── llm_gateway.py        # Resilient LLM Gateway (Gemini + Groq/OpenAI fallback)
│       ├── ingest_parser.py      # Email unstructured text -> placement extractor
│       ├── interrogation.py      # Adversarial zero-day broken code generator
│       ├── grader.py             # Strict LLM submission judge
│       └── github_oauth.py       # GitHub OAuth token exchange & user profile sync
│
├── tests/
│   ├── conftest.py               # Pytest fixtures & in-memory test DB
│   └── test_suite.py             # Comprehensive test suite covering all 4 core flows
├── .env.example                  # Environment configuration template
├── requirements.txt              # Production & test dependencies
└── run.py                        # Server launcher
```

---

## 🚀 Quick Start (Local Hackathon Sprint)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your `GEMINI_API_KEY` (and optional `OPENAI_COMPAT_API_KEY` for Groq fallback).

### 3. Run Backend Server
```bash
python run.py
```
Server boots at `http://localhost:5000`.

### 4. Interactive Swagger UI
Open your browser at:
👉 **[http://localhost:5000/apidocs/](http://localhost:5000/apidocs/)**

---

## 🧪 Running Automated Tests

```bash
cd backend
python -m pytest tests/ -v
```

All 5 core architectural test suites will execute in ~0.16s:
- `test_health_check`
- `test_dev_token_and_auth_me`
- `test_multi_tenant_placement_isolation`
- `test_interrogation_challenge_generation`
- `test_submit_solution_pass`

---

## 🛡️ Anti-Cheat & Security Invariants

- **Multi-Tenant Guarantee**: Calls to `/api/ingest/placements` automatically filter by `g.university_id` derived directly from JWT claims.
- **Server-Side Expiration**: Verification submissions calculate elapsed seconds via `now - issued_at`. Submissions exceeding 300 seconds are immediately marked as `verdict: "timeout"`.
- **Ownership Verification**: `/api/submit/solution` confirms `verification.user_id == current_user_id`.
