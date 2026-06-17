// View do check-in diário.
// Gere a navegação entre os 4 passos do fluxo, a seleção de emoções e contexto,
// a exibição do histórico semanal e a sugestão final de sessão.

// Ativa o passo indicado e atualiza a barra de progresso
export function mostrarPasso(n, total) {
  document.querySelectorAll('.checkin-step').forEach(s => s.classList.remove('active'));
  document.getElementById('ci-step-' + n).classList.add('active');
  const pct = (n / total) * 100;
  document.getElementById('ci-progress').style.width = Math.min(pct, 100) + '%';
  document.getElementById('ci-progress-label').textContent =
    n <= total ? 'Momento ' + n + ' de ' + total : '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostra o ecrã de conclusão do check-in (passo 5) e completa a barra de progresso
export function mostrarConclusao() {
  document.querySelectorAll('.checkin-step').forEach(s => s.classList.remove('active'));
  document.getElementById('ci-step-5').classList.add('active');
  document.getElementById('ci-progress').style.width = '100%';
  document.getElementById('ci-progress-label').textContent = 'Concluído';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Remove a seleção de todos os elementos do seletor e marca o elemento recebido
export function marcarSelecionado(el, seletor) {
  document.querySelectorAll(seletor).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// Desseleciona todas as pills do mesmo grupo e seleciona a indicada
export function marcarPill(el) {
  el.closest('.contexto-pills').querySelectorAll('.contexto-pill')
    .forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

// Lê e devolve o texto da nota livre escrita pelo utilizador
export function getNotaLivre() {
  return document.getElementById('nota-livre').value;
}

// Liga os cards de emoção ao handler: chama com o elemento e o valor de data-emocao
export function bindSelectEmocao(handler) {
  document.querySelectorAll('.emocao-card').forEach(card => {
    card.addEventListener('click', () => handler(card, card.dataset.emocao));
  });
}

// Liga os itens de intensidade ao handler: chama com o elemento e o índice (1-5)
export function bindSelectIntensidade(handler) {
  document.querySelectorAll('.intensidade-item').forEach((item, i) => {
    item.addEventListener('click', () => handler(item, i + 1));
  });
}

// Liga as pills de contexto ao handler: chama com o elemento e o grupo (peso/sono)
export function bindSelectPill(handler) {
  document.querySelectorAll('.contexto-pill').forEach(pill => {
    pill.addEventListener('click', () => handler(pill, pill.dataset.grupo));
  });
}

// Liga os botões de navegação entre passos (data-ci-step) ao handler
export function bindGoCI(handler) {
  document.querySelectorAll('[data-ci-step]').forEach(btn => {
    btn.addEventListener('click', () => handler(parseInt(btn.dataset.ciStep)));
  });
}

// Liga o botão de conclusão do check-in ao handler recebido
export function bindConcluirCheckin(handler) {
  document.getElementById('btn-concluir-checkin').addEventListener('click', handler);
}

import { emocaoImg } from '../utils/emocaoIcons.js';

const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Renderiza o histórico dos últimos 7 dias com a emoção de cada dia (ou vazio se não houver)
export function renderHistoricoSemana(checkins) {
  const wrap = document.getElementById('checkin-historico-semana');
  if (!wrap) return;

  // Cria um mapa de data -> emoção para acesso rápido
  const map = {};
  checkins.forEach(c => { map[new Date(c.data).toDateString()] = c.emocao; });

  const hoje = new Date();
  const items = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const key = d.toDateString();
    const emocao = map[key];
    const icone = emocao ? emocaoImg(emocao, 22) : '';
    items.push(`
      <div class="historico-item">
        <span class="historico-dia">${DIAS_PT[d.getDay()]}</span>
        <div class="historico-emocao" ${!icone ? 'style="background:var(--dusk-100);border-color:var(--dusk-300);"' : ''}>${icone}</div>
      </div>`);
  }

  wrap.innerHTML = `<span class="historico-label">Esta semana</span><div class="historico-list">${items.join('')}</div>`;
}
