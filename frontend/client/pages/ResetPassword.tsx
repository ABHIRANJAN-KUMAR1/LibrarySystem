import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    code: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({
        email,
        code: formData.code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Enter the 6-digit code and your new password.
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1 block">Reset Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-600 placeholder-slate-500 text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold tracking-widest"
                placeholder="000000"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1 block">New Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-600 placeholder-slate-500 text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                value={formData.new_password}
                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1 block">Confirm Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-600 placeholder-slate-500 text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              />
            </div>
          </div>

          {message && (
            <div className="text-green-400 text-sm text-center bg-green-400/10 py-2 rounded-lg border border-green-400/20">
              {message}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
