# Mitra — consolidated project status

**Updated:** 12 October 2026  
**Project:** MITCORER Barshi Virtual Assistant  
**Status:** working institutional-assistant prototype with maintained factual-answer controls, public answer/source audit coverage, and bounded multilingual query understanding. It is not yet a fully evaluated or deployed production system.

This document is the current single reference for the project. Earlier reports describe individual milestones and may contain earlier test counts or UI history; this report records the latest verified state where later work supersedes them.

## 1. Problem statement

Mitra is a public text-based assistant for MIT College of Railway Engineering and Research (MITCORER), Barshi. It helps prospective students and visitors find institution-specific information such as programmes, intake, fee structures, admissions, eligibility, documents, scholarships, facilities, placement, library and contact details.

The project goal is not simply to connect a chat screen to an AI API. It is to answer from maintained college knowledge, give deterministic answers for important factual questions, handle missing information safely, support selected English/Hindi/Marathi queries, and retain traceable official sources.

## 2. Current user experience

- Public visitors use a floating React chat widget without signing in.
- The public footer remains `Powered by MITCORER ©`; the public maintainer sign-in link was removed as requested.
- The language selector is a compact icon in the header beside the minimize control. It offers Automatic, English, Marathi and Hindi.
- Answers retain the existing card, paragraph, list, programme-table, fee-table and compound-section presentation. The previously added visible “Evidence used for this answer” panel is removed.
- Official source links are shown only where the response has a relevant source. A known obsolete library URL is automatically displayed as the working official PHP page without overwriting a maintainer’s stored data.
- Public chat is stateless: refreshing clears messages and a later question does not use an earlier message as context.
- Internal knowledge/source management APIs and workspace remain protected. Public maintainer login UI is intentionally deferred.

## 3. Implemented architecture

```text
Public visitor
  -> React/Vite chat widget
  -> POST /api/public-assistant/ask
  -> input validation + bounded query understanding
  -> published-knowledge retrieval + deterministic answer routing
  -> maintained factual renderer OR optional evidence-grounded Gemini fallback
  -> source/evidence projection
  -> public answer

Maintainer workflow
  -> authenticated protected APIs
  -> revision-checked knowledge/source update
  -> SQLite persisted application collection
```

The application is a modular monolith. There are no microservices, vector database, embeddings, fine-tuned model, multi-agent system or custom-trained classifier.

## 4. Technology stack

| Area | Implemented technology | Purpose |
| --- | --- | --- |
| Public interface | React 19, JavaScript/JSX, CSS | Chat widget, messages, input, error/loading states |
| Frontend tooling | Vite 8, Lucide React | Local development, production build and icons |
| Backend | Node.js built-in HTTP module | API, validation, authentication, retrieval and answer handling |
| Data storage | SQLite via Node `node:sqlite` | Persistent application and knowledge data |
| Retrieval | Weighted keyword/rule retrieval | Published-record retrieval and topic routing |
| Query understanding | Dependency-free bounded domain parser | Normalization, scope extraction and clarification |
| Optional generation | Google Gemini API (`gemini-2.5-flash`) | Evidence-grounded fallback for selected unanswered queries |
| Source ingestion | Poppler PDF extraction, English Tesseract OCR, TXT/CSV | Protected source review/publish workflow |
| Container deployment | Docker Compose, Nginx | Backend service and static frontend/API proxy |
| Testing | Node test runner, Playwright Core with installed Chrome/Edge | Unit, API, regression and browser checks |

## 5. How an answer is produced

1. The frontend sends the question and requested language to `POST /api/public-assistant/ask`.
2. The backend validates the input. Empty or invalid questions are rejected with a controlled 400 response rather than an internal error.
3. The query-understanding module normalizes selected known wording and extracts relevant fields: topic, programme/branch, admission route, academic year, fee category, gender and facility scope.
4. Compound-question planning separates supported parts such as programmes plus fees, hostel plus bus, or library plus another question. It keeps recognised programme names containing “and” together.
5. The backend searches published knowledge using weighted keywords, categories, tags and topic-specific rules. Retired, draft, archived and review records are excluded from public retrieval.
6. Critical factual topics use deterministic maintained records instead of asking a language model to calculate or invent facts. Key canonical records include academic fees, accommodation fees, current programme intake and the historical seat matrix.
7. If a direct answer is unavailable but relevant published evidence exists, Gemini may be called only when configured. It receives limited evidence and has a 15-second timeout. If Gemini is unavailable, times out or reports insufficient evidence, the assistant falls back safely.
8. Unsupported questions receive an explicit unsupported-information response. Ambiguous questions receive a clarification request rather than a guessed answer.
9. The response returns answer text, sections where appropriate, and safe public evidence/source information. React renders all text as text, not executable HTML.

## 6. Query-understanding improvements completed

