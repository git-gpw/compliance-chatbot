import { useDashboard } from '../hooks/useDashboard';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import './DashboardPage.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
);

const CHART_COLORS = [
  '#6366f1','#8b5cf6','#38bdf8','#10d97e',
  '#f59e0b','#ef4444','#a78bfa','#34d399',
];

function StatCard({ icon, iconClass, value, label, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${iconClass}`}>{icon}</div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value ?? '—'}</span>
        <span className="stat-card-label">{label}</span>
        {sub && <span className="stat-card-trend">{sub}</span>}
      </div>
    </div>
  );
}

export default function DashboardPage({ password }) {
  const { data, loading, refresh } = useDashboard(password);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner" /> Loading analytics…
        </div>
      </div>
    );
  }

  const hasData = data && data.totalSessions > 0;

  // Confidence trend chart
  const trendLabels = (data?.confidenceTrend || []).map((d) =>
    format(new Date(d.date + 'T00:00:00'), 'MMM d')
  );
  const trendValues = (data?.confidenceTrend || []).map((d) =>
    parseFloat((d.avgConfidence * 100).toFixed(1))
  );

  const lineData = {
    labels: trendLabels,
    datasets: [{
      label: 'Avg Confidence %',
      data: trendValues,
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#141928',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f0f2ff',
        bodyColor: '#8892b0',
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}% confidence`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#4a5568', font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#4a5568',
          font: { size: 11 },
          callback: (v) => `${v}%`,
        },
      },
    },
  };

  // Intent pie chart
  const topIntents = (data?.intentDistribution || []).slice(0, 8);
  const pieData = {
    labels: topIntents.map((i) => i.intent),
    datasets: [{
      data: topIntents.map((i) => i.count),
      backgroundColor: CHART_COLORS,
      borderColor: '#0e1320',
      borderWidth: 2,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8892b0',
          font: { size: 11 },
          padding: 12,
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#141928',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f0f2ff',
        bodyColor: '#8892b0',
      },
    },
  };

  const maxIntentCount = topIntents[0]?.count || 1;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Analytics Dashboard</div>
          <div className="dashboard-subtitle">Compliance chatbot performance &amp; insights</div>
        </div>
        <button className="refresh-btn" onClick={refresh}>↻ Refresh</button>
      </div>

      {!hasData && (
        <div className="no-data-banner">
          <span style={{ fontSize: 24 }}>💡</span>
          <span>
            <strong>No data yet.</strong> Start conversations in the Chat tab — analytics will populate here automatically.
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-cards">
        <StatCard
          icon="💬" iconClass="purple"
          value={data?.totalSessions ?? 0}
          label="Total Sessions"
        />
        <StatCard
          icon="📨" iconClass="blue"
          value={data?.totalMessages ?? 0}
          label="Total Messages"
        />
        <StatCard
          icon="🎯" iconClass="green"
          value={data?.avgConfidence !== null ? `${Math.round((data.avgConfidence || 0) * 100)}%` : '—'}
          label="Avg Confidence"
          sub={data?.avgConfidence >= 0.75 ? '↑ High accuracy' : data?.avgConfidence >= 0.5 ? '~ Medium accuracy' : null}
        />
        <StatCard
          icon="📅" iconClass="amber"
          value={data?.activeTodaySessions ?? 0}
          label="Active Today"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Confidence Trend */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Confidence Trend</div>
              <div className="chart-card-sub">Average response confidence over time</div>
            </div>
          </div>
          {trendLabels.length > 0 ? (
            <div className="chart-wrap">
              <Line data={lineData} options={lineOptions} />
            </div>
          ) : (
            <div className="chart-empty">
              <span style={{ fontSize: 32, opacity: 0.3 }}>📈</span>
              <span>No trend data yet</span>
            </div>
          )}
        </div>

        {/* Intent Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Intent Distribution</div>
              <div className="chart-card-sub">Top matched intents</div>
            </div>
          </div>
          {topIntents.length > 0 ? (
            <div className="chart-wrap">
              <Pie data={pieData} options={pieOptions} />
            </div>
          ) : (
            <div className="chart-empty">
              <span style={{ fontSize: 32, opacity: 0.3 }}>🥧</span>
              <span>No intent data yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Intent Table */}
      {topIntents.length > 0 && (
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Intent Breakdown</div>
              <div className="chart-card-sub">Frequency of each matched intent</div>
            </div>
          </div>
          <table className="intent-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Intent Name</th>
                <th>Frequency</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {topIntents.map((item, i) => (
                <tr key={item.intent}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                  <td>{item.intent}</td>
                  <td>
                    <span className="badge badge-accent">{item.count} hits</span>
                  </td>
                  <td>
                    <div className="intent-bar-wrap">
                      <div
                        className="intent-bar"
                        style={{ width: `${(item.count / maxIntentCount) * 120}px` }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {Math.round((item.count / (data?.totalMessages || 1)) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
