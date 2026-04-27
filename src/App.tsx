// @ts-nocheck
import { supabase } from './supabase.js';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  TEAMS, GRUPOS, TOTAL_ALBUM, LABEL_TIPO,
  SECCIONES_LIBRES, SECCIONES_PREMIUM,
} from "./data.js";

// ─── PALETA ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#F4EFE4", card:"#FFFFFF", dark:"#16120A",
  gold:"#C8981F", goldL:"#EFC84A",
  green:"#236B2E", greenL:"#4CAF50",
  red:"#B83232", orange:"#D4631A", blue:"#1A4FAB",
  purple:"#7A3FAB", border:"#DDD5BC", muted:"#7A6E54",
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function load(k, d) { try { return JSON.parse(localStorage.getItem(k) ?? "null") ?? d; } catch { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ─── CHIP ─────────────────────────────────────────────────────────────────────
function Chip({ id, label, state, onCycle }) {
  const ST = [
    { bg:"#EDE8DC", border:"#C8BFA0", text:C.muted },
    { bg:"#C8E6C9", border:"#66BB6A", text:"#1B5E20" },
    { bg:"#FFE0B2", border:"#FFA726", text:"#BF360C" },
  ];
  const s = ST[state] || ST[0];
  const shortId = typeof id === "string"
    ? id.replace(/^(ES|CC|CAM|REC)-/, "")
    : String(id);
  return (
    <button
      onClick={onCycle}
      title={`#${id} · ${label}`}
      style={{
        background:s.bg, border:`2px solid ${s.border}`,
        borderRadius:6, padding:"3px 1px", cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center",
        minWidth:0, transition:"box-shadow 0.1s",
        boxShadow: state > 0 ? `0 1px 4px ${s.border}99` : "none",
      }}
    >
      <span style={{ fontSize:8, color:s.text, fontWeight:900, lineHeight:1 }}>{shortId}</span>
      <span style={{ fontSize:6.5, color:s.text, opacity:0.8, lineHeight:1, marginTop:1 }}>
        {state === 0 ? "—" : state === 1 ? "✓" : "×2"}
      </span>
    </button>
  );
}

// ─── LEYENDA DE CHIPS ─────────────────────────────────────────────────────────
function ChipLegend() {
  return (
    <div style={{ display:"flex", gap:14, justifyContent:"center", marginTop:8 }}>
      {[["— Sin marcar", C.muted],["✓ La tengo","#1B5E20"],["×2 Repetida","#BF360C"]].map(([t,c]) => (
        <span key={t} style={{ fontSize:9, color:c, fontWeight:700 }}>{t}</span>
      ))}
    </div>
  );
}

// ─── TARJETA SELECCIÓN ────────────────────────────────────────────────────────
function TeamCard({ team, stickers, onCycle, isOpen, onOpen }) {
  const ids  = useMemo(() => Array.from({length:20}, (_,i) => team.base + i), [team.base]);
  const have = ids.filter(id => (stickers[id]??0) >= 1).length;
  const reps = ids.filter(id => (stickers[id]??0) >= 2).length;
  const pct  = Math.round(have / 20 * 100);
  const pctColor = pct === 100 ? C.green : pct > 60 ? C.gold : pct > 0 ? C.orange : C.muted;

  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`,
      borderRadius:12, overflow:"hidden", marginBottom:7,
      boxShadow: isOpen ? "0 4px 16px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <button onClick={onOpen} style={{
        width:"100%", background:"none", border:"none",
        padding:"10px 13px", cursor:"pointer",
        display:"flex", alignItems:"center", gap:9,
      }}>
        <span style={{ fontSize:24, lineHeight:1, flexShrink:0 }}>{team.flag}</span>
        <div style={{ flex:1, textAlign:"left" }}>
          <div style={{ fontSize:14, fontWeight:800, lineHeight:1.1 }}>{team.name}</div>
          <div style={{ fontSize:9, color:C.muted, letterSpacing:1.5 }}>
            GRUPO {team.group} · #{team.base}–{team.base+19}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:17, fontWeight:900, color:pctColor }}>{pct}%</div>
          <div style={{ fontSize:9, color:C.muted }}>{have}/20</div>
        </div>
        {reps > 0 && (
          <div style={{
            background:C.orange, color:"white", borderRadius:8,
            padding:"2px 6px", fontSize:9, fontWeight:800, flexShrink:0,
          }}>+{reps}🔁</div>
        )}
        <span style={{ color:C.muted, fontSize:11, flexShrink:0, marginLeft:2 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Mini progress */}
      <div style={{ height:3, background:C.border, margin:"0 13px" }}>
        <div style={{
          height:"100%", width:`${pct}%`, borderRadius:2, transition:"width 0.4s",
          background: pct === 100
            ? `linear-gradient(90deg,${C.green},${C.greenL})`
            : `linear-gradient(90deg,${C.gold},${C.goldL})`,
        }} />
      </div>

      {isOpen && (
        <div style={{ padding:"10px 11px 12px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:4 }}>
            {ids.map((id, i) => (
              <Chip
                key={id} id={id}
                label={LABEL_TIPO[i] || `Jugador ${i+1}`}
                state={stickers[id] ?? 0}
                onCycle={() => onCycle(id)}
              />
            ))}
          </div>
          <ChipLegend />
        </div>
      )}
    </div>
  );
}

// ─── TARJETA SECCIÓN ESPECIAL ─────────────────────────────────────────────────
function SeccionCard({ sec, stickers, onCycle, isOpen, onOpen, isPremium, onUnlock }) {
  const locked = sec.tag === "PREMIUM" && !isPremium;
  const ids    = useMemo(() => sec.stickers.map(s => s.n), [sec]);
  const have   = ids.filter(id => (stickers[id]??0) >= 1).length;
  const reps   = ids.filter(id => (stickers[id]??0) >= 2).length;
  const total  = ids.length;
  const pct    = Math.round(have / total * 100);
  const isExtra = sec.id === "extra";

  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`,
      borderRadius:13, overflow:"hidden", marginBottom:9,
      boxShadow: isOpen ? "0 4px 18px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <button onClick={() => locked ? onUnlock() : onOpen()} style={{
        width:"100%", background:"none", border:"none",
        padding:"12px 14px", cursor:"pointer",
        display:"flex", alignItems:"center", gap:10,
      }}>
        <div style={{
          width:44, height:44, borderRadius:11, flexShrink:0,
          background:`linear-gradient(135deg,${sec.color}20,${sec.color}40)`,
          border:`2px solid ${sec.color}55`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
        }}>{sec.emoji}</div>

        <div style={{ flex:1, textAlign:"left" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:14, fontWeight:800, lineHeight:1.1 }}>{sec.name}</span>
            <span style={{
              fontSize:8, fontWeight:900, letterSpacing:1, padding:"1px 6px",
              borderRadius:10,
              background: locked ? "#F0EDE5" : `${sec.color}20`,
              color: locked ? C.muted : sec.color,
              border:`1px solid ${locked ? "#DDD5BC" : sec.color+"44"}`,
            }}>{locked ? `🔒 ${sec.tag}` : sec.tag}</span>
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.3 }}>
            {sec.desc.length > 58 ? sec.desc.slice(0,58)+"…" : sec.desc}
          </div>
        </div>

        <div style={{ textAlign:"right", flexShrink:0 }}>
          {locked ? (
            <div style={{ fontSize:13, color:C.gold, fontWeight:900 }}>$1</div>
          ) : (
            <>
              <div style={{ fontSize:17, fontWeight:900, color: pct===100 ? C.green : sec.color }}>
                {pct}%
              </div>
              <div style={{ fontSize:9, color:C.muted }}>{have}/{total}</div>
            </>
          )}
        </div>
        {!locked && reps > 0 && (
          <div style={{
            background:C.orange, color:"white", borderRadius:8,
            padding:"2px 6px", fontSize:9, fontWeight:800, flexShrink:0,
          }}>+{reps}🔁</div>
        )}
        <span style={{ color:C.muted, fontSize:11, flexShrink:0 }}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {!locked && (
        <div style={{ height:3, background:C.border, margin:"0 14px" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:sec.color, borderRadius:2, transition:"width 0.4s" }} />
        </div>
      )}

      {/* Contenido expandido */}
      {isOpen && !locked && (
        <div style={{ padding:"10px 11px 13px" }}>
          {isExtra ? (
            // Extra stickers: agrupar por variante
            sec.extraVariants.map(v => {
              const vStickers = sec.stickers.filter(s => s.variantPrefix === v.prefix);
              const vHave = vStickers.filter(s => (stickers[s.n]??0) >= 1).length;
              return (
                <div key={v.prefix} style={{ marginBottom:12 }}>
                  <div style={{
                    fontSize:11, fontWeight:900, color:v.color,
                    letterSpacing:1, marginBottom:5,
                    display:"flex", alignItems:"center", gap:6,
                  }}>
                    <span>
                      {v.prefix==="M"?"🟣":v.prefix==="B"?"🥉":v.prefix==="P"?"🥈":"🥇"}
                      {" "}{v.label}
                    </span>
                    <span style={{ color:C.muted, fontSize:9, fontWeight:700 }}>
                      {vHave}/{vStickers.length}
                    </span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:3 }}>
                    {vStickers.map(s => (
                      <Chip key={s.n} id={s.n} label={s.label}
                        state={stickers[s.n]??0} onCycle={()=>onCycle(s.n)} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              display:"grid",
              gridTemplateColumns:`repeat(${total > 20 ? 10 : Math.min(total, 8)},1fr)`,
              gap:4,
            }}>
              {sec.stickers.map(s => (
                <Chip key={s.n} id={s.n} label={s.label}
                  state={stickers[s.n]??0} onCycle={()=>onCycle(s.n)} />
              ))}
            </div>
          )}
          <ChipLegend />
        </div>
      )}

      {isOpen && locked && (
        <div style={{ padding:"14px 16px 16px", textAlign:"center" }}>
          <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>
            Esta sección es exclusiva del acceso Premium.
          </div>
          <button onClick={onUnlock} style={{
            padding:"9px 24px",
            background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
            border:"none", borderRadius:20, color:C.dark,
            fontSize:13, fontWeight:900, cursor:"pointer",
          }}>Desbloquear por $1 ✨</button>
        </div>
      )}
    </div>
  );
}

