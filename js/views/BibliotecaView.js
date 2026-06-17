// View da biblioteca de sessões.
// Renderiza o catálogo de sessões como cards e liga os filtros de categoria,
// duração, pesquisa por texto e botões de favorito.
import { categoriaImg } from '../utils/emocaoIcons.js';

// Mapa de categoria para a cor do badge e do thumb
const BADGE_COLOR = {
  respiracao: 'dusk', meditacao: 'mist', relaxamento: 'dusk',
  foco: 'mist', sono: 'fog', ansiedade: 'fog'
};

// Mapa de categoria para o nome legível em português
const CATEGORIA_LABEL = {
  respiracao: 'Respiração', meditacao: 'Meditação', relaxamento: 'Relaxamento',
  foco: 'Foco', sono: 'Sono', ansiedade: 'Ansiedade'
};

// Renderiza o catálogo de sessões como cards — marca os favoritos com o ícone ativo
export function renderCatalogo(sessoes, favIds) {
  const catalogo = document.getElementById('catalogo');
  const empty    = document.getElementById('empty-state');

  // Remove os cards existentes antes de re-renderizar
  catalogo.querySelectorAll('.sessao-card').forEach(el => el.remove());

  sessoes.forEach(s => {
    const isFav    = favIds.includes(s.id);
    const cor      = BADGE_COLOR[s.categoria] || 'dusk';
    const label    = CATEGORIA_LABEL[s.categoria] || s.categoria;
    const durLabel = s.duracao + ' min';
    const videoId  = s.url ? s.url.split('/embed/')[1]?.split('?')[0] : null;
    const thumb    = videoId
      ? `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${s.titulo}" class="sessao-thumb-img" loading="lazy">`
      : `<div class="sessao-thumb thumb-${cor}">${categoriaImg(s.categoria, 28)}</div>`;
    const avg = s.ratingCount > 0 ? (s.ratingTotal / s.ratingCount).toFixed(1) : null;

    const card = document.createElement('div');
    card.className  = 'sessao-card';
    card.dataset.id = s.id;
    card.innerHTML  = `
      <div class="sessao-card-top">
        <div class="sessao-thumb-wrap">${thumb}</div>
        <button class="fav-btn ${isFav ? 'active' : ''}" data-fav-id="${s.id}">
          <img src="../assets/icons/${isFav ? 'like' : 'nolike'}.png" width="16" height="16" style="object-fit:contain;display:block;">
        </button>
      </div>
      <p class="sessao-title">${s.titulo}</p>
      <div class="sessao-meta">
        <div class="sessao-meta-left">
          <span class="badge badge-${cor}">${label}</span>
          <span class="sessao-duration">${durLabel}</span>
        </div>
        ${avg ? `<span class="sessao-rating">★ ${avg}</span>` : ''}
      </div>`;

    // Clique no card navega para a sessão (exceto se clicar no botão de favorito)
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn')) return;
      window.location.href = 'sessao.html?id=' + s.id;
    });

    catalogo.insertBefore(card, empty);
  });

  // Atualiza o contador de resultados e mostra/oculta o estado vazio
  document.getElementById('count-label').textContent =
    sessoes.length + (sessoes.length === 1 ? ' sessão' : ' sessões');
  empty.classList.toggle('visible', sessoes.length === 0);
}

// Liga os botões de filtro de categoria ao callback — destaca o botão ativo
export function bindFiltrar(cb) {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cb(btn.dataset.filter);
    });
  });
}

// Liga os botões de filtro de duração ao callback — funciona como toggle (clica de novo para limpar)
export function bindFiltrarDur(cb) {
  document.querySelectorAll('[data-dur]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.dur;
      const jaAtivo = btn.classList.contains('active');
      document.querySelectorAll('[data-dur]').forEach(b => b.classList.remove('active'));
      if (!jaAtivo) { btn.classList.add('active'); cb(val); }
      else cb(null); // Toggle: remove o filtro se já estava ativo
    });
  });
}

// Liga o campo de pesquisa ao callback — chama com o valor atual a cada keystroke
export function bindPesquisar(cb) {
  document.getElementById('search-input').addEventListener('input', e => cb(e.target.value));
}

// Liga os botões de favorito ao callback usando delegação de eventos no contentor
export function bindFav(cb) {
  document.getElementById('catalogo').addEventListener('click', e => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    e.stopPropagation();
    const id = parseInt(btn.dataset.favId);
    const isFav = btn.classList.contains('active');
    btn.classList.toggle('active', !isFav);
    btn.innerHTML = `<img src="../assets/icons/${!isFav ? 'like' : 'nolike'}.png" width="16" height="16" style="object-fit:contain;display:block;">`;
    cb(id, !isFav); // Passa o novo estado (inverso do atual)
  });
}
