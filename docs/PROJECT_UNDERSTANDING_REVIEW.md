# Mitra: project understanding and research readiness

Reviewed on 24 October 2026. This is a source-code and local verification review, not an independent research evaluation. Application code and existing paper drafts were not edited.

Follow-up: the subsequent authorized implementation addresses the generation crash, hardcoded profile fee notes, fee follow-up scope and public message bound. Findings below describe the pre-fix review snapshot. See [the current research scope and evaluation plan](RESEARCH_SCOPE_AND_EVALUATION_PLAN.md) for changes and remaining evidence requirements.

## Problem and intended users

Mitra serves prospective students, parents and visitors seeking MITCORER Barshi admission and campus information. Answers depend on academic year, programme, admission route, category, gender and service. Finding the correct fee row, distinguishing hostel from mess costs, or separating current intake from historical seat matrices requires more than matching a general topic.

The engineering problem is to make maintained institutional information accessible through conversation while avoiding unsupported figures, misleading guarantees and silent guesses. Reducing staff enquiry workload and improving user task completion are intended benefits; neither was measured during this review.

## Implemented solution

The system is a React/Vite client and Node HTTP modular monolith with SQLite persistence. The backend has no external runtime package dependencies. It combines:

- Published institutional records and administrator-controlled maintenance.
- Bounded English, Marathi, Hindi and transliterated query normalization.
- Extraction of programme, route, year, category, gender and service scope.
- Weighted lexical retrieval, institutional rules and conceptual synonym boosts.
- Optional Gemini embeddings cached in SQLite; vector scores can contribute to English query ranking when configured. There is no separate vector database or custom-trained model.
- Deterministic rendering of maintained fee, accommodation and programme/intake records.
- Clarification, compound-answer sections, refusal and human enquiry escalation.
- Optional Gemini generation for English advisory and otherwise unanswered evidence-supported requests.
- Factual-token, prohibited-promise and selected structured-slot checks on generated output, with an integration defect described below.
- Reviewed, source-content-bound translations and explicit English fallback.
- Source lineage, validity/supersession checks and revision-controlled maintenance.
- Protected document ingestion and website-change staging for maintainer review.
- Public conversation IDs, persisted exchanges and bounded heuristic follow-up resolution; account-owned private history is a separate workflow.

The broader repository also retains applicant document submission, admission workspaces, staff inquiries, content management, reports, feedback and audit logs. These should be distinguished from the public assistant's core contribution.

## Active workflow and responsibility map

1. `frontend/src/App.jsx` holds the public widget's messages, language and conversation ID; it renders answer sections, links, suggestions and escalation controls.
2. `frontend/src/api.js` posts question, language and conversation ID to `/api/public-assistant/ask`.
3. `backend/src/server.js` validates and rate-limits the request and calls `askPublicWithHistory`.
4. `backend/src/conversations.js` extracts profile/topic context, rewrites selected follow-ups and invokes the answer engine.
5. `query-understanding.js`, `query-scope.js` and `question-plan.js` normalize and partition the request, preserve supported scope and request clarification.
6. `server.js` retrieves knowledge and chooses among maintained answers, passages, legacy rules and optional generation. Advisory generation can precede the deterministic chain; the implementation is not universally deterministic-first for every advisory phrasing.
7. `knowledge.js` validates structured facts and renders canonical records. KB-2 controls academic fees, KB-3 accommodation and KB-10 current programme intake; KB-6 handles the historical matrix.
8. `grounding.js`, `provenance.js`, `evidence.js` and `language.js` provide output checks, availability checks, evidence projection and localization.
9. `store.js` persists application JSON in the SQLite `collections` table, with embeddings in `vector_embeddings`. Seeds initialize new application state; maintained records survive reloads.

Public messages and context are now stored server-side. Browser refresh loses the widget's in-memory conversation ID and visible history, but that does not erase stored exchanges. Reset starts another conversation rather than deleting the previous stored one. Current public storage limits the number of conversations to 200 but does not enforce the authenticated history path's 200-message bound for an individual public conversation.

## Knowledge governance and trust boundary

Important institutional facts are maintained application data, not Gemini's learned knowledge. Publication status, explicit validity metadata, academic year, conflicts and revision checks constrain use. A link or publication label alone does not independently establish factual truth.

The website-sync module fetches selected pages, cleans HTML, hashes content and records numeric/year drift. Changes enter Review state; synchronization does not automatically publish them. PDF extraction uses Poppler and OCR uses English Tesseract. DOCX/XLSX require supplied verified text in the documented ingestion flow.

Server-side role checks protect maintenance. Authentication includes password hashing, signed access tokens and rotated refresh tokens. These controls and passing tests are evidence of specific behavior, not proof of comprehensive security. Demo credential handling and public conversation isolation/retention need production review. Public conversations use a shared `public` owner and continuation by supplied conversation ID rather than an authenticated owner or session-bound credential.

## Current verification, rerun during this review