// ─── MODAL WHATSAPP ───────────────────────────────────────────────────────────
function WAModal({ stickers, onClose }) {
  const [mode,   setMode]   = useState("need");
  const [phone,  setPhone]  = useState(() => load("wa_phone",""));
  const [city,   setCity]   = useState(() => load("wa_city",""));
  const [copied, setCopied] = useState(false);

  const numericMissing  = Array.from({length:TOTAL_ALBUM}, (_,i) => i+1)
    .filter(n => (stickers[n]??0) === 0);
  const numericRepeated = Object.entries(stickers)
    .filter(([k,v]) => !isNaN(Number(k)) && v >= 2)
    .map(([k]) => Number(k));
  const extraRepeated = Object.entries(stickers)
    .filter(([k,v]) => isNaN(Number(k)) && v >= 2)
    .map(([k]) => k);
  const allRepeated = [...numericRepeated, ...extraRepeated];

  const buildMsg = () => {
    const loc = city ? ` (${city})` : "";
    if (mode === "need") {
      const nums = numericMissing.slice(0,40).join(", ");
      const more = numericMissing.length > 40 ? ` … y ${numericMissing.length-40} más` : "";
      return `🏆 *MUNDIAL 2026 – ME FALTAN*${loc}\n\n${nums}${more}\n\n_Tengo ${TOTAL_ALBUM - numericMissing.length}/${TOTAL_ALBUM} – Me faltan ${numericMissing.length}_\n¿Tenés alguna? ¡Canje! ⚽`;
    }
    const nums = allRepeated.slice(0,40).join(", ");
    const more = allRepeated.length > 40 ? ` … y ${allRepeated.length-40} más` : "";
    return `🏆 *MUNDIAL 2026 – TENGO REPETIDAS*${loc}\n\n${nums}${more}\n\n_${allRepeated.length} repetidas – Me faltan ${numericMissing.length}_\n¡Escribime para canjear! ⚽`;
  };

  const openWA = () => {
    save("wa_phone", phone); save("wa_city", city);
    const m   = encodeURIComponent(buildMsg());
    const url = phone
      ? `https://wa.me/${phone.replace(/\D/g,"")}?text=${m}`
      : `https://wa.me/?text=${m}`;
    window.open(url, "_blank");
  };

  const copyMsg = () => {
    navigator.clipboard?.writeText(buildMsg())
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); })
      .catch(() => {});
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100,
    }} onClick={onClose}>
      <div style={{
        background:C.card, borderRadius:"20px 20px 0 0",
        padding:"20px 18px 28px", width:"100%", maxWidth:480,
        maxHeight:"88vh", overflowY:"auto",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ width:36, height:4, background:C.border, borderRadius:2, margin:"0 auto 16px" }} />
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:32 }}>📲</div>
          <div style={{ fontSize:20, fontWeight:900, letterSpacing:1 }}>CANJEAR POR WHATSAPP</div>
          <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>
            {numericMissing.length} te faltan · {allRepeated.length} repetidas disponibles
          </div>
        </div>

        <div style={{ display:"flex", gap:7, marginBottom:12 }}>
          {[
            {id:"need",  l:`🔍 Me faltan (${numericMissing.length})`},
            {id:"offer", l:`🤝 Repetidas (${allRepeated.length})`},
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              flex:1, padding:"9px 6px",
              background: mode===m.id ? C.dark : C.bg,
              color: mode===m.id ? C.goldL : C.dark,
              border:`2px solid ${mode===m.id ? C.dark : C.border}`,
              borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:800,
            }}>{m.l}</button>
          ))}
        </div>

        {/* Preview */}
        <div style={{
          background:"#E7FFDB", border:"1px solid #B2DFBB",
          borderRadius:10, padding:"10px 12px", fontSize:11, lineHeight:1.7,
          maxHeight:130, overflowY:"auto", marginBottom:12,
          fontFamily:"monospace", whiteSpace:"pre-wrap",
        }}>
          {buildMsg()}
        </div>

        <input
          value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="📞 Tu número WhatsApp (ej: 5491155556666)"
          style={{
            width:"100%", padding:"9px 12px", marginBottom:7,
            background:C.bg, border:`1px solid ${C.border}`,
            borderRadius:9, fontSize:13, outline:"none", boxSizing:"border-box",
          }}
        />
        <input
          value={city} onChange={e => setCity(e.target.value)}
          placeholder="📍 Tu ciudad (para encontrar canjeadores cerca)"
          style={{
            width:"100%", padding:"9px 12px", marginBottom:13,
            background:C.bg, border:`1px solid ${C.border}`,
            borderRadius:9, fontSize:13, outline:"none", boxSizing:"border-box",
          }}
        />

        <button onClick={openWA} style={{
          width:"100%", padding:13, background:"#25D366",
          border:"none", borderRadius:11, color:"white",
          fontSize:16, fontWeight:900, cursor:"pointer", letterSpacing:1, marginBottom:8,
        }}>
          📲 ABRIR WHATSAPP
        </button>
        <button onClick={copyMsg} style={{
          width:"100%", padding:11, background:C.bg,
          border:`1px solid ${C.border}`, borderRadius:11,
          color:C.dark, fontSize:13, fontWeight:800, cursor:"pointer",
        }}>
          {copied ? "✅ ¡Copiado!" : "📋 Copiar mensaje"}
        </button>
      </div>
    </div>
  );
}

