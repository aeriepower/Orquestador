// Antigravity Live Bridge: Receptor en tiempo real con inyección activa en el chat vía CDP
// 1. Recibe por Webhook local (3888) o sondeo en Verónica D1
// 2. Inyecta el encargo directamente en el editor del chat de Antigravity vía Chrome DevTools Protocol
// 3. Pulsa Enter para que el chat se active y empiece a generar en pantalla en tiempo real

import http from 'http';
import { injectPrompt } from './cdp_injector.mjs';

const PUERTO = process.env.BRIDGE_PORT || 3888;
const NUCLEO_URL = process.env.NUCLEO_REMOTO_URL || 'https://jarvis-nucleo.hurtado-banda-david.workers.dev';
const NUCLEO_TOKEN = process.env.NUCLEO_REMOTO_TOKEN || 'p93ZRdpNyqgGNq1RjdBpAdWWtBNzcpKAiG8IG9DBW0E';

const tareasProcesadas = new Set();

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

// Servidor HTTP local (Webhook para Jarvis en la misma red)
const server = http.createServer((req, res) => {
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
    res.end(JSON.stringify({ ok: true, servicio: 'Antigravity Live Bridge', uptime: process.uptime() }));
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

server.listen(PUERTO, '0.0.0.0', () => {
  console.log(`[Live Bridge] Escuchando en http://0.0.0.0:${PUERTO}/a2a (Cero sondeo a Cloudflare, 100% PUSH local)`);
});
