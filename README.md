# Mitra — MITCORER Barshi Virtual Assistant

Mitra is a public, text-based virtual assistant for MIT College of Railway Engineering and Research (MITCORER), Barshi. Users ask questions through a floating chat widget without signing in. The assistant answers from stored, published college knowledge, with optional Google Gemini generation for some open-ended questions.

## What the Assistant Covers

- College overview, courses, intake, and contact details.
- Fees, scholarships, eligibility, and required documents.
- Admission process information and relevant official links.
- Hostel, mess, transport, library, laboratories, and placement information.
- Recognition of common English, Marathi, Hindi, and transliterated topic phrases.
- English/Marathi/Hindi response selection, native rendering of maintained fee/intake tables, and reviewed passage translations with explicit fallback when unavailable. See [language scope and validation](docs/MITRA_MULTILINGUAL_RESPONSES.md).

Answers depend on the knowledge available in the project. The assistant does not browse the college website live for each question or guarantee admission, scholarships, accommodation, or placements.

## Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Chat interface | React 19, JavaScript/JSX, CSS | Chat launcher, question input, messages, loading and error states |
| Frontend tooling | Vite 8, Lucide React | Development/build tooling and interface icons |
| Backend | Node.js built-in HTTP module | Public API, validation, retrieval, and answering logic |
| Storage | SQLite through node:sqlite | Persistent knowledge and application records |
| Optional generation | Google Gemini API | Evidence-grounded generation for selected questions |
| Deployment | Docker Compose and Nginx | Container runtime, static frontend hosting, and API proxy |

## How a Question Is Answered

1. The user enters a question in the React chat widget.
2. The frontend sends JSON to POST /api/public-assistant/ask using fetch().
3. The backend validates the question and applies bounded multilingual query normalization, extracting branch, admission route, academic year, fee category/gender and service scope. Missing or ambiguous details can trigger clarification. See [query understanding and validation](docs/MITRA_QUERY_UNDERSTANDING.md).
4. It searches only published knowledge using weighted keyword matches, categories, tags, and topic-specific rules. Up to three records are retrieved; a relevance threshold controls whether evidence is attached.
5. Supported factual questions use direct, programmed answers and stored information.
6. If no direct rule answers the question but relevant evidence exists, the backend can send the question and up to two records to Gemini.
7. If Gemini is unavailable, times out, or reports insufficient evidence, stored information is used as a fallback. Unsupported questions receive an explicit no-official-answer response.
8. The backend returns JSON containing the answer and available source information; React displays it.

This is keyword/rule-based retrieval with optional generation. There are no embeddings, vector database, or custom-trained model. Gemini instructions constrain answers to evidence, but generated text has no independent factual validation stage.

## Main Files

| File | Responsibility |
| --- | --- |
| frontend/src/App.jsx | PublicAssistantWidget: chat launcher, panel, input, and displayed messages |
| frontend/src/api.js | Frontend requests to the public assistant API |
| frontend/src/index.css | Chat styling and positioning |
| backend/src/server.js | Question validation, topic routing, retrieval, answers, and Gemini calls |
| backend/src/query-understanding.js | Shared domain normalization, query fields and clarification decisions |
| backend/src/query-scope.js | Academic-year parsing and positive/excluded branch and service scope |
| backend/src/seed.js | Initial college knowledge records and source metadata |
| backend/src/store.js | SQLite loading and persistence |
| backend/src/config.js | Database path, backend settings, and Gemini configuration |

## Knowledge Storage and Maintenance

The default database is backend/data/mitra.sqlite. SQLite contains a collections table; the app row stores application data as JSON, including knowledge records. This is not a normalized table-per-entity database.

Knowledge records include a title, category, text, source, optional source URL, and publication status. The backend loads the knowledge into memory and saves application changes through store.js.

