import { propertyId, runCachedReport } from './_utils/ga4Client.js';

export default async function handler(req, res) {
  const authHeader = req.headers['x-admin-secret'];
  const expectedAuth = process.env.VITE_ADMIN_PASSWORD?.replace(/^"|"$/g, '');
  if (authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const days = req.query.days || '7';

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

    return res.status(200).json(data);
  } catch (error) {
    console.error('Top Pages Error:', error);
    return res.status(500).json({ error: 'Failed to fetch top pages' });
  }
}
