// Controlador do painel de administração.
// Verifica que o utilizador é admin antes de carregar qualquer dado.
// Gere utilizadores, catálogo de sessões, estatísticas globais e edição inline de gamificação.
import UserModel from '../models/UserModel.js';
import SessaoModel from '../models/sessaoModel.js';
import { emocaoImg } from '../utils/emocaoIcons.js';
import {
  renderStats, renderUsers, renderTopSessoes, renderTopEmocoes,
  renderCatalogo, renderCheckinsList, renderFormSessao, esconderFormSessao,
  lerFormSessao, renderModalDelete, esconderModalDelete, bindInlineEdit
} from '../views/AdminView.js';
import {
  adminGetPerfis, adminGetCheckins, adminGetSessoesConcluidas,
  adminGetReflexoes, adminGetGamificacao, adminCreateSessao,
  adminUpdateSessao, adminDeleteSessao, adminDeletePerfil,
  adminDeleteCheckinsByUser, adminDeleteReflexoesByUser,
  adminDeleteSessoesByUser, adminDeleteGamificacaoByUser,
  adminPatchGamificacao, adminCreateGamificacao
} from '../services/service.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verifica que o utilizador tem role 'admin' antes de carregar qualquer dado
  const utilizador = await UserModel.get();
  if (!utilizador || utilizador.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }

  // Carrega todos os dados globais em paralelo (todos os utilizadores)
  const [perfis, checkins, sessoes, reflexoes, gamificacao] = await Promise.all([
    adminGetPerfis(),
    adminGetCheckins(),
    adminGetSessoesConcluidas(),
    adminGetReflexoes(),
    adminGetGamificacao()
  ]);

  renderStats(perfis, checkins, sessoes, reflexoes);

  
  // Cria um mapa userId -> dados de gamificação para acesso rápido na renderização
  const gamMap = {};
  gamificacao.forEach(g => { gamMap[String(g.userId)] = g; });
  // Obtém o userId numérico real do JWT (sub), que corresponde ao p.userId nos perfis
  const sessao = JSON.parse(localStorage.getItem('mindnest_sessao'));
  const jwtPayload = JSON.parse(atob(sessao.token.split('.')[1]));
  const adminUserId = String(jwtPayload.sub);
  let listaPerfis = [...perfis];

  // Cria um registo de gamificação inicial para um utilizador que ainda não tem
  async function criarGamificacaoSeNecessario(userId) {
    const criado = await adminCreateGamificacao(userId);
    if (!criado) return null;
    gamMap[String(userId)] = criado;
    return String(criado.id);
  }

  // Abre a edição inline num badge de gamificação — cria registo se não existir
  function abrirInlineEdit(badge) {
    if (badge.querySelector('input')) return;
    const valAnt = Number(badge.dataset.val) || 0;
    const userId = badge.closest('[data-user-id]').dataset.userId;
    let   gamId  = badge.dataset.gam;

    bindInlineEdit(badge, valAnt,
      async (field, novoVal) => {
        if (!gamId) gamId = await criarGamificacaoSeNecessario(userId);
        if (gamId) {
          await adminPatchGamificacao(gamId, { [field]: novoVal });
          if (!gamMap[String(userId)]) gamMap[String(userId)] = {};
          gamMap[String(userId)][field] = novoVal;
          gamMap[String(userId)].id = gamId;
        }
        renderizarUsers();
      },
      () => renderizarUsers()
    );
  }

  // Re-renderiza a lista de utilizadores com o estado atual (após edição ou eliminação)
  function renderizarUsers() {
    renderUsers(listaPerfis, gamMap, adminUserId, abrirInlineEdit, mostrarModalDelete);
  }

  // Mostra o modal de confirmação e elimina todos os dados do utilizador ao confirmar
  function mostrarModalDelete(perfilId, userId, nome) {
    renderModalDelete(nome);
    document.getElementById('modal-confirmar').onclick = async () => {
      document.getElementById('modal-confirmar').disabled    = true;
      document.getElementById('modal-confirmar').textContent = 'A apagar...';
      await Promise.all([
        adminDeleteCheckinsByUser(userId),
        adminDeleteReflexoesByUser(userId),
        adminDeleteSessoesByUser(userId),
        adminDeleteGamificacaoByUser(userId)
      ]);
      await adminDeletePerfil(perfilId);
      listaPerfis = listaPerfis.filter(p => String(p.id) !== String(perfilId));
      esconderModalDelete();
      renderizarUsers();
      document.getElementById('stat-users').textContent = listaPerfis.length;
    };
  }

  document.getElementById('modal-cancelar').addEventListener('click', esconderModalDelete);
  document.getElementById('modal-delete-user').addEventListener('click', e => {
    if (e.target === e.currentTarget) esconderModalDelete();
  });

  renderizarUsers();

  
  // Agrupa as sessões concluídas por título e renderiza o top 6 mais reproduzidas
  const sessaoCount = {};
  sessoes.forEach(s => {
    const titulo = s.titulo || `Sessão ${s.sessaoId}`;
    sessaoCount[titulo] = (sessaoCount[titulo] || 0) + 1;
  });
  renderTopSessoes(Object.entries(sessaoCount).sort((a, b) => b[1] - a[1]).slice(0, 6));

  
  // Agrupa os check-ins por emoção e renderiza o top 6 de emoções mais registadas
  const emocaoCount = {};
  checkins.forEach(c => { if (c.emocao) emocaoCount[c.emocao] = (emocaoCount[c.emocao] || 0) + 1; });
  renderTopEmocoes(Object.entries(emocaoCount).sort((a, b) => b[1] - a[1]).slice(0, 6));

  
  // Carrega o catálogo e inicializa a gestão de sessões (criar, editar, remover)
  let sessoesCatalogo = await SessaoModel.getAll();
  let editandoId = null; // null = criar nova sessão; id = editar sessão existente

  // Re-renderiza o catálogo com os callbacks de editar e remover
  function renderizarCatalogo() {
    renderCatalogo(sessoesCatalogo,
      id => {
        const s = sessoesCatalogo.find(x => String(x.id) === String(id));
        if (!s) return;
        editandoId = s.id;
        renderFormSessao({ ...s, _titulo: 'Editar sessão' });
      },
      async id => {
        if (!confirm('Remover esta sessão?')) return;
        const ok = await adminDeleteSessao(id);
        if (ok) { sessoesCatalogo = sessoesCatalogo.filter(s => String(s.id) !== id); renderizarCatalogo(); }
      }
    );
  }

  renderizarCatalogo();

  document.getElementById('btn-nova-sessao').addEventListener('click', () => {
    editandoId = null;
    renderFormSessao({ _titulo: 'Nova sessão' });
  });

  document.getElementById('btn-cancelar-sessao').addEventListener('click', () => {
    esconderFormSessao(); editandoId = null;
  });

  document.getElementById('btn-guardar-sessao').addEventListener('click', async () => {
    const dados = lerFormSessao();
    if (!dados.titulo || !dados.url || !dados.duracao) { alert('Preenche o título, URL e duração.'); return; }
    if (editandoId) {
      await adminUpdateSessao(editandoId, { ...dados, id: editandoId });
      sessoesCatalogo = sessoesCatalogo.map(s => String(s.id) === String(editandoId) ? { ...dados, id: editandoId } : s);
    } else {
      const nova = await adminCreateSessao(dados);
      if (nova) sessoesCatalogo.push(nova);
    }
    esconderFormSessao(); editandoId = null; renderizarCatalogo();
  });

  
  // Cria um mapa userId -> nome/email para mostrar o nome do utilizador nos check-ins
  const perfilMap = {};
  perfis.forEach(p => { perfilMap[String(p.userId)] = p.nome || p.email; });
  const recentCheckins = [...checkins]
    .filter(c => c.emocao)
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 8);
  renderCheckinsList(recentCheckins, perfilMap);
});