Seed records in backend/src/seed.js initialize a new database only. Existing databases retain their maintained knowledge and source library during saving and restarting; seed changes do not overwrite records, republish drafts, or reinsert removed entries. Administrators can edit or retire individual records in the knowledge interface, with revision checks preventing stale saves. Academic fees, hostel/mess fees, current B.Tech intake and historical seat-matrix answers use designated maintained published records. New seed records support structured fact tables; older text records remain unchanged until deliberately converted. See [knowledge maintenance](docs/MITRA_KNOWLEDGE_MAINTENANCE.md) for canonical records, API contracts and limitations. Use the protected source review/publish workflow for document updates. Back up data before deliberate migrations; do not delete the database to refresh knowledge. Other answer rules and legacy planner screens still contain independent facts and require later consolidation.

The underlying code also retains protected source-management APIs. They are not public chat features and require administrator authentication. Their ingestion code supports TXT/CSV, PDF extraction through Poppler, and English OCR through Tesseract. DOCX/XLSX require manually supplied verified text. Reviewed text is published in chunks of up to 2,800 characters; original source files are stored under backend/official-sources/ when the backend is started from its directory. Docker installs the PDF/OCR tools; local extraction requires those tools separately.

To inspect the database, open backend/data/mitra.sqlite in a SQLite viewer and browse collections → app → data. The knowledge array contains the stored knowledge. Do not commit database files or secrets.

## Conversation Behavior

Compound questions can return separate supported or unsupported sections with numbered record references. Ambiguous intake references ask which programme is meant; preceding messages do not resolve them. See [compound answering and clarification](docs/MITRA_COMPOUND_QUESTIONS.md) for supported facets and limits.

The public widget holds visible messages and a conversation ID in React state. The backend persists exchanges and uses selected category, gender, branch, route, topic and academic-year fields for heuristic follow-ups. Refreshing or resetting the widget loses its active conversation ID; it does not delete stored exchanges. Public conversations are limited to 200 stored messages (100 exchanges), with at most 200 public conversations retained. Conversation-ID session isolation and retention policy require further review before public deployment.

Fee follow-ups preserve the original wording and explicit route/year qualifiers. Missing fields can be added from context; ambiguous category/gender questions still request clarification. Fee responses do not append independent hardcoded profile amounts. Recognized critical factual topics bypass optional advisory generation.

For the current research framing, implemented corrections and evidence requirements, see [research scope and evaluation plan](docs/RESEARCH_SCOPE_AND_EVALUATION_PLAN.md). Existing draft comparative results are unverified and must not be presented as measured findings.

Research preparation now includes a [design-and-implementation manuscript](docs/MITRA_RESEARCH_MANUSCRIPT.md), [primary-source literature audit](docs/LITERATURE_VERIFICATION.md), and [independent-review packet](docs/INDEPENDENT_EVALUATION_PACKET.md). Reviewer labels and final independent measurements remain pending.

Run `npm.cmd run evaluate:verifiers` from `backend` for [reproducible synthetic verifier diagnostics](docs/VERIFIER_DEVELOPMENT_DIAGNOSTICS.md). These explicitly report missed invalid answers; `-- --strict` exits nonzero on decision errors. They do not measure live model or independent answer accuracy.

## Local Setup

Use Node.js 22.12 or newer in the Node 22 series to support the frontend tooling and built-in SQLite module.

In one terminal, from the project root:

~~~powershell
cd backend
# Create .env only if it does not already exist.
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
~~~

The backend uses built-in Node modules and currently has no external runtime dependencies.

In another terminal, from the project root:

~~~powershell
cd frontend
npm ci
npm run dev
~~~

Open http://127.0.0.1:5173. The backend health endpoint is http://127.0.0.1:4000/api/health. Vite proxies /api requests to the backend.

## Optional Gemini Configuration

Set these values in backend/.env and restart the backend:

~~~dotenv
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
~~~

The key authenticates backend requests to Google's model service; it is not the source of college knowledge. Keep it out of frontend code and version control. Direct supported answers work without Gemini. Generation uses a 15-second timeout and temperature 0.1.

## Docker

From the project root:

~~~powershell
$env:TOKEN_SECRET = 'replace-with-a-long-random-secret'
docker compose up --build
~~~

Open http://127.0.0.1:8080. Nginx serves the frontend and proxies /api to the backend. Docker volumes preserve database and source files.

