// View da página de caminhos filosóficos
import { categoriaImg } from '../utils/emocaoIcons.js';

// cor do badge por categoria
const BADGE_COLOR = {
  respiracao: 'dusk', meditacao: 'mist', relaxamento: 'dusk',
  foco: 'mist', sono: 'fog', ansiedade: 'fog'
};

// nome legível por categoria
const CATEGORIA_LABEL = {
  respiracao: 'Respiração', meditacao: 'Meditação', relaxamento: 'Relaxamento',
  foco: 'Foco', sono: 'Sono', ansiedade: 'Ansiedade'
};

// renderiza o cabeçalho do caminho (título, imagem de hero)
export function renderCaminho(tipo, meta) {
  document.title = meta.titulo + ' — MindNest';
  document.getElementById('breadcrumb-caminho').textContent = meta.titulo;

  const hero = document.getElementById('caminho-hero');
  hero.setAttribute('data-tipo', tipo);
  hero.innerHTML = `<img src="../assets/imgs/${tipo}1.png" alt="${meta.titulo}" class="caminho-hero-img">`;
}

// renderiza a grelha de sessões do caminho com botões de favorito
export function renderSessoesCaminho(sessoes, favIds = []) {
  const grid = document.getElementById('caminho-sessoes');

  if (!sessoes.length) {
    grid.innerHTML = '<p style="color:var(--color-text-muted); font-size:14px;">Nenhuma sessão disponível para este caminho.</p>';
    return;
  }

  grid.innerHTML = sessoes.map(s => {
    const cor     = BADGE_COLOR[s.categoria] || 'dusk';
    const label   = CATEGORIA_LABEL[s.categoria] || s.categoria;
    const videoId = s.url ? s.url.split('/embed/')[1]?.split('?')[0] : null;
    const thumb   = videoId
      ? `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${s.titulo}" class="sessao-thumb-img" loading="lazy">`
      : `<div class="sessao-thumb thumb-${cor}">${categoriaImg(s.categoria, 28)}</div>`;
    const isFav = favIds.includes(s.id) || favIds.includes(String(s.id));
    return `
      <div class="sessao-card" onclick="window.location.href='sessao.html?id=${s.id}'">
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
            <span class="sessao-duration">${s.duracao} min</span>
          </div>
        </div>
      </div>`;
  }).join('');
}
