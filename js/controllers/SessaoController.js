// Controlador da página de reprodução de sessão.
// Carrega a sessão pelo ID na query string, renderiza o player e as sessões relacionadas.
// Gere favoritos, avaliação por estrelas, conclusão e o quiz pós-sessão.
import SessaoModel from '../models/sessaoModel.js';
import UserModel from '../models/UserModel.js';
import GamificacaoModel from '../models/GamificacaoModel.js';
import { getSessoesConcluidas } from '../services/service.js';
import { mostrarNotificacao, enfileirarNotificacao } from '../utils/notificacao.js';
import {
  renderSessao, renderRelacionadas, renderFav,
  bindConcluir, bindFav, bindRating, bindSubmeterQuiz,
  marcarConcluida, mostrarSucessoQuiz
} from '../views/SessaoView.js';

// Lê o ID da sessão a partir dos parâmetros do URL (ex: sessao.html?id=3)
const params = new URLSearchParams(window.location.search);
const id     = params.get('id');

let utilizador  = null;
let ratingAtual = 0; // Avaliação selecionada pelo utilizador (0 = sem avaliação)

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega a sessão e o perfil do utilizador em paralelo
  const [sessao, user] = await Promise.all([
    SessaoModel.getById(id),
    UserModel.get()
  ]);

  // Redireciona para a biblioteca se a sessão não existir
  if (!sessao) {
    window.location.href = 'biblioteca.html';
    return;
  }

  utilizador = user;

  // Renderiza os detalhes da sessão e inicializa o player de áudio
  renderSessao(sessao);

  // Se a sessão pertence a um caminho, mostra outras do mesmo caminho; senão mostra da mesma categoria
  const todasSessoes = await SessaoModel.getAll();
  const relacionadas = todasSessoes
    .filter(s => s.id !== sessao.id)
    .filter(s => sessao.caminho ? s.caminho === sessao.caminho : s.categoria === sessao.categoria)
    .slice(0, 3);
  renderRelacionadas(relacionadas);

  // Verifica se a sessão já está nos favoritos do utilizador e renderiza o botão
  // Compara como strings para evitar mismatch de tipo entre ID da API e ID guardado
  const isFav = utilizador?.favoritos.some(id => String(id) === String(sessao.id)) ?? false;
  renderFav(isFav);

  // Liga as estrelas de avaliação — guarda o valor selecionado para usar na conclusão
  bindRating(val => { ratingAtual = val; });

  // Liga o botão de conclusão: guarda a sessão, atualiza gamificação e mostra quiz
  bindConcluir(async () => {
    sessao.avaliacao = ratingAtual;
    // Regista no histórico ANTES das escritas na DB — o Live Server recarrega a página
    // a cada write, o que mataria qualquer código depois dos awaits.
    enfileirarNotificacao(`Sessão concluída: ${sessao.titulo} +20 pts`, 'conquista');
    await sessao.save(); // Guarda a sessão como concluída com a avaliação
    // Atribui 20 pontos por sessão concluída e verifica conquistas novas
    const [gam, sessoesConcluidas] = await Promise.all([
      GamificacaoModel.load(),
      getSessoesConcluidas()
    ]);
    await gam.addPontos(20);
    const novas = await gam.verificarConquistas({
      sessoes:             sessoesConcluidas.length,
      caminhosConcluidos:  new Set(sessoesConcluidas.filter(s => s.caminho).map(s => s.caminho)).size
    });
    novas.forEach(c => enfileirarNotificacao(`Conquista desbloqueada: ${c.nome} 🏆`, 'conquista'));
    marcarConcluida();
    bindSubmeterQuiz(async respostas => {
      mostrarSucessoQuiz(); // Mostra mensagem de agradecimento após submeter o quiz
    });
  });

  // Liga o botão de favorito — adiciona ou remove da lista de favoritos do utilizador
  bindFav(async () => {
    if (!utilizador) return;
    const jaFav = utilizador.favoritos.some(id => String(id) === String(sessao.id));
    if (jaFav) {
      await utilizador.removeFavorito(sessao.id);
    } else {
      await utilizador.addFavorito(sessao.id);
    }
    renderFav(!jaFav); // Atualiza o visual do botão após a alteração
  });
});
