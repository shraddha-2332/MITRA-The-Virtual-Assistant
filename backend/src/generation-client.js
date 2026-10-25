// Optional generation only: bounded transient retries within one overall budget.
// Every returned draft must still pass the caller's evidence validation.
export async function requestGeneration({ apiKey, primaryModel, fallbackModel = '', body, timeoutMs = 15000,
  fetchImpl = globalThis.fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), random = Math.random }) {
  if (!apiKey) return null;
  const started = Date.now();
  const models = [primaryModel, primaryModel, ...(fallbackModel && fallbackModel !== primaryModel ? [fallbackModel] : [])];
  for (let index = 0; index < models.length; index++) {
    const remaining = timeoutMs - (Date.now() - started);
    if (remaining <= 0) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(4000, remaining));
    let transient = false;
    try {
      const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(models[index])}:generateContent`, {
        method: 'POST', signal: controller.signal,
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (response.ok) {
        const payload = await response.json();
        const candidate = payload?.candidates?.[0];
        if (payload?.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY') return null;
        const text = candidate?.content?.parts?.map(part => part.text || '').join('').trim();
        return text && !text.startsWith('INSUFFICIENT_EVIDENCE') ? { text, model: models[index], attempts: index + 1 } : null;
      }
      // Billing/permission/bad input failures are not retried or cascaded.
      transient = [408, 429, 500, 502, 503, 504].includes(response.status);
    } catch (error) {
      transient = error?.name === 'AbortError' || error instanceof TypeError;
    } finally { clearTimeout(timer); }
    if (!transient || index === models.length - 1) return null;
    const delay = Math.min(200 * 2 ** index + Math.floor(random() * 100), timeoutMs - (Date.now() - started));
    if (delay <= 0) return null;
    await sleep(delay);
  }
  return null;
}
