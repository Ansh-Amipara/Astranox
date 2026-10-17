import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import { Loader2 } from 'lucide-react';

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
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-start sm:pt-24 justify-center overflow-hidden bg-black text-white">
      {/* Monochrome Glass Card */}
      <div className="relative z-10 w-full max-w-md min-h-screen sm:min-h-0 rounded-none sm:rounded-2xl border-0 sm:border border-neutral-800 bg-neutral-950 p-8 shadow-2xl">
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/logo.webp" alt="Astranox" className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
          <h1 className="text-4xl font-black tracking-tight text-white">
            Join Astranox
          </h1>
          <p className="text-xs uppercase font-bold tracking-widest text-neutral-400 mt-2">Register a new trainer account</p>
        </div>

        {success ? (
          <div className="rounded-xl bg-neutral-900 p-4 text-center border border-neutral-700">
            <h3 className="text-lg font-bold text-white">Registration Successful!</h3>
            <p className="mt-2 text-sm text-neutral-400">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 transition-all focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="AshKetchum"
                required
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 transition-all focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="ash@pallet.town"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 transition-all focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-neutral-900 p-3 text-sm text-neutral-200 border border-neutral-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-black transition-all hover:bg-neutral-200 hover:scale-[1.01] border border-white shadow-glow disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                ) : (
                  'Register Account'
                )}
              </span>
            </button>
            
            <p className="mt-6 text-center text-sm text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-bold hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export const RegisterForm = Register;

