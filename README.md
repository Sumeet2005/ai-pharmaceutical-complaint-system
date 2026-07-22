# PharmacoGuard: AI-Powered QMS Ingestion Workspace

PharmacoGuard is a production-grade, AI-driven Quality Management System (QMS) designed for pharmaceutical incident triage, extraction, and validation. It automates the intake of quality complaints, processes unstructured files (PDF, DOCX, TXT, EML) or pasted emails, performs semantic duplicate detection, and allows QA administrators to verify, edit, and sign-off on incidents before committing them to the persistent QMS ledger.

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

## 🌟 Key Features

1. **Intelligent Ingestion Pipeline**:
   * Accepts document uploads (`.pdf`, `.docx`, `.txt`, `.eml`) or long-text pastes.
   * Auto-routes inputs: files invoke the file ingestion pipeline; text pastes bypass client checks and route directly to the FastAPI text extraction endpoint.
2. **QMS Ledger Intake Form**:
   * Organized into four distinct compliance sections:
     * *Section 1: Origin & Customer Information*
     * *Section 2: Product & Batch Identification*
     * *Section 3: Complaint Details*
     * *Section 4: AI Initial Assessment* (Risk Level, Priority, and AI Narrative Summary).
3. **Conversational QA AI Copilot**:
   * ChatGPT-style chat input with vertically centered components.
   * Local Command Parsing: Natural language commands (e.g., *"Change Expiry Date to November 2027"*) are parsed locally to update the form fields immediately.
   * General Q&A: Conversational queries are routed to Groq to extract root cause analyses or corrective actions (CAPA).
4. **Operations Dashboard & Audit Log**:
   * Dynamic stats (Total, Pending, Reviewed, Critical, High Severity).
   * Responsive search bar and severity/status filter dropdowns.
   * Incident Details page rendering full timelines, UUIDs, metadata, and triage audit histories.
   * Safe DELETE modal endpoints with success indicators.

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

## 🧪 Validation & Linting

Verify code quality and clean builds with the following scripts:

```bash
# Run ESLint validation checks
npm run lint

# Verify production Vite build stability
npm run build
```
