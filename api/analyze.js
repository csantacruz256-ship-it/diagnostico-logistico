export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { company, role, avg, dimSummary, weakDims, strongDims } = req.body;

  // Pedir a la IA SOLO 3 frases cortas específicas
  const prompt = `Datos de diagnóstico logístico:
Empresa: ${company} | Puntaje: ${avg}% | Críticas: ${weakDims.join(", ") || "ninguna"} | Fortalezas: ${strongDims.join(", ") || "ninguna"}

Responde ÚNICAMENTE con este JSON, sin texto adicional, sin explicaciones:
{
  "situacion": "[una frase de 12 palabras exactas sobre la situación de ${company}]",
  "riesgo": "[una frase de 10 palabras exactas sobre el principal riesgo operativo]",
  "conclusion": "[una frase motivadora de 15 palabras exactas para ${company}]"
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
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    let situacion = `${company} presenta procesos en desarrollo con oportunidades claras de mejora.`;
    let riesgo = "La variabilidad operativa sin estándares limita el crecimiento sostenible.";
    let conclusion = `${company} tiene las bases para convertirse en referente logístico de su sector.`;

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

    // Lógica de hallazgos basada en datos reales
    const nivelLabel = avg >= 76 ? "Gestionado" : avg >= 56 ? "Definido" : avg >= 31 ? "En Desarrollo" : "Inicial";

    const accionesMap = {
      "Planificación y Despacho": { accion: "Documentar proceso de planificación con SOP formal", ref: "ISO 9001 cláusula 8.1", plazo: "30 días" },
      "Trazabilidad y Control de Flota": { accion: "Implementar GPS y registros de trazabilidad en tiempo real", ref: "BASC Pilar 1", plazo: "45 días" },
      "Gestión de Indicadores (KPIs)": { accion: "Definir 5 KPIs con tablero de control semanal", ref: "ISO 9001 cláusula 9.1", plazo: "30 días" },
      "Seguridad Operativa y BASC": { accion: "Implementar checklist BASC e inspección de vehículos", ref: "BASC Estándar 8.1", plazo: "45 días" },
      "Calidad ISO 9001": { accion: "Estructurar manual de calidad y auditoría interna", ref: "ISO 9001 cláusula 10.2", plazo: "60 días" },
      "Gestión de Proveedores y Transporte": { accion: "Crear matriz de evaluación de transportistas con SLA", ref: "ISO 9001 cláusula 8.4", plazo: "45 días" },
    };

    const todasDims = [...weakDims, ...Object.keys(accionesMap).filter(d => !weakDims.includes(d) && !strongDims.includes(d))];
    const acciones = todasDims.slice(0, 3).map((d, i) => {
      const a = accionesMap[d] || { accion: "Estandarizar proceso", ref: "ISO 9001", plazo: "30 días" };
      return `${i + 1}. **${a.accion}** — ${a.plazo} — Ref: ${a.ref}`;
    });

    const hallazgos = weakDims.length > 0
      ? weakDims.slice(0, 3).map(d => `- **${d}:** Dimensión crítica que requiere atención prioritaria inmediata.`)
      : strongDims.slice(0, 3).map(d => `- **${d}:** Dimensión sólida que puede servir de modelo para otras áreas.`);

    const analysis = `**DIAGNÓSTICO**
${situacion} Con un puntaje global de ${avg}%, la operación se encuentra en nivel **${nivelLabel}**.

**HALLAZGOS CLAVE**
${hallazgos.join("\n")}
- **${riesgo}**

**PLAN DE ACCIÓN**
${acciones.join("\n")}

**CONCLUSIÓN**
${conclusion}`;

    return res.status(200).json({ analysis });

  } catch (e) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
