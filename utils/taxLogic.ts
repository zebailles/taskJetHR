
import { SalaryResult, IncentiveType } from '../types';
import {
    REGIONAL_TAX_CONFIG,
    PROVINCIAL_CAPITALS,
    MUNICIPAL_TAX_RATES,
    RegionalConfig,
    ProvincialCapital,
    MunicipalTaxConfig
} from '../constants/taxData';

const CONSTANTS = {
    MENSILITA: 13,
    INPS_ALIQUOTA_DIPENDENTE: 0.0919,
    INPS_ALIQUOTA_AZIENDA: 0.30,
    INAIL_ALIQUOTA: 0.004,
    DIVISORE_TFR: 13.5,

    // IRPEF 2025
    SCAGLIONI: [
        { soglia: 28000, aliquota: 0.23 },
        { soglia: 50000, aliquota: 0.35 },
        { soglia: Infinity, aliquota: 0.43 }
    ],

    // Cuneo 2025
    CUNEO_SOGLIA_INDENNITA: 20000,
    CUNEO_SOGLIA_DETRAZIONE_START: 20000,
    CUNEO_SOGLIA_DETRAZIONE_MID: 32000,
    CUNEO_SOGLIA_DETRAZIONE_END: 40000,

    // Tetti Incentivi
    CAP_GIOVANI_NORD: 6000,
    CAP_GIOVANI_SUD: 7800,
    CAP_DONNE_V2: 8000,
    CAP_UNDER_30: 3000,
    CAP_SUD_DECONTRIBUZIONE: 1740,

    // Mezzogiorno Regions for Incentives
    REGIONS_SOUTH: ["ABRUZZO", "BASILICATA", "CALABRIA", "CAMPANIA", "MOLISE", "PUGLIA", "SARDEGNA", "SICILIA"]
};

/**
 * Ottiene la lista dei capoluoghi di provincia per una data regione.
 * @param regionName Nome della regione (es. "LOMBARDIA", "SICILIA")
 * @returns Array di oggetti ProvincialCapital
 */
export function getProvincesByRegion(regionName: string): ProvincialCapital[] {
    if (!regionName) return [];

    const normalizedRegion = regionName.toUpperCase();

    return PROVINCIAL_CAPITALS.filter(p => {
        // Gestione casi speciali di naming (es. "EMILIA-ROMAGNA" vs "EMILIA ROMAGNA")
        const pRegion = p.regione.toUpperCase().replace(/-/g, ' ');
        const searchRegion = normalizedRegion.replace(/-/g, ' ');
        return pRegion === searchRegion;
    });
}

/**
 * Calcola l'Addizionale Regionale IRPEF 2025
 * @param imponibile Reddito Imponibile IRPEF
 * @param regione Nome della regione
 * @param figli Numero di figli a carico (per detrazioni specifiche)
 * @returns Importo dell'imposta regionale arrotondato a 2 decimali
 */
export function calcolaAddizionaleRegionale(imponibile: number, regione: string, figli: number = 0): number {
    const normalizedRegion = regione ? regione.toUpperCase() : "DEFAULT";
    const config: RegionalConfig = REGIONAL_TAX_CONFIG[normalizedRegion] || REGIONAL_TAX_CONFIG["DEFAULT"];

    let imposta = 0;

    // CASO 1: Aliquota Unica con Soglia (es. Veneto)
    if (config.tipo === "unica_con_soglia") {
        if (config.sogliaEsenzione && imponibile <= config.sogliaEsenzione) {
            return 0;
        }
        // Se supera la soglia, si applica all'intero imponibile (tipico del Veneto)
        return imponibile * ((config.aliquota || 0) / 100);
    }

    // CASO 2: Aliquota Unica Semplice
    if (config.tipo === "unica") {
        return imponibile * ((config.aliquota || 0) / 100);
    }

    // CASO 3: Scaglioni Progressivi (Standard) e Regole Speciali
    if ((config.tipo === "scaglioni" || config.tipo === "scaglioni_con_regole_speciali") && config.scaglioni) {

        // Logica Speciale LAZIO:
        // Se reddito < 28.000 (o soglia specifica), non si applica la maggiorazione
        // Usiamo l'aliquota del primo scaglione su tutto l'imponibile
        if (normalizedRegion === "LAZIO" && imponibile <= 28000) { // 28k è una soglia comune per il Lazio
            // Forza aliquota base (solitamente 1.73%) su tutto se sotto soglia
            // Prendiamo l'aliquota del primo scaglione
            const baseRate = config.scaglioni[0].aliquota;
            return imponibile * (baseRate / 100);
        }

        let redditoResiduo = imponibile;
        let sogliaPrecedente = 0;

        for (let scaglione of config.scaglioni) {
            const ampiezza = scaglione.soglia - sogliaPrecedente;
            const parteImponibile = Math.min(Math.max(0, redditoResiduo), ampiezza);

            if (parteImponibile > 0) {
                imposta += parteImponibile * (scaglione.aliquota / 100);
                redditoResiduo -= parteImponibile;
            }

            if (redditoResiduo <= 0) break;

            if (scaglione.soglia === Infinity) break; // Safety break
            sogliaPrecedente = scaglione.soglia;
        }
    }

    // GESTIONE DETRAZIONI REGIONALI SPECIFICHE

    // LOMBARDIA: Detrazione per figli se reddito non eccessivo
    if (normalizedRegion === "LOMBARDIA" && config.hasDetrazioneFigli) {
        // Esempio semplificato basato sulla nota standard Lombardia (spesso limite 50k o variabile)
        if (imponibile <= 50000 && figli > 0) {
            const detrazione = 200 * figli; // Valore indicativo da normativa
            imposta = Math.max(0, imposta - detrazione);
        }
    }

    // LAZIO: Detrazione fissa per redditi in fascia media (es. 28k-35k)
    if (normalizedRegion === "LAZIO") {
        if (imponibile > 28000 && imponibile <= 35000) {
            imposta = Math.max(0, imposta - 60);
        }
    }

    return parseFloat(imposta.toFixed(2));
}

