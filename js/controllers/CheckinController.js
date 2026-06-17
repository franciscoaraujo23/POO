// Controlador do check-in diário de bem-estar.
// Gere o fluxo de 4 passos (emoção, intensidade, contexto, nota) e a conclusão.
// Se já existir um check-in para hoje, permite editá-lo em vez de criar um novo.
import CheckinModel from '../models/CheckinModel.js';
import { mostrarNotificacao, enfileirarNotificacao } from '../utils/notificacao.js';
import {
  mostrarPasso, mostrarConclusao,
  marcarSelecionado, marcarPill, getNotaLivre,
  bindSelectEmocao, bindSelectIntensidade, bindSelectPill,
  bindGoCI, bindConcluirCheckin, renderHistoricoSemana
} from '../views/CheckinView.js';

const TOTAL_PASSOS_CHECKIN = 4;

// Mapa de chave de emoção para o label em português (usado na mensagem de resumo)
const EMOCAO_LABEL = {
  calmo: 'Calmo', pensativo: 'Pensativo', cansado: 'Cansado', focado: 'Focado',
  triste: 'Triste', ansioso: 'Ansioso', confuso: 'Confuso', grato: 'Grato'
};

// Check-in já existente para hoje (null se for o primeiro do dia)
let checkinHoje = null;

// Objeto que acumula as respostas do utilizador durante o fluxo de 4 passos
const checkinEmAndamento = { emocao: null, intensidade: null, peso: null, sono: null };

// Pré-preenche o formulário com os dados de um check-in existente para edição
function preencherFormulario(ci) {
  // Seleciona o card de emoção correspondente
  if (ci.emocao) {
    const card = document.querySelector(`.emocao-card[data-emocao="${ci.emocao}"]`);
    if (card) { marcarSelecionado(card, '.emocao-card'); checkinEmAndamento.emocao = ci.emocao; }
  }

  // Seleciona o nível de intensidade correspondente
  if (ci.intensidade) {
    const item = document.querySelector(`.intensidade-item[data-val="${ci.intensidade}"]`);
    if (item) { marcarSelecionado(item, '.intensidade-item'); checkinEmAndamento.intensidade = ci.intensidade; }
  }

  // Seleciona a pill de peso correspondente
  if (ci.peso) {
    document.querySelectorAll('[data-grupo="peso"]').forEach(pill => {
      if (pill.textContent.trim() === ci.peso) { marcarPill(pill); checkinEmAndamento.peso = ci.peso; }
    });
  }

  // Seleciona a pill de sono correspondente
  if (ci.sono) {
    document.querySelectorAll('[data-grupo="sono"]').forEach(pill => {
      if (pill.textContent.trim() === ci.sono) { marcarPill(pill); checkinEmAndamento.sono = ci.sono; }
    });
  }

  // Preenche o campo de nota livre
  const nota = document.getElementById('nota-livre');
  if (nota && ci.nota) nota.value = ci.nota;
}

