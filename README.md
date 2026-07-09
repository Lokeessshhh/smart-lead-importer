# GrowEasy AI-Powered CSV CRM Importer

An enterprise-grade, AI-powered CSV Importer designed to intelligently parse, clean, normalize, and map raw CRM lead datasets into standard GrowEasy CRM schemas.

## 🚀 Tech Stack
* **Frontend**: Next.js 16 (App Router), Tailwind CSS, Lucide icons, PapaParse (local streaming parsing).
* **Backend**: Node.js, Express, Multer (multipart handling), Groq SDK (Llama 4 / Llama 3 models), Dotenv.

---

## ✨ Features & Evaluation Criteria Implemented

### 1. AI Prompt Engineering & Extraction
* **Misplaced contact recovery**: Intelligently extracts mobile numbers or emails incorrectly supplied in "Name" or "Email" fields, shifts them to the correct contact columns, and clears the polluted name/email cells.
* **Casing Normalization**: Normalizes uppercase names (e.g. `MR. VIKRAM MALHOTRA` -> `Vikram Malhotra`).
* **Name Title Cleaning**: Stris prefixes like `Dr.`, `Mr.`, `Mrs.`, `Ms.`, `Prof.` and suffixes like `Jr.`, `Sr.` from name values during ingestion.
* **Strict Enum status underscores**: Restricts lead statuses to `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, and `SALE_DONE` with strict underscores.
* **Source Info Filtering**: Automatically clears unrecognized data source strings (e.g. Google, Facebook) to blank `""`, while retaining authorized sources (e.g. `leads_on_demand`, `sarjapur_plots`).
* **Possession Timeline extraction**: Maps possession columns (e.g. "Ready Now", "2 years") to `possession_time` and excludes them from notes to prevent column duplication.

### 2. Backend Architecture & Robustness
* **Exponential Backoff Retry**: Groq rate limits are managed via exponential backoff retry middleware with randomized jitter on `429` status codes.
* **Row Contamination prevention**: Employs programmatic **Index-Based Alignment**. Prepend row indices to batch requests, forcing the LLM to output mapping indices which are then validated to prevent notes crossing between rows.
* **JSON Mode Schema Enforcement**: Configures the Groq chat completion API with `response_format: { type: "json_object" }` alongside a structured system schema.
* **Post-Processing fallback validation**: Programmatic mapper functions run post-parse to guarantee statuses, casing, and data source cleanups conform to schema constants even if the LLM hallucinated.

### 3. Frontend UX & Table Pagination
* **Drag & Drop Upload**: Dash-bordered dropzone with upload state transitions.
* **Local Preview Grid**: High-performance, sticky-header table showcasing CSV columns immediately on load.
* **Animated AI Loader**: Frosted glass progress overlay displaying rotating execution states ("Cleaning title prefixes...", "Excluding non-approved data sources...") and shimmering progress percentage bars.
* **Leads Dashboard & Virtualization Pagination**:
  * Visual cards summarizing Mapped vs. Skipped counts.
  * Navigation Tabs to filter records between "All Processed", "Imported Leads", and "Skipped Rows".
  * **Table Pagination (20 items/page)** acting as a virtualization view to prevent rendering lag on large files.
  * **Export mapped leads** action button to download the parsed records array in JSON format.

---

## 🛠️ Setup & Running Locally

### 1. Environment Configurations
Create a `/backend/.env` file:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

### 2. Running Services Locally
Ensure Node.js (v18+) is installed.

**Start the Express Backend:**
```bash
cd backend
npm install
npm run dev
```
Running on: `http://localhost:5000`

**Start the Next.js Frontend:**
```bash
# From root directory
npm install
npm run dev
```
Running on: `http://localhost:3000`

---

## 🐳 Docker Setup (Multi-Container Orchestration)

To spin up the entire application (Next.js client + Express API) inside isolated containers:

```bash
docker-compose up --build
```
* **Frontend Access**: [http://localhost:3000](http://localhost:3000)
* **Backend Access**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Running Integration Tests

Offline testing scripts are provided in the `/backend` folder to validate edge-cases, casing normalizations, status formatting, and name cleaning without requiring the frontend:

```bash
cd backend
# Run integration test suite
node test.js

# Run hard/brutal CSV files mapping test
node test_brutal_csv.js
```
