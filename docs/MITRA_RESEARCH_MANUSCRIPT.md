# MITRA: Evidence-Aware Multilingual Conversational AI for Institutional Information Assistance

**Shraddha Sunil Ukirade¹**, **Anzalna Ayaz Tamboli²**, **Sayali Santosh Kakade³**, **Dnyaneshwari Satyavan Vyavahare⁴**, **Prof. Shobhana Raichurkar⁵**  
¹˒²˒³˒⁴Department of Computer Science & Engineering, MIT College of Railway Engineering & Research, Barshi, Maharashtra, India  
⁵Assistant Professor, Department of Computer Science & Engineering, MIT College of Railway Engineering & Research, Barshi, Maharashtra, India  
*Affiliated to Punyashlok Ahilyadevi Holkar Solapur University (PAHSU), Solapur, Maharashtra, India*

---

### Abstract
Admissions answers must preserve the academic year, entry route and applicant category attached to each fact, and a misattributed fee can affect a family's financial decisions. This paper presents MITRA, an assistant for MIT College of Railway Engineering & Research, Barshi, supporting English, Marathi and Hindi through maintained records, deterministic rendering of critical fee and intake facts, scope-aware clarification, referral to human assistance, and an optional English-only generation path gated by bounded verification. We report a 90-case benchmark (30 per language; 60 answerable, 21 unanswerable, nine ambiguous) authored by the development team and scored by an automated string-matching harness with generation disabled. It is a developer-run baseline, not an independent assessment. Correctness was 60.0% overall (English 85.0%, Marathi 50.0%, Hindi 45.0%; English vs. pooled Devanagari, Fisher's exact $p \approx 0.006$, post hoc). The false-refusal rate was 23.3%, all in Marathi and Hindi. The false-answer rate on unanswerable questions was 28.6%, and abstention was weakest in English (57.1%). No incorrect fee value was observed in 15 fee cases on the deterministic path (95% CI lower bound ≈ 80%). The Devanagari refusals arise from missing facility-term mappings in query normalization, not missing records. Independent labelling, native-speaker review and a rendering-versus-generation ablation remain future work.

**Index Terms**— University admissions, institutional question answering, multilingual assistance, structured knowledge, factual verification, retrieval evaluation.

---

## I. INTRODUCTION

Applicants and parents must locate information scattered across fee circulars, programme lists, institutional pages and administrative notices. A short question may omit details that change the correct answer: the same category label can carry different charges for first-year and direct second-year entry, and hostel, deposit and mess figures can mislead when attached to the wrong labels. Source relevance and numerical overlap are therefore necessary but not sufficient for a correctly scoped response. General-purpose language models add a further risk, since they can produce fluent statements that no source supports, and a transposed fee or wrong year can affect a family’s financial decisions.

MITRA serves MIT College of Railway Engineering & Research, Barshi. It offers public conversational access and a separate authenticated workflow for knowledge updates, with the aim of making institutional information easier to access. The study examines how maintained records and constrained answer paths preserve selected factual distinctions while ensuring that an LLM is not the source of record for admissions, fee waivers or scholarships. Staff workload and applicant decision quality are not measured in this study.

The contribution is an engineering case study with three components: a maintained knowledge lifecycle, a multilingual scope-sensitive answer workflow, and source-bound development diagnostics for retrieval and selected attribution failures, complemented by a 90-case multilingual benchmark scored by an automated six-dimension harness. Institutional facts were transcribed from approved or signed circulars and internally reviewed by the Authority—defined here as the institutional review panel comprising the Principal and Department of Computer Science & Engineering leadership at MITCORER. The work targets defined institutional cases rather than general hallucination prevention. Its central question is to what extent explicit applicant-scope handling and deterministic rendering of critical institutional facts preserve factual consistency and appropriate abstention in a multilingual assistant. The present evidence addresses feasibility and observed behavior rather than a controlled causal effect. Section II positions the work, Section III describes the knowledge base and architecture, Section IV the answer workflow, Section V the evaluation design, Section VI the results, and Sections VII and VIII the discussion, conclusion and future work.

---

## II. RELATED WORK AND RESEARCH POSITION

Retrieval-augmented generation (RAG) combines retrieved knowledge with language generation [1]. MITRA applies evidence-conditioned generation as an optional path rather than the jointly trained architecture of that work. BM25 provides an established lexical ranking framework [2]; the comparison here therefore includes raw and normalized BM25 as a lexical experiment, separate from a full RAG benchmark.

Closely related admissions systems exist. URAG places FAQ answering before document-based generation [3], and an IEEE study combines intent filtering with admissions RAG [4]. Because fact retrieval, topic routing and document maintenance are established practices, MITRA’s contribution lies in documenting how selected fee attributes, record availability, follow-up scope and unsupported questions are handled in one maintained implementation.

MARAUS reports a multi-agent admissions application [5], whereas MITRA uses a single backend; this difference is architectural and implies no difference in accuracy. Academic RAG with conversation history is also established [6]. IndicNLPSuite provides Indian-language resources and benchmarks [7]; MITRA uses its own rules and source-bound translations, so those benchmark scores do not transfer, and quality across its three interface languages requires separate evaluation.

RAGAs evaluates generated assertions against context [8], which differs from a numeric token-presence check. MATSA addresses fine-grained table structure attribution [9], and TabFaith studies structural faithfulness in table summarization [10]. MITRA’s mutation probes serve as a small application-specific diagnostic in this area.

