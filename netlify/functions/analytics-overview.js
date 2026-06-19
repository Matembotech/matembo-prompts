import { propertyId, runCachedReport } from './_utils/ga4Client.js';

export const handler = async (event, context) => {
  // Simple auth check via header (Optional, but good practice for admin routes)
  const authHeader = event.headers['x-admin-secret'];
  console.log("Expected Auth:", process.env.VITE_ADMIN_PASSWORD);
  console.log("Received Auth:", authHeader);
  
  // Normalize quotes just in case dotenv loaded them differently in Node vs Vite
  const expectedAuth = process.env.VITE_ADMIN_PASSWORD?.replace(/^"|"$/g, '');
  
  if (authHeader !== expectedAuth) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const days = event.queryStringParameters?.days || '7';
  
  try {
    const response = await runCachedReport(`overview_${days}`, {
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
      dimensions: [{ name: 'date' }],
      keepEmptyRows: true,
    });

    if (!response || !response.rows) {
      return { statusCode: 200, body: JSON.stringify({ totals: { activeUsers: 0, newUsers: 0, sessions: 0 }, trend: [] }) };
    }

    const trend = response.rows.map(row => ({
      date: row.dimensionValues?.[0]?.value || '',
      activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
      newUsers: parseInt(row.metricValues?.[1]?.value || '0', 10),
      sessions: parseInt(row.metricValues?.[2]?.value || '0', 10),
    }));

    trend.sort((a, b) => a.date.localeCompare(b.date));

    const totals = trend.reduce((acc, day) => {
      acc.activeUsers += day.activeUsers;
      acc.newUsers += day.newUsers;
      acc.sessions += day.sessions;
      return acc;
    }, { activeUsers: 0, newUsers: 0, sessions: 0 });

    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totals, trend }) 
    };
  } catch (error) {
    console.error('Analytics Overview Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch overview data' }) };
  }
};
