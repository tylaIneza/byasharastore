const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || now > record.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= maxRequests) return false; // blocked

  record.count++;
  return true;
}

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateMap.entries()) {
    if (now > val.resetAt) rateMap.delete(key);
  }
}, 10 * 60 * 1000);
