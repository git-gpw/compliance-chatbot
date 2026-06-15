import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../api/client';

export function useConversations(password) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/history', password);
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const loadSession = useCallback(async (sessionId) => {
    setActiveSession(sessionId);
    setDetailLoading(true);
    try {
      const data = await apiGet(`/api/history/${sessionId}`, password);
      setSessionDetail(data);
    } catch (err) {
      setSessionDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [password]);

  return { sessions, loading, error, activeSession, sessionDetail, detailLoading, loadSession, refresh: fetchSessions };
}
