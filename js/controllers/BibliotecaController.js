// Controlador da biblioteca de sessões.
// Gere os filtros por categoria e duração, a pesquisa por texto
// e as ações de adicionar/remover favoritos.
import SessaoModel from '../models/sessaoModel.js';
import UserModel from '../models/UserModel.js';
import {
  renderCatalogo, bindFiltrar, bindFiltrarDur, bindPesquisar, bindFav
} from '../views/BibliotecaView.js';

// Estado dos filtros ativos — começa com todos os filtros limpos
let todasSessoes = [];
let utilizador   = null;
let filtroAtivo  = 'todos';
let durAtiva     = null;
let pesquisaAtiva = '';

// Devolve os IDs dos favoritos do utilizador (array vazio se não houver sessão)
function getFavIds() {
  return utilizador?.favoritos ?? [];
}

// Aplica os filtros ativos (categoria, duração, pesquisa) e atualiza a lista de sessões
async function aplicarFiltros() {
  const resultado = await SessaoModel.filtrar({
    categoria: filtroAtivo === 'todos' ? null : filtroAtivo,
    duracao:   durAtiva,
    query:     pesquisaAtiva || null
  });
  renderCatalogo(resultado.filter(s => !s.caminho), getFavIds());
}

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega sessões e perfil do utilizador em paralelo
  const [todas, user] = await Promise.all([
    SessaoModel.getAll(),
    UserModel.get()
  ]);
  todasSessoes = todas.filter(s => !s.caminho);
  utilizador   = user;

  // Liga o filtro por categoria (ex: 'meditacao', 'foco')
  bindFiltrar(cat => { filtroAtivo = cat; aplicarFiltros(); });

  // Lê o param ?categoria= da URL (vindo da dashboard) e ativa esse filtro
  const catParam = new URLSearchParams(window.location.search).get('categoria');
  if (catParam && catParam !== 'todos') {
    filtroAtivo = catParam;
    const btn = document.querySelector(`[data-filter="${catParam}"]`);
    if (btn) {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    await aplicarFiltros();
  } else {
    renderCatalogo(todasSessoes, getFavIds());
  }

  // Liga o filtro por duração (curta/media/longa) — toggle ao clicar de novo
  bindFiltrarDur(dur => { durAtiva = dur; aplicarFiltros(); });

  // Liga a pesquisa por texto — filtra em tempo real por título
  bindPesquisar(query => { pesquisaAtiva = query; aplicarFiltros(); });

  // Liga os botões de favorito — adiciona ou remove consoante o estado atual
  bindFav(async (id, isFav) => {
    if (!utilizador) return;
    if (isFav) await utilizador.addFavorito(id);
    else       await utilizador.removeFavorito(id);
  });
});
