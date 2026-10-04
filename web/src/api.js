async function request(url, options) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

const qs = (params) => new URLSearchParams(params).toString();

export const getGraph = () => request('/api/graph');
export const getGodNodes = (limit = 8) => request(`/api/god-nodes?${qs({ limit })}`);
export const searchNodes = (q) => request(`/api/search?${qs({ q })}`);
export const getNode = (id) => request(`/api/node?${qs({ id })}`);
export const getPath = (from, to) => request(`/api/path?${qs({ from, to })}`);
export const getReport = async () => {
  const res = await fetch('/api/report');
  if (!res.ok) throw new Error('No report available');
  return res.text();
};
export const analyze = (project) =>
  request('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project ? { project } : {}),
  });