// Conclui o check-in: guarda (novo ou atualizado), busca sugestão e mostra ecrã final
async function concluirCheckin() {
  const btn = document.getElementById('btn-concluir-checkin');
  if (btn) { btn.disabled = true; btn.textContent = 'A guardar...'; }

  const nota = getNotaLivre();
  let novasConquistas = [];

  // Guarda o timestamp ANTES de qualquer escrita na DB.
  // O Live Server recarrega a página a cada escrita no db.json (4 writes por check-in),
  // então o flag tem de sobreviver a múltiplas reloads — por isso usamos timestamp em vez de boolean.
  sessionStorage.setItem('checkin-just-completed', Date.now().toString());

  // Regista no histórico ANTES das escritas na DB — o Live Server recarrega a página
  // a cada write no db.json, o que mataria qualquer código depois dos awaits.
  enfileirarNotificacao('Check-in registado! +10 pts', 'conquista');

  try {
    if (checkinHoje) {
      // Atualiza o check-in existente com os novos dados
      await CheckinModel.update(checkinHoje.id, {
        emocao:      checkinEmAndamento.emocao,
        intensidade: checkinEmAndamento.intensidade,
        peso:        checkinEmAndamento.peso,
        sono:        checkinEmAndamento.sono,
        nota
      });
    } else {
      // Cria um novo check-in (inclui atualização automática de pontos)
      const checkin = new CheckinModel(
        checkinEmAndamento.emocao,
        checkinEmAndamento.intensidade,
        checkinEmAndamento.peso,
        checkinEmAndamento.sono,
        nota
      );
      novasConquistas = await checkin.save() || [];
    }
  } catch (e) {
    console.error('Erro ao guardar check-in:', e);
  }

  mostrarConclusao();

  novasConquistas.forEach((c, i) =>
    setTimeout(() => mostrarNotificacao(`Conquista desbloqueada: ${c.nome} 🏆`, 'conquista'), i * 4500)
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega todos os check-ins e verifica se já existe um para hoje
  const todos = await CheckinModel.getAll();
  const hoje = new Date().toDateString();
  checkinHoje = todos.find(c => new Date(c.data).toDateString() === hoje) || null;

  // Renderiza o histórico dos últimos 7 dias no topo da página
  renderHistoricoSemana(todos);

  if (checkinHoje) {
    const flag = sessionStorage.getItem('checkin-just-completed');
    const age = flag ? Date.now() - parseInt(flag, 10) : Infinity;

    if (age < 60000) {
      // Check-in feito há menos de 60s — Live Server recarregou, mas mostramos ci-step-5
      // Não removemos o flag para sobreviver a múltiplas reloads (4 writes = 4 reloads)
      mostrarConclusao();
    } else {
      // Check-in já existia antes desta sessão (ou passou mais de 60s) — mostra ci-step-0
      if (flag) sessionStorage.removeItem('checkin-just-completed');

      document.querySelectorAll('.checkin-step').forEach(s => s.classList.remove('active'));
      document.getElementById('ci-step-0').classList.add('active');
      document.getElementById('ci-progress').style.width = '100%';
      document.getElementById('ci-progress-label').textContent = 'Concluído hoje';

      const emocaoLabel = EMOCAO_LABEL[checkinHoje.emocao] || checkinHoje.emocao || '—';
      document.getElementById('ci-hoje-resumo').textContent =
        `Registaste que te sentias ${emocaoLabel.toLowerCase()} hoje. Podes editar se algo mudou.`;

      document.getElementById('btn-editar-checkin').addEventListener('click', () => {
        preencherFormulario(checkinHoje);
        mostrarPasso(1, TOTAL_PASSOS_CHECKIN);
      });
    }
  } else {
    // Sem check-in hoje: inicia diretamente no passo 1
    mostrarPasso(1, TOTAL_PASSOS_CHECKIN);
  }

  // Liga a seleção de emoção — guarda a escolha no objeto em andamento
  bindSelectEmocao((el, emocao) => {
    marcarSelecionado(el, '.emocao-card');
    checkinEmAndamento.emocao = emocao;
  });

  // Liga a seleção de intensidade — guarda o valor (1-5) no objeto em andamento
  bindSelectIntensidade((el, valor) => {
    marcarSelecionado(el, '.intensidade-item');
    checkinEmAndamento.intensidade = valor;
  });

  // Liga as pills de contexto (peso/sono) — guarda o valor no grupo correspondente
  bindSelectPill((el, grupo) => {
    marcarPill(el);
    checkinEmAndamento[grupo] = el.textContent.trim();
  });

  // Liga os botões de navegação entre passos
  bindGoCI(n => mostrarPasso(n, TOTAL_PASSOS_CHECKIN));

  // Liga o botão de conclusão do check-in
  bindConcluirCheckin(concluirCheckin);
});
