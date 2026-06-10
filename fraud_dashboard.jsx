import { useState, useEffect, useRef } from "react";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0A0F1E; }
  ::-webkit-scrollbar-thumb { background: #1E2D4A; border-radius: 4px; }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.4} 94%{opacity:1} }
  .fade-in { animation: fadeUp 0.55s ease forwards; }
  .score-fill { transition: width 0.9s cubic-bezier(.4,0,.2,1); }
  input[type=range] { -webkit-appearance:none; appearance:none; outline:none; height:6px; border-radius:4px; cursor:pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#00D4FF; box-shadow:0 0 10px #00D4FF66; cursor:pointer; }
`;

const T = {
  bg:"#0A0F1E", bg1:"#0D1424", bg2:"#111827", bg3:"#1A2332", bg4:"#1E2D4A",
  border:"#1E2D4A", border2:"#2A3F5F",
  cyan:"#00D4FF", red:"#FF3B5C", green:"#00E096", gold:"#FFB800", purple:"#A855F7",
  txt:"#E8EDF5", txt2:"#8B9BBE", txt3:"#4A5980",
};

const MODELS = {
  LR:  { label:"Logistic Regression", role:"Baseline",  color:T.txt3,   roc:0.9763, pr:0.7652, recall:0.8878, precision:0.6691, f1:0.7630 },
  RF:  { label:"Random Forest",       role:"Ensemble",  color:T.cyan,   roc:0.9761, pr:0.8059, recall:0.8673, precision:0.8174, f1:0.8416 },
  XGB: { label:"XGBoost",             role:"Boosting",  color:T.gold,   roc:0.9769, pr:0.8644, recall:0.8776, precision:0.8431, f1:0.8600 },
  LGB: { label:"LightGBM",            role:"Campeón ★", color:T.green,  roc:0.9660, pr:0.8738, recall:0.8673, precision:0.8174, f1:0.8416 },
};

// helpers
function Tag({ children, color = T.cyan }) {
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", background:color+"22", color, border:`1px solid ${color}44` }}>{children}</span>;
}

function Card({ children, style={}, glow }) {
  return <div style={{ background:T.bg2, borderRadius:14, border:`1px solid ${glow?glow+"44":T.border}`, boxShadow:glow?`0 0 24px ${glow}11`:"none", ...style }}>{children}</div>;
}

function SectionLabel({ n, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:`1.5px solid ${T.cyan}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:T.cyan, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{String(n).padStart(2,"0")}</div>
      <div style={{ fontSize:11, fontWeight:600, color:T.txt2, letterSpacing:"0.12em", textTransform:"uppercase" }}>{children}</div>
    </div>
  );
}

function MetricBar({ label, value, color }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:T.txt3 }}>{label}</span>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color, fontWeight:600 }}>{value.toFixed(4)}</span>
      </div>
      <div style={{ height:6, background:T.bg4, borderRadius:4, overflow:"hidden" }}>
        <div className="score-fill" style={{ width:`${value*100}%`, height:"100%", background:color, borderRadius:4 }} />
      </div>
    </div>
  );
}

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

