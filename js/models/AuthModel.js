// Gere autenticação — login, registo, sessão
import { register, login } from '../services/service.js';

class AuthModel {
  email;
  #password; // campo privado

  constructor(email, password) {
    this.email     = email;
    this.#password = password;
  }

  // regista novo utilizador e guarda token no localStorage
  async register() {
    const resultado = await register(this.email, this.#password);
    if (!resultado.ok) return false;
    localStorage.setItem('mindnest_sessao', JSON.stringify({ email: this.email, token: resultado.token }));
    return true;
  }

  // autentica utilizador e guarda token no localStorage
  static async login(email, password) {
    const resultado = await login(email, password);
    if (!resultado.ok) return false;
    localStorage.setItem('mindnest_sessao', JSON.stringify({ email, token: resultado.token }));
    return true;
  }

  // remove sessão do localStorage — limpa também notificações
  static logout() {
    localStorage.removeItem('mindnest_sessao');
    localStorage.removeItem('mindnest_notif_historico');
    localStorage.removeItem('mindnest_notif_unread');
    localStorage.removeItem('mindnest_notif_pending');
  }

  // verifica se há sessão ativa
  static isLogged() {
    return localStorage.getItem('mindnest_sessao') !== null;
  }

  // devolve email e token da sessão atual
  static getUserLogged() {
    return JSON.parse(localStorage.getItem('mindnest_sessao'));
  }

  // setter com validação — só aceita passwords com 8+ caracteres
  set password(v) {
    if (v.length < 8) return;
    this.#password = v;
  }
}

export default AuthModel;
