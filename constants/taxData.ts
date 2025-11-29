
export interface Scaglione {
    soglia: number;
    aliquota: number;
}

export interface RegionalConfig {
    tipo: 'scaglioni' | 'unica' | 'unica_con_soglia' | 'scaglioni_con_regole_speciali';
    scaglioni?: Scaglione[];
    aliquota?: number;
    sogliaEsenzione?: number;
    hasDetrazioneFigli?: boolean;
}

export interface ProvincialCapital {
    provincia: string; // Nome della città capoluogo (es. "Torino")
    sigla: string;     // Sigla (es. "TO")
    regione: string;   // Regione (es. "PIEMONTE")
}

export interface MunicipalTaxConfig {
    multiAliquota: boolean;
    sogliaEsenzione: number;
    aliquotaUnica?: number; // Usato se multiAliquota è false o c'è un'aliquota base sopra l'esenzione
    scaglioni?: Scaglione[];
}

/**
 * Configurazione Addizionali Regionali 2025
 * Fonte: addizionali_regionali_b.js
 */
export const REGIONAL_TAX_CONFIG: Record<string, RegionalConfig> = {
    "PIEMONTE": {
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.62 },
            { soglia: 28000, aliquota: 2.13 },
            { soglia: 50000, aliquota: 2.75 },
            { soglia: Infinity, aliquota: 3.33 }
        ]
    },
    "LOMBARDIA": {
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.23 },
            { soglia: 28000, aliquota: 1.58 },
            { soglia: 50000, aliquota: 1.72 },
            { soglia: Infinity, aliquota: 1.73 }
        ],
        hasDetrazioneFigli: true
    },
    "VENETO": {
        tipo: "unica_con_soglia",
        aliquota: 1.23,
        sogliaEsenzione: 15000
    },
    "EMILIA-ROMAGNA": { // Nota: normalizzato il nome con trattino come nel JSON province
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.33 },
            { soglia: 28000, aliquota: 1.93 },
            { soglia: 50000, aliquota: 2.93 },
            { soglia: Infinity, aliquota: 3.33 }
        ]
    },
    "EMILIA ROMAGNA": { // Alias per sicurezza
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.33 },
            { soglia: 28000, aliquota: 1.93 },
            { soglia: 50000, aliquota: 2.93 },
            { soglia: Infinity, aliquota: 3.33 }
        ]
    },
    "TOSCANA": {
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.42 },
            { soglia: 28000, aliquota: 1.43 },
            { soglia: 50000, aliquota: 3.32 },
            { soglia: Infinity, aliquota: 3.33 }
        ]
    },
    "LAZIO": {
        tipo: "scaglioni_con_regole_speciali",
        scaglioni: [
            { soglia: 15000, aliquota: 1.73 },
            { soglia: 28000, aliquota: 3.33 },
            { soglia: 50000, aliquota: 3.33 },
            { soglia: Infinity, aliquota: 3.33 }
        ]
    },
    "CAMPANIA": {
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.73 },
            { soglia: 28000, aliquota: 2.96 },
            { soglia: 50000, aliquota: 3.20 },
            { soglia: Infinity, aliquota: 3.33 }
        ]
    },
    "PUGLIA": {
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.33 },
            { soglia: 28000, aliquota: 1.43 },
            { soglia: 50000, aliquota: 1.63 },
            { soglia: Infinity, aliquota: 1.85 }
        ]
    },
    "VALLE D'AOSTA": {
        tipo: "unica",
        aliquota: 1.23
    },
    "DEFAULT": {
        tipo: "scaglioni",
        scaglioni: [
            { soglia: 15000, aliquota: 1.23 },
            { soglia: 28000, aliquota: 1.23 },
            { soglia: 50000, aliquota: 1.23 },
            { soglia: Infinity, aliquota: 1.23 }
        ]
    }
};

/**
 * Lista Capoluoghi di Provincia
 * Fonte: province_regioni_b.json
 */