// Live transaction widget
function LiveTxn() {
  const [txns, setTxns] = useState([
    { id:1, amount:42.5,   hour:"02:14", score:0.97, fraud:true  },
    { id:2, amount:128.0,  hour:"02:15", score:0.04, fraud:false },
    { id:3, amount:1.0,    hour:"02:15", score:0.88, fraud:true  },
    { id:4, amount:235.9,  hour:"02:16", score:0.11, fraud:false },
    { id:5, amount:0.99,   hour:"02:16", score:0.91, fraud:true  },
  ]);
  const [latest, setLatest] = useState(0.97);

  useEffect(() => {
    let h = 17;
    const iv = setInterval(() => {
      const fraud  = Math.random() > 0.72;
      const amount = fraud ? [1.0, 0.99, 42.5][Math.floor(Math.random()*3)] : [89, 312, 55, 128, 220][Math.floor(Math.random()*5)];
      const score  = fraud ? 0.7+Math.random()*0.29 : Math.random()*0.14;
      const mm     = String(h).padStart(2,"0");
      h++;
      setLatest(score);
      setTxns(prev => [{ id:Date.now(), amount, hour:`02:${mm}`, score, fraud }, ...prev.slice(0,4)]);
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <Card style={{ padding:22 }} glow={T.cyan}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontSize:11, color:T.txt2, fontWeight:600, letterSpacing:"0.08em" }}>SCORING EN VIVO</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, animation:"pulse-dot 1.4s ease-in-out infinite" }} />
          <span style={{ fontSize:11, color:T.green, fontFamily:"'JetBrains Mono',monospace" }}>LIVE</span>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:T.txt3 }}>Última transacción</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:latest>0.5?T.red:T.green, transition:"color 0.4s" }}>{latest.toFixed(4)}</span>
        </div>
        <div style={{ height:8, background:T.bg4, borderRadius:4, overflow:"hidden" }}>
          <div className="score-fill" style={{ width:`${latest*100}%`, height:"100%", borderRadius:4, background:latest>0.5?`linear-gradient(90deg,${T.gold},${T.red})`:`linear-gradient(90deg,${T.cyan},${T.green})` }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ fontSize:10, color:T.txt3 }}>Legítima</span>
          <span style={{ fontSize:10, color:T.txt3 }}>Fraude</span>
        </div>
      </div>

      {txns.map((t, i) => (
        <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, marginBottom:4, background:i===0?(t.fraud?T.red+"18":T.green+"18"):"transparent", border:i===0?`1px solid ${t.fraud?T.red:T.green}33`:"1px solid transparent", transition:"all 0.4s" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:t.fraud?T.red:T.green, flexShrink:0 }} />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:T.txt3, width:40 }}>{t.hour}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:T.txt, flex:1 }}>${t.amount.toFixed(2)}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:t.fraud?T.red:T.green }}>{t.score.toFixed(3)}</span>
          <span style={{ fontSize:10, color:t.fraud?T.red:T.green, minWidth:44, textAlign:"right" }}>{t.fraud?"FRAUDE":"OK"}</span>
        </div>
      ))}
    </Card>
  );
}

