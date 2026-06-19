import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsDashboard({ isMobile, isTablet }) {
  const [days, setDays] = useState(7);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const [overview, setOverview] = useState(null);
  const [topPages, setTopPages] = useState(null);
  const [countries, setCountries] = useState(null);
  const [devices, setDevices] = useState(null);
  
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    // Let's make sure Vite is actually loading the env var properly
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD?.replace(/^"|"$/g, '');
    const headers = { 'x-admin-secret': adminPassword || '' };

    try {
      const urls = [
        `/.netlify/functions/analytics-overview?days=${days}`,
        `/.netlify/functions/analytics-top-pages?days=${days}`,
        `/.netlify/functions/analytics-countries?days=${days}`,
        `/.netlify/functions/analytics-devices?days=${days}`
      ];

      const responses = await Promise.all(urls.map(url => fetch(url, { headers })));
      
      // Check if any response failed
      for (const res of responses) {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API failed (${res.status}): ${res.url} - ${text}`);
        }
      }

      const [overviewData, pagesData, countriesData, devicesData] = await Promise.all(
        responses.map(res => res.json())
      );

      setOverview(overviewData);
      setTopPages(pagesData);
      setCountries(countriesData);
      setDevices(devicesData);
    } catch (error) {
      console.error('🚨 Error fetching analytics:', error);
      // Fallback empty data so UI doesn't crash but shows zero state
      setOverview({ totals: { activeUsers: 0, newUsers: 0, sessions: 0 }, trend: [] });
      setTopPages([]);
      setCountries([]);
      setDevices([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 60000);
    return () => clearInterval(interval);
  }, [days]);

  // Format date from YYYYMMDD to readable
  const formatXAxis = (tickItem) => {
    if (!tickItem || tickItem.length !== 8) return tickItem;
    const year = tickItem.slice(0, 4);
    const month = tickItem.slice(4, 6);
    const day = tickItem.slice(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.headerRow, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '16px' }}>
        <div>
          <h2 style={{ ...styles.title, fontSize: isMobile ? '18px' : '24px' }}>Traffic Overview</h2>
          <p style={{ ...styles.subtitle, fontSize: isMobile ? '11px' : '14px' }}>Real-time Google Analytics 4 Data • Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <select 
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ ...styles.select, width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '13px' : '14px' }}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {loading && !overview ? (
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div style={{ ...styles.cardsGrid, gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '8px' : '20px' }}>
            <div style={{...styles.card, background: '#0F6E56', padding: isMobile ? '16px' : '24px'}}>
              <p style={{...styles.cardLabel, color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '10px' : '14px'}}>Active Users</p>
              <h3 style={{...styles.cardValue, color: '#ffffff', fontSize: isMobile ? '28px' : '36px'}}>{overview?.totals?.activeUsers || 0}</h3>
              <div style={{ display: 'inline-block', marginTop: '10px', height: '3px', width: '36px', borderRadius: '2px', background: '#00C896' }} />
            </div>
            <div style={{...styles.card, background: '#3730A3', padding: isMobile ? '16px' : '24px'}}>
              <p style={{...styles.cardLabel, color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '10px' : '14px'}}>New Users</p>
              <h3 style={{...styles.cardValue, color: '#ffffff', fontSize: isMobile ? '28px' : '36px'}}>{overview?.totals?.newUsers || 0}</h3>
              <div style={{ display: 'inline-block', marginTop: '10px', height: '3px', width: '36px', borderRadius: '2px', background: '#818CF8' }} />
            </div>
            <div style={{...styles.card, background: '#0E7490', padding: isMobile ? '16px' : '24px'}}>
              <p style={{...styles.cardLabel, color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '10px' : '14px'}}>Sessions</p>
              <h3 style={{...styles.cardValue, color: '#ffffff', fontSize: isMobile ? '28px' : '36px'}}>{overview?.totals?.sessions || 0}</h3>
              <div style={{ display: 'inline-block', marginTop: '10px', height: '3px', width: '36px', borderRadius: '2px', background: '#67E8F9' }} />
            </div>
          </div>

          {/* Chart */}
          <div style={{ ...styles.chartContainer, padding: isMobile ? '16px 12px' : '24px' }}>
            <h4 style={styles.sectionTitle}>Traffic Trend ({days} Days)</h4>
            <div style={{ height: isMobile ? 200 : 300, width: '100%' }}>
              {overview?.trend && overview.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                  <LineChart data={overview.trend} margin={isMobile ? { top: 10, right: 5, left: -30, bottom: 0 } : { top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#9ca3af" fontSize={isMobile ? 10 : 12} tickLine={false} axisLine={false} dy={10} interval={isMobile ? 1 : 0} />
                    <YAxis stroke="#9ca3af" fontSize={isMobile ? 10 : 12} tickLine={false} axisLine={false} width={isMobile ? 30 : 40} />
                    <RechartsTooltip 
                      labelFormatter={formatXAxis}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="activeUsers" name="Users" stroke="#0a6b5e" strokeWidth={3} dot={{ r: 4, fill: '#0a6b5e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.emptyState}>No traffic data available for this period.</div>
              )}
            </div>
          </div>

          {/* Tables Row */}
          <div style={{ ...styles.tablesGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '12px' : '24px' }}>
            {/* Top Pages */}
            <div style={{ ...styles.tableCard, padding: isMobile ? '14px 12px' : '24px' }}>
              <h4 style={{ ...styles.sectionTitle, fontSize: isMobile ? '13px' : '16px' }}>Top Pages</h4>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '0 0 8px' : '0 0 12px' }}>Page Path</th>
                      <th style={{...styles.th, textAlign: 'right', fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '0 0 8px' : '0 0 12px' }}>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages?.length > 0 ? topPages.map((page, i) => (
                      <tr key={i} style={styles.tr}>
                        <td style={{ ...styles.td, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '8px 0' : '12px 0', maxWidth: isMobile ? '140px' : '200px' }} title={page.title}>{page.path}</td>
                        <td style={{...styles.td, textAlign: 'right', fontWeight: 600, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '8px 0' : '12px 0'}}>{page.views}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="2" style={styles.emptyTd}>No page data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Devices & Countries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '24px' }}>
              <div style={{ ...styles.tableCard, padding: isMobile ? '14px 12px' : '24px' }}>
                <h4 style={{ ...styles.sectionTitle, fontSize: isMobile ? '13px' : '16px' }}>Top Countries</h4>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.th, fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '0 0 8px' : '0 0 12px' }}>Country</th>
                        <th style={{...styles.th, textAlign: 'right', fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '0 0 8px' : '0 0 12px'}}>Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countries?.length > 0 ? countries.map((country, i) => (
                        <tr key={i} style={styles.tr}>
                          <td style={{ ...styles.td, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '8px 0' : '12px 0', maxWidth: isMobile ? '140px' : '200px' }}>{country.country}</td>
                          <td style={{...styles.td, textAlign: 'right', fontWeight: 600, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '8px 0' : '12px 0'}}>{country.users}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="2" style={styles.emptyTd}>No country data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ ...styles.tableCard, padding: isMobile ? '14px 12px' : '24px' }}>
                <h4 style={{ ...styles.sectionTitle, fontSize: isMobile ? '13px' : '16px' }}>Devices</h4>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.th, fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '0 0 8px' : '0 0 12px' }}>Device</th>
                        <th style={{...styles.th, textAlign: 'right', fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '0 0 8px' : '0 0 12px'}}>Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices?.length > 0 ? devices.map((device, i) => (
                        <tr key={i} style={styles.tr}>
                          <td style={{...styles.td, textTransform: 'capitalize', fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '8px 0' : '12px 0', maxWidth: isMobile ? '140px' : '200px'}}>{device.device}</td>
                          <td style={{...styles.td, textAlign: 'right', fontWeight: 600, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '8px 0' : '12px 0'}}>{device.users}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="2" style={styles.emptyTd}>No device data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '40px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0d0d0d',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  select: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    background: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  card: {
    borderRadius: '14px',
    padding: '20px 24px',
    border: 'none',
    boxShadow: 'none',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: '0 0 8px',
  },
  cardValue: {
    fontSize: '36px',
    fontWeight: 700,
    margin: 0,
  },
  chartContainer: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #f3f4f6',
    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 20px',
  },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  tableCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #f3f4f6',
    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
    flex: 1,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#9ca3af',
    borderBottom: '1px solid #f3f4f6',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '12px 0',
    fontSize: '14px',
    color: '#374151',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  },
  emptyTd: {
    padding: '24px 0',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    color: '#6b7280',
    fontSize: '14px',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #f3f4f6',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9ca3af',
    fontSize: '14px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f4f6',
    borderTopColor: '#0a6b5e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  }
};
