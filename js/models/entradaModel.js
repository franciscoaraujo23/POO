// Classe base — extendida por CheckinModel e ReflexaoModel
class EntradaModel {
  #id;   // campo privado
  #data; // campo privado

  constructor() {
    this.#id   = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this.#data = new Date().toISOString();
  }

  // getters
  get id()   { return this.#id; }
  get data() { return this.#data; }

  // reconstrói objeto vindo da API sem gerar ID novo
  _restore(id, data) {
    this.#id   = id;
    this.#data = data;
  }
}

export default EntradaModel;
