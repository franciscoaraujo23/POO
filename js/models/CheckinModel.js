// Model do check-in diário de bem-estar.
// Estende EntradaModel para herdar ID e data automáticos.
// Ao guardar, atualiza automaticamente os pontos do utilizador.
import EntradaModel from './entradaModel.js';
import GamificacaoModel from './GamificacaoModel.js';
import { getCheckins, saveCheckin, updateCheckin } from '../services/service.js';

class CheckinModel extends EntradaModel {
  emocao;      // Emoção registada (ex: 'calmo', 'ansioso')
  intensidade; // Intensidade de 1 a 5
  peso;        // Sensação de peso mental (ex: 'Leve', 'Pesado')
  sono;        // Qualidade do sono (ex: 'Bem', 'Mal')
  nota;        // Nota livre opcional do utilizador

  // Mapa privado que associa cada emoção a uma categoria de sessão sugerida
  static #sugestoes = {
    calmo:     "meditacao",
    pensativo: "meditacao",
    cansado:   "sono",
    focado:    "foco",
    triste:    "meditacao",
    ansioso:   "ansiedade",
    confuso:   "respiracao",
    grato:     "meditacao"
  };

  constructor(emocao, intensidade, peso, sono, nota = "") {
    super(); // Gera ID e data automáticos via EntradaModel
    this.emocao      = emocao;
    this.intensidade = intensidade;
    this.peso        = peso;
    this.sono        = sono;
    this.nota        = nota;
  }

  // Guarda o check-in na API e atualiza pontos e conquistas do utilizador
  async save() {
    await saveCheckin({
      id:          this.id,
      data:        this.data,
      emocao:      this.emocao,
      intensidade: this.intensidade,
      peso:        this.peso,
      sono:        this.sono,
      nota:        this.nota
    });

    // Atualiza a gamificação após cada check-in guardado e devolve conquistas novas.
    // Busca o total de check-ins (inclui o que acabou de ser guardado) para verificar conquistas.
    const [gamificacao, listaCheckins] = await Promise.all([
      GamificacaoModel.load(),
      getCheckins()
    ]);
    await gamificacao.addPontos(10);
    return gamificacao.verificarConquistas({ checkins: listaCheckins.length });
  }

  // Reconstrói uma instância de CheckinModel a partir de dados em bruto da API
  static fromObject(dados) {
    const ci = new CheckinModel(dados.emocao, dados.intensidade, dados.peso, dados.sono, dados.nota || '');
    ci._restore(dados.id, dados.data); // Restaura ID e data originais
    return ci;
  }

  // Obtém todos os check-ins do utilizador autenticado como instâncias de CheckinModel
  static async getAll() {
    const lista = await getCheckins();
    return lista.map(CheckinModel.fromObject);
  }

  // Atualiza um check-in existente com novos dados (edição do dia)
  static async update(id, dados) {
    await updateCheckin(id, dados);
  }

  // Devolve o check-in mais recente do utilizador
  static async getUltimo() {
    const lista = await CheckinModel.getAll();
    if (!lista.length) return null;
    return lista.sort((a, b) => new Date(a.data) - new Date(b.data)).at(-1);
  }

  // Devolve a categoria de sessão recomendada para uma dada emoção
  static getSugestao(emocao) {
    return CheckinModel.#sugestoes[emocao] || "respiracao";
  }
}

export default CheckinModel;
