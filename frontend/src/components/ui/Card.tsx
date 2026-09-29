import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false, ...props }) => {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg transition-all ${
        glow ? 'border-sky-500/40 shadow-sky-950/30' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