// Threshold simulator
function ThresholdSim({ model }) {
  const [thr, setThr] = useState(0.5);
  const m = MODELS[model];
  const recall    = Math.min(0.99, m.recall    + (0.5 - thr) * 0.55);
  const precision = Math.max(0.30, m.precision - (0.5 - thr) * 0.45);
  const tp = Math.round(98 * recall);
  const fn = 98 - tp;
  const fp = Math.round(75 * (1 - precision + 0.12));
  const cost    = fn * 122.21 + fp * 5;
  const noModel = 98 * 122.21;
  const savings = ((noModel - cost) / noModel * 100).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:13, color:T.txt2 }}>Umbral de decisión</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:700, color:T.cyan }}>{thr.toFixed(2)}</span>
        </div>
        <input type="range" min={0.05} max={0.95} step={0.01} value={thr}
          onChange={e => setThr(parseFloat(e.target.value))}
          style={{ width:"100%", background:`linear-gradient(90deg,${T.cyan} ${thr*100}%,${T.bg4} ${thr*100}%)` }} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          <span style={{ fontSize:10, color:T.txt3 }}>0.05 · Máx Recall</span>
          <span style={{ fontSize:10, color:T.txt3 }}>0.95 · Máx Precision</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
        {[
          ["Recall",             recall.toFixed(3),    T.green],
          ["Precision",          precision.toFixed(3), T.cyan ],
          ["TP (detectados)",    tp,                   T.green],
          ["FN (perdidos)",      fn,                   T.red  ],
          ["FP (falsas alarmas)",fp,                   T.gold ],
          ["Ahorro estimado",    savings+"%",          T.green],
        ].map(([l,v,c]) => (
          <div key={l} style={{ padding:"10px 12px", borderRadius:8, background:T.bg3, border:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:10, color:T.txt3, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"10px 14px", borderRadius:8, fontSize:12, color:T.txt2,
        background: thr<0.3 ? T.green+"18" : thr>0.7 ? T.red+"18" : T.gold+"18",
        border: `1px solid ${thr<0.3?T.green:thr>0.7?T.red:T.gold}33` }}>
        {thr<0.3 ? "↑ Alto Recall: más detecciones, más falsas alarmas."
          : thr>0.7 ? "↑ Alta Precision: pocas alarmas, pero perdés fraudes reales."
          : "Balance Recall/Precision. El umbral óptimo económico depende del costo de cada error."}
      </div>
    </div>
  );
}

// Canary bars
function CanaryBars({ show }) {
  const feats = [
    { name:"top_features_norm",    val:3.50, type:"eng"    },
    { name:"V4",                   val:2.10, type:"pca"    },
    { name:"V11_x_V16",            val:1.10, type:"eng"    },
    { name:"V7",                   val:0.95, type:"pca"    },
    { name:"V8",                   val:0.88, type:"pca"    },
    { name:"canary_normal_0",      val:0.43, type:"canary" },
    { name:"log_amount",           val:0.41, type:"eng"    },
    { name:"hour_sin",             val:0.35, type:"eng"    },
    { name:"canary_uniform_0",     val:0.31, type:"canary" },
    { name:"txn_count_1h",         val:0.28, type:"eng"    },
    { name:"canary_binary_1",      val:0.21, type:"canary" },
    { name:"n_anomalous_features", val:0.19, type:"eng"    },
    { name:"canary_corr_0",        val:0.16, type:"canary" },
    { name:"V16_zscore",           val:0.13, type:"eng"    },
    { name:"amount_rounded",       val:0.08, type:"eng"    },
  ];
  const maxCanary = 0.43;
  const visible = show ? feats : feats.filter(f => f.type !== "canary");
  const col = t => t==="canary" ? T.gold : t==="eng" ? T.green : T.cyan;

  return (
    <div>
      {show && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, padding:"8px 12px", borderRadius:8, background:T.gold+"18", border:`1px solid ${T.gold}44` }}>
          <span style={{ fontSize:12, color:T.gold, fontFamily:"'JetBrains Mono',monospace" }}>Umbral canario: {maxCanary.toFixed(2)} — features por debajo = sin señal genuina</span>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {visible.map(f => (
          <div key={f.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:f.type==="canary"?T.gold:T.txt2, width:210, flexShrink:0, opacity:f.type==="canary"?0.8:1 }}>{f.name}</span>
            <div style={{ flex:1, position:"relative", height:12, background:T.bg4, borderRadius:4, overflow:"visible" }}>
              <div style={{ height:"100%", borderRadius:4, background:col(f.type), width:`${(f.val/3.5)*100}%`, opacity:f.type==="canary"?0.7:1, transition:"width 0.8s ease" }} />
              {show && <div style={{ position:"absolute", top:-4, left:`${(maxCanary/3.5)*100}%`, width:2, height:20, background:T.gold+"cc", borderRadius:1 }} />}
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:col(f.type), width:36, textAlign:"right" }}>{f.val.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:14, marginTop:12 }}>
        {[["eng",T.green,"Engineered"],["pca",T.cyan,"PCA (V1-V28)"],...(show?[["canary",T.gold,"Canario"]]:[])]
          .map(([k,c,l]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:c }} />
              <span style={{ fontSize:11, color:T.txt3 }}>{l}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function App() {
  const [selModel, setSelModel]     = useState("LGB");
  const [showCanary, setShowCanary] = useState(false);
  const [heroRef, heroVis]          = useInView(0.05);
  const [s2ref, s2vis]              = useInView();
  const [s3ref, s3vis]              = useInView();
  const [s4ref, s4vis]              = useInView();
  const [s5ref, s5vis]              = useInView();
  const [s6ref, s6vis]              = useInView();
  const m = MODELS[selModel];

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:"'Space Grotesk',system-ui,sans-serif", color:T.txt }}>
      <style>{FONT_STYLE}</style>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:T.bg+"ee", backdropFilter:"blur(12px)", borderBottom:`1px solid ${T.border}`, padding:"0 32px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:T.red, animation:"pulse-dot 1.6s ease-in-out infinite" }} />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:600, color:T.cyan, animation:"flicker 8s infinite" }}>fraud_detection.ipynb</span>
        </div>
        <div style={{ display:"flex", gap:18 }}>
          {[["problema","Problema"],["features","Features"],["canarios","Canarios"],["modelos","Modelos"],["shap","SHAP"],["impacto","Impacto"]].map(([id,l]) => (
            <span key={id}
              onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"})}
              style={{ fontSize:13, color:T.txt2, cursor:"pointer" }}
              onMouseOver={e=>e.currentTarget.style.color=T.cyan}
              onMouseOut={e=>e.currentTarget.style.color=T.txt2}>{l}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Tag color={T.cyan}>LightGBM</Tag>
          <Tag color={T.green}>SHAP</Tag>
          <Tag color={T.gold}>Canary</Tag>
        </div>
      </nav>

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"60px 24px 60px" }}>

        {/* HERO */}
        <section ref={heroRef} style={{ minHeight:"90vh", display:"flex", flexDirection:"column", justifyContent:"center", paddingTop:30 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 370px", gap:48, alignItems:"center" }}>
            <div className={heroVis?"fade-in":""}>
              <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
                <Tag color={T.red}>Fraud Detection</Tag>
                <Tag color={T.cyan}>End-to-End</Tag>
                <Tag color={T.txt3}>Maestría · U. Austral · 2° año</Tag>
              </div>
              <h1 style={{ fontSize:"clamp(1.9rem,3.8vw,3.1rem)", fontWeight:700, lineHeight:1.1, letterSpacing:"-1px", marginBottom:20 }}>
                Un modelo con<br/>
                <span style={{ color:T.red }}>99.83% accuracy</span><br/>
                que no detecta<br/>
                <span style={{ color:T.cyan }}>ni un fraude.</span>
              </h1>
              <p style={{ fontSize:15, color:T.txt2, lineHeight:1.7, maxWidth:460, marginBottom:32 }}>
                Pipeline completo: feature engineering con lógica de negocio, auditoría de data leakage, canary features, LightGBM y SHAP. Orientado a equipos de Prevención de Fraude en e-commerce y fintech.
              </p>
              <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
                {[["284,807","transacciones"],["492","fraudes (0.17%)"],["75+","features"],["5","leakages corregidos"]].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:700, color:T.cyan }}>{n}</div>
                    <div style={{ fontSize:11, color:T.txt3, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={heroVis?"fade-in":""} style={{ animationDelay:"0.2s" }}>
              <LiveTxn />
            </div>
          </div>
        </section>

        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${T.border2},transparent)`, margin:"0 0 72px" }} />

        {/* PROBLEMA */}
        <section id="problema" ref={s2ref} style={{ marginBottom:72, opacity:s2vis?1:0, transform:s2vis?"none":"translateY(20px)", transition:"all 0.6s ease" }}>
          <SectionLabel n={1}>El Problema · Por qué Accuracy engaña</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Card style={{ padding:26 }}>
              <div style={{ fontSize:12, color:T.txt3, marginBottom:14, textTransform:"uppercase", letterSpacing:"0.08em" }}>Predice siempre "no fraude" y obtiene:</div>
              {[
                ["Accuracy","99.83%",T.txt3,"✓","Parece perfecto"],
                ["Recall (fraude)","0%",T.red,"✗","Cero fraudes detectados"],
                ["Fraudes perdidos","492 / 492",T.red,"✗","El 100% del dataset"],
              ].map(([l,v,c,icon,note]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, marginBottom:8, background:c===T.red?T.red+"14":T.bg3, border:`1px solid ${c===T.red?T.red+"33":T.border}` }}>
                  <span style={{ fontSize:16, color:c }}>{icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:T.txt }}>{l}</div>
                    <div style={{ fontSize:11, color:T.txt3 }}>{note}</div>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:c }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card style={{ padding:26 }}>
              <div style={{ fontSize:12, color:T.txt3, marginBottom:14, textTransform:"uppercase", letterSpacing:"0.08em" }}>Métricas correctas con desbalance severo</div>
              {[
                ["PR-AUC",T.green,"Mide el trade-off real Precision/Recall. La métrica principal en fraude."],
                ["Recall",T.cyan,"% de fraudes reales detectados. FN = dinero perdido directamente."],
                ["F1-Score",T.gold,"Media armónica P/R. Útil cuando el costo de cada error es diferente."],
                ["ROC-AUC",T.txt3,"Puede engañar con 1:578. Siempre queda alta. Usar como referencia, no como objetivo."],
              ].map(([m,c,desc]) => (
                <div key={m} style={{ marginBottom:14, paddingLeft:10, borderLeft:`2px solid ${c}` }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:600, color:c, marginBottom:2 }}>{m}</div>
                  <p style={{ fontSize:12, color:T.txt3, lineHeight:1.5 }}>{desc}</p>
                </div>
              ))}
            </Card>
          </div>
        </section>

        {/* FEATURES + LEAKAGE */}
        <section id="features" ref={s3ref} style={{ marginBottom:72, opacity:s3vis?1:0, transform:s3vis?"none":"translateY(20px)", transition:"all 0.6s ease" }}>
          <SectionLabel n={2}>Feature Engineering · Auditoría de Data Leakage</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Card style={{ padding:26 }}>
              <div style={{ fontSize:13, color:T.green, fontWeight:600, marginBottom:14 }}>40+ features con lógica de negocio</div>
              {[
                ["Velocidad",T.green,["txn_count_1h","txn_rate_6h"],"Ataques de volumen en ventanas cortas"],
                ["Monto",T.cyan,["log_amount","is_micro_txn","amount_rounded"],"Card testing, micro-transacciones de prueba"],
                ["Temporales",T.gold,["hour_sin","hour_cos","is_night"],"Fraude concentrado en horarios nocturnos"],
                ["Anomalía",T.red,["amount_zscore","n_anomalous_features"],"Perfil estadístico atípico vs train"],
                ["Interacciones",T.purple,["V14_x_V12","top_features_norm"],"Relaciones no lineales entre top PCA"],
              ].map(([cat,color,feats,desc]) => (
                <div key={cat} style={{ marginBottom:14, paddingLeft:10, borderLeft:`2px solid ${color}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color, marginBottom:2 }}>{cat}</div>
                  <div style={{ fontSize:11, color:T.txt3, marginBottom:5 }}>{desc}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {feats.map(f => <code key={f} style={{ fontSize:10, color:T.txt2, background:T.bg4, padding:"2px 6px", borderRadius:4, fontFamily:"'JetBrains Mono',monospace" }}>{f}</code>)}
                  </div>
                </div>
              ))}
            </Card>
            <Card style={{ padding:26 }}>
              <div style={{ fontSize:13, color:T.red, fontWeight:600, marginBottom:14 }}>5 fuentes de leakage encontradas y corregidas</div>
              <div style={{ padding:"12px 14px", borderRadius:8, background:T.bg3, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.txt2, lineHeight:1.9, marginBottom:16 }}>
                <div style={{ color:T.txt3, marginBottom:4 }}># El orden correcto importa tanto como el modelo</div>
                <div><span style={{ color:T.red }}>✗</span> <span style={{ textDecoration:"line-through", color:T.txt3 }}>scaler.fit(X_all)  ← leakage</span></div>
                <div><span style={{ color:T.green }}>✓</span> X_train, X_test = split(X)</div>
                <div><span style={{ color:T.green }}>✓</span> scaler.fit(X_train)</div>
                <div><span style={{ color:T.green }}>✓</span> X_tr = scaler.transform(X_train)</div>
                <div><span style={{ color:T.green }}>✓</span> X_te = scaler.transform(X_test)</div>
              </div>
              {[
                ["RobustScaler","fit() sobre dataset completo"],
                ["amount_zscore","Media/std incluían test set"],
                ["n_anomalous_features","Z-scores PCA sobre todo el dataset"],
                ["amount_decile","pd.qcut() sobre dataset completo"],
                ["amount_vs_window_ratio","Ratio con media global"],
              ].map(([f,issue]) => (
                <div key={f} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:9 }}>
                  <span style={{ color:T.red, fontSize:13, flexShrink:0, marginTop:1 }}>✗</span>
                  <div>
                    <code style={{ fontSize:11, color:T.cyan, fontFamily:"'JetBrains Mono',monospace" }}>{f}</code>
                    <div style={{ fontSize:11, color:T.txt3 }}>{issue}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </section>

        {/* CANARY */}
        <section id="canarios" ref={s4ref} style={{ marginBottom:72, opacity:s4vis?1:0, transform:s4vis?"none":"translateY(20px)", transition:"all 0.6s ease" }}>
          <SectionLabel n={3}>Canary Features · Validación de señal real</SectionLabel>
          <Card style={{ padding:28 }} glow={T.gold}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:14 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>20 variables de ruido puro para auditar el feature engineering</div>
                <p style={{ fontSize:13, color:T.txt2, maxWidth:500 }}>Feature real con importancia &lt; umbral canario en los 3 métodos simultáneamente → no aporta señal. Se elimina.</p>
              </div>
              <button onClick={()=>setShowCanary(v=>!v)} style={{ padding:"9px 18px", borderRadius:8, fontSize:13, fontWeight:600, background:showCanary?T.gold+"22":T.bg3, color:showCanary?T.gold:T.txt2, border:`1px solid ${showCanary?T.gold+"55":T.border}`, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}>
                {showCanary?"🐤 Ocultar canarios":"🐤 Mostrar canarios"}
              </button>
            </div>
            <CanaryBars show={showCanary} />
          </Card>
        </section>

        {/* MODELOS */}
        <section id="modelos" ref={s5ref} style={{ marginBottom:72, opacity:s5vis?1:0, transform:s5vis?"none":"translateY(20px)", transition:"all 0.6s ease" }}>
          <SectionLabel n={4}>Comparación de Modelos · Simulador de Umbral</SectionLabel>
          <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
            {Object.entries(MODELS).map(([k,v]) => (
              <button key={k} onClick={()=>setSelModel(k)} style={{ padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, background:selModel===k?v.color+"22":T.bg2, color:selModel===k?v.color:T.txt3, border:`1px solid ${selModel===k?v.color+"66":T.border}`, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}>
                {v.label}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Card style={{ padding:26 }} glow={m.color}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:22 }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:700, color:m.color }}>{m.label}</div>
                  <div style={{ fontSize:12, color:T.txt3 }}>{m.role}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:28, fontWeight:700, color:m.color }}>{m.pr.toFixed(4)}</div>
                  <div style={{ fontSize:11, color:T.txt3 }}>PR-AUC ★</div>
                </div>
              </div>
              <MetricBar label="ROC-AUC"   value={m.roc}       color={T.cyan}   />
              <MetricBar label="PR-AUC ★"  value={m.pr}        color={m.color}  />
              <MetricBar label="Recall"    value={m.recall}    color={T.green}  />
              <MetricBar label="Precision" value={m.precision} color={T.cyan}   />
              <MetricBar label="F1-Score"  value={m.f1}        color={T.gold}   />
              {selModel==="LGB" && (
                <div style={{ marginTop:16, padding:"10px 14px", borderRadius:8, background:T.green+"14", border:`1px solid ${T.green}33`, fontSize:12, color:T.txt2, lineHeight:1.5 }}>
                  <span style={{ color:T.green, fontWeight:600 }}>¿Por qué LightGBM? </span>
                  Crecimiento leaf-wise captura patrones dispersos del fraude mejor que level-wise. <code style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>is_unbalance=True</code> maneja el desbalance dinámicamente.
                </div>
              )}
            </Card>
            <Card style={{ padding:26 }}>
              <div style={{ fontSize:13, color:T.txt2, marginBottom:16, fontWeight:600 }}>Simulador de umbral de decisión</div>
              <ThresholdSim model={selModel} />
            </Card>
          </div>
        </section>

        {/* SHAP */}
        <section id="shap" ref={s6ref} style={{ marginBottom:72, opacity:s6vis?1:0, transform:s6vis?"none":"translateY(20px)", transition:"all 0.6s ease" }}>
          <SectionLabel n={5}>Explicabilidad · SHAP</SectionLabel>
          <Card style={{ padding:28 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>
                  <span style={{ color:T.red }}>"El modelo lo dijo"</span> no es una respuesta.
                </div>
                <p style={{ fontSize:13, color:T.txt2, lineHeight:1.65, marginBottom:18 }}>
                  En banca, seguros y fintechs reguladas (BCRA, Basilea IV), la capacidad de explicar cada decisión del modelo es un requisito legal. SHAP descompone cada predicción en la contribución individual de cada feature.
                </p>
                <div style={{ fontSize:12, color:T.txt3, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.07em" }}>Top 7 features · Impacto SHAP global</div>
                {[
                  ["top_features_norm", 9.5,  T.green ],
                  ["V10",               1.77, T.cyan  ],
                  ["V4",                1.63, T.cyan  ],
                  ["V11_x_V16",         1.53, T.purple],
                  ["V14",               1.45, T.cyan  ],
                  ["V11_x_V10",         1.41, T.purple],
                  ["V7",                1.27, T.cyan  ],
                ].map(([f,v,c]) => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                    <code style={{ width:200, fontSize:11, color:T.txt2, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{f}</code>
                    <div style={{ flex:1, height:7, background:T.bg4, borderRadius:4, overflow:"hidden" }}>
                      <div style={{ width:`${(v/9.5)*100}%`, height:"100%", background:c, borderRadius:4 }} />
                    </div>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:c, width:32, textAlign:"right" }}>+{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:12, color:T.txt3, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.07em" }}>Waterfall — Transacción individual (score=1.000)</div>
                <div style={{ background:T.bg3, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.txt3, marginBottom:10 }}>f(x) = 16.617 · E[f(x)] = −13.412</div>
                  {[
                    ["top_features_norm","+9.50",T.red  ],
                    ["V10",              "+1.77",T.red  ],
                    ["V4",               "+1.63",T.red  ],
                    ["V11_x_V16",        "+1.53",T.red  ],
                    ["V14",              "+1.45",T.red  ],
                    ["V11_x_V10",        "+1.41",T.red  ],
                    ["75 other features","+6.06",T.txt3 ],
                  ].map(([f,v,c],i) => (
                    <div key={f} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", borderRadius:6, marginBottom:5, background:i===0?T.red+"18":T.bg2 }}>
                      <code style={{ fontSize:11, color:T.txt2, fontFamily:"'JetBrains Mono',monospace" }}>{f}</code>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* IMPACTO */}
        <section id="impacto" style={{ marginBottom:60 }}>
          <SectionLabel n={6}>Impacto Económico</SectionLabel>
          <Card style={{ padding:28 }} glow={T.green}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:24 }}>
              {[
                ["Sin modelo","$11,977","pérdidas totales en test set",T.red ],
                ["Con LightGBM","$1,685","costo residual (umbral 0.05)",T.green],
                ["Reducción","86%","menos pérdidas por fraude",T.cyan ],
              ].map(([l,v,sub,c]) => (
                <div key={l} style={{ padding:22, borderRadius:12, background:T.bg3, border:`1px solid ${c}33`, textAlign:"center" }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:30, fontWeight:700, color:c, marginBottom:4 }}>{v}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.txt, marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:11, color:T.txt3 }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"14px 18px", borderRadius:10, background:T.bg3, fontSize:13, color:T.txt2, lineHeight:1.65 }}>
              <span style={{ color:T.gold, fontWeight:600 }}>Costo asimétrico: </span>
              Falso Negativo (fraude perdido) ≈ $122 por caso · Falso Positivo (falsa alarma) ≈ $5 por revisión manual.
              El umbral óptimo económico minimiza la pérdida total, no el F1-Score.
            </div>
          </Card>
        </section>

        {/* FOOTER */}
        <footer style={{ paddingTop:28, borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
          <div>
            <div style={{ fontWeight:600, marginBottom:4 }}>Fraud Detection · End-to-End Pipeline</div>
            <div style={{ fontSize:12, color:T.txt3 }}>Maestría en Ciencia de Datos · U. Austral · 2° año · Backend Dev Python @ Gestorando</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {["GitHub →","LinkedIn →"].map(t=>(
              <span key={t} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${T.border2}`, fontSize:13, color:T.txt2, cursor:"pointer" }}>{t}</span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
