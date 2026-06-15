import { useState, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import LoginGate from './components/LoginGate';
import Sidebar from './components/Sidebar';
import AppRouter from './router';
import './App.css';

export default function App() {
  const [password, setPassword] = useState(null);

  const handleLogout = useCallback(() => setPassword(null), []);

  if (!password) {
    return (
      <div className="login-page">
        <LoginGate onLogin={setPassword} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar onLogout={handleLogout} />
        <main className="app-main">
          <AppRouter password={password} onUnauthorized={handleLogout} />
        </main>
      </div>
    </BrowserRouter>
  );
}
