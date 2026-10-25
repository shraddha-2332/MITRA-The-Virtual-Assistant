> Historical milestone: current implementation and pending external work are recorded in [CURRENT_COMPLETION_STATUS.md](CURRENT_COMPLETION_STATUS.md).

# Remaining assistant work: implementation order

The user authorized continuing the assistant improvements, with public UI cleanup first. Completed UI changes: original footer restored; public maintainer link removed; compact header language selector replaces the full-width row. Protected knowledge APIs and the existing authenticated workspace remain available; their browser tests use isolated API-login fixtures.

## Next increment: source freshness and document lineage

Status update: this increment is now implemented. See [source freshness and document lineage](MITRA_SOURCE_PROVENANCE.md) for actual behavior, tests and remaining limits. The discovery/plan below is retained for context; it is superseded by that implementation report where the two differ. Claim-level validation is the next increment.

Inspection shows `publishOfficialSource` currently slices normalized text into 2,800-character chunks. Published records inherit a source document ID and authority/file label but omit the source's academic year, URL, document version, page/section and explicit verification metadata. New chunk IDs on republishing make earlier references harder to follow. Excerpts now have content hashes, but those alone establish neither freshness nor verification.

Implement incrementally:

1. Define validated optional provenance fields: academic year, document ID/version, page or section, explicit validity dates and verification action. Preserve missing metadata as unknown.
2. Propagate known source metadata during publication. Permit reviewed page-specific text instead of pretending flattened extraction preserves PDF pages. Keep legacy maintained records intact.
3. Bind recorded verification to current content and lineage; invalidate it when content changes. Use authenticated maintainer review actions rather than stamping old seed content as newly verified.
4. Add explicit expired/superseded-source rules across keyword retrieval, maintained facts and compound answers. Preserve historical scope separately from current applicability. Decline conflicting critical facts rather than choosing silently.
5. Show relevant year/page/freshness information in evidence, with tests for source edits, expiry boundaries, republishing, historical questions and missing metadata.

This document is an implementation plan, not a claim that these provenance features already exist. Institutional verification dates, actual PDF pages and validity periods must come from source evidence or explicit review; do not fabricate them.

## Subsequent increments

User-approved backend query-understanding phase implemented on 10 October 2026: see [query understanding](MITRA_QUERY_UNDERSTANDING.md). This phase preserved frontend layout and answer rendering. Approval for this phase does not authorize the subsequent increments below; confirm their concrete scope before editing.

- Claim-level evidence validation, including allowed citation IDs, factual fields and uncertainty; separately evaluate semantic entailment.
- Independent relevance/speaker review and a fresh final test set; current diagnostic questions remain exposed development material.
- Bounded conversation context with session isolation, expiry, reset and ambiguity handling.
- Broader reviewed Marathi/Hindi prose coverage.
- Separation from unrelated legacy functionality, production credential/session hardening and reproducible deployment verification.

Each increment needs regression checks and updated limitations. Do not replace the production retriever based on the unreviewed BM25 development experiment or claim completion of all remaining work from the UI change.
