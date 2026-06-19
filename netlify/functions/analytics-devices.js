import { propertyId, runCachedReport } from './_utils/ga4Client.js';

export const handler = async (event) => {
  const authHeader = event.headers['x-admin-secret'];
  const expectedAuth = process.env.VITE_ADMIN_PASSWORD?.replace(/^"|"$/g, '');
  if (authHeader !== expectedAuth) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const days = event.queryStringParameters?.days || '7';

  try {
    const response = await runCachedReport(`devices_${days}`, {
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    });

    const data = (response.rows || []).map(row => ({
      device: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    };
  } catch (error) {
    console.error('Devices Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch devices' }) };
  }
};
