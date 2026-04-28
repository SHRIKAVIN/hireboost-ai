/**
 * Normalize provider SDK errors for HTTP mapping (rate limits, etc.).
 */

export function isAiProviderRateLimited(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const o = err as { status?: number; statusCode?: number; message?: string };
  const status = o.status ?? o.statusCode;
  if (status === 429) return true;
  const msg = typeof o.message === 'string' ? o.message : '';
  return /429|Too Many Requests|quota exceeded|rate.?limit/i.test(msg);
}

/** Best-effort parse of Google RetryInfo text in error messages. */
export function parseRetryAfterSecondsFromAiError(err: unknown): number | undefined {
  const msg = err instanceof Error ? err.message : '';
  const m = /retry in ([\d.]+)s/i.exec(msg);
  const raw = m?.[1];
  if (raw === undefined) return undefined;
  const sec = Math.ceil(parseFloat(raw));
  if (!Number.isFinite(sec)) return undefined;
  return Math.min(300, Math.max(1, sec));
}
