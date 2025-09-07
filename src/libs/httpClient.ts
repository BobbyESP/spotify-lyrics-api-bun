export async function httpGet(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} at ${url}`);
  }
  return res;
}
