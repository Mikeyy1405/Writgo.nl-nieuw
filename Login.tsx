import React, { useState } from 'react';
import { login } from '../services/auth';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError('E-mail of wachtwoord is onjuist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-brand-500/20 rounded-full blur-[50px]"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg border border-slate-700">
             <i className="fas fa-user-lock"></i>
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Login</h2>
          <p className="text-slate-400 text-sm">Beheer de database van Writgo Media</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-slate-600"
              placeholder="info@writgo.nl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-wait text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Inloggen'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onCancel} className="text-slate-500 text-sm hover:text-white transition-colors">
            Terug naar home
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
          <p>Demo accounts:</p>
          <p>Email: info@writgo.nl | Wachtwoord: CM120309cm!!</p>
        </div>
      </div>
    </div>
  );
};