/**
 * Jet HR Salary Simulator 2025
 * Modulo di calcolo unificato per Netto Dipendente e Costo Azienda
 */

const CONSTANTS = {
    // Previdenza e TFR
    INPS_ALIQUOTA_DIPENDENTE: 0.0919,
    INPS_ALIQUOTA_AZIENDA: 0.30, // Stima media settore terziario
    INAIL_ALIQUOTA: 0.004,
    DIVISORE_TFR: 13.5,
    MENSILITA: 14,

    // IRPEF 2025 (3 Scaglioni)
    IRPEF_SCAGLIONI: [
        { soglia: 28000, aliquota: 0.23 },
        { soglia: 50000, aliquota: 0.35 },
        { soglia: Infinity, aliquota: 0.43 }
    ],
    
    // Addizionali (Milano / Lombardia)
    ADDIZIONALE_REG_LOMBARDIA: 0.016, // Media semplificata
    ADDIZIONALE_COM_MILANO: 0.008,
    SOGLIA_ESENZIONE_COMUNALE: 21000,

    // Detrazioni Lavoro Dipendente (Parametri base)
    DETRAZIONE_BASE: 1955, // Fino a 15k
    DETRAZIONE_MEDIA_BASE: 1910, // 15k-28k
    DETRAZIONE_MEDIA_COEFF: 1190,
    DETRAZIONE_ALTA_BASE: 1910, // 28k-50k
    
    // Nuovo Cuneo Fiscale 2025
    CUNEO_SOGLIA_INDENNITA: 20000,
    CUNEO_SOGLIA_DETRAZIONE_START: 20000,
    CUNEO_SOGLIA_DETRAZIONE_MID: 32000,
    CUNEO_SOGLIA_DETRAZIONE_END: 40000,
    
    // Tetti Incentivi Aziendali
    CAP_GIOVANI_NORD: 6000,
    CAP_GIOVANI_SUD: 7800,
    CAP_DONNE_V2: 7800,
    CAP_UNDER_30: 3000,
    CAP_ADI: 8000
};

/**
 * Calcola il netto dipendente secondo le regole della Legge di Bilancio 2025.
 * @param {number} ral - Retribuzione Annua Lorda
 * @returns {Object} Oggetto contenente il dettaglio del netto e delle tasse.
 */
