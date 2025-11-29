
import React from 'react';
import { SalaryResult } from '../types';
import { formatCurrency } from '../utils/formatter';

interface DetailedTableProps {
  data: SalaryResult;
}

export const DetailedTable: React.FC<DetailedTableProps> = ({ data }) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Employee Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Busta Paga Dipendente</h3>
         </div>
         <div className="p-0">
            <Row label="Retribuzione Lorda (RAL)" value={data.ral} bold />
            <Row label="Trattenute INPS" value={-data.employeeInps} color="text-red-500" subtext="9.19% (O ridotto apprendisti)" />
            <Row label="Imponibile IRPEF" value={data.taxableIncome} subtext="Base di calcolo tasse" />
            
            <Row label="IRPEF Lorda" value={-data.grossIrpef} color="text-red-500" />
            <Row label="Detrazioni Lavoro" value={data.workDeductions} color="text-green-600" isPlus />
            
            {data.wedgeDeduction > 0 && (
                <Row label="Detrazione Cuneo" value={data.wedgeDeduction} color="text-green-600" isPlus subtext="Nuovo sconto IRPEF 2025" />
            )}
            
            <Row label="Addizionali Locali" value={-(data.regionale + data.comunale)} color="text-red-500" subtext="Regionale + Comunale" />
            
            {data.wedgeIndemnity > 0 && (
                <Row label="Indennità Cuneo" value={data.wedgeIndemnity} color="text-green-600" isPlus subtext="Bonus in busta paga (< 20k)" />
            )}
            {data.renziBonus > 0 && (
                <Row label="Trattamento Integrativo" value={data.renziBonus} color="text-green-600" isPlus subtext="Ex Bonus Renzi" />
            )}

            <Row label="Netto Annuale" value={data.annualNet} isTotal />
         </div>
      </div>

      {/* Company Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <div className="bg-jet-black px-4 py-3 border-b border-gray-900">
            <h3 className="text-sm font-bold text-white">Costo per l'Azienda</h3>
         </div>
         <div className="p-0">
            <Row label="Retribuzione Lorda (RAL)" value={data.ral} bold />
            <Row label="Contributi INPS Azienda" value={data.companyInps} color="text-gray-900" />
            {data.companySavings > 0 && (
                <Row label="Risparmio Agevolazioni" value={-data.companySavings} color="text-green-600" subtext={data.incentiveApplied} />
            )}
            <Row label="INAIL" value={data.companyInail} subtext="0.4%" />
            <Row label="TFR" value={data.tfr} subtext="Trattamento Fine Rapporto" />
            <div className="flex-grow"></div>
            <Row label="Costo Totale" value={data.companyTotalCost} isTotal dark />
         </div>
      </div>
    </div>
  );
};

const Row = ({ 
    label, 
    value, 
    color = "text-gray-700", 
    isPlus = false, 
    isTotal = false, 
    bold = false, 
    subtext = "",
    dark = false 
}: any) => (
  <div className={`
    flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-0
    ${isTotal ? (dark ? 'bg-jet-lime text-jet-black' : 'bg-gray-50 text-jet-black') : ''}
  `}>
    <div>
        <span className={`text-sm ${bold || isTotal ? 'font-bold' : ''} ${dark && isTotal ? 'text-jet-black' : ''}`}>
            {label}
        </span>
        {subtext && <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>}
    </div>
    <span className={`font-mono font-medium text-sm ${color} ${isTotal ? 'text-lg' : ''}`}>
      {value > 0 && isPlus ? '+' : ''}
      {formatCurrency(value)}
    </span>
  </div>
);
