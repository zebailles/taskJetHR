
import React, { useEffect } from 'react';
import { IncentiveType } from '../types';
import { REGIONAL_TAX_CONFIG, PROVINCIAL_CAPITALS } from '../constants/taxData';

interface InputSectionProps {
  ral: number | '';
  setRal: (val: number | '') => void;
  incentive: IncentiveType;
  setIncentive: (val: IncentiveType) => void;
  region: string;
  setRegion: (val: string) => void;
  municipality: string | null;
  setMunicipality: (val: string | null) => void;
  manualMunicipalRate: number;
  setManualMunicipalRate: (val: number) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  ral, setRal,
  incentive, setIncentive,
  region, setRegion,
  municipality, setMunicipality,
  manualMunicipalRate, setManualMunicipalRate
}) => {

  const regions = Object.keys(REGIONAL_TAX_CONFIG).filter(k => k !== 'DEFAULT').sort();

  // Filter municipalities based on selected region
  const availableMunicipalities = PROVINCIAL_CAPITALS
    .filter(p => p.regione === region)
    .map(p => p.provincia.toUpperCase())
    .sort();

  // When region changes, we might need to reset municipality if it doesn't belong to new region
  useEffect(() => {
    if (municipality !== 'ALTRO' && municipality) {
      const isValid = PROVINCIAL_CAPITALS.find(
        p => p.provincia.toUpperCase() === municipality && p.regione === region
      );
      if (!isValid) {
        // Default to the first available municipality of the new region
        const firstCity = PROVINCIAL_CAPITALS.find(p => p.regione === region)?.provincia.toUpperCase();
        setMunicipality(firstCity || 'ALTRO');
      }
    }
  }, [region, municipality, setMunicipality]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setRal('');
    } else {
      setRal(Math.max(0, parseInt(val, 10)));
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegion(e.target.value);
  };

  const isSouth = ["ABRUZZO", "BASILICATA", "CALABRIA", "CAMPANIA", "MOLISE", "PUGLIA", "SARDEGNA", "SICILIA"].includes(region);

  const incentives: { value: IncentiveType; label: string; desc: string; disabled?: boolean }[] = [
    { value: 'NONE', label: 'Nessuna Agevolazione', desc: 'Costo standard' },
    { value: 'UNDER_30', label: 'Under 30 (Strutturale)', desc: 'Esonero 50% contributi (Max €3.000)' },
    { value: 'UNDER_36', label: 'Bonus Giovani 2025 (Under 35)', desc: isSouth ? 'Esonero 100% (Max €7.800 ZES)' : 'Esonero 100% (Max €6.000)' },
    { value: 'DONNE_SVANTAGGIATE', label: 'Donne 2025', desc: 'Esonero 100% contributi (Max €8.000)' },
    { value: 'APPRENDISTATO', label: 'Apprendistato', desc: 'Aliquota INPS ridotta (~11.6%)' },
    { value: 'SUD', label: 'Decontribuzione Sud', desc: 'Sgravio INPS (Max €1.740)', disabled: !isSouth },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-jet-black mb-3 tracking-tight">Costo vs Stipendio</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Calcola il <strong>Costo Azienda</strong> e lo <strong>Stipendio Netto</strong> con le nuove regole <strong>2025</strong> (Nuovo Cuneo Fiscale, Bonus ZES, Addizionali Locali).
        </p>
      </div>

      {/* RAL Input */}
      <div className="space-y-3">
        <label htmlFor="ral" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Retribuzione Annua Lorda (RAL)
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 font-medium text-xl">€</span>
          </div>
          <input
            type="number"
            id="ral"
            value={ral}
            onChange={handleChange}
            placeholder="es. 30000"
            className="block w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-jet-black text-2xl font-bold placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {[25000, 30000, 40000, 50000].map((preset) => (
            <button
              key={preset}
              onClick={() => setRal(preset)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              {preset / 1000}k
            </button>
          ))}
        </div>
      </div>

      {/* Region & Municipality Selector */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Regione
          </label>
          <div className="relative">
            <select
              value={region}
              onChange={handleRegionChange}
              className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-jet-lime appearance-none shadow-sm cursor-pointer"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Comune
          </label>
          <div className="relative">
            <select
              value={municipality || 'ALTRO'}
              onChange={(e) => setMunicipality(e.target.value === 'ALTRO' ? null : e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-jet-lime appearance-none shadow-sm cursor-pointer"
            >
              {availableMunicipalities.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="ALTRO">Altro (Manuale)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Rate Override if "ALTRO" is selected */}
      {!municipality && (
        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fade-in">
          <label className="block text-xs font-bold text-gray-500">Aliquota Comunale (%)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.1"
              value={manualMunicipalRate}
              onChange={(e) => setManualMunicipalRate(parseFloat(e.target.value))}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-jet-black"
            />
            <span className="text-sm font-mono font-bold text-jet-black w-12 text-right">{manualMunicipalRate.toFixed(1)}%</span>
          </div>
          <p className="text-[10px] text-gray-400">Seleziona l'aliquota specifica del tuo comune (max 0.8%).</p>
        </div>
      )}

      {/* Incentive Select */}
      <div className="space-y-3">
        <label htmlFor="incentive" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Agevolazione Contributiva
        </label>
        <div className="relative">
          <select
            id="incentive"
            value={incentive}
            onChange={(e) => setIncentive(e.target.value as IncentiveType)}
            className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-jet-lime appearance-none shadow-sm cursor-pointer"
          >
            {incentives.map((inc) => (
              <option key={inc.value} value={inc.value} disabled={inc.disabled}>
                {inc.label} {inc.disabled ? '(Non disp. in questa regione)' : ''}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>

        {/* Helper Text for Incentive */}
        <div className="bg-jet-lime/10 border border-jet-lime/30 rounded-lg p-3">
          <p className="text-xs text-jet-black/80 font-medium">
            {incentives.find(i => i.value === incentive)?.desc}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>
          </div>
          <p className="text-[10px] leading-tight">
            Calcolo include Nuova IRPEF 2025 e addizionali regionali/comunali basate sulla località selezionata.
          </p>
        </div>
      </div>
    </div>
  );
};
