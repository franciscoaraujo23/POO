// Controlador do dashboard principal.
// Carrega e apresenta estatísticas da semana, pontos, nível e sessões recomendadas.
// As recomendações são personalizadas com base no perfil psicológico do utilizador.
import UserModel from '../models/UserModel.js';
import GamificacaoModel from '../models/GamificacaoModel.js';
import SessaoModel from '../models/sessaoModel.js';
import { getSessoesConcluidas } from '../services/service.js';
import { mostrarNotificacao } from '../utils/notificacao.js';
import {
  renderData, renderStatSemanal, renderStatSessoes, renderStatPontos,
  renderRecomendadas, renderFrase, bindPesquisa
} from '../views/DashboardView.js';

// Mapa que associa cada perfil psicológico ao caminho e categorias de sessões mais adequadas
const PERFIL_CAMINHO = {
  overthinking: { caminho: 'mindfulness', categorias: ['meditacao', 'respiracao'] },
  ansiedade:    { caminho: 'mindfulness', categorias: ['ansiedade', 'respiracao'] },
  foco:         { caminho: 'estoicismo',  categorias: ['foco', 'meditacao']       },
  sono:         { caminho: 'taoismo',     categorias: ['sono', 'relaxamento']     }
};

const TOTAL_SLOTS = 4;  // Número total de sessões recomendadas a mostrar
const THRESHOLD   = 15; // Percentagem mínima para o perfil ser considerado ativo

// Categorias associadas a cada objetivo de preferência
const OBJETIVO_CATS = {
  ansiedade: ['ansiedade', 'respiracao'],
  foco:      ['foco', 'meditacao'],
  sono:      ['sono', 'relaxamento']
};

// Calcula as sessões recomendadas com base nos scores do perfil, objetivo e duração preferida.
// Os slots são distribuídos proporcionalmente entre os perfis ativos (score >= 15%).
// Dentro de cada perfil, prioriza sessões que coincidam com o objetivo e ordena por duração.
function calcularRecomendadas(catalogo, utilizador) {
  const scores     = utilizador?.preferencias?.scores  || {};
  const objetivo   = utilizador?.preferencias?.objetivo || '';
  const duracaoStr = String(utilizador?.preferencias?.duracao || '');

  // Converte a preferência de duração num alvo numérico (minutos)
  const duracaoAlvo = duracaoStr === '30' ? 35
                    : duracaoStr === '20' ? 20
                    : duracaoStr === '10' ? 10
                    : duracaoStr === '5'  ? 5
                    : null;

  const objetivoCats = OBJETIVO_CATS[objetivo] || [];

  // Ordena candidatas: primeiro as que coincidem com o objetivo, depois por proximidade de duração
  const ordenar = lista => {
    let arr = objetivoCats.length
      ? [...lista.filter(s => objetivoCats.includes(s.categoria)),
         ...lista.filter(s => !objetivoCats.includes(s.categoria))]
      : [...lista];
    if (duracaoAlvo) arr.sort((a, b) => Math.abs(a.duracao - duracaoAlvo) - Math.abs(b.duracao - duracaoAlvo));
    return arr;
  };

  const perfisAtivos = Object.entries(scores)
    .filter(([, pct]) => pct >= THRESHOLD)
    .sort((a, b) => b[1] - a[1]);

  const totalPct = perfisAtivos.reduce((acc, [, pct]) => acc + pct, 0) || 1;

  let slots = perfisAtivos.map(([k, pct]) => ({
    perfil: k,
    n: Math.round((pct / totalPct) * TOTAL_SLOTS)
  }));

  const soma = slots.reduce((acc, s) => acc + s.n, 0);
  if (slots.length && soma !== TOTAL_SLOTS) slots[0].n += TOTAL_SLOTS - soma;

  const usados = new Set();
  const recomendadas = [];

  for (const { perfil, n } of slots) {
    const mapa = PERFIL_CAMINHO[perfil];
    if (!mapa) continue;
    const candidatas = ordenar(catalogo.filter(s =>
      !usados.has(s.id) && (s.caminho === mapa.caminho || mapa.categorias.includes(s.categoria))
    ));
    candidatas.slice(0, n).forEach(s => { recomendadas.push(s); usados.add(s.id); });
  }

  // Completa com sessões filtradas por objetivo e duração caso não haja suficientes
  const fallback = ordenar(catalogo.filter(s => !usados.has(s.id)));
  for (const s of fallback) {
    if (recomendadas.length >= TOTAL_SLOTS) break;
    recomendadas.push(s);
    usados.add(s.id);
  }

  return recomendadas;
}

