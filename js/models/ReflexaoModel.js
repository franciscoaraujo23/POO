// Herda de EntradaModel (herança) — suporta 3 modos: 'estoico', 'livre', 'gratidao'
import EntradaModel from './entradaModel.js';
import { getReflexoes, saveReflexao, updateReflexao, deleteReflexao } from '../services/service.js';

class ReflexaoModel extends EntradaModel {
  // campos públicos
  modo;
  campos;

  // super() chama o construtor do EntradaModel para gerar ID e data
  constructor(modo, campos) {
    super();
    this.modo   = modo;
    this.campos = campos;
  }

  // guarda a reflexão na API
  async save() {
    await saveReflexao({
      id:     this.id,
      data:   this.data,
      modo:   this.modo,
      campos: this.campos
    });
  }

  // reconstrói instância a partir de dados da API (usa _restore do EntradaModel)
  static fromObject(dados) {
    const r = new ReflexaoModel(dados.modo, dados.campos);
    r._restore(dados.id, dados.data);
    return r;
  }

  // vai buscar todas as reflexões do utilizador
  static async getAll() {
    const lista = await getReflexoes();
    return lista.map(ReflexaoModel.fromObject);
  }

  // atualiza campos de uma reflexão existente
  static async update(entrada) {
    await updateReflexao(entrada.id, { campos: entrada.campos });
  }

  // elimina uma reflexão pelo ID
  static async delete(id) {
    await deleteReflexao(id);
  }
}

export default ReflexaoModel;
