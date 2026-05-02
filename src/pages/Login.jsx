import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (login(username, password)) {
        navigate('/');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-primary">
            SALE<span className="text-white">X</span>
          </h1>
          <p className="text-text-secondary text-sm uppercase tracking-widest font-medium">Performance Management System</p>
        </div>

        <div className="card-secondary p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
              <LogIn size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sign In</h2>
              <p className="text-xs text-text-secondary">Enter your credentials to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="input-field w-full pl-10"
                  placeholder="admin or rep"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="input-field w-full pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 p-3 flex items-center gap-2 text-danger text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Sign Into Dashboard</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold">
              <span>Admin: admin / admin123</span>
              <span>Rep: rep / rep123</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600 font-medium">
          &copy; 2024 SALEX Dashboard System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// Simple Chevron for the button
const ChevronRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Login;