document.addEventListener('DOMContentLoaded', async () => {
  const hoje = new Date();
  renderData(hoje);

  // Carrega dados em paralelo para melhorar o desempenho
  const [gamificacao, sessoes, utilizador, catalogo, frase] = await Promise.all([
    GamificacaoModel.load(),
    getSessoesConcluidas(),
    UserModel.get(),
    SessaoModel.getAll(),
    SessaoModel.getFraseAleatoria()
  ]);

  // Calcula sessões e dias ativos nos últimos 7 dias
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - 6);
  inicioSemana.setHours(0, 0, 0, 0);
  const sessoesSemana = sessoes.filter(s => new Date(s.data) >= inicioSemana);
  const diasAtivos    = new Set(sessoesSemana.map(s => new Date(s.data).toDateString())).size;

  // Filtra sessões do mês atual para o contador mensal
  const sessoesMes = sessoes.filter(s => {
    const d = new Date(s.data);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  });

  // Renderiza as estatísticas no dashboard
  renderStatSemanal(sessoesSemana.length, diasAtivos);
  renderStatSessoes(sessoesMes.length);
  renderStatPontos(gamificacao.pontos, gamificacao.nivel);

  // Gera e renderiza as sessões recomendadas personalizadas
  const recomendadas = calcularRecomendadas(catalogo, utilizador);
  renderRecomendadas(recomendadas);

  renderFrase(frase);

  // Verifica conquista Autoconhecimento passivamente: desbloqueada quando o perfil estiver definido
  if (utilizador?.perfilDominante) {
    const novas = await gamificacao.verificarConquistas({ temPerfil: true });
    novas.forEach((c, i) =>
      setTimeout(() => mostrarNotificacao(`Conquista desbloqueada: ${c.nome} 🏆`, 'conquista'), 1000 + i * 600)
    );
  }

  // Liga o botão de notificações: abre/fecha o popup e marca as notificações como lidas
  const notifBtn   = document.getElementById('notif-btn');
  const notifPopup = document.getElementById('notif-popup');
  const notifDot   = document.getElementById('notif-dot');

  // Move o popup para document.body para escapar de qualquer stacking context herdado
  // (overflow, z-index, transform) da hierarquia do main-content
  if (notifPopup) document.body.appendChild(notifPopup);

  // Mostra o ponto apenas se houver notificações não lidas
  if (localStorage.getItem('mindnest_notif_unread') === '1') {
    notifDot?.classList.add('visible');
  }

  notifBtn?.addEventListener('click', e => {
    e.stopPropagation();
    const historico = JSON.parse(localStorage.getItem('mindnest_notif_historico') || '[]');
    const lista = document.getElementById('notif-popup-list');
    if (historico.length) {
      const fmtTs = ts => {
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 60)    return 'agora mesmo';
        if (diff < 3600)  return `há ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
        return new Date(ts).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
      };
      lista.innerHTML = historico.map(n =>
        `<div class="notif-popup-item notif-popup-item--${n.tipo}">
           <span class="notif-popup-msg">${n.mensagem}</span>
           <span class="notif-popup-ts">${fmtTs(n.ts)}</span>
         </div>`
      ).join('');
    } else {
      lista.innerHTML = '<p class="notif-popup-empty">Sem notificações ainda.</p>';
    }
    // Posiciona o popup abaixo do botão (fixed, escape ao overflow do main-content)
    const rect = notifBtn.getBoundingClientRect();
    if (notifPopup) {
      notifPopup.style.top   = (rect.bottom + 8) + 'px';
      notifPopup.style.right = (window.innerWidth - rect.right) + 'px';
    }
    notifPopup?.classList.toggle('visible');
    // Marca como lidas ao abrir
    localStorage.removeItem('mindnest_notif_unread');
    notifDot?.classList.remove('visible');
  });

  // Fecha o popup ao clicar fora
  document.addEventListener('click', () => notifPopup?.classList.remove('visible'));

  // Liga a caixa de pesquisa: filtra o catálogo em tempo real por título ou categoria
  bindPesquisa(q => {
    if (!q) { renderRecomendadas(recomendadas); return; }
    const filtradas = catalogo.filter(s =>
      s.titulo.toLowerCase().includes(q) || s.categoria.toLowerCase().includes(q)
    );
    renderRecomendadas(filtradas.slice(0, 6));
  });
});
