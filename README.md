# AI Mock Interview Platform for College Students

> **FSD Mini-Project (MERN Stack + AI)**  
> An AI-powered mock interview web application designed to help college students and fresh graduates practice job interviews, receive structured rubric-based feedback, retry answers, and track interview progress over time.

---

## 🛠️ Technology Stack
* **Frontend:** React (Vite), Modern CSS, Lucide Icons
* **Backend:** Node.js, Express.js, REST API
* **Database:** MongoDB & Mongoose
* **AI Evaluation:** External Language Model API (with fallback demo mode)
* **Authentication:** JWT (JSON Web Tokens) & bcryptjs password hashing

---

## 📂 Project Architecture
```
FSD_PROJECT/
├── client/              # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard, Interview, Feedback, History, Profile
│   │   ├── context/     # Auth and Session state
│   │   └── services/    # API client
│   └── package.json
├── server/              # Node.js + Express.js Backend API
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB Mongoose models (User, Profile, Session, Question, Feedback)
│   ├── routes/          # API endpoints (/api/auth, /api/sessions, /api/profile, etc.)
│   ├── middleware/      # Auth & error handling middlewares
│   ├── services/        # AI evaluation service & question generator
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **MongoDB** (Local instance or MongoDB Atlas URI)

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd FSD_PROJECT
   ```
2. **Backend Setup:**
   ```bash
   cd server
   npm install
   cp .env.example .env # Configure PORT, MONGO_URI, JWT_SECRET, AI_API_KEY
   npm run dev
   ```
3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
