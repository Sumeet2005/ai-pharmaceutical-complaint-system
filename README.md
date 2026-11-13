# PharmacoGuard
### AI-Powered Pharmaceutical Quality Management System (QMS) Ingestion Workspace

[![FastAPI](https://img.shields.io/badge/FastAPI-0.139.2-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.2.9-FF6F00?style=flat&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Groq](https://img.shields.io/badge/Groq_API-openai/gpt--oss--120b-F55036?style=flat)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Sentence--Transformers](https://img.shields.io/badge/Sentence--Transformers-all--MiniLM--L6--v2-FFA116?style=flat)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## Project Overview

**PharmacoGuard** is a full-stack Quality Assurance (QA) ingestion workspace that streamlines how pharmaceutical quality complaints are captured, triaged, and reviewed. When unstructured documents (customer letters, distributor emails, laboratory reports) arrive, the platform validates their medical relevance, parses 14 standardized QMS fields using a 5-node LangGraph workflow on Groq (`openai/gpt-oss-120b`), flags potential batch duplicates using multi-representation sentence embeddings (`all-MiniLM-L6-v2`), and presents the data in an interactive two-panel React 19 workspace for human review prior to ledger persistence.

### Architectural Snapshot
* **Frontend**: React 19, Vite 8, Tailwind CSS 4, Redux Toolkit (dashboard complaints registry), local component state (intake form and Copilot chat).
* **Backend**: Python (verified on 3.13.7 / 3.11+), FastAPI, SQLAlchemy 2.0 ORM, Alembic migrations, Uvicorn ASGI server.
* **AI & NLP**: LangGraph (5-node linear state graph), Groq Inference API (`openai/gpt-oss-120b`), Sentence Transformers (`all-MiniLM-L6-v2` 384-dimensional dense embeddings), Scikit-Learn (cosine similarity).
* **Database**: PostgreSQL 17 (relational persistence, sequential `CMP-YYYYMMDD-XXXX` IDs, UUID primary keys).

```mermaid
flowchart LR
    A["Unstructured Document\n(.pdf, .docx, .msg)"] --> B["FastAPI Backend\n(Parser & Classifier)"]
    B --> C["LangGraph Workflow\n(14-Field Groq Extraction)"]
    C --> D["Duplicate Engine\n(Embeddings & Cosine Sim)"]
    D --> E["React 19 Workspace\n(Human-in-the-Loop Review)"]
    E --> F[("PostgreSQL 17\nComplaint Ledger")]
```

---

## 📸 Application Screenshots

| Landing Page | Intake Workspace |
| :---: | :---: |
| ![Landing Page](docs/images/landing-page.png) | ![Complaint Intake](docs/images/complaint-intake.png) |

| Operational Dashboard | Semantic Duplicate Detection |
| :---: | :---: |
| ![Dashboard](docs/images/dashboard.png) | ![Duplicate Detection](docs/images/duplicate-detection.png) |

---

## 📌 Table of Contents

1. [Project Background & Business Problem](#1-project-background--business-problem)
2. [Key Features](#2-key-features)
3. [System Architecture](#3-system-architecture)
4. [End-to-End Document Processing Pipeline](#4-end-to-end-document-processing-pipeline)
5. [LangGraph Orchestration Architecture](#5-langgraph-orchestration-architecture)
6. [Semantic Duplicate Detection Engine](#6-semantic-duplicate-detection-engine)
7. [QA AI Copilot & Conversational Parser](#7-qa-ai-copilot--conversational-parser)
8. [Database Architecture & Ledger Schema](#8-database-architecture--ledger-schema)
9. [Technology Stack](#9-technology-stack)
10. [API Documentation](#10-api-documentation)
11. [Repository Structure](#11-repository-structure)
12. [Local Setup & Execution Guide](#12-local-setup--execution-guide)
13. [Manual Testing & Verification Guide](#13-manual-testing--verification-guide)
14. [Automated & Regression Testing](#14-automated--regression-testing)
15. [Security, Limitations & Future Roadmap](#15-security-limitations--future-roadmap)

---

## 1. Project Background & Business Problem

### The Business Challenge
In pharmaceutical manufacturing and distribution operations, product quality complaints arrive continuously from hospitals, retail pharmacies, and distributors via unstructured narratives. Examples include:
* **Foreign Particles**: Black specks, fibers, or particulate matter embedded in tablets, suspensions, or ampoules.
* **Packaging Integrity**: Defective blister strip seals, leaking liquid bottles, damaged crimp seals.
* **Physical Defects**: Cracked tablet cores, capping, discoloration, or unexpected precipitation.
* **Labeling / Traceability**: Mismatched batch codes between secondary cartons and primary blister strips.

### Operational Pain Points
1. **Manual Data Entry Overhead**: QA specialists manually transcribe up to 14 discrete data fields from unstructured correspondence into electronic QMS forms, introducing operational delays during high-volume intake.
2. **Batch Blindspots**: When different pharmacies report identical packaging defects using varied vocabulary, manual triage often fails to correlate them, missing batch-wide quality signals.
3. **Inconsistent Triage**: Different reviewers assign divergent risk levels to comparable defects without standardized scoring rules.

### The PharmacoGuard Solution
PharmacoGuard automates document classification, structured extraction, and semantic duplicate detection while strictly preserving human verification:
* Documents are automatically checked for relevance before entering processing.
* 14 standard QMS fields are extracted into an interactive form.
* Potential duplicates are identified and surfaced with similarity scores and comparative metadata.
* Complaints are initially recorded in PostgreSQL with `Pending` status (or `Duplicate` if flagged during triage); a human reviewer verifies or edits the data before committing the record to `Reviewed` status.

*(Disclaimer: PharmacoGuard is an engineering prototype and portfolio demonstration. It is not certified for FDA 21 CFR Part 11 or EU GMP Annex 11 compliance).*

---

## 2. Key Features

1. **Multi-Format Document Upload**: Accepts binary files in `.pdf`, `.docx`, and `.msg` formats.
2. **Text Extraction Engine**: Robust file parsing via `pypdf`, `python-docx`, and `extract-msg` with whitespace normalization and null-byte removal.
3. **Direct Text Ingestion**: Dedicated endpoint and UI paste area for email bodies or call transcripts without file creation.
4. **Binary Relevance Classification**: LLM-based gatekeeper that rejects non-complaint documents (e.g., invoices, resumes, manuals) before workflow execution.
5. **Structured 14-Field QMS Extraction**: Extracts product name, strength, dosage form, batch number, manufacturing date, expiry date, affected quantity, complaint category, severity, complainant name, organization, contact, source, and requested action.
6. **Multi-Representation Semantic Duplicate Detection**: Computes dense sentence embeddings (`all-MiniLM-L6-v2`) over both raw narrative and AI summary, catching paraphrased batch issues.
7. **Interactive Human-in-the-Loop Workspace**: Two-panel React 19 UI featuring side-by-side document/chat viewing, manual form edits, and confidence indicators.
8. **In-Workspace QA Copilot**: Grounded narrative Q&A alongside client-side regex command parsing for instant form updates.
9. **Relational Ledger with Human Verification**: Dual-status lifecycle where records start in `Pending` (or `Duplicate`) and require QA sign-off to reach `Reviewed`.
10. **Operations Dashboard & Audit Trail**: Real-time KPI summary cards, tabular registry with search and status filtering, case drawer inspect, and CSV audit export.

---

## 3. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (React 19 + Vite 8)"]
        UI["QA Ingestion Workspace\n(Two-Panel Layout)"]
        DashboardUI["Operations Dashboard\n(Client-Side Filtering)"]
        ClientParser["Client-Side Intent Parser\n(conversationalParser.js)"]
        AxiosClient["Axios HTTP Client\n(Base URL: /api)"]
    end

    subgraph ServerLayer["Backend API Server (FastAPI + Uvicorn)"]
        Router["FastAPI APIRouter\n(/api/v1/upload, /api/v1/complaints, /health)"]
        UploadSvc["UploadService\n(Extension Validation)"]
        ParserSvc["ParserService\n(pypdf, python-docx, extract-msg)"]
        AISvc["AIProcessingService\n(Pipeline Coordinator)"]
        Classifier["DocumentClassifier\n(Relevance Gatekeeper)"]
        ComplaintSvc["ComplaintService\n(ID Generation & CRUD)"]
    end

    subgraph StorageLayer["Persistence & Local Storage"]
        LocalStorage[("Local Disk Upload Storage\nbackend/app/uploads/")]
        PostgreSQL[("PostgreSQL 17 Database\nTable: complaints")]
    end

    subgraph AIEngine["AI Orchestration & Semantic Services"]
        GroqClient["Groq Inference API\nModel: openai/gpt-oss-120b"]
        LangGraphWorkflow["LangGraph StateGraph Workflow\n(5 Linear Orchestration Nodes)"]
        DuplicateSvc["DuplicateService\n(Multi-Representation Scoring)"]
        EmbeddingSvc["EmbeddingService\n(SentenceTransformer: all-MiniLM-L6-v2)"]
    end

    UI --> AxiosClient
    DashboardUI --> AxiosClient
    ClientParser --> UI
    AxiosClient -->|"REST API Calls (/upload, /complaints)"| Router

    Router --> UploadSvc
    Router --> ParserSvc
    Router --> AISvc
    Router --> ComplaintSvc

    UploadSvc -->|"Write sanitized binary"| LocalStorage
    ParserSvc -->|"Read binary file"| LocalStorage

    AISvc --> Classifier
    Classifier -->|"Relevance Check"| GroqClient
    AISvc -->|"Invoke Graph"| LangGraphWorkflow
    LangGraphWorkflow -->|"Extraction & Summary"| GroqClient
    LangGraphWorkflow -->|"Node 5: Duplicate Audit"| DuplicateSvc
    DuplicateSvc -->|"384-dim Embeddings"| EmbeddingSvc
    DuplicateSvc -->|"Query historical complaints"| PostgreSQL

    ComplaintSvc -->|"SQLAlchemy 2.0 ORM"| PostgreSQL
```

### Architectural Details
* **Client-Server Boundary**: React 19 client and FastAPI backend communicate strictly over asynchronous JSON HTTP APIs. In local development, Vite proxies `/api` requests to `127.0.0.1:8000`.
* **Frontend State Segregation**:
  * **Operations Dashboard**: Uses Redux Toolkit (`complaintSlice`) to manage the complaint registry list, loading state, search query, and status filters.
  * **Active Ingestion Workspace**: Uses local React component state (`useState`) in `Complaint.jsx` for form values, validation flags, upload status, and Copilot chat session history.
* **Local Disk Storage**: Uploaded binary files are saved to `backend/app/uploads/` using UUID4 filenames to prevent directory collisions and retain source files for inspection.

---

## 4. End-to-End Document Processing Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor QA as QA Specialist
    participant Client as React 19 Frontend
    participant API as FastAPI Backend
    participant Storage as Local Upload Storage
    participant Parser as ParserService
    participant Classifier as DocumentClassifier (Groq)
    participant Graph as LangGraph Workflow
    participant DupEngine as DuplicateService
    participant DB as PostgreSQL Database

    QA->>Client: Selects file (.pdf, .docx, .msg)
    Client->>Client: Client-side validation (extension, size <= 10MB)
    Client->>API: POST /api/v1/upload/process (multipart/form-data)
    Note over Client: Simulated progress timer activates
    API->>Storage: Save file as {uuid4}.{ext}
    API->>Parser: Extract normalized text
    Parser-->>API: Extracted plain text

    API->>Classifier: classify(text)
    Classifier-->>API: {"is_complaint": true/false, "reason": "..."}

    alt Document is NOT a complaint
        API-->>Client: HTTP 200 {"success": false, "message": "Not a complaint", "reason": "..."}
        Client->>QA: Display Rejection Card
    else Document IS a complaint
        API->>Graph: invoke({"complaint_text": text, "db": Session})
        Note over Graph: Node 1: Extract 14 Fields (Groq)<br/>Node 2: Map Summary<br/>Node 3: Assess Risk<br/>Node 4: Determine Priority<br/>Node 5: Duplicate Check
        Graph->>DupEngine: find_duplicate(db, complaint_text, product, batch, category, ai_summary)
        DupEngine->>DB: Query historical complaints
        DB-->>DupEngine: List of historical records
        DupEngine->>DupEngine: Multi-representation cosine similarity
        DupEngine-->>Graph: Duplicate evaluation result

        Graph-->>API: final_result dict
        API->>DB: Create complaint (status: "Pending" or "Duplicate")
        DB-->>API: Saved Complaint record

        alt Potential Duplicate Flagged
            API-->>Client: HTTP 200 {"success": false, "message": "Duplicate complaint detected.", ...}
            Client->>QA: Render Duplicate Warning Card with comparison metrics
        else Unique Record
            API-->>Client: HTTP 200 {"success": true, "complaint": saved, ...}
            Client->>Client: Populate 14-field form
            Client->>QA: Display form & greeting in Copilot

            QA->>Client: Verify/edit fields, click "Commit to Ledger"
            Client->>API: PATCH /api/v1/complaints/{id} (status: "Reviewed")
            API->>DB: Update record status to "Reviewed"
            DB-->>API: Updated Complaint
            API-->>Client: HTTP 200 Success
            Client->>QA: Redirect to Dashboard
        end
    end
```

*(Note: The upload progress bar in `Complaint.jsx` is an animated client-side timer while awaiting the single asynchronous `/process` HTTP response; it is not a chunked SSE or WebSocket byte-stream).*

---

## 5. LangGraph Orchestration Architecture

PharmacoGuard uses **LangGraph** (`StateGraph`) in [workflow.py](backend/app/ai/workflow.py) to orchestrate document triage across a structured series of nodes.

### Operational State (`ComplaintState`)
```python
class ComplaintState(TypedDict, total=False):
    db: Session                  # Active database session
    complaint_text: str          # Raw document narrative
    extracted_data: dict         # 14-field structured dictionary from LLM
    ai_summary: str              # Concise executive QA summary
    risk_level: str              # Risk level (Critical, High, Medium, Low)
    priority: str                # Initial triage priority (High, Medium, Low)
    duplicate_result: dict       # DuplicateService evaluation report
    final_result: dict           # Standardized API response payload
    error: Optional[str]         # Error container for graceful degradation
```

### Node Sequence Topology

```mermaid
flowchart LR
    StartNode((START)) --> N1["Node 1: Extract Fields\n(ComplaintExtractor via Groq)"]
    N1 --> N2["Node 2: Map Summary\n(Extracted AI Summary)"]
    N2 --> N3["Node 3: Classify Risk\n(Extracted Risk Level)"]
    N3 --> N4["Node 4: Determine Priority\n(Extracted QA Priority)"]
    N4 --> N5["Node 5: Duplicate Detection\n(DuplicateService DB Audit)"]
    N5 --> EndNode((END))

    classDef default fill:#f9fafb,stroke:#d1d5db,stroke-width:1px;
    classDef nodeStyle fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    class N1,N2,N3,N4,N5 nodeStyle;
```

### Node Execution Responsibilities
1. **`extract_fields_node`**: Prompts `openai/gpt-oss-120b` in JSON mode (`temperature=0`) to extract all 14 fields and field confidences into `state["extracted_data"]`.
2. **`generate_summary_node`**: Maps the 2–3 sentence executive summary from the extraction output into `state["ai_summary"]`.
3. **`classify_risk_node`**: Maps the assessed incident risk level (`Critical`, `High`, `Medium`, `Low`) into `state["risk_level"]`.
4. **`determine_priority_node`**: Maps the operational triage priority (`High`, `Medium`, `Low`) into `state["priority"]`.
5. **`duplicate_detection_node`**: Invokes `DuplicateService.find_duplicate()` with the database session, narrative text, product, batch, category, and AI summary, assembling `state["final_result"]`.

### Error Isolation & Non-Determinism Disclosure
* **Error Isolation**: If an exception occurs in any node, it is caught and placed into `state["error"]`. Downstream nodes check for errors and exit early without crashing the server.
* **Deterministic Sequencing vs. LLM Variability**: LangGraph guarantees **deterministic node sequencing and state transitions**. However, LLM completions can exhibit minor phrasing variations between runs.

---

## 6. Semantic Duplicate Detection Engine

Duplicate detection in [duplicate_service.py](backend/app/services/duplicate_service.py) uses a **Multi-Representation Semantic Engine** to catch paraphrased reports that traditional exact-match queries miss.

### Decision Workflow

```mermaid
flowchart TD
    Incoming["Incoming Ingestion Data\n(Product, Batch, Category, Text, Summary)"] --> Normalize["Metadata Normalization\n.strip().lower()"]
    Normalize --> QueryDB[("Query Historical Complaints\nFROM PostgreSQL")]

    subgraph MetadataMatching["Metadata Matching & Audit Extraction"]
        QueryDB --> MatchProd{"Product Name Matches?"}
        QueryDB --> MatchBatch{"Batch Number Matches?"}
        QueryDB --> MatchCat{"Category Matches?"}
    end

    subgraph SemanticScoring["Dual-Representation Embeddings"]
        Incoming --> EmbedText["EmbeddingService.encode(clean_text)\nall-MiniLM-L6-v2 (384-dim)"]
        Incoming --> EmbedSumm["EmbeddingService.encode(clean_summary)\nall-MiniLM-L6-v2 (384-dim)"]

        EmbedText --> SimNarrative["Cosine Sim: Incoming Text vs Historical Text"]
        EmbedSumm --> SimSummary["Cosine Sim: Incoming Summary vs Historical Summary"]

        SimNarrative --> MaxScore["Select Maximum Valid Similarity:\nsim_score = max(narrative_sim, summary_sim)"]
        SimSummary --> MaxScore
    end

    MatchProd -->|"Candidate Comparison"| EvalThreshold{"Product & Batch Both Match?"}
    MatchBatch -->|"Candidate Comparison"| EvalThreshold
    MatchCat -->|"Diagnostic Context"| Reasoning["Record Category Match in Audit Log\n(Diagnostic info - does not alter threshold)"]

    EvalThreshold -->|"Yes: Exact Batch Match"| Thresh70["Applied Threshold = 0.70 (70%)"]
    EvalThreshold -->|"No: Cross-Batch or Default"| Thresh85["Applied Threshold = 0.85 (85%)"]

    MaxScore --> Compare{"sim_score >= Applied Threshold?"}
    Thresh70 --> Compare
    Thresh85 --> Compare

    Compare -->|"Yes: Exceeds Threshold"| FlagDuplicate["Flag Potential Duplicate\n(is_duplicate = True, record matched ID & score)"]
    Compare -->|"No: Below Threshold"| FlagUnique["Mark as Unique\n(is_duplicate = False)"]
```

### Engineering Details
* **384-Dimensional Dense Vectors**: `sentence-transformers/all-MiniLM-L6-v2` encodes text into normalized vectors where dot product equals cosine similarity.
* **Dual-Representation Scoring**: LLM narrative extraction lengths can be asymmetric (e.g., 290 characters vs. 1,162 characters). The service embeds both the narrative and the concise AI summary, selecting the maximum valid score:
  `sim_score = max(narrative_similarity, summary_similarity)`
* **Role of Metadata Matching**:
  * **Product and Batch Matching**: When both product name AND batch number match, the threshold is calibrated to **0.70 (70%)**.
  * **Otherwise**: The threshold is set to **0.85 (85%)**.
  * **Complaint Category Matching**: Category match (`cat_match`) is tracked for diagnostic reasoning in audit logs, but does not alter the similarity threshold or filter candidates out.
* **In-Memory Comparison**: In this implementation, historical records are loaded from PostgreSQL and embedded in memory at evaluation time. While this reduces false negatives from length asymmetry, duplicate detection flags potential duplicates for human review and does not guarantee complete blockage of all variations.

---

## 7. QA AI Copilot & Conversational Parser

```mermaid
flowchart TD
    UserInput["User Enters Message in Copilot Input"] --> CheckMode{"Is Document Ingested & Active?"}

    CheckMode -->|"No: Idle Workspace"| TextIngest["Trigger Direct Text Ingestion\nPOST /api/v1/upload/text"]

    CheckMode -->|"Yes: Active Document"| ParseIntent["Client-Side Intent Parser\n(conversationalParser.js)"]

    ParseIntent --> RegexMatch{"Matches Mutation Commands?\ne.g., change batch to X or set severity to High"}

    RegexMatch -->|"Yes: Form Modification"| ClientUpdate["Client-Side Action:\n1. Update formValues[field] = value\n2. Mark field in modifiedFields\n3. Visually highlight field in UI\n4. Append confirmation to Chat Log"]

    RegexMatch -->|"No: Narrative Query"| BackendQuery["POST /api/v1/upload/chat\nPayload: {complaint_text, question}"]

    BackendQuery --> GroqCopilot["Groq LLM (openai/gpt-oss-120b)\nGrounded strictly in complaint narrative"]

    GroqCopilot --> CopilotResponse["Return: {answer: '...'}\nAppend Answer to Chat Log"]
```

### Two Distinct Operational Modes
1. **Client-Side Form Modification ([conversationalParser.js](frontend/src/utils/conversationalParser.js))**:
   * Uses regular expressions and keyword maps to match verbs (`change`, `set`, `update`) and field names (`batch`, `severity`, `product`).
   * Updates component state directly without an LLM round-trip, highlighting modified fields in amber.
2. **Backend Analytical Copilot (`POST /api/v1/upload/chat`)**:
   * For general questions (e.g., *"Were any adverse patient events reported?"*), the query and current narrative are sent to Groq.
   * Grounded system prompts instruct the model to answer based only on the provided text, stating when information is missing rather than inventing facts. (Note: LLM completions cannot be guaranteed 100% free of hallucinations; reviewers must verify responses).

---

## 8. Database Architecture & Ledger Schema

```mermaid
erDiagram
    COMPLAINTS {
        uuid id PK "Practically unique UUID4"
        varchar complaint_id UK "Sequential ID (CMP-YYYYMMDD-XXXX)"
        varchar product_name "Product / Drug Name"
        varchar batch_number "Batch / Lot Number"
        varchar complainant_name "Reporter Full Name"
        text complaint_text "Full Complaint Narrative"
        varchar severity "Severity (Critical, High, Medium, Low)"
        varchar status "Status (Pending, Reviewed, Duplicate, Closed)"
        varchar product_strength "Product Strength"
        varchar customer_organization "Hospital, Pharmacy, Distributor"
        varchar customer_contact "Phone, Email, Address"
        varchar complaint_source "Email, Letter, Phone, Web"
        varchar dosage_form "Tablet, Capsule, Injection"
        varchar manufacturing_date "MFG Date string"
        varchar expiry_date "EXP Date string"
        varchar quantity_affected "Quantity affected"
        varchar complaint_category "Defect category classification"
        varchar complaint_date "Date complaint occurred"
        varchar requested_action "Investigation, Replacement, Hold"
        varchar ai_risk_level "AI Risk Level (Critical/High/Medium/Low)"
        varchar priority "Initial Priority (High/Medium/Low)"
        text ai_summary "Concise AI summary"
        boolean is_duplicate "Potential duplicate flag"
        varchar duplicate_matched_id "ID of matching historical complaint"
        float duplicate_similarity "Cosine similarity score (0.0 to 1.0)"
        text duplicate_reasoning "Diagnostic explanation string"
        timestamptz created_at "Creation timestamp (UTC)"
        timestamptz updated_at "Update timestamp (UTC)"
    }
```

### Structured Extraction Fields vs. Ledger Control Fields

| Group | Field Name | Source / Determination | Purpose |
| :--- | :--- | :--- | :--- |
| **Document-Extracted** | `product_name`, `batch_number`, `product_strength`, `dosage_form` | Extracted via Groq from narrative | Primary pharmaceutical product identity |
| **Document-Extracted** | `manufacturing_date`, `expiry_date` | Extracted via Groq from narrative | Batch shelf-life and stability timeframe |
| **Document-Extracted** | `quantity_affected`, `complaint_category`, `severity` | Extracted via Groq from narrative | Scope and nature of product defect |
| **Document-Extracted** | `complainant_name`, `customer_organization`, `customer_contact`, `complaint_source` | Extracted via Groq from narrative | Incident reporter contact identity and origin |
| **Document-Extracted** | `requested_action` | Extracted via Groq from narrative | Customer's requested resolution (quarantine, credit, replacement) |
| **Temporal Incident** | `complaint_date` | Extracted via Groq from narrative (defaults to intake date if omitted) | Date the incident occurred or was reported |
| **AI-Derived Analytics**| `ai_summary` | Generated by Groq in Node 2 | Concise 2–3 sentence executive summary |
| **AI-Derived Analytics**| `ai_risk_level`, `priority` | Mapped in Nodes 3 & 4 | Risk triage categorization and operational priority |
| **Duplicate Audit** | `is_duplicate`, `duplicate_matched_id`, `duplicate_similarity`, `duplicate_reasoning` | Calculated in Node 5 by `DuplicateService` | Audit trail linking potential duplicate incidents |
| **Ledger System Control**| `id` | `uuid.uuid4()` | Practically unique internal primary key |
| **Ledger System Control**| `complaint_id` | `ComplaintService.generate_complaint_id()` | Sequential human-readable business ID (`CMP-YYYYMMDD-XXXX`) |
| **Ledger System Control**| `status` | System lifecycle | `Pending` on intake (or `Duplicate`), `Reviewed` on human verification |
| **Ledger System Control**| `created_at` | Database server timestamp (UTC) | Record creation timestamp |
| **Ledger System Control**| `updated_at` | Database server timestamp (UTC) | Record mutation timestamp (`onupdate=datetime.now(UTC)`) |

---

## 9. Technology Stack

Verified against [package.json](frontend/package.json) and [requirements.txt](backend/requirements.txt):

| Category | Technology | Verified Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | `19.2.7` | UI library and concurrent component rendering |
| **Build Tool** | Vite | `8.1.1` | ESM development server and production bundler |
| **State** | Redux Toolkit | `2.12.0` | Global state for dashboard registry and KPI metrics |
| **Styling** | Tailwind CSS | `4.3.3` | Utility-first styling framework |
| **Routing** | React Router DOM | `7.18.1` | Client-side routing (`/`, `/complaint`, `/dashboard`, `/complaint/:id`) |
| **HTTP Client** | Axios | `1.13.6` | Asynchronous REST communication with backend |
| **Icons** | Lucide React | `1.16.0` | Production UI iconography |
| **Backend** | Python | `3.13.7` / `3.11+` | Core server runtime environment |
| **API Framework** | FastAPI | `0.139.2` | High-performance asynchronous REST API framework |
| **ASGI Server** | Uvicorn | `0.44.0` | Standard ASGI web server implementation |
| **Database** | PostgreSQL | `17` | Relational storage for complaint ledger records |
| **ORM** | SQLAlchemy | `2.0.48` | Declarative relational database mapping |
| **Migrations** | Alembic | `1.18.4` | Relational schema versioning and migration runner |
| **Workflow Graph**| LangGraph | `1.2.9` | 5-node linear orchestration state graph |
| **LLM Client** | Groq SDK | `1.5.0` | High-throughput inference for `openai/gpt-oss-120b` |
| **Embeddings** | Sentence-Transformers | `5.3.0` | Dense vector embedding model (`all-MiniLM-L6-v2`) |
| **Vector Math** | Scikit-Learn | `1.8.0` | Cosine similarity calculations |
| **Document Parsers**| PyPDF, python-docx, extract-msg | Modern | Multi-format text extraction (.pdf, .docx, .msg) |

---

## 10. API Documentation

### Registered REST Endpoints

| Method | Path | Request Body | Response Model | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/health` | *None* | `HealthResponse` | Liveness probe verifying API and system state |
| **POST** | `/api/v1/upload/process` | `multipart/form-data` (`file`) | `AIProcessingResponse` | Uploads binary document, classifies, extracts 14 fields, and checks duplicates |
| **POST** | `/api/v1/upload/text` | `DirectTextInput` (`text`) | `AIProcessingResponse` | Directly ingests raw text, bypassing file upload |
| **POST** | `/api/v1/upload/chat` | `ChatInput` (`complaint_text`, `question`) | `ChatResponse` | Grounded narrative Q&A using Groq LLM |
| **POST** | `/api/v1/complaints` | `ComplaintCreate` | `ComplaintResponse` (201) | Directly registers a structured complaint record |
| **GET** | `/api/v1/complaints` | Query params (`skip`, `limit`, `status`, `search`) | `List[ComplaintResponse]` | Retrieves paginated and filtered list of complaints |
| **GET** | `/api/v1/complaints/{id}` | Path param (`id` or `complaint_id`) | `ComplaintResponse` | Retrieves single complaint by UUID or business ID |
| **PATCH** | `/api/v1/complaints/{id}` | `ComplaintUpdate` | `ComplaintResponse` | Updates fields or transitions status (e.g., to `Reviewed`) |
| **DELETE**| `/api/v1/complaints/{id}` | Path param (`id` or `complaint_id`) | `{"detail": "..."}` | Removes a complaint record from the database |

---

## 11. Repository Structure

```text
ai-powered-complaint-management/
├── backend/
│   ├── alembic.ini                     # Database migration configuration
│   ├── requirements.txt                # Python backend dependencies
│   ├── migrations/
│   │   ├── env.py                      # Dynamic database URL resolution
│   │   └── versions/                   # Migration versions (e.g., 001_initial_complaints.py)
│   ├── app/
│   │   ├── main.py                     # FastAPI application factory and router registration
│   │   ├── core/
│   │   │   ├── config.py               # Robust .env discovery and Pydantic settings
│   │   │   └── database.py             # SQLAlchemy engine and session dependency
│   │   ├── models/
│   │   │   └── complaint.py            # Declarative SQLAlchemy models (Complaint)
│   │   ├── schemas/
│   │   │   ├── complaint.py            # Pydantic schemas (ComplaintCreate, Response)
│   │   │   └── upload.py               # Schemas for direct text and chat endpoints
│   │   ├── api/
│   │   │   ├── router.py               # Consolidated v1 APIRouter
│   │   │   └── v1/
│   │   │       ├── upload.py           # Document upload, text ingestion, and chat endpoints
│   │   │       └── complaints.py       # Complaint CRUD endpoints
│   │   ├── services/
│   │   │   ├── upload_service.py       # File extension validation and sanitized disk write
│   │   │   ├── parser_service.py       # Text extraction (.pdf, .docx, .msg)
│   │   │   ├── duplicate_service.py    # Multi-representation semantic duplicate detection
│   │   │   ├── embedding_service.py    # In-memory sentence-transformers embedding helper
│   │   │   └── complaint_service.py    # Business ID generation (CMP-YYYYMMDD-XXXX) and queries
│   │   ├── ai/
│   │   │   ├── classifier.py           # Relevance gatekeeper using Groq
│   │   │   ├── extractor.py            # 14-field structured extraction via Groq JSON mode
│   │   │   └── workflow.py             # 5-node LangGraph linear StateGraph workflow
│   │   └── uploads/
│   │       └── .gitkeep                # Local document storage directory (binaries gitignored)
│   └── tests/
│       ├── test_duplicate_service.py   # Isolated unit tests for duplicate detection logic
│       └── test_regression.py          # Regression test suite
├── frontend/
│   ├── package.json                    # Node dependencies and build scripts
│   ├── vite.config.js                  # Vite bundler configuration and /api proxy
│   ├── tailwind.config.js              # Tailwind CSS styling configuration
│   ├── src/
│   │   ├── main.jsx                    # Application entry point with Redux Provider
│   │   ├── App.jsx                     # Root router configuration
│   │   ├── store/
│   │   │   ├── index.js                # Redux Toolkit store setup
│   │   │   └── complaintSlice.js       # Global state for dashboard registry
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing page with workflow introduction
│   │   │   ├── Complaint.jsx           # Two-panel intake workspace (form + Copilot)
│   │   │   └── Dashboard.jsx           # Operational dashboard with KPI cards and registry table
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation header
│   │   │   ├── Footer.jsx              # Application footer
│   │   │   └── CaseDrawer.jsx          # Detailed slide-out audit inspector
│   │   └── utils/
│   │       └── conversationalParser.js # Client-side regex command parser for Copilot
├── docs/
│   └── images/                         # Application screenshots for documentation
├── .gitignore                          # Excludes .venv, node_modules, .env, and uploads/*
└── README.md                           # Comprehensive documentation
```

---

## 12. Local Setup & Execution Guide

### Prerequisites
* **Python**: `3.13.7` or `3.11+`
* **Node.js**: `20.19+` or `22.12+` (tested on Node `v24.11.1`)
* **PostgreSQL**: Version 17 installed and running (configured for port `5433` or standard `5432`)
* **Groq Cloud API Key**: Active API key from [Groq Console](https://console.groq.com)

### Step 1: Clone Repository
```powershell
git clone https://github.com/Sumeet2005/ai-pharmaceutical-complaint-system.git
cd ai-pharmaceutical-complaint-system
```

### Step 2: Configure Environment Variables
Create `backend/.env` based on `backend/.env.example`:
```ini
# PostgreSQL Connection URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/pharma_complaints

# Groq Cloud API Key and active model
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# CORS configuration
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Step 3: Create PostgreSQL Database
```powershell
# Using createdb (adjust port if running on 5432 or 5433)
createdb -h localhost -p 5433 -U postgres pharma_complaints

# Or inside psql:
# CREATE DATABASE pharma_complaints;
```

### Step 4: Python Virtual Environment & Migrations
```powershell
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Run Alembic migrations from backend directory
cd backend
alembic upgrade head
cd ..
```

### Step 5: Start FastAPI Backend
```powershell
# From repository root
.venv\Scripts\uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Health Check*: Verify at `http://127.0.0.1:8000/health` (returns `{"status": "healthy"}`).

### Step 6: Start Frontend Client
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
*Access Application*: Open `http://localhost:5173` in your browser.

---

## 13. Manual Testing & Verification Guide

1. **Access Workspace (`/complaint`)**: Open the browser and navigate to the intake page.
2. **Ingest a Complaint Document**: Upload a pharmaceutical complaint PDF.
   * *Observation*: The progress indicator activates, followed by form population with 14 extracted fields.
   * *Observation*: The record is initially persisted in PostgreSQL with `Pending` status.
3. **Upload Non-Complaint (Negative Path Validation)**: Upload a general invoice or resume.
   * *Observation*: The gatekeeper classifies the document as non-compliant, halts processing, and displays a rejection card.
4. **Verify Copilot Narrative Q&A**: In the right panel, ask: *"What packaging defects were noted?"*
   * *Observation*: The Copilot answers using the source narrative context.
5. **Test Natural Language Form Modification**: Type: *"change batch number to DEMO-2026-999"*.
   * *Observation*: `conversationalParser.js` updates the Batch Number field and highlights it in amber.
6. **Commit Record to Ledger**: Click **Commit to Ledger** and confirm.
   * *Observation*: `PATCH /api/v1/complaints/{id}` updates the record to `Reviewed` status and redirects to the Dashboard.
7. **Verify Semantic Duplicate Detection**: Upload a second document sharing the same product and batch number.
   * *Observation*: The engine scores the dual representations, flags the document as a potential duplicate, and renders a comparison card showing the matched complaint ID.
8. **Verify Operations Dashboard (`/dashboard`)**: Use the search input to filter records by product or batch. Click a row to open the full case audit view.

---

## 14. Automated & Regression Testing

### 1. Isolated Duplicate Engine Tests ([test_duplicate_service.py](backend/tests/test_duplicate_service.py))
Verifies 7 edge cases (batch match thresholding, summary fallbacks, cross-batch rejection, empty text handling) using mocked embeddings and DB sessions:
```powershell
.venv\Scripts\python.exe backend/tests/test_duplicate_service.py
```
**Output**: `Ran 7 tests in ... - OK`

### 2. Frontend Production Build
```powershell
cd frontend
npm run build
```
**Output**: `✓ built in ...` (`dist/assets/index-*.js` gzip: ~124 kB).

---

## 15. Security, Limitations & Future Roadmap

### Current Design Boundaries
* **No Authentication/RBAC**: The application does not currently feature user login, JWT tokens, or role-based access controls.
* **Local File Storage**: Files are saved to local disk (`backend/app/uploads/`) rather than cloud object storage (S3/GCS).
* **In-Memory Duplicate Scan**: Historical records are embedded in memory at query time, suitable for small-to-medium registries.
* **Extension-Based Check**: File validation inspects extensions (`.pdf`, `.docx`, `.msg`) rather than binary magic bytes.
* **PyTorch Cold Start**: First embedding execution incurs a 5–8 second latency while PyTorch loads `all-MiniLM-L6-v2`.
* **No OCR Engine**: Scanned PDFs without a digital text layer are not parsed.

### Future Roadmap
* [ ] **OAuth2 & RBAC**: Integration with Auth0/Okta for `QA Operator`, `Reviewer`, and `Auditor` roles.
* [ ] **Vector Database Indexing**: Migration to **PostgreSQL `pgvector`** with HNSW indexing for scalable vector retrieval.
* [ ] **Cloud Storage**: Transition from local disk to encrypted Amazon S3 buckets.
* [ ] **OCR Ingestion**: Multimodal OCR pipeline for scanned paper forms.
* [ ] **Asynchronous Workers**: Offload document parsing to Celery / Redis task queues.

---

## License

This repository is maintained as an engineering portfolio project and technical demonstration.
*(No standalone open-source license file is currently included in the repository).*
