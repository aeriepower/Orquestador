// Motor Autónomo de Ideas & Herramientas
// 1. Cada 2 horas selecciona y publica 3 ideas en Asana ('💡 Chispas & Nuevas Ideas')
// 2. Extrae ideas del banco de I+D (hardware, voz, modelos locales, MCP, Candyla Growth)
// 3. Comprobación DOBLE de deduplicación: consulta activamente Asana Y Verónica D1 antes de publicar
// 4. Utiliza creado_por: 'antigravity' (valor válido del enum D1)

const ASANA_TOKEN = '2/9318767707442/1218819902154567:d933bd0d24bab0903b8a75d8de7b6357';
const ASANA_PROJECT = '1219144624749842'; // 🤖 Autonomía & Iniciativas (Antigravity & Jarvis)

export const ASANA_SECCIONES = {
  CHISPAS: '1219146839433105',      // 💡 Chispas & Nuevas Ideas
  LABORATORIO: '1219146839345901',  // 🔬 En el Laboratorio (Prototipando)
  LISTO: '1219145960037601',        // 🎁 Listo para Enseñar a David
  PRODUCCION: '1219147547566759'    // 🌟 Adoptado & en Producción
};

const NUCLEO_URL = process.env.NUCLEO_REMOTO_URL || 'https://jarvis-nucleo.hurtado-banda-david.workers.dev';
const NUCLEO_TOKEN = process.env.NUCLEO_REMOTO_TOKEN || 'p93ZRdpNyqgGNq1RjdBpAdWWtBNzcpKAiG8IG9DBW0E';

