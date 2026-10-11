# Source freshness and document lineage

Implemented and tested: 10 October 2026.

## Assessment and plan

Source links and text hashes identified evidence but did not establish applicability, review dates or PDF-page lineage. Publishing dropped academic-year metadata and replaced chunks with random IDs. Add optional validated provenance, explicit validity/supersession, recorded source-review actions and stable page-aware publication while preserving existing maintained data.

## Implementation

Knowledge records accept optional `provenance` containing:

| Field | Meaning |
|---|---|
| documentId | Source document identifier; published passages retain their actual source ID |
| documentVersion | Reviewer-supplied document version, never inferred |
| academicYear | Consecutive year such as 2026-27; must match structured facts where present |
| section | Reviewer-supplied section reference |
| pageStart / pageEnd | Positive, ordered page references; unknown pages remain absent |
| validFrom / validUntil | Explicit inclusive UTC dates controlling answer eligibility |
| supersededBy | Existing knowledge record replacing this record; cycles and missing targets are rejected |

PATCH/POST knowledge accepts boolean `verifySource`. Only the existing admin-authorized write endpoints may record this action. When explicitly true, the server records actor/time and a fingerprint covering the text, source authority, URL and provenance. Subsequent changes invalidate that binding; changing text does not silently record another review. Client-supplied verification stamps are rejected.

Public evidence reports `verification.status` as `not-recorded`, `recorded` or `source-changed`, with the recorded timestamp where available. Reviewer identity remains private. The evidence panel displays known year, version, page/section and review state. The optional metadata editor is inside the existing authenticated workspace; public maintainer sign-in remains deferred and the compact language icon/footer are preserved.

## Freshness behavior

Expired, not-yet-effective, superseded and unpublished records are excluded from current keyword retrieval, managed factual answers, direct/compound passages and reviewed-language passages. Offline BM25 also filters eligibility. Prepared-answer routes have canonical-source guards so expired placement/eligibility/profile records cannot silently fall back to their embedded facts. Evidence projection shares a final evaluation timestamp; a source that becomes unavailable during an asynchronous answer triggers a refusal.

An academic year alone does **not** imply an expiry date. Historical 2024-25 records can still answer historical questions unless explicitly retired or validity-limited. Explicit validity dates apply to every request, including historical requests; historical evidence intended to remain usable should not receive a current-service expiry arbitrarily. Dates use midnight through 23:59:59.999 UTC. Existing records without dates remain usable and show review metadata as unknown; no seed record was retroactively verified or overwritten.

Supersession blocks obsolete evidence even if its replacement is in Review. The system does not automatically redirect canonical fee/intake routes to arbitrary replacement IDs. Update the canonical maintained facts or deliberately revise routing when changing those authoritative records.

Conflicting validated structured records with the same fact kind and academic year cause a refusal with the conflicting passages instead of silently selecting amounts/intakes. Equivalent programme lists in a different ordering are not conflicts. This guard does not detect contradictions in arbitrary prose or tables that have not been converted to validated facts.

## Page-aware publication

`PATCH /api/official-sources/:id/publish` accepts either `verifiedText` or `verifiedPages: [{ page, text }]`, plus optional `provenance`, `sourceUrl` and `expectedRevision`. Page batches are validated and sorted; duplicate pages, invalid dates/URLs, oversized text and stale supplied revisions fail before knowledge is changed. Total reviewed text is limited to 100,000 characters.

Publishing inherits known academic year/URL/document ID and records the authenticated publication-review action. Plain extracted text does not get invented page numbers. A reviewer must explicitly supply page-specific text to claim page lineage. The server does not independently prove those declarations against the original PDF.

Paragraph-aware chunks stay within 2,800 characters, splitting oversized paragraphs at whitespace where possible. It does not understand table semantics. Passage IDs are stable by document/page/chunk position; republishing increments revisions and text fingerprints identify content changes. Removed passages and older random-ID publications are archived rather than republished or deleted. Repeated publication at the same position replaces the current passage revision; this is not a full immutable version-history store. Account history retains prior answer excerpts and citation snapshots, not necessarily the complete former source.

Example using **synthetic metadata only**, not real institutional page claims:

```json
{
  "expectedRevision": 1,
  "sourceUrl": "https://example.com/notice.pdf",
  "provenance": { "academicYear": "2026-27", "documentVersion": "Fixture notice 2", "section": "Reporting" },
  "verifiedPages": [
    { "page": 4, "text": "Reviewed primary passage from page 4." },
    { "page": 7, "text": "Reviewed conditions from page 7." }
  ]
}
```

## Validation

Backend regression suite includes ten new provenance tests: date/page/year validation, inclusive validity boundaries, source review binding/privacy, supersession cycles, paragraph bounds, shared expiry-time projection, expired/future native/compound suppression, historical persistence, publication lineage/stable IDs, invalid-batch integrity and structured-conflict refusal.

Verification results: **110/110 backend tests**, **500/500 legacy cases**, **18/18 strict public diagnostics**, **24/24 promoted paraphrase diagnostics**, **5/5 frontend unit tests**, both browser workflows, frontend lint and production build passed. Freshness checks do not convert these developer diagnostics into independent accuracy results.

Browser maintainer checks exercise the optional source fields, explicit source-review checkbox, page/version/review display and restart persistence. Public language/browser checks retain the restored footer, compact language selector, safe passage rendering and mobile/keyboard behavior. These are developer checks, not independent relevance or language accuracy results.

Reproduce from backend with `npm.cmd test`, `npm.cmd run evaluate:public -- --strict`, `npm.cmd run evaluate:paraphrases`, and `npm.cmd run evaluate`. From frontend run both browser scripts, `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`. No maintained database reset, paid API calls, Git push or deployment was performed.

## Known limitations and next step

A recorded review is an authenticated action, not proof of reviewer competence, source authenticity or every claim's truth. Expiry needs authoritative dates; unknown metadata remains unknown. Page extraction is not automatically page-preserving for old flattened PDF/OCR text, and paragraph splitting can split long tables. Semantic prose contradictions, immutable full document-version archives, freshness across every personal-workflow helper, independent evaluation, competent-speaker review and production deployment remain separate work.

Next increment: claim-level evidence validation, beginning with supported factual fields and citation membership, without pretending numeric equality proves semantic entailment.
