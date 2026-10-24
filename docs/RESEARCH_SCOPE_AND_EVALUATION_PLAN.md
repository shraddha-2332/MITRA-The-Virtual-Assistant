# Mitra: evidence-backed paper scope and evaluation plan

Prepared 24 October 2026. This document supersedes unsupported experimental framing in the existing IEEE draft; it does not establish novelty or independent accuracy.

## Assessment

Mitra addresses access to maintained MITCORER admission and campus information across programme, year, route, category, gender and selected languages. Its implementation combines structured factual rendering with bounded retrieval, optional generation and source maintenance. The research question is whether this separation reduces unsupported or wrong-row factual answers while preserving useful query coverage.

## Proposed paper scope

Working title: **Mitra: An Institutional Information Assistant with Maintained Facts and Controlled Generation**.

The current paper can describe system design, implementation, trust boundaries, maintenance workflow and automated regression validation. An empirical superiority paper requires new independently reviewed measurements. A narrow wrong-row verification study is a possible later contribution, not an established result.

### Revised abstract foundation

Mitra is a web-based assistant for institution-specific admission and campus information at MITCORER Barshi. Institutional answers depend on programme, academic year, admission route and applicant attributes, making unsupported generation and incorrect table-row selection important failure cases. The system combines maintained published records, deterministic rendering of critical structured facts, bounded multilingual query interpretation, source provenance and optional evidence-conditioned generation. Selected generated factual tokens and slot values are checked before acceptance. Administrators maintain revision-controlled knowledge and review staged source changes. Local automated tests exercise routing, persistence, maintenance authorization, localization and failure behavior. These development checks establish defined implementation behavior; independent answer-quality, retrieval, multilingual and latency evaluation remains necessary. The proposed evaluation separates exposed regression cases from newly authored questions and measures target-cell correctness, unsupported acceptance, refusal quality, retrieval performance and generation cost.

### Claims and evidence boundaries

| Claim | Current defensible wording |
| --- | --- |
| Factual control | Selected critical fee/intake routes render maintained records deterministically |
| Generation checks | Selected numeric, promise and slot checks are implemented; full semantic entailment is not verified |
| Languages | Bounded English/Marathi/Hindi handling, native structured tables and reviewed translations with explicit fallback |
| Conversation | Heuristic profile/topic context; not unrestricted coreference or general dialogue understanding |
| Source freshness | Optional validity metadata and staged website-change review; no universal live factual synchronization |
| Evaluation | Automated developer regression checks, explicitly separate from independent research evaluation |
| Novelty | Candidate engineering contribution; requires a verified primary-source literature comparison |
| Deployment | Configuration exists; production deployment, load and recovery remain unverified |

Do not retain the existing draft's held-out dataset origin story, model baseline percentages, wrong-row detection percentages, cross-lingual accuracy tables or comparative latency figures as results. No corresponding reproducible independent experiment was established by the repository review. The 500 regression cases are not 500 independently collected helpdesk questions.

## Implementation corrections in this increment

- Initialize generation context before verification, fixing the reproduced successful-response crash.
- Keep recognized critical fee, intake and seat-matrix topics out of advisory generation routing.
- Remove independent hardcoded profile fee notes after maintained answer construction.
- Enrich the original fee follow-up rather than replacing its route/year/semester qualifiers.
- Retain a single explicit valid academic year in conversation context, while preserving explicit conflicting/invalid input for the scope parser.
- Forward explicit English exclusions unchanged rather than rewriting them from an older profile.
- Bound public conversation length to the same 200 messages used for authenticated history.
- Isolate conversation tests with in-memory databases.

These fixes do not resolve every context ambiguity, model failure, semantic claim or public conversation security concern. Public continuation still relies on the supplied conversation ID and requires a separate session-isolation review.

## Planned experiment

1. Freeze the corpus, structured facts, provenance, source versions and code revision. Record hashes and runtime configuration.
2. Obtain fresh independently authored questions from institutional/domain reviewers, with separate development and final sets. Do not reuse exposed paraphrases as held-out material.
3. Label answerability, expected evidence, required facts, forbidden claims, required clarification and exact target cells. Record reviewer disagreement and adjudication.
4. Compare the same corpus and questions using keyword/rules, raw and normalized BM25, conceptual/hybrid retrieval where applicable, and a controlled document-generation baseline. Verify actual provider/model availability before generation experiments.
5. Ablate deterministic rendering and selected verification checks. Keep retrieval-only metrics separate from end-to-end answer quality.
6. Evaluate fees across category, gender, route and year; accommodation across hostel/mess/deposit; intake across programme and year. Include retired/expired records, missing slots, changed facts, negation, explicit topic changes and multi-turn DSE requests.
7. Construct wrong-row cases including answers with only a competing figure, both correct and incorrect figures, mislabeled amounts, and legitimate comparative tables. Report false acceptance and false rejection, not detection alone.
8. Obtain competent-speaker judgments for regional-language answers. Native digit preservation is not a fluency score.

### Metrics to report only after measurement

- Retrieval Recall@K/MRR with clearly defined relevance judgments; label existing evidence-group proxies as group metrics.
- Answer correctness/completeness and exact target-cell accuracy with explicit denominators.
- Wrong-row detection, false acceptance, false alarms and missing-slot behavior.
- Unsupported-answer, refusal and clarification quality.
- Multi-turn slot retention and scope correctness, including topic changes.
- Language correctness and source/citation support.
- End-to-end p50/p95 latency, failure rates, actual model calls, token usage and cost.

Report dataset provenance, exposure, reviewer counts, model settings, repeated-run variability and representative failures. Local regression pass rates must not be relabeled as overall answer accuracy.

## Verification for this increment

On 24 October 2026: backend tests **155/155 passed**; backend syntax check passed; legacy development evaluator **500/500 passed**; strict public diagnostics **36/36 passed**; `git diff --check` passed. The generation regressions use mocked responses and in-memory knowledge, including a clearly synthetic mentoring record that is never added to maintained data. No live model accuracy, independent language quality, production deployment or load result is claimed. Frontend source was unchanged; its earlier passing tests/build were not rerun in this increment. The existing Word manuscript was not regenerated and remains an unverified prior draft.

## Next step

Use the corrected implementation and regression report as the system-description baseline. Complete primary-source literature verification and independent question/label collection before writing comparative results. Until then, prepare a design-and-implementation manuscript with a clearly marked evaluation plan.

Follow-up materials: [verified literature and corrections](LITERATURE_VERIFICATION.md), [design-and-implementation manuscript](MITRA_RESEARCH_MANUSCRIPT.md), and [independent evaluation packet](INDEPENDENT_EVALUATION_PACKET.md). Focused literature verification and a blank review schema are complete; independent collection and judgments remain pending. The older IEEE draft and its Word rendering are not validated by these materials.
