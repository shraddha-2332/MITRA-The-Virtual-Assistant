# Mitra: An Institutional Information Assistant with Maintained Facts and Controlled Generation

Design-and-implementation working manuscript, 24 October 2026. Author order, affiliations, submission venue and independent evaluation are pending confirmation. This manuscript replaces the experimental framing of the unverified IEEE draft; it contains no invented comparison results.

## Abstract

Institutional admission information depends on programme, academic year, admission route and applicant attributes. A conversational assistant must preserve these distinctions while making maintained information accessible. This paper describes Mitra, a web-based assistant for MITCORER Barshi that combines published institutional knowledge, deterministic rendering of selected structured facts, bounded multilingual query interpretation and optional evidence-conditioned generation. Revision checks, source metadata and reviewed publication govern knowledge maintenance. Critical factual topics use maintained records, while selected generated outputs undergo numeric, promissory-claim and slot checks before acceptance. The implementation uses React, Node.js and SQLite. Local validation comprises 155 backend tests, 500 routing/content regression cases and 36 public diagnostic cases, all passing in the recorded development runs. These outcomes demonstrate specified implementation behavior rather than independently measured answer accuracy. The paper identifies remaining verifier and conversation limitations and defines an independent evaluation protocol for correctness, evidence support, multilingual quality and runtime behavior.

Keywords: institutional question answering; maintained knowledge; structured facts; retrieval; multilingual interfaces; generation verification.

## 1. Introduction

Prospective students and parents seek information about admissions, fees, scholarships, programmes, accommodation and campus facilities. Institutional facts can vary by year and applicant attributes. Returning a figure that appears in a document is insufficient if it belongs to another category, admission route or programme.

Mitra addresses this access problem for MITCORER Barshi through maintained institutional records and a conversational interface. Its design separates selected critical factual rendering from optional language generation. The objective is useful information access with explicit clarification and unsupported-information behavior. Reduced staff workload and improved user task completion are intended benefits, not outcomes measured in this work.

The contribution described here is an implemented system and its engineering validation: structured-record rendering, bounded query scope, controlled maintenance, source traceability and optional generation checks. Neither invention of FAQ-first retrieval nor general semantic verification is claimed. Comparative effectiveness remains a research question.

## 2. Related work

Retrieval-augmented generation connects generated answers with retrieved knowledge [1]. Mitra uses evidence-conditioned generation as one path, but does not reproduce the original trained RAG architecture. BM25 provides a lexical ranking baseline [2]; the repository's comparison implementation is JavaScript BM25.

URAG already places FAQ answers before document-based generation in a university-admissions system [3]. Consequently, this broad arrangement cannot establish Mitra's novelty. MARAUS describes a deployed multi-agent admissions system [4]; Mitra instead uses a single application backend. Results from those institutions cannot substitute for local evaluation.

RAGAs evaluates support through LLM-generated assertions and contextual verification [5]. It is not equivalent to Mitra's numeric token checker. MATSA addresses fine-grained row/column attribution [6], while TabFaith studies structural faithfulness in table summarization [7]. These works motivate careful table-aware evaluation; this manuscript does not assert that they universally fail on wrong-row errors. IndicNLPSuite supplies resources and benchmarks for Indian languages [8], but Mitra does not use its models or claim benchmark results from them.

## 3. Requirements and system design

The public workflow accepts a text question without mandatory sign-in, interprets selected scope, retrieves published institutional knowledge and returns an answer, clarification or unsupported-information response with relevant source links. The interface supports Automatic, English, Marathi and Hindi choices. Compound requests can return separate sections.

The application is a modular monolith. React/Vite supplies the client; Node's HTTP module implements the API. SQLite stores application JSON in a collections table and cached vectors in a separate embeddings table. This design serves a small single-instance prototype and does not establish horizontal scalability.

Maintainers authenticate to protected knowledge and source APIs. Structured facts validate years, numeric values and programme entries. Publication status controls eligibility for public retrieval, and revision checks reject stale edits. Optional source validity and supersession metadata constrain use; absent metadata remains unknown. Website monitoring stages changed source text for review rather than automatically publishing it.

## 4. Answer processing

The backend validates question length and normalizes selected English, Marathi, Hindi and transliterated expressions. A bounded parser identifies topics, branches, admission routes, academic years, categories, gender and service scope. This is domain-specific parsing rather than unrestricted natural-language understanding.

Weighted lexical and rule scoring retrieves records with conceptual synonym boosts. Optional configured Gemini embeddings can contribute vector similarity to English retrieval; provider availability and its effect on quality remain unmeasured here. Retrieved matches alone do not establish answerability.

Canonical records control academic fees, accommodation charges and current programme intake. Maintained rendering preserves structured amounts and scopes; missing or retired critical records do not justify regenerating their figures. Questions recognized as critical factual topics bypass the advisory generation path. Unknown wording can still challenge topic recognition.

Optional English generation receives bounded retrieved evidence. Generated outputs are checked for selected unsupported numeric fields and prohibited promises. A specialized verifier compares some fee, accommodation and programme values against supplied slots. However, including both expected and incorrect figures can pass, missing slots can bypass specialized checks, and token support does not prove sentence-level entailment. These are implementation limits, not minor exceptions to a correctness guarantee.

