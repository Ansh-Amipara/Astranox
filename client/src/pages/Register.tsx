import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

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
      await api.post('/auth/register', { username, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Premium Animated Gradient Background */}
      <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[50%] animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-blue-600/20 blur-[120px]"></div>
      <div className="absolute -bottom-[20%] -right-[10%] h-[70%] w-[50%] animate-[pulse_8s_ease-in-out_infinite_reverse] rounded-full bg-purple-600/20 blur-[120px]"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Join Astranox
          </h1>
          <p className="mt-2 text-sm text-slate-400">Register a new trainer account.</p>
        </div>

        {success ? (
          <div className="rounded-lg bg-green-500/10 p-4 text-center border border-green-500/20">
            <h3 className="text-lg font-medium text-green-400">Registration Successful!</h3>
            <p className="mt-2 text-sm text-green-300/80">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-slate-200 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="AshKetchum"
                required
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-slate-200 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="ash@pallet.town"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-slate-200 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
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
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Register Account'
                )}
              </span>
            </button>
            
            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
