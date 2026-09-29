import React from 'react';
import {
  Activity,
  PlusCircle,
  History,
  Brain,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { MemorySourceBadge } from '../ui/Badge';

export type PageView = 'dashboard' | 'new-incident' | 'analysis' | 'history' | 'memory' | 'runbooks';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  memorySource?: 'Demo Memory' | 'Hindsight Memory';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  memorySource = 'Demo Memory'
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'new-incident', label: 'New Incident', icon: PlusCircle },
    { id: 'history', label: 'Incident History', icon: History },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'runbooks', label: 'Runbooks', icon: BookOpen }
  ] as const;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 via-purple-600 to-sky-500 p-0.5 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight">INCIDENTMIND</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:block">
                AI Incident Response Agent
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'new-incident' && currentView === 'analysis');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as PageView)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Memory Source Indicator */}
          <div className="flex items-center gap-2">
            <MemorySourceBadge source={memorySource} />
          </div>
        </div>
      </div>
    </nav>
  );
};
