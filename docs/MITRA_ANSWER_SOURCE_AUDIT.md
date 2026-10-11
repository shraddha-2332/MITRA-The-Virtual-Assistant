# Answer presentation and source audit

10 October 2026. Scope: all public quick replies, all implemented answer families and selected route/year/unsupported edge cases. The catalogue contains 71 distinct questions, tested in English, Marathi and Hindi against both new seeded data and a read-only snapshot of the maintained database. These are development regression checks, not an independent answer-accuracy benchmark.

The [complete audited catalogue](answer-audit/CATALOGUE.md) lists each question, its visible row counts in all three languages and its maintained external references.

## Problems corrected

- Restore programme rows for First Year B.Tech, Polytechnic and Direct Second Year. Course names, intakes and codes are parsed from maintained answers rather than substituted from frontend constants.
- Restore category rows for First Year and Direct Second Year fees, and separate hostel, refundable deposit, hostel total and annual mess rows. Native templates preserve their actual labels and values. Unrecognised prose remains unchanged.
- Keep compound answers in labelled sections. Preserve existing explicit bullets, paragraphs, warnings and English fallback notices. Remove the automatic conversion of long prose into sentence bullets, and prevent internal workflow "Next" instructions from leaking into public multilingual fallbacks.
- Keep the evidence expansion removed, original footer and compact language control.
- Replace the 404 `about-lib-details.html` URL with the official [Library Details](https://mitcorer.edu.in/about-lib-details.php) page, verified through the college's library navigation. The compatibility resolver also covers old maintained records without rewriting their saved values.
- Use the official [Placement Cell](https://mitcorer.edu.in/placement-cell.php) and [Recruiters](https://mitcorer.edu.in/our-recruiters.php) pages instead of presenting YouTube as an answer source.
- Anchor prepared answers to their actual supporting record(s), while retaining dynamic retrieval for published notices. Remove unrelated secondary retrieved links and deduplicate displayed URLs.
- Add the official FY documents and eligibility page only where a reference is absent; preserve maintainer-supplied URLs and explicitly empty references.
- Stop attaching the AY 2025-26 FRA PDF to ordinary AY 2026-27 fee answers. It remains available only when specifically relevant to a previous-year/FRA query.
- Show bundled fee notices only when their year and complete amounts match the maintained passage. Choose notices for the routes actually present in the answer; include hostel notices in compound answers. Edited amounts or years invalidate the old snapshot link.
- Refuse to substitute B.Tech academic amounts for Polytechnic fees. Bus-route/fee questions use transport evidence, and questions about another academic year do not receive a hardcoded 2026 admission portal.

## Reproduce

From `backend`: `node --no-warnings=ExperimentalWarning scripts/audit-answer-sources.js`.

From `frontend`: `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run test:all-answers-browser`, `npm.cmd run test:language-browser`, and `npm.cmd run test:maintainer-browser`.

The audit reads the actual database through a read-only SQLite connection, then tests temporary copies. It disables Gemini and never loads `.env`. Browser requests use isolated backend/frontend ports. Downloaded page extracts and screenshots are saved beneath `frontend/tmp`; full generated reports are under `docs/answer-audit` and ignored by Git.

## What the checks establish

Final results: **111/111 backend tests**, **14/14 frontend tests**, backend syntax check, frontend lint and production build passed. **426/426 catalogue browser journeys**, the separate 14-case language browser checks and maintainer restart/conflict/authorization E2E passed. Existing diagnostics remain **500/500 legacy** and **18/18 public development** checks. These counts establish the checks described here, not human-reviewed accuracy.

The URL inventory contained **42 unique addresses**. **30/30 external URLs emitted by the assistant were reachable** on the audit date. The inventory also retains the obsolete, non-emitted library URL as a documented 404 and its verified replacement. Local fee-notice assets were requested successfully during the browser journeys.

Follow-up library correction: the already-running backend process on port 4000 still returned the old `.html` URL. The frontend now resolves that known obsolete URL for existing/stale responses as well, without replacing unrelated maintainer links. A browser regression supplies the stale URL and verifies a single working `.php` link. Frontend tests after this correction: **15/15**, lint and production build passed. The official `.php` page was rechecked with HTTP 200. Restarting the backend is required to load the earlier backend changes into that running process.

The browser checks compare factual numbers, ensure every returned source link appears, reject duplicated displayed URLs, request bundled source assets, check mobile overflow, verify non-empty answers and absence of the evidence expansion, and collect browser errors. Representative screenshots were visually reviewed for English and native layouts. Unit regressions cover retained conditions, route/year/edited-value preservation, and source matching. Separate maintainer E2E checks retain persistence and authorization coverage.

HTTP reachability is a dated observation. Page content and official navigation were inspected for corrected references; a successful HTTP request alone does not prove every claim. The old stored library URL remains a recorded 404 in the inventory but is not emitted by the assistant.

Some historical records have no exact external URL in the maintained data. They do not receive an unrelated current-year document. Current academic and hostel amounts rely on the supplied notices where matched; the prior-year FRA PDF cannot establish those amounts. No competent-speaker or independent benchmark approval is inferred from this audit. A finite regression catalogue cannot cover every possible user wording or guarantee future external-site availability.