// ─── MODAL IMPORTAR / EXPORTAR ────────────────────────────────────────────────
function ImportExportModal({ stickers, onImport, onClose, isPremium, onUnlock }) {
  const [text,   setText]   = useState("");
  const [msg,    setMsg]    = useState("");
  const [copied, setCopied] = useState(false);

  const exportStr = () => {
    const parts = Object.entries(stickers)
      .filter(([,v]) => v >= 1)
      .map(([k,v]) => v >= 2 ? `${k}x${v}` : String(k));
    return parts.length ? parts.join(",") : "(ninguna aún)";
  };

  const doImport = () => {
    const next = {};
    text.split(/[\s,;]+/).forEach(tok => {
      const m = tok.match(/^([A-Za-z0-9-]+)(x(\d+))?$/i);
      if (!m) return;
      const rawId = m[1];
      const id    = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const qty   = m[3] ? parseInt(m[3]) : 1;
      if (typeof id === "number" && (id < 1 || id > 9999)) return;
      next[id] = qty;
    });
    if (Object.keys(next).length === 0) { setMsg("❌ No se reconoció ningún número"); return; }
    onImport(next);
    setMsg(`✅ ${Object.keys(next).length} figuritas importadas correctamente`);
    setText("");
  };

  const copyExport = () => {
    navigator.clipboard?.writeText(exportStr())
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => setMsg("Seleccioná el texto y copiá manualmente"));
  };

  if (!isPremium) {
    return (
      <div style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
        display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100,
      }} onClick={onClose}>
        <div style={{
          background:C.card, borderRadius:"20px 20px 0 0",
          padding:"26px 18px 32px", width:"100%", maxWidth:480, textAlign:"center",
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize:36, marginBottom:10 }}>📥</div>
          <div style={{ fontSize:19, fontWeight:900, marginBottom:8 }}>Importar / Exportar</div>
          <div style={{ color:C.muted, fontSize:13, marginBottom:20, lineHeight:1.6 }}>
            Guardá tu colección como texto y recuperala en otro celular. Función Premium.
          </div>
          <button onClick={onUnlock} style={{
            padding:"13px 32px",
            background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
            border:"none", borderRadius:12, color:C.dark,
            fontSize:17, fontWeight:900, cursor:"pointer",
          }}>Desbloquear por $1 ✨</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100,
    }} onClick={onClose}>
      <div style={{
        background:C.card, borderRadius:"20px 20px 0 0",
        padding:"22px 18px 30px", width:"100%", maxWidth:480,
        maxHeight:"82vh", overflowY:"auto",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ width:36, height:4, background:C.border, borderRadius:2, margin:"0 auto 16px" }} />
        <div style={{ fontSize:18, fontWeight:900, marginBottom:14, letterSpacing:1 }}>
          📥 IMPORTAR / EXPORTAR
        </div>

        <div style={{ fontSize:11, fontWeight:700, marginBottom:5, color:C.muted }}>
          TU COLECCIÓN ACTUAL:
        </div>
        <div style={{
          background:C.bg, border:`1px solid ${C.border}`,
          borderRadius:9, padding:10, marginBottom:10,
          fontSize:10, fontFamily:"monospace", wordBreak:"break-all",
          maxHeight:68, overflowY:"auto", color:C.dark, lineHeight:1.5,
        }}>
          {exportStr()}
        </div>
        <button onClick={copyExport} style={{
          width:"100%", padding:11, background:C.dark, border:"none",
          borderRadius:9, color:"white", fontSize:14, fontWeight:800,
          cursor:"pointer", marginBottom:18,
        }}>
          {copied ? "✅ ¡Copiado!" : "📋 COPIAR MI COLECCIÓN"}
        </button>

        <div style={{ fontSize:11, fontWeight:700, marginBottom:4, color:C.muted }}>
          PEGAR LISTA PARA IMPORTAR:
        </div>
        <div style={{ fontSize:10, color:C.muted, marginBottom:7, lineHeight:1.5 }}>
          Números separados por comas. Repetidas con "x": <code style={{background:C.bg,padding:"1px 4px",borderRadius:4}}>1,5,10x2,23x3</code>
        </div>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Pegá tu lista aquí…"
          style={{
            width:"100%", height:80, padding:"8px 10px",
            background:C.bg, border:`1px solid ${C.border}`,
            borderRadius:9, fontSize:11, fontFamily:"monospace",
            outline:"none", resize:"none", boxSizing:"border-box",
          }}
        />
        <button onClick={doImport} style={{
          width:"100%", padding:11, background:C.green, border:"none",
          borderRadius:9, color:"white", fontSize:14, fontWeight:800,
          cursor:"pointer", marginTop:7,
        }}>
          📥 IMPORTAR
        </button>

        {msg && (
          <div style={{
            textAlign:"center", marginTop:10, fontSize:13, fontWeight:800,
            color: msg.startsWith("✅") ? C.green : C.red,
          }}>{msg}</div>
        )}
      </div>
    </div>
  );
}

