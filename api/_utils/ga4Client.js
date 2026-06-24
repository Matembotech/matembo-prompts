import { BetaAnalyticsDataClient } from '@google-analytics/data';

const projectId = process.env.GOOGLE_PROJECT_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
// Handle env variables which may escape newlines or include surrounding quotes
let rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
// Remove surrounding quotes and trim whitespace if the user pasted them
rawKey = rawKey.trim().replace(/^[\"']|[\"']$/g, '');
const privateKey = rawKey.replace(/\\n/g, '\n');

export const propertyId = process.env.GA4_PROPERTY_ID;

export const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
    project_id: projectId,
  },
});

// Simple In-Memory Cache (TTL: 5 minutes)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export async function runCachedReport(cacheKey, requestConfig) {
  const now = Date.now();
  if (cache.has(cacheKey) && cache.get(cacheKey).expiry > now) {
    return cache.get(cacheKey).data;
  }

  const [response] = await analyticsClient.runReport(requestConfig);
  cache.set(cacheKey, { data: response, expiry: now + CACHE_TTL });
  return response;
}
