'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      login(data);
      router.push('/restaurants');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">Sign In</h1>
      {error && <p className="bg-red-100 text-red-600 p-2 text-sm rounded mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            required
            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-amber-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Password</label>
          <input
            type="password"
            required
            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-amber-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 font-bold rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}