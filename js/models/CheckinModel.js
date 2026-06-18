// Herda de EntradaModel (herança)
import EntradaModel from './entradaModel.js';
import GamificacaoModel from './GamificacaoModel.js';
import { getCheckins, saveCheckin, updateCheckin } from '../services/service.js';

class CheckinModel extends EntradaModel {
  // campos públicos
  emocao;
  intensidade;
  peso;
  sono;
  nota;

  // campo estático privado — mapa emoção → categoria sugerida
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

  // super() chama o construtor do EntradaModel para gerar ID e data
  constructor(emocao, intensidade, peso, sono, nota = "") {
    super();
    this.emocao      = emocao;
    this.intensidade = intensidade;
    this.peso        = peso;
    this.sono        = sono;
    this.nota        = nota;
  }

  // guarda na API e atualiza gamificação
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

    // Promise.all — busca os dois ao mesmo tempo
    const [gamificacao, listaCheckins] = await Promise.all([
      GamificacaoModel.load(),
      getCheckins()
    ]);
    await gamificacao.addPontos(10);
    return gamificacao.verificarConquistas({ checkins: listaCheckins.length });
  }

  // reconstrói instância a partir de dados da API (usa _restore do EntradaModel)
  static fromObject(dados) {
    const ci = new CheckinModel(dados.emocao, dados.intensidade, dados.peso, dados.sono, dados.nota || '');
    ci._restore(dados.id, dados.data);
    return ci;
  }

  // vai buscar todos os checkins do utilizador
  static async getAll() {
    const lista = await getCheckins();
    return lista.map(CheckinModel.fromObject);
  }

  // atualiza checkin existente (edição do dia)
  static async update(id, dados) {
    await updateCheckin(id, dados);
  }

  // devolve o checkin mais recente
  static async getUltimo() {
    const lista = await CheckinModel.getAll();
    if (!lista.length) return null;
    return lista.sort((a, b) => new Date(a.data) - new Date(b.data)).at(-1);
  }

  // devolve categoria sugerida para uma emoção
  static getSugestao(emocao) {
    return CheckinModel.#sugestoes[emocao] || "respiracao";
  }
}

export default CheckinModel;
