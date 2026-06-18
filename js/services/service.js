// Única camada que faz fetch — todos os models importam daqui
const BASE_URL = 'http://localhost:3000';

// constrói headers com token JWT do localStorage
function authHeaders() {
  const sessao = JSON.parse(localStorage.getItem('mindnest_sessao'));
  return {
    'Content-Type': 'application/json',
    'Authorization': sessao ? `Bearer ${sessao.token}` : ''
  };
}

// extrai o ID do utilizador do token JWT (atob descodifica o payload de base64)
function getUserId() {
  const sessao = JSON.parse(localStorage.getItem('mindnest_sessao'));
  if (!sessao?.token) return null;
  try {
    const payload = JSON.parse(atob(sessao.token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

// ── AUTENTICAÇÃO ─────────────────────────────────────────

export async function register(email, password) {
  const resposta = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resposta.ok) return { ok: false };
  const dados = await resposta.json();
  return { ok: true, token: dados.accessToken };
}

export async function login(email, password) {
  const resposta = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resposta.ok) return { ok: false };
  const dados = await resposta.json();
  return { ok: true, token: dados.accessToken };
}

// ── PERFIL ───────────────────────────────────────────────

export async function getPerfil() {
  const res = await fetch(`${BASE_URL}/perfis?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return null;
  const lista = await res.json();
  return lista[0] || null;
}

// PUT se já existe, POST se é novo
export async function savePerfil(id, dados) {
  if (id) {
    await fetch(`${BASE_URL}/perfis/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...dados, userId: getUserId() })
    });
    return id;
  }
  const res = await fetch(`${BASE_URL}/perfis`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
  const criado = await res.json();
  return criado.id;
}

// ── CHECKINS ─────────────────────────────────────────────

export async function getCheckins() {
  const res = await fetch(`${BASE_URL}/checkins?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function saveCheckin(dados) {
  await fetch(`${BASE_URL}/checkins`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
}

export async function updateCheckin(id, dados) {
  await fetch(`${BASE_URL}/checkins/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
}

// ── REFLEXÕES ────────────────────────────────────────────

export async function getReflexoes() {
  const res = await fetch(`${BASE_URL}/reflexoes?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function saveReflexao(dados) {
  await fetch(`${BASE_URL}/reflexoes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
}

export async function updateReflexao(id, dados) {
  await fetch(`${BASE_URL}/reflexoes/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
}

export async function deleteReflexao(id) {
  await fetch(`${BASE_URL}/reflexoes/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
}

// ── SESSÕES ──────────────────────────────────────────────

export async function getSessoesCatalogo() {
  const res = await fetch(`${BASE_URL}/sessoes`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

export async function getSessoesConcluidas() {
  const res = await fetch(`${BASE_URL}/sessoes_concluidas?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function saveSessaoConcluida(dados) {
  await fetch(`${BASE_URL}/sessoes_concluidas`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
}

// atualiza rating global da sessão (soma avaliação ao total e incrementa contagem)
export async function patchSessaoRating(sessaoId, avaliacao) {
  const res = await fetch(`${BASE_URL}/sessoes/${sessaoId}`, { headers: authHeaders() });
  if (!res.ok) return;
  const sessao = await res.json();
  await fetch(`${BASE_URL}/sessoes/${sessaoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({
      ratingTotal: (sessao.ratingTotal || 0) + avaliacao,
      ratingCount: (sessao.ratingCount || 0) + 1
    })
  });
}

// ── GAMIFICAÇÃO ──────────────────────────────────────────

export async function getGamificacao() {
  const res = await fetch(`${BASE_URL}/gamificacao?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return null;
  const lista = await res.json();
  return lista[0] || null;
}

// PUT se já existe, POST se é novo
export async function saveGamificacao(id, dados) {
  if (id) {
    await fetch(`${BASE_URL}/gamificacao/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ id, ...dados, userId: getUserId() })
    });
    return id;
  }
  const res = await fetch(`${BASE_URL}/gamificacao`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
  const criado = await res.json();
  return criado.id;
}

// ── FRASES ───────────────────────────────────────────────

export async function getFrases() {
  const res = await fetch(`${BASE_URL}/frases`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// ── ADMIN ────────────────────────────────────────────────

export async function adminCreateSessao(dados) {
  const res = await fetch(`${BASE_URL}/sessoes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
  return res.ok ? res.json() : null;
}

export async function adminUpdateSessao(id, dados) {
  const res = await fetch(`${BASE_URL}/sessoes/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
  return res.ok;
}

export async function adminDeleteSessao(id) {
  const res = await fetch(`${BASE_URL}/sessoes/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return res.ok;
}

export async function adminGetPerfis() {
  const res = await fetch(`${BASE_URL}/perfis`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

export async function adminGetCheckins() {
  const res = await fetch(`${BASE_URL}/checkins`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

export async function adminGetSessoesConcluidas() {
  const res = await fetch(`${BASE_URL}/sessoes_concluidas`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

export async function adminGetReflexoes() {
  const res = await fetch(`${BASE_URL}/reflexoes`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

export async function adminGetGamificacao() {
  const res = await fetch(`${BASE_URL}/gamificacao`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

export async function adminDeletePerfil(id) {
  const res = await fetch(`${BASE_URL}/perfis/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.ok;
}

export async function adminDeleteCheckinsByUser(userId) {
  const res = await fetch(`${BASE_URL}/checkins?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(c =>
    fetch(`${BASE_URL}/checkins/${c.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

export async function adminDeleteReflexoesByUser(userId) {
  const res = await fetch(`${BASE_URL}/reflexoes?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(r =>
    fetch(`${BASE_URL}/reflexoes/${r.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

export async function adminDeleteSessoesByUser(userId) {
  const res = await fetch(`${BASE_URL}/sessoes_concluidas?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(s =>
    fetch(`${BASE_URL}/sessoes_concluidas/${s.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

export async function adminDeleteGamificacaoByUser(userId) {
  const res = await fetch(`${BASE_URL}/gamificacao?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(g =>
    fetch(`${BASE_URL}/gamificacao/${g.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

export async function adminCreateGamificacao(userId) {
  const res = await fetch(`${BASE_URL}/gamificacao`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId: String(userId), pontos: 0, nivel: 1, conquistas: [] })
  });
  return res.ok ? res.json() : null;
}

export async function adminPatchGamificacao(gamId, dados) {
  const res = await fetch(`${BASE_URL}/gamificacao/${gamId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
  return res.ok;
}

export async function updatePassword(novaPassword) {
  const sessao = JSON.parse(localStorage.getItem('mindnest_sessao'));
  if (!sessao?.token) return false;
  try {
    const payload = JSON.parse(atob(sessao.token.split('.')[1]));
    const res = await fetch(`${BASE_URL}/users/${payload.sub}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ password: novaPassword })
    });
    return res.ok;
  } catch { return false; }
}

export async function adminToggleRole(perfilId, novoRole) {
  const res = await fetch(`${BASE_URL}/perfis/${perfilId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role: novoRole })
  });
  return res.ok;
}
