// View da página de progresso.
// Renderiza os mini-stats, gráfico semanal, histórico de sessões,
// check-ins semanais, nível e grelha de conquistas.
import { emocaoImg, conquistaImg } from '../utils/emocaoIcons.js';

const DIAS_PT    = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CAT_THUMB  = { respiracao: '', meditacao: '', foco: 'mist', relaxamento: '', sono: 'fog', ansiedade: '' };
const CAT_NOME   = { respiracao: 'Respiração', meditacao: 'Meditação', foco: 'Foco', relaxamento: 'Relaxar', sono: 'Sono', ansiedade: 'Ansiedade' };

// Nomes dos níveis por número de nível (índice = nível)
const NIVEL_NOMES = ['', 'Mente Desperta', 'Mente Serena', 'Mente Clara', 'Mente Profunda', 'Mente Plena'];

// Formata a data de uma sessão histórica: 'Hoje', 'Ontem' ou data abreviada
function fmtDataHist(iso) {
  const d    = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === hoje.toDateString())  return 'Hoje, '  + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === ontem.toDateString()) return 'Ontem, ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}

// Renderiza os mini-stats: total de reflexões, sessões, horas e check-ins + deltas mensais/semanais
export function renderStatsMini(sessoes, checkins, reflexoes) {
  const agora = new Date();
  const estesMes = d => {
    const dt = new Date(d);
    return dt.getMonth() === agora.getMonth() && dt.getFullYear() === agora.getFullYear();
  };
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - 6);
  inicioSemana.setHours(0, 0, 0, 0);

  const sessoesArr   = Array.isArray(sessoes)  ? sessoes  : [];
  const checkinsArr  = Array.isArray(checkins) ? checkins : [];
  const reflexoesArr = Array.isArray(reflexoes)? reflexoes: [];

  const totalMinutos   = sessoesArr.reduce((acc, s) => acc + (s.duracao || 0), 0);
  const sessoesEsteMes = sessoesArr.filter(s => estesMes(s.data)).length;
  const horasEsteSemana= sessoesArr
    .filter(s => new Date(s.data) >= inicioSemana)
    .reduce((acc, s) => acc + (s.duracao || 0), 0) / 60;
  const checkinsEsteMes  = checkinsArr.filter(c => estesMes(c.data)).length;
  const reflexoesEsteMes = reflexoesArr.filter(r => estesMes(r.data)).length;

  const fmt = n => n > 0 ? `↑ ${n} este mês` : 'Nenhum este mês';

  const elRef  = document.getElementById('pm-reflexoes');
  const elSess = document.getElementById('pm-sessoes');
  const elHor  = document.getElementById('pm-horas');
  const elChk  = document.getElementById('pm-checkins');
  if (elRef)  elRef.textContent  = reflexoesArr.length;
  if (elSess) elSess.textContent = sessoesArr.length;
  if (elHor)  elHor.innerHTML    = `${(totalMinutos / 60).toFixed(1)}<small>h</small>`;
  if (elChk)  elChk.textContent  = checkinsArr.length;

  const elDRef  = document.getElementById('pm-delta-ref');
  const elDSess = document.getElementById('pm-delta-sess');
  const elDHor  = document.getElementById('pm-delta-horas');
  const elDChk  = document.getElementById('pm-delta-chk');
  if (elDRef)  elDRef.textContent  = fmt(reflexoesEsteMes);
  if (elDSess) elDSess.textContent = fmt(sessoesEsteMes);
  if (elDHor)  elDHor.textContent  = horasEsteSemana > 0 ? `↑ ${horasEsteSemana.toFixed(1)}h esta semana` : 'Nenhuma esta semana';
  if (elDChk)  elDChk.textContent  = fmt(checkinsEsteMes);
}

// Renderiza o gráfico de barras com as sessões por dia nos últimos 7 dias
export function renderGraficoSemanal(sessoes) {
  const hoje = new Date();

  // Agrupa as sessões por data (chave = toDateString)
  const sessoesMap = {};
  sessoes.forEach(s => {
    const k = new Date(s.data).toDateString();
    sessoesMap[k] = (sessoesMap[k] || 0) + 1;
  });

  // Gera array dos últimos 7 dias
  const dias7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje); d.setDate(hoje.getDate() - i);
    dias7.push(d);
  }
  const dados = dias7.map(d => ({
    dia: DIAS_PT[d.getDay()],
    sessoes: sessoesMap[d.toDateString()] || 0,
    hoje: d.toDateString() === hoje.toDateString()
  }));

  // Normaliza as alturas das barras relativamente ao máximo do período
  const max = Math.max(...dados.map(d => d.sessoes), 1);
  const barsEl = document.getElementById('grafico-bars');
  if (!barsEl) return;
  barsEl.innerHTML = dados.map(d => {
    const pct = d.sessoes > 0 ? Math.round((d.sessoes / max) * 100) : 4; // Mínimo visual de 4%
    const cls = d.hoje ? 'today' : d.sessoes > 0 ? 'has-data' : '';
    return `
    <div class="grafico-col">
      <div class="grafico-bar-wrap">
        ${d.sessoes > 0 ? `<span class="grafico-val">${d.sessoes}</span>` : ''}
        <div class="grafico-bar ${cls}" style="height:${pct}%;"></div>
      </div>
      <span class="grafico-dia ${d.hoje ? 'today' : ''}">${d.dia}</span>
    </div>`;
  }).join('');
}

