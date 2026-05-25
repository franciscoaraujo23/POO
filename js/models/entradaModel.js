class EntradaModel {
  #id;
  #data;

  constructor() {
    this.#id   = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this.#data = new Date().toISOString();
  }

  get id()   { return this.#id; }
  get data() { return this.#data; }

  
  save(chave, extraDados = {}) {
    const lista = JSON.parse(localStorage.getItem(chave) || "[]");
    lista.push({ id: this.#id, data: this.#data, ...extraDados});
    localStorage.setItem(chave, JSON.stringify(lista));
  } 

  static getAll(chave) {
    return JSON.parse(localStorage.getItem(chave) || "[]");
  }
}
