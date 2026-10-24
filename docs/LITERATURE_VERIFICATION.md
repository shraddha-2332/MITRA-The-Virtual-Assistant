# Literature verification and claim corrections

Verified 24 October 2026 against primary publication pages and the specifically identified full-text sections. This is a focused audit of the proposed research framing, not a systematic review of every reference in the old draft. Paper-reported results are not Mitra measurements and are not directly comparable across datasets.

## Verified sources

| Source | Verified identity and relevant finding | Implication for Mitra |
| --- | --- | --- |
| [Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401), NeurIPS 2020 | Combines learned generation with retrieved non-parametric knowledge; abstract and metadata checked | Foundational context; Mitra does not implement the original jointly trained RAG model |
| [Robertson and Zaragoza, The Probabilistic Relevance Framework: BM25 and Beyond](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf), 2009, 3(4):333–389, DOI 10.1561/1500000019 | Author-hosted publication PDF confirms citation and probabilistic ranking background | Appropriate retrieval baseline; the local baseline is dependency-free JavaScript BM25, not SQLite FTS5 |
| [Nguyen and Quan, URAG: Implementing a Unified Hybrid RAG for Precise Answers in University Admission Chatbots — A Case Study at HCMUT](https://arxiv.org/html/2501.16276v1), arXiv:2501.16276, 2025 | Authors are Long Nguyen and Tho Quan. Section 3.1 uses FAQ answers before document generation and describes an ungrounded model fallback with a disclaimer | FAQ-first admissions answering is prior art. Mitra's intended stricter refusal and maintained structured-record behavior are design differences, not measured superiority |
| [Nguyen-Duc et al., An Empirical Study of Multi-Agent RAG for Real-World University Admissions Counseling](https://arxiv.org/abs/2507.11272), 2025 | MARAUS is the system name, not the paper title. Author list begins Anh Nguyen-Duc, Chien Vu Manh, Bao Anh Tran, Viet Phuong Ngo, Luan Le Chi, Anh Quang Nguyen. Abstract describes a deployed university-admissions study | Treat as related institutional work; do not transplant its reported outcomes or imply comparable local deployment |
| [Es et al., RAGAs: Automated Evaluation of Retrieval Augmented Generation](https://aclanthology.org/2024.eacl-demo.16/), EACL demonstrations 2024:150–158, DOI 10.18653/v1/2024.eacl-demo.16 | Full-text section 3 decomposes answers into assertions and asks an LLM whether context supports them | The old draft's characterization as a token-presence checker is incorrect. Whether RAGAs misses specific wrong-row errors requires a controlled experiment |
| [Mathur et al., MATSA: Multi-Agent Table Structure Attribution](https://aclanthology.org/2024.emnlp-demo.26/), EMNLP demonstrations 2024:250–258, DOI 10.18653/v1/2024.emnlp-demo.26 | Authors are Puneet Mathur, Alexa Siu, Nedim Lipka, Tong Sun. Abstract describes row/column attribution and the FAST-Tab task | Correct the old draft's title and author initials. Structured table attribution is established work |
| [Bukkapatnam and Mehta, TabFaith: Benchmarking and Improving Structural Faithfulness in LLM Table Summarization](https://aclanthology.org/2026.surgellm-1.21/), SURGeLLM 2026:326–332, DOI 10.18653/v1/2026.surgellm-1.21 | Publication abstract describes structural errors, cell-level alignment, STAF and CAVE | The broad claim that structural faithfulness is unaddressed is untenable. The task differs from an institutional fee lookup; benchmark transfer is not established |
| [Kakwani et al., IndicNLPSuite: Monolingual Corpora, Evaluation Benchmarks and Pre-trained Multilingual Language Models for Indian Languages](https://aclanthology.org/2020.findings-emnlp.445/), Findings EMNLP 2020:4948–4961 | Provides language resources and evaluation benchmarks | Supports regional-language evaluation motivation, not a claim that Mitra uses IndicBERT/IndicGLUE or has validated translation quality |

## Required claim corrections

1. Describe the proposed contribution as a maintained institutional system with selected deterministic checks. Do not call the verifier the first or novel without a broader prior-art analysis.
2. Compare Mitra's own numeric token checker against its slot checker by name. Do not equate that token checker with RAGAs, TruLens or all faithfulness frameworks.
3. Keep external papers' reported results separate from the project's developer regression outcomes. This audit does not reproduce external studies.
4. Replace fictional helpdesk dataset provenance and unexecuted baseline results with the actual available development evidence and a prospective independent evaluation protocol.
5. Separate academic year from year of study/admission route. The current specialized slot check does not establish full query-to-cell semantic entailment.
6. Model and API strings in configuration are implementation settings. No successful live model run is established by mocked regression tests.

## Remaining review boundary

The other historical references, full external experiment details and exhaustive novelty search remain unverified. The linked sources establish the bounded claims above. The new manuscript uses this verified subset and does not reuse the old comparative accuracy tables.
