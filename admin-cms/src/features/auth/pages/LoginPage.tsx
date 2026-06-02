import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import axiosInstance from '@/lib/axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@mma.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign in to Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // 2. Retrieve Firebase JWT Token
      const token = await userCredential.user.getIdToken();
      
      // 3. Store token in localStorage (so interceptor grabs it)
      localStorage.setItem('admin_token', token);

      // 4. Validate admin privileges via backend endpoint
      try {
        await axiosInstance.post('/auth/admin/login');
        // Success -> Redirect to dashboard
        navigate('/');
      } catch (err: any) {
        // Validation failed (e.g. 403 Forbidden - not an admin)
        localStorage.removeItem('admin_token');
        await signOut(auth);
        
        const message = err.response?.data?.message || 'Access Denied: You do not have administrator privileges.';
        setError(message);
        setLoading(false);
      }
    } catch (err: any) {
      // Firebase login failed
      const message = err.message || 'Failed to authenticate. Please check your credentials.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in to Admin</h2>
        <p className="mt-2 text-sm text-slate-600">Enter your credentials to access the panel</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 text-sm text-center py-2 px-3 rounded-md">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