| Check | Observed result | Interpretation |
| --- | --- | --- |
| Backend `npm.cmd test` | 147/147 passed | Existing automated tests |
| Frontend `npm.cmd test` | 15/15 passed | Formatting, source links and session helper tests |
| Frontend lint | Command completed successfully | Existing lint configuration |
| Frontend production build | Passed | Buildability; not deployment verification |
| Backend `evaluate` | 500/500 passed | Developer routing/content regression expectations; Gemini disabled |
| Backend `evaluate:public -- --strict` | 36/36 passed | Current public development diagnostics |
| Backend `evaluate:paraphrases` | 24/24 contract, 24/24 developer diagnostics; 0 semantic reviews | Exposed development questions, not held-out evaluation |
| Isolated mocked successful Gemini response | Reproduced ReferenceError | Existing tests miss a generation integration failure |

The public evaluator additionally reported local p50 27.83 ms and p95 84.99 ms for this run. These are local development measurements with generation disabled, not live deployment latency or an LLM benchmark.

Browser suites, live Gemini/embedding behavior, external link currency, load tests, deployment, backup recovery and independent language quality were not rerun or verified in this review. Earlier browser/audit results are historical documentation only.

## Findings requiring attention before research claims

### 1. Existing paper draft contains unsupported experimental results

`docs/MITRA_IEEE_RESEARCH_PAPER.md` claims a held-out 500-question study, baseline exact-match results including 58.4% and 72.8%, statutory accuracy of 100%, and wrong-row detection of 96.8%. Its conclusion instead states 95.3% detection. The inspected evaluation tooling does not substantiate these experiments. The available 500-case evaluator consists of 360 maintained cases plus 140 generated workflow combinations and explicitly disables Gemini. It checks categories, actions and selected expected text, rather than the claimed cross-system statutory exact-match study.

Do not use these numbers as empirical findings without original predictions, actual model runs, independently reviewed labels, dataset split/exposure records and reproducible metric calculations. Existing literature assertions and references also require a separate primary-source verification pass before publication. Novelty has not been established by this local review.

### 2. Successful generation reaches `context` before initialization

`server.js` calls `verifySlotGrounding(rawAdvisory, context, ...)` and the equivalent fallback check before the later `const context = ...` declaration. A controlled in-memory run with a mocked successful Gemini response to “Why should I choose MITCORER?” reproduced:

```text
ReferenceError: Cannot access 'context' before initialization
```

The reproduction made no model/network request and did not touch the maintained database. Existing tests pass because they do not adequately exercise this successful generation path. This review records the bug; it does not modify application behavior.

### 3. Slot verification is bounded and not a proof of entailment

`verifySlotGrounding` contains selected fee, accommodation and programme checks. It rejects competing figures when the expected figure is absent. Including both correct and incorrect figures can pass. Missing slots can also bypass specialized checks. Academic year is checked through evidence tokens but is not an explicit coordinate in the specialized slot lookup. Some route/category cases default rather than requiring full slot resolution. Tests demonstrate selected wrong-row examples, not a measured detection rate or full semantic correctness.

### 4. Conversation handling can undermine maintained factual controls

Follow-up rewriting is heuristic. For example, fee rewrites can replace the original question without carrying an explicitly extracted DSE route into the rewritten text. Profile notes in `server.js` independently hardcode fee values and AY 2026-27 after maintained answer construction. Therefore, a global claim that every displayed fee is always sourced exclusively from current canonical data is not supported. Conversation scope, negation, topic changes and stale profile data require focused regression cases.

### 5. Documentation is inconsistent with current code

README/status statements describing stateless public chat, no embeddings, absent generated-answer checks, an unavailable public maintainer UI, missing Docker Gemini mappings, and older public diagnostic counts are outdated in at least some documents. The current client has an admin entry condition, public conversation IDs and reset behavior. Docker Compose forwards Gemini configuration and includes a health check. Configuration defaults the public request limit to 30/minute, while old documents say 12. Model defaults and generation temperature also differ between older descriptions and code.

Use the configured model string as an implementation setting, not proof that a live model endpoint exists or was successfully evaluated. This review did not check provider availability.

## Defensible research direction

Frame Mitra as an institutional QA prototype combining maintained structured facts, bounded multilingual interpretation, provenance-aware retrieval, controlled generation and selected slot checks. Its main engineering hypothesis is that separating critical table lookup from optional generation can improve factual reliability while retaining conversational access. That hypothesis still needs independent measurement.

A candidate paper framing is: **Mitra: A Maintained-Knowledge Institutional Assistant with Deterministic Factual Rendering and Bounded Generation Checks**. A narrower slot-verification paper is possible only after fixing integration and measuring both correct rejection and false acceptance across independently constructed wrong-row cases.

Before finalizing empirical sections:

1. Resolve generation integration, conversation scope and independent hardcoded fee paths.
2. Freeze the corpus, code revision, model configuration and source versions.
3. Separate exposed regression questions from newly authored final questions.
4. Obtain independent evidence, answerability, correctness and language labels.
5. Run comparable keyword, BM25, conceptual/hybrid and optional generative baselines under identical conditions.
6. Measure retrieval group metrics separately from answer correctness; measure exact target-cell accuracy, wrong-row detection, false alarms, unsupported acceptance, refusal and clarification quality.
7. Include adversarial cases with both expected and competing amounts, missing slots, historical years, DSE follow-ups, contradictory scope and unavailable records.
8. Report denominators, uncertainty, failure examples, model usage, p50/p95 latency and actual cost where measured.

The existing implementation supports a substantial system description. Its automated regression results must remain clearly separated from independent research evidence.
