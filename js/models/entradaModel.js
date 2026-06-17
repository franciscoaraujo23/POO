// Model base para entradas com data e ID único.
// É estendido por CheckinModel e ReflexaoModel para partilhar a lógica de identificação.
class EntradaModel {
  #id;   // ID único gerado automaticamente no momento da criação
  #data; // Data e hora ISO da criação da entrada

  constructor() {
    // Gera um ID único combinando timestamp e valor aleatório em base36
    this.#id   = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this.#data = new Date().toISOString();
  }

  // Getters de leitura para os campos privados
  get id()   { return this.#id; }
  get data() { return this.#data; }

  // Restaura o ID e a data de uma entrada existente carregada da API
  // Usado pelas subclasses ao reconstruir objetos a partir dos dados do servidor
  _restore(id, data) {
    this.#id   = id;
    this.#data = data;
  }
}

export default EntradaModel;
