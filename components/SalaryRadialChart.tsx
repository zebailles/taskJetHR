
import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SalaryResult } from '../types';
import { formatCurrency } from '../utils/formatter';

interface SalaryRadialChartProps {
  data: SalaryResult;
}

export const SalaryRadialChart: React.FC<SalaryRadialChartProps> = ({ data }) => {
  // We map the data so the largest value (Company Cost) is the outer ring (100% of the domain)
  // and the others are relative to it.
  const chartData = [
    {
      name: 'Netto',
      value: data.annualNet,
      fill: '#d4e845', // Jet HR Lime
    },
    {
      name: 'RAL',
      value: data.ral,
      fill: '#9CA3AF', // Gray 400
    },
    {
      name: 'Costo Azienda',
      value: data.companyTotalCost,
      fill: '#1a1a1a', // Black
    },
  ];

  // Reverse so the largest is rendered first (outer) in RadialBarChart default stacking behavior usually, 
  // but for radial bars we often want them distinct. 
  // Let's configure it to look like activity rings.
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50 text-sm">
          <span className="block font-bold uppercase text-[10px] text-gray-500">{payload[0].payload.name}</span>
          <span className="font-bold text-jet-black">{formatCurrency(payload[0].value)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative flex flex-col justify-center items-center">
      <h3 className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Efficienza Salariale</h3>
      
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            innerRadius="30%" 
            outerRadius="100%" 
            barSize={20} 
            data={chartData}
            startAngle={90} 
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, data.companyTotalCost * 1.1]} tick={false} />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
              label={false}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 items-end text-[10px] font-medium">
         <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Costo</span>
            <div className="w-2 h-2 rounded-full bg-jet-black"></div>
         </div>
         <div className="flex items-center gap-1.5">
            <span className="text-gray-500">RAL</span>
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
         </div>
         <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Netto</span>
            <div className="w-2 h-2 rounded-full bg-jet-lime"></div>
         </div>
      </div>
    </div>
  );
};
