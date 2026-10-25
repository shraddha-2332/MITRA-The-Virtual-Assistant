# Verifier development diagnostics

Measured 24 October 2026. **Synthetic, developer-authored, exposed and unreviewed.** This is a characterization of verifier behavior, not independent answer accuracy, model error prevalence or a claim of superiority over published systems.

## Experiment

Fifteen explicit answer probes use the published 51-record seed corpus. Eleven answers should be rejected under the stated developer policy; four are valid controls. Inputs include supplied slots and selected evidence records. The test calls `verifyGeneratedAnswer` (the local token checker) and `verifySlotGrounding` directly. It does not exercise retrieval, the query parser, public routing, localization, Gemini, embeddings or the maintained local database.

Labels follow deliberate mutations: assign a competing value to the wrong row/route/service/programme, use current evidence for a historical request, omit required gender for a personal single-fee answer, invent a number or promise admission. Correct single facts and correctly labeled comparisons are controls. These labels have not received independent institutional approval.

## Observed decisions

Positive class means an answer that must be rejected. A missed invalid answer is a false negative; a rejected valid answer is a false positive.

| Method | Invalid answers rejected (TP) | Invalid answers accepted (FN) | Valid answers rejected (FP) | Valid answers accepted (TN) |
| --- | ---: | ---: | ---: | ---: |
| Local token checker | 2 / 11 | 9 / 11 | 0 / 4 | 4 / 4 |
| Local slot checker | 6 / 11 | 5 / 11 | 0 / 4 | 4 / 4 |

For these probes only, error-detection recall is 2/11 (18.18%) and 6/11 (54.55%), respectively; false-alarm rate is 0/4 for both. Four valid examples cannot establish a low population false-alarm rate. Aggregate proportions are not general model or application accuracy.

The slot checker accepted these invalid probes as `SLOT_VERIFIED`:

| ID | Failure | Root cause indicated by source inspection |
| --- | --- | --- |
| VD-03 | OBC boys/girls amounts are swapped, with both amounts present | Expected-token presence suppresses competing-value rejection; labels are not bound semantically |
| VD-06 | Current-year answer to a historical fee question | Specialized lookup ignores the requested academic-year slot; answer tokens match current evidence |
| VD-07 | Personal OBC DSE fee answered without supplied gender | Missing gender defaults to the boys' fee instead of requiring resolution |
| VD-10 | Hostel and mess amounts are swapped, with both present | Service check accepts expected-token presence without validating its label |
| VD-13 | Another programme's choice code assigned to the target | Choice code occurs in evidence but the specialized programme check only compares intake |

The application may prevent some of these paths through deterministic critical-answer routing. Verifier acceptance alone does not prove that the public API emits these answers. Conversely, API regression success does not establish verifier correctness. The experiment preserves the current implementation instead of tuning it to the probes.

## Reproduction and provenance

From `backend`:

```powershell
npm.cmd run evaluate:verifiers
npm.cmd run evaluate:verifiers -- --strict
```

Normal mode reports diagnostics and exits successfully. Strict mode exits 1 if **either** checker makes a false-positive or false-negative decision; this is expected for the recorded run. A nonzero strict result is not a tool crash. After future improvements, report the new source fingerprint and keep this historical result.

The script writes a fingerprint-named directory under ignored `backend/evaluation/reports/`, containing exact UTF-8 `corpus.json`, `cases.json` and `report.json`. Corpus/case SHA-256 values hash the actual serialized bytes, including their trailing newline. Source hashes cover all backend source modules and the evaluator. Repeated runs with the same input/source bytes preserve corpus/case files and refresh report runtime metadata. The engine snapshot identifies code contents; it is not a freeze of a future independent final benchmark.

Recorded input fingerprint:

```text
a30d982310520f22dc40f2ed282a9538861d02ff320f71d7aa5d5df75952e06e
```

The [compact machine-readable summary](research-review/verifier-development-results.json) records hashes, runtime, decision counts and missed cases. The reported Git HEAD is context only: working files differed during the first run, so per-file hashes identify evaluated contents. No secrets or maintained user records are exported.

## Validation and next engineering step

Backend tests: **157/157 passed**; syntax check passed. Repeat runs produced identical input fingerprints and decision counts; saved corpus/case byte hashes were independently recomputed; strict mode returned the expected exit code 1. Tests cover confusion-matrix denominators, invalid judgments, duplicate IDs, missing evidence references, corpus nonmutation and probe coverage. No application answer behavior changed in this increment.

Before expanding generation, address missing required slots, requested-year validation and programme-code binding. Mixed-value statements require actual claim-to-attribute validation or conservative rejection with explicit handling for legitimate comparisons. A patch that merely bans all competing values would also reject valid comparative answers. Use these exposed probes as regression material and retain a separate independently authored final evaluation.

## Follow-up corrections for faculty review

The subsequent bounded corrections reject a requested academic year unsupported by structured/provenance metadata, unresolved gender for selected concession fees, and a competing programme choice code when the target code is absent. They address VD-06, VD-07 and VD-13. A regression test also preserves the four valid controls. Mixed-value label swaps VD-03 and VD-10 remain accepted; semantic attribution and broader context handling are still incomplete.

On the same exposed 15 probes, the slot checker now records TP=9, FN=2, FP=0, TN=4: error-detection recall 9/11 (81.82%), with zero false alarms among four controls. The token checker remains TP=2, FN=9, FP=0, TN=4. These cases informed the patch, so this is a debugging result, not independent improvement evidence. Backend tests passed **158/158**, legacy diagnostics **500/500**, and public diagnostics **36/36**.

New input fingerprint: `2530e421d39b3ebc7e8d29f1d35fe78e3365c87e17ece524e329a622628c448c`. The [post-fix summary](research-review/verifier-postfix-results.json) preserves the new hashes and remaining misses; the original summary above remains unchanged. Strict mode still exits 1 because decision errors remain.


## Current bounded correction snapshot, 24 October 2026

The completion snapshot (`research-review/verifier-completion-results.json`) records 11/11 invalid probes rejected and 4/4 valid controls accepted by the slot verifier. Clause-level checks close the two exposed mixed-value label swaps. The token checker rejects 2/11 invalid probes, not zero across the full set. These same 15 development cases informed the fixes; this is regression evidence, not independent accuracy or general semantic verification. Earlier snapshots above remain historical. See `CURRENT_COMPLETION_STATUS.md` for current validation and external work.
