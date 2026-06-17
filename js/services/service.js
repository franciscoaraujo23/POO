// Camada de acesso à API (json-server-auth).
// Todas as comunicações com o servidor passam por este ficheiro.
// Utiliza fetch com autenticação via JWT guardado no localStorage.

const BASE_URL = 'http://localhost:3000';

// Constrói os headers de autenticação com o token JWT da sessão ativa
function authHeaders() {
  const sessao = JSON.parse(localStorage.getItem('mindnest_sessao'));
  return {
    'Content-Type': 'application/json',
    'Authorization': sessao ? `Bearer ${sessao.token}` : ''
  };
}

// Extrai o ID do utilizador a partir do payload do JWT guardado na sessão
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

// Regista um novo utilizador na API e devolve o token de acesso
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

// Autentica um utilizador existente e devolve o token de acesso
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

// Obtém o perfil do utilizador autenticado
export async function getPerfil() {
  const res = await fetch(`${BASE_URL}/perfis?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return null;
  const lista = await res.json();
  return lista[0] || null;
}

// Guarda ou atualiza o perfil do utilizador (PUT se já existir, POST se for novo)
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

// Obtém todos os check-ins do utilizador autenticado
export async function getCheckins() {
  const res = await fetch(`${BASE_URL}/checkins?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

// Guarda um novo check-in na API
export async function saveCheckin(dados) {
  await fetch(`${BASE_URL}/checkins`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
}

// Obtém todas as reflexões do utilizador autenticado
export async function getReflexoes() {
  const res = await fetch(`${BASE_URL}/reflexoes?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

// Guarda uma nova reflexão na API
export async function saveReflexao(dados) {
  await fetch(`${BASE_URL}/reflexoes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
}

// Atualiza uma reflexão existente (PATCH parcial)
export async function updateReflexao(id, dados) {
  await fetch(`${BASE_URL}/reflexoes/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
}

// Atualiza um check-in existente (PATCH parcial)
export async function updateCheckin(id, dados) {
  await fetch(`${BASE_URL}/checkins/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
}

// Elimina uma reflexão pelo seu ID
export async function deleteReflexao(id) {
  await fetch(`${BASE_URL}/reflexoes/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
}

// Obtém todas as sessões concluídas pelo utilizador autenticado
export async function getSessoesConcluidas() {
  const res = await fetch(`${BASE_URL}/sessoes_concluidas?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

// Regista uma sessão como concluída pelo utilizador autenticado
export async function saveSessaoConcluida(dados) {
  await fetch(`${BASE_URL}/sessoes_concluidas`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...dados, userId: getUserId() })
  });
}

// Obtém os dados de gamificação do utilizador autenticado
export async function getGamificacao() {
  const res = await fetch(`${BASE_URL}/gamificacao?userId=${getUserId()}`, { headers: authHeaders() });
  if (!res.ok) return null;
  const lista = await res.json();
  return lista[0] || null;
}

// Guarda ou atualiza os dados de gamificação (PUT se já existir, POST se for novo)
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

// Obtém todas as frases motivacionais da API
export async function getFrases() {
  const res = await fetch(`${BASE_URL}/frases`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// Obtém o catálogo completo de sessões disponíveis
export async function getSessoesCatalogo() {
  const res = await fetch(`${BASE_URL}/sessoes`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// Atualiza o agregado de rating de uma sessão no catálogo (ratingTotal + ratingCount)
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

// [ADMIN] Cria uma nova sessão no catálogo
export async function adminCreateSessao(dados) {
  const res = await fetch(`${BASE_URL}/sessoes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
  return res.ok ? res.json() : null;
}

// [ADMIN] Atualiza uma sessão existente no catálogo
export async function adminUpdateSessao(id, dados) {
  const res = await fetch(`${BASE_URL}/sessoes/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
  return res.ok;
}

// [ADMIN] Elimina uma sessão do catálogo pelo ID
export async function adminDeleteSessao(id) {
  const res = await fetch(`${BASE_URL}/sessoes/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return res.ok;
}

// [ADMIN] Obtém todos os perfis de utilizadores registados
export async function adminGetPerfis() {
  const res = await fetch(`${BASE_URL}/perfis`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// [ADMIN] Obtém todos os check-ins de todos os utilizadores
export async function adminGetCheckins() {
  const res = await fetch(`${BASE_URL}/checkins`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// [ADMIN] Obtém todas as sessões concluídas de todos os utilizadores
export async function adminGetSessoesConcluidas() {
  const res = await fetch(`${BASE_URL}/sessoes_concluidas`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// [ADMIN] Obtém todas as reflexões de todos os utilizadores
export async function adminGetReflexoes() {
  const res = await fetch(`${BASE_URL}/reflexoes`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// [ADMIN] Obtém todos os registos de gamificação de todos os utilizadores
export async function adminGetGamificacao() {
  const res = await fetch(`${BASE_URL}/gamificacao`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
}

// [ADMIN] Elimina o perfil de um utilizador pelo ID do perfil
export async function adminDeletePerfil(id) {
  const res = await fetch(`${BASE_URL}/perfis/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.ok;
}

// [ADMIN] Elimina todos os check-ins de um utilizador específico
export async function adminDeleteCheckinsByUser(userId) {
  const res = await fetch(`${BASE_URL}/checkins?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(c =>
    fetch(`${BASE_URL}/checkins/${c.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

// [ADMIN] Elimina todas as reflexões de um utilizador específico
export async function adminDeleteReflexoesByUser(userId) {
  const res = await fetch(`${BASE_URL}/reflexoes?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(r =>
    fetch(`${BASE_URL}/reflexoes/${r.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

// [ADMIN] Elimina todas as sessões concluídas de um utilizador específico
export async function adminDeleteSessoesByUser(userId) {
  const res = await fetch(`${BASE_URL}/sessoes_concluidas?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(s =>
    fetch(`${BASE_URL}/sessoes_concluidas/${s.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

// [ADMIN] Elimina o registo de gamificação de um utilizador específico
export async function adminDeleteGamificacaoByUser(userId) {
  const res = await fetch(`${BASE_URL}/gamificacao?userId=${userId}`, { headers: authHeaders() });
  const lista = res.ok ? await res.json() : [];
  await Promise.all(lista.map(g =>
    fetch(`${BASE_URL}/gamificacao/${g.id}`, { method: 'DELETE', headers: authHeaders() })
  ));
}

// [ADMIN] Cria um registo de gamificação inicial para um utilizador
export async function adminCreateGamificacao(userId) {
  const res = await fetch(`${BASE_URL}/gamificacao`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId: String(userId), pontos: 0, nivel: 1, conquistas: [] })
  });
  return res.ok ? res.json() : null;
}

// [ADMIN] Atualiza parcialmente os dados de gamificação de um utilizador (ex: pontos, nivel)
export async function adminPatchGamificacao(gamId, dados) {
  const res = await fetch(`${BASE_URL}/gamificacao/${gamId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dados)
  });
  return res.ok;
}

// Atualiza a password do utilizador autenticado via PATCH /users/:id
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

// [ADMIN] Altera o role (papel) de um utilizador (ex: 'user' para 'admin')
export async function adminToggleRole(perfilId, novoRole) {
  const res = await fetch(`${BASE_URL}/perfis/${perfilId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role: novoRole })
  });
  return res.ok;
}
