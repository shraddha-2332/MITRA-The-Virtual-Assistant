# Mitra current completion status

Updated 24 October 2026. This supersedes older milestone status descriptions. The current changes are local and await the user's explicit permission before committing or pushing.

## Implemented and validated

| Area | Current behavior and evidence |
| --- | --- |
| Generation verification | Critical factual topics bypass advisory generation. Selected numeric/promise/citation checks and bounded category/gender/route/service clause checks reject the 11 invalid development probes; the four valid controls remain accepted |
| Known verifier misses | The previously exposed swapped fee and hostel/mess labels are rejected. This closes those specific regressions, not general semantic entailment |
| Conversations | Browser-session ownership, 30-minute idle expiry, bounded history, reset deletion, periodic pruning, expiry recovery and reset-during-generation protection |
| Query scope | Explicit route/year wording retained; negated profile values cleared; topic changes avoid unrelated fee enrichment; inherited scope no longer creates a phantom clause after a question mark |
| Canonical facts | Public facts exclude retired, unavailable, invalid or conflicting canonical records. Planner views no longer revive fixed fee amounts, and archived table images disappear when maintained values/year differ |
| Models | Configurable current embedding model, finite-vector checks, model/content-bound caches and unpublished-record exclusion. Optional bounded transient retry/fallback client, with actual accepted model reported |
| Authentication | Anonymous/malformed refresh returns 401; controlled validation errors; new signup passphrases at least 12 characters; login/signup client limits; production demo hashes rejected; unique admin provisioning command |
| Proxy/deployment preparation | Production same-origin `/api` requests and Vercel-to-Render rewrite; explicit forwarding-header trust; Nginx overwrites forwarded addresses |
| Operations | Liveness/readiness, safe request logs, checksum/WAL-aware backup verification, isolated restore, CI workflow and release/rollback instructions |
| Dependencies | Vite patched from 8.2.2 to 8.2.4; subsequent npm audit reported zero vulnerabilities |

## Latest verification

- Backend: **174/174 tests passed**, syntax check passed.
- Frontend: **16/16 tests passed**, lint and production build passed.
- Developer evaluators: **500/500** routing/content cases and **36/36** public cases passed.
- Exposed paraphrase diagnostics: **24/24** contract checks passed; independent semantic reviews: **0**.
- Browser checks: public-session, maintainer and language journeys passed; complete answer audit **468/468** journeys, using 78 questions × three languages × two isolated corpus snapshots. Numeric list ordinals are excluded from factual preservation checks because the UI renders them as bullets.
- Verifier diagnostics: token checker TP=2, FN=9, FP=0, TN=4; bounded slot/clause checker TP=11, FN=0, FP=0, TN=4 on the same 15 exposed synthetic probes. This is developer debugging evidence, not held-out accuracy.
- Local HTTP smoke: **100/100** non-model requests at concurrency 5 completed without errors. In-memory SQLite, raised test limits and this local machine bound the interpretation; production capacity has not been measured.
- Backup drill: maintained local data backed up, checksummed and restored into a new ignored directory; **1,146 files** verified. Running data was not overwritten.
- Docker Compose configuration validates; container startup was not verified because the Docker Linux daemon was stopped. The deployment target supplied by the user is the existing Vercel/Render site.
- Live pre-release site: public fee query returned 200 and the maintained Open first-year amount. Anonymous refresh returned 500; that root cause is fixed locally. New release behavior still needs post-deployment checks.
- Provider: authenticated model list includes `gemini-3.8-flash`; live `gemini-embedding-001` smoke returned 3072 dimensions. Live generation timed out; mocked retry/fallback/verification tests passed. No live model accuracy or cost comparison is claimed.
- Source links: **37/38 emitted URLs** were reachable in this audit; MSBTE timed out. This is a network reachability observation, not verification of every linked claim.

The source-bound experiment summaries are under `docs/research-review/`. Full generated reports and browser screenshots remain ignored. Historical baseline and post-fix reports are retained rather than rewritten as new results.

## Institutional review and source evidence

The project team reports that department professors reviewed responses internally and that institutional facts were transcribed from approved/signed circulars. No itemized faculty scoring rubric or independent numerical review file was provided. The three archived fee-table crops were visually inspected and match the canonical annual amounts. The inspected crops do not show signature/certification blocks, so this task does not independently authenticate the full signed originals. See `research-review/archived-fee-source-manifest.json` for their paths and hashes.

The original 18 public cases, 24 paraphrases, 15 mutations and existing blinded development packet remain exposed development material. Faculty approval reported by the team is not relabeled as an independent accuracy score. Formal Marathi/Hindi speaker ratings remain pending as the team confirmed.

## Explicitly unresolved external requirements

| Requirement | Why it is not marked complete |
| --- | --- |
| Independent final questions, labels and reviewer agreement | No new independent questions or adjudicated scoring records were supplied; these cannot be invented by the implementation agent |
| Formal language quality ratings | Competent-speaker rating sheets have not been conducted/provided |
| General semantic entailment and prompt-injection resistance | Bounded checks and selected tests do not establish universal correctness; broader independent evaluation is required |
| Successful live generation and cost study | The smoke timed out; provider/network/budget conditions need further operational measurement |
| New cloud release, persistent storage and monitoring | Commit/push approval and provider-side verification are pending; the declared free Render configuration does not establish durable SQLite storage |
| Hosted CI and cloud load/backup scheduling | Workflow/scripts are prepared; execution and scheduling need the approved release/provider environment |
| Remaining legacy prose/templates | Retained applicant/planner/institutional prose is not a fully normalized universal source of truth; no blanket claim that every fact is centralized is made. Further domain-specific consolidation must preserve the existing workflows and needs its own acceptance criteria |

This report closes the reproduced high-risk regressions and prepares the review/release materials. It deliberately does not call the system production-ready or independently evaluated.

## Commit boundary

No commit or push has been made in this task. Before proceeding, the user must approve the concrete reviewed change set. Unrelated pre-existing deletions and the old unverified IEEE Markdown/Word drafts remain outside the proposed change set. A push to the deployment branch may trigger provider auto-deployments; follow [operations instructions](OPERATIONS.md) before calling the release verified.
