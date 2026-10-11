# Input validation and knowledge persistence fixes

Subsequent verification: [maintainer browser E2E and separate-process restart](MITRA_MAINTAINER_E2E.md) passed, covering UI edits, conflicts, stale translations, retirement and persistence.

## Symptom

Invalid public questions returned 500. Maintained records sharing a seed ID lost their title, text, source, tags and publication status after saving/restarting; removed seed entries were reinserted.

## Root cause

The assistant called requireString, which throws a generic Error. The HTTP boundary mapped that error to 500. store.js normalizeDb overlaid seed fields on maintained records and appended missing seeds on load and save.

## Fix and files changed

- backend/src/server.js: explicit bounded question validation with badRequest before retrieval/generation.
- backend/src/store.js: seed only on first initialization, preserve maintained collections, save current state without seed reconciliation; closeDb supports connection cleanup and disk reload tests.
- backend/test/api.test.js: invalid question matrix for both public and authenticated endpoints, plus trimmed maximum-length acceptance.
- backend/test/store.test.js: durable edit, removal, custom-record, empty-library and legacy preservation tests using temporary SQLite files and separate Node processes.
- README.md, docs/DATABASE_SCHEMA.md, docs/MITRA_PUBLIC_EVALUATION.md: corrected maintenance semantics and measured results.

## Validation and regression prevention

Both defects were reproduced by failing regression tests before the fix. Afterward, 52/52 backend tests passed, backend syntax check passed, 500/500 legacy evaluation cases passed, and the public development evaluator passed 12/18 instead of 10/18. Original baseline archives passed their integrity test. No dependency was added and no frontend behavior changed.

Validation databases are isolated from the live application database. Existing source publication remains administrator-protected. Invalid questions are rejected before answering/auditing; existing rate-limit enforcement remains in place.

## Limits

This report describes the earlier persistence milestone. Individual record editing and selected maintained answers were added subsequently in [knowledge maintenance](MITRA_KNOWLEDGE_MAINTENANCE.md); current language support and review requirements are documented in [multilingual responses](MITRA_MULTILINGUAL_RESPONSES.md).

This fix preserves future maintained data; it cannot recover edits already overwritten in previous saves. It does not add an individual knowledge-record edit endpoint, versioned update workflow, or remove hardcoded facts from deterministic answer builders. Retiring a knowledge entry excludes it from retrieval but may not suppress an independently hardcoded answer. Those behaviors need the subsequent single-source-of-truth work.
