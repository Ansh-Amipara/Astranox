import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/features/auth/store';
import { Loader2 } from 'lucide-react';

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
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-start sm:pt-24 justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Premium Animated Gradient Background */}
      <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[50%] animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-blue-600/20 blur-[120px]"></div>
      <div className="absolute -bottom-[20%] -right-[10%] h-[70%] w-[50%] animate-[pulse_8s_ease-in-out_infinite_reverse] rounded-full bg-purple-600/20 blur-[120px]"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md min-h-screen sm:min-h-0 rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Astranox
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-4 py-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-4 py-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-70 disabled:hover:scale-100"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                'Initialize Session'
              )}
            </span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          New trainer?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export const LoginForm = Login;