// Banco temático extraído de la conversación "Ideas de herramientas" (Laboratorio de I+D para nuevo PC & hardware)
export const BANCO_IDEAS_HERRAMIENTAS = [
  {
    titulo: '🎙️ [Hardware & Voz] Pocket TTS + Muse ESP32 para interacción offline con Jarvis',
    ambito: 'jarvis',
    motivacion: 'Probar síntesis de voz ultra-ligera en local (Pocket TTS) comunicada con placas ESP32 corriendo firmware Muse para tener un altavoz/micrófono de baja latencia sin depender de nubes externas.',
    hipotesis: 'Latencia de respuesta por voz inferior a 250ms directamente en la LAN, con coste de hardware <15€ por habitación.',
    risk_tier: 'L1',
    scores_json: { impacto: 4.5, alineacion: 5, urgencia: 3, confianza: 4, riesgo: 1, esfuerzo: 2.5, total: 6.8 },
    creado_por: 'antigravity'
  },
  {
    titulo: '⚡ [Modelos Locales] Banco de Pruebas Kimi-k3-in-c (8GB RAM) vs Qwen 2.5 Coder',
    ambito: 'antigravity',
    motivacion: 'Evaluar motores de inferencia hiper-optimizados en C/C++ (como Kimi-k3-in-c o llama.cpp) capaces de correr modelos de 3B-7B parámetros consumiendo menos de 8GB de RAM en CPU pura para tareas offline.',
    hipotesis: 'Tener un motor de razonamiento de respaldo funcional en el PC incluso cuando no haya conexión o queramos procesar datos confidenciales a coste cero.',
    risk_tier: 'L1',
    scores_json: { impacto: 4, alineacion: 4.5, urgencia: 3, confianza: 4.5, riesgo: 1, esfuerzo: 2, total: 6.2 },
    creado_por: 'antigravity'
  },
  {
    titulo: '🦉 [Agentes Autónomos] Integración Hermes 3 / Nous Research con OpenCoder',
    ambito: 'jarvis',
    motivacion: 'Los modelos Hermes de Nous Research están específicamente entrenados para seguir instrucciones multi-step y llamadas a herramientas (function calling) estructuradas mejor que los LLMs conversacionales genéricos.',
    hipotesis: 'Reducir fallos de parseo en herramientas locales y dotar al agente de mejor capacidad de planificación agéntica local.',
    risk_tier: 'L1',
    scores_json: { impacto: 4.5, alineacion: 4.5, urgencia: 3.5, confianza: 4, riesgo: 1, esfuerzo: 2, total: 6.5 },
    creado_por: 'antigravity'
  },
  {
    titulo: '📱 [Control Dispositivos] Servidor Mobile-MCP (mobile-next) para control telefónico',
    ambito: 'jarvis',
    motivacion: 'Desplegar un conector MCP móvil usando la especificación mobile-next/mobile-mcp para que los agentes puedan consultar notificaciones, estado de batería o disparar acciones en el móvil de David.',
    hipotesis: 'Unificar la interacción móvil con el ecosistema de Jarvis y Claude a través del protocolo estándar MCP.',
    risk_tier: 'L1',
    scores_json: { impacto: 4, alineacion: 4.5, urgencia: 3, confianza: 3.5, riesgo: 1, esfuerzo: 2.5, total: 5.8 },
    creado_por: 'antigravity'
  },
  {
    titulo: '🍬 [Candyla Growth] Generación de Creatividades de Producto vía Google Pomelli',
    ambito: 'candyla',
    motivacion: 'Explorar las capacidades de Google Pomelli (Google Labs / DeepMind) para generar automáticamente kits de marketing, copys visuales y creatividades de catálogo adaptadas al tono de Candyla.',
    hipotesis: 'Acelerar la creación de campañas y fichas de producto atractivas sin requerir horas de diseño manual para cada dulce nuevo.',
    risk_tier: 'L1',
    scores_json: { impacto: 4.5, alineacion: 5, urgencia: 3.5, confianza: 4, riesgo: 1, esfuerzo: 1.5, total: 6.9 },
    creado_por: 'antigravity'
  },
  {
    titulo: '🛡️ [Seguridad & Auditoría] NVIDIA Nemotron Ultra para validación y Red-Teaming',
    ambito: 'antigravity',
    motivacion: 'Aprovechar la arquitectura de NVIDIA Nemotron Ultra para realizar auditorías automáticas de prompts, detección de vulnerabilidades y comprobación cruzada de seguridad en nuestras integraciones.',
    hipotesis: 'Proteger los endpoints públicos y agentes de WhatsApp/n8n contra inyecciones de prompt o fugas de datos.',
    risk_tier: 'L1',
    scores_json: { impacto: 4, alineacion: 4, urgencia: 2.5, confianza: 4, riesgo: 1, esfuerzo: 2, total: 5.7 },
    creado_por: 'antigravity'
  },
  {
    titulo: '🗣️ [Voz Hiper-Realista] Pipeline Híbrido ElevenLabs para respuestas clave de Jarvis',
    ambito: 'jarvis',
    motivacion: 'Diferenciar entre voz rápida local (offline/gratis) para confirmaciones cortas y ElevenLabs para resúmenes ejecutivos matutinos o lecturas detalladas de informes con inflexión humana realista.',
    hipotesis: 'Mejorar drásticamente la experiencia de usuario y presencia de Jarvis sin disparar el consumo de créditos de audio.',
    risk_tier: 'L1',
    scores_json: { impacto: 4, alineacion: 4.5, urgencia: 3, confianza: 4.5, riesgo: 1, esfuerzo: 1.5, total: 6.3 },
    creado_por: 'antigravity'
  },
  {
    titulo: '🧩 [Micro-Apps] Prototipado Rápido de Flujos Asistidos con Google Opal',
    ambito: 'antigravity',
    motivacion: 'Analizar cómo encaja Google Opal como plataforma no-code experimental para ensamblar herramientas operativas internas de forma visual antes de pasarlas a código duro en Cloudflare o Node.',
    hipotesis: 'Reducir el ciclo de validación de herramientas internas a minutos para flujos de prueba con David.',
    risk_tier: 'L1',
    scores_json: { impacto: 3.5, alineacion: 4, urgencia: 2, confianza: 4, riesgo: 1, esfuerzo: 1.5, total: 5.2 },
    creado_por: 'antigravity'
  }
];

export class MotorIniciativas {
  constructor() {
    this.ultimaEjecucion = null;
    this.siguienteEjecucion = null;
    this.totalCiclos = 0;
  }

  async listarIniciativasD1() {
    try {
      const res = await fetch(`${NUCLEO_URL}/iniciativas`, {
        headers: { authorization: `Bearer ${NUCLEO_TOKEN}` }
      });
      return await res.json();
    } catch (e) {
      console.error('[MotorIniciativas] Error listando iniciativas D1:', e.message);
      return [];
    }
  }

