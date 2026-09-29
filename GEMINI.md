# GEMINI.md

El protocolo multi-agente vive ahora en un unico sitio: **[AGENTS.md](./AGENTS.md)**.

Antigravity: lee ese fichero antes de planificar o ejecutar cualquier tarea, incluida la seccion 5 (memoria compartida en el nucleo D1 — usa `autor: "antigravity"`). Este archivo se mantiene solo porque Gemini lo busca por convencion; no dupliques contenido aqui.

## Directrices especificas de Antigravity (deploy — no aplican a Jarvis ni Claude)

- Nunca desplegar codigo (Orange Pi, Cloudflare Worker/Pages, Salesforce) sin haberlo commiteado antes en el repo git que corresponda al cambio: `candyla` (tienda), `jarvis-asistente` (Jarvis/nucleo), `atiendo` (n8n/WhatsApp). Si el cambio toca dos repos, un commit en cada uno.
- Commit siempre antes del deploy, no despues — si el deploy falla o hay que revertir, el commit ya tiene que existir.
- Comprobado el 29-sep: hubo cambios de Claude en `jarvis-asistente/core/brain.mjs` sin commitear durante mas de un dia. No asumir que "ya lo habra commiteado Claude" — comprobar `git status` antes de desplegar.
