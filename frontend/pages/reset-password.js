import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { getPublicApiBaseUrl, apiNetworkErrorMessage } from '../lib/apiBase';

export default function ResetPassword() {
  const router = useRouter();
  const { token: tokenQuery } = router.query;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof tokenQuery === 'string') {
      setToken(tokenQuery);
    }
  }, [tokenQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!token) {
      setError('Missing reset token. Open the link from your email again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getPublicApiBaseUrl()}/api/v1/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setError('Invalid response from server');
        return;
      }
      if (!res.ok) {
        const d = data?.detail;
        setError(typeof d === 'string' ? d : 'Could not reset password');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(apiNetworkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Set new password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Choose a strong password for your account.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-gray-900">
          {!router.isReady ? (
            <p className="text-sm text-gray-600 text-center">Loading…</p>
          ) : !token ? (
            <div className="space-y-4 text-center">
              <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                Invalid or missing reset link.
              </div>
              <Link href="/forgot-password" className="text-blue-600 font-medium hover:text-blue-500">
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div className="flex gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium">Password updated</p>
                <p className="mt-1">Redirecting to sign in…</p>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Update password'}
              </button>
              <Link href="/login" className="block text-center text-sm font-medium text-blue-600 hover:text-blue-500">
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
