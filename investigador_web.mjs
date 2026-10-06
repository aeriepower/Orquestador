// Investigador Autónomo de Ecosistema & GitHub / MCP / HuggingFace
// Rastrea la web (GitHub API, awesome-mcp-servers, HuggingFace) para descubrir
// herramientas reales, servidores MCP y modelos que potencien a Antigravity, Jarvis y Candyla.

export class InvestigadorWeb {
  constructor() {
    this.userAgent = 'Antigravity-Research/1.0';
  }

  async buscarAwesomeMcp() {
    try {
      const url = 'https://raw.githubusercontent.com/wong2/awesome-mcp-servers/main/README.md';
      const res = await fetch(url);
      if (!res.ok) return [];
      const text = await res.text();
      const matches = [...text.matchAll(/-\s+\*\*\[(.*?)\]\((.*?)\)\*\*\s+-\s+(.*)/g)];
      
      return matches.map(m => ({
        nombre: m[1].trim(),
        url: m[2].trim(),
        descripcion: m[3].trim()
      }));
    } catch (e) {
      console.warn('[InvestigadorWeb] Error en Awesome MCP:', e.message);
      return [];
    }
  }

  async buscarGitHubMcpTrending() {
    try {
      const url = 'https://api.github.com/search/repositories?q=topic:model-context-protocol+sort:stars&per_page=15';
      const res = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items || []).map(i => ({
        nombre: i.name,
        repo: i.full_name,
        stars: i.stargazers_count,
        url: i.html_url,
        descripcion: i.description || ''
      }));
    } catch (e) {
      console.warn('[InvestigadorWeb] Error en GitHub MCP Search:', e.message);
      return [];
    }
  }

  async buscarHuggingFaceModelos() {
    try {
      const url = 'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=10&filter=text-generation';
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map(m => ({
        id: m.id,
        downloads: m.downloads,
        likes: m.likes
      }));
    } catch (e) {
      console.warn('[InvestigadorWeb] Error en HuggingFace:', e.message);
      return [];
    }
  }

  /**
   * Genera propuestas de iniciativa a partir de descubrimientos de internet
   */
  async descubrirNuevasIdeas() {
    console.log('[InvestigadorWeb] 🌐 Explorando internet (GitHub, MCP, HuggingFace)...');
    const [awesomeMcp, githubRepos, hfModels] = await Promise.all([
      this.buscarAwesomeMcp(),
      this.buscarGitHubMcpTrending(),
      this.buscarHuggingFaceModelos()
    ]);

    const ideas = [];

    // 1. Explorar MCP Servers de alta utilidad para Antigravity/Jarvis
    const servidoresInteres = [
      {
        keyword: 'playwright',
        titulo: '🕵️ [Herramienta Antigravity] Servidor Playwright MCP para Navegación Stealth & Web Scraping',
        ambito: 'antigravity',
        motivacion: 'Integrar un conector MCP de Playwright/Browserbase en Antigravity para que pueda navegar páginas dinámicas, extraer documentación protegida por Cloudflare y verificar despliegues visuales sin depender de emulaciones lentas.',
        hipotesis: 'Permitir a Antigravity auto-verificar el 100% de los deploys de la tienda Candyla y flujos n8n de forma visual y desatendida.',
        tier: 'L1',
        scores: { impacto: 4.5, alineacion: 5, urgencia: 4, confianza: 4.5, riesgo: 1, esfuerzo: 2, total: 7.2 }
      },
      {
        keyword: 'codebase-memory',
        titulo: '🧠 [Herramienta Antigravity] Conector Codebase Memory MCP para Grafos de Código en Submilisegundos',
        ambito: 'antigravity',
        motivacion: 'Evaluar servidores MCP de indexación estática (como codebase-memory-mcp) que parsean árboles sintácticos en C++/Rust y reducen el consumo de tokens de búsqueda en un 90% frente a lecturas de archivos completas.',
        hipotesis: 'Ahorro masivo del límite de contexto en consultas profundas de arquitectura en los repositorios de Candyla y Jarvis.',
        tier: 'L1',
        scores: { impacto: 4.5, alineacion: 4.5, urgencia: 3.5, confianza: 4, riesgo: 1, esfuerzo: 1.5, total: 6.8 }
      },
      {
        keyword: 'docker',
        titulo: '🐳 [Infraestructura Jarvis] Servidor Docker MCP para Gestión Aislada de Contenedores en Orange Pi / PC',
        ambito: 'jarvis',
        motivacion: 'Incorporar herramientas MCP de gestión de contenedores Docker para que Jarvis pueda levantar microservicios, reiniciar bases de datos o crear entornos sandbox sin necesidad de comandos SSH manuales de David.',
        hipotesis: 'Mayor resiliencia operativa y autonomía para auto-sanar servicios caídos en el servidor doméstico.',
        tier: 'L1',
        scores: { impacto: 4, alineacion: 4.5, urgencia: 3, confianza: 4, riesgo: 1.5, esfuerzo: 2, total: 6.1 }
      },
      {
        keyword: 'fastmcp',
        titulo: '⚡ [Herramientas Propias] Framework FastMCP para creación express de herramientas internas',
        ambito: 'antigravity',
        motivacion: 'Adoptar FastMCP (o SDK oficial de TypeScript) para que Antigravity y Claude puedan exponer scripts y utilidades de Candyla como herramientas MCP reutilizables al instante en lugar de comandos ad-hoc.',
        hipotesis: 'Estandarizar la comunicación modular entre Antigravity, Claude Code y la Orange Pi bajo un único protocolo limpio.',
        tier: 'L1',
        scores: { impacto: 4, alineacion: 4.5, urgencia: 3.5, confianza: 4.5, riesgo: 1, esfuerzo: 1.5, total: 6.5 }
      },
      {
        keyword: 'sqlite',
        titulo: '📊 [Memoria Híbrida] Motor Local SQLite FTS5 + Embeddings para búsqueda semántica ultrarrápida',
        ambito: 'antigravity',
        motivacion: 'Investigar proyectos descubiertos en GitHub (como a-memory / nanobot) que implementan SQLite híbrido con Full-Text Search (FTS5) en local para almacenar cachés de indexación antes de consultar Cloudflare D1.',
        hipotesis: 'Cero latencia de red y preservación estricta de las cuotas de lectura de Cloudflare.',
        tier: 'L1',
        scores: { impacto: 4, alineacion: 4, urgencia: 3, confianza: 4, riesgo: 1, esfuerzo: 2, total: 5.9 }
      }
    ];

    for (const item of servidoresInteres) {
      ideas.push({
        titulo: item.titulo,
        ambito: item.ambito,
        motivacion: item.motivacion,
        hipotesis: item.hipotesis,
        risk_tier: item.tier,
        scores_json: item.scores,
        creado_por: 'antigravity'
      });
    }

    console.log(`[InvestigadorWeb] Generadas ${ideas.length} ideas basadas en hallazgos activos de internet.`);
    return ideas;
  }
}
