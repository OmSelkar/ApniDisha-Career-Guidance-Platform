# ApniDisha — Career Guidance Platform

**ApniDisha** (Hindi for "My Direction") is a full-stack career guidance platform for Indian students (Grades 8–12 & early college). It combines a **psychometric assessment engine** (RIASEC + Big Five/OCEAN) with a **custom-trained Random Forest ML model** and **LLM-powered features** to deliver personalized career clusters, government college matches, actionable roadmaps, and an AI mentor — all tailored to the Indian education system.

---

## 🎯 Problem & Impact

| Problem | ApniDisha Solution |
|---------|-------------------|
| Students choose streams/careers under peer/parent pressure | Data-driven 44-question adaptive test maps personality → career clusters |
| Generic career advice ignores Indian context (Govt. colleges, ITIs, competitive exams) | India-specific roadmap: stream selection → Govt. degrees → competitive exams → jobs |
| No access to personalized mentorship | "Disha" — multilingual AI voice/chat mentor with real-time market intelligence |
| One-size-fits-all results | Top-3 ranked clusters with confidence scores + alternative paths |

**Target Users:** 250M+ Indian students in Grades 8–12  
**Current Status:** Production-ready MVP with Clerk auth, Neon PostgreSQL, Groq LLM inference

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Landing  │→ │ Complete │→ │  44-Q    │→ │    Dashboard   │  │
│  │  Page    │  │ Profile  │  │ Onboarding│ │  (Results Hub) │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│         │           │            │                  │            │
│         ▼           ▼            ▼                  ▼            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Clerk Auth  │  TailwindCSS  │  VAPI Voice  │  localStorage │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST API
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ML BACKEND (FastAPI)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ RF Model    │  │  Groq LLM   │  │  Neon PG    │             │
│  │ (joblib)    │  │ (gpt-oss-20b)│  │  (Colleges) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │             │             │                            │
│         ▼             ▼             ▼                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ /submit-quiz  /roadmap  /chat  /colleges  /resources        │ │
│  │ /challenge  /job-details                                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 ML Pipeline — Core Differentiator

### Psychometric Model (Random Forest)
- **Input:** 11 dimensions × 4 questions = 44 responses (5-point Likert)
- **Dimensions:** 6 RIASEC (Holland) + 5 Big Five (OCEAN)
- **Reverse-scored items:** 22/44 questions prevent gaming/social-desirability bias
- **Training Data:** 1,000+ synthetic profiles mapped to 12 Indian career clusters
- **Output:** Probability distribution over clusters → calibrated confidence (40–98%)
- **Artifacts:** `apnidisha_model.pkl`, `apnidisha_mega_dataset.csv`, `riasec_model.pkl`

### LLM-Augmented Features (Groq `gpt-oss-20b`)
| Endpoint | Purpose | Prompt Strategy |
|----------|---------|-----------------|
| `/roadmap` | 4-phase Indian education timeline | Structured JSON schema, few-shot |
| `/chat` | "Disha" mentor — multilingual (EN/HI/Hinglish/TA/MR) | Persona + career market context injection |
| `/resources` | 3 curated learning links (YouTube/Coursera) | Search-query fallback URLs |
| `/challenge` | 7-day micro-project for skill building | Phased task breakdown |
| `/job-details` | Salary, skills, description for any role | Strict JSON output |

---

## ✨ Key Features

### 1. Adaptive Psychometric Assessment (`/onboarding`)
- 44 shuffled questions, behavioral anchoring (habits > preferences)
- Real-time progress ring, timer, question navigator with lock logic
- Reverse-scoring engine in backend — prevents fake "ideal" profiles

### 2. Results Dashboard (`/dashboard`)
- **Primary Cluster** + confidence score (e.g., "Software & Tech — 94.2%")
- **Top 3 Alternatives** with ranked confidence & top careers each
- **Raw RIASEC/OCEAN Scores** (0–10 scale) with expandable breakdown
- **LLM Explanation** — natural-language summary of *why* this cluster fits

### 3. Government College Finder
- Neon PostgreSQL database of Indian Govt. colleges, ITIs, Polytechnics
- City → State → National fallback search
- Cluster-mapped course filtering

### 4. AI Career Roadmap (4 Phases)
```
After 10th (Stream) → After 12th (Govt Degree/Diploma) → College Years (Skills/Exams) → Professional Jobs
```
- Generated on-demand via LLM, cached per session

### 5. "Disha" AI Mentor
- **Chat:** Full conversation history, career-aware context injection
- **Voice:** VAPI integration for real-time voice calls
- **Multilingual:** English, Hindi, Hinglish, Tamil, Marathi
- **Market Intelligence:** Demand, salary bands, growth areas, alternatives per cluster

### 6. Gamified Engagement
- Weekly 7-day micro-challenges (accept → confetti → streak tracking)
- Curated free resources (YouTube/Coursera search links)
- Job detail modals with salary/skills
- WhatsApp share + PDF export (print-optimized)

### 7. Profile & Auth
- Clerk authentication (email/OAuth)
- 2-step onboarding: education level + location
- Test history & readiness score (profile completion + test taken)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4 |
| **Auth** | Clerk (Next.js middleware) |
| **State/Storage** | React hooks + localStorage (per-user keys) |
| **UI Icons** | Lucide React |
| **Animations** | CSS transitions, canvas-confetti |
| **Voice** | VAPI Web SDK |
| **Backend** | FastAPI (Python 3.11+), Uvicorn |
| **ML** | scikit-learn (RandomForest), joblib, pandas, numpy |
| **LLM** | Groq API (`gpt-oss-20b`) |
| **Database** | Neon PostgreSQL (connection pooling via `psycopg2`) |
| **Env/Config** | python-dotenv, Pydantic v2 |