Broader background frames the design. Unsupported generation is documented across natural language generation tasks [11], which is why critical values are kept on a deterministic path. BEIR reports BM25 as a robust zero-shot baseline [12], which motivates the lexical comparison in Section V. TyDi QA and XOR QA show the difficulty of cross-lingual and low-resource question answering [13], [14]. Provenance research distinguishes why- and where-provenance [15], supporting the retention of source and academic-year metadata with each record. These sources provide context rather than measured baselines.

Table I relates prior work to the present implementation. No external system was rerun on MITRA’s corpus, so the table implies no performance ranking.

### TABLE I: LITERATURE REVIEW AND THE BOUNDED POSITION OF THIS STUDY

| Ref. / Year | Methodology | Key finding | Limitation relative to this study |
| :--- | :--- | :--- | :--- |
| **[1] 2020** | Retrieval-augmented generation | Retrieved knowledge conditions language generation | Jointly trained architecture; MITRA uses optional evidence-conditioned generation |
| **[2] 2009** | BM25 probabilistic relevance framework | Established lexical ranking baseline | Lexical ranking only; MITRA adds applicant-scope handling |
| **[3] 2025** | Hybrid RAG for university admissions | FAQ answering placed before document-based generation | Different institution and dataset; not rerun on MITRA’s corpus |
| **[4] 2024** | Intent-filtered admissions RAG | Intent filtering combined with admissions RAG | Different institution and protocol; not rerun here |
| **[5] 2025** | Multi-agent admissions application | Multi-agent RAG applied to admissions counseling | Single-backend MITRA not compared; no ranking inferred |
| **[6] 2024** | RAG with conversation history | Academic RAG that carries conversation history | Architectural comparison only; accuracy not compared |
| **[7] 2020** | Indian-language resources and benchmarks | Corpora and benchmarks for Indian languages | MITRA uses its own rules and source-bound translations |
| **[8] 2024** | Assertion-level RAG evaluation | Generated assertions checked against context | Assertion-level evaluation; differs from MITRA’s numeric and slot checks |
| **[9] 2024** | Table structure attribution | Fine-grained attribution of table structure | Table-attribution task, separate from MITRA’s probes |
| **[10] 2026** | Table-summarization faithfulness | Structural faithfulness in table summaries | Table-summarization task, separate from MITRA’s probes |
| **[11] 2023** | Survey of hallucination in NLG | Taxonomy of intrinsic and extrinsic unsupported content | Survey; no institutional mitigation |
| **[12] 2021** | BEIR zero-shot retrieval benchmark | BM25 is robust across heterogeneous domains | Corpora differ from a small institutional corpus |
| **[13], [14] 2020–21** | TyDi QA; XOR QA | Cross-lingual and low-resource QA is difficult | General benchmarks; no admissions data |
| **[15] 2001** | Why- and where-provenance | Formal characterization of data provenance | Database theory; not a chatbot design |
| **[16] 2024** | RAG admissions chatbot (GPT-3.5 with LlamaIndex) | Applied to admission data from three universities; feedback from 53 high-school students | Different institutions and protocol; not rerun on MITRA’s corpus |

MITRA’s research position is deliberately focused: it shows how these concerns interact in a working institutional prototype and makes selected failures reproducible. Admissions studies that evaluate with real users, such as MARAUS [5], which processed over 6,000 user interactions, and Chen et al. [16], who collected feedback from 53 high-school students, rest on broader user evidence than MITRA’s developer-run 90-case benchmark, and MITRA claims no accuracy advantage over them. A comparative study should next isolate the effect of structured rendering and scope checks using independently authored questions on the same frozen corpus.

---

## III. INSTITUTIONAL KNOWLEDGE AND SYSTEM ARCHITECTURE

### 3.1 Knowledge Representation and Maintenance
The development corpus contains 51 published seed records covering institutional topics. Records may include structured facts, source links, publication status, revision information and validity metadata. The seeded corpus is separate from the maintained live database, and each experiment identifies the snapshot it uses. Structured academic-fee records distinguish entry route and applicant attributes, and accommodation records distinguish hostel, refundable deposit and annual mess amounts. Programme records supply maintained intake values in place of a model-generated programme list.

Source material (PDF, scanned documents, TXT and CSV) is processed with Poppler text extraction and English Tesseract OCR, structured into records with source metadata, academic year and content hashes, reviewed by a maintainer and then published. Because the OCR configuration is English-only, scanned Marathi or Hindi (Devanagari) documents enter the knowledge base through an alternative route.

Knowledge changes pass through authenticated maintenance endpoints. Validation checks record structure and selected numeric and year fields, and revision checks reject stale edits so that two maintainers cannot silently overwrite each other. A record moves from draft to review to published and may later be archived or retired; only published records are eligible for public retrieval (Fig. 1). Retired or conflicting canonical records do not revive an older hardcoded figure. Website monitoring stages detected numerical, academic-year and content changes for maintainer review before any publication. Missing source metadata is recorded as unknown rather than as verified provenance. Content hashes verify file integrity, source metadata identifies origin, and institutional review records approval; none of these alone establishes that the underlying information is correct or current.

Institutional facts were transcribed from approved or signed circulars and internally reviewed by the Authority, as reported by the project team. Three archived fee-table crops were inspected against the maintained amounts; because the crops omit signature blocks, institutional approval is attributed to the team. Source-image hashes preserve the inspected files.

