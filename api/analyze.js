export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { company, role, avg, dimSummary, weakDims, strongDims } = req.body;

  const prompt = `Eres Christian Santacruz, experto en gestión por procesos logísticos, BASC e ISO 9001.

Diagnóstico de madurez logística completado:
EMPRESA: ${company}
CARGO: ${role || "No especificado"}
PUNTAJE GLOBAL: ${avg}%
DIMENSIONES:
${dimSummary}
CRÍTICAS (bajo 50%): ${weakDims.length > 0 ? weakDims.join(", ") : "Ninguna"}
FORTALEZAS (sobre 75%): ${strongDims.length > 0 ? strongDims.join(", ") : "Ninguna aún"}

Responde EXACTAMENTE con este formato. Sé conciso — máximo 2 oraciones por punto:

**DIAGNÓSTICO EJECUTIVO**
[2 oraciones sobre la situación actual]

**HALLAZGOS CRÍTICOS**
- [Hallazgo 1: 1 oración]
- [Hallazgo 2: 1 oración]
- [Hallazgo 3: 1 oración]

**PLAN DE ACCIÓN PRIORITARIO**
1. [Acción 1 — plazo — referencia ISO/BASC: 2 oraciones máximo]
2. [Acción 2 — plazo — referencia ISO/BASC: 2 oraciones máximo]
3. [Acción 3 — plazo — referencia ISO/BASC: 2 oraciones máximo]

**CONCLUSIÓN**
[3 oraciones completas. La última debe ser motivadora y mencionar a ${company}.]`;

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
        max_tokens: 1500,
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
