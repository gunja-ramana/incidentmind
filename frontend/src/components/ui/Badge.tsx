import React from 'react';
import { Severity, IncidentStatus } from '../../types/incident';

interface SeverityBadgeProps {
  severity: Severity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const styles: Record<Severity, string> = {
    'SEV-1': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'SEV-2': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'SEV-3': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    'SEV-4': 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${styles[severity]}`}
    >
      {severity}
    </span>
  );
};

interface StatusBadgeProps {
  status: IncidentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<IncidentStatus, string> = {
    Active: 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse',
    Investigating: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    Mitigated: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Resolved' ? 'bg-emerald-400' : status === 'Active' ? 'bg-rose-400' : 'bg-cyan-400'}`} />
      {status}
    </span>
  );
};

interface MemorySourceBadgeProps {
  source: 'Demo Memory' | 'Hindsight Memory';
}

export const MemorySourceBadge: React.FC<MemorySourceBadgeProps> = ({ source }) => {
  const isHindsight = source === 'Hindsight Memory';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-wide font-medium border ${
        isHindsight
          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isHindsight ? 'bg-purple-400' : 'bg-sky-400'}`} />
      {source}
    </span>
  );
};