The existing backend requires TOKEN_SECRET in production even though the public assistant does not require login. The current Compose file does not forward GEMINI_API_KEY or GEMINI_MODEL, and backend/.env is not copied into the image. To enable Gemini in Docker, add those environment mappings to the backend service and supply the values through the deployment environment. Use HTTPS and the correct CORS origin for a public deployment; this repository does not establish that a live deployment exists.

## Validation

Backend checks, from backend/:

~~~powershell
npm run check
npm test
npm run evaluate
~~~

Frontend checks, from frontend/:

~~~powershell
npm run lint
npm run build
node --test test/answer-format.test.mjs
~~~

The existing backend suite includes assistant retrieval, public answers, multilingual routing, unsupported questions, source publication, and rate-limit coverage, along with retained backend functionality. The evaluator combines 360 multilingual routing cases with 140 workflow cases. It disables Gemini, so its results do not measure Gemini accuracy or general conversational intelligence. Run these commands to obtain current results; no pass rate is claimed here.

## Current Limitations

Public evaluation commands, preserved baseline, observed failures and research limitations are documented in [docs/MITRA_PUBLIC_EVALUATION.md](docs/MITRA_PUBLIC_EVALUATION.md). Run `npm run evaluate:public` from backend for diagnostics or add `-- --strict` to fail on unmet expectations. The initial questions are unreviewed development cases, not a held-out accuracy benchmark.

The offline [keyword versus BM25 comparison](docs/MITRA_BM25_COMPARISON.md) runs with `npm.cmd run evaluate:retrieval` from backend. It compares three ranking methods on the same seeded corpus, keeps the production retriever unchanged, and reports unreviewed development evidence-group metrics and local ranking latency. It does not measure overall answer accuracy.

[Miss analysis and relevance-review workflow](docs/RETRIEVAL_REVIEW_WORKFLOW.md) explains the missing passages, links blinded development-review material and prepares 24 unevaluated multilingual paraphrase candidates. Independent labels and a separately authored final held-out set remain pending.

Those 24 candidates were subsequently [executed as development diagnostics](docs/MITRA_TEST_COMPLETION.md), with reproduced crashes and scope errors fixed. They are no longer untouched held-out cases. The API retains published passage snapshots with content hashes; the public evidence expansion has been removed at the user's request. Independent human review remains unverified.

[Maintainer browser E2E](docs/MITRA_MAINTAINER_E2E.md) verifies edits, failures, conflicts, translation staleness, retirement and persistence across a separate backend-process restart. Public maintainer sign-in is deferred at the user's request; this test uses authenticated API fixtures. The public footer retains its original text, and a compact language icon beside minimize selects Automatic, English, Marathi or Hindi. From frontend, run `npm.cmd test` for unit tests and `npm.cmd run test:maintainer-browser` for the isolated browser journey; installed Chrome or Edge is required.

[Source freshness and document lineage](docs/MITRA_SOURCE_PROVENANCE.md) adds optional reviewed metadata, explicit validity/supersession checks, page-aware publication, stable passage revisions and structured-conflict refusal. Existing records without metadata remain unknown rather than being marked newly verified. Semantic claim validation and independent final evaluation remain pending.

[Answer presentation and source audit](docs/MITRA_ANSWER_SOURCE_AUDIT.md) covers every public quick reply and answer family in English, Marathi and Hindi, using seeded and read-only maintained snapshots. Programme and fee rows retain maintained values, compound sections retain their structure, and official links follow the answer topic and requested year. To reproduce the audit, run `node --no-warnings=ExperimentalWarning scripts/audit-answer-sources.js` from backend, then `npm.cmd run test:all-answers-browser` from frontend. Network access and installed Chrome are required. Detailed generated reports and browser screenshots are ignored by Git.

- Keyword retrieval can miss unfamiliar wording or retrieve imperfect matches.
- Multilingual topic recognition does not guarantee translated direct answers.
- Stored facts need maintenance; official links do not imply live synchronization.
- Public chat has no persistent history or multi-turn context.
- SQLite JSON storage is intended for a small, single-instance deployment.
- Gemini-generated responses can be incorrect despite evidence-based instructions.
- Public assistant requests are limited to 12 per client key per minute by the current in-memory backend limiter.
- Public answer and maintainer browser journeys are covered by isolated checks; live deployment and load testing remain outstanding.
