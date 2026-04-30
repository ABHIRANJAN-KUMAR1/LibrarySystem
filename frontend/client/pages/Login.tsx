import { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaData, setCaptchaData] = useState<{ captcha_id: string; question: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = async () => {
    try {
      const res = await authAPI.getCaptcha();
      setCaptchaData(res.data);
      setCaptchaAnswer('');
    } catch (err) {
      console.error('Failed to load captcha', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, captchaData?.captcha_id, captchaAnswer);
      toast.success('Welcome back!');
      const from = (location.state?.from?.pathname as string) || '/';
      navigate(from);
    } catch (error: any) {
      const message = error.response?.data?.captcha || error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
      refreshCaptcha(); // Refresh on failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">EduLib</h1>
          <p className="text-muted-foreground text-sm">Digital Education Resource Library</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
            </div>

            {captchaData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Security Verification</label>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-[10px] uppercase font-bold text-primary hover:underline"
                  >
                    Refresh
                  </button>
                </div>
                <div className="flex gap-4 items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                  <span className={`font-bold text-primary flex-1 tracking-widest ${(captchaData as any).type === 'string' ? 'font-mono text-xl' : ''}`}>
                    {captchaData.question}
                  </span>
                </div>
                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Enter answer"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background uppercase"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" size="sm" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign up here
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
}
