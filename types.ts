

import { RegionalConfig, MunicipalTaxConfig, Scaglione as TaxDataScaglione } from './constants/taxData';

export type IncentiveType =
  | 'NONE'
  | 'UNDER_30'
  | 'UNDER_36'
  | 'DONNE_SVANTAGGIATE'
  | 'APPRENDISTATO'
  | 'SUD';

export type TaxMethod = 'scaglioni' | 'unica' | 'soglia_totale' | 'scaglioni_condizionali' | 'unica_con_soglia' | 'scaglioni_con_regole_speciali';

export type Scaglione = TaxDataScaglione;

export type RegionData = RegionalConfig & {
  codice?: string; // Keep for compatibility if needed, though new data doesn't have it explicitly in the interface but in the object
  metodo: TaxMethod;
  scaglioni?: Scaglione[];
  aliquota_unica?: number;
  aliquota_soglia?: number;
  soglia_esenzione?: number; // Note: new data uses camelCase sogliaEsenzione, might need mapping or update usage
  note?: string;
};

export type MunicipalityData = {
  comune: string;
  regione: string;
  addizionale_comunale: MunicipalTaxConfig;
};

export interface SalaryResult {
  ral: number;
  monthlyGross: number; // Su 13 mensilità

  // Employee Side
  employeeInps: number;
  taxableIncome: number; // Imponibile IRPEF
  grossIrpef: number;

  // Detrazioni
  workDeductions: number; // Detrazioni Lavoro
  wedgeDeduction: number; // Detrazione Cuneo Fiscale (Sconto tasse)
  totalDeductions: number;

  netIrpef: number;
  regionale: number;
  comunale: number;

  // Bonus / Indennità
  wedgeIndemnity: number; // Indennità Cuneo Fiscale (Soldi extra)
  renziBonus: number; // Ex Bonus Renzi (Integrativo)

  employeeTotalTax: number;
  annualNet: number;
  monthlyNet: number;

  // Company Side
  companyInps: number;
  companyInail: number;
  tfr: number;
  companyTotalCost: number;

  // Meta
  incentiveApplied: IncentiveType;
  companySavings: number;
  selectedRegion: string;
  selectedMunicipality: string;
}
