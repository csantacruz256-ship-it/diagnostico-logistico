import { useState, useRef } from "react";
 
function RadarChartSVG({ data, scores }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const levels = 4;
  const total = data.length;
 
  const angleStep = (2 * Math.PI) / total;
  const getAngle = (i) => i * angleStep - Math.PI / 2;
 
  const getPoint = (i, r) => ({
    x: cx + r * Math.cos(getAngle(i)),
    y: cy + r * Math.sin(getAngle(i)),
  });
 
  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = (radius * (l + 1)) / levels;
    return Array.from({ length: total }, (_, i) => {
      const p = getPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(" ");
  });
 
  const dataPoints = data.map((d, i) => {
    const r = (radius * (scores[d.id] || 0)) / 100;
    return getPoint(i, r);
  });
 
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
 
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: 320, margin: "0 auto", display: "block" }}>
      {gridPolygons.map((pts, l) => (
        <polygon key={l} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      ))}
      {data.map((_, i) => {
        const p = getPoint(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}
      <path d={dataPath} fill="rgba(0,212,170,0.2)" stroke="#00D4AA" strokeWidth={2} strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#00D4AA" stroke="#0A0E1A" strokeWidth={2} />
      ))}
      {data.map((d, i) => {
        const angle = getAngle(i);
        const labelR = radius + 26;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const anchor = lx < cx - 5 ? "end" : lx > cx + 5 ? "start" : "middle";
        const shortLabel = d.label.split(" ").slice(0, 2).join(" ");
        return (
          <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
            fill="#94A3B8" fontSize={9} fontWeight={600} fontFamily="DM Sans, sans-serif">
            {d.icon} {shortLabel}
          </text>
        );
      })}
      {dataPoints.map((p, i) => {
        const score = scores[data[i].id] || 0;
        if (score === 0) return null;
        return (
          <text key={i} x={p.x} y={p.y - 10} textAnchor="middle"
            fill="#00D4AA" fontSize={9} fontWeight={700} fontFamily="DM Sans, sans-serif">
            {score}%
          </text>
        );
      })}
    </svg>
  );
}
 
