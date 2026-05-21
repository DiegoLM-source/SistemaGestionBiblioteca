const cache = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

const getEntry = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry;
};

export const cachedGet = async (key, fetcher, ttlMs = DEFAULT_TTL_MS) => {
  const entry = getEntry(key);

  if (entry?.data) {
    return { data: entry.data };
  }

  if (entry?.promise) {
    const data = await entry.promise;
    return { data };
  }

  const promise = fetcher().then((res) => res.data);
  cache.set(key, { promise, expiresAt: Date.now() + ttlMs });

  try {
    const data = await promise;
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    return { data };
  } catch (error) {
    cache.delete(key);
    throw error;
  }
};

export const clearCache = (...keys) => {
  keys.forEach((key) => cache.delete(key));
};