### 3.2 Application Boundaries
React provides the browser interface, Node.js implements the HTTP API, and SQLite stores application collections and cached vectors (Table II). A modular monolith keeps public answering, authentication, knowledge maintenance, retrieval and evidence checks in separate modules, and the public and administration APIs are separate entry points that share one SQLite store. This design suits a small single-instance prototype. Optional embedding and generation requests, served by the Google Gemini API [17], are external integrations; deterministic rendering of maintained critical facts does not depend on them.

### TABLE II: IMPLEMENTED TECHNOLOGY STACK
| Component | Technology |
| :--- | :--- |
| Frontend | React 19, JavaScript/JSX, CSS; Vite 8 build; Lucide React icons |
| Backend | Node.js built-in HTTP module |
| Database | SQLite via node:sqlite (collections and cached vectors) |
| Retrieval | Weighted keyword/rule retrieval with conceptual synonym scoring; optional Gemini embeddings |
| Query interpretation | Dependency-free bounded rule-based parser |
| Optional generation | Google Gemini API |
| Source processing | Poppler PDF extraction, English Tesseract OCR, TXT/CSV |
| Testing | Node.js test runner; Playwright Core (Chrome/Edge) |
| Deployment files | Docker Compose and Nginx (not production-verified) |

The browser sends a question and conversation reference through the public API (Fig. 2). The backend validates the input, resolves selected context and determines the answer path. An authenticated maintainer updates the knowledge store through a separate boundary. Public retrieval excludes unavailable records, and source links allow inspection of the underlying record. The final response is an answer, a clarification, an unavailable-information response or a referral to human assistance.

### 3.3 Conversation Ownership
Public history is bound to a random HttpOnly session cookie with bounded exchanges and a 30-minute idle expiry. Reset deletes the active server history, startup and periodic pruning remove expired histories, and cross-session continuation is rejected. Admission approval is not inferred from conversational history. An institution-approved retention policy and production monitoring remain operational requirements.

---

## IV. SCOPE PRESERVATION AND ANSWER VERIFICATION

### 4.1 Query Interpretation and Retrieval
The backend normalizes selected English, Marathi, Hindi and transliterated expressions. A bounded parser extracts topics, programmes, entry route, academic year, category, gender and requested service; these are application-specific interpretations rather than unrestricted semantic understanding. Academic year and year of entry are kept separate, so “second year” is not converted automatically into a fee-circular year. Negated or conflicting profile values receive explicit handling instead of accumulating into an increasingly certain applicant profile.

The application retriever combines weighted lexical/rule scores with conceptual synonym boosts. Optional configured embeddings can contribute semantic similarity for English retrieval; their impact is outside the reported lexical comparison. Records carry publication and availability constraints. A high retrieval score does not by itself establish answerability: the selected record must also contain a supported value for the requested scope.

### 4.2 Structured Answer Selection
Let $s$ denote the interpreted scope (topic, route, academic year, category, gender and service) and $K$ the eligible published corpus. The answer path first checks whether the required scope fields and canonical facts are available. For selected critical topics, the response is rendered from those facts. Deterministic rendering suits these values because a single transposed digit or wrong year can mislead a family, canonical records can be audited and corrected in one place, and identical questions yield identical answers. When essential information is missing, the system asks for clarification or reports insufficient evidence instead of requesting a replacement amount from the model.

Follow-up handling preserves explicit user wording while carrying selected prior scope: a question about direct second-year charges replaces a preceding first-year route, and a new hostel question remains free of unrelated fee-topic text. These behaviors are tested; other dialogues and mixed-language expressions are left for further examination.

### 4.3 Optional Generation and Bounded Verification
Optional advisory generation receives bounded evidence. In the implementation, generation and embedding retrieval run only for English queries. Marathi and Hindi answers come from deterministic rendering and source-bound translations, which are bound to content hashes: when the underlying content changes, the translation becomes stale and the system falls back to English with an explicit notice. The client uses a finite overall deadline, transient-error retries and an optional configured fallback model. A returned draft is treated as untrusted until verified. Numeric checks reject selected unsupported values, promise checks reject unsupported guarantees of admission, placement or scholarship, and citation checks constrain supplied references. Specialized slot and clause checks compare selected fee, service and programme claims with structured evidence and reject certain unresolved or contradictory bindings.

Consider a document containing both a hostel amount $H$ and a mess amount $M$. A token checker can accept “hostel costs $M$; mess costs $H$” because both values appear in the source. MITRA’s bounded English clause checks associate each amount with its local service label, which closes the exposed swap probes. Full semantic entailment, including unfamiliar grammar, implicit comparison, coreference and novel cross-language generated prose, is outside the demonstrated coverage.

The decision order is: validate input, interpret scope, retrieve eligible evidence, clarify unresolved critical scope, render canonical facts when applicable, otherwise attempt bounded advisory generation, verify any draft, and fall back to supported content or an unavailable-information response. This sequence describes the implementation.

### 4.4 Safety Behavior, Human Escalation and Interface
Table III maps each situation to the designed response. When the published records lack the requested information, the assistant states no value and refers the user to human assistance through an admissions-counsellor contact card with a call-back request option (Fig. 6). In this paper, “human escalation” means referral for human assistance; transfer to a staffed helpdesk, call-back fulfilment, and storage and retention of submitted contact details were not evaluated.

