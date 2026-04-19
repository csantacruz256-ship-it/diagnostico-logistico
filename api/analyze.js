export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { company, role, avg, dimSummary, weakDims, strongDims } = req.body;

  const nivelLabel = avg >= 76 ? "Gestionado" : avg >= 56 ? "Definido" : avg >= 31 ? "En Desarrollo" : "Inicial";
  const critica1 = weakDims[0] || strongDims[0] || "Gestión de Indicadores";
  const critica2 = weakDims[1] || weakDims[0] || "Calidad ISO 9001";
  const critica3 = weakDims[2] || "Seguridad Operativa";

  const prompt = `Eres Christian Santacruz, experto en logística. Completa EXACTAMENTE este texto reemplazando solo los [CAMPOS]. No agregues nada más, no cambies el formato, no añadas secciones.

**DIAGNÓSTICO**
${company} alcanza un nivel ${nivelLabel} (${avg}%) con [UNA FRASE: describe en 15 palabras la situación operativa basada en los datos].

**HALLAZGOS**
- ${critica1}: [10 palabras máximo describiendo el problema específico]
- ${critica2}: [10 palabras máximo describiendo el problema específico]  
- ${critica3}: [10 palabras máximo describiendo el problema específico]

**ACCIONES**
1. [Acción concreta en 8 palabras] — 30 días — ISO 9001 cláusula 8.1
2. [Acción concreta en 8 palabras] — 45 días — BASC Pilar 2
3. [Acción concreta en 8 palabras] — 60 días — ISO 9001 cláusula 10.2

**CONCLUSIÓN**
${company} tiene potencial real de mejora. [UNA SOLA ORACIÓN final motivadora de máximo 20 palabras].

Datos de referencia: ${dimSummary}`;

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
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: "Error en API", detail: err });
    }

    const data = await response.json();
    return res.status(200).json({ analysis: data.content?.[0]?.text || "" });

  } catch (e) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
