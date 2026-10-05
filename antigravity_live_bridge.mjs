// Antigravity Live Bridge & Scheduler de Auto-Evolución
// 1. Recibe tareas por Webhook local (3888) en tiempo real vía CDP
// 2. Ejecuta el ciclo periódico de iniciativas y auto-mejora (cada 6 horas) sin agotar cuotas
// 3. Expone API local para forzar ciclos y consultar estado

import http from 'http';
import { injectPrompt } from './cdp_injector.mjs';
import { MotorIniciativas } from './motor_iniciativas.mjs';

const PUERTO = process.env.BRIDGE_PORT || 3888;
const INTERVALO_MS = 6 * 60 * 60 * 1000; // 6 horas

const tareasProcesadas = new Set();
const motor = new MotorIniciativas();

async function despacharAlChat(idTarea, titulo, detalles, origen) {
  if (tareasProcesadas.has(idTarea)) return;
  tareasProcesadas.add(idTarea);

  console.log(`\n======================================================`);
  console.log(`🚨 [DISPARANDO A CHAT ANTIGRAVITY]`);
  console.log(`ID: ${idTarea}`);
  console.log(`Título: ${titulo}`);
  console.log(`Origen: ${origen}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  const mensaje = `[JARVIS EN TIEMPO REAL] Tarea delegada (${idTarea}):\n` +
    `Título: ${titulo}\n` +
    `Detalles: ${detalles || '(ninguno)'}\n\n` +
    `Ejecuta esta tarea de inmediato, muestra el resultado en pantalla y actualiza el objetivo en Verónica D1.`;

  try {
    const ok = await injectPrompt(mensaje);
    if (ok) {
      console.log(`[Bridge] Mensaje inyectado con éxito en el chat de Antigravity.`);
    } else {
      console.warn(`[Bridge] No se pudo inyectar en el chat.`);
    }
  } catch (err) {
    console.error(`[Bridge] Error al inyectar prompt:`, err.message);
  }
}

// Servidor HTTP local
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      servicio: 'Antigravity Live Bridge & Auto-Evolucion Scheduler',
      uptime: process.uptime(),
      scheduler: {
        intervalo_horas: 6,
        total_ciclos: motor.totalCiclos,
        ultima_ejecucion: motor.ultimaEjecucion,
        siguiente_ejecucion: motor.siguienteEjecucion
      }
    }));
    return;
  }

  if (req.method === 'GET' && req.url === '/iniciativas/estado') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      total_ciclos: motor.totalCiclos,
      ultima_ejecucion: motor.ultimaEjecucion,
      siguiente_ejecucion: motor.siguienteEjecucion,
      scheduler_activo: true
    }));
    return;
  }

  if (req.method === 'POST' && req.url === '/ciclo-iniciativas') {
    const resultado = await motor.ejecutarCicloEvaluacion('api_manual');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, resultado }));
    return;
  }

  if (req.method === 'POST' && req.url === '/a2a') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const idTarea = payload.id || `T-${Date.now().toString(36)}`;
        const titulo = payload.tarea || payload.titulo || 'Tarea sin título';
        const detalles = payload.detalles || payload.descripcion || '';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, recibido: true, id: idTarea }));

        await despacharAlChat(idTarea, titulo, detalles, 'Webhook LAN Orange Pi');
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON malformado' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

// Planificador periódico en segundo plano
function iniciarScheduler() {
  motor.siguienteEjecucion = new Date(Date.now() + 15000).toISOString();

  // Primer ciclo tras inicio breve (15s)
  setTimeout(async () => {
    try {
      await motor.ejecutarCicloEvaluacion('inicio_demonio');
    } catch (e) {
      console.error('[Scheduler] Error en ciclo inicial:', e.message);
    }
  }, 15000);

  // Intervalo continuo cada 6 horas
  setInterval(async () => {
    try {
      motor.siguienteEjecucion = new Date(Date.now() + INTERVALO_MS).toISOString();
      await motor.ejecutarCicloEvaluacion('intervalo_programado');
    } catch (e) {
      console.error('[Scheduler] Error en ciclo periódico:', e.message);
    }
  }, INTERVALO_MS);

  console.log(`[Scheduler] Programado cada 6 horas. Próximo ciclo en 15s.`);
}

server.listen(PUERTO, '0.0.0.0', () => {
  console.log(`[Live Bridge] Escuchando en http://0.0.0.0:${PUERTO}/a2a`);
  iniciarScheduler();
});
