# Public assistant baseline and evaluation

## Assessment and scope

The baseline milestone preserved the original backend answer engine and measured the public endpoint used by Mitra. Subsequent input-validation and knowledge-persistence fixes are recorded below. The legacy authenticated evaluator remains available. A Git repository was initialized, but no commit or remote was created.

The initial public dataset has 18 developer-authored, **unreviewed development** cases. Expected facts are taken from the seed corpus; they are not independently verified college facts. The dataset must not be described as held-out research evaluation or representative accuracy.

## Run

From backend on Windows:

```powershell
npm.cmd test
npm.cmd run evaluate
npm.cmd run evaluate:public
npm.cmd run evaluate:public -- --strict
```

Use npm instead of npm.cmd on systems without PowerShell's npm.ps1 execution restriction.

The default public evaluator is diagnostic: observed assistant failures appear in its JSON report and do not cause a nonzero exit. `--strict` exits 1 if any case fails. Invalid datasets and runner errors fail in both modes. Only `--strict` is accepted; the evaluator intentionally has no remote URL or model-enabled option.

The runner starts a loopback server on an ephemeral port, creates a fresh SQLite database under an exclusively created OS temporary directory, disables Gemini even if a key is in the environment, and closes/removes that temporary database afterward. It does not open the application's database, load .env or use personal uploaded documents. Public rate-limit state is reset between independent cases; this makes an offline run feasible without altering production policy. This run does not test rate limiting or multi-turn context.

## Files and contracts

- `backend/evaluation/public-development.json`: readable diagnostic questions and expectations.
- `backend/evaluation/public-evaluation.js`: dataset validation, scoring and aggregation.
- `backend/scripts/evaluate-public-assistant.js`: isolated public HTTP runner and JSON report output.
- `backend/test/public-evaluation.test.js`: regression tests for invalid datasets, partial answers, language-script checks, forbidden content, response/error contracts and aggregation.
- `backend/evaluation/reports/public-latest.json`: generated full responses, failures and timing; ignored by Git.
- `backend/evaluation/baselines/original-public/`: preserved original-engine snapshot, seed corpus and initial report.

Each case declares language, category, answerability, expected HTTP status, evidence groups, required claim-text groups, required behavior-text groups, forbidden phrases, evidence-empty expectation and Devanagari-script expectation. A group contains acceptable alternatives; every group is required. Evidence IDs are checked against published seed records. Supported cases must specify evidence and claims. Unsupported/ambiguous cases must specify refusal/clarification behavior.

The report includes complete responses for later human review, the dataset/corpus SHA-256 fingerprints, backend source hashes, Node version, platform, evaluation mode and per-language/category/answerability counts. Do not include real personal questions or credentials in evaluation fixtures.

## Initial results: 9 October 2026

Public checks: **10 passed, 8 failed, 18 total**.

| Failure family | Cases | Observed issue |
| --- | --- | --- |
| Compound answers | PUB-007, PUB-008 | Required claim text missing despite required evidence being returned |
| Marathi/Hindi output | PUB-009 through PUB-011 | Requested Devanagari response missing |
| Ambiguous reference | PUB-016 | Intake inferred without asking which programme; evidence returned unexpectedly |
| Input validation | PUB-017, PUB-018 | Empty/whitespace question returned 500 rather than expected 400 |

All required evidence groups were present for the 12 supported cases. This small development set therefore shows answer composition/language/validation gaps even when returned evidence IDs match expectations. It does not establish that retrieval is generally solved or that every cited record supports the answer.

The original report records local latency and exact answers. Timing is one sequential, local run including audit database writes, without warmup; it is not a production benchmark.

## Baseline preservation

`engine-src.zip` preserves backend/src before answering changes. `seed-knowledge.json` freezes the corpus used in the baseline. `public-development.json` preserves the exact question set. `evaluation-tools.zip` preserves the runner/scorer (two files at archive root). `public-report.json` records the original responses and source/dataset hashes. `manifest.json` records artifact checksums and the backend source checksums; an automated test verifies artifact integrity. No credentials from .env, runtime databases, uploads, backup data or node_modules are included. The engine source includes existing demo-account seed logic; it must not be used as a production configuration.

For a future comparison, retain this directory unchanged. Compare the same questions on the same corpus first; separately report gains from knowledge updates. For reproduction of the original engine, extract `engine-src.zip` into a separate backend checkout (archive contains a `src` directory), restore the archived runner to `scripts/evaluate-public-assistant.js`, the archived scorer to `evaluation/public-evaluation.js`, and the archived dataset to `evaluation/public-development.json`. Use the recorded Node version, run the evaluator directly with Node, and verify dataset/corpus/source fingerprints. The snapshot covers the backend engine, not a full deployable frontend release.

