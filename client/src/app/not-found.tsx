import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-400">404 - Not Found</h2>
        <p className="text-lg text-slate-500">The page you are looking for does not exist.</p>
        <div className="pt-4">
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-colors text-white inline-block">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
