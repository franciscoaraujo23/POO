// View do painel de administração.
// Renderiza estatísticas globais, lista de utilizadores com edição inline,
// top de sessões e emoções, catálogo de sessões, lista de check-ins recentes
// e o modal de confirmação de eliminação de conta.
import { emocaoImg } from '../utils/emocaoIcons.js';

// Renderiza os contadores globais no topo do painel (utilizadores, check-ins, sessões, reflexões)
export function renderStats(perfis, checkins, sessoes, reflexoes) {
  const hoje = new Date().toDateString();
  const checkinsHoje = checkins.filter(c => new Date(c.data).toDateString() === hoje);

  document.getElementById('stat-users').textContent          = perfis.length;
  document.getElementById('stat-checkins-hoje').textContent  = checkinsHoje.length;
  document.getElementById('stat-checkins-total').textContent = `${checkins.length} no total`;
  document.getElementById('stat-sessoes').textContent        = sessoes.length;
  document.getElementById('stat-reflexoes').textContent      = reflexoes.length;

  // Mostra a hora da última atualização e o total de utilizadores
  const agora = new Date();
  document.getElementById('admin-sub').textContent =
    `Atualizado às ${agora.getHours()}h${String(agora.getMinutes()).padStart(2, '0')} · ${perfis.length} utilizador${perfis.length !== 1 ? 'es' : ''}`;
}

