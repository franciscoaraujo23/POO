// Model das sessões de bem-estar (meditação, respiração, foco, etc.).
// Contém o catálogo de sessões embutido e métodos de filtragem.
// Também gere as frases motivacionais exibidas na aplicação.
import { getSessoesCatalogo, getSessoesConcluidas, saveSessaoConcluida, getFrases, patchSessaoRating } from '../services/service.js';

class SessaoModel {
  #id;        // ID único da sessão
  titulo;
  categoria;
  duracao;
  descricao;
  nivel;
  tipo;
  #avaliacao; // Avaliação de 0 a 5 estrelas — validada pelo setter
  url;
  caminho;    // Caminho filosófico associado (ex: 'mindfulness', 'estoicismo', 'taoismo')


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

  get id()         { return this.#id; }
  get avaliacao()  { return this.#avaliacao; }
  // Setter com validação: só aceita avaliações entre 0 e 5
  set avaliacao(v) { if (v >= 0 && v <= 5) this.#avaliacao = v; }

  // Regista a sessão como concluída e atualiza o agregado de rating global no catálogo.
  // Ambas as operações correm em paralelo para sobreviver a recargas do Live Server.
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

  // Obtém o catálogo completo de sessões da API
  static async getAll() {
    return getSessoesCatalogo();
  }

  // Obtém uma sessão específica pelo seu ID como instância de SessaoModel
  static async getById(id) {
    const lista = await getSessoesCatalogo();
    const s = lista.find(s => s.id === Number(id));
    if (!s) return null;
    return new SessaoModel(s.id, s.titulo, s.categoria, s.duracao, s.descricao, s.nivel, s.tipo, s.avaliacao, s.url, s.caminho);
  }

  // Obtém todas as sessões de uma categoria específica (ex: 'meditacao')
  static async getByCategoria(categoria) {
    const lista = await getSessoesCatalogo();
    return lista.filter(s => s.categoria === categoria);
  }

  // Obtém todas as sessões associadas a um caminho filosófico (ex: 'taoismo')
  static async getByCaminho(caminho) {
    const lista = await getSessoesCatalogo();
    return lista.filter(s => s.caminho === caminho);
  }

  // Filtra sessões por categoria, duração (curta/media/longa), texto de pesquisa ou caminho
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

  // Obtém todas as sessões já concluídas pelo utilizador autenticado
  static async getConcluidas() {
    return getSessoesConcluidas();
  }

  // Obtém uma frase motivacional aleatória da API; fallback hardcoded se a API falhar
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
