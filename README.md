# AI Mock Interview Platform for College Students

> **FSD Mini-Project | MERN Stack + AI Integration**  
> An AI-powered mock interview practice platform designed to help college students and fresh graduates master technical and behavioral job interviews. Built strictly in accordance with the Software Requirements Specification (`docs/SRS.docx`).

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Prerequisites](#-prerequisites)
5. [Installation & Setup](#-installation--setup)
6. [Environment Variables Guide](#-environment-variables-guide)
7. [Running the Application](#-running-the-application)
8. [Automated Testing & Verification](#-automated-testing--verification)
9. [REST API Documentation](#-rest-api-documentation)
10. [AI Evaluation Rubric](#-ai-evaluation-rubric)
11. [Acceptance Criteria Audit (SRS Section 10)](#-acceptance-criteria-audit-srs-section-10)
12. [Educational Advisory Notice](#-educational-advisory-notice)

---

## 🌟 Project Overview
Transitioning from university to the tech workforce requires rigorous interview practice. This platform provides:
* **Role-Specific Question Practice:** Frontend, Backend, Full Stack, Data Science, and General Software Engineering tracks.
* **Curated & Dynamic Categories:** Technical Fundamentals, HR / Behavioral, Role-Specific Deep Dives, and System Design.
* **Question-by-Question Flow:** Realistic test environment with one question at a time, elapsed timer, progress tracking, and draft retention.
* **Live AI Rubric Scoring:** Real LLM integration evaluates answers across a structured 5-point rubric (Relevance, Clarity, Completeness, Technical Correctness, and Examples/Reasoning) generating 0–100 scores, strengths, improvement areas, and model answer approaches.
* **Retry Practice & Improvement:** Students can revise weak answers immediately to test their comprehension and view side-by-side comparisons.
* **Performance Dashboard & History:** Real MongoDB-persisted metrics tracking session counts, completion rates, overall score trends, and rubric criteria progression over time.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v7, Vanilla CSS3 (Custom Design System), Lucide Icons |
| **Backend** | Node.js (ES Modules), Express.js 4.21, RESTful API Architecture |
| **Database** | MongoDB & Mongoose 8.9 (Indexes, strict schemas, automated seeding) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing, auth middleware |
| **AI Integration** | Google Gemini API (`gemini-3.8-flash`, `gemini-flash-latest`), resilient multi-model fallback cascade, typed JSON validation |

---

## 📂 System Architecture

```
FSD_PROJECT/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/common/   # Navbar, Footer, ProtectedRoute
│   │   ├── context/             # AuthContext (JWT persistence, user state)
│   │   ├── pages/               # Landing, Login, Register, Profile, Setup, Practice, Feedback, Dashboard, History
│   │   ├── services/api.js      # Axios/Fetch API client abstraction
│   │   └── styles/              # Design tokens, index.css, responsive breakpoints
│   ├── package.json
│   └── vite.config.js           # API proxy to backend (/api -> localhost:5000)
├── server/                      # Express.js Backend API
│   ├── config/                  # Database connector (db.js), auto-seed logic (seed.js)
│   ├── controllers/             # authController, profileController, sessionController, answerController, dashboardController
│   ├── data/                    # seedQuestions.js (Curated college interview question bank)
│   ├── middleware/              # auth.js (protect), validate.js, errorHandler.js
│   ├── models/                  # User, StudentProfile, Question, InterviewSession, AnswerAttempt, Feedback
│   ├── routes/                  # Modular Express router declarations
│   ├── services/                # aiService.js (Gemini/OpenAI integration, rubric validator)
│   ├── tests/                   # Automated test suites (e2e_full_verification, auth_profile, session, ai_evaluation, dashboard_history)
│   ├── .env.example             # Environment variable template
│   └── server.js                # Application entrypoint
├── docs/                        # SRS document and specifications
└── README.md                    # Documentation
```

---

## ⚙️ Prerequisites
Ensure the following tools are installed on your workstation:
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)
* **MongoDB** (Local `mongod` community server or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster)

---

## 🚀 Installation & Setup

### 1. Clone or Open the Workspace
```bash
git clone <repository-url>
cd FSD_PROJECT
```

### 2. Backend Setup
Navigate to the `server/` folder and install dependencies:
```bash
cd server
npm install
```

Copy the `.env.example` file to create your local `.env`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS/Linux:
cp .env.example .env
```

### 3. Frontend Setup
In a separate terminal, navigate to the `client/` folder and install dependencies:
```bash
cd client
npm install
```

---

## 🔑 Environment Variables Guide

Open `server/.env` and configure your settings:

```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_mock_interview
JWT_SECRET=super_secret_dev_jwt_key_2026_fsd
AI_PROVIDER=gemini
AI_API_KEY=your_actual_google_gemini_api_key_here
```

### Configuration Details:
1. **`PORT`**: Port number for the Express server (default: `5000`).
2. **`MONGODB_URI`**:
   * Local: `mongodb://localhost:27017/ai_mock_interview`
   * Cloud: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_mock_interview?retryWrites=true&w=majority`
   * *Note:* The backend features an automated fallback so the server starts even if MongoDB is temporarily offline.
3. **`JWT_SECRET`**: Private key used to sign and verify JSON Web Tokens.
4. **`AI_PROVIDER`**: Set to `gemini` (recommended) or `openai`.
5. **`AI_API_KEY`**: Your Google AI Studio API key.
   * Free key creation: Visit [Google AI Studio](https://aistudio.google.com/), sign in with a Google account, click **"Get API key"**, and paste it into `.env`.
   * *Security Reminder:* `server/.env` is ignored by `.gitignore` and must never be committed to source control.

---

## 🖥️ Running the Application

### Start the Backend Server
```bash
cd server
npm run dev
```
* The API will start on: **`http://localhost:5000`**
* Health check endpoint: **`http://localhost:5000/api/health`**

### Start the Frontend Client
```bash
cd client
npm run dev
```
* Vite will launch the application at: **`http://localhost:5173`**
* Requests to `/api/*` are automatically proxied to `http://localhost:5000`.

---

## 🧪 Automated Testing & Verification

The project includes unit, integration, and comprehensive end-to-end acceptance tests.

### Run End-to-End Acceptance Verification
To test the complete system against all SRS Section 10 criteria:
```bash
cd server
npm test
```
This suite automatically verifies:
1. Registration schema validation and password hashing.
2. Login credential verification and JWT token issuance.
3. Profile retrieval and update workflows.
4. Interview session creation and option selection.
5. Question-by-question answering and persistence.
6. Real LLM invocation and 5-point rubric validation.
7. Resilience when API credentials are missing (without crashing or fabricating scores).
8. Strict resource ownership and 403 Forbidden enforcement.
9. Real database dashboard aggregations.
10. Educational advisory disclaimers.
11. Git secret isolation (zero API keys in client bundles or source control).

### Run Component Unit Tests
```bash
# Authentication & Profile Suite
node tests/auth_profile.test.js

# Session & Question Flow Suite
node tests/session.test.js

# AI Rubric & Fallback Suite
node tests/ai_evaluation.test.js

# Dashboard & Analytics Suite
node tests/dashboard_history.test.js
```

### Validate Frontend Production Build
```bash
cd client
npm run build
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student account | No |
| `POST` | `/api/auth/login` | Authenticate student & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Yes (Bearer) |

### Student Profile (`/api/profile`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Retrieve student's profile & skills | Yes (Bearer) |
| `PUT` | `/api/profile` | Update target role, skills, education | Yes (Bearer) |

### Interview Sessions (`/api`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/interview-options` | List supported roles, types & lengths | Yes (Bearer) |
| `POST` | `/api/sessions` | Create a new interview practice session | Yes (Bearer) |
| `GET` | `/api/sessions` | List authenticated student's sessions | Yes (Bearer) |
| `GET` | `/api/sessions/:id` | Get session details, questions & answers | Yes (Bearer) |
| `POST` | `/api/sessions/:id/answers`| Save an answer draft / submission | Yes (Bearer) |
| `POST` | `/api/sessions/:id/complete`| Mark interview session as completed | Yes (Bearer) |
| `DELETE`| `/api/sessions/:id` | Delete an owned practice session | Yes (Bearer) |

### AI Feedback & Retries (`/api`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sessions/:id/answers/:index/evaluate` | Request live AI rubric evaluation | Yes (Bearer) |
| `POST` | `/api/sessions/:id/answers/:index/retry` | Submit revised answer for re-scoring | Yes (Bearer) |
| `GET` | `/api/sessions/:id/feedback` | Retrieve all feedback reports for session | Yes (Bearer) |

### Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Aggregated KPIs & rubric averages | Yes (Bearer) |

---

## 📊 AI Evaluation Rubric

Every student answer evaluated by the AI is scored against the standard **5-point SRS Rubric** (Scale: 1 – 10 per criterion):

1. **Relevance (1–10):** Does the answer directly address the interview question asked?
2. **Clarity & Structure (1–10):** Is the explanation logically organized and easy to follow?
3. **Completeness (1–10):** Does the response cover the essential concepts expected for the role?
4. **Technical Correctness (1–10):** Are technical claims, syntax, or methodologies accurate?
5. **Examples & Reasoning (1–10):** Does the candidate include concrete project examples or STAR reasoning?

**Overall Question Score (0–100):** Weighted percentage calculated from rubric criteria, paired with actionable **Strengths**, **Areas for Improvement**, and an **Exemplary Model Answer Approach**.

---

## 📋 Acceptance Criteria Audit (SRS Section 10)

| Criterion ID | Description from SRS Section 10 | Status | Verification Evidence |
| :--- | :--- | :---: | :--- |
| **AC-01** | A new student can register, log in, and log out. | **PASSED** | Password hashed with bcrypt; JWT issued; login validated; logout clears state. Verified by `tests/auth_profile.test.js`. |
| **AC-02** | A student can create and update a profile and start a session with supported options. | **PASSED** | Profile CRUD wired to StudentProfile schema; `/api/interview-options` provides roles/categories. Verified by `tests/auth_profile.test.js`. |
| **AC-03** | The system displays questions one at a time and saves answers to the correct session. | **PASSED** | Practice UI displays 1 question at a time with timer, drafts autosaved to AnswerAttempt collection. Verified by `tests/session.test.js`. |
| **AC-04** | A completed answer can receive rubric-based feedback when the AI service is available. | **PASSED** | Calls Google Gemini API, validates 5 rubric criteria, returns structured strengths/improvements. Verified by live evaluation tests. |
| **AC-05** | An AI-service failure does not erase the submitted answer and produces a clear error/retry path. | **PASSED** | Answers remain saved in DB; missing credentials throw typed `MissingCredentialsError`; retry drawer enables revised submissions. |
| **AC-06** | Students can view their own session history and cannot access another student's records by changing an ID. | **PASSED** | Strict ownership checks (`session.userId.toString() === req.user._id.toString()`) enforce 403 Forbidden. Verified by `tests/session.test.js`. |
| **AC-07** | The dashboard displays session summaries based on persisted data rather than hard-coded demo values. | **PASSED** | `/api/dashboard/stats` dynamically aggregates Mongoose counts and rubric averages across persisted feedback records. |
| **AC-08** | The application explains that AI feedback is advisory and may be inaccurate. | **PASSED** | Prominently displayed advisory disclaimer banner (SRS Appendix B) on Landing Page, Feedback Page, and Dashboard. |
| **AC-09** | AI credentials are kept in server-side environment variables and are not present in frontend bundles or source control. | **PASSED** | `server/.env` is git-ignored; Vite production bundle audited for zero leaked API keys; `AI_API_KEY` accessed exclusively server-side. |
| **AC-10** | Core flows are tested with valid input, invalid input, unauthenticated requests, and simulated AI-service failures. | **PASSED** | 13/13 automated test assertions passed in `server/tests/e2e_full_verification.test.js`. |

---

## ⚠️ Educational Advisory Notice
*(SRS Appendix B)*

> **Notice:** This platform is designed strictly for interview practice and learning guidance. AI-generated feedback and scoring are approximate, advisory, and may occasionally be inaccurate or inconsistent. Practice scores do not constitute an official employment screening, certified assessment, or guarantee of hiring suitability.
