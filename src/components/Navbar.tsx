import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Tv, Smartphone, LayoutDashboard, MonitorPlay, Zap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Host Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Guest Spray Pad', path: '/spray/kt-2026', icon: Smartphone },
    { label: 'TV Projector Wall', path: '/wall/kt-2026', icon: Tv },
    { label: 'Split Demo Mode', path: '/demo', icon: MonitorPlay, badge: '90s PITCH' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-obsidian-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-[1.5px] shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all">
            <div className="w-full h-full bg-obsidian-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-gold-400 fill-gold-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-wider text-white font-display">
                p-zeh
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold-500/20 text-gold-400 font-extrabold border border-gold-500/40 uppercase">
                Owambe
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight">
              Digital Money Spraying
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/90 border border-white/5 p-1 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/' && (location.pathname === '' || location.pathname === '/host'));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'text-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 shadow-md shadow-gold-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-tighter ${
                    isActive ? 'bg-black text-gold-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Status Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pollar Stellar Testnet</span>
          </div>

          <Link
            to="/demo"
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gold-500 text-black shadow-md shadow-gold-500/30"
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            Demo Mode
          </Link>
        </div>
      </div>
    </header>
  );
};

