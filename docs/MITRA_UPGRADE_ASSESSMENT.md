# Mitra: repository assessment and proposed upgrade plan

Reviewed: 9 October 2026. Scope: assessment only; no application implementation changes.

## Problem and current state

Mitra should answer institutional questions using maintained official evidence, preserve important factual conditions, communicate uncertainty, and support English, Marathi and Hindi. Its academic contribution should be demonstrated through a controlled comparison against the original implementation.

Reviewed both research texts: the attached Pasted text.txt and the assessment pasted in chat. Inspected README, packages, configuration, backend API/authentication/storage/seed/conversation code, source publishing, frontend public widget and maintenance interface, tests, benchmark generator/evaluator, Docker and Nginx configuration. Legacy DOCX deliverables and individual PDFs were inventoried, not visually reviewed; official college facts were not independently reverified.

Existing strengths worth keeping:

- React interface, Node built-in HTTP backend, SQLite persistence, optional backend-only Gemini.
- Published-only knowledge retrieval, direct factual answers, unsupported-question fallback.
- Protected source upload/review/publish APIs and an existing KnowledgeManager interface.
- Password hashing, role/ownership checks, upload-signature checks, rate limits and security headers.
- Existing automated regression tests, Docker configuration and operational documentation.

## Verified validation

| Check | Observed result | Interpretation |
| --- | --- | --- |
| Backend tests | 42/42 passed | Existing covered behavior passes |
| Backend syntax check | Passed | server.js parses |
| Legacy evaluator | 500/500 passed | Routing/content expectations on authenticated endpoint, Gemini disabled |
| Frontend lint | Passed | Configured lint checks passed |
| Frontend production build | Passed | Static assets generated |
| Answer formatting tests | 3/3 passed | Formatting cases passed |

PowerShell blocks npm.ps1 here; npm.cmd runs checks without changing execution policy. Tests and evaluation use their designated databases, and probes used tmp/mitra-review.sqlite. No live deployment, browser E2E, load test, external-model evaluation or factual source audit was performed. These pass counts are not overall answer accuracy.

## Gaps and proposed changes

