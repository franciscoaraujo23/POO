// Gere o perfil do utilizador
import GamificacaoModel from './GamificacaoModel.js';
import { getPerfil, savePerfil } from '../services/service.js';

class UserModel {
  // campos privados
  #id;
  #exists;
  #role;
  #preferencias;
  #favoritos;

  // campos públicos
  nome;
  email;
  perfilDominante;

  constructor(nome, email) {
    this.#id             = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this.#exists         = false;
    this.nome            = nome;
    this.email           = email;
    this.#role           = null;
    this.perfilDominante = null;
    this.#preferencias   = {};
    this.#favoritos      = [];
  }

  // getters — cópias defensivas nos arrays e objetos para proteger os campos privados
  get id()           { return this.#id; }
  get role()         { return this.#role; }
  get preferencias() { return { ...this.#preferencias }; }
  get favoritos()    { return [...this.#favoritos]; }

  // guarda perfil na API (PUT se já existe, POST se é novo)
  async save() {
    const dados = {
      id:              this.#id,
      nome:            this.nome,
      email:           this.email,
      role:            this.#role,
      perfilDominante: this.perfilDominante,
      preferencias:    this.#preferencias,
      favoritos:       this.#favoritos
    };
    await savePerfil(this.#exists ? this.#id : null, dados);
    this.#exists = true;
  }

  // carrega perfil da API e devolve instância de UserModel
  static async get() {
    const dados = await getPerfil();
    if (!dados) return null;

    const utilizador = new UserModel(dados.nome, dados.email);
    utilizador.#id              = dados.id;
    utilizador.#exists          = true;
    utilizador.#role            = dados.role || null;
    utilizador.perfilDominante  = dados.perfilDominante;
    utilizador.#preferencias    = dados.preferencias  || {};
    utilizador.#favoritos       = dados.favoritos     || [];

    return utilizador;
  }

  // adiciona sessão aos favoritos e guarda
  async addFavorito(sessaoId) {
    if (!this.#favoritos.includes(sessaoId)) {
      this.#favoritos.push(sessaoId);
      await this.save();
    }
  }

  // remove sessão dos favoritos e guarda
  async removeFavorito(sessaoId) {
    this.#favoritos = this.#favoritos.filter(id => id !== sessaoId);
    await this.save();
  }

  // devolve dados de gamificação do utilizador
  async getGamificacao() {
    return GamificacaoModel.load();
  }

  // substitui preferências e guarda
  async updatePreferencias(prefs) {
    this.#preferencias = prefs;
    await this.save();
  }
}

export default UserModel;
