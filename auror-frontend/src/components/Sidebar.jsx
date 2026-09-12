import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Target, 
  Terminal, 
  Activity, 
  LogOut, 
  Cpu, 
  Fingerprint, 
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        await api.health.check();
        if (mounted) setIsOnline(true);
      } catch (err) {
        if (mounted) setIsOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Job Board', path: '/targets', icon: Target },
    { name: 'Assessment Arena', path: '/arena', icon: Terminal },
  ];

  return (
    <aside className="w-64 bg-[#090C13] border-r border-[#1B2232] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1B2232]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#060709] border border-[#3b82f6] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <div className="font-display font-bold tracking-wider text-base text-white flex items-center gap-2">
                AUROR
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#3b82f6] uppercase">
                DEVELOPER PORTAL
              </div>
            </div>
          </div>
          
          <div className="mt-3 px-2 py-1 bg-[#111624] border border-[#1E2638] rounded text-[11px] font-mono flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></span>
              System: {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 tracking-widest px-3 py-1 uppercase">
            NAVIGATION
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-[#161C2C] text-[#FCE205] border-l-2 border-[#FCE205] shadow-[inset_0_0_15px_rgba(252,226,5,0.08)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111522]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>


      </div>

      {/* Operative Footer */}
      <div className="p-4 border-t border-[#1B2232] bg-[#07090F]">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120"}
            alt="Operative Avatar"
            className="w-9 h-9 rounded-sm border border-[#27324B] object-cover"
          />
          <div className="overflow-hidden">
            <div className="font-mono text-xs font-semibold text-slate-200 truncate">
              {user?.name || "Puranjay Sharma"}
            </div>
            <div className="font-mono text-[10px] text-[#FCE205] truncate">
              TEAM: {user?.team || "Jacked Nerds"}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#111624] hover:bg-[#1B2338] border border-[#1E273D] text-slate-300 hover:text-white rounded-sm font-mono text-[11px] tracking-wider transition-all"
        >
          <LogOut className="w-3.5 h-3.5 text-[#ef4444]" />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
