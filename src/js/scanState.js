// Shared scan state — passes analysis results between the Scanner and Results pages
// without requiring a database round-trip. Uses sessionStorage so a page refresh
// within the same tab still works.

const KEY = 'sachet_last_scan';

export function saveScanResult(data, message) {
  const payload = {
    result: data,
    message,
    timestamp: Date.now(),
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage may be unavailable (private mode) — in-memory only
  }
  return payload;
}

export function getScanResult() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearScanResult() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
