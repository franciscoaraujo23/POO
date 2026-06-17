// Model de gamificação do utilizador.
// Gere pontos, nível e conquistas desbloqueadas.
// Os dados são persistidos na API através do service.js.
import { getGamificacao, saveGamificacao } from '../services/service.js';

class GamificacaoModel {
  #serverId;      // ID do registo na API (null se ainda não foi persistido)
  #pontos;        // Total de pontos acumulados pelo utilizador
  #nivel;         // Nível atual calculado a partir dos pontos
  #conquistas;    // Array com os IDs das conquistas já desbloqueadas

  // Catálogo de conquistas disponíveis com as condições para as desbloquear.
  // ctx é opcional — condições que dependem de dados externos usam ?? -1/false como fallback seguro.
  static #conquistasDisponiveis = [
    { id: "1passo",          nome: "Primeiro Passo",       condicao: (g, ctx) => (ctx.checkins  ?? -1) >= 1   },
    { id: "10checkins",      nome: "10 Check-ins",         condicao: (g, ctx) => (ctx.checkins  ?? -1) >= 10  },
    { id: "10sessoes",       nome: "10 Sessões",           condicao: (g, ctx) => (ctx.sessoes   ?? -1) >= 10  },
    { id: "100sessoes",      nome: "100 Sessões",          condicao: (g, ctx) => (ctx.sessoes   ?? -1) >= 100 },
    { id: "5nivel",          nome: "Nível 5",              condicao: (g, ctx) => g.nivel >= 5                  },
    { id: "Autoconhecimento",nome: "Autoconhecimento",     condicao: (g, ctx) => ctx.temPerfil === true        },
    { id: "Escritor",        nome: "Escritor",             condicao: (g, ctx) => (ctx.reflexoes ?? -1) >= 1   },
    { id: "MestreCaminhos",  nome: "Mestre dos Caminhos", condicao: (g, ctx) => (ctx.caminhosConcluidos ?? -1) >= 3 },
    { id: "VozInterior",     nome: "Voz Interior",        condicao: (g, ctx) => (ctx.reflexoes ?? -1) >= 10  },
  ];

  constructor() {
    this.#serverId       = null;
    this.#pontos         = 0;
    this.#nivel          = 1;
    this.#conquistas     = [];
  }

  // Getters de leitura para os campos privados
  get pontos()     { return this.#pontos; }
  get nivel()      { return this.#nivel; }
  get conquistas() { return this.#conquistas; }

  // Persiste os dados de gamificação na API
  async save() {
    const dados = {
      pontos:     this.#pontos,
      nivel:      this.#nivel,
      conquistas: this.#conquistas
    };
    this.#serverId = await saveGamificacao(this.#serverId, dados);
  }

  // Carrega os dados de gamificação da API e devolve uma instância de GamificacaoModel
  static async load() {
    const dados = await getGamificacao();
    const perfil = new GamificacaoModel();

    if (dados) {
      perfil.#serverId   = dados.id;
      perfil.#pontos     = dados.pontos;
      perfil.#nivel      = dados.nivel;
      perfil.#conquistas = dados.conquistas;
    }

    return perfil;
  }

  // Adiciona pontos ao total, recalcula o nível e guarda
  async addPontos(valor) {
    this.#pontos += valor;
    this.#nivel = this.calcularNivel();
    await this.save();
  }

  // Calcula o nível com base nos pontos: 1 nível por cada 100 pontos acumulados
  calcularNivel() {
    return 1 + Math.floor(this.#pontos / 100);
  }

  // Verifica se alguma conquista nova foi desbloqueada e guarda se houver.
  // ctx é opcional — cada conquista trata a ausência de chaves graciosamente.
  // Devolve a lista de conquistas recém-desbloqueadas
  async verificarConquistas(ctx = {}) {
    const novas = GamificacaoModel.#conquistasDisponiveis.filter(c =>
      !this.#conquistas.includes(c.id) && c.condicao(this, ctx)
    );

    if (novas.length) {
      this.#conquistas.push(...novas.map(c => c.id));
      await this.save();
    }

    return novas;
  }
}

export default GamificacaoModel;
