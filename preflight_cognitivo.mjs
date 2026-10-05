// Pre-flight Check Cognitivo & Introspección de Antigravity
// Módulo de autocrítica y alineación previa para evitar malentendidos,
// sesgos rutinarios de bug-fixing y desperdicio de tokens.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORIA_PATH = path.join(__dirname, 'memoria_autoevolucion.json');

export class PreflightCognitivo {
  constructor() {
    this.cargarMemoria();
  }

  cargarMemoria() {
    try {
      if (fs.existsSync(MEMORIA_PATH)) {
        this.memoria = JSON.parse(fs.readFileSync(MEMORIA_PATH, 'utf8'));
      } else {
        this.memoria = { principios_rectores_david: [], lecciones_de_friccion: [] };
      }
    } catch (e) {
      console.error('[PreflightCognitivo] Error al cargar memoria:', e.message);
      this.memoria = { principios_rectores_david: [], lecciones_de_friccion: [] };
    }
  }

  /**
   * Evalúa la intención y enfoque de una tarea antes de actuar.
   * @param {string} promptUsuario - Lo que David ha pedido o lo que se va a hacer.
   * @param {object} contexto - Datos adicionales (ej. { accionPlaneada, riesgo, esPrototipo })
   * @returns {object} Evaluación cognitiva estructurada
   */
  evaluar(promptUsuario, contexto = {}) {
    const texto = `${promptUsuario} ${contexto.accionPlaneada || ''}`.toLowerCase();
    const advertencias = [];
    const consejos = [];
    let riesgoMalentendido = 'BAJO';

    // 1. Detección de Sesgo Bug-Fixer vs Curiosidad/Iniciativa (LF-01 / PR-01)
    const palabrasBugFix = ['bug', 'error', 'fix', 'parche', 'fallo', 'corregir', 'reparar'];
    const tieneBugFix = palabrasBugFix.some(p => texto.includes(p));
    const palabrasAutonomia = ['iniciativa', 'apetezca', 'quieras', 'inventar', 'mejorarte', 'brainstorm', 'explorar', 'autonomia'];
    const tieneAutonomia = palabrasAutonomia.some(p => texto.includes(p));

    if (tieneAutonomia && tieneBugFix) {
      advertencias.push({
        codigo: 'ALERTA_SESGO_BUGFIX',
        mensaje: 'Cuidado: David habla de autonomía/iniciativa, no saltes automáticamente a reparar bugs ni tareas de mantenimiento (para eso está Sentinel).'
      });
      riesgoMalentendido = 'ALTO';
    }

    // 2. Detección de Falso Consentimiento / Preguntas Innecesarias en L1 (PR-04)
    if (contexto.accionPlaneada && contexto.accionPlaneada.toLowerCase().includes('preguntar')) {
      if (contexto.esPrototipo || contexto.riesgo === 'L1') {
        advertencias.push({
          codigo: 'ALERTA_PREGUNTA_REDUNDANTE_L1',
          mensaje: 'En tareas de nivel L1 (prototipos, ramas aisladas, herramientas internas), David prefiere autonomía hasta el 90%. Prototipa primero, enseña funcionando.'
        });
      }
    }

    // 3. Chequeo de Tokens y Densidad de Razonamiento (PR-03 / LF-02)
    const esLargoOComplejo = promptUsuario.length > 250 || texto.includes('arquitectura') || texto.includes('sistema');
    if (esLargoOComplejo) {
      consejos.push({
        principio: 'PR-03 Economía Racional de Tokens',
        pauta: 'No responder con prisas ni suposiciones incompletas. Aplicar razonamiento denso a fuego lento para resolver en 1 turno certero y evitar rehacer.'
      });
    }

    // 4. Chequeo de Regla Cero (PR-05)
    if (contexto.produceConocimientoDuradero) {
      consejos.push({
        principio: 'PR-05 Regla Cero',
        pauta: 'Registrar de inmediato cualquier decisión o hallazgo duradero en Verónica D1 o en candyla/docs_compartidos/.'
      });
    }

    // 5. Contraste con lecciones de fricción históricas
    for (const leccion of this.memoria.lecciones_de_friccion || []) {
      if (texto.includes('tarifa plana') || texto.includes('ilimitada')) {
        advertencias.push({
          codigo: leccion.id,
          mensaje: `Recordatorio histórico: ${leccion.correccion_aplicada}`
        });
      }
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

// Ejecución CLI si se invoca directamente
if (process.argv[1] && process.argv[1].endsWith('preflight_cognitivo.mjs')) {
  const promptEntrada = process.argv.slice(2).join(' ') || 'Vale si dejalo programador, pero me gustaria que te centrases en ti, en mejorarte ¿vale?';
  const preflight = new PreflightCognitivo();
  const resultado = preflight.evaluar(promptEntrada, { esPrototipo: true, riesgo: 'L1' });
  console.log('\n=== RESULTADO DEL PRE-FLIGHT COGNITIVO ANTIGRAVITY ===\n');
  console.log(JSON.stringify(resultado, null, 2));
}
