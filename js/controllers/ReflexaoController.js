// Controlador da página de reflexões.
// Gere os três modos de escrita (estoico, livre, gratidão), a lista de entradas
// e o livro interativo com animação de virar páginas.
import ReflexaoModel from '../models/ReflexaoModel.js';
import GamificacaoModel from '../models/GamificacaoModel.js';
import { enfileirarNotificacao } from '../utils/notificacao.js';
import {
  mostrarPromptDoDia, mostrarModo, lerCampos, limparCampos,
  mostrarMensagemGuardada, renderEntradas, inicializarLivro,
  bindModo, bindGuardar, bindLimpar, bindEntradas
} from '../views/ReflexaoView.js';

// Modo de escrita atualmente ativo ('estoico' por defeito)
let modoAtivo = 'estoico';

// Carrega e renderiza as entradas filtradas pelo modo ativo
async function renderListaReflexoes() {
  const todas = await ReflexaoModel.getAll();
  renderEntradas(todas.filter(e => e.modo === modoAtivo));
}

document.addEventListener('DOMContentLoaded', async () => {
  // Mostra o prompt rotativo do dia (muda com base na data)
  mostrarPromptDoDia();
  await renderListaReflexoes();

  // Carrega as entradas do modo 'livre' para o livro interativo
  const entradas = (await ReflexaoModel.getAll())
    .filter(e => e.modo === 'livre')
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  // Verifica se já existe uma entrada de hoje para o livro (para atualizar em vez de criar)
  const hoje = new Date().toDateString();
  const entradaHoje = entradas.find(e => new Date(e.data).toDateString() === hoje);

  // Inicializa o livro interativo com as entradas e o callback de guardar
  inicializarLivro(entradas, async texto => {
    if (entradaHoje) {
      // Atualiza o texto da entrada de hoje
      entradaHoje.campos.texto = texto;
      await ReflexaoModel.update(entradaHoje);
    } else {
      // Cria uma nova entrada livre para hoje
      await new ReflexaoModel('livre', { texto }).save();
    }
    await renderListaReflexoes();
  });

  // Liga os cards de modo — muda o modo ativo e atualiza a lista de entradas
  bindModo(async modo => {
    modoAtivo = modo;
    mostrarModo(modo);
    await renderListaReflexoes();
  });

  // Liga os botões de guardar — valida que há conteúdo e guarda a reflexão
  bindGuardar(async modo => {
    const campos = lerCampos(modo);
    const temConteudo =
      (modo === 'estoico'  && campos.problema) ||
      (modo === 'livre'    && campos.texto) ||
      (modo === 'gratidao' && (campos.g1 || campos.g2 || campos.g3));
    if (!temConteudo) return; // Não guarda se não houver conteúdo
    await new ReflexaoModel(modo, campos).save();
    mostrarMensagemGuardada(modo);
    await renderListaReflexoes();

    // Verifica conquistas relacionadas com reflexões (Escritor, VozInterior)
    const [gam, todasReflexoes] = await Promise.all([
      GamificacaoModel.load(),
      ReflexaoModel.getAll()
    ]);
    const novas = await gam.verificarConquistas({ reflexoes: todasReflexoes.length });
    novas.forEach(c => enfileirarNotificacao(`Conquista desbloqueada: ${c.nome} 🏆`, 'conquista'));
  });

  // Liga os botões de limpar — apaga os campos do modo sem guardar
  bindLimpar(modo => limparCampos(modo));

  // Liga os eventos da lista de entradas: expandir/colapsar e eliminar
  bindEntradas(
    header => header.closest('.entrada-card').classList.toggle('open'),
    async id => { await ReflexaoModel.delete(id); await renderListaReflexoes(); }
  );
});
