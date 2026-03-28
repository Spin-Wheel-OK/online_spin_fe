import { FormEvent, ReactNode, useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = 'spin-wheel-admin-auth';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || DEFAULT_USERNAME;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || DEFAULT_PASSWORD;

function isAuthenticated() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setAuthenticated(value: boolean) {
  try {
    if (value) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return;
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures and keep auth session in memory only.
  }
}

export function clearAdminAuth() {
  setAuthenticated(false);
}

interface AdminAuthProps {
  children: ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  // const hint = useMemo(
  //   () => `Use ${ADMIN_USERNAME} / ${ADMIN_PASSWORD} or set VITE_ADMIN_USERNAME and VITE_ADMIN_PASSWORD.`,
  //   []
  // );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthed(true);
      setError('');
      return;
    }

    setError('Invalid username or password.');
  };

  if (authed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_35%),linear-gradient(180deg,_#120d02_0%,_#050505_100%)] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-yellow-500/30 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-yellow-500/20">
          <p className="text-yellow-400/80 text-xs tracking-[0.35em] uppercase">Lucky Spin</p>
          <h1 className="mt-3 text-3xl font-bold text-yellow-300">Admin Login</h1>
          <p className="mt-2 text-sm text-yellow-100/70">
            Frontend-only access gate for the admin panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
          <div>
            <label htmlFor="admin-username" className="block text-sm text-yellow-100/80 mb-2">
              Username
            </label>
            <input
              id="admin-username"
              autoFocus
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-yellow-500/25 bg-yellow-50/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm text-yellow-100/80 mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-yellow-500/25 bg-yellow-50/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 py-3 font-semibold text-black transition hover:from-yellow-400 hover:to-amber-300"
          >
            Sign In
          </button>

          {/* <p className="text-xs leading-5 text-white/45">
            {hint}
          </p> */}
        </form>
      </div>
    </div>
  );
}