| Priority | Gap and repository evidence | Proposed change | Acceptance evidence |
| --- | --- | --- | --- |
| P0 | Benchmark calls /api/assistant/ask with an applicant account, not the public widget endpoint; generated templates and workflow prefixes dominate; Gemini disabled (scripts/evaluate-assistant.js, tools/generate_assistant_benchmark.mjs) | Preserve legacy regression suite; create independently reviewed development and held-out public-assistant datasets with evidence IDs and expected claims | Public baseline report with per-language/per-category results; no tuning on final test questions |
| P0 | store.js normalizeDb merges seed fields over existing records during load/save; removing seed entries leaves persisted records | Separate initial seeding from explicit versioned updates; preserve maintainer edits; add retire/supersede lifecycle | Published edits survive save/restart; retirement prevents retrieval; migration preserves existing data |
| P0 | Known demo password is seeded without a production-specific exclusion (seed.js) | Exclude demo accounts in production; provision maintainer credentials explicitly | Clean production initialization has no demo login; protected admin APIs remain inaccessible anonymously |
| P0 | Public limiter uses req.socket.remoteAddress while Nginx proxies requests | Define trusted-proxy handling or enforce public limits at Nginx; do not trust arbitrary forwarded headers | Two clients behind proxy have independent limits; spoofed headers cannot bypass policy |
| P1 | Direct answer text and facts are embedded in server.js separately from knowledge | Move important amounts, years, intake and conditions into versioned structured records; render deterministic answers from those records | One maintained fact update changes answers consistently without editing routing code |
| P1 | Rule and keyword retrieval adds large record-specific bonuses, selects one preferred category and returns top three | Compare unchanged baseline with BM25; measure semantic/hybrid retrieval only if remaining errors justify it | Recall@K, MRR, latency and resource comparison on frozen corpus |
| P1 | First matching answer builder wins; no explicit query decomposition | Identify independently answerable parts, retrieve each, combine supported results and report missing parts | Courses-and-fees questions cover both topics; unsupported parts are explicitly identified |
| P1 | Source URLs and evidence IDs are returned, but passage/page-level support is absent; response source can be replaced with top retrieval source | Preserve stable passage IDs, page/section, document version, academic year, effective/verification dates; attach support to individual claims | Every displayed factual citation maps to supporting evidence; misleading top-result attribution is prevented |
| P1 | Gemini prose is accepted unless empty/error/INSUFFICIENT_EVIDENCE; no independent validation | Require bounded structured output with allowed evidence IDs; validate numbers/dates and citation membership; reject unsupported critical claims | Invalid citations and conflicting critical numbers fall back safely; human review measures remaining semantic errors |
| P1 | Retrieval threshold is a heuristic; weak additional results can accompany a strong first result; fallback can return raw top-record text | Evaluate relevance per passage, answerability and scope; calibrate abstention on development data | Unsupported-answer and inappropriate-refusal rates reported separately |
| P1 | Source publishing slices normalized text every 2,800 characters; published chunks omit source year/page/URL lineage | Split by section/paragraph with size bounds, preserve page boundaries and tables, propagate metadata | Representative PDF/table facts are traceable; chunk boundaries do not separate critical conditions |
| P1 | Multilingual topic substitutions exist; direct/fallback answers remain English; OCR uses English | Add explicit language preference, reviewed factual templates and evaluated grounded translation; choose OCR language coverage from actual documents | English/Marathi/Hindi answers preserve names, amounts, dates and conditions; competent speakers review quality |
| P2 | Public questions are independent; authenticated conversations save messages but answerQuestion receives only the latest question | Anonymous bounded session context with topic/entity state, expiry and New chat; clarify ambiguous references | Follow-ups resolve only within the correct session; no cross-session leakage or topic contamination |
| P2 | server.js combines legacy admissions workflows, files, auth, retrieval and generation; App.jsx contains legacy interfaces | Incrementally extract assistant, knowledge, generation, maintenance and infrastructure modules; retire unrelated functionality only after dependency review | Existing regression checks stay passing; public app and maintainer workflows remain available |
| P2 | SQLite holds one JSON application collection; public question audit causes synchronous whole-state persistence | Introduce migrations and focused tables for sources/passages/facts/audit where justified; bound audit retention and avoid whole-state writes per chat | Restart persistence, migration and concurrency checks; measured latency under agreed load |
| P2 | Compose omits Gemini variables; health endpoint exists but HTTPS/live behavior unverified; declared Node >=20 conflicts with node:sqlite usage | Align supported runtime, pass required generation config, add CI and deployment verification/runbook | Reproducible clean setup and container smoke test, configured HTTPS and rollback instructions |
| P2 | No full browser workflow proof or timing/token/cost measurements | Browser E2E for chat/sources/language/reset/error/mobile/keyboard; request IDs, timing and bounded privacy-conscious telemetry | Core journeys pass; p50/p95 latency and measured API usage documented |
| P2 | Clone has no Git repository; retained databases/uploads/backups include marksheet filenames; docs retain CampusGuard scope | Establish version control before implementation; classify runtime data privately, use synthetic fixtures, update assistant-specific docs | No credentials/personal uploads in tracked files; architecture/report matches implemented scope |

P0 means baseline integrity or deployment blocker; P1 is core final-year scope; P2 is supporting work, sequenced by dependencies. Security fixes may precede feature work without becoming the project's claimed research contribution.

## Public API probes (Gemini disabled)

- “Which courses are available, and what are their fees?” returned fee information without listing courses. Its evidence also included laboratories and Polytechnic records.
- “Tell me about CSE.” returned percentile/admission guidance with an empty evidence array.
- “What is its intake?” returned CSE intake despite no session context: this is a default retrieval result, not demonstrated reference resolution.
- “Please answer in Marathi: what courses are available?” returned English Polytechnic information. Both requested language and ambiguous programme scope need handling.
- “Does the college offer accommodation?” correctly returned hostel information with an availability caveat. Avoid claiming all paraphrases fail.

