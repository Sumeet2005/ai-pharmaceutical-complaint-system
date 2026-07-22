# PharmacoGuard: AI-Powered QMS Ingestion Workspace

PharmacoGuard is a production-grade, AI-driven Quality Management System (QMS) designed for pharmaceutical incident triage, extraction, and validation. It automates the intake of quality complaints, processes unstructured files (PDF, DOCX, TXT, EML) or pasted emails, performs semantic duplicate detection, and allows QA administrators to verify, edit, and sign-off on incidents before committing them to the persistent QMS ledger.

---

## 📌 Table of Contents

- [Project Overview](#project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#%EF%B8%8F-system-architecture--workflow-orchestration)
- [AI Workflow](#-ai-workflow)
- [Folder Structure](#%EF%B8%8F-folder-structure)
- [Installation](#%EF%B8%8F-setup--installation-instructions)
- [Environment Configuration](#%EF%B8%8F-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [License](#license)

---

## 🔍 Project Overview

PharmacoGuard provides a unified workspace for QA Teams to ingest, analyze, and catalog product quality incidents. By automating unstructured narrative parsing using LLMs orchestrated through LangGraph, the system enforces a strict data extraction standard, detects redundant filings semantically, and minimizes manual transcription labor while maintaining compliance records.

---

## ✅ Features

- [x] AI-powered Complaint Ingestion
- [x] PDF Upload
- [x] DOCX Upload
- [x] TXT Upload
- [x] EML Upload
- [x] Plain Text Complaint Processing
- [x] AI Field Extraction
- [x] AI Complaint Summary
- [x] AI Risk Classification
- [x] Initial QA Priority
- [x] Conversational QA AI Copilot
- [x] LangGraph Workflow Orchestration
- [x] Semantic Duplicate Detection
- [x] PostgreSQL Complaint Ledger
- [x] Dashboard
- [x] Complaint Details
- [x] Search & Filtering
- [x] Delete Workflow
- [x] Responsive Enterprise UI

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite environment), Redux Toolkit (state management), Tailwind CSS (styling), Lucide React (icons), React Router.
* **Backend**: FastAPI (Python 3.11+), SQLAlchemy (ORM), Alembic (database migrations), Pydantic (validation).
* **Database**: PostgreSQL (relational storage & index matching).
* **AI Core**: Groq Inference API (`llama-3.3-70b-versatile` LLM model), custom semantic processing pipelines.

---

## 🏗️ System Architecture & Workflow Orchestration

We use **LangGraph** as the stateful workflow orchestrator to manage the Quality Ingestion Ledger pipeline.

```mermaid
graph TD
    Client[FastAPI Client] -->|graph.invoke| START[START]
    START --> Node1[Node 1: Extract Fields via Groq]
    Node1 --> Node2[Node 2: Generate Summary]
    Node2 --> Node3[Node 3: Classify Risk]
    Node3 --> Node4[Node 4: Determine Priority]
    Node4 --> Node5[Node 5: Duplicate Detection via DB]
    Node5 --> END[END]
    END -->|Return final_result| Client
```

### Why LangGraph?
1. **Traceability**: Separating extraction, summarization, risk assessment, and duplicate checks into separate nodes makes debugging and auditing AI behavior straightforward.
2. **State Management**: LangGraph enforces a single source of truth (`ComplaintState` TypedDict), preventing inconsistent state mutations between nodes.
3. **Resilience**: If any node fails (e.g., an LLM rate limit or database timeout), LangGraph catches the error, updates the state container with error details, and halts downstream processes gracefully without crashing the FastAPI web server.
4. **Extensibility**: It makes adding complex execution routes (e.g., parallel root cause analysis nodes or human-in-the-loop validation triggers) clean and simple to implement in subsequent sprints.

---

## 🧠 AI Workflow

The ingestion pipeline moves data through the system step-by-step to compile a validated incident:

```
User Upload (File/Text)
       ↓
    FastAPI
       ↓
   LangGraph
       ↓
  Extract Complaint Fields
       ↓
  Generate AI Summary
       ↓
  Risk Classification
       ↓
  Priority Assignment
       ↓
  Duplicate Detection
       ↓
  PostgreSQL Ingestion
       ↓
  React Dashboard
```

### LangGraph Node Definitions
1. **Extract Complaint Fields Node**: Invokes the Groq LLM using custom prompts to map unstructured documents into 14 compliant QMS schema variables.
2. **Generate AI Summary Node**: Takes extracted entities and parses the localized brief explanation record.
3. **Classify Risk Node**: Assesses the severity of the quality event and maps the incident risk level.
4. **Priority Assignment Node**: Translates severity and risk conditions into priority rankings (High/Medium/Low).
5. **Duplicate Detection Node**: Connects to the database to run semantic matches using product names, batch IDs, categories, and description embeddings. If matches are found, it logs duplicate metadata and redirects the record state.

---

## 📂 Folder Structure

```
ai-pharmaceutical-complaint-system/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── api/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── migrations/
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── store/
│   ├── index.html
│   └── package.json
│
├── README.md
└── requirements.txt
```

---

## ⚙️ Environment Configuration

### Backend Environment (`backend/.env`)
Create a file named `.env` in the `backend/` directory:
```env
APP_NAME="AI Pharmaceutical Complaint System"
APP_ENV=development
DEBUG=True

DATABASE_URL=postgresql://postgres:sumeet10%21@localhost:5433/pharma_complaints

# Groq Configuration
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile

CORS_ORIGINS=http://localhost:5173
```

---

## 🚀 Setup & Installation Instructions

### Prerequisite
Ensure Python (3.11+) and Node.js (v18+) are installed on your host system.

### 1. Database & Migrations
Ensure your PostgreSQL instance is running on port `5433` (or update `DATABASE_URL` in `.env`). 
Inside the `backend/` folder:
```bash
# Activate the python virtual environment
..\.venv\Scripts\activate

# Run database upgrades to match current schemas
alembic upgrade head
```

### 2. Run Backend API Server
Inside the `backend/` directory:
```bash
# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Run Frontend Client
Inside the `frontend/` directory:
```bash
# Install dependencies
npm install

# Start development client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Documentation

FastAPI automatically generates interactive schema API documents:

* **Swagger UI Docs**: Available locally at [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc API Docs**: Available locally at [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Primary API REST Endpoints

| HTTP Method | Endpoint Path | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/upload/file` | Ingests binary files (`.pdf`, `.docx`, `.msg`) for parsing. |
| **POST** | `/api/v1/upload/text` | Ingests raw text payloads directly into the pipeline. |
| **POST** | `/api/v1/upload/chat` | Feeds conversational prompt lines into the Groq Copilot. |
| **GET** | `/api/v1/complaints` | Queries the entire compliance ledger list. |
| **GET** | `/api/v1/complaints/{id}` | Retrieves detail metrics for a single complaint UUID. |
| **PATCH** | `/api/v1/complaints/{id}` | Updates specific attributes of a complaint record. |
| **DELETE** | `/api/v1/complaints/{id}` | Deletes a complaint record from the system registry. |

---

## 📸 Screenshots

### 🏠 Landing Page

![Landing Page](docs/images/landing-page.png)

### 📄 Complaint Intake Workspace

![Complaint Intake](docs/images/complaint-intake.png)

### 📊 Dashboard

![Dashboard](docs/images/dashboard.png)

### 🔍 Duplicate Detection

![Duplicate Detection](docs/images/duplicate-detection.png)

### ✅ Duplicate Review Workflow

![Duplicate Review](docs/images/duplicate-review.png)

---

## 🔮 Future Improvements

- **OCR for Scanned PDFs**: Integrate Tesseract OCR or Vision LLMs to extract text from scanned quality reports.
- **Email Inbox Integration**: Establish automatic IMAP listeners to ingest client complaints directly from mailbox support addresses.
- **SAP QMS Integration**: Build downstream ERP/SAP system integrations to synchronize committed entries automatically.
- **Multi-language Ingestion**: Incorporate translation modules to triage feedback in non-English formats.
- **Human-in-the-Loop Review**: Add multi-stage verification steps requiring secondary QA signatures for high-risk files.
- **Advanced Trend Analytics**: Include visualizations indicating batch defect rates, regional incidents, and timeline correlations.
- **Role-Based Authentication**: Introduce OAuth2 security protocols specifying QA Triage, QA Officer, and Compliance Admin roles.

---

## License

Developed as part of the AIVOA Full Stack Developer Assessment.
