import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api.js';

export default function useApiData(path) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, data: [], error: '' });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    setState({ loading: true, data: [], error: '' });
    async function load() {
      try {
        if (!API_BASE_URL) throw new Error('Set VITE_API_BASE_URL in client/.env and restart the frontend.');
        const response = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`API request failed (HTTP ${response.status}). Check that the backend and MongoDB are running, then retry.`);
        const body = await response.json();
        if (!Array.isArray(body.data)) throw new Error('The API returned an unexpected response. Expected a data array.');
        if (active) setState({ loading: false, data: body.data, error: '' });
      } catch (error) {
        if (!active) return;
        const message = timedOut ? 'The API did not respond within 15 seconds. Check the backend and retry.'
          : error instanceof TypeError ? 'Cannot reach the API. Check the backend, VITE_API_BASE_URL, and local CORS settings.' : error.message;
        setState({ loading: false, data: [], error: message });
      } finally { clearTimeout(timeout); }
    }
    load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [path, attempt]);
  return { ...state, reload: () => setAttempt((value) => value + 1) };
}
