// Investigador Autónomo de Ecosistema & GitHub / MCP / HuggingFace
// Rastrea la web dinámicamente para descubrir herramientas reales, servidores MCP y modelos.

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
      })).filter(m => m.descripcion.length > 25 && !m.descripcion.includes('Deprecated'));
    } catch (e) {
      console.warn('[InvestigadorWeb] Error en Awesome MCP:', e.message);
      return [];
    }
  }

  async buscarGitHubTrending() {
    try {
      const url = 'https://api.github.com/search/repositories?q=topic:model-context-protocol+sort:stars&per_page=20';
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
      console.warn('[InvestigadorWeb] Error en GitHub Trending:', e.message);
      return [];
    }
  }

  async buscarHuggingFaceModelos() {
    try {
      const url = 'https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=15&filter=text-generation';
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

  clasificarAmbito(texto) {
    const t = texto.toLowerCase();
    if (t.includes('candyla') || t.includes('shop') || t.includes('ecommerce') || t.includes('marketing') || t.includes('seo')) return 'candyla';
    if (t.includes('jarvis') || t.includes('home') || t.includes('esp32') || t.includes('voice') || t.includes('audio') || t.includes('docker') || t.includes('raspberry') || t.includes('orange pi')) return 'jarvis';
    return 'antigravity';
  }

  estimarScores(nombre, descripcion) {
    let impacto = 4.0;
    let alineacion = 4.5;
    let urgencia = 3.0;
    let confianza = 4.0;
    let esfuerzo = 2.0;

    const t = (nombre + ' ' + descripcion).toLowerCase();
    if (t.includes('agent') || t.includes('memory') || t.includes('code') || t.includes('automation')) {
      impacto = 4.5;
      alineacion = 5.0;
    }
    if (t.includes('database') || t.includes('sql') || t.includes('sqlite') || t.includes('browser')) {
      urgencia = 3.5;
      confianza = 4.5;
    }

    const total = Number(((impacto * 0.35 + alineacion * 0.35 + urgencia * 0.15 + confianza * 0.15) * 1.5).toFixed(1));
    return { impacto, alineacion, urgencia, confianza, riesgo: 1, esfuerzo, total };
  }

  /**
   * Genera propuestas de iniciativa DINÁMICAS e ILIMITADAS a partir de descubrimientos de internet
   */
  async descubrirNuevasIdeas() {
    console.log('[InvestigadorWeb] 🌐 Explorando internet dinámicamente (Awesome MCP, GitHub, HuggingFace)...');
    const [awesomeMcp, githubRepos, hfModels] = await Promise.all([
      this.buscarAwesomeMcp(),
      this.buscarGitHubTrending(),
      this.buscarHuggingFaceModelos()
    ]);

    const ideas = [];

    // 1. Convertir servidores de Awesome MCP en propuestas estructuradas
    for (const s of awesomeMcp) {
      const ambito = this.clasificarAmbito(s.nombre + ' ' + s.descripcion);
      const scores = this.estimarScores(s.nombre, s.descripcion);

      ideas.push({
        titulo: `🌐 [Herramienta MCP] ${s.nombre}: ${s.descripcion.substring(0, 70)}...`,
        ambito,
        motivacion: `Descubierto en el catálogo abierto de Awesome MCP Servers (${s.url}): ${s.descripcion}. Esta herramienta puede expandir las capacidades operativas del ecosistema sin programarla desde cero.`,
        hipotesis: `Integrar ${s.nombre} como servidor MCP en el ecosistema para dotar a los agentes de herramientas especializadas y estandarizadas.`,
        risk_tier: 'L1',
        scores_json: scores,
        origen_fuente: `Awesome MCP Servers (${s.url})`,
        creado_por: 'antigravity'
      });
    }

    // 2. Convertir repositorios de GitHub Trending en propuestas
    for (const r of githubRepos) {
      const ambito = this.clasificarAmbito(r.nombre + ' ' + r.descripcion);
      const scores = this.estimarScores(r.nombre, r.descripcion);

      ideas.push({
        titulo: `⭐ [GitHub Trending] ${r.nombre} (${r.stars}★): ${r.descripcion.substring(0, 65)}...`,
        ambito,
        motivacion: `Proyecto en tendencia en GitHub (${r.repo}, ${r.stars} estrellas): ${r.descripcion}. Enlace: ${r.url}`,
        hipotesis: `Evaluar ${r.nombre} como componente modular o dependencia útil para la arquitectura multi-agente.`,
        risk_tier: 'L1',
        scores_json: scores,
        origen_fuente: `GitHub Trending (${r.url})`,
        creado_por: 'antigravity'
      });
    }

    // 3. Convertir modelos trending de HuggingFace en propuestas
    for (const m of hfModels.slice(0, 5)) {
      ideas.push({
        titulo: `🤗 [Modelo Local HuggingFace] ${m.id} (${m.likes} likes, ${m.downloads} descargas)`,
        ambito: 'antigravity',
        motivacion: `Modelo de generación de texto destacado en HuggingFace (${m.id}). Alta adopción de la comunidad con ${m.downloads} descargas.`,
        hipotesis: `Probar la viabilidad de inferencia local en CPU/GPU para tareas especializadas a coste cero.`,
        risk_tier: 'L1',
        scores_json: { impacto: 4, alineacion: 4.5, urgencia: 2.5, confianza: 4, riesgo: 1, esfuerzo: 2, total: 6.0 },
        origen_fuente: `HuggingFace Hub (https://huggingface.co/${m.id})`,
        creado_por: 'antigravity'
      });
    }

    console.log(`[InvestigadorWeb] Descubiertas y formateadas ${ideas.length} ideas dinámicas.`);
    return ideas;
  }
}