## What the numbers mean

- Evidence-group recall: fraction of required alternative-ID groups represented in returned evidence; average only over applicable cases.
- Evidence-group mean reciprocal rank: reciprocal rank of the first matching returned ID for each required group, averaged per case then across applicable cases. This is a group-based diagnostic, not an independently judged standard MRR benchmark.
- Claim-text coverage: required text groups found in an answer. Synonyms, negation and semantic truth are not resolved by substring matching.
- Devanagari check: at least 12 characters from the Devanagari block. It does not distinguish Hindi from Marathi or establish translation quality.
- Passing refusal/injection fixtures: only the listed behavior was observed in deterministic mode; this says nothing about Gemini prompt-injection resistance.

No automatic factual correctness, citation entailment, fluency, model cost or calibrated confidence percentage is claimed. Human review must assess those dimensions.

## Plan for independent evaluation

1. Ask faculty/domain reviewers to verify source facts, relevant evidence and expected claims.
2. Have competent Marathi/Hindi speakers review both questions and answer rubrics.
3. Have independent reviewers author final questions, keeping translated variants and conversation families in one split.
4. Freeze corpus version and success thresholds before final testing.
5. Do not tune retrieval or templates on final questions. Run developer diagnostics separately.
6. Review factual correctness, completeness, citation support/coverage and language quality manually; record reviewers and disagreements.

No held-out questions were fabricated or labelled independently reviewed in this milestone. The validator accepts only the current development workflow until a separate reviewed final-evaluation contract is established.

## Input validation and persistence update: 9 October 2026

Empty, whitespace-only, missing, non-string and overlength questions now return a structured 400 BAD_REQUEST on both assistant endpoints. Length is checked after trimming. The original generic Error was being mapped to INTERNAL_ERROR/500.

Knowledge and official-source seeds now initialize only a fresh database. Load normalization retains maintained records without seed overlays or reinserting missing seeds. Saves persist current in-memory data directly. The existing legacy shape normalization is retained. No database deletion or destructive schema change is required; previously overwritten edits cannot be reconstructed by this fix.

Added API validation regression coverage and three storage tests using isolated databases, including real separate Node process restarts. They verify updated text/title/source/URL/tags/status/timestamp, removed seed records, empty libraries, custom records and unrelated legacy data preservation.

Validation: **52/52 backend tests**, syntax check passed, **500/500 legacy benchmark**, public development checks **12/18 passed** (up from 10/18). The six remaining failures concern compound answers, requested language and clarification. Original archived baseline artifacts remain unchanged.

Persistence correctness does not make every answer use maintained facts: direct answer builders still contain independent facts. An individual record edit API, versioned maintenance migrations and structured factual rendering remain later work. No application database was reset by the validation runs.

## Next implementation step

Language update (9 October 2026): **18/18 public development checks now pass**, including strict mode; backend **88/88**, legacy **500/500** and frontend formatting **3/3** pass. Marathi/Hindi templates and reviewed-translation handling are implemented with explicit English fallback for uncovered prose. The language-script checks do not establish fluency or overall accuracy. See [multilingual implementation and review requirements](MITRA_MULTILINGUAL_RESPONSES.md). Next: competent-speaker review and a controlled lexical retrieval comparison.

Compound/clarification update (9 October 2026): public checks now pass **15/18**, with PUB-007, PUB-008 and PUB-016 resolved. PUB-009 through PUB-011 still fail requested-script checks. Backend checks pass **75/75**, legacy evaluation **500/500**, and frontend formatting **3/3**. Dataset and original baseline artifacts are unchanged. Supported-case evidence-group recall and claim-text coverage are both 1.0 on this small diagnostic set; these proxy results do not establish general accuracy or citation entailment.

Protected editing, selected structured facts, compound answering, clarification and scoped Marathi/Hindi responses are now implemented. See [knowledge maintenance](MITRA_KNOWLEDGE_MAINTENANCE.md), [compound answering](MITRA_COMPOUND_QUESTIONS.md) and [multilingual responses](MITRA_MULTILINGUAL_RESPONSES.md) for scope and limitations. Next, obtain competent-speaker review and compare retrieval methods on a fixed corpus. Retain diagnostic expectations and the original baseline.