The current parser is rule-based and deliberately bounded. It does not claim general natural-language understanding.

Implemented behavior includes:

- Common plurals and selected paraphrases, for example `prices` -> fee context, `libraries` -> library context, and reading/borrowing wording -> library.
- Unique one-edit correction for a small long-word institutional vocabulary, for example `lbrary` -> library and `scholrships` -> scholarship. It does not fuzz numbers, category codes or choice codes.
- Whole-word matching so `coffee` does not accidentally match `fee`.
- Preservation of numbers, decimal scores, choice codes, qualifications and negation.
- Recognition of first year, Direct Second Year (DSE/lateral entry), valid academic years such as `2026/27` and `2026-2027`, and invalid ranges such as `2026-29`.
- Category/gender scope for fee tables. For example, OBC girls selects the girls’ concession amount; a question giving only OBC asks for the required boys/girls detail.
- Qualification versus route distinction. “I passed class 12. What are DSE fees?” retains the qualification and selects DSE rather than treating class 12 as First Year.
- English, Hindi and Marathi conjunction handling for selected compound requests, including `तथा`, `तसेच`, CAP `फेरी`, and CAP `राउंड`.
- Positive and excluded scope. For example, “mess fees, not hostel” does not add hostel values; “not OBC” asks for the applicable category instead of guessing an amount.
- Existing seat-matrix and CAP routing remains compatible with plural `seats` and native “round” wording.

The implementation is documented in [MITRA_QUERY_UNDERSTANDING.md](MITRA_QUERY_UNDERSTANDING.md).

## 7. Knowledge, source maintenance and persistence

### Storage

- Default database: `backend/data/campusguard.sqlite`.
- SQLite has a `collections` table; the `app` row stores application JSON, including the knowledge array. This is suitable for the current small, single-instance academic-project scope, not a normalized high-scale data model.
- Seed data initializes a newly created database only. Restarting or saving does not overwrite, recreate or republish existing maintainer records.
- Tests use temporary isolated databases; they do not reset the maintained local database.

### Knowledge records

Records can contain title, category, source authority, official URL, tags, text, publication status, revision, structured facts and source lineage metadata. Supported statuses are `Published`, `Review`, `Archived`, `Draft` and `Retired`.

- Only `Published` records can support public answers.
- Protected creation and update APIs require administrator authorization.
- Updates use `expectedRevision`; stale edits receive a 409 revision-conflict response.
- Staff can view knowledge but cannot modify it.
- Source URLs accept HTTP/HTTPS only and reject embedded credentials or unsafe schemes.
- Structured facts validate amounts, academic years, programme names, intake and choice codes.
- Retired/missing canonical facts do not silently fall back to obsolete hardcoded fee or intake values.

### Canonical maintained factual records

| Record | Current controlled response family |
| --- | --- |
| KB-2 | Academic fee tables and route/category-specific fee answers |
| KB-3 | Hostel, refundable deposit and annual mess fees |
| KB-10 | Current First Year B.Tech programme names, intake and choice codes |
| KB-6 | Historical seat matrix |

Some older answer routes and retained legacy planner functionality still contain independent information. The project does not yet claim every institutional fact has a single source of truth.

### Provenance and source behavior

- Source publication supports reviewed text, TXT/CSV, PDF extraction and English OCR. DOCX/XLSX require verified supplied text.
- Published passages have stable record/revision identifiers, content-bound hashes, bounded excerpts and optional source-document metadata.
- Available optional provenance: academic year, document ID/version, page/section, official URL, validity dates, review state and supersession information.
- Missing page, year, verification or validity data remains unknown; the system does not invent it.
- Explicitly expired, superseded or conflicting critical records are guarded rather than selected silently.
- Reviewed translations are tied to source content. A text edit makes a previous review stale and falls back explicitly to English where no reviewed translation is available.

## 8. Answer format and official links

The answer audit restored and preserved the format requested by the user:

- First Year B.Tech, Polytechnic and Direct Second Year programme rows preserve their maintained programme names, intake and codes.
- First Year and DSE fee answers preserve category rows and exact maintained values.
- Hostel answers preserve hostel amount, refundable deposit, hostel total, annual mess and caution text.
- Compound questions show separate labelled sections and do not flatten them into unrelated prose.
- Existing explicit paragraphs, bullet points, warnings and English-fallback notices are retained.
- The assistant does not show the removed evidence-expansion panel.
- Links are deduplicated and tied to the answer topic/year. Unrelated retrieved links are not displayed as evidence.
- B.Tech fees are not substituted for Polytechnic questions; transport questions use transport evidence; other academic years do not receive a hardcoded current-year portal.

Verified link corrections include the official library page:

- Correct current URL: `https://mitcorer.edu.in/about-lib-details.php`
- Historical stored `.html` library URL remains documented as obsolete and is not emitted as the public link.

## 9. Language support