/**
 * Calcola l'Addizionale Comunale IRPEF 2025
 * @param imponibile Reddito Imponibile IRPEF
 * @param comune Nome del comune (capoluogo)
 * @returns Importo dell'imposta comunale arrotondato a 2 decimali
 */
export function calcolaAddizionaleComunale(imponibile: number, comune: string): number {
    const normalizedComune = comune ? comune.toUpperCase() : "DEFAULT";
    // Cerca la configurazione specifica, altrimenti usa un default (es. 0.8% senza esenzione)
    const config: MunicipalTaxConfig = MUNICIPAL_TAX_RATES[normalizedComune] || MUNICIPAL_TAX_RATES["DEFAULT"];

    // 1. Controllo Esenzione
    if (config.sogliaEsenzione > 0 && imponibile <= config.sogliaEsenzione) {
        return 0;
    }

    let imposta = 0;

    // 2. Calcolo Imposta
    if (config.multiAliquota && config.scaglioni && config.scaglioni.length > 0) {
        // Logica a scaglioni (simile alla regionale/nazionale)
        let redditoResiduo = imponibile;
        let sogliaPrecedente = 0;

        for (let scaglione of config.scaglioni) {
            // Se la soglia è 0, significa che questo scaglione copre tutto il residuo o è malformato,
            // ma nella nostra struttura soglia indica il limite superiore.
            const limiteSuperiore = scaglione.soglia;

            const ampiezza = (limiteSuperiore === Infinity)
                ? redditoResiduo
                : limiteSuperiore - sogliaPrecedente;

            const parteImponibile = Math.min(Math.max(0, redditoResiduo), ampiezza);

            if (parteImponibile > 0) {
                imposta += parteImponibile * (scaglione.aliquota / 100);
                redditoResiduo -= parteImponibile;
            }

            if (redditoResiduo <= 0) break;
            sogliaPrecedente = limiteSuperiore;
        }
    } else {
        // Aliquota Unica
        // Nota: Molti comuni applicano l'aliquota unica su TUTTO il reddito se si supera la soglia di esenzione.
        const aliquota = config.aliquotaUnica || 0.8; // Default 0.8% se mancante
        imposta = imponibile * (aliquota / 100);
    }

    return parseFloat(imposta.toFixed(2));
}

// Wrapper for compatibility with existing code if needed, but better to update calculateSalary
export const calculateRegionalTax = (taxableIncome: number, regionName: string): number => {
    return calcolaAddizionaleRegionale(taxableIncome, regionName, 0);
};

export const calculateMunicipalTax = (taxableIncome: number, municipalityName: string | null, manualRate: number): number => {
    if (!municipalityName || municipalityName === 'Manuale') {
        return taxableIncome * (manualRate / 100);
    }
    return calcolaAddizionaleComunale(taxableIncome, municipalityName);
};