function calcolaNettoDipendente(ral) {
    // 1. Calcolo Contributi Previdenziali (INPS Pieno)
    const contributiInps = ral * CONSTANTS.INPS_ALIQUOTA_DIPENDENTE;
    const imponibileIrpef = ral - contributiInps;

    // 2. Calcolo IRPEF Lorda (Nuovi Scaglioni)
    let irpefLorda = 0;
    if (imponibileIrpef <= 28000) {
        irpefLorda = imponibileIrpef * 0.23;
    } else if (imponibileIrpef <= 50000) {
        irpefLorda = 6440 + ((imponibileIrpef - 28000) * 0.35);
    } else {
        irpefLorda = 14140 + ((imponibileIrpef - 50000) * 0.43);
    }

    // 3. Calcolo Detrazioni
    // A. Detrazione Lavoro Dipendente
    let detrazioneLavoro = 0;
    if (imponibileIrpef <= 15000) {
        detrazioneLavoro = CONSTANTS.DETRAZIONE_BASE;
    } else if (imponibileIrpef <= 28000) {
        const rapporto = (28000 - imponibileIrpef) / 13000;
        detrazioneLavoro = CONSTANTS.DETRAZIONE_MEDIA_BASE + (CONSTANTS.DETRAZIONE_MEDIA_COEFF * rapporto);
    } else if (imponibileIrpef <= 50000) {
        const rapporto = (50000 - imponibileIrpef) / 22000;
        detrazioneLavoro = CONSTANTS.DETRAZIONE_ALTA_BASE * rapporto;
    }

    // B. Detrazione Cuneo Fiscale (Solo per redditi 20k - 40k)
    let detrazioneCuneo = 0;
    if (imponibileIrpef > CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_START && imponibileIrpef <= CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_MID) {
        detrazioneCuneo = 1000;
    } else if (imponibileIrpef > CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_MID && imponibileIrpef <= CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_END) {
        const rapporto = (CONSTANTS.CUNEO_SOGLIA_DETRAZIONE_END - imponibileIrpef) / 8000;
        detrazioneCuneo = 1000 * rapporto;
    }

    const totaleDetrazioni = detrazioneLavoro + detrazioneCuneo;
    
    // 4. Calcolo IRPEF Netta
    const irpefNetta = Math.max(0, irpefLorda - totaleDetrazioni);

    // 5. Addizionali Locali
    const addizionaleRegionale = imponibileIrpef * CONSTANTS.ADDIZIONALE_REG_LOMBARDIA;
    const addizionaleComunale = (imponibileIrpef > CONSTANTS.SOGLIA_ESENZIONE_COMUNALE) 
        ? imponibileIrpef * CONSTANTS.ADDIZIONALE_COM_MILANO 
        : 0;

    // 6. Bonus e Indennità
    // A. Indennità Cuneo Fiscale (Solo per redditi < 20k)
    let indennitaCuneo = 0;
    if (imponibileIrpef < 8500) {
        indennitaCuneo = imponibileIrpef * 0.071;
    } else if (imponibileIrpef < 15000) {
        indennitaCuneo = imponibileIrpef * 0.053;
    } else if (imponibileIrpef <= CONSTANTS.CUNEO_SOGLIA_INDENNITA) {
        indennitaCuneo = imponibileIrpef * 0.048;
    }

    // B. Bonus Integrativo (Ex Renzi)
    // Semplificazione: Applicato pieno sotto i 15k, escluso sopra per complessità calcolo capienza
    const bonusRenzi = (imponibileIrpef <= 15000) ? 1200 : 0;

    // 7. Totali
    const nettoAnnuo = imponibileIrpef - irpefNetta - addizionaleRegionale - addizionaleComunale + indennitaCuneo + bonusRenzi;

    return {
        ral: ral,
        imponibileIrpef: parseFloat(imponibileIrpef.toFixed(2)),
        ritenute: {
            inps: parseFloat(contributiInps.toFixed(2)),
            irpefNetta: parseFloat(irpefNetta.toFixed(2)),
            addizionali: parseFloat((addizionaleRegionale + addizionaleComunale).toFixed(2))
        },
        bonus: {
            cuneoFiscale: parseFloat(indennitaCuneo.toFixed(2)), // Indennità (soldi extra)
            bonusRenzi: parseFloat(bonusRenzi.toFixed(2)),
            beneficioFiscaleCuneo: parseFloat(detrazioneCuneo.toFixed(2)) // Detrazione (sconto tasse)
        },
        nettoAnnuo: parseFloat(nettoAnnuo.toFixed(2)),
        nettoMensile: parseFloat((nettoAnnuo / CONSTANTS.MENSILITA).toFixed(2))
    };
}

/**
 * Calcola il Costo Azienda e identifica la migliore agevolazione applicabile.
 * @param {number} ral - Retribuzione Annua Lorda
 * @param {Object} profilo - Dati del candidato { eta, sesso, disabilitaPct, disoccupazioneMesi, regione, isApprendistato }
 * @returns {Object} Oggetto con costo standard, costo agevolato e dettaglio incentivo.
 */
