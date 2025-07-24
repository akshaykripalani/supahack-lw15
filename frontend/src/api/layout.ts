const API_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

export async function fetchLayout(prompt: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/layout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!resp.ok) {
    throw new Error(`Backend error: ${resp.status}`);
  }

  const data: { paragraph: string } = await resp.json();
  return data.paragraph;
} 