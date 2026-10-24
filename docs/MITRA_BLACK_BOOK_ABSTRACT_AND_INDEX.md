# Mitra Black Book Draft Abstract and Index

Use this content after the acknowledgement page in the supplied black-book template. Replace all page-number placeholders only after the complete report has been formatted. Replace bracketed personal details on the front pages with verified student, guide, department and academic-year information.

## ABSTRACT

Mitra is an evidence-aware multilingual virtual assistant developed to support prospective students, parents and visitors seeking institutional information from MIT College of Railway Engineering and Research (MITCORER), Barshi. Students commonly need clear information about admission procedures, programmes, eligibility, fee structures, scholarships, hostel facilities, transport, library services, placements and contact details. Conventional static web pages and frequently asked question documents often make this information difficult to locate, particularly when a user uses paraphrased, mixed-language or multi-part queries.

The proposed system provides a web-based conversational interface that retrieves information from maintained institutional knowledge instead of relying solely on a general-purpose language model. The frontend is implemented using React and Vite, while the backend is developed using Node.js. SQLite is used for persistent storage of knowledge records, source metadata and application data. The assistant applies query validation, bounded multilingual query interpretation, weighted lexical retrieval and deterministic answer rendering for critical institutional facts such as fees, programme intake, choice codes and accommodation charges.

Mitra supports selected English, Marathi, Hindi and transliterated queries. It identifies relevant details including programme branch, admission route, academic year, category, gender and facility scope. For compound questions, the system produces separate supported, unsupported or clarification sections so that one unanswered part does not suppress another supported part. Knowledge records are revision-controlled and only published records are available to public retrieval. Source provenance, publication status, academic-year information and supersession controls are used to reduce the risk of presenting outdated or retired information.

Google Gemini is integrated as an optional evidence-grounded generation component for selected open-ended questions. Generated output is not treated as authoritative: it is checked against retrieved evidence for important factual tokens such as amounts, academic years, intake values, dates and choice codes. The system also rejects unsupported promissory statements related to admission, placement, scholarships or seat allocation. When reliable evidence is unavailable, Mitra returns a clarification request, an explicit insufficient-information response or an evidence-based fallback.

The prototype has been validated through backend and frontend automated tests, routing diagnostics, multilingual checks and browser-based answer audits. The project demonstrates that an institutional assistant can combine deterministic controls, maintained knowledge, source awareness and bounded AI assistance to provide more reliable admission-information support. Independent human evaluation, broader speaker review and production deployment verification remain future work.

**Keywords:** institutional virtual assistant, retrieval-augmented generation, multilingual query understanding, knowledge management, source provenance, Gemini API, admission information system.

## CONTENTS

