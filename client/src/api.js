// api.js
export const API_URL = import.meta.env.VITE_API_URL;

export async function fetchFromBackend(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}
