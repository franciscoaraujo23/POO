// Model de autenticação.
// Responsável por registar utilizadores, fazer login/logout e verificar o estado da sessão.
// A password é armazenada como campo privado (#password) para encapsulamento.
import { register, login } from '../services/service.js';

class AuthModel {
  email;     // Email público do utilizador
  #password; // Password em campo privado — não acessível fora da classe

  constructor(email, password) {
    this.email     = email;
    this.#password = password;
  }

  // Regista um novo utilizador na API e guarda o token JWT no localStorage
  async register() {
    const resultado = await register(this.email, this.#password);
    if (!resultado.ok) return false;
    localStorage.setItem('mindnest_sessao', JSON.stringify({ email: this.email, token: resultado.token }));
    return true;
  }

  // Autentica um utilizador existente e guarda o token JWT no localStorage
  static async login(email, password) {
    const resultado = await login(email, password);
    if (!resultado.ok) return false;
    localStorage.setItem('mindnest_sessao', JSON.stringify({ email, token: resultado.token }));
    return true;
  }

  // Remove a sessão do localStorage (termina a sessão do utilizador)
  static logout() {
    localStorage.removeItem('mindnest_sessao');
  }

  // Verifica se existe uma sessão ativa no localStorage
  static isLogged() {
    return localStorage.getItem('mindnest_sessao') !== null;
  }

  // Devolve os dados da sessão guardada (email e token) ou null se não houver sessão
  static getUserLogged() {
    return JSON.parse(localStorage.getItem('mindnest_sessao'));
  }

  // Setter com validação: só aceita passwords com 8 ou mais caracteres
  set password(v) {
    if (v.length < 8) return;
    this.#password = v;
  }
}

export default AuthModel;
