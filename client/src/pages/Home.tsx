import { useAuthStore } from '../store/auth.store';

export function Home() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Astranox Terminal
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Welcome, <span className="font-semibold text-slate-200">{user?.username}</span>
          </span>
          <button 
            onClick={logout}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Phase 3: PokeAPI Data Complete</h2>
          <p className="text-slate-400">
            You have successfully bypassed the Auth Guard and entered the protected dashboard! 
            Your session is securely persisted via the HTTP-only refresh cookie.
          </p>
        </div>
      </main>
    </div>
  );
}