// Renderiza as 5 sessões mais recentes concluídas pelo utilizador
export function renderHistoricoSessoes(sessoes) {
  const histEl = document.getElementById('historico-sessoes-list');
  if (!histEl) return;
  const recentes = [...sessoes].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5);
  if (recentes.length === 0) {
    histEl.innerHTML = '<p style="color:var(--color-text-muted);font-size:13px;padding:8px 0;">Ainda não concluíste nenhuma sessão.</p>';
    return;
  }
  histEl.innerHTML = recentes.map(s => {
    const videoId = s.url ? s.url.split('/embed/')[1]?.split('?')[0] : null;
    const thumb = videoId
      ? `<div class="hist-thumb"><img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${s.titulo}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);display:block;"></div>`
      : `<div class="hist-thumb ${CAT_THUMB[s.categoria] || ''}"></div>`;
    const cat = CAT_NOME[s.categoria] || s.categoria;
    return `
    <div class="hist-item">
      ${thumb}
      <div class="hist-info">
        <p class="hist-nome">${s.titulo}</p>
        <p class="hist-meta">${cat} · ${fmtDataHist(s.data)}</p>
      </div>
      <span class="hist-dur">${s.duracao} min</span>
      <span class="hist-check"><img src="../assets/icons/correct.png" width="16" height="16" style="object-fit:contain;"></span>
    </div>`;
  }).join('');
}

// Renderiza os check-ins da semana atual (Seg a Dom) com a emoção registada em cada dia
export function renderCheckinsSemanais(checkins) {
  const ciEl = document.getElementById('checkins-semana-list');
  if (!ciEl) return;

  // Calcula o início da semana (segunda-feira)
  const hoje = new Date();
  const diasParaSeg = hoje.getDay() === 0 ? 6 : hoje.getDay() - 1;
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - diasParaSeg);
  inicioSemana.setHours(0, 0, 0, 0);

  // Agrupa os check-ins desta semana por dia, mantendo apenas o mais recente de cada dia
  const ciPorDia = {};
  checkins.filter(c => new Date(c.data) >= inicioSemana).forEach(c => {
    const key = new Date(c.data).toDateString();
    if (!ciPorDia[key] || new Date(c.data) > new Date(ciPorDia[key].data)) ciPorDia[key] = c;
  });

  const labelsDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  ciEl.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((_, i) => {
    const d = new Date(inicioSemana); d.setDate(inicioSemana.getDate() + i);
    const ci    = ciPorDia[d.toDateString()];
    const icone = ci ? emocaoImg(ci.emocao, 20) : '';
    const cls   = !ci ? 'vazio' : d.toDateString() === hoje.toDateString() ? 'hoje' : '';
    return `
    <div class="ci-dia">
      <span class="ci-dia-label">${labelsDias[i]}</span>
      <div class="ci-dia-emocao ${cls}">${icone || '—'}</div>
    </div>`;
  }).join('');
}

// Renderiza o cartão de nível com pontos e barra de progresso
export function renderNivel(gamificacao) {
  const { pontos, nivel } = gamificacao;
  const nomNivel = NIVEL_NOMES[nivel] || `Nível ${nivel}`;
  const pct      = Math.round(((pontos % 100) / 100) * 100); // Progresso dentro do nível atual

  const elNivNome = document.getElementById('nivel-nome');
  const elNivNum  = document.getElementById('nivel-num');
  const elNivPts  = document.getElementById('nivel-pts-val');
  const elNivBar  = document.getElementById('nivel-progress-fill');
  const elNivMeta = document.getElementById('nivel-meta');

  if (elNivNome) elNivNome.textContent = nomNivel;
  if (elNivNum)  elNivNum.textContent  = `Nível ${nivel}`;
  if (elNivPts)  elNivPts.textContent  = `${pontos} pts`;
  if (elNivBar)  elNivBar.style.width  = pct + '%';
  if (elNivMeta) elNivMeta.textContent = `${100 - (pontos % 100)} pontos para o Nível ${nivel + 1}`;
}

// Renderiza a grelha de conquistas — mostra o estado (desbloqueada/bloqueada) e o progresso de cada uma
export function renderConquistas(gamificacao, catalogo, ctx) {
  const conquistasEl  = document.getElementById('conquistas-grid');
  if (!conquistasEl) return;
  const desbloqueadas = new Set(gamificacao.conquistas || []);
  conquistasEl.innerHTML = catalogo.map(c => {
    const isOn  = desbloqueadas.has(c.id);
    const label = isOn ? '✓' : (c.progresso(ctx) || '—');
    return `
    <div class="conquista ${isOn ? '' : 'bloqueada'}">
      <span class="conquista-emoji">${conquistaImg(c.id)}</span>
      <span class="conquista-nome">${c.nome}</span>
      <span class="conquista-desbloqueada">${label}</span>
    </div>`;
  }).join('');
}
