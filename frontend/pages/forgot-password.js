import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { getPublicApiBaseUrl, apiNetworkErrorMessage } from '../lib/apiBase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDevLink('');

    try {
      const res = await fetch(`${getPublicApiBaseUrl()}/api/v1/auth/password/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setError('Invalid response from server');
        return;
      }
      if (!res.ok) {
        setError(typeof data?.detail === 'string' ? data.detail : 'Request failed');
        return;
      }
      setDone(true);
      if (data.dev_reset_link) {
        setDevLink(data.dev_reset_link);
      }
    } catch (err) {
      setError(apiNetworkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we will send you a link to choose a new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-gray-900">
          {done ? (
            <div className="space-y-4">
              <div className="flex gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Check your inbox</p>
                  <p className="mt-1 text-emerald-900/90">
                    If an account exists for <strong>{email}</strong>, you will receive an email with a reset link
                    (valid for 1 hour).
                  </p>
                </div>
              </div>
              {devLink && (
                <div className="text-sm border border-amber-200 bg-amber-50 text-amber-950 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">Development mode (SMTP not configured)</p>
                  <p>Use this link to reset:</p>
                  <a href={devLink} className="text-blue-700 break-all underline font-medium">
                    {devLink}
                  </a>
                </div>
              )}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <Link
                href="/login"
                className="flex justify-center items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
