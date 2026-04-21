export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { company, role, avg, dimSummary, weakDims, strongDims } = req.body;

  const prompt = `Eres Christian Santacruz, Ingeniero en Transporte y Logística con experiencia real en PRONACA Ecuador, experto en gestión por procesos, supply chain, BASC e ISO 9001 aplicados a operaciones logísticas.

Datos del diagnóstico:
Empresa: ${company} | Cargo evaluador: ${role || "No especificado"} | Puntaje global: ${avg}%
Dimensiones críticas (< 50%): ${weakDims.join(", ") || "ninguna"}
Fortalezas (> 75%): ${strongDims.join(", ") || "ninguna"}
Detalle por dimensión: ${dimSummary}

Genera un análisis ejecutivo directo y técnico. Responde ÚNICAMENTE con este JSON, sin texto adicional ni markdown:
{
  "situacion": "[2-3 oraciones sobre la situación operativa actual de ${company}, mencionando el nivel de madurez y las brechas estructurales más críticas]",
  "riesgo": "[1-2 oraciones sobre el riesgo operativo principal, considerando el impacto en la cadena de suministro, seguridad de carga y continuidad operativa]",
  "conclusion": "[2 oraciones: una sobre el potencial de mejora con acciones concretas y una motivadora que conecte la mejora de procesos con resultados de negocio reales para ${company}]"
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
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    let situacion = `${company} presenta procesos en desarrollo (${avg}%) con brechas estructurales en estandarización y medición. La operación funciona por experiencia individual, no por sistema documentado, lo que genera variabilidad en el nivel de servicio y limita la escalabilidad.`;
    let riesgo = "La combinación de baja trazabilidad y ausencia de controles formales expone la operación a incidentes sin capacidad de reconstruir la cadena de eventos, con impacto directo en auditorías y relación con clientes clave.";
    let conclusion = `Con una hoja de ruta enfocada en los tres procesos críticos identificados, ${company} puede escalar 25-35 puntos de madurez en menos de 90 días. La gestión por procesos no es un gasto operativo — es la base para crecer sin perder control.`;

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

    // ── HALLAZGOS ampliados con contexto técnico real ──
    const descripcionHallazgo = {
      "Planificación y Despacho":
        "La programación de rutas y asignación de recursos opera sin SOP formal ni herramienta de soporte. Esto genera variabilidad en tiempos de ciclo, uso ineficiente de la capacidad de carga y decisiones basadas en criterio individual del operador. Impacto directo: incumplimiento de ventanas de entrega y absorción de costos evitables.",
      "Trazabilidad y Control de Flota":
        "Sin visibilidad en tiempo real, el control de posición, estado y cumplimiento de ruta es retrospectivo. La gestión de incidentes es reactiva: se actúa cuando el daño ya ocurrió. Adicionalmente, la ausencia de registros de movimiento impide generar evidencia para auditorías internas y externas.",
      "Gestión de Indicadores (KPIs)":
        "No existen indicadores formalmente definidos, con propietario asignado ni frecuencia de medición establecida. Las decisiones operativas se toman por percepción o experiencia, no por dato. Esto bloquea la detección temprana de desviaciones y dificulta justificar inversiones ante la dirección.",
      "Seguridad Operativa y BASC":
        "Los controles de seguridad en la cadena logística presentan brechas en inspección de vehículos, verificación de conductores y custodia de carga. Esto expone a la empresa a riesgos de contaminación, pérdida de mercancía y sanciones en auditorías BASC, con impacto en la certificación y la relación con clientes que exigen estándares de seguridad.",
      "Calidad ISO 9001":
        "La gestión de no conformidades y auditorías internas no está sistematizada. Los problemas recurrentes no se registran formalmente, lo que impide implementar acciones correctivas efectivas. La ausencia de documentación dificulta demostrar conformidad ante clientes y organismos certificadores.",
      "Gestión de Proveedores y Transporte":
        "La evaluación y selección de transportistas carece de criterios formales, SLAs medibles y mecanismos de seguimiento. Esto genera inconsistencia en el nivel de servicio, dificultad para gestionar el desempeño de flota externa y exposición a riesgos operativos no controlados.",
    };

    // ── PLAN DE ACCIÓN con referencias precisas y entregables definidos ──
    const accionesMap = {
      "Planificación y Despacho": {
        accion: "Documentar proceso de planificación y despacho con SOP formal, flujograma y responsables definidos",
        detalle: "Incluir formulario de pre-despacho y checklist de cierre de ruta",
        ref: "ISO 9001:2015 — Cláusulas 8.1 y 4.4 (SGC y sus procesos)",
        entregable: "Procedimiento documentado + mapa de proceso",
        plazo: "30 días",
      },
      "Trazabilidad y Control de Flota": {
        accion: "Implementar GPS con trazabilidad activa, alertas por exceso de velocidad, desvío de ruta y paradas no autorizadas",
        detalle: "Configurar reportes automáticos diarios/semanales para el equipo de despacho",
        ref: "BASC V5-2022 — Pilar 1 (Seguridad en transporte) + ISO 9001 Cláusula 8.5.3",
        entregable: "Dashboard de trazabilidad operativa en tiempo real",
        plazo: "45 días",
      },
      "Gestión de Indicadores (KPIs)": {
        accion: "Definir 5 KPIs operativos con propietario, frecuencia de medición y tablero de control con semáforos",
        detalle: "KPIs base: OTIF, excesos de velocidad, cumplimiento de plan, costo/km, tiempo de ciclo por cliente",
        ref: "ISO 9001:2015 — Cláusulas 9.1.1 y 6.2.1 (Objetivos de calidad)",
        entregable: "Tablero Power BI o Excel con revisión semanal obligatoria",
        plazo: "30 días",
      },
      "Seguridad Operativa y BASC": {
        accion: "Implementar checklist BASC de inspección de vehículos, verificación de conductores y registro de custodia de carga",
        detalle: "Establecer procedimiento de respuesta ante incidentes de seguridad",
        ref: "BASC V5-2022 — Pilares 1 y 4 (Seguridad en transporte y gestión de riesgos en cadena de suministro)",
        entregable: "Manual de seguridad operativa + formatos de control",
        plazo: "45 días",
      },
      "Calidad ISO 9001": {
        accion: "Estructurar manual de calidad, sistema de gestión de no conformidades y programa de auditoría interna",
        detalle: "Incluir procedimiento de acciones correctivas con análisis de causa raíz",
        ref: "ISO 9001:2015 — Cláusulas 10.2 (No conformidad y acción correctiva) y 9.2 (Auditoría interna)",
        entregable: "Manual de calidad + registro de no conformidades",
        plazo: "60 días",
      },
      "Gestión de Proveedores y Transporte": {
        accion: "Crear matriz de evaluación de transportistas con criterios formales, SLAs medibles y revisión trimestral",
        detalle: "Incluir criterios de seguridad BASC en la selección de proveedores",
        ref: "ISO 9001:2015 — Cláusula 8.4 (Control de procesos, productos y servicios suministrados externamente)",
        entregable: "Matriz de evaluación + proceso de homologación de transportistas",
        plazo: "45 días",
      },
    };

    const todasDims = [
      ...weakDims,
      ...Object.keys(accionesMap).filter(d => !weakDims.includes(d) && !strongDims.includes(d)),
    ];

    const acciones = todasDims.slice(0, 3).map((d, i) => {
      const a = accionesMap[d] || {
        accion: "Estandarizar proceso crítico con procedimiento documentado",
        detalle: "Definir responsables, frecuencia de revisión y criterios de aceptación",
        ref: "ISO 9001:2015 — Cláusula 8.1",
        entregable: "Procedimiento documentado",
        plazo: "30 días",
      };
      return `${i + 1}. **${a.accion}** — _${a.plazo}_\n   ${a.detalle}\n   Ref: ${a.ref}\n   Entregable: ${a.entregable}`;
    });

    const hallazgos = weakDims.length > 0
      ? weakDims.slice(0, 3).map(d => {
          const desc = descripcionHallazgo[d] || "Requiere estandarización y medición formal para alcanzar el nivel operativo requerido.";
          return `- **${d}:** ${desc}`;
        })
      : strongDims.slice(0, 2)
          .map(d => `- **${d}:** Dimensión sólida — puede servir como modelo de replicación para otras áreas de la operación.`)
          .concat([`- **Oportunidad estratégica:** Avanzar hacia certificación formal ISO 9001 o BASC para consolidar y demostrar la madurez alcanzada ante clientes y mercado.`]);

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
