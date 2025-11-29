import React from 'react';
import { formatCurrency } from '../utils/formatter';

interface ResultCardProps {
  label: string;
  value: number;
  subtext?: string;
  theme?: 'dark' | 'light' | 'lime';
  trend?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ label, value, subtext, theme = 'light', trend }) => {
  const getThemeClasses = () => {
    switch(theme) {
        case 'dark': return 'bg-jet-black text-white border-jet-black';
        case 'lime': return 'bg-jet-lime text-jet-black border-jet-lime';
        default: return 'bg-white text-jet-black border-gray-200';
    }
  }

  return (
    <div className={`
      relative overflow-hidden rounded-xl p-5 border shadow-sm transition-all
      ${getThemeClasses()}
    `}>
      <div className="relative z-10">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70`}>
          {label}
        </p>
        <h3 className="text-3xl font-bold tracking-tight">
          {formatCurrency(value)}
        </h3>
        {subtext && (
            <div className="mt-2 flex items-center justify-between">
                <p className="text-xs font-medium opacity-80">{subtext}</p>
                {trend && <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-current">{trend}</span>}
            </div>
        )}
      </div>
    </div>
  );
};