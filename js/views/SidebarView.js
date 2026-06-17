// View da sidebar de navegação.
// Preenche o avatar e o nome do utilizador, exibe o nível
// e adiciona o link de administração se o utilizador for admin.
import UserModel from '../models/UserModel.js';
import GamificacaoModel from '../models/GamificacaoModel.js';

const NIVEL_NOMES = ['', 'Mente Desperta', 'Mente Serena', 'Mente Clara', 'Mente Profunda', 'Mente Plena'];

function nivelLabel(nivel) {
  return NIVEL_NOMES[nivel] ? `${NIVEL_NOMES[nivel]} · Nível ${nivel}` : `Nível ${nivel}`;
}

// Carrega o utilizador e a gamificação, atualiza a sidebar com os dados do utilizador
async function init() {
  const [utilizador, gamificacao] = await Promise.all([
    UserModel.get(),
    GamificacaoModel.load()
  ]);

  const nome  = utilizador?.nome  || '';
  const nivel = gamificacao?.nivel || 1;

  // Preenche o avatar com a inicial do nome, o nome e o label de nível
  document.querySelector('.avatar').textContent        = nome ? nome.charAt(0).toUpperCase() : '';
  document.querySelector('.profile-name').textContent  = nome;
  document.querySelector('.profile-level').textContent = nivelLabel(nivel);

  // Atualiza a saudação no dashboard se existir o elemento
  const saudacao = document.getElementById('dashboard-nome');
  if (saudacao) saudacao.textContent = nome.split(' ')[0];

  // Adiciona dinamicamente o link de Admin na sidebar se o utilizador for admin
  if (utilizador?.role === 'admin') {
    const nav = document.querySelector('.sidebar nav');
    if (nav && !nav.querySelector('a[href="admin.html"]')) {
      const link = document.createElement('a');
      link.href = 'admin.html';
      link.className = 'nav-item nav-item-admin';
      link.innerHTML = `
        <span class="nav-item-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07"/>
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/>
          </svg>
        </span>
        Admin`;
      nav.appendChild(link);
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
