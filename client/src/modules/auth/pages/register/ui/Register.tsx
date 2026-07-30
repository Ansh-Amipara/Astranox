import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/shared/api/api-client';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/register', { username, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-dark transition-colors duration-500">
      {/* Ink & Silt Ambient Glow */}
      <div className="absolute -top-[10%] -left-[10%] h-[70%] w-[50%] animate-pulse-slow rounded-full bg-silt-khaki/10 blur-[120px]"></div>
      <div className="absolute -bottom-[10%] -right-[10%] h-[70%] w-[50%] animate-pulse-slow rounded-full bg-ink-blue/10 blur-[120px]" style={{ animationDelay: '1.5s' }}></div>

      {/* Glassmorphism Card */}
      <Card variant="glass" padding="lg" className="relative z-10 w-full max-w-md animate-float">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-silt-gold drop-shadow-sm">
            ASTRANOX
          </h1>
          <p className="mt-2 text-ink-light text-sm tracking-wide">Register new coordinates</p>
        </div>

        {success ? (
          <div className="rounded-xl bg-emerald-500/10 p-6 text-center border border-emerald-500/20 shadow-inner">
            <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-widest">Initialization Complete</h3>
            <p className="mt-2 text-sm text-emerald-200/80">Establishing connection...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
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
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-light">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-light/20 bg-ink-dark/50 px-4 py-3 text-ink-paper placeholder-ink-light/50 transition-all focus:border-silt-gold focus:outline-none focus:ring-1 focus:ring-silt-gold"
                placeholder="email@system.core"
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
                minLength={6}
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
              Establish Link
            </Button>
            
            <p className="text-center text-sm font-medium text-ink-light pt-4 border-t border-ink-light/10 mt-6">
              Already connected?{' '}
              <Link to="/login" className="text-silt-peach hover:text-silt-gold hover:underline transition-colors">
                Initialize session
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
