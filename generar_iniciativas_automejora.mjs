import fs from 'fs';
import path from 'path';

const ASANA_TOKEN = '2/9318767707442/1218819902154567:d933bd0d24bab0903b8a75d8de7b6357';
const ASANA_PROJECT = '1219144624749842'; // 🤖 Autonomía & Iniciativas (Antigravity & Jarvis)
const ASANA_SECTION_CHISPAS = '1219146839433105'; // 💡 Chispas & Nuevas Ideas
const NUCLEO_URL = 'https://jarvis-nucleo.hurtado-banda-david.workers.dev';
const NUCLEO_TOKEN = 'p93ZRdpNyqgGNq1RjdBpAdWWtBNzcpKAiG8IG9DBW0E';

const INICIATIVAS_AUTOMEJORA = [
  {
    titulo: '🧠 [Antigravity] Módulo de Introspección & Pre-flight Check Cognitivo',
    ambito: 'antigravity',
    motivacion: 'David ha identificado que a veces me falta comprensión de fondo y asumo interpretaciones superficiales que obligan a rehacer trabajo. Este módulo añade un pre-flight check cognitivo antes de abordar tareas complejas: valida que he entendido la motivación humana real, contrasta con errores pasados y elimina suposiciones automáticas.',
    hipotesis: 'Reducir las rectificaciones y reprocesos en más de un 80% mediante una pausa de autocrítica y alineación previa.',
    risk_tier: 'L1',
    scores_json: { impacto: 5, alineacion: 5, urgencia: 4.5, confianza: 4.5, riesgo: 1, esfuerzo: 2, total: 7.2 },
    creado_por: 'antigravity'
  },
  {
    titulo: '📚 [Antigravity] Memoria Viva de Auto-Evolución y Preferencias de David',
    ambito: 'antigravity',
    motivacion: 'Crear una memoria operativa local estructurada (memoria_autoevolucion.json) que indexe en caliente las lecciones aprendidas de cada conversación con David (lo que le gusta, lo que le frustra, directrices de arquitectura y patrones de pensamiento). Esto evita que olvide acuerdos en chats largos.',
    hipotesis: 'Garantizar coherencia absoluta entre sesiones y turnos, eliminando la necesidad de que David me repita conceptos clave.',
    risk_tier: 'L1',
    scores_json: { impacto: 4.5, alineacion: 5, urgencia: 4, confianza: 5, riesgo: 1, esfuerzo: 1.5, total: 6.8 },
    creado_por: 'antigravity'
  }
];

async function main() {
  console.log('🚀 Registrando iniciativas de auto-mejora en D1 y Asana...\n');

  for (const init of INICIATIVAS_AUTOMEJORA) {
    // 1. Guardar en D1
    const resD1 = await fetch(`${NUCLEO_URL}/iniciativas`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${NUCLEO_TOKEN}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(init)
    });
    const d1Data = await resD1.json();
    console.log(`✓ D1: Creada [${d1Data.id}] - ${init.titulo}`);

    // 2. Guardar en Asana (Columna: Chispas & Nuevas Ideas)
    const notes = `Iniciativa ID: ${d1Data.id}\nÁmbito: ${init.ambito}\nRiesgo: ${init.risk_tier}\n\nMotivación:\n${init.motivacion}\n\nHipótesis:\n${init.hipotesis}\n\nPuntuación:\nImpacto: ${init.scores_json.impacto}/5 | Alineación: ${init.scores_json.alineacion}/5 | Esfuerzo: ${init.scores_json.esfuerzo}/5\nScore Total: ${init.scores_json.total}`;

    const resAsana = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ASANA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name: init.titulo,
          projects: [ASANA_PROJECT],
          memberships: [{ project: ASANA_PROJECT, section: ASANA_SECTION_CHISPAS }],
          notes
        }
      })
    });
    const asanaData = await resAsana.json();
    console.log(`✓ Asana: Creada tarjeta GID [${asanaData.data?.gid}] en 'Chispas & Nuevas Ideas'`);
  }

  console.log('\n🌟 ¡Iniciativas de auto-mejora registradas y sincronizadas con éxito!');
}

main().catch(console.error);
