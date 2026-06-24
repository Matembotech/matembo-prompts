import { propertyId, runCachedReport } from './_utils/ga4Client.js';

export default async function handler(req, res) {
  // Auth check
  const authHeader = req.headers['x-admin-secret'];
  const expectedAuth = process.env.VITE_ADMIN_PASSWORD?.replace(/^"|"$/g, '');
  if (authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const days = req.query.days || '7';

  try {
    const response = await runCachedReport(`overview_${days}`, {
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
      dimensions: [{ name: 'date' }],
      keepEmptyRows: true,
    });

    if (!response || !response.rows) {
      return res.status(200).json({ totals: { activeUsers: 0, newUsers: 0, sessions: 0 }, trend: [] });
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

    return res.status(200).json({ totals, trend });
  } catch (error) {
    console.error('Analytics Overview Error:', error);
    return res.status(500).json({ error: 'Failed to fetch overview data' });
  }
}
