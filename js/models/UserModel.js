// Model do perfil do utilizador.
// Encapsula os dados pessoais, preferências e favoritos.
// Os campos privados garantem que os dados só são alterados através dos métodos da classe.
import GamificacaoModel from './GamificacaoModel.js';
import { getPerfil, savePerfil } from '../services/service.js';

class UserModel {
  #id;             // ID único gerado localmente ou vindo do servidor
  #exists;         // true se o perfil já foi persistido na API
  nome;            // Nome visível do utilizador
  email;           // Email do utilizador
  #role;           // Papel na aplicação: 'user' ou 'admin' — leitura externa via getter
  perfilDominante; // Perfil psicológico dominante (ex: 'ansiedade', 'foco')
  #preferencias;   // Objeto com preferências: horário, duração, objetivo, notificações, scores
  #favoritos;      // Array com IDs das sessões marcadas como favoritas

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

  // Getters que expõem cópias dos campos privados (imutáveis do exterior)
  get id()           { return this.#id; }
  get role()         { return this.#role; }
  get preferencias() { return { ...this.#preferencias }; }
  get favoritos()    { return [...this.#favoritos]; }

  // Persiste o perfil na API (PUT se já existir, POST se for novo)
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

  // Carrega o perfil do utilizador autenticado a partir da API e devolve uma instância de UserModel
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

  // Adiciona uma sessão aos favoritos se ainda não estiver na lista e guarda
  async addFavorito(sessaoId) {
    if (!this.#favoritos.includes(sessaoId)) {
      this.#favoritos.push(sessaoId);
      await this.save();
    }
  }

  // Remove uma sessão dos favoritos e guarda
  async removeFavorito(sessaoId) {
    this.#favoritos = this.#favoritos.filter(id => id !== sessaoId);
    await this.save();
  }

  // Devolve os dados de gamificação do utilizador através do GamificacaoModel
  async getGamificacao() {
    return GamificacaoModel.load();
  }

  // Substitui as preferências do utilizador pelo novo objeto e guarda
  async updatePreferencias(prefs) {
    this.#preferencias = prefs;
    await this.save();
  }
}

export default UserModel;