## Target architecture

Keep a modular monolith and the current stack initially:

Public chat -> input/language/session validation -> query interpretation -> published evidence retrieval -> answerability check -> structured factual renderer or optional grounded generator -> output/evidence validation -> answer and citations.

Maintainer interface -> authenticated review -> versioned source/passages/facts -> explicit publication/retirement -> searchable corpus.

LLM output and retrieved document instructions remain untrusted. Personal applicant documents must never enter public retrieval. An additional vector database, fine-tuning, microservices and agents have no established requirement here.

## Evaluation design

Proposed starting scope: 150–250 independently authored question cases across English, Marathi, Hindi, mixed language, paraphrases, compound questions, ambiguity, current/historical conflicts, missing information and adversarial inputs. This is a planning range, not an existing dataset. Add a separate set of multi-turn conversations; keep conversation families and translated variants in one split to avoid leakage. Freeze a source snapshot and hold final questions away from developers tuning retrieval.

Each record should specify query, language, corpus version, expected evidence IDs, required claims, prohibited claims, answerability, and any clarification requirement. Record independent reviewers and disagreements. Use retrieval relevance judgments rather than expected category alone.

Report retrieval Recall@K/MRR; answer correctness and completeness; citation support and coverage; unsupported-answer rate; refusal precision/recall; language quality; p50/p95 latency; model calls/tokens and cost using dated pricing. Separate deterministic mode from model-enabled mode. Publish denominators, category breakdowns, failure examples and uncertainty. Use human factual review as the authority; automated or model judging may assist but must be audited.

Experiment order: original baseline -> BM25 with equivalent corpus/settings -> semantic/hybrid only if justified -> answer validation ablation. Separate corpus quality improvements from retrieval algorithm comparisons so gains are interpretable. Set success thresholds after measuring the baseline and before running the final held-out experiment.

## Implementation sequence

1. Preserve baseline and establish version control; document boundaries and production blockers.
2. Create the public evaluation contract, development questions and independently held-out questions.
3. Repair knowledge lifecycle and structured factual maintenance; retain existing admin tools.
4. Extract retrieval behind a common interface and compare baseline/BM25.
5. Implement compound answering, evidence attribution, temporal filtering and uncertainty.
6. Complete multilingual answering and evaluate it separately from factual correctness.
7. Add bounded conversation context once single-turn answers are reliable.
8. Finish security regression, browser validation, measured performance, CI/deployment and academic documentation.

Deliver measurable increments rather than deleting the legacy application in one rewrite. Before implementation, resolve target users, maintainer ownership, authoritative academic years, hosting/budget, deadline, expected concurrent usage and language reviewers. These are requirements still to establish, not reasons to postpone baseline work.

## Research basis and trade-offs

- SQLite FTS5 provides BM25 ranking and Unicode tokenization: https://www.sqlite.org/fts5.html . It is a practical experiment within existing storage, but multilingual normalization, Devanagari combining marks, stemming and cross-language matching require explicit tests; BM25 does not solve translation automatically.
- ALCE separates response correctness from citation quality: https://aclanthology.org/2023.emnlp-main.398/ . Use this distinction to design a small institution-specific human-reviewed rubric rather than presenting source links as proof.
- OWASP prompt injection guidance: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html . Use defense in depth: trusted instruction separation, minimal tools/permissions, controlled publication and output checks; a prompt or regex filter cannot establish factual or security guarantees.

## Result and next step

Mitra is a working prototype with useful controls and a passing regression baseline. Its strongest proposed contribution is an experimentally evaluated improvement in institutional retrieval, evidence attribution, temporal reliability and multilingual answering. Novelty, accuracy improvements and deployment readiness remain unproven until measured.

Next implementation milestone: baseline preservation plus a public evaluation harness and explicit knowledge lifecycle specification. No application features were changed during this assessment.