export const calculateSalary = (
    ral: number,
    incentive: IncentiveType = 'NONE',
    regionName: string = 'LOMBARDIA',
    municipalityName: string | null = 'MILANO',
    manualMunicipalRate: number = 0.8
): SalaryResult => {

    const isSouth = CONSTANTS.REGIONS_SOUTH.includes(regionName);

    // --- 1. NETTO DIPENDENTE ---

    const isApprendista = incentive === 'APPRENDISTATO';
    const aliquotaDipendente = isApprendista ? 0.0584 : CONSTANTS.INPS_ALIQUOTA_DIPENDENTE;

    const employeeInps = ral * aliquotaDipendente;
    const taxableIncome = Math.max(0, ral - employeeInps);

    // IRPEF Lorda
    let grossIrpef = 0;
    if (taxableIncome <= 28000) {
        grossIrpef = taxableIncome * 0.23;
    } else if (taxableIncome <= 50000) {
        grossIrpef = 6440 + ((taxableIncome - 28000) * 0.35);
    } else {
        grossIrpef = 14140 + ((taxableIncome - 50000) * 0.43);
    }

    // Detrazioni Lavoro
    let workDeductions = 0;
    if (taxableIncome <= 15000) {
        workDeductions = 1955;
    } else if (taxableIncome <= 28000) {
        const ratio = (28000 - taxableIncome) / 13000;
        workDeductions = 1910 + (1190 * ratio);
    } else if (taxableIncome <= 50000) {
        const ratio = (50000 - taxableIncome) / 22000;
        workDeductions = 1910 * ratio;
    }

    // Detrazione Cuneo Fiscale 2025
    let wedgeDeduction = 0;
    if (!isApprendista) {
        if (taxableIncome > CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_START && taxableIncome <= CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_MID) {
            wedgeDeduction = 1000;
        } else if (taxableIncome > CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_MID && taxableIncome <= CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_END) {
            const ratio = (CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_END - taxableIncome) / 8000;
            wedgeDeduction = 1000 * ratio;
        }
    }

    const totalDeductions = workDeductions + wedgeDeduction;
    const netIrpef = Math.max(0, grossIrpef - totalDeductions);

    // Addizionali
    const regionale = calculateRegionalTax(taxableIncome, regionName);

    // Calculate municipal tax
    const comunale = calculateMunicipalTax(taxableIncome, municipalityName, manualMunicipalRate);

    // Bonus e Indennità
    let wedgeIndemnity = 0;
    if (!isApprendista) {
        if (taxableIncome < 8500) {
            wedgeIndemnity = taxableIncome * 0.071;
        } else if (taxableIncome < 15000) {
            wedgeIndemnity = taxableIncome * 0.053;
        } else if (taxableIncome <= CONSTANTS.CUNEO_SOGLIA_INDENNITA) {
            wedgeIndemnity = taxableIncome * 0.048;
        }
    }

    const renziBonus = (taxableIncome <= 15000 && taxableIncome > 8174) ? 1200 : 0;

    const annualNet = taxableIncome - netIrpef - regionale - comunale + wedgeIndemnity + renziBonus;
    const monthlyNet = annualNet / CONSTANTS.MENSILITA;
    const employeeTotalTax = (ral - annualNet);

    // --- 2. COSTO AZIENDA ---

    let companyInps = ral * CONSTANTS.INPS_ALIQUOTA_AZIENDA;
    const companyInail = ral * CONSTANTS.INAIL_ALIQUOTA;
    const tfr = ral / CONSTANTS.DIVISORE_TFR;

    let savings = 0;

    switch (incentive) {
        case 'UNDER_30':
            savings = Math.min(companyInps * 0.50, CONSTANTS.CAP_UNDER_30);
            break;

        case 'UNDER_36':
            const capGiovani = isSouth ? CONSTANTS.CAP_GIOVANI_SUD : CONSTANTS.CAP_GIOVANI_NORD;
            savings = Math.min(companyInps, capGiovani);
            break;

        case 'DONNE_SVANTAGGIATE':
            savings = Math.min(companyInps, CONSTANTS.CAP_DONNE_V2);
            break;

        case 'SUD':
            // Check if region is actually in south
            if (isSouth) {
                savings = Math.min(companyInps, CONSTANTS.CAP_SUD_DECONTRIBUZIONE);
            } else {
                savings = 0; // Not applicable
            }
            break;

        case 'APPRENDISTATO':
            const inpsApprendista = ral * 0.116;
            savings = Math.max(0, companyInps - inpsApprendista);
            break;

        case 'NONE':
        default:
            savings = 0;
            break;
    }

    if (incentive !== 'APPRENDISTATO') {
        companyInps = Math.max(0, companyInps - savings);
    } else {
        companyInps = ral * CONSTANTS.INPS_ALIQUOTA_AZIENDA - savings;
    }

    const companyTotalCost = ral + companyInps + companyInail + tfr;

    return {
        ral,
        monthlyGross: ral / CONSTANTS.MENSILITA,
        employeeInps,
        taxableIncome,
        grossIrpef,
        workDeductions,
        wedgeDeduction,
        totalDeductions,
        netIrpef,
        regionale,
        comunale,
        wedgeIndemnity,
        renziBonus,
        employeeTotalTax,
        annualNet,
        monthlyNet,
        companyInps,
        companyInail,
        tfr,
        companyTotalCost,
        incentiveApplied: incentive,
        companySavings: savings,
        selectedRegion: regionName,
        selectedMunicipality: municipalityName || 'Manuale'
    };
};
