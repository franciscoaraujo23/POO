// Utilitário de notificações toast (pop-up temporário no ecrã).
// Suporta entrega imediata e entrega persistente via localStorage (sobrevive a navegações).

function getNotifPrefs() {
  const sessao = localStorage.getItem('mindnest_sessao');
  if (!sessao) return { sugestoes: true, conquistas: true, citacao: true };
  try {
    const dados = JSON.parse(localStorage.getItem('mindnest_notif_prefs') || '{}');
    return { sugestoes: true, conquistas: true, citacao: true, ...dados };
  } catch { return { sugestoes: true, conquistas: true, citacao: true }; }
}

function contarToastsVisiveis() {
  return document.querySelectorAll('.notificacao').length;
}

function registarHistorico(mensagem, tipo) {
  const historico = JSON.parse(localStorage.getItem('mindnest_notif_historico') || '[]');
  historico.unshift({ mensagem, tipo, ts: Date.now() });
  if (historico.length > 30) historico.length = 30;
  localStorage.setItem('mindnest_notif_historico', JSON.stringify(historico));
  localStorage.setItem('mindnest_notif_unread', '1');
}

function _mostrarToast(mensagem, tipo) {
  const offset = contarToastsVisiveis();
  const div = document.createElement('div');
  div.className = `notificacao notificacao--${tipo}`;
  div.textContent = mensagem;
  div.style.top = (24 + offset * 64) + 'px';
  document.body.appendChild(div);
  requestAnimationFrame(() => requestAnimationFrame(() => div.classList.add('notificacao--visivel')));
  setTimeout(() => {
    div.classList.remove('notificacao--visivel');
    div.addEventListener('transitionend', () => div.remove(), { once: true });
  }, 4000);
}

// Mostra uma notificação toast imediatamente e regista no histórico.
function mostrarNotificacao(mensagem, tipo = 'conquista') {
  const prefs = getNotifPrefs();
  if (tipo === 'conquista' && !prefs.conquistas) return;
  if (tipo === 'sugestao'  && !prefs.sugestoes)  return;
  if (tipo === 'citacao'   && !prefs.citacao)    return;
  registarHistorico(mensagem, tipo);
  _mostrarToast(mensagem, tipo);
}

// Guarda uma notificação em histórico e em pending — sobrevive a recargas do Live Server.
// O histórico é registado de imediato; o toast é mostrado na próxima página via mostrarNotificacoesPendentes.
function enfileirarNotificacao(mensagem, tipo = 'conquista') {
  registarHistorico(mensagem, tipo);
  const pending = JSON.parse(localStorage.getItem('mindnest_notif_pending') || '[]');
  pending.push({ mensagem, tipo });
  localStorage.setItem('mindnest_notif_pending', JSON.stringify(pending));
}

// Mostra os toasts pendentes SEM re-registar no histórico (já foi feito em enfileirarNotificacao).
function mostrarNotificacoesPendentes() {
  const pending = JSON.parse(localStorage.getItem('mindnest_notif_pending') || '[]');
  if (!pending.length) return;
  localStorage.removeItem('mindnest_notif_pending');
  const prefs = getNotifPrefs();
  pending.forEach((n, i) => {
    if (n.tipo === 'conquista' && !prefs.conquistas) return;
    if (n.tipo === 'sugestao'  && !prefs.sugestoes)  return;
    if (n.tipo === 'citacao'   && !prefs.citacao)    return;
    setTimeout(() => _mostrarToast(n.mensagem, n.tipo), i * 600);
  });
}

export { mostrarNotificacao, enfileirarNotificacao, mostrarNotificacoesPendentes };
