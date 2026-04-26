// ─── ESTRUCTURA OFICIAL PANINI MUNDIAL 2026 ───────────────────────────────────
// 980 figuritas · 112 páginas · 48 selecciones
//
// Numeración estimada basada en estructura publicada (se corregirá con álbum oficial):
//   1 –  20  → Presentación
//  21 –  52  → Estadios (16 × 2)
//  53 –  68  → Ciudades sede (16 × 1)
//  69 –  84  → Historia del Mundial
//  85 – 1044 → 48 selecciones × 20 = 960  → ajustado internamente
//              base real = 85 + índice*20
// Secciones premium: IDs string (CAM-xx, REC-xx, ES-xx, CC-xx)

export const TOTAL_ALBUM = 980;

export const LABEL_TIPO = [
  "Escudo ✦","Foto grupal",
  "Jugador 3","Jugador 4","Jugador 5","Jugador 6","Jugador 7",
  "Jugador 8","Jugador 9","Jugador 10","Jugador 11","Jugador 12",
  "Jugador 13","Jugador 14","Jugador 15","Jugador 16","Jugador 17",
  "Jugador 18","Jugador 19","Jugador 20",
];

// 48 selecciones con base = 85 + i*20
const RAW_TEAMS = [
  // GRUPO A
  { id:"USA", name:"Estados Unidos", flag:"🇺🇸", group:"A" },
  { id:"CAN", name:"Canadá",         flag:"🇨🇦", group:"A" },
  { id:"MEX", name:"México",         flag:"🇲🇽", group:"A" },
  { id:"URU", name:"Uruguay",        flag:"🇺🇾", group:"A" },
  // GRUPO B
  { id:"ARG", name:"Argentina",      flag:"🇦🇷", group:"B" },
  { id:"CHI", name:"Chile",          flag:"🇨🇱", group:"B" },
  { id:"PER", name:"Perú",           flag:"🇵🇪", group:"B" },
  { id:"POL", name:"Polonia",        flag:"🇵🇱", group:"B" },
  // GRUPO C
  { id:"BRA", name:"Brasil",         flag:"🇧🇷", group:"C" },
  { id:"COL", name:"Colombia",       flag:"🇨🇴", group:"C" },
  { id:"PAR", name:"Paraguay",       flag:"🇵🇾", group:"C" },
  { id:"GER", name:"Alemania",       flag:"🇩🇪", group:"C" },
  // GRUPO D
  { id:"FRA", name:"Francia",        flag:"🇫🇷", group:"D" },
  { id:"BEL", name:"Bélgica",        flag:"🇧🇪", group:"D" },
  { id:"AUT", name:"Austria",        flag:"🇦🇹", group:"D" },
  { id:"MAR", name:"Marruecos",      flag:"🇲🇦", group:"D" },
  // GRUPO E
  { id:"ESP", name:"España",         flag:"🇪🇸", group:"E" },
  { id:"POR", name:"Portugal",       flag:"🇵🇹", group:"E" },
  { id:"CRO", name:"Croacia",        flag:"🇭🇷", group:"E" },
  { id:"SUI", name:"Suiza",          flag:"🇨🇭", group:"E" },
  // GRUPO F
  { id:"ENG", name:"Inglaterra",     flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", group:"F" },
  { id:"NED", name:"Países Bajos",   flag:"🇳🇱", group:"F" },
  { id:"DEN", name:"Dinamarca",      flag:"🇩🇰", group:"F" },
  { id:"SRB", name:"Serbia",         flag:"🇷🇸", group:"F" },
  // GRUPO G
  { id:"KOR", name:"Corea del Sur",  flag:"🇰🇷", group:"G" },
  { id:"JPN", name:"Japón",          flag:"🇯🇵", group:"G" },
  { id:"AUS", name:"Australia",      flag:"🇦🇺", group:"G" },
  { id:"NGA", name:"Nigeria",        flag:"🇳🇬", group:"G" },
  // GRUPO H
  { id:"SEN", name:"Senegal",        flag:"🇸🇳", group:"H" },
  { id:"CMR", name:"Camerún",        flag:"🇨🇲", group:"H" },
  { id:"EGY", name:"Egipto",         flag:"🇪🇬", group:"H" },
  { id:"NOR", name:"Noruega",        flag:"🇳🇴", group:"H" },
  // GRUPO I
  { id:"ITA", name:"Italia",         flag:"🇮🇹", group:"I" },
  { id:"TUR", name:"Turquía",        flag:"🇹🇷", group:"I" },
  { id:"SCO", name:"Escocia",        flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", group:"I" },
  { id:"ALB", name:"Albania",        flag:"🇦🇱", group:"I" },
  // GRUPO J
  { id:"IRN", name:"Irán",           flag:"🇮🇷", group:"J" },
  { id:"SAU", name:"Arabia Saudita", flag:"🇸🇦", group:"J" },
  { id:"IRQ", name:"Irak",           flag:"🇮🇶", group:"J" },
  { id:"UZB", name:"Uzbekistán",     flag:"🇺🇿", group:"J" },
  // GRUPO K
  { id:"GHA", name:"Ghana",          flag:"🇬🇭", group:"K" },
  { id:"MLI", name:"Mali",           flag:"🇲🇱", group:"K" },
  { id:"CPV", name:"Cabo Verde",     flag:"🇨🇻", group:"K" },
  { id:"NZL", name:"Nueva Zelanda",  flag:"🇳🇿", group:"K" },
  // GRUPO L
  { id:"HAI", name:"Haití",          flag:"🇭🇹", group:"L" },
  { id:"HON", name:"Honduras",       flag:"🇭🇳", group:"L" },
  { id:"CUW", name:"Curazao",        flag:"🇨🇼", group:"L" },
  { id:"BIH", name:"Bosnia-Herz.",   flag:"🇧🇦", group:"L" },
];

export const TEAMS = RAW_TEAMS.map((t, i) => ({ ...t, base: 85 + i * 20 }));

export const GRUPOS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// ─── SECCIONES ESPECIALES GRATIS ─────────────────────────────────────────────
export const SECCIONES_LIBRES = [
  {
    id:"intro", name:"Presentación del Álbum", emoji:"🏆", color:"#C8981F", tag:"GRATIS",
    desc:"Logo oficial, trofeo FIFA, mascota Taíno, balón y afiches del torneo",
    stickers:[
      {n:1,  label:"Logo Oficial Copa Mundial 2026"},
      {n:2,  label:"Trofeo FIFA Copa del Mundo"},
      {n:3,  label:"Mascota Taíno – Presentación"},
      {n:4,  label:"Mascota Taíno – En acción"},
      {n:5,  label:"Balón Oficial Conextball"},
      {n:6,  label:"Afiche oficial del torneo"},
      {n:7,  label:"Logo anfitrión USA"},
      {n:8,  label:"Logo anfitrión Canadá"},
      {n:9,  label:"Logo anfitrión México"},
      {n:10, label:"Emblema FIFA World Cup"},
      {n:11, label:"Panini – 56 años en Mundiales"},
      {n:12, label:"Presentación del álbum"},
      {n:13, label:"Calendario fase de grupos"},
      {n:14, label:"Llaves del torneo"},
      {n:15, label:"Portada edición global"},
      {n:16, label:"Portada edición América"},
      {n:17, label:"Copa del Mundo – Detalle 1"},
      {n:18, label:"Copa del Mundo – Detalle 2"},
      {n:19, label:"Ceremonia de apertura"},
      {n:20, label:"El partido final"},
    ],
  },
  {
    id:"estadios", name:"Estadios y Sedes", emoji:"🏟️", color:"#1A4FAB", tag:"GRATIS",
    desc:"Los 16 estadios de USA, Canadá y México – 2 figuritas por sede",
    stickers:[
      {n:21, label:"MetLife Stadium – Nueva York/NJ"},
      {n:22, label:"MetLife Stadium – Interior"},
      {n:23, label:"SoFi Stadium – Los Ángeles"},
      {n:24, label:"SoFi Stadium – Interior"},
      {n:25, label:"AT&T Stadium – Dallas"},
      {n:26, label:"AT&T Stadium – Interior"},
      {n:27, label:"NRG Stadium – Houston"},
      {n:28, label:"NRG Stadium – Interior"},
      {n:29, label:"Levi's Stadium – San Francisco"},
      {n:30, label:"Levi's Stadium – Interior"},
      {n:31, label:"Empower Field – Denver"},
      {n:32, label:"Empower Field – Interior"},
      {n:33, label:"Arrowhead Stadium – Kansas City"},
      {n:34, label:"Arrowhead Stadium – Interior"},
      {n:35, label:"Hard Rock Stadium – Miami"},
      {n:36, label:"Hard Rock Stadium – Interior"},
      {n:37, label:"Lincoln Financial Field – Filadelfia"},
      {n:38, label:"Lincoln Financial Field – Interior"},
      {n:39, label:"Gillette Stadium – Boston"},
      {n:40, label:"Gillette Stadium – Interior"},
      {n:41, label:"Lumen Field – Seattle"},
      {n:42, label:"Lumen Field – Interior"},
      {n:43, label:"BMO Field – Toronto"},
      {n:44, label:"BMO Field – Interior"},
      {n:45, label:"BC Place – Vancouver"},
      {n:46, label:"BC Place – Interior"},
      {n:47, label:"Estadio Azteca – Ciudad de México"},
      {n:48, label:"Estadio Azteca – Interior"},
      {n:49, label:"Estadio BBVA – Monterrey"},
      {n:50, label:"Estadio BBVA – Interior"},
      {n:51, label:"Estadio Akron – Guadalajara"},
      {n:52, label:"Estadio Akron – Interior"},
    ],
  },
  {
    id:"ciudades", name:"Ciudades Sede", emoji:"🌆", color:"#236B2E", tag:"GRATIS",
    desc:"Las 16 ciudades anfitrionas del torneo en los 3 países",
    stickers:[
      {n:53, label:"Nueva York / Nueva Jersey"},
      {n:54, label:"Los Ángeles"},
      {n:55, label:"Dallas"},
      {n:56, label:"Houston"},
      {n:57, label:"San Francisco / Bay Area"},
      {n:58, label:"Denver"},
      {n:59, label:"Kansas City"},
      {n:60, label:"Miami"},
      {n:61, label:"Filadelfia"},
      {n:62, label:"Boston / Foxborough"},
      {n:63, label:"Seattle"},
      {n:64, label:"Toronto"},
      {n:65, label:"Vancouver"},
      {n:66, label:"Ciudad de México"},
      {n:67, label:"Monterrey"},
      {n:68, label:"Guadalajara"},
    ],
  },
  {
    id:"historia", name:"Historia del Mundial", emoji:"📖", color:"#7A3FAB", tag:"GRATIS",
    desc:"Campeones históricos y momentos icónicos de todas las ediciones",
    stickers:[
      {n:69, label:"1930 Uruguay – El primer campeón"},
      {n:70, label:"1950 Brasil – El Maracanazo"},
      {n:71, label:"1958 Brasil – El joven Pelé"},
      {n:72, label:"1966 Inglaterra – Wembley"},
      {n:73, label:"1970 Brasil – El equipo perfecto"},
      {n:74, label:"1978 Argentina – Campeón en casa"},
      {n:75, label:"1986 Argentina – Maradona en México"},
      {n:76, label:"1994 Brasil – El tetracampeón"},
      {n:77, label:"1998 Francia – Zidane brilló"},
      {n:78, label:"2002 Brasil – El pentacampeón"},
      {n:79, label:"2006 Italia – Campeón en Berlín"},
      {n:80, label:"2010 España – La Roja triunfó"},
      {n:81, label:"2014 Alemania – 7-1 histórico"},
      {n:82, label:"2018 Francia – La generación dorada"},
      {n:83, label:"2022 Argentina – Messi tricampeón"},
      {n:84, label:"Los máximos goleadores históricos"},
    ],
  },
];

// ─── SECCIONES PREMIUM ────────────────────────────────────────────────────────
const EXTRA_PLAYERS = [
  "Messi","Mbappé","Vinicius Jr.","Ronaldo","Bellingham",
  "Pedri","Lamine Yamal","Endrick","Wirtz","Salah",
  "Hakimi","L. Díaz","Pulisic","Davies","Lautaro M.",
  "Haaland","Olmo","Osimhen","Son","Minamino",
];

const EXTRA_VARIANTS = [
  { label:"Morado", prefix:"M", color:"#7B2D8B" },
  { label:"Bronce",  prefix:"B", color:"#8B6914" },
  { label:"Plata",   prefix:"P", color:"#607080" },
  { label:"Oro",     prefix:"O", color:"#C8981F" },
];

function buildExtraStickers() {
  const s = [];
  for (const v of EXTRA_VARIANTS) {
    for (let i = 0; i < EXTRA_PLAYERS.length; i++) {
      s.push({
        n: `ES-${v.prefix}${String(i+1).padStart(2,"0")}`,
        label: `${EXTRA_PLAYERS[i]} – ${v.label}`,
        variantColor: v.color,
        variantLabel: v.label,
        variantPrefix: v.prefix,
      });
    }
  }
  return s;
}

export const SECCIONES_PREMIUM = [
  {
    id:"camino", name:"Camino al Mundial", emoji:"🛣️", color:"#D4631A", tag:"PREMIUM",
    desc:"Clasificatorias, repechajes y los debutantes históricos del torneo",
    stickers:[
      {n:"CAM-01", label:"CONMEBOL – Eliminatorias Sudamericanas"},
      {n:"CAM-02", label:"UEFA – Clasificatoria Europea"},
      {n:"CAM-03", label:"CONCACAF – Clasificatoria"},
      {n:"CAM-04", label:"CAF – Clasificatoria Africana"},
      {n:"CAM-05", label:"AFC – Clasificatoria Asiática"},
      {n:"CAM-06", label:"OFC – Clasificatoria Oceanía"},
      {n:"CAM-07", label:"Repechaje Intercontinental"},
      {n:"CAM-08", label:"Último clasificado – Irak"},
      {n:"CAM-09", label:"Debutante: Cabo Verde 🇨🇻"},
      {n:"CAM-10", label:"Debutante: Curazao 🇨🇼"},
      {n:"CAM-11", label:"Debutante: Uzbekistán 🇺🇿"},
      {n:"CAM-12", label:"Debutante: Jordania 🇯🇴"},
      {n:"CAM-13", label:"Regreso: Noruega 🇳🇴"},
      {n:"CAM-14", label:"Regreso: Escocia 🏴󠁧󠁢󠁳󠁣󠁴󠁿"},
      {n:"CAM-15", label:"Regreso: Haití 🇭🇹"},
      {n:"CAM-16", label:"Regreso: Bosnia-Herzegovina 🇧🇦"},
    ],
  },
  {
    id:"records", name:"Récords e Historia", emoji:"📊", color:"#B83232", tag:"PREMIUM",
    desc:"Los números más increíbles del torneo más grande de la historia",
    stickers:[
      {n:"REC-01", label:"48 selecciones – El torneo más grande"},
      {n:"REC-02", label:"104 partidos en total"},
      {n:"REC-03", label:"3 países anfitriones – Inédito"},
      {n:"REC-04", label:"16 estadios en Norteamérica"},
      {n:"REC-05", label:"Máximos goleadores del torneo"},
      {n:"REC-06", label:"Récords de asistencia al estadio"},
      {n:"REC-07", label:"Más Mundiales jugados – histórico"},
      {n:"REC-08", label:"El álbum más grande de la historia"},
    ],
  },
  {
    id:"extra", name:"Extra Stickers Coleccionables", emoji:"✨", color:"#B8860B", tag:"PREMIUM",
    desc:"80 figuritas exclusivas: 20 jugadores × 4 variantes de rareza. ¡No van en el álbum!",
    extraVariants: EXTRA_VARIANTS,
    extraPlayers: EXTRA_PLAYERS,
    stickers: buildExtraStickers(),
  },
  {
    id:"coca", name:"Figuritas Coca-Cola", emoji:"🥤", color:"#C41E3A", tag:"PREMIUM",
    desc:"12 figuritas exclusivas bajo la etiqueta de botellas Coca-Cola 600ml",
    stickers:[
      {n:"CC-01", label:"Lautaro Martínez 🇦🇷"},
      {n:"CC-02", label:"Alphonso Davies 🇨🇦"},
      {n:"CC-03", label:"Christian Pulisic 🇺🇸"},
      {n:"CC-04", label:"Lionel Messi 🇦🇷"},
      {n:"CC-05", label:"Kylian Mbappé 🇫🇷"},
      {n:"CC-06", label:"Vinicius Jr. 🇧🇷"},
      {n:"CC-07", label:"Lamine Yamal 🇪🇸"},
      {n:"CC-08", label:"Jude Bellingham 🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
      {n:"CC-09", label:"Pedri 🇪🇸"},
      {n:"CC-10", label:"Son Heung-min 🇰🇷"},
      {n:"CC-11", label:"Erling Haaland 🇳🇴"},
      {n:"CC-12", label:"Mohamed Salah 🇪🇬"},
    ],
  },
];