The public widget can select Automatic, English, Marathi or Hindi.

Implemented:

- Recognition of selected English, Marathi, Hindi and transliterated topic phrases.
- Native rendering for maintained fee and intake tables.
- Reviewed native passage translations where source-content hashes match the reviewed translation.
- Explicit English fallback when a requested passage has no reviewed translation.
- Native clarification templates for selected fee category/gender, route, year and fee-scope ambiguities.

Not yet proven:

- Formal competent-speaker approval for all Marathi/Hindi wording.
- Full native-language coverage for every stored passage or Gemini-generated answer.
- General translation quality beyond automated format/content checks.

## 10. Security and reliability controls present

- Backend-only Gemini key; it is not exposed to frontend code.
- Production mode requires `TOKEN_SECRET`.
- Configurable CORS origin.
- Server-side authentication and role checks for protected maintenance functions.
- Password hashing, refresh-token rotation and logout revocation are retained from the underlying project.
- Revision checks prevent silent lost updates in the supported single-backend model.
- Request validation and controlled errors avoid exposing internal stack traces for ordinary invalid public input.
- Published-only public retrieval; internal reviewer metadata and arbitrary record metadata are excluded from public evidence projection.
- Text is rendered safely as literal text in the frontend.
- Public assistant rate limiting exists in-memory. Current documentation records a limit of 12 requests per client key per minute for the public route; environment configuration also supports `ASSISTANT_RATE_LIMIT_MAX` for local configuration. This needs proxy-aware production verification before deployment.
- Upload/source workflows include existing type/signature protections and administrator authorization.

## 11. Current local setup

Use Node.js 22.12 or newer in the Node 22 series.

Backend terminal:

```powershell
cd "A:\Projects\Mitra Clone\backend"
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd run dev
```

Frontend terminal:

```powershell
cd "A:\Projects\Mitra Clone\frontend"
npm.cmd ci
npm.cmd run dev
```

- Frontend: `http://127.0.0.1:5173`
- Backend health endpoint: `http://127.0.0.1:4000/api/health`
- Vite proxies `/api` to the backend.
- The backend development command does not watch source files. Restart it after backend code changes.

Optional Gemini configuration belongs only in `backend/.env`:

```dotenv
GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-2.5-flash
```

Never commit `.env`, local databases, uploads, extracted official source files, backups, log files or `node_modules`. The repository `.gitignore` covers these paths.

## 12. Docker and deployment state

Docker Compose and Nginx configuration exist. The intended command is:

```powershell
$env:TOKEN_SECRET = 'replace-with-a-long-random-secret'
docker compose up --build
```

The configured local container entry point is `http://127.0.0.1:8080`. Docker volumes preserve database, uploads and official source files.

Deployment is **not verified as live or production-ready**. Before public deployment, complete:

- production maintainer credential provisioning and removal of demo-account reliance;
- HTTPS, production cookie behavior and actual CORS domain configuration;
- proxy-aware rate limiting or Nginx enforcement;
- Gemini environment mappings in Docker if generation is intended (`GEMINI_API_KEY` and `GEMINI_MODEL` are currently not forwarded by Compose);
- health/smoke test, backup/restore exercise, logs/monitoring and rollback instructions;
- a load/concurrency test appropriate to expected use.

## 13. Latest verification evidence

These are automated development/regression results. They establish the named checks only; they do not prove general answer accuracy, fluent translation quality, live-source currency or production readiness.

| Validation area | Latest verified result | What it checks |
| --- | ---: | --- |
| Backend test suite | 114/114 passed | API validation, persistence, structured facts, knowledge authorization, source rules, routing, query understanding and retained functionality |
| Backend syntax check | passed | `server.js` parses |
| Legacy evaluator | 500/500 passed | Existing routing/content regression expectations with Gemini disabled |
| Public diagnostic evaluator | 18/18 passed | Supported, unsupported, ambiguity, language, compound and evidence contract cases |
| Paraphrase diagnostics | 24/24 contract and 24/24 developer diagnostics | Exposed development questions, Gemini disabled |
| Independent semantic review | 0 reviews | Not completed; no accuracy claim may be based on the 24 diagnostics |
| Frontend unit suite | 15/15 passed | Answer-format preservation, source links, fee/programme rendering and refresh-token helper behavior |
| Language browser checks | passed, 14 real API journeys | Language selector, native output paths, keyboard/mobile, empty submit, literal rendering, network recovery and errors |
| Maintainer browser checks | passed | API fixture login, edit failure preservation, revision conflict, translation staleness, restart persistence, retirement and authorization |
| Comprehensive browser answer audit | 426/426 real API journeys passed | 71 questions × 3 languages × seeded/read-only-maintained knowledge; factual numbers, links, notices, mobile overflow and no evidence panel |
| Source-link reachability audit | 30/30 emitted external URLs reachable on audit date | Availability of emitted links at the time of audit; not factual proof of linked page content |

