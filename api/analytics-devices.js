import { propertyId, runCachedReport } from './_utils/ga4Client.js';

export default async function handler(req, res) {
  const authHeader = req.headers['x-admin-secret'];
  const expectedAuth = process.env.VITE_ADMIN_PASSWORD?.replace(/^"|"$/g, '');
  if (authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const days = req.query.days || '7';

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

    return res.status(200).json(data);
  } catch (error) {
    console.error('Devices Error:', error);
    return res.status(500).json({ error: 'Failed to fetch devices' });
  }
}