### TABLE III: DESIGNED RESPONSE BY SITUATION
| Situation | Designed response |
| :--- | :--- |
| Ambiguous or underspecified request | Clarifying question, or rows for every category when only the category is missing |
| Unsupported or out-of-scope question | Safe refusal with official source link where relevant |
| Missing, unavailable or retired factual record | No value stated; referral to human assistance and official source |
| Numeric value not in evidence | Draft rejected by numeric check |
| Guarantee of admission, placement or scholarship | Draft rejected by promise check |
| Translation stale or missing | Explicit English fallback |
| Generation provider unavailable | Deterministic or safe fallback response |

The interface is a floating chat widget available without sign-in. Users select Automatic, English, Marathi or Hindi (Fig. 3), and answers appear as cards, tables, lists and official source links. Fig. 4 shows a compound query answered in one response: a hostel fee card for academic year 2026–27 with a confirmation note, followed by a library answer stating that borrowing rules, timings and access eligibility are not published. The mess amount is not displayed in this capture. Fig. 5 shows the transliterated query “first year fees kiti ahe” answered in Marathi; the response lists the first-year fee for every admission category and notes that the amounts are annual and that term-wise schedules are not given in the record. Fig. 6 shows the referral response for a question the records do not cover. Figs. 3–6 are author-selected captures that illustrate behavior.

---

## V. EVALUATION DESIGN AND REPRODUCIBILITY

### 5.1 Evidence Layers
Evaluation separates implementation regressions, retrieval diagnostics, verifier mutations and an automated 90-case multilingual benchmark, and reports each layer separately because each answers a different question. Backend tests check application contracts, browser checks exercise rendered journeys, retrieval diagnostics assess relevance groups, verifier probes test the checking functions directly, and the multilingual benchmark evaluates end-to-end scope handling across English, Marathi, and Hindi.

Source-bound reports store corpus and case hashes, runtime metadata and implementation hashes, since an uncommitted working tree can differ from repository HEAD. Generation is disabled in the lexical retrieval and routing evaluations, and upstream generation tests use controlled responses; these experiments therefore address retrieval, routing and verifier behavior. Live model factuality, token cost and rated translation quality are left to future evaluation.

### 5.2 Retrieval Setup and Metric Definitions
The retrieval comparison uses the same 51-record seeded corpus and 44 development questions for four methods: the application keyword/rule retriever, raw BM25, normalized BM25, and reciprocal-rank fusion of lexical outputs. Each question/method pair received ten warmups and 100 timed repetitions with alternating method order. Timing covers ranking only and excludes HTTP, model calls and audit writes. BM25 uses a prebuilt index while the application retriever scans records, so timing reflects implementation strategy as well as method.

Each question has one or more developer-authored relevance groups representing acceptable records for a required facet. For question $q$ with group set $G_q$ and top-$k$ output $R_k(q)$, group Recall@k is the fraction of groups containing at least one returned record:
$$\text{Recall@}k(q) = \frac{|\{ g \in G_q : g \cap R_k(q) \neq \emptyset \}|}{|G_q|}$$

Group MRR@3 averages reciprocal first-hit ranks over those groups [18], assigning zero when the first match falls outside the top three. Reciprocal-rank fusion follows Cormack et al. [19]. Reported values are macro-averaged over questions. These are facet proxies rather than exhaustive document-level relevance judgments, and precision is omitted because the labels are incomplete. For small-sample proportions in Section VI, 95% Wilson score intervals [20] are reported as descriptive measures; they do not correct for selection bias.

### 5.3 Verifier Experiment
Fifteen exposed English probes comprise 11 deliberately invalid answers and four valid controls. Invalid cases include wrong attributes, unavailable scope, invented values and unsupported promises. The positive class is an answer that must be rejected. Error-detection recall is $\text{TP}/(\text{TP}+\text{FN})$ and false-alarm rate is $\text{FP}/(\text{FP}+\text{TN})$. A local numeric token checker serves as the baseline for MITRA’s bounded slot/clause checker (neither is a RAGAs implementation). Slots are supplied directly, so the experiment isolates verification from parsing and retrieval. Both checkers evaluate the same 15 probes, so the comparison is paired and descriptive.

### 5.4 Multilingual Benchmark Design and Governance Rubric
A fixed test battery of 90 cases (30 English, 30 Marathi, 30 Hindi) was executed through an automated evaluation harness that passes each query to the application answer function and evaluates the structured response with deterministic rules. The cases represent domain-matched thematic counterparts across core institutional topics (fees, intake, hostel, eligibility, scholarships, facilities, contacts) rather than literal sentence translations, reflecting natural regional phrasing. Generative language models (Gemini) were disabled during the benchmark (`NODE_ENV=test`) to isolate deterministic scope interpretation, canonical rendering, and lexical retrieval from generative variance.

Each language contains 20 answerable, seven unanswerable, and three ambiguous cases (60, 21, and nine overall). The harness scores six governance dimensions:
- **Factual Correctness (FC)**: Presence of all required figures, attributes, and academic years in the response text (correct: 1.0), partial match (0.5), or none (0.0).
- **Source Attachment (SA)**: Response includes a verifiable official circular reference or record identifier.
- **Completeness (CP)**: Full constraint coverage without omitting conditional requirements.
- **Appropriate Abstention (AA)**: For unanswerable queries, emitting an insufficient-evidence response with appropriate referral; for ambiguous queries, issuing a clarification prompt. An unjustified refusal of an answerable case counts as a false refusal.
- **Referral Routing Accuracy (RR)**: Correct destination attribution (Administrative Office & Principal Desk for employment/governance vs. Admissions Helpdesk for prospective students).
- **Language Fidelity (LF)**: Heuristic on a 1–5 scale reflecting Devanagari character proportion and numeral preservation (fixed at 5.0 for English).

