# Controlled keyword versus BM25 comparison

Measured: 9 October 2026. This is an offline development experiment, not a production retrieval change.

## Assessment and plan

The user accepted the current language behavior and authorized moving forward while watching for problems. Formal competent-speaker review remains unverified; this acceptance does not change translation review stamps or activate unreviewed prose.

Compare the current rule-assisted keyword retriever with a dependency-free BM25 lexical baseline. BM25 uses inverse document frequency, term-frequency saturation and document-length normalization; see [Robertson and Zaragoza, BM25 and Beyond](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf). The implemented positive IDF variant is `log(1 + (N - df + 0.5)/(df + 0.5))`; `k1=1.2`, `b=0.75`. Parameters are fixed before this run and have not been tuned on the cases.

## Implementation and controls

- Same 36 published seed records and 30 questions for all methods: 12 supported public-development cases plus 18 additional retrieval cases. The actual maintained database is untouched.
- Keyword method calls the existing `retrieveKnowledge` unchanged. This is the **current** baseline, not the older frozen original-project baseline. Its bonuses and top-three cutoff remain intact.
- Plain BM25 indexes title, category, tags and text concatenated without field boosts, stemming, stopword filtering or topic rules. Unicode combining marks are retained. Repeated query terms count once; score ties use record ID.
- Normalized BM25 uses the same existing query normalization as keyword retrieval, isolating some multilingual/alias effects. No record-specific bonuses are added to BM25.
- No answer builders, compound decomposition, Gemini, network requests or audit writes enter the ranking measurements. This isolates retrieval rather than letting prepared answers mask failures.
- BM25 is built once, then each method gets 10 warmups per question and 100 timed repetitions. Timing method order alternates. The measured corpus build took 2.236 ms.
- Fresh temporary SQLite state is closed and removed after evaluation. Reports retain corpus, questions, ranked IDs/scores, source hashes, runtime and methodology.

## Measured result

| Method | Evidence-group Recall@1 | Evidence-group Recall@3 | Evidence-group MRR@3 | Local p50 | Local p95 |
|---|---:|---:|---:|---:|---:|
| Current keyword/rules | 91.67% | 100.00% | 0.9556 | 0.3701 ms | 0.6418 ms |
| Plain BM25 | 63.33% | 81.67% | 0.7194 | 0.0198 ms | 0.0348 ms |
| Normalized-query BM25 | 70.00% | 95.00% | 0.8083 | 0.0294 ms | 0.0630 ms |

Each case has one or more required facets; each facet lists acceptable alternative records. Recall is the fraction of required facets represented in the first K results, macro-averaged over questions. Group MRR averages each facet's reciprocal rank, counting missing facets as zero, then macro-averages questions. These are **group metrics**, not conventional exhaustive-document retrieval metrics. Precision is intentionally omitted because judgments do not label every potentially relevant record.

Normalized BM25 missed:

1. `PUB-007`: courses plus Open-category fees. It returned KB-2, KB-9 and KB-30, missing the required canonical programme record KB-10. KB-9 overlaps with current programme information; incomplete/record-specific relevance judgments and corpus duplication need review.
2. `RET-03`: “How do students travel using college transportation?” It returned KB-34, KB-28 and KB-17 instead of the dedicated transport record KB-19. Plain token matching and current aliases do not bridge this paraphrase sufficiently.

Corpus SHA-256: `224dafbe993a69d6e67977aac103140bc20887ddfe2007eceaba847a6e892283`.

Cases SHA-256: `0e4452775edba329c949241a162f9f6209f4377983ef377f16933a11d97be087`.

## Validation

Backend tests: **91/91 passed**, including hand-calculated BM25 scoring, repeated query terms, retired-record exclusion, empty/unmatched queries, deterministic ties, Unicode tokens, parameter validation and missing-facet metric denominators. Strict public development evaluator: **18/18 passed**. The production answering pipeline still uses keyword retrieval.

Reproduce from `backend`:

```powershell
npm.cmd run evaluate:retrieval
npm.cmd test
npm.cmd run evaluate:public -- --strict
```

Full run output is `backend/evaluation/reports/retrieval-latest.json` (ignored generated artifact). Reruns may change latency; source/corpus changes change hashes. The older original-project baseline artifacts have not been modified.

## Known limitations

Questions and relevance groups are developer-authored and unreviewed; several familiar questions favor established rules. This is not held-out evidence or overall answer accuracy. Thirty questions and 36 records are insufficient to claim general superiority. Current keyword rules can perform well here without generalizing to new wording or sources.

BM25 prebuilds term statistics while keyword retrieval scans records on each query, so timing includes this architecture difference. No process-memory, scaling, throughput or end-to-end latency claims follow from these timings. Both methods make zero external API calls in this experiment; no hosting-cost estimate is supplied.

Unsupported, outdated and adversarial requests are deliberately excluded from recall denominators because they have no straightforward positive relevance groups. Retrieval matches alone do not establish answerability or suitable academic-year scope. Those behaviors retain separate public API diagnostics and need independently reviewed evaluation before any production switch.

## Recommendation and next step

Retain current production retrieval. Keep BM25 as an experimental baseline: this run shows lower group retrieval scores despite lower local ranking latency. Review source duplication and relevance judgments, gather independently written paraphrases and held-out questions, and define answerability judgments separately. Then evaluate any alias/field-weighting or hybrid candidate on development cases and freeze it before held-out testing. Do not claim improvement by tuning and reporting on the same questions.

The subsequent [miss analysis and independent-review workflow](RETRIEVAL_REVIEW_WORKFLOW.md) explains all six plain-BM25 misses and two normalized-BM25 misses, supplies blinded development passages, and prepares 24 unevaluated paraphrase candidates. Independent review and a fresh final held-out set remain pending.
