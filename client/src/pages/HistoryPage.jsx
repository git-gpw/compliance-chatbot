import { useState } from 'react';
import { format } from 'date-fns';
import { useConversations } from '../hooks/useConversations';
import MessageBubble from '../components/MessageBubble';
import './HistoryPage.css';

function confidenceClass(score) {
  if (score === null || score === undefined) return 'badge-info';
  if (score >= 0.75) return 'badge-success';
  if (score >= 0.5)  return 'badge-warning';
  return 'badge-danger';
}

export default function HistoryPage({ password }) {
  const { sessions, loading, sessionDetail, detailLoading, loadSession, activeSession, refresh } =
    useConversations(password);
  const [search, setSearch] = useState('');

  const filtered = sessions.filter((s) =>
    !search || s.id.includes(search) || (s.topIntent || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="history-page">
      {/* Left panel */}
      <div className="history-sidebar">
        <div className="history-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="history-sidebar-title">Conversations</span>
            <button className="refresh-btn" onClick={refresh} title="Refresh">↻ Refresh</button>
          </div>
          <div className="history-search">
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>🔍</span>
            <input
              className="history-search-input"
              placeholder="Search sessions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="history-list">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="history-empty">
              <span className="history-empty-icon">🕐</span>
              <span>No conversations yet.<br />Start chatting to see history here.</span>
            </div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                className={`session-card${activeSession === s.id ? ' active' : ''}`}
                onClick={() => loadSession(s.id)}
              >
                <div className="session-card-top">
                  <span className="session-card-date">
                    {format(new Date(s.createdAt), 'MMM d, yyyy · HH:mm')}
                  </span>
                  {s.avgConfidence !== null && (
                    <span className={`session-card-conf ${confidenceClass(s.avgConfidence)}`}>
                      {Math.round(s.avgConfidence * 100)}%
                    </span>
                  )}
                </div>
                <div className="session-card-meta">
                  <span>{s.messageCount} messages</span>
                  {s.topIntent && (
                    <span className="session-card-intent" title={s.topIntent}>{s.topIntent}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="history-viewer">
        {sessionDetail ? (
          <>
            <div className="viewer-header">
              <div className="viewer-header-info">
                <span className="viewer-header-title">Session Replay</span>
                <div className="viewer-header-meta">
                  <span>📅 {format(new Date(sessionDetail.createdAt), 'MMMM d, yyyy · HH:mm')}</span>
                  <span>💬 {sessionDetail.messages.length} messages</span>
                  <span>🔑 <code style={{ fontSize: 10 }}>{sessionDetail.id.slice(0, 8)}…</code></span>
                </div>
              </div>
            </div>
            <div className="viewer-body">
              {detailLoading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : (
                sessionDetail.messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="viewer-placeholder">
            <span className="viewer-placeholder-icon">👈</span>
            <span>Select a conversation to view it</span>
          </div>
        )}
      </div>
    </div>
  );
}
