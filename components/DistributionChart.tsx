
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { SalaryResult } from '../types';
import { formatCurrency } from '../utils/formatter';

interface DistributionChartProps {
  data: SalaryResult;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  
  // Composition Data: How Cost is built up
  const compositionData = [
    {
      name: 'Composizione Costo',
      Netto: data.annualNet,
      TasseDipendente: data.employeeTotalTax,
      TasseAzienda: data.companyTotalCost - data.ral,
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50 text-sm">
          {payload.map((entry: any, index: number) => (
             <div key={index} className="mb-1 last:mb-0">
                <span className="block text-[10px] font-bold uppercase text-gray-400" style={{ color: entry.color }}>
                    {entry.name === 'TasseDipendente' ? 'Tasse Dipendente' : entry.name === 'TasseAzienda' ? 'Tasse Azienda' : entry.name}
                </span>
                <span className="font-bold text-jet-black">
                    {formatCurrency(entry.value)}
                </span>
             </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="block text-[10px] font-bold uppercase text-gray-500">Totale Costo</span>
            <span className="font-bold text-jet-black">{formatCurrency(data.companyTotalCost)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Composizione Costo Azienda</h3>
          <div className="text-right">
             <span className="text-2xl font-bold text-jet-black">{formatCurrency(data.companyTotalCost)}</span>
          </div>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={compositionData}
            layout="vertical"
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            barSize={40}
          >
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Bar dataKey="Netto" stackId="a" fill="#d4e845" radius={[4, 0, 0, 4]} />
            <Bar dataKey="TasseDipendente" stackId="a" fill="#9CA3AF" />
            <Bar dataKey="TasseAzienda" stackId="a" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-4 justify-center text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-jet-lime"></div>
            Netto
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-400"></div>
            Tasse Dip.
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-jet-black"></div>
            Tasse Az.
        </div>
      </div>
    </div>
  );
};