// Renderiza a lista de utilizadores com badges editáveis de pontos e nível
// onEdit: callback chamado ao clicar num badge editável
// onDelete: callback chamado ao clicar no botão de apagar
export function renderUsers(listaPerfis, gamMap, adminUserId, onEdit, onDelete) {
  const usersList = document.getElementById('admin-users-list');
  if (listaPerfis.length === 0) {
    usersList.innerHTML = '<p class="admin-empty">Sem utilizadores.</p>';
    return;
  }

  const PENCIL = `<svg class="badge-edit-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

  usersList.innerHTML = listaPerfis.map(p => {
    const g       = gamMap[String(p.userId)] || {};
    const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : '?';
    const pontos  = g.pontos ?? 0;
    const nivel   = g.nivel  ?? 1;
    const isAdmin = p.role === 'admin';
    const isSelf  = String(p.userId) === String(adminUserId);
    const gamId   = g.id ?? '';
    return `
      <div class="user-card" data-perfil-id="${p.id}" data-user-id="${p.userId}">
        <div class="user-card-avatar">${inicial}</div>
        <div class="user-card-info">
          <p class="user-card-name">${p.nome || '(sem nome)'} ${isAdmin ? '<span class="badge badge-admin">admin</span>' : ''}</p>
          <p class="user-card-email">${p.email || ''}</p>
        </div>
        <div class="user-card-badges">
          <span class="badge badge-stat"><span class="badge-key">Pontos</span> <span class="badge-editable" data-gam="${gamId}" data-field="pontos" data-val="${pontos}">${pontos}</span></span>
          <span class="badge badge-stat"><span class="badge-key">Nível</span> <span class="badge-editable" data-gam="${gamId}" data-field="nivel" data-val="${nivel}">${nivel}</span></span>
        </div>
        ${isSelf ? '' : `<button class="btn-del-user" data-perfil="${p.id}" data-user="${p.userId}" data-nome="${p.nome || p.email}">Apagar</button>`}
      </div>`;
  }).join('');

  usersList.querySelectorAll('.badge-stat').forEach(stat => {
    stat.style.cursor = 'pointer';
    stat.addEventListener('click', () => onEdit(stat.querySelector('.badge-editable')));
  });

  usersList.querySelectorAll('.btn-del-user').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.perfil, btn.dataset.user, btn.dataset.nome));
  });
}

// Renderiza o top de sessões mais reproduzidas (lista ordenada por contagem)
export function renderTopSessoes(topSessoes) {
  const sessoesList = document.getElementById('admin-sessoes-list');
  if (topSessoes.length === 0) {
    sessoesList.innerHTML = '<p class="admin-empty">Nenhuma sessão concluída.</p>';
    return;
  }
  sessoesList.innerHTML = topSessoes.map(([titulo, count], i) => `
    <div class="admin-session-row">
      <span class="admin-session-idx">${i + 1}</span>
      <span class="admin-session-nome">${titulo}</span>
      <span class="badge-count">${count}×</span>
    </div>`).join('');
}

// Renderiza os chips de emoções mais registadas nos check-ins com ícone e contagem
export function renderTopEmocoes(topEmocoes) {
  const emocoesList = document.getElementById('admin-emocoes-list');
  emocoesList.innerHTML = topEmocoes.length === 0
    ? '<p class="admin-empty">Sem check-ins.</p>'
    : topEmocoes.map(([emocao, count]) => `
        <div class="emocao-chip">
          ${emocao}
          <strong>${count}</strong>
        </div>`).join('');
}

// Renderiza a lista do catálogo de sessões com botões de editar e remover
export function renderCatalogo(sessoesCatalogo, onEdit, onDelete) {
  const wrap = document.getElementById('admin-catalogo-list');
  if (!sessoesCatalogo.length) {
    wrap.innerHTML = '<p class="admin-empty">Sem sessões no catálogo.</p>';
    return;
  }
  const CAT_LABEL = { respiracao:'Respiração', meditacao:'Meditação', relaxamento:'Relaxamento', foco:'Foco', sono:'Sono', ansiedade:'Ansiedade' };
  wrap.innerHTML = sessoesCatalogo.map(s => {
    const videoId = s.url ? s.url.split('/embed/')[1]?.split('?')[0] : null;
    const thumb = videoId
      ? `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="" class="catalogo-thumb-img" loading="lazy">`
      : `<div class="catalogo-thumb-placeholder"></div>`;
    const caminhoBadge = s.caminho ? `<span class="badge badge-caminho">${s.caminho}</span>` : '';
    return `
    <div class="catalogo-row" data-id="${s.id}">
      <div class="catalogo-thumb">${thumb}</div>
      <div class="catalogo-info">
        <p class="catalogo-nome">${s.titulo}</p>
        <p class="catalogo-meta">${s.duracao} min · ${s.nivel}</p>
      </div>
      <div class="catalogo-badges">
        <span class="badge badge-cat">${CAT_LABEL[s.categoria] || s.categoria}</span>
        ${caminhoBadge}
      </div>
      <div class="catalogo-actions">
        <button class="btn-edit" data-edit="${s.id}">Editar</button>
        <button class="btn-del"  data-del="${s.id}">Remover</button>
      </div>
    </div>`;
  }).join('');

  // Liga os botões de remover e editar aos callbacks recebidos
  wrap.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.del));
  });

  wrap.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => onEdit(btn.dataset.edit));
  });
}

// Renderiza os 8 check-ins mais recentes de todos os utilizadores
export function renderCheckinsList(recentCheckins, perfilMap) {
  const checkinsList = document.getElementById('admin-checkins-list');
  const hoje = new Date().toDateString();
  if (recentCheckins.length === 0) {
    checkinsList.innerHTML = '<p class="admin-empty">Sem check-ins.</p>';
    return;
  }
  checkinsList.innerHTML = recentCheckins.map(c => {
    const d     = new Date(c.data);
    const label = d.toDateString() === hoje ? 'Hoje' :
                  d.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Ontem' :
                  d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    const nome  = perfilMap[String(c.userId)] || `user ${c.userId}`;
    const inicial = (c.emocao || '?').charAt(0).toUpperCase();
    return `
      <div class="admin-row">
        <div class="admin-avatar">${inicial}</div>
        <div class="admin-row-info">
          <p class="admin-row-nome">${nome}</p>
          <p class="admin-row-sub">${c.emocao} · intensidade ${c.intensidade ?? '—'}</p>
        </div>
        <span class="badge">${label}</span>
      </div>`;
  }).join('');
}

// Preenche e mostra o formulário de criação/edição de sessão com os dados recebidos
export function renderFormSessao(dados) {
  document.getElementById('fs-titulo').value    = dados.titulo    || '';
  document.getElementById('fs-categoria').value = dados.categoria || 'respiracao';
  document.getElementById('fs-duracao').value   = dados.duracao   || '';
  document.getElementById('fs-nivel').value     = dados.nivel     || 'iniciante';
  document.getElementById('fs-caminho').value   = dados.caminho   || '';
  document.getElementById('fs-url').value       = dados.url       || '';
  document.getElementById('fs-descricao').value = dados.descricao || '';
  document.getElementById('form-sessao-titulo').textContent = dados._titulo || 'Nova sessão';
  const form = document.getElementById('form-sessao-wrap');
  form.style.display = 'block';
  setTimeout(() => {
    const scroller = document.querySelector('.main-content');
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
}

// Esconde o formulário de sessão
export function esconderFormSessao() {
  document.getElementById('form-sessao-wrap').style.display = 'none';
}

// Lê os valores do formulário de sessão e devolve um objeto com todos os campos
export function lerFormSessao() {
  return {
    titulo:    document.getElementById('fs-titulo').value.trim(),
    categoria: document.getElementById('fs-categoria').value,
    duracao:   Number(document.getElementById('fs-duracao').value),
    nivel:     document.getElementById('fs-nivel').value,
    caminho:   document.getElementById('fs-caminho').value,
    url:       document.getElementById('fs-url').value.trim(),
    descricao: document.getElementById('fs-descricao').value.trim(),
    avaliacao: 0,
    tipo:      'video'
  };
}

// Mostra o modal de confirmação de eliminação com o nome do utilizador
export function renderModalDelete(nome) {
  document.getElementById('modal-user-nome').textContent = nome;
  document.getElementById('modal-delete-user').style.display = 'flex';
}

// Fecha o modal de eliminação e repõe o botão de confirmação ao estado inicial
export function esconderModalDelete() {
  document.getElementById('modal-delete-user').style.display = 'none';
  const btn = document.getElementById('modal-confirmar');
  btn.disabled = false;
  btn.textContent = 'Apagar conta';
}

// Transforma um badge numa input de edição inline com confirmação e cancelamento
// onGuardar: callback assíncrono chamado com (field, novoVal) ao confirmar
// onCancelar: callback chamado ao cancelar (restaura a lista)
export function bindInlineEdit(badge, valAnt, onGuardar, onCancelar) {
  const field = badge.dataset.field;

  // Substitui o conteúdo do badge por um input numérico com botões de OK e cancelar
  badge.innerHTML = `
    <input class="inline-edit-input" type="number" min="0" value="${valAnt}" />
    <button class="inline-edit-ok"><img src="../assets/icons/correct.png" width="14" height="14" style="object-fit:contain;"></button>
    <button class="inline-edit-cancel">X</button>`;

  const input  = badge.querySelector('input');
  const btnOk  = badge.querySelector('.inline-edit-ok');
  const btnCan = badge.querySelector('.inline-edit-cancel');
  input.focus(); input.select();

  // Valida o valor e chama o callback de guardar
  let fechado = false;

  const guardar = async (e) => {
    if (e) e.stopPropagation();
    if (fechado) return;
    const novoVal = parseInt(input.value, 10);
    if (isNaN(novoVal) || novoVal < 0) return;
    fechado = true;
    btnOk.disabled = true;
    await onGuardar(field, novoVal);
  };

  const cancelar = (e) => {
    if (e) e.stopPropagation();
    if (fechado) return;
    fechado = true;
    onCancelar();
  };

  btnOk.addEventListener('click', guardar);
  btnCan.addEventListener('click', cancelar);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') guardar(e);
    if (e.key === 'Escape') cancelar(e);
  });
  input.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('blur', () => {
    setTimeout(() => { if (!fechado) cancelar(); }, 150);
  });
}