Evaluation was executed across two milestones: Run 1 on the initial build (commit `809455b`), and Run 2 on the updated build (commit `3216bb3`), which incorporates the staff-recruitment routing correction described in Section 4.4. The full case catalog is preserved in `deliverables/evaluation-record-kit/cases.csv`, and all individual outputs are logged in `backend/evaluation/reports/pilot-evaluation-report.json`.

### 5.5 Planned Independent Evaluation
The 90-case benchmark provides a developer-run baseline; an independently authored and labeled held-out question set remains the planned next stage. Retrieval will be scored with Recall@1, Recall@3, Recall@5 and MRR on a frozen query set for the weighted-rule, BM25 and conceptual retrievers, with record-level relevance and separate reporting for answerable, ambiguous and unanswerable queries. A rubric will score correctness, completeness, evidence support, clarification/refusal appropriateness and language fidelity, rated by at least two independent raters who are blind to retriever identity, with adjudication and reported inter-rater agreement. Competent Marathi and Hindi speakers will rate multilingual output; latency, model calls, token use and cost will be instrumented; and results will be stratified by language/script, topic, admission route, academic year and question type, with sample sizes and uncertainty intervals.

---

## VI. RESULTS

### 6.1 Retrieval Diagnostics

### TABLE IV: DEVELOPMENT RETRIEVAL RESULTS ON 44 QUESTIONS AND 51 SEEDED RECORDS
| Method | Group R@1 / R@3 / MRR@3 | Ranking p50 / p95 (ms) |
| :--- | :---: | :---: |
| **Keyword/rules and concepts** | **0.8977 / 1.0000 / 0.9470** | **1.0246 / 1.4368** |
| BM25 raw | 0.6591 / 0.7727 / 0.7121 | 0.0312 / 0.0528 |
| BM25 normalized | 0.7955 / 0.9659 / 0.8769 | 0.0507 / 0.0826 |
| Reciprocal-rank fusion | 0.8750 / 0.9886 / 0.9280 | 1.1002 / 1.5640 |

Table IV shows a consistent ordering on these 44 questions. Normalization raises the group Recall@3 of BM25 from 0.7727 to 0.9659 and its MRR@3 from 0.7121 to 0.8769. The application retriever adds a further 0.0341 in group Recall@3 over normalized BM25 (1.0000 versus 0.9659) and improves group Recall@1 from 0.7955 to 0.8977, while reciprocal-rank fusion (0.9886) remains slightly below it in this snapshot. All four methods rank within 1.6 ms at p95, so ranking latency does not separate them in practice; the higher p50 of the application retriever (1.0246 ms) reflects its record scan, whereas BM25 uses a prebuilt index. Because the application rules and questions share development provenance, which can favor the existing pipeline, Table IV is read as a development diagnostic; it supports no significance test, superiority claim or production-latency interpretation. A group Recall@3 of 1.000 means that every labeled facet group receives a top-three hit on this set; it does not certify that each returned answer is correct.

### 6.2 Verifier Characterization

### TABLE V: DIRECT-FUNCTION DECISIONS ON 15 EXPOSED MUTATION AND CONTROL PROBES
| Checker | Invalid rejected / missed ($n = 11$) | Valid rejected / accepted ($n = 4$) | Error-detection recall |
| :--- | :---: | :---: | :---: |
| **Local numeric token checker** | 2 / 9 | 0 / 4 | 18.18% |
| **Bounded slot/clause checker** | **11 / 0** | **0 / 4** | **100%** |

Both observed false-alarm rates are 0/4, and the small denominators accompany every percentage. Earlier bounded fixes rejected 9 of the 11 invalid probes, and clause attribution closes the two exposed mixed-value swaps. Because both checkers were run on the same 15 probes and these probes informed debugging, the 2/11 versus 11/11 outcome is reported as a descriptive difference on exposed regression cases; it supports no inferential claim of superiority, and the final 11/11 result demonstrates regression closure rather than held-out detection accuracy. For reference, the 95% Wilson intervals are 74.1–100% for 11/11, 5.1–47.7% for 2/11 and 0–49.0% for 0/4 false alarms. Four valid controls are too few to estimate a general false-refusal rate.

### 6.3 Implementation and Operational Checks

### TABLE VI: DEVELOPER-AUTHORED REGRESSION CHECKS (ALL PASSED)
| Check | Result |
| :--- | :---: |
| Backend tests | 174 passed |
| Frontend tests | 16 passed |
| Routing/content cases | 500 passed |
| Strict public diagnostics | 36 passed |
| Paraphrase contract cases | 24 passed |
| Browser answer audit | 468 journeys passed (78 questions × 3 languages × 2 corpus snapshots) |

These developer-controlled checks are overlapping regression evidence: the 1,218 passed items are not 1,218 independent user questions and are not combined into an accuracy estimate. Frontend lint and production build also pass. A local model-disabled HTTP smoke test completes 100 requests at concurrency five (p50 26.76 ms, p95 36.62 ms) on in-memory SQLite with raised test limits, excluding network and provider overhead. A maintained-data backup with 1,146 asset files passes checksum verification and isolated restore.

### 6.4 Multilingual Benchmark Outcomes ($N = 90$)

