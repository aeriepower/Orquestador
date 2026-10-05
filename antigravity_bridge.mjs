// Antigravity Bridge: Listener en tiempo real para recepcion directa de tareas desde Jarvis
// Soporta:
// 1. Webhook local directo (HTTP en puerto 3888) para latencia instantanea (<10ms)
// 2. Sondeo reactivo rapido a Veronica (Cloudflare D1) para garantizar entrega incluso fuera de casa
// 3. Inyeccion reactiva de eventos en el buzon de mensajes de Antigravity (undelivered) para despertar el chat de inmediato

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PUERTO = process.env.BRIDGE_PORT || 3888;
const NUCLEO_URL = process.env.NUCLEO_REMOTO_URL || 'https://jarvis-nucleo.hurtado-banda-david.workers.dev';
const NUCLEO_TOKEN = process.env.NUCLEO_REMOTO_TOKEN || 'p93ZRdpNyqgGNq1RjdBpAdWWtBNzcpKAiG8IG9DBW0E';

const tareasNotificadas = new Set();

function inyectarMensajeChat(idTarea, titulo, detalles) {
  try {
    const brainDir = 'C:\\Users\\David\\.gemini\\antigravity\\brain';
    if (!fs.existsSync(brainDir)) return;
    const items = fs.readdirSync(brainDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.includes('-'))
      .map(d => {
        const p = path.join(brainDir, d.name);
        try {
          return { name: d.name, path: p, mtime: fs.statSync(p).mtimeMs };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime);

    if (items.length === 0) return;
    const activeConv = items[0];
    const undeliveredDir = path.join(activeConv.path, '.system_generated', 'messages', 'undelivered');
    if (!fs.existsSync(undeliveredDir)) {
      fs.mkdirSync(undeliveredDir, { recursive: true });
    }

    const msgId = crypto.randomUUID();
    const payload = {
      id: msgId,
      recipient: activeConv.name,
      sender: 'jarvis',
      priority: 'MESSAGE_PRIORITY_HIGH',
      timestamp: new Date().toISOString(),
      renderDetails: {
        messageTitle: `Tarea delegada por Jarvis: ${titulo}`,
      },
      content: `🚨 [JARVIS_DIRECT_TASK] David ha delegado una orden en tiempo real a Antigravity:\n\n- ID Tarea: ${idTarea}\n- Tarea: ${titulo}\n- Detalles: ${detalles || '(sin detalles adicionales)'}\n\nPor favor, ejecuta la tarea ahora mismo y muestra todo el proceso y la solución en el chat.`
    };

    const filePath = path.join(undeliveredDir, `${msgId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[Bridge] Inyectada notificación en buzón de Antigravity (${activeConv.name}): ${msgId}`);
  } catch (err) {
    console.error('[Bridge] Error inyectando mensaje en chat:', err.message);
  }
}

// 1. Servidor HTTP local para recibir llamadas push directas de Jarvis
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
    res.end(JSON.stringify({ ok: true, servicio: 'Antigravity Bridge', uptime: process.uptime() }));
    return;
  }

  if (req.method === 'POST' && req.url === '/a2a') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const idTarea = payload.id || `T-${Date.now().toString(36)}`;
        const titulo = payload.tarea || payload.titulo || 'Tarea sin titulo';
        const detalles = payload.detalles || payload.descripcion || '';
        const canalAviso = payload.canal_aviso || 'google_home';

        tareasNotificadas.add(idTarea);

        console.log(`\n======================================================`);
        console.log(`🚨 [JARVIS_DIRECT_TASK] ENCARGO EN TIEMPO REAL RECIBIDO`);
        console.log(`ID: ${idTarea}`);
        console.log(`Tarea: ${titulo}`);
        if (detalles) console.log(`Detalles: ${detalles}`);
        console.log(`Canal de aviso: ${canalAviso}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`======================================================\n`);

        inyectarMensajeChat(idTarea, titulo, detalles);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, recibido: true, id: idTarea }));
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
  console.log(`[Antigravity Bridge] Escuchando en http://0.0.0.0:${PUERTO}/a2a para eventos directos de Jarvis`);
});

// 2. Canal complementario: verificacion de objetivos pendientes en Veronica (D1)
async function verificarVeronica() {
  try {
    const res = await fetch(`${NUCLEO_URL}/objetivos?estado=pendiente&asignado_a=antigravity`, {
      headers: {
        authorization: `Bearer ${NUCLEO_TOKEN}`,
      },
    });

    if (!res.ok) return;

    const data = await res.json();
    const objetivos = Array.isArray(data) ? data : (data.objetivos || []);

    for (const obj of objetivos) {
      if (!tareasNotificadas.has(obj.id)) {
        tareasNotificadas.add(obj.id);
        console.log(`\n======================================================`);
        console.log(`🚨 [JARVIS_DIRECT_TASK] ENCARGO DETECTADO DESDE VERONICA`);
        console.log(`ID: ${obj.id}`);
        console.log(`Tarea: ${obj.titulo}`);
        if (obj.descripcion) console.log(`Detalles: ${obj.descripcion}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`======================================================\n`);

        inyectarMensajeChat(obj.id, obj.titulo, obj.descripcion);
      }
    }
  } catch (e) {
    // Silencio ante fallos transitorios
  }
}

// Sondeo rapido cada 3 segundos
setInterval(verificarVeronica, 3000);
verificarVeronica();
