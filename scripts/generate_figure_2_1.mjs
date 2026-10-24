import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 30px;
    width: 1100px;
  }
  .card-container {
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 24px;
    background: #ffffff;
    box-shadow: 0 4px 14px rgba(0,0,0,0.04);
  }
  .header-box {
    text-align: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 16px;
    margin-bottom: 22px;
  }
  .header-box h2 {
    font-size: 20px;
    font-weight: 750;
    color: #0f172a;
    letter-spacing: -0.3px;
    text-transform: uppercase;
  }
  .header-box p {
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }

  /* Grid of 4 Paradigms */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .col-card {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }
  .col-card.highlight {
    border-color: #146548;
    background: #f0fdf4;
    box-shadow: 0 6px 16px rgba(20, 101, 72, 0.08);
  }
  .era-badge {
    display: inline-block;
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    background: #e2e8f0;
    color: #475569;
  }
  .col-card.highlight .era-badge {
    background: #146548;
    color: #ffffff;
  }
  .card-title {
    font-size: 14.5px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
    line-height: 1.25;
  }
  .col-card.highlight .card-title {
    color: #146548;
  }
  .card-mechanism {
    font-size: 11.5px;
    color: #64748b;
    margin-bottom: 12px;
    min-height: 38px;
    line-height: 1.35;
  }
  .feature-list {
    list-style: none;
    font-size: 11px;
    margin-bottom: 14px;
    line-height: 1.45;
  }
  .feature-list li {
    margin-bottom: 6px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  .icon-pro { color: #16a34a; font-weight: bold; flex-shrink: 0; }
  .icon-con { color: #dc2626; font-weight: bold; flex-shrink: 0; }

  .status-footer {
    border-top: 1px dashed #cbd5e1;
    padding-top: 10px;
    font-size: 11px;
  }
  .status-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }
  .status-label { color: #64748b; }
  .status-val { font-weight: 700; }
  .status-val.low { color: #dc2626; }
  .status-val.med { color: #d97706; }
  .status-val.high { color: #16a34a; }
  .status-val.perf { color: #146548; }

  /* Spectrum Bar */
  .spectrum-banner {
    border: 1px solid #e2e8f0;
    background: linear-gradient(90deg, #fef2f2 0%, #fffbeb 35%, #f0fdf4 100%);
    border-radius: 8px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .spectrum-block {
    display: flex;
    flex-direction: column;
  }
  .spectrum-title {
    font-size: 11.5px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 2px;
  }
  .spectrum-desc {
    font-size: 11px;
    color: #64748b;
  }
  .spectrum-arrow {
    font-size: 18px;
    color: #94a3b8;
    font-weight: bold;
    padding: 0 10px;
  }

  /* Academic Caption */
  .caption-block {
    text-align: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 14px;
    font-size: 12.5px;
    color: #334155;
    font-style: italic;
  }
  .caption-block strong {
    font-style: normal;
    font-weight: 700;
    color: #0f172a;
  }
</style>
</head>
<body>

<div class="card-container">
  <div class="header-box">
    <h2>Evolution of Conversational Systems in Higher Education Administration</h2>
    <p>A comparative architectural taxonomy highlighting the trade-off between generative flexibility and factual compliance</p>
  </div>

  <div class="grid">
    <!-- Paradigm 1 -->
    <div class="col-card">
      <div>
        <span class="era-badge">1966 – 2018</span>
        <div class="card-title">1. Rule-Based Systems</div>
        <div class="card-mechanism">Pattern-matching regex, decision trees, and AIML scripts (ELIZA, Weizenbaum).</div>
        <ul class="feature-list">
          <li><span class="icon-pro">✔</span> High factual determinism within strictly programmed rules.</li>
          <li><span class="icon-con">✖</span> Completely brittle to typos, paraphrasing, and synonyms.</li>
          <li><span class="icon-con">✖</span> Zero capability to parse vernacular or transliterated queries.</li>
          <li><span class="icon-con">✖</span> Collapses on multi-turn dialogue or compound questions.</li>
        </ul>
      </div>
      <div class="status-footer">
        <div class="status-row"><span class="status-label">Conversational Fluency:</span><span class="status-val low">Very Low</span></div>
        <div class="status-row"><span class="status-label">Factual Safety:</span><span class="status-val med">Moderate</span></div>
      </div>
    </div>

    <!-- Paradigm 2 -->
    <div class="col-card">
      <div>
        <span class="era-badge">2018 – 2022</span>
        <div class="card-title">2. Intent Classifiers</div>
        <div class="card-mechanism">Machine learning intent classification and entity slot filling (Dialogflow, Rasa NLU).</div>
        <ul class="feature-list">
          <li><span class="icon-pro">✔</span> Handles minor paraphrasing within predefined intent domains.</li>
          <li><span class="icon-con">✖</span> Requires thousands of manually labeled intents for fee slabs.</li>
          <li><span class="icon-con">✖</span> High maintenance overhead across frequent academic year updates.</li>
          <li><span class="icon-con">✖</span> Rigid dialogue trees struggle with complex follow-up context.</li>
        </ul>
      </div>
      <div class="status-footer">
        <div class="status-row"><span class="status-label">Conversational Fluency:</span><span class="status-val med">Moderate</span></div>
        <div class="status-row"><span class="status-label">Factual Safety:</span><span class="status-val med">Moderate</span></div>
      </div>
    </div>

    <!-- Paradigm 3 -->
    <div class="col-card">
      <div>
        <span class="era-badge">2023 – Present</span>
        <div class="card-title">3. Unconstrained LLMs</div>
        <div class="card-mechanism">Autoregressive probabilistic token generation (Vanilla ChatGPT, Gemini Zero-Shot).</div>
        <ul class="feature-list">
          <li><span class="icon-pro">✔</span> Exceptional natural language fluency and multilingual capabilities.</li>
          <li><span class="icon-con">✖</span> <strong>Stochastic Hallucination:</strong> Fabricates tuition fees and cutoffs.</li>
          <li><span class="icon-con">✖</span> Unsafe promissory claims (e.g. false admission guarantees).</li>
          <li><span class="icon-con">✖</span> Lacks verifiable document citations and audit provenance.</li>
        </ul>
      </div>
      <div class="status-footer">
        <div class="status-row"><span class="status-label">Conversational Fluency:</span><span class="status-val high">Very High</span></div>
        <div class="status-row"><span class="status-label">Factual Safety:</span><span class="status-val low">Unsafe (Risk)</span></div>
      </div>
    </div>

    <!-- Paradigm 4 (MITRA) -->
    <div class="col-card highlight">
      <div>
        <span class="era-badge">Proposed Solution</span>
        <div class="card-title">4. Schema-Gated RAG (MITRA)</div>
        <div class="card-mechanism">Deterministic Canonical Calculation + Constrained Decoding Models (Gemini CDM) + Bounded RAG.</div>
        <ul class="feature-list">
          <li><span class="icon-pro">✔</span> <strong>Deterministic Grounding:</strong> Fees and intakes computed from canonical records.</li>
          <li><span class="icon-pro">✔</span> <strong>Hallucination Mitigation:</strong> Generative AI bypassed for critical statutory values.</li>
          <li><span class="icon-pro">✔</span> <strong>Constrained Decoding (CDM):</strong> Enforces strict JSON schemas for circulars.</li>
          <li><span class="icon-pro">✔</span> <strong>Entity-Locked Multilingual:</strong> Robust Marathi, Hindi & Transliteration.</li>
        </ul>
      </div>
      <div class="status-footer">
        <div class="status-row"><span class="status-label">Conversational Fluency:</span><span class="status-val perf">High & Bounded</span></div>
        <div class="status-row"><span class="status-label">Factual Reliability:</span><span class="status-val perf">High (Deterministic)</span></div>
      </div>
    </div>
  </div>

  <div class="spectrum-banner">
    <div class="spectrum-block">
      <span class="spectrum-title">Legacy Systems</span>
      <span class="spectrum-desc">High determinism, but rigid and brittle to real student language.</span>
    </div>
    <div class="spectrum-arrow">➔</div>
    <div class="spectrum-block">
      <span class="spectrum-title">Commercial Generative AI</span>
      <span class="spectrum-desc">High conversational fluency, but uncontrollable hallucination risks.</span>
    </div>
    <div class="spectrum-arrow">➔</div>
    <div class="spectrum-block">
      <span class="spectrum-title" style="color: #146548;">MITRA Architecture (The Addressed Research Gap)</span>
      <span class="spectrum-desc" style="color: #166534; font-weight: 600;">Optimal balance: Conversational Fluency + Grounded Factual Integrity.</span>
    </div>
  </div>

  <div class="caption-block">
    <strong>Figure 2.1:</strong> Taxonomy of conversational architectures and the trade-off between generative flexibility and factual reliability in higher education administration.
  </div>
</div>

</body>
</html>`;

async function renderDiagram() {
  const htmlPath = path.resolve('temp_figure_2_1.html');
  const outputPath = path.resolve('Figure_2_1_Literature_Survey_Taxonomy.png');
  const artifactPath = path.resolve('C:/Users/shrad/.gemini/antigravity/brain/3c35bb28-511e-425a-bcb2-131a0c02b676/Figure_2_1_Literature_Survey_Taxonomy.png');
  
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 1160, height: 750 },
    deviceScaleFactor: 2, // High resolution (Retina/300 DPI equivalent)
  });
  
  await page.goto('file:///' + htmlPath.replace(/\\\\/g, '/'));
  await page.waitForTimeout(500);
  
  const element = await page.$('.card-container');
  await element.screenshot({ path: outputPath });
  await element.screenshot({ path: artifactPath });
  
  await browser.close();
  try { fs.unlinkSync(htmlPath); } catch {}
  console.log('Successfully generated updated diagram image:', outputPath);
}

renderDiagram().catch(err => {
  console.error(err);
  process.exit(1);
});
