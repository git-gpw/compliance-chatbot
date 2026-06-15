import { Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';

export default function AppRouter({ password, onUnauthorized }) {
  return (
    <Routes>
      <Route path="/" element={<ChatPage password={password} onUnauthorized={onUnauthorized} />} />
      <Route path="/history" element={<HistoryPage password={password} />} />
      <Route path="/dashboard" element={<DashboardPage password={password} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