const DIMENSIONS = [
  {
    id: "planificacion",
    label: "Planificación y Despacho",
    icon: "📋",
    color: "#00D4AA",
    questions: [
      { id: "p1", text: "¿Su empresa cuenta con un proceso documentado de planificación de despachos?" },
      { id: "p2", text: "¿Se utilizan herramientas digitales para programar rutas y asignación de vehículos?" },
      { id: "p3", text: "¿Existe un procedimiento formal para gestionar cambios de última hora en despachos?" },
      { id: "p4", text: "¿Se mide el cumplimiento de ventanas horarias de entrega?" },
      { id: "p5", text: "¿Los despachos se planifican con al menos 24 horas de anticipación?" },
    ],
  },
  {
    id: "trazabilidad",
    label: "Trazabilidad y Control de Flota",
    icon: "🛰️",
    color: "#FF6B35",
    questions: [
      { id: "t1", text: "¿Los vehículos cuentan con sistema GPS activo y monitoreable en tiempo real?" },
      { id: "t2", text: "¿Existe un registro de paradas, tiempos y rutas de cada vehículo?" },
      { id: "t3", text: "¿Se generan reportes periódicos de excesos de velocidad por placa o conductor?" },
      { id: "t4", text: "¿La información de trazabilidad se comparte con clientes o granjas destino?" },
      { id: "t5", text: "¿Existe un procedimiento de alerta ante desvíos de ruta no autorizados?" },
    ],
  },
  {
    id: "kpis",
    label: "Gestión de Indicadores (KPIs)",
    icon: "📊",
    color: "#4ECDC4",
    questions: [
      { id: "k1", text: "¿Su empresa tiene KPIs logísticos definidos y documentados formalmente?" },
      { id: "k2", text: "¿Los indicadores se miden y reportan con una frecuencia establecida (semanal/mensual)?" },
      { id: "k3", text: "¿Existe un dashboard o tablero de control visible para el equipo operativo?" },
      { id: "k4", text: "¿Los resultados de KPIs se analizan para tomar decisiones de mejora?" },
      { id: "k5", text: "¿Se tienen metas definidas por indicador con responsables asignados?" },
    ],
  },
  {
    id: "seguridad",
    label: "Seguridad Operativa y BASC",
    icon: "🔐",
    color: "#FFD93D",
    questions: [
      { id: "s1", text: "¿La empresa cuenta con certificación BASC vigente o está en proceso de obtenerla?" },
      { id: "s2", text: "¿Se realizan inspecciones documentadas de vehículos antes de cada despacho?" },
      { id: "s3", text: "¿Existe un proceso formal de verificación y registro de conductores?" },
      { id: "s4", text: "¿Se aplican controles para prevenir contaminación de carga (drogas, contrabando)?" },
      { id: "s5", text: "¿El personal operativo recibe capacitación en seguridad y control BASC?" },
    ],
  },
  {
    id: "calidad",
    label: "Calidad ISO 9001",
    icon: "✅",
    color: "#A29BFE",
    questions: [
      { id: "c1", text: "¿Los procesos logísticos están documentados bajo un sistema de gestión de calidad?" },
      { id: "c2", text: "¿Se realizan auditorías internas periódicas a los procesos de transporte y despacho?" },
      { id: "c3", text: "¿Existe un procedimiento formal de gestión de no conformidades y acciones correctivas?" },
      { id: "c4", text: "¿Se mide la satisfacción del cliente interno/externo en el servicio logístico?" },
      { id: "c5", text: "¿La alta dirección revisa periódicamente el desempeño del sistema logístico?" },
    ],
  },
  {
    id: "proveedores",
    label: "Gestión de Proveedores y Transporte",
    icon: "🤝",
    color: "#FD79A8",
    questions: [
      { id: "pr1", text: "¿Existe un proceso documentado de selección y evaluación de transportistas?" },
      { id: "pr2", text: "¿Se realizan evaluaciones periódicas del desempeño de los proveedores de transporte?" },
      { id: "pr3", text: "¿Los contratos con transportistas incluyen SLAs (niveles de servicio) medibles?" },
      { id: "pr4", text: "¿Existe un procedimiento formal para notificación de cambio de conductores?" },
      { id: "pr5", text: "¿Se gestiona un registro actualizado de la flota de proveedores con documentación vigente?" },
    ],
  },
];
 
const LEVELS = [
  { min: 0, max: 30, label: "Inicial", desc: "Los procesos son informales o inexistentes. Alta dependencia de personas clave.", color: "#FF6B6B" },
  { min: 31, max: 55, label: "En Desarrollo", desc: "Existen procesos básicos pero sin estandarización ni medición consistente.", color: "#FFD93D" },
  { min: 56, max: 75, label: "Definido", desc: "Procesos documentados y aplicados. Oportunidades claras de optimización.", color: "#4ECDC4" },
  { min: 76, max: 90, label: "Gestionado", desc: "Procesos medidos, controlados y en mejora continua.", color: "#00D4AA" },
  { min: 91, max: 100, label: "Optimizado", desc: "Excelencia operativa. Referente del sector.", color: "#A29BFE" },
];
 
