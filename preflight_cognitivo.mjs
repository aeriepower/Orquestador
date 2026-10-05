// Pre-flight Check Cognitivo de Antigravity
// Módulo de autocrítica que consulta directamente a Verónica D1 (patrones de rechazo y reglas de arquitectura)
// Evita sesgos de mantenimiento rutinario, silos locales y violaciones de la Regla Cero.

const NUCLEO_URL = process.env.NUCLEO_REMOTO_URL || 'https://jarvis-nucleo.hurtado-banda-david.workers.dev';
const NUCLEO_TOKEN = process.env.NUCLEO_REMOTO_TOKEN || 'p93ZRdpNyqgGNq1RjdBpAdWWtBNzcpKAiG8IG9DBW0E';

export class PreflightCognitivo {
  constructor() {
    this.cacheRechazos = null;
    this.cacheTimestamp = 0;
    this.CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de caché
  }

  async obtenerPatronesRechazo() {
    const ahora = Date.now();
    if (this.cacheRechazos && (ahora - this.cacheTimestamp < this.CACHE_TTL_MS)) {
      return this.cacheRechazos;
    }

    try {
      const res = await fetch(`${NUCLEO_URL}/iniciativas/rechazos/todos`, {
        headers: { authorization: `Bearer ${NUCLEO_TOKEN}` }
      });
      if (res.ok) {
        this.cacheRechazos = await res.json();
        this.cacheTimestamp = ahora;
        return this.cacheRechazos;
      }
    } catch (e) {
      console.warn('[PreflightCognitivo] No se pudo consultar patrones de rechazo en D1:', e.message);
    }
    return this.cacheRechazos || [];
  }

  /**
   * Evalúa la intención antes de actuar.
   * @param {string} promptUsuario - Lo que David ha pedido o lo que se va a hacer.
   * @param {object} contexto - Datos adicionales (ej. { accionPlaneada, riesgo, esPrototipo })
   * @returns {Promise<object>} Evaluación cognitiva estructurada
   */
  async evaluar(promptUsuario, contexto = {}) {
    const texto = `${promptUsuario} ${contexto.accionPlaneada || ''}`.toLowerCase();
    const advertencias = [];
    const consejos = [];
    const patronesD1 = await this.obtenerPatronesRechazo();

    // 1. Detección de Sesgo Bug-Fixer vs Curiosidad/Iniciativa (Principio de Autonomía)
    const palabrasBugFix = ['bug', 'error', 'fix', 'parche', 'fallo', 'corregir', 'reparar'];
    const tieneBugFix = palabrasBugFix.some(p => texto.includes(p));
    const palabrasAutonomia = ['iniciativa', 'apetezca', 'quieras', 'inventar', 'mejorarte', 'brainstorm', 'explorar', 'autonomia'];
    const tieneAutonomia = palabrasAutonomia.some(p => texto.includes(p));

    if (tieneAutonomia && tieneBugFix) {
      advertencias.push({
        codigo: 'ALERTA_SESGO_BUGFIX',
        mensaje: 'David habla de autonomía/iniciativa: no saltes a reparar bugs ni tareas de mantenimiento (para eso está Sentinel).'
      });
    }

    // 2. Comprobación contra Patrones de Rechazo vivos en Verónica D1
    for (const p of patronesD1) {
      let senales = [];
      try {
        senales = typeof p.senales_json === 'string' ? JSON.parse(p.senales_json) : (p.senales_json || []);
      } catch (_) {}

      const coincide = senales.some(s => texto.includes(s.toLowerCase()));
      if (coincide) {
        advertencias.push({
          codigo: `RECHAZO_HISTORICO_${p.categoria.toUpperCase()}`,
          mensaje: `Alerta por patrón rechazado en D1: ${p.resumen_rechazo}`
        });
      }
    }

    // 3. Chequeo de Falso Consentimiento en L1 (Autonomía para Prototipos)
    if (contexto.accionPlaneada && contexto.accionPlaneada.toLowerCase().includes('preguntar')) {
      if (contexto.esPrototipo || contexto.riesgo === 'L1') {
        advertencias.push({
          codigo: 'ALERTA_PREGUNTA_REDUNDANTE_L1',
          mensaje: 'En tareas L1 (prototipos en ramas aisladas, herramientas internas), David prefiere autonomía al 90%. Prototipa primero, enseña funcionando.'
        });
      }
    }

    // 4. Disciplina Git: Comprobación de Ramas para Prototipos
    if (contexto.esPrototipo && (!contexto.ramaGit || contexto.ramaGit === 'main' || contexto.ramaGit === 'master')) {
      advertencias.push({
        codigo: 'ALERTA_GIT_RAMA_OBLIGATORIA',
        mensaje: 'Los prototipos y experimentos deben vivir en ramas feature aisladas (feat/...), nunca directamente en main ni master para no dejar código legacy.'
      });
    }

    // 5. Chequeo de Regla Cero (§0 AGENTS.md)
    if (texto.includes('fichero local') || texto.includes('archivo json') || texto.includes('disco local')) {
      advertencias.push({
        codigo: 'ALERTA_REGLA_CERO',
        mensaje: 'Cero información privilegiada: toda verdad persistente debe residir en Verónica D1 para que Jarvis y Claude puedan consumirla.'
      });
    }

    return {
      timestamp: new Date().toISOString(),
      prompt_analizado: promptUsuario.substring(0, 100) + (promptUsuario.length > 100 ? '...' : ''),
      riesgo_malentendido: advertencias.length > 1 ? 'ALTO' : advertencias.length === 1 ? 'MEDIO' : 'BAJO',
      advertencias,
      consejos,
      veredicto: advertencias.length === 0 ? 'LISTO_PARA_EJECUTAR' : 'REVISAR_ENFOQUE_ANTES_DE_ACTUAR'
    };
  }
}

// Ejecución CLI directa
if (process.argv[1] && process.argv[1].endsWith('preflight_cognitivo.mjs')) {
  const promptEntrada = process.argv.slice(2).join(' ') || 'Quiero guardar esta memoria en un fichero json local en el disco';
  const preflight = new PreflightCognitivo();
  preflight.evaluar(promptEntrada, { esPrototipo: true, ramaGit: 'main' }).then(res => {
    console.log('\n=== RESULTADO DEL PRE-FLIGHT COGNITIVO ANTIGRAVITY (CONEXIÓN D1) ===\n');
    console.log(JSON.stringify(res, null, 2));
  });
}
