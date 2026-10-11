# Public answer presentation

Updated 10 October 2026 at the user's request.

The subsequent comprehensive [answer-format and source-link audit](MITRA_ANSWER_SOURCE_AUDIT.md) extends this initial repair to Polytechnic, DSE, native tables, compound sections and all public quick replies, with current validation results.

- First Year B.Tech programme tables render as separate course cards with intake and choice code, using the actual answer values. Both canonical and legacy table wording are supported.
- Academic fees render as category rows under separate First Year and Direct Second Year headings. Hostel fees retain separate refundable deposit, total and annual mess rows. Amounts and years come from the maintained answer, and trailing cautions remain visible.
- The public "Evidence used for this answer" expansion has been removed. Official source links remain available. Evidence snapshots, source validation and persistence remain in the backend; earlier documentation describing the public expansion records its previous implementation.
- Unrecognised prose and translated answers retain their content without substitution from frontend constants. Admission cautions are preserved.
- The compact header language selector and original footer remain.

Validation: 9/9 frontend unit tests, lint and production build passed. Isolated Chrome language checks passed, including six programme cards, two academic fee tables with ten category rows, preserved amounts, official links, hidden evidence, keyboard/mobile behaviour and literal HTML safety. Maintainer browser checks previously passed, including save conflicts, edited fee values and persistence across a separate backend process restart.

This presentation change does not constitute competent-speaker approval or independent benchmark review.
