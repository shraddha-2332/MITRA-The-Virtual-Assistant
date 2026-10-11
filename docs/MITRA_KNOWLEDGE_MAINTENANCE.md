# Knowledge editing and maintained factual answers

Implemented: 9 October 2026.

## Assessment and plan

Persistence was repaired previously, but there was no individual record edit endpoint. Fee, hostel and historical seat-matrix builders also repeated factual amounts independently of stored knowledge. An administrator could maintain a record while the assistant continued to show an old amount.

This increment adds protected editing with revision checks and ties selected deterministic answers to maintained published records. It retains the modular monolith, SQLite collection and existing source-publication workflow; no dependency or database reset is introduced.

## Implementation

Administrators can choose **Edit record** in the knowledge interface to update title, category, source authority, official URL, tags, reviewed text and publication status. **Retired**, **Archived**, **Review** and **Draft** records are excluded from public retrieval. Saving shows progress and preserves the edit form on error. Cancelling leaves the persisted record unchanged. A revision conflict requires copying edits and refreshing before trying again.

Structured records provide labelled fields for academic-year/category fee tables, hostel/deposit/mess charges and programme intake/choice codes. The backend validates amounts and years and generates the published text from those fields. Conflicting free text is rejected. New databases receive structured seed records. Existing plain-text records are not overwritten or automatically parsed: administrators can choose the appropriate record format and enter reviewed values to convert them. Plain-text answers use their maintained text directly until conversion.

Selected canonical records:

| Record | Controlled answers |
| --- | --- |
| KB-2 | Academic fees, including route/category-specific rendering when structured |
| KB-3 | Hostel and mess fees |
| KB-10 | Current first-year B.Tech programmes and CSE intake/choice code |
| KB-6 | Historical seat matrix, rendered from maintained reviewed text |

Cards identify these uses in the admin interface. Editing an older duplicate CSE intake record does not update the canonical programme table. Managed responses cite their actual supporting record rather than the highest unrelated keyword result. A retired/missing canonical record or unavailable explicitly requested academic year produces an unsupported-information response without falling through to obsolete amounts or Gemini generation.

## API contract

`POST /api/knowledge` and `PATCH /api/knowledge/:id` require an administrator bearer token. Staff can read knowledge but cannot modify it.

Editable fields: `title` (180 characters), `category` (80), `source` (180), `sourceUrl` (2,000; HTTP/HTTPS, no embedded credentials), `text` (100,000), `status`, `tags` (up to 30, each 80), and optional `facts`. Unknown fields and invalid publication states are rejected. Raw text is retained as text; React renders it without HTML execution. Source URLs are not fetched by the edit operation.

Creation defaults to **Review** unless a valid explicit status is supplied. Creation returns revision 1. Legacy records without a revision have revision 0. Patches must include the last observed `expectedRevision`; a successful edit increments it. Missing revision or malformed fields return 400, unauthenticated requests 401, insufficient role 403, unknown records 404, stale revisions 409 `REVISION_CONFLICT`. Successful responses retain the existing 200 `{ "data": record }` convention.

Example plain-text patch:

```json
{
  "expectedRevision": 0,
  "text": "Reviewed institutional notice text.",
  "source": "College circular",
  "sourceUrl": "https://example.edu/notices",
  "status": "Published"
}
```

Example hostel facts (illustrative values, not institutional data):

```json
{
  "expectedRevision": 0,
  "facts": {
    "kind": "accommodationFees",
    "academicYear": "2026-27",
    "hostel": 21000,
    "refundableDeposit": 1000,
    "messAnnual": 12000
  }
}
```

`academicFees` requires `academicYear`, and `firstYear`/`directSecondYear` objects each containing non-negative integer `open`, `concessionBoy`, `concessionGirl`, `vjnt`, `scst` amounts. `programIntake` requires `academicYear` and 1–30 unique `programs` with a name, non-negative integer intake and numeric-string choice code. Reserved canonical records enforce their designated fact type. `facts: null` removes structured fields only when replacement reviewed text is supplied. Editing and publication changes produce `knowledge.updated` audit events with revision and status.

## Validation

Final checks: **64/64 backend tests**, **500/500 legacy benchmark**, backend syntax check, frontend lint/build and **3/3 answer-formatting tests** passed. The 18-case public diagnostic run passed **12/18**; its original baseline artifacts were not changed. Validation used isolated test databases, and no application database reset or GitHub push was performed.

The backend suite covers admin-only editing, malicious URL schemes, arbitrary-field rejection, invalid facts, contradictory text, publication states, stale revisions, canonical evidence, edited numbers/intake, unavailable years, retirement and persistence after closing/reopening SQLite. Earlier storage tests also exercise a separate Node process restart.

The historical matrix assertion now accepts stored-source wording while still verifying Civil intake 30, E&TC intake 60 and the historical 2024-25 year. It no longer requires punctuation unique to the deleted hardcoded sentence.

Public development checks remain 12/18: compound answers, language output and clarification remain unresolved. Returned-evidence group recall on the 12 supported cases is now about 0.958 versus 1.0 in the preceding run, because a compound courses/fees answer cites only the fee record it actually uses. This exposes missing multi-topic evidence rather than attaching unrelated records. These are unreviewed diagnostics, not held-out accuracy. Baseline artifacts remain unchanged; current seed metadata/rendering changed, so future retrieval experiments must hold their corpus constant.

Browser automation timed out on both available browser attempts. Frontend lint/build and backend workflow tests provide validation; the new form has not yet completed a browser E2E run.

## Known limitations and next step

Revision checks protect against lost updates within the supported single backend instance; multi-instance coordination and complete history/version rollback are not implemented. Audit retention remains bounded. Re-publishing a source document replaces its chunks, so individually edited chunks may be replaced by that deliberate publication operation.

Other deterministic topics, legacy planner screens and fee images still contain independent facts. This increment does not claim all institutional information shares one source of truth. Programme-year matching currently recognizes the YYYY-YY form. Full temporal semantics, human source verification and document/page citation support remain later work.

Next: implement multi-topic answering and ambiguous-question clarification, then improve retrieval and complete multilingual output against the preserved diagnostics.
