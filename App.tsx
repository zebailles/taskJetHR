
import React, { useState, useMemo, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { ResultCard } from './components/ResultCard';
import { DetailedTable } from './components/DetailedTable';
import { DistributionChart } from './components/DistributionChart';
import { SalaryRadialChart } from './components/SalaryRadialChart';
import { calculateSalary } from './utils/taxLogic';
import { IncentiveType } from './types';


const App: React.FC = () => {
  const [ral, setRal] = useState<number | ''>(30000);
  const [incentive, setIncentive] = useState<IncentiveType>('NONE');
  const [region, setRegion] = useState<string>('LOMBARDIA');
  const [municipality, setMunicipality] = useState<string | null>('MILANO');
  const [manualMunicipalRate, setManualMunicipalRate] = useState<number>(0.8);

  // Reset incentive if region changes to non-south and current incentive is SUD
  const isSouth = ["ABRUZZO", "BASILICATA", "CALABRIA", "CAMPANIA", "MOLISE", "PUGLIA", "SARDEGNA", "SICILIA"].includes(region);

  useEffect(() => {
    if (!isSouth && incentive === 'SUD') {
      setIncentive('NONE');
    }
  }, [region, incentive, isSouth]);

  const results = useMemo(() => {
    return calculateSalary(
      typeof ral === 'number' ? ral : 0,
      incentive,
      region,
      municipality,
      manualMunicipalRate
    );
  }, [ral, incentive, region, municipality, manualMunicipalRate]);

  // Calculate KPIs
  const multiplier = results.ral > 0 ? (results.companyTotalCost / results.ral).toFixed(2) : '0';
  const taxWedge = results.companyTotalCost > 0
    ? ((1 - (results.annualNet / results.companyTotalCost)) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans flex justify-center">
      <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-6">

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 lg:h-fit lg:sticky lg:top-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-white">
            <InputSection
              ral={ral}
              setRal={setRal}
              incentive={incentive}
              setIncentive={setIncentive}
              region={region}
              setRegion={setRegion}
              municipality={municipality}
              setMunicipality={setMunicipality}
              manualMunicipalRate={manualMunicipalRate}
              setManualMunicipalRate={setManualMunicipalRate}
            />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-jet-black rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Moltiplicatore</p>
              <div className="mt-2">
                <span className="text-4xl font-bold text-jet-lime">x{multiplier}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Costo su RAL</p>
            </div>
            <div className="bg-white rounded-2xl p-5 text-jet-black shadow-sm border border-gray-200 flex flex-col justify-between">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Cuneo Fiscale</p>
              <div className="mt-2">
                <span className="text-4xl font-bold text-jet-black">{taxWedge}%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Differenza Costo/Netto</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <ResultCard
              label="Costo Totale Azienda"
              value={results.companyTotalCost}
              theme="dark"
              subtext="RAL + Contributi + TFR"
            />
            <ResultCard
              label="Netto Mensile"
              value={results.monthlyNet}
              theme="lime"
              subtext="Su 13 mensilità"
            />
            <ResultCard
              label="Netto Annuale"
              value={results.annualNet}
              theme="light"
            />
          </div>

          {/* Charts Area */}
          <div className="grid md:grid-cols-2 gap-6">
            <SalaryRadialChart data={results} />
            <DistributionChart data={results} />
          </div>

          {/* Detailed Breakdown */}
          <div className="pt-2">
            <DetailedTable data={results} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
