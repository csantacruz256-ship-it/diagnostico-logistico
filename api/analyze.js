export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { company, role, avg, dimSummary, weakDims, strongDims } = req.body;

  const prompt = `Datos de diagnóstico logístico:
Empresa: ${company} | Puntaje: ${avg}% | Críticas: ${weakDims.join(", ") || "ninguna"} | Fortalezas: ${strongDims.join(", ") || "ninguna"}

Responde ÚNICAMENTE con este JSON, sin texto adicional:
{
  "situacion": "[2 oraciones sobre la situación actual de ${company}]",
  "riesgo": "[1 oración sobre el principal riesgo operativo]",
  "conclusion": "[2 oraciones: una sobre el potencial de mejora y una motivadora final para ${company}]"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    let situacion = `${company} presenta procesos en desarrollo con oportunidades claras de mejora. La operación muestra avances en algunas dimensiones pero requiere estandarización formal.`;
    let riesgo = "La variabilidad operativa sin estándares documentados limita el crecimiento sostenible.";
    let conclusion = `Con una hoja de ruta clara, ${company} puede alcanzar el siguiente nivel de madurez en 6 meses. La mejora de procesos es la inversión con mayor retorno en logística.`;

    if (response.ok) {
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      try {
        const json = JSON.parse(text.replace(/```json|```/g, "").trim());
        if (json.situacion) situacion = json.situacion;
        if (json.riesgo) riesgo = json.riesgo;
        if (json.conclusion) conclusion = json.conclusion;
      } catch(e) {}
    }

    const nivelLabel = avg >= 76 ? "Gestionado" : avg >= 56 ? "Definido" : avg >= 31 ? "En Desarrollo" : "Inicial";

    const accionesMap = {
      "Planificación y Despacho":            { accion: "Documentar proceso de planificación con SOP formal y responsables definidos", ref: "ISO 9001 cláusula 8.1", plazo: "30 días" },
      "Trazabilidad y Control de Flota":     { accion: "Implementar GPS activo con reportes de trazabilidad y alertas en tiempo real", ref: "BASC Pilar 1", plazo: "45 días" },
      "Gestión de Indicadores (KPIs)":       { accion: "Definir 5 KPIs operativos con tablero de control y revisión semanal", ref: "ISO 9001 cláusula 9.1", plazo: "30 días" },
      "Seguridad Operativa y BASC":          { accion: "Implementar checklist BASC, inspección de vehículos y registro de conductores", ref: "BASC Estándar 8.1", plazo: "45 días" },
      "Calidad ISO 9001":                    { accion: "Estructurar manual de calidad, gestión de no conformidades y auditoría interna", ref: "ISO 9001 cláusula 10.2", plazo: "60 días" },
      "Gestión de Proveedores y Transporte": { accion: "Crear matriz de evaluación de transportistas con SLA medibles y revisión trimestral", ref: "ISO 9001 cláusula 8.4", plazo: "45 días" },
    };

    const descripcionHallazgo = {
      "Planificación y Despacho":            "La ausencia de procedimientos formales genera variabilidad en tiempos y recursos.",
      "Trazabilidad y Control de Flota":     "Sin visibilidad en tiempo real, la respuesta ante incidentes es reactiva y tardía.",
      "Gestión de Indicadores (KPIs)":       "Sin métricas definidas, las decisiones operativas se basan en percepción, no en datos.",
      "Seguridad Operativa y BASC":          "Las brechas en controles BASC exponen la operación a riesgos de seguridad y auditoría.",
      "Calidad ISO 9001":                    "La falta de documentación formal impide demostrar conformidad ante clientes y auditores.",
      "Gestión de Proveedores y Transporte": "La evaluación informal de transportistas genera inconsistencia en el nivel de servicio.",
    };

    const todasDims = [...weakDims, ...Object.keys(accionesMap).filter(d => !weakDims.includes(d) && !strongDims.includes(d))];
    
    const acciones = todasDims.slice(0, 3).map((d, i) => {
      const a = accionesMap[d] || { accion: "Estandarizar proceso crítico", ref: "ISO 9001", plazo: "30 días" };
      return `${i + 1}. **${a.accion}** — _${a.plazo}_ — Ref: ${a.ref}`;
    });

    const hallazgos = weakDims.length > 0
      ? weakDims.slice(0, 3).map(d => {
          const desc = descripcionHallazgo[d] || "Requiere atención prioritaria para alcanzar el estándar operativo.";
          return `- **${d}:** ${desc}`;
        })
      : strongDims.slice(0, 2).map(d => `- **${d}:** Dimensión sólida que puede servir como modelo para otras áreas.`)
        .concat([`- **Oportunidad de mejora:** Avanzar hacia certificaciones formales ISO 9001 o BASC para consolidar la madurez alcanzada.`]);

    const analysis = `**DIAGNÓSTICO**
${situacion} Con un puntaje global de **${avg}%**, la operación de ${company} se encuentra en nivel **${nivelLabel}**.

**HALLAZGOS CLAVE**
${hallazgos.join("\n")}
- **Riesgo principal:** ${riesgo}

**PLAN DE ACCIÓN**
${acciones.join("\n")}

**CONCLUSIÓN**
${conclusion}`;

    return res.status(200).json({ analysis });

  } catch (e) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