---

## 📁 Project Structure

```
ApniDisha/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + providers
│   ├── globals.css               # Tailwind + custom theme
│   ├── onboarding/page.tsx       # 44-question quiz (client)
│   ├── dashboard/page.tsx        # Results hub (client)
│   ├── complete-profile/page.tsx # 2-step profile setup
│   ├── sign-in/[[...sign-in]]/   # Clerk auth routes
│   ├── sign-up/[[...sign-up]]/
│   ├── api/generate/route.ts     # Proxy to ML backend
│   └── components/VoiceMentorCall.tsx
├── lib/
│   ├── quiz_questions.js         # 44-question bank (RIASEC+OCEAN, reverse items)
│   └── db.ts                     # Neon PG pool (server-side)
├── ml_backend/
│   ├── main.py                   # FastAPI app — all endpoints
│   ├── train_model.py            # Model training script
│   ├── evaluate_model.py         # Evaluation metrics
│   ├── fix_db_rules.py           # College DB helpers
│   ├── apnidisha_model.pkl       # Trained RF classifier
│   ├── riasec_model.pkl          # RIASEC-only model
│   ├── apnidisha_mega_dataset.csv# Career dataset (12 clusters)
│   ├── colleges.csv              # Govt college seed data
│   └── requirements.txt
├── public/                       # Static assets
├── middleware.ts                 # Clerk auth protection
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── postcss.config.mjs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Neon PostgreSQL database (free tier)
- Clerk account (free tier)
- Groq API key (free tier)

### 1. Frontend Setup
```bash
cd ApniDisha-main
npm install
cp .env.example .env.local   # Add Clerk keys, NEXT_PUBLIC_API_URL
npm run dev                  # http://localhost:3000
```

### 2. ML Backend Setup
```bash
cd ml_backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # Add DATABASE_URL, GROQ_API_KEY
python main.py               # http://localhost:8000
```

### 3. Database (Neon)
- Create project at [neon.tech](https://neon.tech)
- Run `ml_backend/fix_db_rules.py` to create `colleges` table & seed data
- Add `DATABASE_URL` to `.env`

### 4. Train/Re-train Model (Optional)
```bash
cd ml_backend
python train_model.py        # Outputs apnidisha_model.pkl
python evaluate_model.py     # Prints accuracy, confusion matrix
```

---

## 🔐 Environment Variables
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# voice assistant
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=

# Database (PostgreSQL)
DATABASE_URL=

# API Backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
GROQ_API_KEY=

```

---

## 📡 API Reference (ML Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submit-quiz` | Score answers → cluster + confidence + explanation |
| `POST` | `/api/roadmap` | Generate 4-phase career roadmap |
| `POST` | `/api/get-colleges` | Search Govt colleges by city/state/cluster |
| `POST` | `/chat` | Chat with Disha (history + career context) |
| `POST` | `/api/job-details` | Salary, skills, description for a role |
| `POST` | `/api/resources` | 3 curated learning resources |
| `POST` | `/api/challenge` | 7-day micro-challenge |
| `POST` | `/api/save-profile` | Persist user profile to Neon |

**Request/Response schemas:** See `ml_backend/main.py` Pydantic models (`QuizSubmitRequest`, `RoadmapRequest`, etc.)

---

## 🧪 Testing & Quality

```bash
# Frontend
npm run lint          # ESLint (Next.js config)
npm run build         # Production build check

# Backend
cd ml_backend
python -m pytest      # If tests added
python evaluate_model.py  # Model metrics
```

---

## 🎨 UI/UX Highlights

- **Dark/Light mode** — persisted, system-aware, smooth transitions
- **Responsive** — mobile-first, 3-panel desktop dashboard (sidebar + main + insights)
- **Accessibility** — semantic HTML, focus outlines, ARIA labels, color contrast
- **Print-optimized** — "Export" button generates clean PDF via `window.print()`
- **Micro-interactions** — confetti on challenge accept, animated progress rings, staggered transitions

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| **Training Samples** | 1,200+ synthetic profiles |
| **Clusters** | 12 (Software & Tech, Medical, Business, Engineering, Arts, Education, Agriculture, Sports, Defense, Skilled Trades, etc.) |
| **Test Accuracy** | ~87% (on held-out synthetic set) |
| **Inference Latency** | <50ms (RF) + ~800ms (Groq LLM) |
| **Calibration** | Platt-style via `tanh` preference multiplier |

*Confusion matrix & feature importance plots in `ml_backend/`*

---

## 🗺 Roadmap

- [ ] **Adaptive questioning** — LLM selects next question based on uncertainty (current: fixed 44)
- [ ] **Parent/Teacher dashboard** — shareable read-only view
- [ ] **Offline mode** — Service Worker + IndexedDB for quiz
- [ ] **Regional language UI** — Full Hindi/Tamil/Marathi localization
- [ ] **College admission predictor** — JEE/NEET/CUET cutoff integration
- [ ] **Peer community** — Discord/forum for cluster-based cohorts

---

## 👨‍💻 Author

**Pranay** — Built with ❤️ for Indian students navigating career choices.

---

## 📄 License

MIT — Free to use, modify, and distribute.