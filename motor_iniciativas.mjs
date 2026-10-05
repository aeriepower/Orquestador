// Motor Autónomo de Iniciativas & Auto-Evolución
// Gestiona el ciclo de vida de iniciativas entre Verónica D1 y el tablero de Asana.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export class MotorIniciativas {
  constructor() {
    this.ultimaEjecucion = null;
    this.siguienteEjecucion = null;
    this.totalCiclos = 0;
  }

  async moverTareaAsana(taskGid, sectionGid, comentario = null) {
    try {
      const res = await fetch(`https://app.asana.com/api/1.0/sections/${sectionGid}/addTask`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ASANA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: { task: taskGid } })
      });
      const data = await res.json();

      if (comentario) {
        await fetch(`https://app.asana.com/api/1.0/tasks/${taskGid}/stories`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ASANA_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: { text: comentario } })
        });
      }

      return data;
    } catch (e) {
      console.error(`[MotorIniciativas] Error moviendo tarea Asana ${taskGid}:`, e.message);
      return null;
    }
  }

  async actualizarIniciativaD1(id, updates) {
    try {
      const res = await fetch(`${NUCLEO_URL}/iniciativas/${id}`, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${NUCLEO_TOKEN}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.error(`[MotorIniciativas] Error actualizando iniciativa D1 ${id}:`, e.message);
      return null;
    }
  }

  async listarIniciativasD1() {
    try {
      const res = await fetch(`${NUCLEO_URL}/iniciativas`, {
        headers: { authorization: `Bearer ${NUCLEO_TOKEN}` }
      });
      return await res.json();
    } catch (e) {
      console.error(`[MotorIniciativas] Error listando iniciativas D1:`, e.message);
      return [];
    }
  }

  async ejecutarCicloEvaluacion(origen = 'cron_programado') {
    this.ultimaEjecucion = new Date().toISOString();
    this.totalCiclos++;
    console.log(`\n======================================================`);
    console.log(`🔄 [CICLO DE INICIATIVAS Y AUTO-EVOLUCIÓN] #${this.totalCiclos}`);
    console.log(`Origen: ${origen} | Timestamp: ${this.ultimaEjecucion}`);
    console.log(`======================================================\n`);

    const iniciativas = await this.listarIniciativasD1();
    console.log(`[MotorIniciativas] ${iniciativas.length} iniciativas registradas en D1.`);

    return {
      ok: true,
      ciclo: this.totalCiclos,
      origen,
      timestamp: this.ultimaEjecucion,
      total_iniciativas: iniciativas.length
    };
  }
}