function calcolaCostoAzienda(ral, profilo) {
    // 1. Calcolo Costo Standard (Baseline)
    const inpsAziendaStd = ral * CONSTANTS.INPS_ALIQUOTA_AZIENDA;
    const inail = ral * CONSTANTS.INAIL_ALIQUOTA;
    const tfr = ral / CONSTANTS.DIVISORE_TFR;
    const costoTotaleStd = ral + inpsAziendaStd + inail + tfr;

    // Lista potenziali agevolazioni
    let incentivi = [];

    // A. Incentivo Disabilità (Priorità Massima)
    if (profilo.disabilitaPct > 79) {
        // 70% della retribuzione mensile lorda x mensilità
        incentivi.push({
            id: 'DISABILI_70',
            nome: 'Incentivo Disabilità (>79%)',
            risparmio: ral * 0.70,
            descrizione: 'Restituzione del 70% della RAL lorda'
        });
    }

    // B. Apprendistato Professionalizzante
    if (profilo.eta <= 29 && profilo.isApprendistato) {
        // Stima risparmio ~13% sul costo totale (o riduzione aliquota INPS al 10% ca.)
        incentivi.push({
            id: 'APPRENDISTATO',
            nome: 'Apprendistato Professionalizzante',
            risparmio: costoTotaleStd * 0.13,
            descrizione: 'Aliquota contributiva ridotta strutturale'
        });
    }

    // C. Bonus Giovani / Under 35 (2025 vs Strutturale)
    if (profilo.eta < 35 && !profilo.haLavoratoIndeterminato) {
        // Opzione 1: Bonus 2025 (Da confermare)
        const capZona = (profilo.regione === 'Sud') ? CONSTANTS.CAP_GIOVANI_SUD : CONSTANTS.CAP_GIOVANI_NORD;
        const risparmioU35 = Math.min(inpsAziendaStd, capZona);
        
        incentivi.push({
            id: 'UNDER_35_2025',
            nome: 'Bonus Giovani 2025 (Under 35)',
            risparmio: risparmioU35,
            descrizione: `Esonero 100% contributi fino a ${capZona}€ (In attesa conferma UE)`
        });

        // Opzione 2: Under 30 Strutturale (Fallback)
        if (profilo.eta < 30) {
            incentivi.push({
                id: 'UNDER_30_STRUTTURALE',
                nome: 'Incentivo Under 30 (Strutturale)',
                risparmio: Math.min(inpsAziendaStd * 0.50, CONSTANTS.CAP_UNDER_30),
                descrizione: 'Esonero 50% contributi fino a 3.000€'
            });
        }
    }

    // D. Incentivi Donne (2025 vs Strutturale)
    if (profilo.sesso === 'F' && profilo.disoccupazioneMesi >= 12) {
        // Opzione 1: Donne v2 2025 (Da confermare)
        incentivi.push({
            id: 'DONNE_V2',
            nome: 'Donne Svantaggiate 2025',
            risparmio: Math.min(inpsAziendaStd, CONSTANTS.CAP_DONNE_V2),
            descrizione: 'Esonero 100% contributi fino a 7.800€ (In attesa conferma UE)'
        });

        // Opzione 2: Donne Strutturale (Se disoccupata da >12 mesi o >24 mesi ovunque)
        // Nota: Qui semplifichiamo assumendo eleggibilità base
        incentivi.push({
            id: 'DONNE_STRUTTURALE',
            nome: 'Donne Svantaggiate (Strutturale)',
            risparmio: inpsAziendaStd * 0.50, // Nessun tetto
            descrizione: 'Esonero 50% contributi senza tetto massimo'
        });
    }

    // E. Over 50
    if (profilo.eta >= 50 && profilo.disoccupazioneMesi >= 12) {
        incentivi.push({
            id: 'OVER_50',
            nome: 'Incentivo Over 50',
            risparmio: inpsAziendaStd * 0.50,
            descrizione: 'Esonero 50% contributi per 18 mesi (indeterminato)'
        });
    }

    // Selezione Migliore Agevolazione
    // Ordiniamo per risparmio decrescente
    incentivi.sort((a, b) => b.risparmio - a.risparmio);

    const migliorIncentivo = incentivi.length > 0 ? incentivi[0] : null;
    const risparmioEffettivo = migliorIncentivo ? migliorIncentivo.risparmio : 0;

    return {
        ral: ral,
        costoAziendaStandard: parseFloat(costoTotaleStd.toFixed(2)),
        incentivoApplicato: migliorIncentivo ? {
            nome: migliorIncentivo.nome,
            descrizione: migliorIncentivo.descrizione,
            valore: parseFloat(migliorIncentivo.risparmio.toFixed(2))
        } : null,
        costoAziendaFinale: parseFloat((costoTotaleStd - risparmioEffettivo).toFixed(2)),
        moltiplicatoreRal: parseFloat(((costoTotaleStd - risparmioEffettivo) / ral).toFixed(2))
    };
}

/**
 * Funzione Entry Point per l'interfaccia utente.
 * Esegue entrambe le simulazioni.
 */
function simulaScenarioCompleto(inputData) {
    const netto = calcolaNettoDipendente(inputData.ral);
    const azienda = calcolaCostoAzienda(inputData.ral, inputData.profilo);

    return {
        dipendente: netto,
        azienda: azienda
    };
}

// Esempio di utilizzo (Input dal Frontend)
const esempioInput = {
    ral: 30000,
    profilo: {
        eta: 28,
        sesso: 'F',
        regione: 'Lombardia',
        disoccupazioneMesi: 13, // Sblocca incentives donne
        disabilitaPct: 0,
        haLavoratoIndeterminato: false,
        isApprendistato: false
    }
};

// Esecuzione
const risultato = simulaScenarioCompleto(esempioInput);
console.log(JSON.stringify(risultato, null, 2));