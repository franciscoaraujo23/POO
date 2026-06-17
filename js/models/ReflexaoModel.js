// Model das reflexões escritas pelo utilizador.
// Estende EntradaModel para herdar ID e data automáticos.
// Suporta três modos de escrita: 'estoico', 'livre' e 'gratidao'.
import EntradaModel from './entradaModel.js';
import { getReflexoes, saveReflexao, updateReflexao, deleteReflexao } from '../services/service.js';

class ReflexaoModel extends EntradaModel {
  modo;   // Tipo de reflexão: 'estoico', 'livre' ou 'gratidao'
  campos; // Objeto com os campos preenchidos (varia conforme o modo)

  constructor(modo, campos) {
    super(); // Gera ID e data automáticos via EntradaModel
    this.modo   = modo;
    this.campos = campos;
  }

  // Guarda a reflexão na API com todos os seus campos
  async save() {
    await saveReflexao({
      id:     this.id,
      data:   this.data,
      modo:   this.modo,
      campos: this.campos
    });
  }

  // Reconstrói uma instância de ReflexaoModel a partir de dados em bruto da API
  static fromObject(dados) {
    const r = new ReflexaoModel(dados.modo, dados.campos);
    r._restore(dados.id, dados.data); // Restaura ID e data originais
    return r;
  }

  // Obtém todas as reflexões do utilizador autenticado como instâncias de ReflexaoModel
  static async getAll() {
    const lista = await getReflexoes();
    return lista.map(ReflexaoModel.fromObject);
  }

  // Atualiza os campos de uma reflexão existente (ex: edição do livro)
  static async update(entrada) {
    await updateReflexao(entrada.id, { campos: entrada.campos });
  }

  // Elimina uma reflexão pelo seu ID
  static async delete(id) {
    await deleteReflexao(id);
  }
}

export default ReflexaoModel;
