// View da página de reprodução de sessão.
// Renderiza os detalhes da sessão, sessões relacionadas, botão de favorito,
// o player de áudio com barra de progresso e o quiz pós-sessão.
import { categoriaImg } from '../utils/emocaoIcons.js';

// Mapa de categoria para a cor do badge
const BADGE_COLOR = {
  respiracao: 'dusk', meditacao: 'mist', relaxamento: 'dusk',
  foco: 'mist', sono: 'fog', ansiedade: 'fog'
};

// Mapa de categoria para o nome legível em português
const CATEGORIA_LABEL = {
  respiracao: 'Respiração', meditacao: 'Meditação', relaxamento: 'Relaxamento',
  foco: 'Foco', sono: 'Sono', ansiedade: 'Ansiedade'
};

// Preenche todos os elementos da página com os dados da sessão e inicializa o player
export function renderSessao(sessao) {
  const cor   = BADGE_COLOR[sessao.categoria]  || 'dusk';
  const label = CATEGORIA_LABEL[sessao.categoria] || sessao.categoria;

  // Preenche o cabeçalho e badge de categoria
  document.getElementById('sessao-titulo').textContent  = sessao.titulo;
  document.getElementById('sessao-desc').textContent    = sessao.descricao;
  document.getElementById('sessao-categoria-badge').className   = `badge badge-${cor}`;
  document.getElementById('sessao-categoria-badge').textContent = label;
  document.getElementById('sessao-duracao').textContent = sessao.duracao + ' min';
  document.getElementById('sessao-nivel').textContent   = capitalize(sessao.nivel);

  // Preenche a secção de informação detalhada
  document.getElementById('info-categoria').className   = `badge badge-${cor}`;
  document.getElementById('info-categoria').textContent = label;
  document.getElementById('info-duracao').textContent   = sessao.duracao + ' minutos';
  document.getElementById('info-nivel').textContent     = capitalize(sessao.nivel);

  // Atualiza o breadcrumb e o título da tab do navegador
  document.getElementById('breadcrumb-categoria').textContent = label;
  document.getElementById('breadcrumb-titulo').textContent    = sessao.titulo;
  document.title = sessao.titulo + ' — MindNest';

  // Carrega o vídeo do YouTube no iframe
  const iframe = document.getElementById('youtube-player');
  if (iframe && sessao.url) iframe.src = sessao.url + '?rel=0';
}

// Renderiza a lista de sessões relacionadas (mesma categoria)
export function renderRelacionadas(sessoes) {
  const lista = document.getElementById('relacionadas-list');
  lista.innerHTML = sessoes.map(s => {
    const videoId = s.url ? s.url.split('/embed/')[1]?.split('?')[0] : null;
    const thumb = videoId
      ? `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${s.titulo}" class="relacionada-thumb-img">`
      : `<div class="relacionada-thumb">${categoriaImg(s.categoria, 26)}</div>`;
    return `
    <div class="relacionada-card" onclick="window.location.href='sessao.html?id=${s.id}'">
      <div class="relacionada-thumb-wrap">${thumb}</div>
      <div class="min-w-0 flex-1">
        <p class="relacionada-title">${s.titulo}</p>
        <span class="relacionada-dur">${s.duracao} min</span>
      </div>
    </div>`;
  }).join('');
}

// Atualiza o visual do botão de favorito (ativo = já nos favoritos)
export function renderFav(isFav) {
  const btn = document.getElementById('btn-fav');
  btn.classList.toggle('active', isFav);
  btn.innerHTML = isFav
    ? `<img src="../assets/icons/like.png" width="16" height="16" style="object-fit:contain;vertical-align:middle;margin-right:6px;"> Nos teus favoritos`
    : `<img src="../assets/icons/nolike.png" width="16" height="16" style="object-fit:contain;vertical-align:middle;margin-right:6px;"> Adicionar aos favoritos`;
}

// Liga o botão de concluir ao callback recebido
export function bindConcluir(cb) {
  document.getElementById('btn-concluir').addEventListener('click', cb);
}

// Marca visualmente a sessão como concluída e exibe o quiz pós-sessão
export function marcarConcluida() {
  const btn = document.getElementById('btn-concluir');
  btn.innerHTML = 'Sessão concluída!';
  btn.style.background = 'var(--mist-500)';
  btn.style.cursor = 'default';
  btn.replaceWith(btn.cloneNode(true)); // Remove os event listeners do botão
  const quiz = document.getElementById('quiz-pos');
  quiz.classList.add('visible');
  quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Liga o botão de favorito ao callback recebido
export function bindFav(cb) {
  document.getElementById('btn-fav').addEventListener('click', cb);
}

// Liga as estrelas de avaliação ao callback — atualiza visualmente ao clicar
export function bindRating(cb) {
  document.querySelectorAll('.rating-star').forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      document.querySelectorAll('.rating-star').forEach((s, i) => {
        s.classList.toggle('active', i < val);
      });
      cb(val);
    });
  });
}

// Liga o botão de submeter o quiz ao callback — recolhe as respostas selecionadas
export function bindSubmeterQuiz(cb) {
  document.querySelector('.btn-submeter').addEventListener('click', () => {
    const respostas = {};
    document.querySelectorAll('.quiz-pos-question').forEach((q, i) => {
      const sel = q.querySelector('.quiz-pos-opt.selected');
      if (sel) respostas['q' + (i + 1)] = sel.textContent.trim();
    });
    cb(respostas);
  });

  // Liga as opções do quiz para seleção única por pergunta
  // Seleção exclusiva dentro de cada grupo de pergunta (usa data-q para agrupar)
  document.querySelectorAll('.quiz-pos-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const grupo = opt.dataset.q;
      document.querySelectorAll(`.quiz-pos-opt[data-q="${grupo}"]`)
        .forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

// Substitui o quiz pelo ecrã de agradecimento com link para o dashboard
export function mostrarSucessoQuiz() {
  document.getElementById('quiz-pos').innerHTML = `
    <div style="text-align:center; padding:16px 0;">
      <p style="font-family:var(--font-display); font-size:18px; color:var(--color-text); margin-bottom:6px;">
        Obrigado pelo teu feedback!
      </p>
      <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:20px;">
        As tuas respostas ajudam-nos a melhorar as sugestões para ti.
      </p>
      <a href="dashboard.html" style="display:inline-block; padding:10px 24px; background:var(--dusk-400); color:#fff; border-radius:var(--radius-sm); font-size:13px; font-weight:500;">
        Voltar ao início
      </a>
    </div>`;
}


// Capitaliza a primeira letra de uma string (usado para o nível da sessão)
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
