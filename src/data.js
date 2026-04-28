// ÁLBUM PANINI FIFA WORLD CUP 2026

// 48 selecciones · 20 figuritas cada una · orden de grupos A→L

function makeSeleccion(id, nombre, flag, grupo) {
  return {
    id, nombre, flag, grupo,
    figuritas: Array.from({ length: 20 }, (_, i) => ({
      id: `${id}-${i + 1}`,
      label: `${id} ${i + 1}`,
    })),
  };
}

export const GRUPOS = [
  { grupo: "A", selecciones: [
    makeSeleccion("MEX", "México",          "🇲🇽", "A"),
    makeSeleccion("RSA", "Sudáfrica",        "🇿🇦", "A"),
    makeSeleccion("KOR", "Corea del Sur",    "🇰🇷", "A"),
    makeSeleccion("CZE", "República Checa",  "🇨🇿", "A"),
  ]},
  { grupo: "B", selecciones: [
    makeSeleccion("CAN", "Canadá",             "🇨🇦", "B"),
    makeSeleccion("BIH", "Bosnia-Herzegovina", "🇧🇦", "B"),
    makeSeleccion("QAT", "Qatar",              "🇶🇦", "B"),
    makeSeleccion("SUI", "Suiza",              "🇨🇭", "B"),
  ]},
  { grupo: "C", selecciones: [
    makeSeleccion("BRA", "Brasil",    "🇧🇷", "C"),
    makeSeleccion("MAR", "Marruecos", "🇲🇦", "C"),
    makeSeleccion("HAI", "Haití",     "🇭🇹", "C"),
    makeSeleccion("SCO", "Escocia",   "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "C"),
  ]},
  { grupo: "D", selecciones: [
    makeSeleccion("USA", "Estados Unidos", "🇺🇸", "D"),
    makeSeleccion("PAR", "Paraguay",       "🇵🇾", "D"),
    makeSeleccion("AUS", "Australia",      "🇦🇺", "D"),
    makeSeleccion("TUR", "Turquía",        "🇹🇷", "D"),
  ]},
  { grupo: "E", selecciones: [
    makeSeleccion("GER", "Alemania",        "🇩🇪", "E"),
    makeSeleccion("CUW", "Curazao",         "🇨🇼", "E"),
    makeSeleccion("CIV", "Costa de Marfil", "🇨🇮", "E"),
    makeSeleccion("ECU", "Ecuador",         "🇪🇨", "E"),
  ]},
  { grupo: "F", selecciones: [
    makeSeleccion("NED", "Países Bajos", "🇳🇱", "F"),
    makeSeleccion("JPN", "Japón",        "🇯🇵", "F"),
    makeSeleccion("SWE", "Suecia",       "🇸🇪", "F"),
    makeSeleccion("TUN", "Túnez",        "🇹🇳", "F"),
  ]},
  { grupo: "G", selecciones: [
    makeSeleccion("BEL", "Bélgica",       "🇧🇪", "G"),
    makeSeleccion("EGY", "Egipto",        "🇪🇬", "G"),
    makeSeleccion("IRN", "Irán",          "🇮🇷", "G"),
    makeSeleccion("NZL", "Nueva Zelanda", "🇳🇿", "G"),
  ]},
  { grupo: "H", selecciones: [
    makeSeleccion("ESP", "España",         "🇪🇸", "H"),
    makeSeleccion("CPV", "Cabo Verde",     "🇨🇻", "H"),
    makeSeleccion("KSA", "Arabia Saudita", "🇸🇦", "H"),
    makeSeleccion("URU", "Uruguay",        "🇺🇾", "H"),
  ]},
  { grupo: "I", selecciones: [
    makeSeleccion("FRA", "Francia",  "🇫🇷", "I"),
    makeSeleccion("SEN", "Senegal",  "🇸🇳", "I"),
    makeSeleccion("IRQ", "Irak",     "🇮🇶", "I"),
    makeSeleccion("NOR", "Noruega",  "🇳🇴", "I"),
  ]},
  { grupo: "J", selecciones: [
    makeSeleccion("ARG", "Argentina", "🇦🇷", "J"),
    makeSeleccion("ALG", "Argelia",   "🇩🇿", "J"),
    makeSeleccion("AUT", "Austria",   "🇦🇹", "J"),
    makeSeleccion("JOR", "Jordania",  "🇯🇴", "J"),
  ]},
  { grupo: "K", selecciones: [
    makeSeleccion("POR", "Portugal",   "🇵🇹", "K"),
    makeSeleccion("COD", "Congo DR",   "🇨🇩", "K"),
    makeSeleccion("UZB", "Uzbekistán", "🇺🇿", "K"),
    makeSeleccion("COL", "Colombia",   "🇨🇴", "K"),
  ]},
  { grupo: "L", selecciones: [
    makeSeleccion("ENG", "Inglaterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "L"),
    makeSeleccion("CRO", "Croacia",    "🇭🇷", "L"),
    makeSeleccion("GHA", "Ghana",      "🇬🇭", "L"),
    makeSeleccion("PAN", "Panamá",     "🇵🇦", "L"),
  ]},
];

export const TODAS_LAS_SELECCIONES = GRUPOS.flatMap(g => g.selecciones);

// SECCIÓN FWC — Introducción e Historia
export const SECCION_FWC = {
  id: "FWC", nombre: "FIFA World Cup 2026", emoji: "🏆",
  color: "#C8981F", tag: "GRATIS",
  figuritas: [
    { id: "00",    label: "00 – MyPanini™" },
    { id: "FWC1",  label: "FWC 1 – Official Emblem" },
    { id: "FWC2",  label: "FWC 2 – Official Emblem 2" },
    { id: "FWC3",  label: "FWC 3 – Official Mascots" },
    { id: "FWC4",  label: "FWC 4 – Official Slogan" },
    { id: "FWC5",  label: "FWC 5 – Official Ball" },
    { id: "FWC6",  label: "FWC 6 – CAN Emblem" },
    { id: "FWC7",  label: "FWC 7 – MEX Emblem" },
    { id: "FWC8",  label: "FWC 8 – USA Emblem" },
    { id: "FWC9",  label: "FWC 9 – WC Italy 1934" },
    { id: "FWC10", label: "FWC 10 – WC Brazil 1950" },
    { id: "FWC11", label: "FWC 11 – WC Switzerland 1954" },
    { id: "FWC12", label: "FWC 12 – WC Chile 1962" },
    { id: "FWC13", label: "FWC 13 – WC Germany 1974" },
    { id: "FWC14", label: "FWC 14 – WC Mexico 1986" },
    { id: "FWC15", label: "FWC 15 – WC USA 1994" },
    { id: "FWC16", label: "FWC 16 – WC Korea/Japan 2002" },
    { id: "FWC17", label: "FWC 17 – WC Germany 2006" },
    { id: "FWC18", label: "FWC 18 – WC Brazil 2014" },
    { id: "FWC19", label: "FWC 19 – WC Qatar 2022 ⭐⭐⭐" },
  ],
};

// COCA-COLA CC1-CC12
export const SECCION_COCA_COLA = {
  id: "CC", nombre: "Coca-Cola Special Stickers", emoji: "🥤",
  color: "#C41E3A", tag: "PREMIUM",
  figuritas: Array.from({ length: 12 }, (_, i) => ({
    id: `CC${i + 1}`,
    label: `CC ${i + 1}`,
  })),
};