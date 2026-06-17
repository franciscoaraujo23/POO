// View do dashboard principal.
// Renderiza a data atual, as estatísticas semanais/mensais/de pontos
// e a lista de sessões recomendadas. Liga também a caixa de pesquisa.

// Mapa de categoria para o ícone e cor do badge correspondente
const CAT_ICON  = { respiracao: '../assets/icons/breathe.png', meditacao: '../assets/icons/relax.png', foco: '../assets/icons/focus.png', relaxamento: '../assets/icons/relax.png', sono: '../assets/icons/tired.png', ansiedade: '../assets/icons/breathe.png' };
const CAT_BADGE = { respiracao: 'dusk', meditacao: 'dusk', foco: 'mist', relaxamento: 'dusk', sono: 'fog', ansiedade: 'dusk' };
const CAT_NOME  = { respiracao: 'Respiração', meditacao: 'Meditação', foco: 'Foco', relaxamento: 'Relaxar', sono: 'Sono', ansiedade: 'Ansiedade' };

// Renderiza a data atual formatada em português (ex: "Segunda-feira, 14 de junho")
export function renderData(hoje) {
  const fmt = hoje.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
  const el  = document.querySelector('.dashboard-date');
  if (el) el.textContent = fmt.charAt(0).toUpperCase() + fmt.slice(1);
}

// Renderiza a estatística semanal: percentagem de dias ativos e total de sessões da semana
export function renderStatSemanal(sessoesSemana, diasAtivos) {
  const pct = Math.round((diasAtivos / 7) * 100);
  const elVal   = document.getElementById('stat-semanal');
  const elBar   = document.getElementById('stat-semanal-bar');
  const elDelta = document.getElementById('stat-semanal-delta');
  if (elVal)   elVal.innerHTML    = `${pct}<small>%</small>`;
  if (elBar)   elBar.style.width  = pct + '%';
  if (elDelta) elDelta.textContent = `${sessoesSemana} sessões esta semana`;
}

// Renderiza o número de sessões do mês atual com barra de progresso (meta: 10 sessões)
export function renderStatSessoes(totalMes) {
  const meta = 10;
  const pct  = Math.min(Math.round((totalMes / meta) * 100), 100);
  const elVal   = document.getElementById('stat-sessoes');
  const elBar   = document.getElementById('stat-sessoes-bar');
  const elDelta = document.getElementById('stat-sessoes-delta');
  if (elVal)   elVal.innerHTML     = `${totalMes}<small>/${meta}</small>`;
  if (elBar)   elBar.style.width   = pct + '%';
  if (elDelta) elDelta.textContent = `${totalMes} sessões este mês`;
}

// Renderiza os pontos totais e o nível do utilizador com barra de progresso para o próximo nível
export function renderStatPontos(pontos, nivel) {
  const proximoPontos = nivel * 100;
  const pct = Math.round(((pontos % 100) / 100) * 100);
  const elVal   = document.getElementById('stat-pontos');
  const elBar   = document.getElementById('stat-pontos-bar');
  const elDelta = document.getElementById('stat-pontos-delta');
  const elLbl   = document.getElementById('stat-pontos-label');
  if (elVal)   elVal.innerHTML     = pontos >= 1000 ? `${(pontos / 1000).toFixed(1)}<small>k</small>` : `${pontos}<small> pts</small>`;
  if (elBar)   elBar.style.width   = pct + '%';
  if (elDelta) elDelta.textContent = `Nível ${nivel} · ${100 - (pontos % 100)} pts para o próximo`;
  if (elLbl)   elLbl.textContent   = `Próximo: ${proximoPontos} pts`;
}

// Renderiza a lista de sessões recomendadas com thumbnail do YouTube
export function renderRecomendadas(lista) {
  const listaEl = document.getElementById('recomendadas-list');
  if (!listaEl) return;
  listaEl.innerHTML = lista.map(s => {
    const badge   = CAT_BADGE[s.categoria] || 'dusk';
    const nome    = CAT_NOME[s.categoria]  || s.categoria;
    const videoId = s.url ? s.url.split('/embed/')[1]?.split('?')[0] : null;
    const thumb   = videoId
      ? `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${s.titulo}" class="activity-thumb-img">`
      : `<div class="activity-thumb thumb-${badge}"></div>`;
    return `
    <div class="card card-sm activity-card" style="cursor:pointer;" onclick="location.href='sessao.html?id=${s.id}'">
      <div class="activity-thumb-wrap">${thumb}</div>
      <div class="activity-info">
        <p class="activity-name">${s.titulo}</p>
        <div class="activity-meta">
          <span class="activity-duration">${s.duracao} min</span>
          <span class="badge badge-${badge}">${nome}</span>
        </div>
      </div>
      <div class="activity-right">
        <button class="btn-play" onclick="event.stopPropagation();location.href='sessao.html?id=${s.id}'">▶</button>
      </div>
    </div>`;
  }).join('');
}

// Renderiza a frase motivacional do dia na quote-card do dashboard
export function renderFrase({ frase, autor } = {}) {
  const elTexto = document.getElementById('quote-text');
  const elAutor = document.getElementById('quote-author');
  if (elTexto) elTexto.textContent = frase ? `"${frase}"` : '';
  if (elAutor) elAutor.textContent = autor ? `— ${autor}` : 'Lembrete do dia';
}

// Liga a caixa de pesquisa ao callback recebido — filtra em tempo real por texto
export function bindPesquisa(cb) {
  const input = document.querySelector('.input-wrap input');
  if (input) input.addEventListener('input', () => cb(input.value.trim().toLowerCase()));
}