### TABLE VII: MULTILINGUAL 90-CASE BENCHMARK BY LANGUAGE (AUTOMATED HARNESS ON 20 ANSWERABLE, 7 UNANSWERABLE, AND 3 AMBIGUOUS CASES PER LANGUAGE, N = 90)
| Metric | English ($n = 30$) | Marathi ($n = 30$) | Hindi ($n = 30$) | Overall ($N = 90$) |
| :--- | :---: | :---: | :---: | :---: |
| **Answer correctness** | **85.0%** (17/20) | **50.0%** (10/20) | **45.0%** (9/20) | **60.0%** (36/60) |
| **Source attachment** | **100.0%** (20/20) | **70.0%** (14/20) | **60.0%** (12/20) | **76.7%** (46/60) |
| **Appropriate abstention** | **57.1%** (4/7) | **71.4%** (5/7) | **85.7%** (6/7) | **71.4%** (15/21) |
| **Clarification accuracy** | **33.3%** (1/3) | **100.0%** (3/3) | **100.0%** (3/3) | **77.8%** (7/9) |
| **False-answer rate** | 42.9% (3/7) | 28.6% (2/7) | 14.3% (1/7) | 28.6% (6/21) |
| **False-refusal rate** | 0.0% (0/20) | 30.0% (6/20) | 40.0% (8/20) | 23.3% (14/60) |
| **Referral routing (Run 2 [Run 1])** | **100.0%** (4/4) | **100.0%** (5/5) [80%] | **100.0%** (6/6) [83%] | **100.0%** (15/15) [86.7%] |
| **Language fidelity (mean/5)** | **5.00** | **4.70** | **4.80** | **4.83** |

Overall, 36 of 60 answerable cases (60.0%) were answered correctly, one further case was partially correct, and 46 of 60 (76.7%) carried an official source reference. Of 21 unanswerable cases, 15 (71.4%) were met with appropriate abstention and referral, while six (28.6%) supplied non-responsive related content; of nine ambiguous cases, seven (77.8%) triggered clarification. 

Statistical analysis reveals that the performance disparity between English (85.0%) and the Indic languages (50.0% Marathi, 45.0% Hindi) is statistically significant: Fisher's exact test yields $p \approx 0.04$ for English versus Marathi, $p \approx 0.02$ for English versus Hindi, and $p \approx 0.006$ for English versus pooled Devanagari. The false-refusal rate discrepancy (0.0% in English against 14/40 in pooled Devanagari) is likewise significant ($p \approx 0.002$). All significance tests are post hoc and uncorrected for multiple comparisons, describing differences within this case set.

### 6.5 Domain Analysis and Error Audit

**Domain pattern.** All 15 fee cases (five per language), all three hostel cases and all three placement cases were answered correctly. Together these are 21 of the 36 correct answers. The remaining failures fall in facility, transport, scholarship, contact and programme-detail questions.

**Devanagari false refusals (14).** The English counterparts of the refused Marathi and Hindi questions were answered correctly in all eight corresponding institutional topics (P30-EN-05, E90-EN-13, -14, -15, -18, -19, -20, -23), confirming that the underlying records exist in the knowledge base. Tracing `retrieveKnowledge` across all 14 refusals showed that 13 returned no hits (`hits: []`), which triggered safe refusal. The Devanagari query normalizer has mappings for fee, intake and hostel vocabulary but none for facility terms such as sports, ground, cricket, affiliation and distance. The refusals therefore reflect a retrieval and synonym-coverage gap in Devanagari, not absent records and not numeral matching. The refusal occurs at retrieval, before the translation-fallback stage described in Section 4.3.

**Answered-but-not-correct cases (10).** Table IX classifies the ten answerable cases that were answered but not scored correct (English 3, Marathi 4, Hindi 3). The classification is the authors' own audit.

### TABLE IX: AUDIT OF TEN ANSWERED-BUT-NOT-CORRECT CASES
| Category | Cases | Description |
| :--- | :--- | :--- |
| **Accurate but incomplete** | P30-EN-06, E90-EN-19, E90-MR-22, E90-HI-23 | Correct process or programme content, but a required detail (45% HSC threshold, trade names, explicit "no diploma") was not stated |
| **Required fact absent from college records** | E90-EN-17, E90-MR-17, E90-HI-18 | AICTE Pragati scholarship amount (₹50,000) is not in institutional notices; Marathi and Hindi gave portal guidance, English returned unrelated fee-concession content (retrieval topic drift) |
| **Operational information unpublished** | E90-MR-16, E90-HI-17 | System correctly reported that the bus route list is not published |
| **Translation fallback** | E90-MR-20 | English fallback notice without the contact numbers inline |

No fabricated figures were found in this audit. Two cautions apply. E90-EN-17 returned unrelated content to a scholarship-amount question, which is a genuine retrieval error. Five cases (the scholarship and transport groups) ask for facts absent from the knowledge base, so their "answerable" labels are questionable and should be corrected or the facts added.

**Referral routing.** In Run 1 (`809455b`), referrals reached the intended desk in 13 of 15 cases (86.7%). Both misroutes were Marathi and Hindi staff-recruitment queries phrased as applying for a post (E90-MR-24, E90-HI-25). In Run 2 (`3216bb3`), the employment pattern was extended, and all 15 referrals were routed correctly. Run 2 changed only referral routing; all other metrics were identical to Run 1. Because the fix followed failures seen on this benchmark, the result is regression closure, not held-out accuracy.

### 6.6 Summary of Evidence Layers

