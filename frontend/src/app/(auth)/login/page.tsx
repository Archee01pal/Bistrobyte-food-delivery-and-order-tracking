'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/login', { email, password });

      localStorage.setItem('accessToken', res.data.accessToken || res.data.token);
      const userData = res.data.user || { email };
      localStorage.setItem('user', JSON.stringify(userData));

      if (setUser) setUser(userData);

      router.push('/checkout');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-amber-100 via-teal-50 to-sky-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none" />

      {/* Main Form Container with Distinct Amber Border */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border-2 border-amber-400/80 p-8 rounded-3xl shadow-2xl relative z-10 hover:border-amber-500 hover:shadow-amber-500/20 transition-all duration-300">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-gradient-to-tr from-amber-400 to-amber-500 text-white rounded-2xl shadow-md mb-2">
            🍕
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Login</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Sign in to continue to checkout and manage your orders
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold rounded-2xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

          {/* Button with Bright White Text */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-medium text-slate-600 border-t border-slate-200/80 pt-4">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-bold text-amber-600 hover:text-teal-600 hover:underline transition-colors"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}