Reviewed translations are bound to source content; missing or stale reviewed prose falls back explicitly. Public conversation exchanges are persisted and selected profile/topic fields support heuristic follow-ups. Fee follow-ups enrich original wording so explicit route and year qualifiers are retained. The browser's reset or refresh loses its active conversation reference without deleting prior server records.

## 5. Local validation

The following results were recorded on 24 October 2026 and are development evidence:

| Check | Result | What it establishes |
| --- | --- | --- |
| Backend test suite | 155/155 passed | Defined API, persistence, routing, maintenance and verification regressions |
| Legacy evaluator | 500/500 passed | Developer-authored category/action/content expectations, generation disabled |
| Strict public diagnostics | 36/36 passed | Specified supported, unsupported, multilingual and scope contracts |
| Backend syntax and Git whitespace checks | Passed | Parsing and change formatting |

The 500 cases comprise 360 maintained routing cases and 140 workflow combinations. They are not an independently collected helpdesk dataset or final held-out benchmark. The 24 exposed paraphrase diagnostics likewise cannot become an untouched final set. Backend tests use isolated test data; generation regressions mock upstream responses rather than measuring live model factuality.

The regression increment covers successful advisory and non-advisory generation, rejection/failure fallback, edited DSE fees across follow-ups, record retirement, critical-query routing and conversation limits. These checks do not establish a general wrong-row detection percentage. No live model baseline, cost comparison or cross-language accuracy table is reported.

## 6. Independent evaluation protocol

A separate authoring and adjudication process should collect fresh questions against a frozen, explicitly identified corpus. The final set must remain separate from development tuning. Reviewers should label answerability, required facts, accepted evidence, scope and clarification requirements, with disagreements preserved and resolved. Regional-language cases require competent-speaker judgments.

Compare selected retrieval and answer pipelines under the same corpus and conditions. Report retrieval metrics separately from answer correctness, exact target-cell accuracy, unsupported claims, false refusals and clarification quality. A verifier study must include both incorrect and legitimate comparative statements, including mixed correct-and-wrong figures. Report error-detection recall and false alarms with explicit denominators. Record end-to-end latency, model calls, token usage and actual cost only when measured.

The [independent evaluation packet](INDEPENDENT_EVALUATION_PACKET.md) defines the collection procedure. It currently contains a blank schema rather than completed reviewer data.

## 7. Limitations and threats to validity

Development questions favor maintained rules and cannot establish generalization. Source publication does not independently certify factual truth. Topic interpretation, conversation context and selected generation checks remain bounded. Public conversation continuation needs stronger session isolation and a reviewed retention policy. Unrelated retained applicant workflows and independent facts remain technical debt.

Live provider behavior, complete prompt-injection resistance, production deployment, load, backup recovery and general translation quality are unverified. The historical retrieval comparison used an earlier development snapshot and must not be presented as current independent superiority. Literature verification is focused rather than exhaustive, and novelty remains unestablished.

## 8. Conclusion

Mitra implements maintained knowledge access with structured factual rendering, bounded multilingual interpretation, source maintenance and optional checked generation. Passing local regressions supports those specified behaviors. An independent corpus-bound evaluation is required before drawing comparative conclusions about accuracy, wrong-row rejection, language quality or operational benefits.

## References

1. P. Lewis et al., “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,” NeurIPS, 2020. [Primary source](https://arxiv.org/abs/2005.11401).
2. S. Robertson and H. Zaragoza, “The Probabilistic Relevance Framework: BM25 and Beyond,” Foundations and Trends in Information Retrieval, 3(4), 333–389, 2009. [Publication PDF](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf).
3. L. Nguyen and T. Quan, “URAG: Implementing a Unified Hybrid RAG for Precise Answers in University Admission Chatbots — A Case Study at HCMUT,” arXiv:2501.16276, 2025. [Primary source](https://arxiv.org/abs/2501.16276).
4. A. Nguyen-Duc et al., “An Empirical Study of Multi-Agent RAG for Real-World University Admissions Counseling,” arXiv:2507.11272, 2025. [Primary source](https://arxiv.org/abs/2507.11272).
5. S. Es, J. James, L. Espinosa Anke, and S. Schockaert, “RAGAs: Automated Evaluation of Retrieval Augmented Generation,” EACL System Demonstrations, 150–158, 2024. [Primary source](https://aclanthology.org/2024.eacl-demo.16/).
6. P. Mathur, A. Siu, N. Lipka, and T. Sun, “MATSA: Multi-Agent Table Structure Attribution,” EMNLP System Demonstrations, 250–258, 2024. [Primary source](https://aclanthology.org/2024.emnlp-demo.26/).
7. K. S. Bukkapatnam and S. Mehta, “TabFaith: Benchmarking and Improving Structural Faithfulness in LLM Table Summarization,” SURGeLLM, 326–332, 2026. [Primary source](https://aclanthology.org/2026.surgellm-1.21/).
8. D. Kakwani et al., “IndicNLPSuite: Monolingual Corpora, Evaluation Benchmarks and Pre-trained Multilingual Language Models for Indian Languages,” Findings of EMNLP, 4948–4961, 2020. [Primary source](https://aclanthology.org/2020.findings-emnlp.445/).
