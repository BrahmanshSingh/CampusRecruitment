import React from 'react';
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

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'ORACLE DASHBOARD', path: '/dashboard', icon: Activity },
    { name: 'TARGETS FEED', path: '/targets', icon: Target },
    { name: 'ASSESSMENT ARENA', path: '/arena', icon: Terminal },
  ];

  return (
    <aside className="w-64 bg-[#090C13] border-r border-[#1B2232] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1B2232]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#060709] border border-[#FCE205] flex items-center justify-center glow-gold">
              <Shield className="w-5 h-5 text-[#FCE205]" />
            </div>
            <div>
              <div className="font-display font-bold tracking-wider text-base text-white flex items-center gap-2">
                PLACE<span className="text-[#FCE205]">ORACLE</span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">
                v2.4 // PROTOCOL
              </div>
            </div>
          </div>
          
          <div className="mt-3 px-2 py-1 bg-[#111624] border border-[#1E2638] rounded text-[11px] font-mono flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse"></span>
              SYS: ONLINE
            </span>
            <span className="text-[#FCE205]">NET-99</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 tracking-widest px-3 py-1 uppercase">
            OPERATIVE INTERFACE
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

        {/* Tactical Telemetry Badge */}
        <div className="px-4 py-3 mx-4 mt-4 bg-[#06080E] border border-[#1C2335] rounded-sm">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5 text-[#00F0FF]" />
              SYBIL SENTINEL
            </span>
            <span className="text-[#00FF9D] font-semibold">CLEAN</span>
          </div>
          <div className="w-full bg-[#131826] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00FF9D] h-full w-full"></div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-500">
            Hash: 0x8f4c...30ea verified
          </div>
        </div>
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
          <LogOut className="w-3.5 h-3.5 text-[#FF334B]" />
          TERMINATE SESSION
        </button>
      </div>
    </aside>
  );
}
