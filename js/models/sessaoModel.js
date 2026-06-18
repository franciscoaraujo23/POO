// Gere as sessões de bem-estar e o catálogo
import { getSessoesCatalogo, getSessoesConcluidas, saveSessaoConcluida, getFrases, patchSessaoRating } from '../services/service.js';

class SessaoModel {
  // campos privados
  #id;
  #avaliacao; // validada pelo setter — só aceita 0 a 5

  // campos públicos
  titulo;
  categoria;
  duracao;
  descricao;
  nivel;
  tipo;
  url;
  caminho;

  constructor(id, titulo, categoria, duracao, descricao, nivel, tipo, avaliacao, url, caminho) {
    this.#id        = id;
    this.titulo     = titulo;
    this.categoria  = categoria;
    this.duracao    = duracao;
    this.descricao  = descricao;
    this.nivel      = nivel;
    this.tipo       = tipo;
    this.#avaliacao = avaliacao;
    this.url        = url;
    this.caminho    = caminho;
  }

  // getters e setter com validação
  get id()         { return this.#id; }
  get avaliacao()  { return this.#avaliacao; }
  set avaliacao(v) { if (v >= 0 && v <= 5) this.#avaliacao = v; }

  // regista sessão como concluída e atualiza rating global
  async save() {
    const ops = [
      saveSessaoConcluida({
        sessaoId:  this.#id,
        titulo:    this.titulo,
        categoria: this.categoria,
        duracao:   this.duracao,
        avaliacao: this.#avaliacao,
        data:      new Date().toISOString()
      })
    ];
    if (this.#avaliacao > 0) {
      ops.push(patchSessaoRating(this.#id, this.#avaliacao));
    }
    await Promise.all(ops);
  }

  // vai buscar o catálogo completo
  static async getAll() {
    return getSessoesCatalogo();
  }

  // vai buscar uma sessão pelo ID e devolve instância de SessaoModel
  static async getById(id) {
    const lista = await getSessoesCatalogo();
    const s = lista.find(s => s.id === Number(id));
    if (!s) return null;
    return new SessaoModel(s.id, s.titulo, s.categoria, s.duracao, s.descricao, s.nivel, s.tipo, s.avaliacao, s.url, s.caminho);
  }

  // filtra sessões por categoria
  static async getByCategoria(categoria) {
    const lista = await getSessoesCatalogo();
    return lista.filter(s => s.categoria === categoria);
  }

  // filtra sessões por caminho filosófico
  static async getByCaminho(caminho) {
    const lista = await getSessoesCatalogo();
    return lista.filter(s => s.caminho === caminho);
  }

  // filtra por categoria, duração, pesquisa ou caminho
  static async filtrar({ categoria, duracao, query, caminho } = {}) {
    const lista = await getSessoesCatalogo();
    return lista.filter(s => {
      if (categoria && s.categoria !== categoria) return false;
      if (caminho   && s.caminho   !== caminho)   return false;
      if (query     && !s.titulo.toLowerCase().includes(query.toLowerCase())) return false;
      if (duracao === "curta" && s.duracao > 10)                       return false;
      if (duracao === "media" && (s.duracao <= 10 || s.duracao > 20))  return false;
      if (duracao === "longa" && s.duracao <= 20)                      return false;
      return true;
    });
  }

  // vai buscar sessões concluídas pelo utilizador
  static async getConcluidas() {
    return getSessoesConcluidas();
  }

  // devolve frase motivacional aleatória
  static async getFraseAleatoria() {
    const frases = await getFrases();
    if (!frases.length) return {
      frase: 'A mente é um excelente instrumento se for bem usada. Usada de forma errada, torna-se destrutiva.',
      autor: 'Eckhart Tolle'
    };
    return frases[Math.floor(Math.random() * frases.length)];
  }
}

export default SessaoModel;
