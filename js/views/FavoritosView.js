// View da página de favoritos.
// Renderiza os cards das sessões favoritas com opções de remover e reproduzir.
// Liga também os filtros de categoria.
import { categoriaImg } from '../utils/emocaoIcons.js';

// Mapa de categoria para a cor de fundo do card
const CAT_THUMB = { respiracao: 'dusk', meditacao: 'dusk', foco: 'mist', relaxamento: 'dusk', sono: 'fog', ansiedade: 'dusk' };

// Mapa de categoria para o nome legível em português
const CAT_NOME  = { respiracao: 'Respiração', meditacao: 'Meditação', foco: 'Foco', relaxamento: 'Relaxar', sono: 'Sono', ansiedade: 'Ansiedade' };

// Mapa de categoria para o estilo inline do badge (cor de fundo e texto)
const CAT_BADGE = {
  respiracao:  'background:var(--dusk-100);color:var(--dusk-600);',
  meditacao:   'background:var(--dusk-100);color:var(--dusk-600);',
  foco:        'background:var(--color-secondary-bg);color:var(--mist-500);',
  relaxamento: 'background:var(--dusk-100);color:var(--dusk-600);',
  sono:        'background:var(--fog-200);color:var(--ink-soft);',
  ansiedade:   'background:var(--dusk-100);color:var(--dusk-600);'
};

// Gera HTML das estrelas de avaliação (preenchidas até ao valor n)
function stars(n) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < n ? 'fav-star' : 'fav-star-off'}">★</span>`
  ).join('');
}

// Renderiza a grelha de favoritos — mostra estado vazio se não houver sessões
// onRemover: callback chamado com o ID quando o utilizador remove um favorito
// onPlay: callback chamado com o ID quando o utilizador clica em reproduzir
export function renderFavoritos(lista, filtroAtivo, onRemover, onPlay) {
  const grid    = document.getElementById('fav-grid');
  const countEl = document.getElementById('fav-count');
  if (!grid) return;

  if (countEl) countEl.textContent = lista.length + (lista.length === 1 ? ' sessão' : ' sessões');

  if (lista.length === 0) {
    // Estado vazio: mensagem diferente consoante o filtro ativo
    grid.innerHTML = `
    <div class="fav-empty">
      <p class="fav-empty-emoji">♡</p>
      <p class="fav-empty-title">Sem favoritos aqui</p>
      <p class="fav-empty-sub">
        ${filtroAtivo !== 'todos'
          ? 'Não tens favoritos nesta categoria.'
          : 'Ainda não guardaste nenhuma sessão.<br>Explora a biblioteca e marca as que gostares.'}
      </p>
      <a href="biblioteca.html" style="display:inline-block;padding:9px 22px;background:var(--dusk-400);color:#fff;border-radius:var(--radius-sm);font-size:13px;font-weight:500;">
        Explorar biblioteca
      </a>
    </div>`;
    return;
  }

  // Renderiza cada sessão favorita como um card com opções de remover e reproduzir
  grid.innerHTML = lista.map(s => {
    const cor     = CAT_THUMB[s.categoria] || 'dusk';
    const nome    = CAT_NOME[s.categoria]  || s.categoria;
    const videoId = s.url ? s.url.split('/embed/')[1]?.split('?')[0] : null;
    const thumb   = videoId
      ? `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${s.titulo}" class="sessao-thumb-img" loading="lazy">`
      : `<div class="sessao-thumb thumb-${cor}">${categoriaImg(s.categoria, 28)}</div>`;
    return `
    <div class="fav-card" id="fc-${s.id}" onclick="window.location.href='sessao.html?id=${s.id}'" style="cursor:pointer;">
      <div class="sessao-card-top">
        <div class="sessao-thumb-wrap">${thumb}</div>
        <button class="fav-remove" data-id="${s.id}" title="Remover dos favoritos"><img src="../assets/icons/like.png" width="16" height="16" style="object-fit:contain;display:block;"></button>
      </div>
      <p class="fav-title">${s.titulo}</p>
      <div class="fav-meta">
        <div class="fav-meta-left">
          <span class="badge badge-${cor}">${nome}</span>
          <span class="fav-duration">${s.duracao} min</span>
        </div>
        <div class="fav-stars">${stars(s.avaliacao || 0)}</div>
      </div>
    </div>`;
  }).join('');

  // Liga os botões de remover aos seus callbacks
  grid.querySelectorAll('.fav-remove').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); onRemover(Number(btn.dataset.id)); });
  });

  // Liga os botões de reproduzir aos seus callbacks
  grid.querySelectorAll('.fav-play').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); onPlay(btn.dataset.id); });
  });
}

// Liga as pills de filtro por categoria ao callback — destaca a pill ativa visualmente
export function bindFiltros(cb) {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      cb(pill.dataset.filter);
    });
  });
}