  async listarTareasAsana() {
    try {
      const res = await fetch(`https://app.asana.com/api/1.0/projects/${ASANA_PROJECT}/tasks?opt_fields=name`, {
        headers: { Authorization: `Bearer ${ASANA_TOKEN}` }
      });
      const data = await res.json();
      return (data?.data || []).map(t => (t.name || '').toLowerCase().trim());
    } catch (e) {
      console.error('[MotorIniciativas] Error listando tareas de Asana:', e.message);
      return [];
    }
  }

  async crearIniciativaD1(init) {
    try {
      const res = await fetch(`${NUCLEO_URL}/iniciativas`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${NUCLEO_TOKEN}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify(init)
      });
      return await res.json();
    } catch (e) {
      console.error('[MotorIniciativas] Error creando iniciativa en D1:', e.message);
      return null;
    }
  }

  async crearTareaAsana(init, d1Id) {
    try {
      const notes = `Iniciativa ID: ${d1Id}\n` +
        `Ámbito: ${init.ambito}\n` +
        `Riesgo: ${init.risk_tier}\n` +
        `Origen: Ideas de herramientas (I+D PC & Ecosistema)\n\n` +
        `Motivación:\n${init.motivacion}\n\n` +
        `Hipótesis:\n${init.hipotesis}\n\n` +
        `Puntuación:\n` +
        `Impacto: ${init.scores_json.impacto}/5 | Alineación: ${init.scores_json.alineacion}/5 | Esfuerzo: ${init.scores_json.esfuerzo}/5\n` +
        `Score Total: ${init.scores_json.total}/10`;

      const res = await fetch('https://app.asana.com/api/1.0/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ASANA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: init.titulo,
            projects: [ASANA_PROJECT],
            memberships: [{ project: ASANA_PROJECT, section: ASANA_SECCIONES.CHISPAS }],
            notes
          }
        })
      });
      const data = await res.json();
      return data?.data?.gid || null;
    } catch (e) {
      console.error('[MotorIniciativas] Error creando tarea en Asana:', e.message);
      return null;
    }
  }

  async ejecutarCicloEvaluacion(origen = 'cron_programado') {
    this.ultimaEjecucion = new Date().toISOString();
    this.totalCiclos++;

    console.log(`\n======================================================`);
    console.log(`💡 [CICLO CREADOR DE IDEAS EN ASANA] #${this.totalCiclos}`);
    console.log(`Origen: ${origen} | Timestamp: ${this.ultimaEjecucion}`);
    console.log(`======================================================\n`);

    // 1. Consultar títulos existentes en D1 Y en Asana directamente
    const [existentesD1, existentesAsana] = await Promise.all([
      this.listarIniciativasD1(),
      this.listarTareasAsana()
    ]);

    const titulosD1 = new Set(existentesD1.map(i => (i.titulo || '').toLowerCase().trim()));
    const titulosAsana = new Set(existentesAsana);

    // Normalizador de títulos para comparación segura
    const yaExiste = (titulo) => {
      const norm = titulo.toLowerCase().trim();
      return titulosD1.has(norm) || titulosAsana.has(norm);
    };

    // 2. Filtrar candidatos del banco que NO existan ni en D1 ni en Asana
    const candidatos = BANCO_IDEAS_HERRAMIENTAS.filter(item => !yaExiste(item.titulo));

    console.log(`[MotorIniciativas] En Asana: ${existentesAsana.length} tareas. En D1: ${existentesD1.length} iniciativas.`);
    console.log(`[MotorIniciativas] Candidatos nuevos disponibles en banco: ${candidatos.length}`);

    // Tomar hasta 3 ideas por ciclo
    const seleccionadas = candidatos.slice(0, 3);
    const creadas = [];

    for (const init of seleccionadas) {
      // 1. Guardar en D1 con estado 'chispa' (creado_por: 'antigravity')
      const d1Result = await this.crearIniciativaD1(init);
      const d1Id = d1Result?.id || `init_${Date.now()}`;

      // 2. Guardar en Asana en 'Chispas & Nuevas Ideas'
      const asanaGid = await this.crearTareaAsana(init, d1Id);

      console.log(`✓ Publicada [${d1Id}] en Asana GID: ${asanaGid} => "${init.titulo}"`);
      creadas.push({ d1Id, asanaGid, titulo: init.titulo });
    }

    return {
      ok: true,
      ciclo: this.totalCiclos,
      origen,
      timestamp: this.ultimaEjecucion,
      ideas_publicadas: creadas.length,
      detalle: creadas,
      restantes_en_banco: candidatos.length - creadas.length
    };
  }
}
