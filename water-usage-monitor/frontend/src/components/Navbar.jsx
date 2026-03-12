import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function Navbar() {
  const { user, profile, supabase } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="backdrop-blur-xl bg-slate-900/60 border-b border-sky-500/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 shadow-glass">
            <span className="text-xl">💧</span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-sky-100">
              AquaPulse
            </div>
            <div className="text-xs text-sky-300/80">
              Smart Water Usage Monitor
            </div>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-3 text-xs font-medium text-sky-100/80 sm:flex">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 transition ${
                    isActive
                      ? 'bg-sky-500/80 text-slate-950 shadow-glass'
                      : 'hover:bg-slate-800/80 hover:text-sky-100'
                  }`
                }
              >
                Dashboard
              </NavLink>
              {profile?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1 transition ${
                      isActive
                        ? 'bg-sky-500/80 text-slate-950 shadow-glass'
                        : 'hover:bg-slate-800/80 hover:text-sky-100'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
            </nav>

            <div className="flex items-center gap-3 rounded-full bg-slate-900/60 px-3 py-1 text-xs text-sky-100/80 ring-1 ring-sky-500/20">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-[11px] font-semibold text-slate-950 shadow-glass">
                {(profile?.name || profile?.email || 'U')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="max-w-[10rem] truncate font-medium">
                  {profile?.name || 'User'}
                </span>
                <span className="text-[10px] text-sky-300/80">
                  {profile?.role === 'admin' ? 'Admin' : 'Standard user'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 rounded-full border border-sky-500/40 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-100 shadow-sm transition hover:border-sky-300/70 hover:bg-sky-500/90 hover:text-slate-950"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

