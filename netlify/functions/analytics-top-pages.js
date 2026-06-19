import { propertyId, runCachedReport } from './_utils/ga4Client.js';

export const handler = async (event) => {
  const authHeader = event.headers['x-admin-secret'];
  const expectedAuth = process.env.VITE_ADMIN_PASSWORD?.replace(/^"|"$/g, '');
  if (authHeader !== expectedAuth) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const days = event.queryStringParameters?.days || '7';

  try {
    const response = await runCachedReport(`top-pages_${days}`, {
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    const data = (response.rows || []).map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    };
  } catch (error) {
    console.error('Top Pages Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch top pages' }) };
  }
};
