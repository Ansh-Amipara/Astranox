import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '@/shared/api/api-client';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const from = searchParams?.get('from') || '/team';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { accessToken, user } = response.data.data;

      setAuth(accessToken, user);
      navigate(from);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-dark transition-colors duration-500">
      {/* Ink & Silt Ambient Glow */}
      <div className="absolute top-[10%] -left-[10%] h-[70%] w-[50%] animate-pulse-slow rounded-full bg-silt-khaki/10 blur-[120px]"></div>
      <div className="absolute bottom-[10%] -right-[10%] h-[70%] w-[50%] animate-pulse-slow rounded-full bg-ink-blue/10 blur-[120px]" style={{ animationDelay: '1.5s' }}></div>

      {/* Glassmorphism Card */}
      <Card variant="glass" padding="lg" className="relative z-10 w-full max-w-md animate-float">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-silt-gold drop-shadow-sm">
            ASTRANOX
          </h1>
          <p className="mt-2 text-ink-light text-sm tracking-wide">Enter the coordinates</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-light">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-ink-light/20 bg-ink-dark/50 px-4 py-3 text-ink-paper placeholder-ink-light/50 transition-all focus:border-silt-gold focus:outline-none focus:ring-1 focus:ring-silt-gold"
              placeholder="Trainer Name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-light">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink-light/20 bg-ink-dark/50 px-4 py-3 text-ink-paper placeholder-ink-light/50 transition-all focus:border-silt-gold focus:outline-none focus:ring-1 focus:ring-silt-gold"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4 uppercase tracking-widest"
            isLoading={isLoading}
          >
            Initialize Session
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-ink-light">
          New to the frontier?{' '}
          <Link 
            to="/register" 
            className="text-silt-peach hover:text-silt-gold hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