export default function DiagnosticoLogistico() {
  const [step, setStep] = useState("intro");
  const [currentDim, setCurrentDim] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lead, setLead] = useState({ name: "", company: "", email: "", role: "" });
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const analysisRef = useRef(null);
 
  const OPTIONS = [
    { value: 0, label: "No implementado", color: "#FF6B6B" },
    { value: 1, label: "En proceso", color: "#FFD93D" },
    { value: 2, label: "Parcialmente", color: "#4ECDC4" },
    { value: 3, label: "Implementado", color: "#00D4AA" },
    { value: 4, label: "Optimizado", color: "#A29BFE" },
  ];
 
  const currentDimData = DIMENSIONS[currentDim];
  const allQuestionsAnswered = currentDimData?.questions.every(q => answers[q.id] !== undefined);
  const totalQuestions = DIMENSIONS.reduce((acc, d) => acc + d.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const globalProgress = Math.round((answeredCount / totalQuestions) * 100);
 
  const calcScores = () => {
    const s = {};
    let total = 0;
    DIMENSIONS.forEach(dim => {
      const dimAnswers = dim.questions.map(q => answers[q.id] ?? 0);
      const dimScore = Math.round((dimAnswers.reduce((a, b) => a + b, 0) / (dim.questions.length * 4)) * 100);
      s[dim.id] = dimScore;
      total += dimScore;
    });
    const avg = Math.round(total / DIMENSIONS.length);
    setScores(s);
    setTotalScore(avg);
    return { s, avg };
  };
 
  const getLevel = (score) => LEVELS.find(l => score >= l.min && score <= l.max) || LEVELS[0];
 
  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };
 
  const nextDim = () => {
    if (currentDim < DIMENSIONS.length - 1) {
      setCurrentDim(prev => prev + 1);
    } else {
      setStep("lead");
    }
  };
 
  const prevDim = () => {
    if (currentDim > 0) setCurrentDim(prev => prev - 1);
  };
 
  const submitLead = async () => {
    if (!lead.name || !lead.email || !lead.company) return;
    const { s, avg } = calcScores();
    setStep("results");
 
    const nivel = avg >= 76 ? "Gestionado" : avg >= 56 ? "Definido" : avg >= 31 ? "En Desarrollo" : "Inicial";
    try {
      fetch("https://script.google.com/macros/s/AKfycbzxMcoRGjnMZ2GdHzdVK0sJWooTKcmGkBWMdcYTQ1QtPzaY85FUuUx1aATNAZs32Lm7/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: new Date().toLocaleString("es-EC"),
          nombre: lead.name,
          cargo: lead.role || "No especificado",
          empresa: lead.company,
          correo: lead.email,
          puntaje: avg + "%",
          nivel: nivel
        })
      });
    } catch(e) {
      console.log("Error enviando lead:", e);
    }
 
    await generateAIAnalysis(s, avg);
  };

  // ─── FUNCIÓN ACTUALIZADA — llama a Vercel serverless ───
  const generateAIAnalysis = async (s, avg) => {
    setIsLoadingAI(true);
    const dimSummary = DIMENSIONS.map(d => `- ${d.label}: ${s[d.id]}%`).join("\n");
    const weakDims = DIMENSIONS.filter(d => s[d.id] < 50).map(d => d.label);
    const strongDims = DIMENSIONS.filter(d => s[d.id] >= 75).map(d => d.label);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: lead.company,
          role: lead.role,
          avg,
          dimSummary,
          weakDims,
          strongDims,
        }),
      });

      if (!response.ok) throw new Error("Error en el servidor");

      const data = await response.json();
      setAiAnalysis(data.analysis || "No se pudo generar el análisis.");
    } catch (e) {
      console.error("AI error:", e);
      setAiAnalysis("Error al generar el análisis. Por favor recarga la página e intenta nuevamente.");
    } finally {
      setIsLoadingAI(false);
    }
  };
 
  const level = getLevel(totalScore);
 
  const formatAnalysis = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <div key={i} style={{ fontWeight: 800, color: "#00D4AA", marginTop: 20, marginBottom: 6, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>{line.replace(/\*\*/g, "")}</div>;
      }
      if (line.startsWith("- ") || line.match(/^\d\./)) {
        return <div key={i} style={{ paddingLeft: 16, marginBottom: 6, borderLeft: "2px solid #00D4AA33", color: "#CBD5E1" }}>{line}</div>;
      }
      if (line.trim()) return <p key={i} style={{ color: "#94A3B8", marginBottom: 8, lineHeight: 1.7 }}>{line}</p>;
      return null;
    });
  };
 
  const styles = {
    app: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0A0E1A 0%, #0D1528 50%, #0A1020 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#E2E8F0",
      position: "relative",
      overflow: "hidden",
    },
    glow: {
      position: "fixed", top: "-200px", right: "-200px", width: "600px", height: "600px",
      background: "radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)",
      pointerEvents: "none", zIndex: 0,
    },
    glow2: {
      position: "fixed", bottom: "-200px", left: "-200px", width: "500px", height: "500px",
      background: "radial-gradient(circle, rgba(162,155,254,0.05) 0%, transparent 70%)",
      pointerEvents: "none", zIndex: 0,
    },
    container: { maxWidth: 760, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 },
    header: {
      borderBottom: "1px solid rgba(0,212,170,0.15)",
      padding: "20px 0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    logo: { display: "flex", alignItems: "center", gap: 12 },
    logoIcon: {
      width: 40, height: 40, borderRadius: 10,
      background: "linear-gradient(135deg, #00D4AA, #4ECDC4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, fontWeight: 900, color: "#0A0E1A",
    },
    logoText: { fontSize: 14, fontWeight: 700, color: "#E2E8F0", letterSpacing: 0.5 },
    logoSub: { fontSize: 11, color: "#64748B" },
    badge: {
      background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)",
      borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#00D4AA", fontWeight: 600,
    },
    card: {
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20, padding: 32, backdropFilter: "blur(10px)",
    },
    btn: {
      background: "linear-gradient(135deg, #00D4AA, #00B894)",
      color: "#0A0E1A", border: "none", borderRadius: 12,
      padding: "14px 32px", fontSize: 15, fontWeight: 700,
      cursor: "pointer", transition: "all 0.2s",
      display: "inline-flex", alignItems: "center", gap: 8,
    },
    btnOutline: {
      background: "transparent", color: "#00D4AA",
      border: "1px solid rgba(0,212,170,0.4)",
      borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600,
      cursor: "pointer", transition: "all 0.2s",
    },
    input: {
      width: "100%", background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
      padding: "12px 16px", fontSize: 14, color: "#E2E8F0",
      outline: "none", boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    label: { fontSize: 12, color: "#64748B", marginBottom: 6, display: "block", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  };
 
  if (step === "intro") return (
    <div style={styles.app}>
      <div style={styles.glow} /><div style={styles.glow2} />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>CS</div>
            <div>
              <div style={styles.logoText}>Christian Santacruz</div>
              <div style={styles.logoSub}>Consultor en Logística & Supply Chain</div>
            </div>
          </div>
          <div style={styles.badge}>🎯 Diagnóstico Gratuito</div>
        </header>
 
        <div style={{ padding: "60px 0 40px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#00D4AA", marginBottom: 24 }}>
            ⚡ Resultados en 5 minutos · Con análisis de IA
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -1 }}>
            ¿Qué tan maduro es tu<br />
            <span style={{ background: "linear-gradient(135deg, #00D4AA, #A29BFE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              proceso logístico?
            </span>
          </h1>
          <p style={{ fontSize: 17, color: "#94A3B8", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Diagnóstica el nivel de madurez de tu operación en 6 dimensiones clave: desde planificación hasta BASC e ISO 9001. Obtén un análisis personalizado con IA.
          </p>
 
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 540, margin: "0 auto 48px" }}>
            {[
              { icon: "📋", label: "30 preguntas", sub: "6 dimensiones" },
              { icon: "🤖", label: "Análisis IA", sub: "Personalizado" },
              { icon: "📊", label: "Gráfico Radar", sub: "Visual e instantáneo" },
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{f.label}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{f.sub}</div>
              </div>
            ))}
          </div>
 
          <button style={styles.btn} onClick={() => setStep("checklist")}>
            Iniciar diagnóstico →
          </button>
          <p style={{ fontSize: 12, color: "#475569", marginTop: 16 }}>Sin costo · Sin registro previo · 100% confidencial</p>
        </div>
 
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, paddingBottom: 60 }}>
          {DIMENSIONS.map((d, i) => (
            <div key={i} style={{ ...styles.card, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{d.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
 
  if (step === "checklist") return (
    <div style={styles.app}>
      <div style={styles.glow} /><div style={styles.glow2} />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>CS</div>
            <div>
              <div style={styles.logoText}>Diagnóstico Logístico</div>
              <div style={styles.logoSub}>Dimensión {currentDim + 1} de {DIMENSIONS.length}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#64748B" }}>{globalProgress}% completado</div>
        </header>
 
        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, margin: "20px 0 32px" }}>
          <div style={{ height: "100%", width: `${globalProgress}%`, background: "linear-gradient(90deg, #00D4AA, #A29BFE)", borderRadius: 2, transition: "width 0.4s" }} />
        </div>
 
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 20, scrollbarWidth: "none" }}>
          {DIMENSIONS.map((d, i) => {
            const dimAnswered = d.questions.every(q => answers[q.id] !== undefined);
            return (
              <button key={i} onClick={() => setCurrentDim(i)} style={{
                background: i === currentDim ? `${d.color}22` : "rgba(255,255,255,0.03)",
                border: `1px solid ${i === currentDim ? d.color : "rgba(255,255,255,0.07)"}`,
                borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 600,
                color: i === currentDim ? d.color : "#64748B",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {dimAnswered && <span style={{ color: "#00D4AA" }}>✓</span>}
                {d.icon} {d.label.split(" ")[0]}
              </button>
            );
          })}
        </div>
 
        <div style={{ ...styles.card, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 32 }}>{currentDimData.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{currentDimData.label}</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Evalúa cada práctica en tu organización</p>
            </div>
          </div>
 
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {currentDimData.questions.map((q, qi) => (
              <div key={q.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 20 }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#CBD5E1", lineHeight: 1.5 }}>
                  <span style={{ color: currentDimData.color, marginRight: 8, fontWeight: 700 }}>{qi + 1}.</span>
                  {q.text}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => handleAnswer(q.id, opt.value)} style={{
                      background: answers[q.id] === opt.value ? `${opt.color}22` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${answers[q.id] === opt.value ? opt.color : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600,
                      color: answers[q.id] === opt.value ? opt.color : "#64748B",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
 
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 48 }}>
          <button style={styles.btnOutline} onClick={prevDim} disabled={currentDim === 0}>
            ← Anterior
          </button>
          <button style={{ ...styles.btn, opacity: allQuestionsAnswered ? 1 : 0.4, cursor: allQuestionsAnswered ? "pointer" : "not-allowed" }}
            onClick={allQuestionsAnswered ? nextDim : undefined}>
            {currentDim === DIMENSIONS.length - 1 ? "Ver resultados →" : "Siguiente dimensión →"}
          </button>
        </div>
      </div>
    </div>
  );
 
  if (step === "lead") return (
    <div style={styles.app}>
      <div style={styles.glow} /><div style={styles.glow2} />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>CS</div>
            <div><div style={styles.logoText}>¡Diagnóstico completado!</div></div>
          </div>
          <div style={{ ...styles.badge, background: "rgba(0,212,170,0.15)" }}>✓ 30/30 respondidas</div>
        </header>
 
        <div style={{ padding: "48px 0", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px" }}>Tu análisis está listo</h2>
          <p style={{ color: "#94A3B8", fontSize: 15, marginBottom: 40, maxWidth: 440, margin: "0 auto 40px" }}>
            Ingresa tus datos para recibir el diagnóstico completo con análisis de IA, gráfico radar y plan de acción personalizado.
          </p>
 
          <div style={{ ...styles.card, maxWidth: 480, margin: "0 auto", textAlign: "left" }}>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                { field: "name", label: "Nombre completo", placeholder: "Ej: Juan Pérez" },
                { field: "role", label: "Cargo", placeholder: "Ej: Jefe de Logística" },
                { field: "company", label: "Empresa", placeholder: "Ej: Empresa S.A." },
                { field: "email", label: "Correo electrónico", placeholder: "juan@empresa.com", type: "email" },
              ].map(f => (
                <div key={f.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input style={styles.input} type={f.type || "text"} placeholder={f.placeholder}
                    value={lead[f.field]} onChange={e => setLead(p => ({ ...p, [f.field]: e.target.value }))} />
                </div>
              ))}
            </div>
 
            <button style={{ ...styles.btn, width: "100%", marginTop: 24, justifyContent: "center",
              opacity: (lead.name && lead.email && lead.company) ? 1 : 0.4 }}
              onClick={(lead.name && lead.email && lead.company) ? submitLead : undefined}>
              Ver mi diagnóstico completo →
            </button>
            <p style={{ fontSize: 11, color: "#475569", textAlign: "center", marginTop: 12 }}>
              🔒 Tus datos son confidenciales. No spam, nunca.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
 
  if (step === "results") return (
    <div style={styles.app}>
      <div style={styles.glow} /><div style={styles.glow2} />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>CS</div>
            <div>
              <div style={styles.logoText}>Christian Santacruz</div>
              <div style={styles.logoSub}>Consultor en Logística & Supply Chain</div>
            </div>
          </div>
          <div style={styles.badge}>📊 Tu diagnóstico</div>
        </header>
 
        <div style={{ padding: "32px 0 60px" }}>
          <div style={{ ...styles.card, textAlign: "center", marginBottom: 24, background: `linear-gradient(135deg, rgba(0,212,170,0.08), rgba(162,155,254,0.05))`, border: `1px solid rgba(0,212,170,0.2)` }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>
              Resultado global · {lead.company}
            </p>
            <div style={{ fontSize: 72, fontWeight: 900, background: "linear-gradient(135deg, #00D4AA, #A29BFE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
              {totalScore}%
            </div>
            <div style={{ display: "inline-block", background: `${level.color}22`, border: `1px solid ${level.color}`, borderRadius: 20, padding: "6px 20px", fontSize: 14, color: level.color, fontWeight: 700, margin: "12px 0 8px" }}>
              Nivel: {level.label}
            </div>
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>{level.desc}</p>
          </div>
 
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>📊 Mapa de Madurez por Dimensión</h3>
            <RadarChartSVG data={DIMENSIONS} scores={scores} />
          </div>
 
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>Detalle por Dimensión</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {DIMENSIONS.map(d => (
                <div key={d.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{d.icon} {d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{scores[d.id] || 0}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${scores[d.id] || 0}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}99)`, borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          <div style={{ ...styles.card, marginBottom: 32, border: "1px solid rgba(0,212,170,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00D4AA", boxShadow: "0 0 8px #00D4AA" }} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Análisis de IA — Christian Santacruz</h3>
            </div>
            {isLoadingAI ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</div>
                <p style={{ color: "#64748B", fontSize: 14 }}>Generando tu diagnóstico personalizado...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div ref={analysisRef} style={{ lineHeight: 1.7 }}>
                {formatAnalysis(aiAnalysis)}
              </div>
            )}
          </div>
 
          <div style={{ ...styles.card, textAlign: "center", background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(162,155,254,0.05))", border: "1px solid rgba(0,212,170,0.25)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>¿Quieres llevar tu operación al siguiente nivel?</h3>
            <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
              Conecta con Christian Santacruz para una consultoría personalizada en optimización de procesos logísticos.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://www.linkedin.com/in/christiansantacruz" target="_blank" rel="noreferrer" style={{ ...styles.btn, textDecoration: "none" }}>
                Conectar en LinkedIn →
              </a>
              <button style={styles.btnOutline} onClick={() => { setStep("intro"); setAnswers({}); setCurrentDim(0); setAiAnalysis(""); }}>
                Nuevo diagnóstico
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