export const PROVINCIAL_CAPITALS: ProvincialCapital[] = [
    { "provincia": "Agrigento", "sigla": "AG", "regione": "SICILIA" },
    { "provincia": "Alessandria", "sigla": "AL", "regione": "PIEMONTE" },
    { "provincia": "Ancona", "sigla": "AN", "regione": "MARCHE" },
    { "provincia": "Aosta", "sigla": "AO", "regione": "VALLE D'AOSTA" },
    { "provincia": "Arezzo", "sigla": "AR", "regione": "TOSCANA" },
    { "provincia": "Ascoli Piceno", "sigla": "AP", "regione": "MARCHE" },
    { "provincia": "Asti", "sigla": "AT", "regione": "PIEMONTE" },
    { "provincia": "Avellino", "sigla": "AV", "regione": "CAMPANIA" },
    { "provincia": "Bari", "sigla": "BA", "regione": "PUGLIA" },
    { "provincia": "Barletta-Andria-Trani", "sigla": "BT", "regione": "PUGLIA" },
    { "provincia": "Belluno", "sigla": "BL", "regione": "VENETO" },
    { "provincia": "Benevento", "sigla": "BN", "regione": "CAMPANIA" },
    { "provincia": "Bergamo", "sigla": "BG", "regione": "LOMBARDIA" },
    { "provincia": "Biella", "sigla": "BI", "regione": "PIEMONTE" },
    { "provincia": "Bologna", "sigla": "BO", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Bolzano", "sigla": "BZ", "regione": "PROV. AUT. BOLZANO" },
    { "provincia": "Brescia", "sigla": "BS", "regione": "LOMBARDIA" },
    { "provincia": "Brindisi", "sigla": "BR", "regione": "PUGLIA" },
    { "provincia": "Cagliari", "sigla": "CA", "regione": "SARDEGNA" },
    { "provincia": "Caltanissetta", "sigla": "CL", "regione": "SICILIA" },
    { "provincia": "Campobasso", "sigla": "CB", "regione": "MOLISE" },
    { "provincia": "Caserta", "sigla": "CE", "regione": "CAMPANIA" },
    { "provincia": "Catania", "sigla": "CT", "regione": "SICILIA" },
    { "provincia": "Catanzaro", "sigla": "CZ", "regione": "CALABRIA" },
    { "provincia": "Chieti", "sigla": "CH", "regione": "ABRUZZO" },
    { "provincia": "Como", "sigla": "CO", "regione": "LOMBARDIA" },
    { "provincia": "Cosenza", "sigla": "CS", "regione": "CALABRIA" },
    { "provincia": "Cremona", "sigla": "CR", "regione": "LOMBARDIA" },
    { "provincia": "Crotone", "sigla": "KR", "regione": "CALABRIA" },
    { "provincia": "Cuneo", "sigla": "CN", "regione": "PIEMONTE" },
    { "provincia": "Enna", "sigla": "EN", "regione": "SICILIA" },
    { "provincia": "Fermo", "sigla": "FM", "regione": "MARCHE" },
    { "provincia": "Ferrara", "sigla": "FE", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Firenze", "sigla": "FI", "regione": "TOSCANA" },
    { "provincia": "Foggia", "sigla": "FG", "regione": "PUGLIA" },
    { "provincia": "Forlì-Cesena", "sigla": "FC", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Frosinone", "sigla": "FR", "regione": "LAZIO" },
    { "provincia": "Genova", "sigla": "GE", "regione": "LIGURIA" },
    { "provincia": "Gorizia", "sigla": "GO", "regione": "FRIULI-VENEZIA GIULIA" },
    { "provincia": "Grosseto", "sigla": "GR", "regione": "TOSCANA" },
    { "provincia": "Imperia", "sigla": "IM", "regione": "LIGURIA" },
    { "provincia": "Isernia", "sigla": "IS", "regione": "MOLISE" },
    { "provincia": "L'Aquila", "sigla": "AQ", "regione": "ABRUZZO" },
    { "provincia": "La Spezia", "sigla": "SP", "regione": "LIGURIA" },
    { "provincia": "Latina", "sigla": "LT", "regione": "LAZIO" },
    { "provincia": "Lecce", "sigla": "LE", "regione": "PUGLIA" },
    { "provincia": "Lecco", "sigla": "LC", "regione": "LOMBARDIA" },
    { "provincia": "Livorno", "sigla": "LI", "regione": "Toscana" },
    { "provincia": "Lodi", "sigla": "LO", "regione": "LOMBARDIA" },
    { "provincia": "Lucca", "sigla": "LU", "regione": "TOSCANA" },
    { "provincia": "Macerata", "sigla": "MC", "regione": "MARCHE" },
    { "provincia": "Mantova", "sigla": "MN", "regione": "LOMBARDIA" },
    { "provincia": "Massa-Carrara", "sigla": "MS", "regione": "TOSCANA" },
    { "provincia": "Matera", "sigla": "MT", "regione": "BASILICATA" },
    { "provincia": "Messina", "sigla": "ME", "regione": "SICILIA" },
    { "provincia": "Milano", "sigla": "MI", "regione": "LOMBARDIA" },
    { "provincia": "Modena", "sigla": "MO", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Monza e della Brianza", "sigla": "MB", "regione": "LOMBARDIA" },
    { "provincia": "Napoli", "sigla": "NA", "regione": "CAMPANIA" },
    { "provincia": "Novara", "sigla": "NO", "regione": "PIEMONTE" },
    { "provincia": "Nuoro", "sigla": "NU", "regione": "SARDEGNA" },
    { "provincia": "Oristano", "sigla": "OR", "regione": "SARDEGNA" },
    { "provincia": "Padova", "sigla": "PD", "regione": "VENETO" },
    { "provincia": "Palermo", "sigla": "PA", "regione": "SICILIA" },
    { "provincia": "Parma", "sigla": "PR", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Pavia", "sigla": "PV", "regione": "LOMBARDIA" },
    { "provincia": "Perugia", "sigla": "PG", "regione": "UMBRIA" },
    { "provincia": "Pesaro e Urbino", "sigla": "PU", "regione": "MARCHE" },
    { "provincia": "Pescara", "sigla": "PE", "regione": "ABRUZZO" },
    { "provincia": "Piacenza", "sigla": "PC", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Pisa", "sigla": "PI", "regione": "TOSCANA" },
    { "provincia": "Pistoia", "sigla": "PT", "regione": "TOSCANA" },
    { "provincia": "Pordenone", "sigla": "PN", "regione": "FRIULI-VENEZIA GIULIA" },
    { "provincia": "Potenza", "sigla": "PZ", "regione": "BASILICATA" },
    { "provincia": "Prato", "sigla": "PO", "regione": "TOSCANA" },
    { "provincia": "Ragusa", "sigla": "RG", "regione": "SICILIA" },
    { "provincia": "Ravenna", "sigla": "RA", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Reggio Calabria", "sigla": "RC", "regione": "CALABRIA" },
    { "provincia": "Reggio Emilia", "sigla": "RE", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Rieti", "sigla": "RI", "regione": "LAZIO" },
    { "provincia": "Rimini", "sigla": "RN", "regione": "EMILIA-ROMAGNA" },
    { "provincia": "Roma", "sigla": "RM", "regione": "LAZIO" },
    { "provincia": "Rovigo", "sigla": "RO", "regione": "VENETO" },
    { "provincia": "Salerno", "sigla": "SA", "regione": "CAMPANIA" },
    { "provincia": "Sassari", "sigla": "SS", "regione": "SARDEGNA" },
    { "provincia": "Savona", "sigla": "SV", "regione": "LIGURIA" },
    { "provincia": "Siena", "sigla": "SI", "regione": "TOSCANA" },
    { "provincia": "Siracusa", "sigla": "SR", "regione": "SICILIA" },
    { "provincia": "Sondrio", "sigla": "SO", "regione": "LOMBARDIA" },
    { "provincia": "Taranto", "sigla": "TA", "regione": "PUGLIA" },
    { "provincia": "Teramo", "sigla": "TE", "regione": "ABRUZZO" },
    { "provincia": "Terni", "sigla": "TR", "regione": "UMBRIA" },
    { "provincia": "Torino", "sigla": "TO", "regione": "PIEMONTE" },
    { "provincia": "Trapani", "sigla": "TP", "regione": "SICILIA" },
    { "provincia": "Trento", "sigla": "TN", "regione": "PROV. AUT. TRENTO" },
    { "provincia": "Treviso", "sigla": "TV", "regione": "VENETO" },
    { "provincia": "Trieste", "sigla": "TS", "regione": "FRIULI-VENEZIA GIULIA" },
    { "provincia": "Udine", "sigla": "UD", "regione": "FRIULI-VENEZIA GIULIA" },
    { "provincia": "Varese", "sigla": "VA", "regione": "LOMBARDIA" },
    { "provincia": "Venezia", "sigla": "VE", "regione": "VENETO" },
    { "provincia": "Verbania-Cusio-Ossola", "sigla": "VB", "regione": "PIEMONTE" },
    { "provincia": "Vercelli", "sigla": "VC", "regione": "PIEMONTE" },
    { "provincia": "Verona", "sigla": "VR", "regione": "VENETO" },
    { "provincia": "Vibo Valentia", "sigla": "VV", "regione": "CALABRIA" },
    { "provincia": "Vicenza", "sigla": "VI", "regione": "VENETO" },
    { "provincia": "Viterbo", "sigla": "VT", "regione": "LAZIO" },
    { "provincia": "Sud Sardegna", "sigla": "SU", "regione": "SARDEGNA" }
];

/**
 * Dati Addizionali Comunali per i Capoluoghi.
 * Estratto dal file Add_comunale_irpef2025_b.csv per le principali città.
 */
export const MUNICIPAL_TAX_RATES: Record<string, MunicipalTaxConfig> = {
    "ROMA": {
        multiAliquota: true,
        sogliaEsenzione: 14000,
        // Dal CSV: SI;0;Esenzione...;,9;Aliquota unica (Attenzione: Roma ha regole complesse, il CSV dice aliquota unica 0.9 oltre soglia)
        aliquotaUnica: 0.9,
        scaglioni: [] 
    },
    "MILANO": {
        multiAliquota: true,
        sogliaEsenzione: 15000, // Fonte CSV: SI;0;Esenzione... 15.000,00;,8;Aliquota unica
        aliquotaUnica: 0.8
    },
    "TORINO": {
        multiAliquota: false, // Fonte CSV: NO
        sogliaEsenzione: 0,
        aliquotaUnica: 0.8 // Fonte CSV: ALIQUOTA 0,8
    },
    "NAPOLI": {
        multiAliquota: false, // Fonte CSV: NO
        sogliaEsenzione: 0,
        aliquotaUnica: 0.8 // Fonte CSV: ALIQUOTA 0,8
    },
    "PALERMO": {
        multiAliquota: false, // Fonte CSV: NO
        sogliaEsenzione: 0,
        aliquotaUnica: 1.014 // Fonte CSV: 1,014
    },
    "GENOVA": {
        multiAliquota: true, // Fonte CSV: SI
        sogliaEsenzione: 14000,
        // Nota: Genova ha scaglioni complessi nel CSV (0 a 28k: 1.1, oltre: 1.2?? No, CSV dice "Applicabile a scaglione... 1", "1,1", "1,2")
        // Interpretazione CSV per Genova: 
        // 0-28k -> 1%? No, il CSV dice ALIQUOTA: 0 (esenzione?), ALIQUOTA_2: 1 (0-28k), ALIQUOTA_3: 1.1 (28-50k), ALIQUOTA_4: 1.2 (>50k)
        scaglioni: [
            { soglia: 28000, aliquota: 1.0 }, // Approssimato dalla lettura del CSV
            { soglia: 50000, aliquota: 1.1 },
            { soglia: Infinity, aliquota: 1.2 }
        ]
    },
    "BOLOGNA": {
        multiAliquota: false, // Fonte CSV: NO
        sogliaEsenzione: 0,
        aliquotaUnica: 0.8
    },
    "FIRENZE": {
        multiAliquota: false, // Fonte CSV: NO
        sogliaEsenzione: 0,
        aliquotaUnica: 0.8 // Assunto standard se non specificato diversamente, ma Firenze spesso è 0.2 o variabile. 
        // Dal CSV (line D612): 0* (Dati mancanti o illeggibili nel dump fornito, uso default max)
    },
    "BARI": {
        multiAliquota: false, // Fonte CSV: NO
        sogliaEsenzione: 0,
        aliquotaUnica: 0.8
    },
    "VENEZIA": {
        multiAliquota: false, // Fonte CSV: NO
        sogliaEsenzione: 0,
        aliquotaUnica: 0.8
    },
    // Default fallback for others
    "DEFAULT": {
        multiAliquota: false,
        sogliaEsenzione: 0,
        aliquotaUnica: 0.8
    }
};
