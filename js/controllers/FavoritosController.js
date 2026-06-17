// Controlador da página de favoritos.
// Mostra as sessões que o utilizador marcou como favoritas, com filtro por categoria.
// Permite remover favoritos com animação de saída e navegar para a sessão.
import UserModel from '../models/UserModel.js';
import SessaoModel from '../models/sessaoModel.js';
import { renderFavoritos, bindFiltros } from '../views/FavoritosView.js';

let utilizador   = null;
let catalogo     = [];
let filtroAtivo  = 'todos'; // Filtro de categoria ativo ('todos' mostra todos os favoritos)

// Filtra e renderiza os favoritos do utilizador com base no filtro ativo
async function render() {
  const favIds = utilizador?.favoritos || [];

  // Obtém apenas as sessões do catálogo que o utilizador marcou como favoritas
  // Compara como strings para evitar mismatch entre número e string de ID da API
  let lista = catalogo.filter(s => favIds.some(id => String(id) === String(s.id)));

  // Aplica filtro de categoria se não for 'todos'
  if (filtroAtivo !== 'todos') lista = lista.filter(s => s.categoria === filtroAtivo);

  renderFavoritos(lista, filtroAtivo,
    // Callback de remoção: anima o card antes de remover e re-renderiza
    async id => {
      const card = document.getElementById('fc-' + id);
      if (card) { card.style.opacity = '0'; card.style.transform = 'scale(.95)'; card.style.transition = '.25s'; }
      await utilizador.removeFavorito(id);
      setTimeout(() => render(), 260); // Aguarda a animação terminar antes de re-renderizar
    },
    // Callback de play: navega para a página da sessão
    id => { location.href = 'sessao.html?id=' + id; }
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega o perfil do utilizador e o catálogo de sessões em paralelo
  [utilizador, catalogo] = await Promise.all([UserModel.get(), SessaoModel.getAll()]);
  await render();

  // Liga os botões de filtro por categoria — re-renderiza ao mudar
  bindFiltros(filtro => { filtroAtivo = filtro; render(); });
});
