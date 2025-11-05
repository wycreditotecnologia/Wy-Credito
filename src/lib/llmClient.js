// Frontend client for unified LLM backend endpoints

const BASE_URL = '';

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'LLM API Error');
  return data;
}

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'LLM API Error');
  return data;
}

export const llmClient = {
  async chat(prompt, context = {}, providerPreference) {
    return postJson('/api/llm-chat', { prompt, context, providerPreference });
  },
  async extract({ prompt, mimeType, dataBase64 }) {
    return postJson('/api/llm-extract', { prompt, mimeType, dataBase64 });
  },
  async status() {
    return getJson('/api/llm-status');
  }
};