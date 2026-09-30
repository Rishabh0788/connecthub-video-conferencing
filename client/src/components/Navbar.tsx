import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="site-nav">
      <div className="max-w-7xl mx-auto px-5 h-[72px] flex items-center justify-between">
        <Link to="/" className="brand-link">
          <span className="brand-mark"><Video size={18} /></span>
          <span>ConnectHub</span>
        </Link>

        {!user ? (
          <>
            <nav className="hidden md:flex items-center gap-7 text-sm text-slate-400">
              <a href="/#features">Features</a>
              <a href="/#how-it-works">How it works</a>
              <a href="/#security">Security</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link className="nav-signin hidden sm:inline-flex" to="/login">Sign in</Link>
              <Link className="btn-primary" to="/register">Get started <span className="hidden sm:inline">→</span></Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link className="nav-dashboard hidden sm:inline-flex" to="/dashboard">Dashboard</Link>
            <span className="hidden md:block text-sm text-slate-300">{user.name}</span>
            <button
              onClick={async () => { await logout(); nav('/'); }}
              className="btn-secondary"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
