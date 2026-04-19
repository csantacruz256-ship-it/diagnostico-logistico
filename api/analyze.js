export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { company, role, avg, dimSummary, weakDims, strongDims } = req.body;

  const prompt = `Eres Christian Santacruz, Ingeniero en Transporte y Logística, Coordinador de Despacho con experiencia real en PRONACA Ecuador, experto en gestión por procesos con enfoque en logística, supply chain y transporte. También tienes expertise en BASC e ISO 9001 aplicados a operaciones logísticas.

Una empresa acaba de completar un diagnóstico de madurez logística. Estos son sus resultados:

EMPRESA: ${company}
CARGO DEL EVALUADOR: ${role || "No especificado"}
PUNTAJE GLOBAL: ${avg}%

RESULTADOS POR DIMENSIÓN:
${dimSummary}

DIMENSIONES CRÍTICAS (bajo 50%): ${weakDims.length > 0 ? weakDims.join(", ") : "Ninguna"}
FORTALEZAS (sobre 75%): ${strongDims.length > 0 ? strongDims.join(", ") : "Ninguna aún"}

Genera un análisis ejecutivo profesional con este formato exacto:

**DIAGNÓSTICO EJECUTIVO**
[2-3 oraciones que describan la situación actual de la empresa de forma directa y sin rodeos]

**HALLAZGOS CRÍTICOS**
[3 hallazgos específicos basados en los datos, con lenguaje técnico logístico real]

**PLAN DE ACCIÓN PRIORITARIO**
[3 acciones concretas y ejecutables, ordenadas por impacto, con referencia a ISO 9001 o BASC donde aplique]

**CONCLUSIÓN**
[1 párrafo motivador que conecte la mejora de procesos con resultados de negocio reales]

Usa lenguaje técnico pero comprensible. Sé directo, específico y útil. No uses frases genéricas.`;

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
        max_tokens: 2048,
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
