// Controlador da página de perfil do utilizador.
// Carrega e apresenta todos os dados do perfil, gere a edição de dados pessoais
// (nome, email, password, aniversário), preferências e toggles de notificações.
import UserModel from '../models/UserModel.js';
import GamificacaoModel from '../models/GamificacaoModel.js';
import ReflexaoModel from '../models/ReflexaoModel.js';
import { getSessoesConcluidas, getCheckins, updatePassword } from '../services/service.js';
import { conquistaImg } from '../utils/emocaoIcons.js';
import {
  renderIdentidade, renderStats, renderPerfilDominante, renderConquistasMini,
  renderDadosPessoais, renderPreferencias, renderNotificacoes, renderAniversario
} from '../views/PerfilView.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega todos os dados necessários em paralelo
  const [utilizador, gamificacao, sessoesConcluidas, checkins, reflexoes] = await Promise.all([
    UserModel.get(),
    GamificacaoModel.load(),
    getSessoesConcluidas(),
    getCheckins(),
    ReflexaoModel.getAll()
  ]);

  if (!utilizador) return;

  // Renderiza todas as secções do perfil com os dados carregados
  renderIdentidade(utilizador, gamificacao?.nivel || 1);
  renderStats(sessoesConcluidas.length, reflexoes.length, checkins.length);
  renderPerfilDominante(utilizador.perfilDominante, utilizador.preferencias?.scores);
  renderConquistasMini(gamificacao?.conquistas || []);
  renderDadosPessoais(utilizador);
  renderPreferencias(utilizador.preferencias || {});
  renderNotificacoes(utilizador.preferencias || {});
  renderAniversario(utilizador.preferencias?.aniversario);

  
  // Mapeamentos para converter os labels dos selects nos valores internos
  const selects = document.querySelectorAll('.config-select');
  const horarioMap  = { 'Manhã': 'manha', 'Tarde': 'tarde', 'Noite': 'noite' };
  const duracaoMap  = { '5 min': '5', '10 min': '10', '20 min': '20', '30+ min': '30' };
  const objetivoMap = { 'Ansiedade': 'ansiedade', 'Foco': 'foco', 'Sono': 'sono' };

  // Guarda as preferências sempre que o utilizador muda um select
  async function guardarPreferencias() {
    const prefs = utilizador.preferencias || {};
    await utilizador.updatePreferencias({
      ...prefs,
      horario:  horarioMap[selects[0]?.value]  || prefs.horario,
      duracao:  duracaoMap[selects[1]?.value]  || prefs.duracao,
      objetivo: objetivoMap[selects[2]?.value] || prefs.objetivo
    });
  }
  selects.forEach(s => s.addEventListener('change', guardarPreferencias));

  
  // Liga os toggles de notificação — guarda no perfil e no localStorage ao mudar
  const notifDefaults = { sugestoes: true, conquistas: true, citacao: true };
  document.querySelectorAll('[data-notif]').forEach(toggle => {
    toggle.addEventListener('change', async () => {
      const atual = utilizador.preferencias || {};
      const novasNotif = { ...(atual.notificacoes || notifDefaults), [toggle.dataset.notif]: toggle.checked };
      await utilizador.updatePreferencias({ ...atual, notificacoes: novasNotif });
      localStorage.setItem('mindnest_notif_prefs', JSON.stringify(novasNotif));
    });
  });

  
  // Liga o link de logout para terminar a sessão e redirecionar para o login
  document.querySelector('a[href="login.html"]').addEventListener('click', e => {
    e.preventDefault();
    import('../models/AuthModel.js').then(({ default: AuthModel }) => {
      AuthModel.logout();
      window.location.href = 'login.html';
    });
  });

  
  // Mostra o campo de input do nome e esconde o texto estático
  window.editarNome = () => {
    document.getElementById('input-nome').style.display = 'block';
    document.getElementById('nome-sub').style.display   = 'none';
    document.getElementById('save-nome').classList.add('visible');
    document.getElementById('input-nome').focus();
  };

  // Guarda o novo nome e atualiza todos os elementos que mostram o nome
  window.guardarNome = async () => {
    const input    = document.getElementById('input-nome');
    const novoNome = input.value.trim() || utilizador.nome;
    utilizador.nome = novoNome;
    await utilizador.save();
    document.getElementById('nome-sub').textContent    = novoNome;
    document.getElementById('nome-display').textContent = novoNome;
    document.getElementById('avatar-display').textContent = novoNome.charAt(0).toUpperCase();
    document.querySelector('.profile-name').textContent   = novoNome;
    input.style.display = 'none';
    document.getElementById('nome-sub').style.display = '';
    document.getElementById('save-nome').classList.remove('visible');
  };

  
  // Mostra o campo de input do email e esconde o texto estático
  window.editarEmail = () => {
    document.getElementById('input-email').style.display = 'block';
    document.getElementById('email-sub').style.display   = 'none';
    document.getElementById('save-email').classList.add('visible');
    document.getElementById('input-email').focus();
  };

  // Guarda o novo email e atualiza os elementos visíveis
  window.guardarEmail = async () => {
    const input     = document.getElementById('input-email');
    const novoEmail = input.value.trim();
    if (!novoEmail) return;
    utilizador.email = novoEmail;
    await utilizador.save();
    document.getElementById('email-sub').textContent = novoEmail;
    document.querySelector('.perfil-email-display').textContent = novoEmail;
    input.style.display = 'none';
    document.getElementById('email-sub').style.display = '';
    document.getElementById('save-email').classList.remove('visible');
  };

  
  // Mostra o campo de input da password e esconde o placeholder
  window.editarPassword = () => {
    document.getElementById('password-wrap').style.display  = 'flex';
    document.getElementById('password-sub').style.display   = 'none';
    document.getElementById('save-password').classList.add('visible');
    document.getElementById('input-password').focus();
  };

  // Alterna a visibilidade da password entre texto e asteriscos
  window.toggleVerPassword = () => {
    const input = document.getElementById('input-password');
    const btn   = document.getElementById('btn-ver-password');
    const visivel = input.type === 'text';
    input.type      = visivel ? 'password' : 'text';
    btn.textContent = visivel ? 'ver' : 'ocultar';
  };

  // Valida e atualiza a password via PATCH /users/:id (mínimo 8 caracteres)
  window.guardarPassword = async () => {
    const input = document.getElementById('input-password');
    const nova  = input.value.trim();
    if (nova.length < 8) { alert('A password deve ter pelo menos 8 caracteres.'); return; }
    const ok = await updatePassword(nova);
    if (!ok) { alert('Erro ao atualizar a password. Tenta novamente.'); return; }
    input.value = '';
    input.type  = 'password';
    document.getElementById('btn-ver-password').textContent = 'ver';
    document.getElementById('password-wrap').style.display  = 'none';
    document.getElementById('password-sub').style.display   = '';
    document.getElementById('save-password').classList.remove('visible');
  };

  
  // Mostra o campo de input de data e esconde o texto formatado
  window.editarAniversario = () => {
    document.getElementById('input-aniversario').style.display = 'block';
    document.getElementById('aniversario-sub').style.display   = 'none';
    document.getElementById('save-aniversario').classList.add('visible');
    document.getElementById('input-aniversario').focus();
  };

  // Guarda a data de aniversário e atualiza o texto legível formatado
  window.guardarAniversario = async () => {
    const input = document.getElementById('input-aniversario');
    const val   = input.value;
    if (!val) return;
    await utilizador.updatePreferencias({ ...utilizador.preferencias, aniversario: val });
    const d = new Date(val);
    document.getElementById('aniversario-sub').textContent = d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
    input.style.display = 'none';
    document.getElementById('aniversario-sub').style.display = '';
    document.getElementById('save-aniversario').classList.remove('visible');
  };
});
