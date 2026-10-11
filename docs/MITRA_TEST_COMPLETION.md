# Evaluation checks completed and passage traceability added

Date: 9 October 2026.

## Assessment and plan

The user requested completion of pending tests and progression to the next engineering step. The 24 assistant-authored candidates had never been executed. Independent relevance judgments and competent-speaker approval require actual reviewers and cannot be supplied by automated tests or the question author.

Run the candidates as explicitly unreviewed development diagnostics, fix reproduced failures, retain the original relevance comparison, rerun regression and browser checks, then improve source traceability.

## Reproduced failures and fixes

The first candidate run passed 22/24 HTTP contracts. Two Marathi/Hindi programme questions returned 500: the translation fallback evaluated `record.text` when no matching published record existed. It now checks both the record and translation before evaluating source hashes.

Further diagnostics exposed incomplete answers even when HTTP contracts passed:

- Native wording for first year, accommodation/dining costs, deposits, branches and choice codes was not normalized consistently.
- A request for every branch mentioning CSE could become a CSE-only answer. A shared programme-scope decision now governs both English facts and native templates.
- Ambiguous “that costs” and Marathi references could return fee tables without a known subject. These now ask for clarification.
- `schedule` matched `Scheduled Tribe`, and fee schedules reached admission-deadline answers. Exact-word timing checks distinguish category names and fee comparisons.
- Comparing first- and direct-second-year fees selected only the second-year table. A request explicitly naming both routes now retains both.
- Library/transport prepared prose could omit operational uncertainty or include details absent from retrieved evidence. These routes now use the current published passage, along with selected category-document and non-CAP concession questions. Pragati retains its dedicated existing route.

These bounded alias changes are development fixes, not evidence of general semantic understanding. The current production retrieval method remains keyword/rule based; query normalization and answer routing have changed. Previously recorded BM25 metrics describe the earlier source hashes, not this later revision.

## Completed diagnostics

`npm.cmd run evaluate:paraphrases` executes all 24 questions against a fresh temporary loopback API and the frozen 36-record corpus with Gemini disabled. It checks the HTTP/language contract and developer-defined evidence IDs, amounts, complete programme names/codes, clarification and uncertainty markers. It saves actual responses and all three retrieval rankings without claiming relevance accuracy.

The later run passed **24/24 HTTP contracts and 24/24 developer diagnostics**. Semantic human review remains **0**. See [actual question/answer results](retrieval-review/PARAPHRASE_RESULTS.md). Test success does not establish fluency, factual entailment or full question completeness.

Final regression checks: **100/100 backend tests**, **500/500 legacy cases**, **18/18 strict public diagnostics**, **3/3 frontend formatting tests**, frontend lint and production build. Real Chrome checks passed 14 native-language journeys plus error recovery, English override, mobile overflow, keyboard-operated passage expansion and literal rendering of HTML-like evidence without execution.

The exposure ledger is written before testing. Those 24 questions are now development material and cannot be claimed as untouched held-out questions. The original candidate manifest is retained as an archive and annotated accordingly. A guard checks exposure hashes; a fresh independent final dataset still needs to be authored and reviewed.

## Next increment implemented: passage traceability

API evidence now contains a stable record ID, revision, content-bound citation ID, available academic year and a source-text excerpt capped at 2,800 characters. SHA-256 fingerprints the full source text, and the response marks truncation. The public chat lets users expand sources and read the stored evidence passage, including source links.

Only published records are projected. The projection uses an explicit field allowlist; reviewer identities, translations and arbitrary internal metadata are not exposed. Passage text is rendered as React text rather than executable HTML. Account history already retains the evidence objects, preserving the cited snapshot when a source subsequently changes.

Academic years are supplied only from structured facts or explicit record metadata. Missing years, verification dates and PDF pages are not guessed. Legacy revisions default to zero; the content hash distinguishes text edits even for legacy records. A hash identifies content; it does not establish authenticity, correctness, passage-level entailment or human verification.

## Reproduction

From backend: `npm.cmd test`, `npm.cmd run evaluate:public -- --strict`, `npm.cmd run evaluate:paraphrases`, and `npm.cmd run evaluate`.

From frontend: `npm.cmd run test:language-browser`, `npm.cmd run lint`, `npm.cmd run build`.

Tests use isolated data. No maintained database reset, paid model calls, Git push or deployment is performed.

## Remaining work

Independent relevance/speaker judgments and an independently authored final test set remain external inputs. The prepared review packets are available; no review status has been fabricated. Broader roadmap items—PDF page lineage, claim-level grounding, maintainer/browser E2E coverage, production configuration and actual deployment—are not declared complete by this increment.

The next increment completed [maintainer browser E2E and actual backend-process restart verification](MITRA_MAINTAINER_E2E.md), fixing the unreachable login and duplicate refresh-session rotation. The other listed roadmap items remain separate work.