The 24 paraphrase questions have been executed and are now exposed development diagnostics. They cannot be presented as a final untouched held-out evaluation set.

## 14. BM25 and retrieval research status

The production retriever remains weighted keyword/rule retrieval.

- SQLite FTS5 BM25 comparison tooling exists.
- Earlier development comparison showed the keyword implementation had stronger results than raw BM25 on its small seeded development corpus, while normalized BM25 improved over raw BM25 but did not justify changing production retrieval.
- The comparison corpus/questions were development material, not independently reviewed and not held out.
- Query normalization changed after that experiment, so earlier benchmark hashes/results are historical and must not be used to claim a current retrieval improvement.

Before adopting BM25, semantic retrieval or a hybrid method, the project needs frozen corpus snapshots, independently reviewed relevance labels, a separately authored final test set, and reported Recall@K/MRR/latency/cost under the same conditions.

## 15. Known limitations

1. Retrieval and query interpretation remain bounded keyword/rule systems. Unfamiliar paraphrasing, indirect requests, complex negation and new terminology can fail.
2. Gemini output has evidence-grounding instructions but no independent claim-level factual validation yet.
3. Source links and evidence records improve traceability but do not prove every generated claim is entailed by a passage.
4. Stored facts require active maintainer review; the assistant does not live-browse the college website for every answer.
5. Current public chat has no persistent multi-turn conversation context, reset controls or session memory.
6. Competent-speaker approval and full reviewed Marathi/Hindi prose coverage are not complete. Uncovered content uses an explicit English fallback.
7. The automated diagnostics are developer-authored/exposed. Independent relevance judgments and a final held-out benchmark remain pending.
8. SQLite JSON storage and in-memory rate limiting fit a small single-instance project, not an unmodified horizontally scaled deployment.
9. The codebase retains unrelated legacy applicant/workflow functionality, which increases architectural complexity and means not all facts have one canonical maintained source.
10. Production environment security, HTTPS/cookies, deployment, backup recovery, monitoring, load testing and live external API behavior have not been verified.

## 16. Remaining work, in recommended order

### Next technical increment — requires explicit approval

Implement backend-only claim-level validation for optional Gemini responses:

- define allowed evidence/citation IDs for a generated answer;
- validate critical numbers, academic years and factual fields against retrieved evidence;
- reject invalid citations or unsupported critical claims and return the existing safe fallback;
- add regression tests and documentation;
- preserve the public layout, answer format, fee tables and source-link presentation.

### Evaluation work

1. Ask independent reviewers to author fresh questions and make relevance/correctness judgments.
2. Freeze the source corpus and separate development from final held-out test questions.
3. Measure retrieval Recall@K, MRR, answer correctness/completeness, citation support, refusal quality, language quality, p50/p95 latency, Gemini usage and cost.
4. Compare baseline keyword retrieval with normalized BM25 under identical corpus and review conditions.

### Product and engineering work

1. Broaden speaker-reviewed Marathi/Hindi translations.
2. Add bounded conversation context only with session isolation, expiry, reset and ambiguity safeguards.
3. Consolidate remaining legacy hardcoded facts into maintained structured records.
4. Separate unrelated legacy workflows from assistant modules where dependency review shows it is safe.
5. Finish production hardening, deployment verification, CI, backup/restore and observability.

## 17. Final-year project position

Mitra can already be explained as an institution-specific assistant built around maintained knowledge, deterministic factual answers, bounded multilingual query understanding, source lineage, refusal/clarification behavior and measured regression checks. It should not be described merely as “a React chatbot using Gemini.”

The academically defensible next contribution is a controlled evidence/retrieval evaluation and claim-validation layer. The project must distinguish clearly between implemented features, automated diagnostics, human-reviewed evidence and planned improvements.

## 18. Related detailed documents

- [Project upgrade assessment](MITRA_UPGRADE_ASSESSMENT.md)
- [Query understanding implementation](MITRA_QUERY_UNDERSTANDING.md)
- [Knowledge maintenance and persistence](MITRA_KNOWLEDGE_MAINTENANCE.md)
- [Source provenance and freshness](MITRA_SOURCE_PROVENANCE.md)
- [Multilingual responses](MITRA_MULTILINGUAL_RESPONSES.md)
- [Compound questions](MITRA_COMPOUND_QUESTIONS.md)
- [Answer presentation and source audit](MITRA_ANSWER_SOURCE_AUDIT.md)
- [Public evaluation](MITRA_PUBLIC_EVALUATION.md)
- [BM25 comparison](MITRA_BM25_COMPARISON.md)
- [Maintainer browser verification](MITRA_MAINTAINER_E2E.md)
- [Test completion and exposure ledger](MITRA_TEST_COMPLETION.md)
