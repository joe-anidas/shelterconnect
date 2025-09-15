import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('sc_is_admin') === 'true';
    if (isAdmin) {
      navigate('/dashboard');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Password policy: >=8 chars, at least 1 lowercase, 1 uppercase, 2 digits, 1 special
    const passwordPolicy = /^(?=(?:.*\d){2,})(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    const isUser = username.trim().toLowerCase() === 'admin';
    const isCorrectPassword = password === 'Admin@123';
    const meetsPolicy = passwordPolicy.test(password);

    if (isUser && isCorrectPassword && meetsPolicy) {
      localStorage.setItem('sc_is_admin', 'true');
      // Notify app immediately in this tab
      try {
        window.dispatchEvent(new Event('sc_admin_change'));
      } catch {}
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Password must be at least 8 chars, include 1 uppercase, 1 lowercase, 2 digits, and 1 special character. Expected password: Admin@123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Login</h1>
        <p className="text-sm text-slate-600 mb-4">Access the coordinator dashboard.</p>
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}