| Section | Page No. |
| --- | ---: |
| Certificate | i |
| Declaration | ii |
| Acknowledgement | iii |
| Abstract | iv |
| List of Figures | v |
| List of Tables | vi |
| **Chapter 1: Introduction** | 1 |
| 1.1 Background | ___ |
| 1.2 Problem Statement | ___ |
| 1.3 Need for the System | ___ |
| 1.4 Objectives of the Project | ___ |
| 1.5 Scope of the Project | ___ |
| 1.6 Limitations of the Project | ___ |
| 1.7 Organization of the Report | ___ |
| **Chapter 2: Literature Survey** | ___ |
| 2.1 Institutional Chatbots and Information Retrieval Systems | ___ |
| 2.2 Retrieval-Augmented Generation for Factual Assistance | ___ |
| 2.3 Multilingual Conversational Systems | ___ |
| 2.4 Limitations of Existing Approaches | ___ |
| 2.5 Research Gap | ___ |
| **Chapter 3: Requirement Analysis and Proposed System** | ___ |
| 3.1 Analysis of the Existing System | ___ |
| 3.2 Proposed System | ___ |
| 3.3 Functional Requirements | ___ |
| 3.4 Non-Functional Requirements | ___ |
| 3.5 User Roles and Use Cases | ___ |
| 3.6 Feasibility Study | ___ |
| **Chapter 4: System Design** | ___ |
| 4.1 Overall System Architecture | ___ |
| 4.2 Public Assistant Request Flow | ___ |
| 4.3 Query Understanding and Compound Question Planning | ___ |
| 4.4 Knowledge Management and Source Provenance | ___ |
| 4.5 Database Design | ___ |
| 4.6 Security and Reliability Design | ___ |
| 4.7 Website Synchronization and Review Workflow | ___ |
| **Chapter 5: System Implementation** | ___ |
| 5.1 Technology Stack | ___ |
| 5.2 Frontend Implementation | ___ |
| 5.3 Backend API and Retrieval Implementation | ___ |
| 5.4 Deterministic Factual Answer Rendering | ___ |
| 5.5 Optional Gemini Generation and Grounding Checks | ___ |
| 5.6 Multilingual Response Support | ___ |
| 5.7 Knowledge Maintenance and Official Source Updates | ___ |
| **Chapter 6: Testing and Evaluation** | ___ |
| 6.1 Test Strategy | ___ |
| 6.2 Functional and API Testing | ___ |
| 6.3 Query Understanding and Multilingual Testing | ___ |
| 6.4 Browser-Based Answer and Source-Link Testing | ___ |
| 6.5 Retrieval Evaluation Framework | ___ |
| 6.6 Test Results and Discussion | ___ |
| **Chapter 7: Results and Discussion** | ___ |
| 7.1 Implemented Outcomes | ___ |
| 7.2 Reliability Controls and Failure Handling | ___ |
| 7.3 Discussion of Current Limitations | ___ |
| **Chapter 8: Conclusion and Future Scope** | ___ |
| 8.1 Conclusion | ___ |
| 8.2 Future Scope | ___ |
| References | ___ |
| Appendix A: API Endpoints | ___ |
| Appendix B: Test Cases and Results | ___ |
| Appendix C: User Interface Screenshots | ___ |

## LIST OF FIGURES

| Figure No. | Title | Page No. |
| --- | --- | ---: |
| Figure 4.1 | Overall Architecture of Mitra | ___ |
| Figure 4.2 | Public Assistant Request and Response Flow | ___ |
| Figure 4.3 | Query Understanding and Retrieval Workflow | ___ |
| Figure 4.4 | Knowledge Publication and Source Review Workflow | ___ |
| Figure 4.5 | Website Synchronization and Maintainer Review Process | ___ |
| Figure 5.1 | Mitra Public Chat Interface | ___ |
| Figure 5.2 | Multilingual Language Selection Interface | ___ |
| Figure 5.3 | Compound Answer with Separate Sections | ___ |
| Figure 5.4 | Maintainer Knowledge Review Interface | ___ |
| Figure 6.1 | Testing and Evaluation Workflow | ___ |

## LIST OF TABLES

| Table No. | Title | Page No. |
| --- | --- | ---: |
| Table 3.1 | Functional Requirements of the System | ___ |
| Table 3.2 | Non-Functional Requirements of the System | ___ |
| Table 3.3 | Feasibility Study | ___ |
| Table 4.1 | Major System Modules and Responsibilities | ___ |
| Table 4.2 | Knowledge Record Statuses and Public Availability | ___ |
| Table 4.3 | Security and Reliability Controls | ___ |
| Table 5.1 | Technology Stack Used in Mitra | ___ |
| Table 5.2 | Supported Query Understanding Fields | ___ |
| Table 5.3 | Canonical Maintained Knowledge Records | ___ |
| Table 6.1 | Backend and Frontend Test Summary | ___ |
| Table 6.2 | Public Assistant Evaluation Categories | ___ |
| Table 6.3 | Current Evaluation Limits and Future Measurements | ___ |
| Table 7.1 | Implemented Features and Current Status | ___ |
| Table 8.1 | Future Scope of the Project | ___ |
