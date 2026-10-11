# Language verification before retrieval comparison

## Assessment and fix

Real Chrome verification found that `PublicAnswerBody` replaced programme and fee responses with frontend constants. This discarded translated answers and could discard maintained values. It now formats the backend answer without substituting institutional facts.

## Reproducible verification

From `frontend`, run `npm.cmd ci`, then `npm.cmd run test:language-browser`. Install Chrome, or set `$env:MITRA_BROWSER_CHANNEL = 'msedge'` to use installed Edge. The development-only `playwright-core` package controls the installed browser; no browser download is required. See [Playwright browser channels](https://playwright.dev/docs/browsers).

The harness starts its own loopback backend and Vite server on available ports, disables Gemini, uses a dedicated temporary SQLite database, and closes all resources afterward. It does not load `.env` or change maintained knowledge. It verifies Marathi/Hindi selector requests, rendered native script and numeric tokens, explicit English fallback, empty-submit prevention, network failure handling and recovery, English override, mobile horizontal overflow and uncaught browser errors.

It generates [the speaker review packet](language-review/REVIEW_PACKET.md) and its JSON companion from the actual API answers. Cases cover fees, accommodation, intake, ambiguity, library, general prose and compound questions. Regenerating overwrites these generated files; save completed reviewer judgments separately before rerunning.

## Result and remaining limits

Browser automation provides functional evidence, not language approval. The user requested review material with a reviewer still pending. No speaker approval is claimed. Native templates remain marked pending and uncovered prose keeps its explicit English fallback. A competent reviewer must check meaning, conditions and fluency before these limitations can be declared resolved.

These cases are developer-authored, use seeded knowledge, and do not establish overall accuracy or full corpus language coverage. Admin browser editing, persistence across actual application restarts, all responsive sizes and accessibility auditing are outside this browser suite; backend persistence and translation validation have separate regression tests.

Admin browser editing, session restoration and persistence across a separate backend-process restart have since passed in the [dedicated maintainer browser journey](MITRA_MAINTAINER_E2E.md). Full responsive/accessibility auditing remains separate.

## Next step

Formal speaker judgments remain pending. The user subsequently accepted current behavior and authorized the next step while monitoring for mishaps. The [controlled BM25 comparison](MITRA_BM25_COMPARISON.md) is now complete as a development experiment; no human language approval has been inferred.