### TABLE VIII: SUMMARY OF EVIDENCE LAYERS AND WHAT EACH SUPPORTS
| Evidence layer | Result and what it supports |
| :--- | :--- |
| **Retrieval diagnostic (44 questions, 51 records)** | Group Recall@3 of 1.0000 and MRR@3 of 0.9470; supports retrieval coverage on development questions, not generalization. |
| **Verifier probes (15 probes)** | 11/11 invalid probes rejected and 4/4 valid controls accepted, against 2/11 rejected by the token checker; supports regression closure of exposed swap cases. |
| **Regression checks (1,218 overlapping items)** | All passed (174 backend tests, 16 frontend tests, 468 browser journeys); supports implementation stability. |
| **Multilingual benchmark (90 cases, automated harness)** | 60.0% correctness, 76.7% source attachment, 71.4% safe abstention, 100% fee accuracy (15/15), 100% referral routing (Run 2). Supports a measured empirical baseline and identifies Devanagari normalization coverage gaps. |

Table VIII collects the four evidence layers. Together they demonstrate that deterministic rendering and bounded verification eliminate financial hallucinations on critical institutional facts, while the 90-case benchmark objectively establishes the Devanagari coverage gap.

---

## VII. DISCUSSION AND THREATS TO VALIDITY

### 7.1 What the Results Support
The evidence supports the feasibility of separating maintained critical facts from optional language generation in an institutional assistant. On the deterministic path with generation disabled, no incorrect fee value was observed in 15 fee cases (95% CI lower bound ≈ 80%). This characterizes the template renderer on developer-authored questions. It does not test the generation path or establish hallucination resistance.

The benchmark also shows what remains unresolved. Correctness was 85.0% in English but 50.0% and 45.0% in Marathi and Hindi, and the 14 false refusals all fall in the Devanagari languages. The traced cause is query-normalization coverage, which is fixable engineering. English has its own weaknesses: appropriate abstention was 57.1%, clarification accuracy 33.3% and the false-answer rate 42.9%. Overall, 28.6% of unanswerable questions were answered rather than refused. The verifier probes show that numeric token matching misses attribute swaps that clause-level checks catch, but those probes guided development, so this is regression closure.

All significance tests are post hoc and uncorrected for multiple comparisons, and they describe differences within this case set. The cases were not literal translations, so topic differences cannot be fully excluded.

### 7.2 Internal and Construct Validity
Development leakage remains the primary internal validity constraint: retrieval relevance groups, verifier mutation probes, and routing rules were authored with knowledge of the codebase, so improvements reflect regression closure. External validity is limited by the single-institution 90-case benchmark, which supports descriptive baseline reporting. Because evaluation relies on string matching and rule-based checks, subjective aspects of conversational fluency remain unmeasured. The public catalog (`cases.csv`) makes every case auditable against reference answers.

### 7.3 Language and Deployment Limits
Marathi and Hindi use rule-based interpretations and source-bound translations. The 14 false refusals (6 Marathi, 8 Hindi) stem from missing facility, transit, and affiliation keyword mappings in Devanagari query normalization rather than missing records or numeral translation bugs, as the assistant renders Western Arabic numerals in all languages. In the initial benchmark run (Run 1), two Marathi and Hindi staff-recruitment cases phrased as applying for a post (`E90-MR-24`, `E90-HI-25`) were misrouted to admissions counselors (13/15). Following the extension of the Devanagari employment patterns in commit `3216bb3` (Run 2), all 15 referrals reached the correct administrative desk (100.0%), documenting regression closure. Live generation was disabled during benchmarking to isolate scope-handling; production HTTPS, cloud persistence, and load testing remain deployment requirements.

### 7.4 Security and Privacy
Authentication, server-side authorization, rate limits, and session ownership reduce application risks. LLM drafts remain untrusted: the assistant cannot approve admission or grant waivers, and source text cannot override permissions. Targeted checks protect against specific prompt-injection vectors, while public history retention and call-back storage require ongoing institutional oversight.

---

## VIII. CONCLUSION AND FUTURE WORK

MITRA combines maintained knowledge, explicit scope handling, deterministic rendering of critical facts and optional checked generation in a multilingual institutional assistant. On a developer-authored 90-case benchmark scored by an automated harness with generation disabled, overall correctness was 60.0% (English 85.0%, Marathi 50.0%, Hindi 45.0%). All 15 fee, three hostel and three placement cases were correct, and no incorrect fee value was observed (95% CI lower bound ≈ 80%). Weaknesses are reported alongside these results. The false-refusal rate was 23.3%, entirely in Marathi and Hindi. The false-answer rate on unanswerable questions was 28.6%, and English abstention and clarification accuracy were the lowest of the three languages. The Devanagari refusals arise from missing facility-term mappings in query normalization. These results establish a measured baseline and feasibility, not deployment-level reliability.

Next steps are: (i) extending Devanagari normalization to facility, contact and transport vocabulary and re-measuring; (ii) correcting questionable answerability labels and auditing the scorer for script-aware matching; (iii) a controlled ablation of structured rendering against generation-based answering on the same corpus; and (iv) an independently authored evaluation with at least two blinded raters, reported inter-rater agreement and native-speaker review of Marathi and Hindi output.

---

## DATA AVAILABILITY
Project source: https://github.com/shraddha-2332/MITRA-The-Virtual-Assistant. Source-bound development summaries, corpus identifiers and limitations are stored under docs/research-review and identify working-file hashes, so they may describe a snapshot ahead of the committed and deployed versions. Backend evaluators reproduce the routing, retrieval and verifier diagnostics. Figs. 3–6 are unedited captures of the implemented application.

