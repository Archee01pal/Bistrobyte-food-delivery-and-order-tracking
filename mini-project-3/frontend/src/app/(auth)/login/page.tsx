'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/login', { email, password });

      // Save token and user details
      localStorage.setItem('accessToken', res.data.accessToken || res.data.token);
      const userData = res.data.user || { email };
      localStorage.setItem('user', JSON.stringify(userData));

      // Update context state immediately
      if (setUser) setUser(userData);

      router.push('/checkout');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Login failed. Check credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-slate-800"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 rounded transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}