// src/api/huggingface.js
// SECURITY: API calls now go through secure backend proxy
// No more direct API token exposure in frontend!

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default async function queryModel(text) {
  // Input validation
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }

  if (text.length > 5000) {
    throw new Error('Input too long: text must be less than 5000 characters');
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/huggingface/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('HuggingFace API error:', error);
    throw error;
  }
}
