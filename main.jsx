import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AdminPanel from './AdminPanel';
import PublicRates from './PublicRates';
import { AuthProvider, useAuth } from './AuthProvider';
import Login from './Login';
import { useDarkMode } from './darkMode';
import { registerServiceWorker } from './registerServiceWorker';
import InstallPrompt from './InstallPrompt';

registerServiceWorker();

function DarkModeToggle() {
  const [dark, setDark] = useDarkMode();
  return (
    <button
      className="ml-2 px-3 py-1 rounded border bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
      onClick={() => setDark(d => !d)}
      aria-label="Toggle dark mode"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

function App() {
  const { user, loading } = useAuth();
  return (
    <div className="p-4 min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <InstallPrompt />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">FOREX Rates App</h1>
        <DarkModeToggle />
      </div>
      <PublicRates />
      {loading ? null : user ? <AdminPanel /> : <Login />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
); 