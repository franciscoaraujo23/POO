// Guarda de sessão: redireciona para login.html se o utilizador tentar aceder
// a uma página protegida sem ter sessão ativa.
// Também verifica conquistas pendentes em todas as páginas autenticadas.
import AuthModel from './models/AuthModel.js';
import GamificacaoModel from './models/GamificacaoModel.js';
import { mostrarNotificacoesPendentes, mostrarNotificacao } from './utils/notificacao.js';

// Páginas que não requerem autenticação
const PAGINAS_PUBLICAS = ['index.html', 'login.html', 'onboarding.html'];

// Obtém o nome do ficheiro HTML atual a partir do URL
const pagina = window.location.pathname.split('/').pop() || 'index.html';

// Se a página for protegida e não houver sessão, redireciona para o login
if (!PAGINAS_PUBLICAS.includes(pagina) && !AuthModel.isLogged()) {
  window.location.href = 'login.html';
}

if (!PAGINAS_PUBLICAS.includes(pagina) && AuthModel.isLogged()) {
  // Mostra notificações pendentes do localStorage (sobrevivem a navegações)
  // e verifica conquistas em atraso (ex: edição manual via admin)
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(mostrarNotificacoesPendentes, 500);
  });

  GamificacaoModel.load().then(async gam => {
    const novas = await gam.verificarConquistas();
    novas.forEach((c, i) =>
      setTimeout(() => mostrarNotificacao(`Conquista desbloqueada: ${c.nome} 🏆`, 'conquista'), 500 + i * 600)
    );
  }).catch(() => {});
}
