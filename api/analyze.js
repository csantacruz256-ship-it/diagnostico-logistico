export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { company, role, avg, dimSummary, weakDims, strongDims } = req.body;

  const prompt = `Eres Christian Santacruz, experto en logística y procesos. Genera un diagnóstico BREVE y COMPLETO. Máximo 250 palabras en total.

Datos:
- Empresa: ${company} | Puntaje: ${avg}%
- Críticas: ${weakDims.length > 0 ? weakDims.join(", ") : "Ninguna"}
- Fortalezas: ${strongDims.length > 0 ? strongDims.join(", ") : "Ninguna aún"}
- Detalle: ${dimSummary}

Responde SOLO con este formato, sin agregar nada extra:

**DIAGNÓSTICO**
[1 oración directa sobre la situación de ${company}]

**HALLAZGOS**
- [Hallazgo crítico 1 — 1 oración]
- [Hallazgo crítico 2 — 1 oración]
- [Hallazgo crítico 3 — 1 oración]

**ACCIONES**
1. [Acción 1 + plazo] — Ref. ISO/BASC
2. [Acción 2 + plazo] — Ref. ISO/BASC
3. [Acción 3 + plazo] — Ref. ISO/BASC

**CONCLUSIÓN**
[2 oraciones completas. Termina mencionando a ${company}.]`;

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
        max_tokens: 800,
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
