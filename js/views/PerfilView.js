// View da página de perfil do utilizador.
// Renderiza a identidade, estatísticas, perfil dominante, conquistas, dados pessoais,
// preferências, notificações e aniversário.
import { conquistaImg } from '../utils/emocaoIcons.js';

// Mapa de chave de perfil para o nome legível em português
const PERFIL_LABEL = {
  overthinking: 'Mente Agitada',
  ansiedade:    'Mente Ansiosa',
  foco:         'Mente Distraída',
  sono:         'Mente Cansada'
};

const PERFIL_ICON = {
  overthinking: '../assets/icons/confused.png',
  ansiedade:    '../assets/icons/ansious.png',
  foco:         '../assets/icons/focus.png',
  sono:         '../assets/icons/tired.png'
};

const PERFIL_BAR_COLOR = {
  overthinking: 'var(--dusk-400)',
  ansiedade:    'var(--mist-400)',
  foco:         'var(--fog-500)',
  sono:         'var(--dusk-300)'
};

const PERFIL_BAR_LABEL = {
  overthinking: 'Overthinking',
  ansiedade:    'Ansiedade',
  foco:         'Foco',
  sono:         'Sono'
};

// Informação de cada conquista disponível (usada nos mini-icons do perfil)
const CONQUISTA_INFO = {
  '1passo':          { label: 'Primeiro Passo'       },
  '10checkins':      { label: '10 Check-ins'         },
  '10sessoes':       { label: '10 Sessões'           },
  '100sessoes':      { label: '100 Sessões'          },
  '5nivel':          { label: 'Nível 5'              },
  'Autoconhecimento':{ label: 'Autoconhecimento'     },
  'Escritor':        { label: 'Escritor'             },
  'MestreCaminhos':  { label: 'Mestre dos Caminhos'  },
  'VozInterior':     { label: 'Voz Interior'         },
};

// Renderiza o avatar, nome, email e badge de nível/perfil no cabeçalho do perfil
export function renderIdentidade(utilizador, nivel) {
  const nome = utilizador.nome;
  document.getElementById('avatar-display').textContent        = nome.charAt(0).toUpperCase();
  document.getElementById('nome-display').textContent          = nome;
  document.querySelector('.perfil-email-display').textContent  = utilizador.email;
  document.querySelector('.perfil-nivel-badge').textContent    =
    (PERFIL_LABEL[utilizador.perfilDominante] || 'Explorador') + ' · Nível ' + nivel;
}

// Renderiza os três mini-stats do perfil: sessões concluídas, reflexões e total de check-ins
export function renderStats(sessoesConcluidas, totalReflexoes, totalCheckins) {
  const vals = document.querySelectorAll('.perfil-stat-val');
  if (vals[0]) vals[0].textContent = sessoesConcluidas;
  if (vals[1]) vals[1].textContent = totalReflexoes;
  if (vals[2]) vals[2].textContent = totalCheckins;
}

// Renderiza o ícone, nome e barras de percentagem do perfil dominante
export function renderPerfilDominante(perfilDominante, scores) {
  const nomeEl = document.querySelector('.dominante-nome');
  if (nomeEl && perfilDominante) nomeEl.textContent = PERFIL_LABEL[perfilDominante] || perfilDominante;

  const iconEl = document.querySelector('.dominante-icon');
  if (iconEl && perfilDominante) {
    const src = PERFIL_ICON[perfilDominante];
    iconEl.innerHTML = src
      ? `<img src="${src}" width="32" height="32" style="object-fit:contain;">`
      : '🧠';
  }

  const barsEl = document.querySelector('.dominante-bars');
  if (!barsEl) return;
  if (!scores || !Object.keys(scores).length) {
    barsEl.innerHTML = '<p style="font-size:13px;color:var(--color-text-muted);">Completa o questionário para ver o teu perfil detalhado.</p>';
    return;
  }

  barsEl.innerHTML = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `
    <div class="dominante-bar-row">
      <span class="dominante-bar-label">${PERFIL_BAR_LABEL[k] || k}</span>
      <div class="dominante-bar-track">
        <div class="dominante-bar-fill" style="width:${v}%; background:${PERFIL_BAR_COLOR[k] || 'var(--dusk-300)'};">
        </div>
      </div>
      <span class="dominante-bar-val">${v}%</span>
    </div>`).join('');
}

// Renderiza os ícones mini de conquistas — destaca as desbloqueadas, escurece as bloqueadas
export function renderConquistasMini(conquistasDesbloqueadas) {
  const wrap = document.querySelector('.conquistas-resumo');
  if (!wrap) return;
  wrap.innerHTML = Object.entries(CONQUISTA_INFO).map(([id, info]) => {
    const desbloqueada = conquistasDesbloqueadas.includes(id);
    return `<div class="conquista-mini ${desbloqueada ? '' : 'bloqueada'}" title="${info.label}">${conquistaImg(id, 22)}</div>`;
  }).join('');
}

// Preenche os campos de dados pessoais (nome e email) com os valores atuais do utilizador
export function renderDadosPessoais(utilizador) {
  document.getElementById('nome-sub').textContent  = utilizador.nome;
  document.getElementById('input-nome').value      = utilizador.nome;
  document.getElementById('email-sub').textContent = utilizador.email;
  document.getElementById('input-email').value     = utilizador.email;
}

// Seleciona as opções corretas nos selects de preferências (horário, duração, objetivo)
export function renderPreferencias(prefs) {
  const horarioOpts  = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
  const duracaoOpts  = { '5': '5 min', '10': '10 min', '20': '20 min', '30': '30+ min' };
  const objetivoOpts = { ansiedade: 'Ansiedade', foco: 'Foco', sono: 'Sono' };

  const selects = document.querySelectorAll('.config-select');

  // Seleciona a option cujo texto corresponde ao valor guardado nas preferências
  function selecionarOption(select, valor) {
    if (!valor || !select) return;
    Array.from(select.options).forEach(o => { o.selected = o.text === valor; });
  }
  if (selects[0]) selecionarOption(selects[0], horarioOpts[prefs.horario]);
  if (selects[1]) selecionarOption(selects[1], duracaoOpts[prefs.duracao]);
  if (selects[2]) selecionarOption(selects[2], objetivoOpts[prefs.objetivo]);
}

// Sincroniza o estado dos toggles de notificação com as preferências guardadas
export function renderNotificacoes(prefs) {
  const defaults = { sugestoes: true, conquistas: true, citacao: true };
  const notifPrefs = prefs.notificacoes || defaults;
  document.querySelectorAll('[data-notif]').forEach(toggle => {
    // Usa o valor guardado ou o padrão (true) se não existir
    toggle.checked = notifPrefs[toggle.dataset.notif] ?? defaults[toggle.dataset.notif];
  });
}

// Preenche o campo de aniversário e o texto legível se houver data guardada
export function renderAniversario(aniversario) {
  if (!aniversario) return;
  const d = new Date(aniversario);
  const sub = document.getElementById('aniversario-sub');
  const input = document.getElementById('input-aniversario');
  if (sub)   sub.textContent = d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  if (input) input.value     = aniversario;
}