// ─── PAYWALL ──────────────────────────────────────────────────────────────────
function PaymentReturnScreen({ state, onClose }) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  const bg = { position:"fixed", inset:0, background:"rgba(0,0,0,0.88)",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 };
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        const card = { background:C.card, borderRadius:20, padding:"30px 24px",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            maxWidth:340, width:"100%", textAlign:"center" };
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              const closeBtn = { width:"100%", padding:12, border:"none", background:C.border,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  borderRadius:10, color:C.muted, fontSize:14, cursor:"pointer", marginTop:8 };

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (state.loading) return (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div style={{ ...bg, flexDirection:"column", gap:16 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <div style={{ fontSize:40 }}>⏳</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div style={{ color:"white", fontSize:18, fontWeight:700 }}>Verificando tu pago...</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13 }}>Por favor esperá un momento</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                );

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  if (state.status === 'approved') return (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <div style={bg} onClick={onClose}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div style={{ ...card, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div style={{ fontSize:22, fontWeight:900, color:C.gold, marginBottom:8 }}>¡Pago Exitoso!</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div style={{ color:C.muted, fontSize:14, lineHeight:1.6, marginBottom:20 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              Tu cuenta Premium fue activada. Ya tenés acceso a todas las figuritas y funciones exclusivas.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <button onClick={onClose} style={{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        width:"100%", padding:14, border:"none",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            borderRadius:12, color:C.dark, fontSize:16, fontWeight:900, cursor:"pointer",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ¡Empezar ahora! ✨
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  );

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (state.status === 'pending') return (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div style={bg} onClick={onClose}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <div style={card} onClick={e => e.stopPropagation()}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <div style={{ fontSize:56, marginBottom:12 }}>⏰</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <div style={{ fontSize:20, fontWeight:900, color:C.gold, marginBottom:8 }}>Pago Pendiente</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <div style={{ color:C.muted, fontSize:13, lineHeight:1.6, marginBottom:16 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                Tu pago está siendo procesado. Tu cuenta se activará automáticamente cuando se confirme.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <button onClick={onClose} style={closeBtn}>Entendido</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            );

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              return (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <div style={bg} onClick={onClose}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div style={card} onClick={e => e.stopPropagation()}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <div style={{ fontSize:56, marginBottom:12 }}>❌</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div style={{ fontSize:20, fontWeight:900, color:C.red, marginBottom:8 }}>Pago no completado</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <div style={{ color:C.muted, fontSize:13, lineHeight:1.6, marginBottom:16 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          El pago no fue procesado. Podés intentarlo nuevamente cuando quieras.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <button onClick={onClose} style={closeBtn}>Cerrar</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      // ——— ACCOUNT PANEL ————————————————————————————————————————————————————
                                            function AccountPanel({ session, isPremium, userName, setUserName, onClose }) {
                                              const [name, setName] = React.useState(userName || '');
                                                const [saving, setSaving] = React.useState(false);
                                                  const [saved, setSaved] = React.useState(false);

                                                    async function saveName() {
                                                        if (!session?.user?.id) return;
                                                            setSaving(true);
                                                                await supabase.from('usuarios').update({ nombre: name }).eq('email', session.user.email);
                                                                    setUserName(name);
                                                                        setSaving(false);
                                                                            setSaved(true);
                                                                                setTimeout(() => setSaved(false), 2000);
                                                                                  }

                                                                                    async function signOut() {
                                                                                        await supabase.auth.signOut();
                                                                                            onClose();
                                                                                              }

                                                                                                return (
                                                                                                    <div style={{
                                                                                                          position:'fixed', inset:0, zIndex:200,
                                                                                                                background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center',
                                                                                                                    }} onClick={onClose}>
                                                                                                                          <div style={{
                                                                                                                                  background:'#fff', borderRadius:16, padding:28, width:320, maxWidth:'90vw',
                                                                                                                                          boxShadow:'0 8px 40px rgba(0,0,0,0.25)',
                                                                                                                                                }} onClick={e => e.stopPropagation()}>
                                                                                                                                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                                                                                                                                                                  <h2 style={{ margin:0, fontSize:20, fontWeight:900, color:'#16120A' }}>Mi cuenta</h2>
                                                                                                                                                                            <button onClick={onClose} style={{
                                                                                                                                                                                        background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#888', lineHeight:1,
                                                                                                                                                                                                  }}>✕</button>
                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                  <div style={{ marginBottom:16 }}>
                                                                                                                                                                                                                            <div style={{ fontSize:12, color:'#888', marginBottom:4, letterSpacing:1 }}>EMAIL</div>
                                                                                                                                                                                                                                      <div style={{
                                                                                                                                                                                                                                                  background:'#F4EFE4', borderRadius:8, padding:'10px 14px',
                                                                                                                                                                                                                                                              fontSize:14, color:'#16120A', wordBreak:'break-all',
                                                                                                                                                                                                                                                                        }}>{session?.user?.email || '—'}</div>
                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                        <div style={{ marginBottom:16 }}>
                                                                                                                                                                                                                                                                                                  <div style={{ fontSize:12, color:'#888', marginBottom:4, letterSpacing:1 }}>ESTADO</div>
                                                                                                                                                                                                                                                                                                            <div style={{
                                                                                                                                                                                                                                                                                                                        display:'inline-flex', alignItems:'center', gap:8,
                                                                                                                                                                                                                                                                                                                                    background: isPremium ? '#FFF3CD' : '#F4EFE4',
                                                                                                                                                                                                                                                                                                                                                borderRadius:8, padding:'8px 14px', fontSize:14,
                                                                                                                                                                                                                                                                                                                                                          }}>
                                                                                                                                                                                                                                                                                                                                                                      {isPremium ? '⭐ Premium' : '🔒 Free'}
                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                                <div style={{ marginBottom:20 }}>
                                                                                                                                                                                                                                                                                                                                                                                                          <div style={{ fontSize:12, color:'#888', marginBottom:4, letterSpacing:1 }}>NOMBRE (opcional)</div>
                                                                                                                                                                                                                                                                                                                                                                                                                    <div style={{ display:'flex', gap:8 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                <input
                                                                                                                                                                                                                                                                                                                                                                                                                                              value={name}
                                                                                                                                                                                                                                                                                                                                                                                                                                                            onChange={e => setName(e.target.value)}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          placeholder="Tu nombre..."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        style={{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        flex:1, border:'1.5px solid #D4C9B0', borderRadius:8,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        padding:'9px 12px', fontSize:14, outline:'none',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        background:'#FAF7F2', color:'#16120A',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <button onClick={saveName} disabled={saving} style={{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            background:'#C8981F', color:'#fff', border:'none',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          borderRadius:8, padding:'9px 16px', fontSize:14,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        cursor: saving ? 'default' : 'pointer', fontWeight:700,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      opacity: saving ? 0.7 : 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  }}>{saved ? '✓' : saving ? '...' : 'Guardar'}</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button onClick={signOut} style={{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      width:'100%', background:'#F4EFE4', color:'#C0392B',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                border:'1.5px solid #E8C9C9', borderRadius:10,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          padding:'11px 0', fontSize:15, fontWeight:700, cursor:'pointer',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    letterSpacing:0.5,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }}>Cerrar sesión</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        function Paywall({ onClose, onActivate, session }) {
                                                                                  const [loading, setLoading] = React.useState(false);

                                                                                    const handleMPPayment = async () => {
                                                                                        setLoading(true);
                                                                                            try {
                                                                                                  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
                                                                                                          method: 'POST',
                                                                                                                  headers: {
                                                                                                                            'Content-Type': 'application/json',
                                                                                                                                      'Authorization': 'Bearer APP_USR-3532237601321528-042611-f0abe2e43caac1aa14f47687a2e7bb19-742790793',
                                                                                                                                              },
                                                                                                                                                      body: JSON.stringify({
                                                                                                                                                                items: [{
                                                                                                                                                                            title: 'Figuritas 2026 - Acceso Premium',
                                                                                                                                                                                        quantity: 1,
                                                                                                                                                                                                    unit_price: 1500,
                                                                                                                                                                                                                currency_id: 'ARS',
                                                                                                                                                                                                                          }],
                                                                                                                                                                                                                                    back_urls: {
                                                                                                                                                                                                                                                success: window.location.origin + window.location.pathname + '?payment=success',
                                                                                                                                                                                                                                                            failure: window.location.origin + window.location.pathname + '?payment=failure',
                                                                                                                                                                                                                                                                        pending: window.location.origin + window.location.pathname + '?payment=pending',
                                                                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                                                                            auto_return: 'approved',
                                                                                                                                                                                                                                                                                                      external_reference: session?.user?.id || 'anonymous',
                                                                                                                                                                                                                                                                                                              }),
                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                          const data = await res.json();
                                                                                                                                                                                                                                                                                                                                if (data.init_point) {
                                                                                                                                                                                                                                                                                                                                        window.location.href = data.init_point;
                                                                                                                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                                                                                                                      console.error('MP error:', data);
                                                                                                                                                                                                                                                                                                                                                              alert('Error al iniciar el pago. Intenta nuevamente.');
                                                                                                                                                                                                                                                                                                                                                                      setLoading(false);
                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                } catch (e) {
                                                                                                                                                                                                                                                                                                                                                                                      console.error('MP fetch error:', e);
                                                                                                                                                                                                                                                                                                                                                                                            alert('Error de conexion. Intenta nuevamente.');
                                                                                                                                                                                                                                                                                                                                                                                                  setLoading(false);
                                                                                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                                                                                        };
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.78)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:200, padding:20,
    }} onClick={onClose}>
      <div style={{
        background:C.card, borderRadius:20, padding:"26px 22px 20px",
        maxWidth:340, width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:46, marginBottom:4 }}>✨</div>
          <div style={{ fontSize:24, fontWeight:900, letterSpacing:1, color:C.gold }}>
            ACCESO COMPLETO
          </div>
          <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>
            Pago único — sin suscripción
          </div>
        </div>

        {[
          ["✨", "Extra Stickers: 80 figuritas (Morado, Bronce, Plata, Oro)"],
          ["🥤", "Figuritas Coca-Cola exclusivas (12 jugadores)"],
          ["🛣️", "Camino al Mundial: clasificatorias y debutantes"],
          ["📊", "Estadísticas avanzadas por grupo y selección"],
          ["📥", "Importar/exportar tu colección entre dispositivos"],
        ].map(([e, t]) => (
          <div key={t} style={{
            display:"flex", alignItems:"flex-start", gap:10,
            padding:"7px 0", borderBottom:`1px solid ${C.border}`, fontSize:13,
          }}>
            <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{e}</span>
            <span>{t}</span>
          </div>
        ))}

        <div style={{ textAlign:"center", margin:"18px 0 4px" }}>
          <div style={{ fontSize:44, fontWeight:900, color:C.gold, lineHeight:1 }}>$1 USD</div>
          <div style={{ color:C.muted, fontSize:9, letterSpacing:2 }}>PAGO ÚNICO · SIN SUSCRIPCIÓN</div>
        </div>

        <button onClick={handleMPPayment} disabled={loading} style={{
          width:"100%", padding:15, border:"none",
          background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
          borderRadius:12, color:C.dark, fontSize:17, fontWeight:900,
          cursor:"pointer", letterSpacing:1, marginTop:12, marginBottom:8,
          boxShadow:`0 4px 20px rgba(200,152,31,0.45)`,
        }}>
          DESBLOQUEAR AHORA 🔓
        </button>
        <button onClick={onClose} style={{
          width:"100%", padding:8, border:"none",
          background:"none", color:C.muted, fontSize:12, cursor:"pointer",
        }}>
          Quizás después
        </button>
      </div>
    </div>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function StatsScreen({ stickers, isPremium, onUnlock }) {
  const numHave = Object.entries(stickers).filter(([k,v]) => !isNaN(Number(k)) && v >= 1).length;
  const numRep  = Object.entries(stickers).filter(([k,v]) => !isNaN(Number(k)) && v >= 2).length;
  const extHave = Object.entries(stickers).filter(([k,v]) => isNaN(Number(k)) && v >= 1).length;

  const teamStats = useMemo(() => TEAMS.map(t => {
    const ids = Array.from({length:20}, (_,i) => t.base + i);
    const h   = ids.filter(id => (stickers[id]??0) >= 1).length;
    const r   = ids.filter(id => (stickers[id]??0) >= 2).length;
    return { ...t, h, r, pct: Math.round(h / 20 * 100) };
  }), [stickers]);

  const complete = teamStats.filter(t => t.pct === 100);
  const topRep   = [...teamStats].sort((a,b) => b.r - a.r).slice(0,6).filter(t => t.r > 0);
  const inProgress = teamStats.filter(t => t.h > 0 && t.h < 20).sort((a,b) => b.pct - a.pct).slice(0,6);

  const groupStats = useMemo(() => GRUPOS.map(g => {
    const ts  = teamStats.filter(t => t.group === g);
    const h   = ts.reduce((s,t) => s + t.h, 0);
    const tot = ts.length * 20;
    return { g, h, tot, pct: Math.round(h / tot * 100) };
  }), [teamStats]);

  if (!isPremium) {
    return (
      <div style={{ padding:"50px 20px", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>📊</div>
        <div style={{ fontSize:21, fontWeight:900, marginBottom:8 }}>Estadísticas Avanzadas</div>
        <div style={{ color:C.muted, fontSize:13, lineHeight:1.7, marginBottom:26 }}>
          Progreso por grupo, equipos más avanzados, top repetidas, gráficos y más.
        </div>
        <button onClick={onUnlock} style={{
          padding:"13px 32px",
          background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
          border:"none", borderRadius:12, color:C.dark,
          fontSize:17, fontWeight:900, cursor:"pointer",
          boxShadow:`0 4px 18px rgba(200,152,31,0.35)`,
        }}>
          Desbloquear por $1 ✨
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding:"14px 13px 100px" }}>
      <div style={{ fontWeight:900, fontSize:18, marginBottom:14, letterSpacing:1 }}>
        📊 TU PROGRESO
      </div>

      {/* Big numbers */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
        {[
          { l:"Tengo (álbum)", v:numHave,              c:C.green,  max:TOTAL_ALBUM },
          { l:"Me faltan",     v:TOTAL_ALBUM - numHave, c:C.red },
          { l:"Repetidas",     v:numRep,               c:C.orange },
          { l:"Equipos completos", v:complete.length,  c:C.gold,   max:48 },
        ].map(({ l, v, c, max }) => (
          <div key={l} style={{
            background:C.card, border:`1px solid ${C.border}`,
            borderRadius:12, padding:"11px 13px",
          }}>
            <div style={{ fontSize:28, fontWeight:900, color:c, lineHeight:1 }}>{v}</div>
            {max && (
              <div style={{ height:3, background:C.border, borderRadius:2, margin:"4px 0" }}>
                <div style={{ height:"100%", width:`${(v/max)*100}%`, background:c, borderRadius:2 }} />
              </div>
            )}
            <div style={{ fontSize:10, color:C.muted }}>{l}</div>
          </div>
        ))}
      </div>

      {extHave > 0 && (
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:12, padding:"10px 13px", marginBottom:12,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:20 }}>✨</span>
          <div>
            <div style={{ fontSize:13, fontWeight:800 }}>Especiales coleccionadas</div>
            <div style={{ fontSize:11, color:C.muted }}>Extra Stickers + Coca-Cola</div>
          </div>
          <div style={{ marginLeft:"auto", fontSize:22, fontWeight:900, color:C.gold }}>{extHave}</div>
        </div>
      )}

      {/* Por grupo */}
      <div style={{
        background:C.card, border:`1px solid ${C.border}`,
        borderRadius:12, padding:"13px 14px", marginBottom:12,
      }}>
        <div style={{ fontWeight:800, fontSize:12, marginBottom:10, letterSpacing:1 }}>
          ⚽ PROGRESO POR GRUPO
        </div>
        {groupStats.map(g => (
          <div key={g.g} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ fontSize:11, fontWeight:800, color:C.muted, width:22, flexShrink:0 }}>G-{g.g}</div>
            <div style={{ flex:1, height:8, background:C.border, borderRadius:4, overflow:"hidden" }}>
              <div style={{
                height:"100%", width:`${g.pct}%`,
                background: g.pct === 100 ? C.green : `linear-gradient(90deg,${C.gold},${C.goldL})`,
                borderRadius:4, transition:"width 0.5s",
              }} />
            </div>
            <div style={{
              fontSize:10, fontWeight:800, width:30, textAlign:"right", flexShrink:0,
              color: g.pct === 100 ? C.green : C.gold,
            }}>{g.pct}%</div>
          </div>
        ))}
      </div>

      {/* Top repetidas */}
      {topRep.length > 0 && (
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:12, padding:"13px 14px", marginBottom:12,
        }}>
          <div style={{ fontWeight:800, fontSize:12, marginBottom:10, letterSpacing:1 }}>
            🔁 TOP REPETIDAS
          </div>
          {topRep.map(t => (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{t.flag}</span>
              <span style={{ flex:1, fontSize:13 }}>{t.name}</span>
              <span style={{ fontWeight:900, color:C.orange }}>×{t.r} rep</span>
            </div>
          ))}
        </div>
      )}

      {/* Equipos completos */}
      {complete.length > 0 && (
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:12, padding:"13px 14px", marginBottom:12,
        }}>
          <div style={{ fontWeight:800, fontSize:12, marginBottom:10, letterSpacing:1 }}>
            ✅ EQUIPOS COMPLETOS ({complete.length})
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {complete.map(t => (
              <div key={t.id} style={{
                background:"#E8F5E9", border:"1px solid #A5D6A7",
                borderRadius:8, padding:"3px 9px", fontSize:12, fontWeight:700,
              }}>
                {t.flag} {t.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* En progreso */}
      {inProgress.length > 0 && (
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:12, padding:"13px 14px",
        }}>
          <div style={{ fontWeight:800, fontSize:12, marginBottom:10, letterSpacing:1 }}>
            🔄 MÁS AVANZADOS (incompletos)
          </div>
          {inProgress.map(t => (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{t.flag}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700 }}>{t.name}</div>
                <div style={{ height:5, background:C.border, borderRadius:3, marginTop:2 }}>
                  <div style={{
                    height:"100%", width:`${t.pct}%`,
                    background:`linear-gradient(90deg,${C.gold},${C.goldL})`,
                    borderRadius:3,
                  }} />
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:800, color:C.gold, flexShrink:0 }}>{t.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// —— LOGIN SCREEN
// --- UPDATE PASSWORD SCREEN
    function UpdatePasswordScreen() {
      const [password, setPassword] = React.useState('');
        const [loading, setLoading] = React.useState(false);
          const [error, setError] = React.useState('');
            const [msg, setMsg] = React.useState('');

              const handleUpdate = async () => {
                  if (!password) { setError('Ingresá una nueva contraseña.'); return; }
                      setLoading(true); setError(''); setMsg('');
                          try {
                                const { error: e } = await supabase.auth.updateUser({ password });
                                      if (e) throw e;
                                            setMsg('✅ ¡Contraseña actualizada! Ya podés usar tu cuenta.');
                                                } catch (ex: any) { setError(ex.message); } finally { setLoading(false); }
                                                  };

                                                    return (
                                                        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5' }}>
                                                              <div style={{ background:'white', padding:32, borderRadius:16, width:340, boxShadow:'0 4px 24px #0001' }}>
                                                                      <h2 style={{ textAlign:'center', marginBottom:24 }}>Nueva contraseña</h2>
                                                                              {error && <div style={{ color:'red', marginBottom:12, fontSize:13 }}>{error}</div>}
                                                                                      {msg && <div style={{ color:'green', marginBottom:12, fontSize:13 }}>{msg}</div>}
                                                                                              <input
                                                                                                        type="password"
                                                                                                                  placeholder="Nueva contraseña"
                                                                                                                            value={password}
                                                                                                                                      onChange={e => setPassword(e.target.value)}
                                                                                                                                                style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #ddd', marginBottom:12, fontSize:15, boxSizing:'border-box' }}
                                                                                                                                                        />
                                                                                                                                                                <button
                                                                                                                                                                          onClick={handleUpdate}
                                                                                                                                                                                    disabled={loading}
                                                                                                                                                                                              style={{ width:'100%', padding:'12px', background:'#c8a800', color:'white', border:'none', borderRadius:8, fontSize:16, fontWeight:700, cursor:'pointer' }}
                                                                                                                                                                                                      >
                                                                                                                                                                                                                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                                                                                                                                                                                                                        </button>
                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                    function LoginScreen() {
  const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
        const [loading, setLoading] = useState(false);
          const [error, setError] = useState('');
            const [msg, setMsg] = useState('');
            
              const handle = async () => {
                  setLoading(true); setError(''); setMsg('');
                      try {
                            if (mode === 'login') {
                                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                                            if (error) throw error;
                                                  } else {
                                                          const { error } = await supabase.auth.signUp({ email, password });
                                                                  if (error) throw error;
                                                                          setMsg('Revisá tu email para confirmar el registro.');
                                                                                }
                                                                                    } catch (e) {
                                                                                          setError(e.message || 'Error desconocido');
                                                                                              }
                                                                                                  setLoading(false);
                                                                                                    };

                                                  const handleReset = async () => {
                                                      if (!email) { setError('Ingresá tu email para recuperar la contraseña.'); return; }
                                                          setLoading(true); setError(''); setMsg('');
                                                              try {
                                                                    const { error: e2 } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                                                                          if (e2) throw e2;
                                                                                setMsg('✅ Email de recuperación enviado! Revisá tu casilla.');
                                                                                    } catch (ex) { setError(ex.message); } finally { setLoading(false); }
                                                                                      };
                                                                                                                                                                                          
                                                                                                      return (
                                                                                                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:C.bg, fontFamily:"'Barlow Condensed',sans-serif", padding:'20px' }}>
                                                                                                                <div style={{ background:'#fff', borderRadius:16, padding:'32px 28px', width:'100%', maxWidth:360, boxShadow:'0 4px 24px rgba(0,0,0,0.12)' }}>
                                                                                                                        <div style={{ textAlign:'center', marginBottom:24 }}>
                                                                                                                                  <div style={{ fontSize:28, fontWeight:900, color:C.dark }}>🏆 MUNDIAL 2026</div>
                                                                                                                                            <div style={{ fontSize:12, color:C.muted, letterSpacing:1 }}>CONTROL DE FIGURITAS</div>
                                                                                                                                                    </div>
                                                                                                                                                            <div style={{ display:'flex', marginBottom:20, borderRadius:8, overflow:'hidden', border:`1px solid ${C.border}` }}>
                                                                                                                                                                      <button onClick={() => setMode('login')} style={{ flex:1, padding:'10px', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:14, background: mode==='login' ? C.gold : '#fff', color: mode==='login' ? '#fff' : C.dark }}>INICIAR SESIÓN</button>
                                                                                                                                                                                <button onClick={() => setMode('register')} style={{ flex:1, padding:'10px', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:14, background: mode==='register' ? C.gold : '#fff', color: mode==='register' ? '#fff' : C.dark }}>REGISTRARSE</button>
                                                                                                                                                                                        </div>
                                                                                                                                                                                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width:'100%', padding:'12px', marginBottom:12, borderRadius:8, border:`1px solid ${C.border}`, fontFamily:'inherit', fontSize:15, boxSizing:'border-box' }} />
                                                                                                                                                                                                        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handle()} style={{ width:'100%', padding:'12px', marginBottom:16, borderRadius:8, border:`1px solid ${C.border}`, fontFamily:'inherit', fontSize:15, boxSizing:'border-box' }} />
                                                                                                                                                                                                                {error && <div style={{ color:'#c0392b', fontSize:13, marginBottom:12, textAlign:'center' }}>{error}</div>}
                                                                                                                                                                                                                        {msg && <div style={{ color:C.green, fontSize:13, marginBottom:12, textAlign:'center' }}>{msg}</div>}
                                                                                                                                                                                                                                <button onClick={handle} disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:8, border:'none', background:C.gold, color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:16, cursor:'pointer', letterSpacing:1 }}>
                                                                                                                                                                                                                                          {loading ? 'Cargando...' : mode==='login' ? 'ENTRAR' : 'REGISTRARSE'}
                                                                                                                                                                                                                                                  </button>

          {mode === 'login' && (
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#b8860b',
                cursor: 'pointer',
                fontSize: 13,
                marginTop: 8,
                textDecoration: 'underline',
                fontFamily: 'inherit',
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                              // ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [stickers,  setStickers]  = useState(load('stk_v1', {}));
  const [openItem,  setOpenItem]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [tab,       setTab]       = useState("album");
  const [modal,     setModal]     = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [paymentReturn, setPaymentReturn] = React.useState(null);
  const [showAccount, setShowAccount] = React.useState(false);
  const [userName, setUserName] = React.useState('');
    const [session, setSession] = useState(null);
      const [authLoading, setAuthLoading] = useState(true);
  // Guardar stickers en localStorage
  useEffect(() => {
    if (Object.keys(stickers).length === 0) return;
    save('stk_v1', stickers);
  }, [stickers]);

                    // Load userName from Supabase usuarios
                      React.useEffect(() => {
                          if (!session?.user?.id) return;
                              supabase.from('usuarios').select('nombre').eq('email', session.user.email).single()
                                    .then(({ data }) => { if (data?.nombre) setUserName(data.nombre); });
                                      }, [session]);

                                                // Handle MP payment return - verify with API and update UI
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
          const payStatus = params.get('payment');
              const mpStatus  = params.get('status');
                  const paymentId = params.get('payment_id');

                      if (payStatus === 'success' || mpStatus === 'approved') {
                            setPaymentReturn({ loading: true, status: null, paymentId });
                                  (async () => {
                                          if (paymentId) {
                                                    try {
                                                                const res = await fetch(
                                                                              'https://api.mercadopago.com/v1/payments/' + paymentId,
                                                                                            { headers: { Authorization: 'Bearer APP_USR-3532237601321528-042611-f0abe2e43caac1aa14f47687a2e7bb19-742790793' } }
                                                                                                        );
                                                                                                                    const data = await res.json();
                                                                                                                                if (data.status === 'approved') {
                                                                                                                                              await activate();
                                                                                                                                                            setPaymentReturn({ loading: false, status: 'approved', paymentId });
                                                                                                                                                                        } else {
                                                                                                                                                                                      setPaymentReturn({ loading: false, status: data.status || 'unknown', paymentId });
                                                                                                                                                                                                  }
                                                                                                                                                                                                            } catch (_) {
                                                                                                                                                                                                                        await activate();
                                                                                                                                                                                                                                    setPaymentReturn({ loading: false, status: 'approved', paymentId });
                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                                                                await activate();
                                                                                                                                                                                                                                                                          setPaymentReturn({ loading: false, status: 'approved', paymentId: null });
                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                          window.history.replaceState({}, '', window.location.pathname);
                                                                                                                                                                                                                                                                                                })();
                                                                                                                                                                                                                                                                                                    } else if (payStatus === 'failure') {
                                                                                                                                                                                                                                                                                                          setPaymentReturn({ loading: false, status: 'failure', paymentId });
                                                                                                                                                                                                                                                                                                                window.history.replaceState({}, '', window.location.pathname);
                                                                                                                                                                                                                                                                                                                    } else if (payStatus === 'pending' || mpStatus === 'pending') {
                                                                                                                                                                                                                                                                                                                          setPaymentReturn({ loading: false, status: 'pending', paymentId });
                                                                                                                                                                                                                                                                                                                                window.history.replaceState({}, '', window.location.pathname);
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                      }, []);

  // —— SUPABASE AUTH
  useEffect(() => {
    const loadUserData = async (email: string) => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('is_premium')
        .eq('email', email)
        .single();
      console.log('[loadUserData] data:', data, 'error:', error);
      if (data) {
        setIsPremium(data.is_premium || false);
      }
    };

    const timeoutId = setTimeout(() => setAuthLoading(false), 3000);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        setSession(session);
        if (session?.user?.email) {
          await loadUserData(session.user.email);
        }
      } catch (err) {
        console.error('[getSession] error:', err);
      } finally {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN' && session?.user?.email) {
        await loadUserData(session.user.email);
        setAuthLoading(false);
      } else if (_event === 'SIGNED_OUT') {
        setIsPremium(false);
        setAuthLoading(false);
      }
      setAuthLoading(false);
    });

    return () => { clearTimeout(timeoutId); subscription.unsubscribe(); };
  }, []);


  const cycleSticker = useCallback((id) => {
    setStickers(prev => {
      const cur  = prev[id] ?? 0;
      const next = cur >= 2 ? 0 : cur + 1;
      if (next === 0) { const { [id]:_, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  }, []);

  const stats = useMemo(() => {
    const numHave = Object.entries(stickers).filter(([k,v]) => !isNaN(Number(k)) && v >= 1).length;
    const numRep  = Object.entries(stickers).filter(([k,v]) => !isNaN(Number(k)) && v >= 2).length;
    return { numHave, numRep };
  }, [stickers]);

  const pct = Math.round((stats.numHave / TOTAL_ALBUM) * 100);

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase();
    let t = TEAMS;
    if (q) t = t.filter(tm =>
      tm.name.toLowerCase().includes(q) ||
      `grupo ${tm.group}`.toLowerCase().includes(q) ||
      tm.flag.includes(q)
    );
    const getIds = tm => Array.from({length:20}, (_,i) => tm.base + i);
    if (filter === "missing")  t = t.filter(tm => getIds(tm).some(id => (stickers[id]??0) === 0));
    if (filter === "complete") t = t.filter(tm => getIds(tm).every(id => (stickers[id]??0) >= 1));
    if (filter === "repeats")  t = t.filter(tm => getIds(tm).some(id => (stickers[id]??0) >= 2));
    return t;
  }, [search, filter, stickers]);

  const toggleItem = useCallback(id => setOpenItem(prev => prev === id ? null : id), []);
  const activate    = async () => {
                    setIsPremium(true);
                        save("prm_v1", true);
                            setModal(null);
                                if (session?.user?.id) {
                                      await supabase.from('usuarios').update({ is_premium: true }).eq('email', session.user.email);
                                          }
                                            };
                                              const resetAll   = () => {
    if (window.confirm("¿Resetear toda tu colección? No se puede deshacer.")) {
      setStickers({});
    }
  };

    // —— AUTH SCREEN
      if (authLoading) return (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:C.bg, fontFamily:"'Barlow Condensed',sans-serif" }}>
                <p style={{ color:C.dark, fontSize:18 }}>Cargando...</p>
                    </div>
                      );

                        if (!session) return <LoginScreen />;


  return (
    <div style={{
      background:C.bg, minHeight:"100vh", maxWidth:480,
      margin:"0 auto", fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",
      color:C.dark,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        button,input,textarea{font-family:inherit;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#C8BFA0;border-radius:2px;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background:`linear-gradient(135deg,${C.dark} 0%,#2C1A06 100%)`,
        padding:"12px 15px 0",
        position:"sticky", top:0, zIndex:50,
        boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:C.goldL, letterSpacing:1, lineHeight:1 }}>
              🏆 MUNDIAL 2026
            </div>
            {session && (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <button onClick={() => setShowAccount(true)} style={{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        background:'none', border:'none', fontSize:22, cursor:'pointer',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      color:'#C8981F', padding:'4px 6px', lineHeight:1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  }} title="Mi cuenta">👤</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <div style={{ color:"#5A5040", fontSize:9, letterSpacing:2.5 }}>
              CONTROL DE FIGURITAS · PANINI OFICIAL
            </div>
          </div>
          {isPremium ? (
            <div style={{
              background:"rgba(239,200,74,0.15)", border:`1px solid ${C.gold}40`,
              borderRadius:20, padding:"4px 12px", color:C.goldL,
              fontSize:11, fontWeight:800,
            }}>⭐ PREMIUM</div>
          ) : (
            <button onClick={() => setModal("paywall")} style={{
              background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
              border:"none", borderRadius:20, padding:"5px 13px",
              color:C.dark, fontSize:11, fontWeight:900, cursor:"pointer",
              boxShadow:"0 2px 8px rgba(200,152,31,0.4)",
            }}>✨ $1 Especiales</button>
          )}
        </div>

        <div style={{ display:"flex", gap:6, marginTop:10 }}>
          {[
            { l:"TENGO",     v:stats.numHave,               c:"#4CAF50" },
            { l:"FALTAN",    v:TOTAL_ALBUM - stats.numHave,  c:C.red },
            { l:"REPETIDAS", v:stats.numRep,                c:C.orange },
          ].map(({ l, v, c }) => (
            <div key={l} style={{
              flex:1, background:"rgba(255,255,255,0.07)",
              borderRadius:8, padding:"5px 0", textAlign:"center",
            }}>
              <div style={{ color:c, fontSize:20, fontWeight:900, lineHeight:1 }}>{v}</div>
              <div style={{ color:"#5A5040", fontSize:8, letterSpacing:1.5 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ margin:"8px 0 0" }}>
          <div style={{ height:5, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
            <div style={{
              height:"100%", width:`${pct}%`,
              background:`linear-gradient(90deg,${C.gold},${C.goldL})`,
              borderRadius:3, transition:"width 0.6s ease",
            }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
            <span style={{ color:"#5A5040", fontSize:8, letterSpacing:1 }}>980 figuritas · 48 selecciones</span>
            <span style={{ color:C.gold, fontSize:9, fontWeight:800, letterSpacing:1 }}>{pct}%</span>
          </div>
        </div>

        <div style={{ display:"flex", marginTop:10 }}>
          {[
            ["album",      "📖 ÁLBUM"],
            ["especiales", "✨ ESPECIALES"],
            ["stats",      "📊 STATS"],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex:1, padding:"9px 0", background:"none", border:"none",
              color: tab === k ? C.goldL : "#4A4030",
              fontSize:10, fontWeight:900, letterSpacing:0.5, cursor:"pointer",
              borderBottom: tab === k ? `2px solid ${C.goldL}` : "2px solid transparent",
              transition:"color 0.2s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── TAB ÁLBUM ── */}
      {tab === "album" && (
        <>
          <div style={{
            background:C.bg, position:"sticky", top:170,
            zIndex:40, padding:"9px 13px 0",
          }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Buscar selección, país o Grupo A…L"
              style={{
                width:"100%", padding:"9px 12px",
                background:C.card, border:`1px solid ${C.border}`,
                borderRadius:9, fontSize:13, outline:"none", boxSizing:"border-box",
              }}
            />
            <div style={{ display:"flex", gap:5, marginTop:7, paddingBottom:9, overflowX:"auto" }}>
              {[
                ["all",      "TODAS"],
                ["missing",  "ME FALTAN"],
                ["complete", "COMPLETAS"],
                ["repeats",  "REPETIDAS"],
              ].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} style={{
                  flexShrink:0, padding:"5px 12px",
                  background: filter === k ? C.dark : "transparent",
                  color: filter === k ? C.goldL : C.muted,
                  border: filter === k ? "none" : `1px solid ${C.border}`,
                  borderRadius:20, fontSize:10, fontWeight:800,
                  cursor:"pointer", letterSpacing:1,
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ padding:"0 12px 100px" }}>
            {stats.numHave === 0 && (
              <div style={{
                background:"#FFFAEC", border:`1px solid ${C.goldL}`,
                borderRadius:11, padding:"11px 14px", marginBottom:10,
                fontSize:12, lineHeight:1.8,
              }}>
                🚀 <strong>Cómo usarla:</strong> Tocá una selección para abrirla, luego tocá cada número.{" "}
                <span style={{ color:C.green, fontWeight:800 }}>1 toque = la tengo ✓</span>
                {" · "}
                <span style={{ color:C.orange, fontWeight:800 }}>2 toques = repetida ×2</span>
                {" · "}
                3 toques = la borro.
              </div>
            )}

            {/* Grupos */}
            {GRUPOS.map(g => {
              const gTeams = filteredTeams.filter(t => t.group === g);
              if (gTeams.length === 0) return null;
              const gHave  = gTeams.reduce((s, t) => {
                const ids = Array.from({length:20}, (_,i) => t.base + i);
                return s + ids.filter(id => (stickers[id]??0) >= 1).length;
              }, 0);
              const gTotal = gTeams.length * 20;
              const gPct   = Math.round(gHave / gTotal * 100);
              return (
                <div key={g}>
                  <div style={{
                    display:"flex", alignItems:"center", gap:8,
                    margin:"12px 0 6px", padding:"0 1px",
                  }}>
                    <div style={{ fontSize:10, fontWeight:900, color:C.muted, letterSpacing:2 }}>
                      GRUPO {g}
                    </div>
                    <div style={{ flex:1, height:1, background:C.border }} />
                    <div style={{
                      fontSize:10, fontWeight:800,
                      color: gPct === 100 ? C.green : C.gold,
                    }}>{gPct}%</div>
                  </div>
                  {gTeams.map(team => (
                    <TeamCard
                      key={team.id} team={team}
                      stickers={stickers} onCycle={cycleSticker}
                      isOpen={openItem === team.id}
                      onOpen={() => toggleItem(team.id)}
                    />
                  ))}
                </div>
              );
            })}

            {filteredTeams.length === 0 && (
              <div style={{ textAlign:"center", padding:"50px 0", color:C.muted, fontSize:14 }}>
                Sin resultados para "{search}"
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB ESPECIALES ── */}
      {tab === "especiales" && (
        <div style={{ padding:"13px 12px 100px" }}>
          <div style={{
            background:"linear-gradient(135deg,rgba(200,152,31,0.10),rgba(239,200,74,0.06))",
            border:"1px solid rgba(200,152,31,0.25)",
            borderRadius:12, padding:"11px 14px", marginBottom:12,
            fontSize:12, lineHeight:1.7,
          }}>
            <strong>💡 Secciones especiales del álbum</strong><br />
            Las primeras 4 son <strong>gratis</strong>. Las secciones{" "}
            <span style={{ color:C.gold, fontWeight:800 }}>PREMIUM</span>{" "}
            (Extra Stickers, Coca-Cola y más) se desbloquean por <strong>$1 único</strong>.
          </div>

          <div style={{ fontSize:10, fontWeight:900, color:C.muted, letterSpacing:2, margin:"4px 2px 8px" }}>
            INCLUIDAS — GRATIS
          </div>
          {SECCIONES_LIBRES.map(sec => (
            <SeccionCard
              key={sec.id} sec={sec} stickers={stickers} onCycle={cycleSticker}
              isOpen={openItem === sec.id} onOpen={() => toggleItem(sec.id)}
              isPremium={true} onUnlock={() => setModal("paywall")}
            />
          ))}

          <div style={{
            display:"flex", alignItems:"center", gap:8,
            fontSize:10, fontWeight:900, color:C.gold,
            letterSpacing:2, margin:"16px 2px 8px",
          }}>
            <span>✨ PREMIUM</span>
            {!isPremium && (
              <button onClick={() => setModal("paywall")} style={{
                background:`linear-gradient(135deg,${C.gold},${C.goldL})`,
                border:"none", borderRadius:12, padding:"2px 10px",
                color:C.dark, fontSize:9, fontWeight:900, cursor:"pointer",
              }}>Desbloquear $1</button>
            )}
          </div>
          {SECCIONES_PREMIUM.map(sec => (
            <SeccionCard
              key={sec.id} sec={sec} stickers={stickers} onCycle={cycleSticker}
              isOpen={openItem === sec.id} onOpen={() => toggleItem(sec.id)}
              isPremium={isPremium} onUnlock={() => setModal("paywall")}
            />
          ))}
        </div>
      )}

      {/* ── TAB STATS ── */}
      {tab === "stats" && (
        <StatsScreen stickers={stickers} isPremium={isPremium} onUnlock={() => setModal("paywall")} />
      )}

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, background:C.card,
        borderTop:`1px solid ${C.border}`, display:"flex", zIndex:40,
        paddingBottom:"env(safe-area-inset-bottom,0px)",
      }}>
        {[
          { emoji:"📲", label:"CANJEAR",  action:() => setModal("wa") },
          { emoji:"📥", label:"IMP/EXP",  action:() => setModal("importexport") },
          { emoji:"🔄", label:"RESETEAR", action:resetAll },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{
            flex:1, padding:"10px 0", background:"none", border:"none",
            cursor:"pointer", display:"flex", flexDirection:"column",
            alignItems:"center", gap:2,
            color:C.muted, fontSize:9, fontWeight:800, letterSpacing:1,
          }}>
            <span style={{ fontSize:20 }}>{item.emoji}</span>
            {item.label}
          </button>
        ))}
        {!isPremium && (
          <button onClick={() => setModal("paywall")} style={{
            flex:1, padding:"10px 0", background:"none", border:"none",
            cursor:"pointer", display:"flex", flexDirection:"column",
            alignItems:"center", gap:2,
            color:C.gold, fontSize:9, fontWeight:900, letterSpacing:1,
          }}>
            <span style={{ fontSize:20 }}>✨</span>PREMIUM
          </button>
        )}
      </div>

      {/* ── MODALES ── */}
      {modal === "wa" && (
        <WAModal stickers={stickers} onClose={() => setModal(null)} />
      )}
      {modal === "importexport" && (
        <ImportExportModal
          stickers={stickers}
          onImport={newS => setStickers(prev => ({ ...prev, ...newS }))}
          onClose={() => setModal(null)}
          isPremium={isPremium}
          onUnlock={() => setModal("paywall")}
        />
      )}
      {showAccount && (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <AccountPanel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              session={session}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        isPremium={isPremium}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  userName={userName}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            setUserName={setUserName}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      onClose={() => setShowAccount(false)}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          {paymentReturn && (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <PaymentReturnScreen state={paymentReturn} onClose={() => setPaymentReturn(null)} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                {modal === "paywall" && (
        <Paywall onClose={() => setModal(null)} onActivate={activate} session={session} />
      )}
    </div>
  );
}