---

## ACKNOWLEDGMENT
The authors acknowledge Prof. Shobhana Raichurkar, Assistant Professor, Department of Computer Science and Engineering, MIT College of Railway Engineering & Research, Barshi, for project guidance, and the institutional reviewers who verified canonical knowledge records. The authors used an AI assistant for language editing and document formatting; the authors reviewed the content and are responsible for it.

---

## REFERENCES
1. P. Lewis et al., “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,” in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 33, 2020, pp. 9459–9474. [Online]. Available: https://arxiv.org/abs/2005.11401
2. S. Robertson and H. Zaragoza, “The Probabilistic Relevance Framework: BM25 and Beyond,” *Foundations and Trends in Information Retrieval*, vol. 3, no. 4, pp. 333–389, 2009, doi: 10.1561/1500000019.
3. L. Nguyen and T. Quan, “URAG: Implementing a Unified Hybrid RAG for Precise Answers in University Admission Chatbots—A Case Study at HCMUT,” *arXiv:2501.16276*, 2025. [Online]. Available: https://arxiv.org/abs/2501.16276
4. H.-T. Nguyen, Q.-D. Ngo, and Q.-D. Dang, “An Intent-Filtered Retrieval-Augmented Generation Chatbot for University Admissions in Vietnam,” in *Proc. Int. Conf. Advanced Technologies for Communications (ATC)*, 2024, doi: 10.1109/ATC63255.2024.10908188.
5. A. Nguyen-Duc et al., “An Empirical Study of Multi-Agent RAG for Real-World University Admissions Counseling,” *arXiv:2507.11272*, 2025. [Online]. Available: https://arxiv.org/abs/2507.11272
6. M. Maryamah et al., “Chatbots in Academia: A Retrieval-Augmented Generation Approach for Improved Efficient Information Access,” in *Proc. 16th Int. Conf. Knowledge and Smart Technology (KST)*, 2024, pp. 259–264, doi: 10.1109/KST61284.2024.10499652.
7. D. Kakwani et al., “IndicNLPSuite: Monolingual Corpora, Evaluation Benchmarks and Pre-trained Multilingual Language Models for Indian Languages,” in *Findings Assoc. Comput. Linguistics: EMNLP*, 2020, pp. 4948–4961, doi: 10.18653/v1/2020.findings-emnlp.445.
8. S. Es, J. James, L. Espinosa Anke, and S. Schockaert, “RAGAs: Automated Evaluation of Retrieval Augmented Generation,” in *Proc. EACL System Demonstrations*, 2024, pp. 150–158, doi: 10.18653/v1/2024.eacl-demo.16.
9. P. Mathur, A. Siu, N. Lipka, and T. Sun, “MATSA: Multi-Agent Table Structure Attribution,” in *Proc. EMNLP System Demonstrations*, 2024, pp. 250–258, doi: 10.18653/v1/2024.emnlp-demo.26.
10. K. S. Bukkapatnam and S. Mehta, “TabFaith: Benchmarking and Improving Structural Faithfulness in LLM Table Summarization,” in *Proc. First Workshop on Structured Understanding, Retrieval, and Generation in the LLM Era (SURGeLLM)*, 2026, pp. 326–332, doi: 10.18653/v1/2026.surgellm-1.21.
11. Z. Ji et al., “Survey of hallucination in natural language generation,” *ACM Comput. Surv.*, vol. 55, no. 12, Art. no. 248, 2023.
12. N. Thakur et al., “BEIR: A heterogeneous benchmark for zero-shot evaluation of information retrieval models,” in *Proc. NeurIPS Datasets and Benchmarks Track*, 2021.
13. J. H. Clark et al., “TyDi QA: A benchmark for information-seeking question answering in typologically diverse languages,” *Trans. Assoc. Comput. Linguistics*, vol. 8, pp. 454–470, 2020.
14. A. Asai et al., “XOR QA: Cross-lingual open-retrieval question answering,” in *Proc. NAACL-HLT*, 2021, pp. 547–564.
15. P. Buneman, S. Khanna, and W.-C. Tan, “Why and where: A characterization of data provenance,” in *Proc. Int. Conf. Database Theory (ICDT)*, LNCS vol. 1973, 2001, pp. 316–330.
16. Z. Chen, D. Zou, H. Xie, H. Lou, and Z. Pang, “Facilitating university admission using a chatbot based on large language models with retrieval-augmented generation,” *Educ. Technol. Soc.*, vol. 27, no. 4, pp. 454–470, 2024, doi: 10.30191/ETS.202410_27(4).TP02.
17. Gemini Team, Google, “Gemini: A family of highly capable multimodal models,” *arXiv:2312.11805*, 2023.
18. C. D. Manning, P. Raghavan, and H. Schütze, *Introduction to Information Retrieval*. Cambridge, U.K.: Cambridge Univ. Press, 2008.
19. G. V. Cormack, C. L. A. Clarke, and S. Büttcher, “Reciprocal rank fusion outperforms Condorcet and individual rank learning methods,” in *Proc. 32nd Int. ACM SIGIR Conf. Research and Development in Information Retrieval*, 2009, pp. 758–759, doi: 10.1145/1571941.1572114.
20. E. B. Wilson, “Probable inference, the law of succession, and statistical inference,” *J. Amer. Statist. Assoc.*, vol. 22, no. 158, pp. 209–212, 1927.
