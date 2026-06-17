// View da página de reflexões.
// Gere os prompts do dia, os três modos de escrita (estoico, livre, gratidão),
// a lista de entradas guardadas e o livro interativo com animação de páginas.

// Lista de prompts rotativos — muda com base no dia do mês
const PROMPTS_REFLEXAO = [
  "O que tens na cabeça agora?",
  "Descreve o teu dia em três frases.",
  "O que aprendeste hoje sobre ti?",
  "O que te deu energia hoje?",
  "Se pudesses mudar uma coisa neste momento, o que seria?",
  "O que te está a impedir de estar em paz agora?",
  "Que pensamento se repete mais na tua cabeça ultimamente?"
];

// Mostra o prompt do dia no elemento correspondente (rota pelo dia do mês)
export function mostrarPromptDoDia() {
  const hoje = new Date();
  const prompt = PROMPTS_REFLEXAO[hoje.getDate() % PROMPTS_REFLEXAO.length];
  document.getElementById('prompt-rotativo').textContent = '"' + prompt + '"';
}

// Ativa o modo de escrita indicado: destaca o card do modo e mostra a área de escrita
export function mostrarModo(modo) {
  document.querySelectorAll('.modo-card').forEach(c => c.classList.remove('active'));
  document.getElementById('modo-' + modo).classList.add('active');
  document.querySelectorAll('.escrita-wrap').forEach(w => w.classList.remove('active'));
  document.getElementById('escrita-' + modo).classList.add('active');
}

// Lê os campos do formulário para o modo indicado e devolve um objeto com os valores
export function lerCampos(modo) {
  if (modo === 'estoico') {
    return {
      problema: document.getElementById('estoico-problema').value.trim(),
      controlo: document.getElementById('estoico-controlo').value.trim(),
      passo:    document.getElementById('estoico-passo').value.trim()
    };
  }
  if (modo === 'livre') {
    const el = document.getElementById('livre-texto');
    return { texto: el ? el.value.trim() : '' };
  }
  if (modo === 'gratidao') {
    return {
      g1: document.getElementById('grat-1').value.trim(),
      g2: document.getElementById('grat-2').value.trim(),
      g3: document.getElementById('grat-3').value.trim()
    };
  }
  return {};
}

// Limpa todos os campos do formulário para o modo indicado
export function limparCampos(modo) {
  if (modo === 'estoico') {
    document.getElementById('estoico-problema').value = '';
    document.getElementById('estoico-controlo').value = '';
    document.getElementById('estoico-passo').value = '';
  } else if (modo === 'livre') {
    const el = document.getElementById('livre-texto');
    if (el) el.value = '';
  } else if (modo === 'gratidao') {
    document.getElementById('grat-1').value = '';
    document.getElementById('grat-2').value = '';
    document.getElementById('grat-3').value = '';
  }
}

// Mostra a mensagem de confirmação de "guardado" durante 3 segundos
export function mostrarMensagemGuardada(modo) {
  const msg = document.getElementById('msg-' + modo);
  msg.classList.add('visible');
  setTimeout(() => msg.classList.remove('visible'), 3000);
}

// Mapa de modo para ícone, nome e cor de cada tipo de reflexão
const MODO_LABELS = {
  estoico:  { icon: '<img src="../assets/icons/reflection.png" alt="Reflexão Guiada">', nome: 'Reflexão Guiada', cls: '' },
  livre:    { icon: '<img src="../assets/icons/writing.png" alt="Escrita Livre">',      nome: 'Escrita Livre',   cls: 'mist' },
  gratidao: { icon: '<img src="../assets/icons/gratitude.png" alt="Gratidão">',         nome: 'Gratidão',        cls: 'fog' }
};

// Formata a data de uma entrada (ex: "segunda-feira, 14 de junho")
function fmtData(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Extrai o excerto de texto a mostrar no cabeçalho de cada entrada
function excerto(campos) {
  if (campos.problema) return campos.problema;
  if (campos.texto) return campos.texto;
  if (campos.g1) return campos.g1 + (campos.g2 ? ' · ' + campos.g2 : '');
  return '';
}

// Gera o HTML dos campos de uma entrada consoante o modo de escrita
function camposHtml(modo, campos) {
  if (modo === 'estoico') return `
    ${campos.problema ? `<div class="entrada-campo"><p class="entrada-campo-label">Preocupação</p><p class="entrada-campo-texto">${campos.problema}</p></div>` : ''}
    ${campos.controlo ? `<div class="entrada-campo"><p class="entrada-campo-label">No meu controlo</p><p class="entrada-campo-texto">${campos.controlo}</p></div>` : ''}
    ${campos.passo ? `<div class="entrada-campo"><p class="entrada-campo-label">Um passo concreto</p><p class="entrada-campo-texto">${campos.passo}</p></div>` : ''}`;
  if (modo === 'livre') return `
    <div class="entrada-campo"><p class="entrada-campo-label">Escrita</p><p class="entrada-campo-texto">${campos.texto}</p></div>`;
  if (modo === 'gratidao') return `
    ${campos.g1 ? `<div class="entrada-campo"><p class="entrada-campo-label">Gratidão 1</p><p class="entrada-campo-texto">${campos.g1}</p></div>` : ''}
    ${campos.g2 ? `<div class="entrada-campo"><p class="entrada-campo-label">Gratidão 2</p><p class="entrada-campo-texto">${campos.g2}</p></div>` : ''}
    ${campos.g3 ? `<div class="entrada-campo"><p class="entrada-campo-label">Gratidão 3</p><p class="entrada-campo-texto">${campos.g3}</p></div>` : ''}`;
  return '';
}

// Renderiza a lista de entradas de reflexão filtradas pelo modo ativo
export function renderEntradas(entradas) {
  const list = document.getElementById('entradas-list');
  const count = document.getElementById('entradas-count');

  count.textContent = entradas.length + (entradas.length === 1 ? ' entrada' : ' entradas');

  if (entradas.length === 0) {
    list.innerHTML = `<div class="entradas-empty"><p>Ainda não tens reflexões guardadas.<br>Escreve a tua primeira entrada acima.</p></div>`;
    return;
  }

  // Ordena por data decrescente (mais recentes primeiro)
  entradas.sort((a, b) => new Date(b.data) - new Date(a.data));

  list.innerHTML = entradas.map(e => {
    const m = MODO_LABELS[e.modo] || MODO_LABELS.livre;
    const exc = excerto(e.campos);
    return `
    <div class="entrada-card" id="entrada-${e.id}">
      <div class="entrada-header">
        <div class="entrada-modo-icon ${m.cls}">${m.icon}</div>
        <div class="entrada-meta">
          <p class="entrada-data">${fmtData(e.data)} · ${m.nome}</p>
          <p class="entrada-excerto">${exc.slice(0, 80)}${exc.length > 80 ? '...' : ''}</p>
        </div>
        <span class="entrada-chevron">▾</span>
      </div>
      <div class="entrada-body">
        ${camposHtml(e.modo, e.campos)}
        <button class="btn-apagar-entrada" data-entrada-id="${e.id}">Eliminar</button>
      </div>
    </div>`;
  }).join('');
}

// Liga os cards de modo ao handler — chama com o valor de data-modo ao clicar
export function bindModo(handler) {
  document.querySelectorAll('.modo-card').forEach(card => {
    card.addEventListener('click', () => handler(card.dataset.modo));
  });
}

// Liga os botões de guardar ao handler — chama com o data-modo do botão
export function bindGuardar(handler) {
  document.querySelectorAll('.btn-guardar').forEach(btn => {
    btn.addEventListener('click', () => handler(btn.dataset.modo));
  });
}

// Liga os botões de limpar ao handler — chama com o data-modo do botão
export function bindLimpar(handler) {
  document.querySelectorAll('.btn-limpar').forEach(btn => {
    btn.addEventListener('click', () => handler(btn.dataset.modo));
  });
}

// Liga a lista de entradas aos handlers de expandir/colapsar e eliminar (delegação de eventos)
export function bindEntradas(onToggle, onApagar) {
  document.getElementById('entradas-list').addEventListener('click', e => {
    const header = e.target.closest('.entrada-header');
    if (header) {
      onToggle(header);
      return;
    }
    const btnApagar = e.target.closest('.btn-apagar-entrada');
    if (btnApagar) {
      e.stopPropagation();
      onApagar(btnApagar.dataset.entradaId);
    }
  });
}

// Inicializa o livro interativo com animação de virar páginas
// entradas: entradas do modo 'livre' ordenadas por data decrescente
// onGuardar: callback assíncrono chamado com o texto ao guardar no livro
export function inicializarLivro(entradas, onGuardar) {
  const hoje = new Date().toDateString();

  // Separa as entradas anteriores a hoje (as de hoje são editáveis na página direita)
  const anteriores = entradas.filter(e => new Date(e.data).toDateString() !== hoje);

  let current  = 0;      // Índice do spread atual (0 = hoje + entrada mais recente)
  let flipping = false;  // Flag para evitar animações sobrepostas

  // Formata a data de hoje em extenso (para o cabeçalho da página editável)
  function fmtHoje() {
    return new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // Gera HTML de uma entrada anterior (apenas leitura)
  function htmlEntrada(entrada) {
    if (!entrada) return '';
    const texto = entrada.campos?.texto || entrada.campos?.problema || entrada.campos?.g1 || '';
    return `<p class="livro-data">${fmtData(entrada.data)}</p><p class="livro-texto">${texto}</p>`;
  }

  // Gera HTML da página editável de hoje (com textarea e botão de guardar)
  function htmlEditavel(textoExistente = '') {
    return `
      <p class="livro-data">${fmtHoje()}</p>
      <textarea id="livro-textarea" placeholder="Escreve o que vier à cabeça. Sem julgamentos, sem regras..."
        style="width:100%; height:calc(100% - 60px); border:none; background:transparent; resize:none; font-family:inherit; font-size:13px; color:var(--color-text); outline:none; line-height:1.7;">${textoExistente}</textarea>
      <button id="livro-guardar" style="margin-top:8px; padding:6px 16px; background:var(--dusk-400); color:#fff; border:none; border-radius:var(--radius-sm); font-size:12px; cursor:pointer;">${textoExistente ? 'Atualizar' : 'Guardar'}</button>`;
  }

  // Número máximo de spreads (cada spread tem 2 páginas de entradas anteriores)
  const maxIdx = anteriores.length > 0 ? Math.ceil((anteriores.length - 1) / 2) : 0;

  // Gera a etiqueta do spread (data da entrada mais antiga do par)
  function labelSpread(idx) {
    if (idx === 0) return 'Hoje';
    const ri = 2 * idx - 1;
    if (anteriores[ri]) {
      const d = new Date(anteriores[ri].data);
      return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    }
    return '';
  }

  // Mostra as páginas do spread indicado (esquerda e direita)
  function show(idx) {
    const pagEsq = document.getElementById('pag-esq');
    const pagDir = document.getElementById('pag-dir');

    if (idx === 0) {
      // Spread de hoje: esquerda = entrada mais recente anterior, direita = editável de hoje
      const entradaHoje = entradas.find(e => new Date(e.data).toDateString() === hoje);
      pagEsq.innerHTML = anteriores[0] ? htmlEntrada(anteriores[0]) : '<p class="livro-placeholder">As tuas reflexões aparecerão aqui.</p>';
      pagDir.innerHTML = htmlEditavel(entradaHoje?.campos?.texto || '');
      bindGuardarLivro();
    } else {
      // Spreads anteriores: dois registos por spread
      const ri = 2 * idx - 1;
      const li = 2 * idx;
      pagDir.innerHTML = anteriores[ri] ? htmlEntrada(anteriores[ri]) : '';
      pagEsq.innerHTML = anteriores[li] ? htmlEntrada(anteriores[li]) : '<p class="livro-placeholder">Sem mais entradas.</p>';
    }

    document.getElementById('spread-label').textContent = labelSpread(idx);
    document.getElementById('btn-ant').disabled = idx >= maxIdx;
    document.getElementById('btn-seg').disabled = idx <= 0;
  }

  // Liga o botão de guardar da página editável ao callback onGuardar
  function bindGuardarLivro() {
    const btn = document.getElementById('livro-guardar');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const texto = document.getElementById('livro-textarea')?.value.trim();
      if (!texto) return;
      btn.disabled    = true;
      btn.textContent = 'A guardar...';
      await onGuardar(texto);
      btn.textContent = 'Guardado!';
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Guardar'; }, 2000);
    });
  }

  // Executa a animação de virar página para o spread alvo
  function flipTo(target) {
    if (flipping || target === current || target < 0) return;
    flipping = true;

    const overlay = document.getElementById('flip-overlay');
    const front   = document.getElementById('flip-front');
    const back    = document.getElementById('flip-back');
    const backward = target > current; // Avança para o passado = vira para a esquerda

    const pagEsq = document.getElementById('pag-esq');
    const pagDir = document.getElementById('pag-dir');

    // Clona a página que vai sair para a sobreposição de animação
    if (backward) {
      front.innerHTML = pagEsq.innerHTML;
      overlay.className = 'flip-overlay flip-left';
    } else {
      front.innerHTML = pagDir.innerHTML;
      overlay.className = 'flip-overlay flip-right';
    }

    overlay.style.display   = 'block';
    overlay.style.transform = 'rotateY(0deg)';

    // Inicia a animação CSS no próximo frame para garantir a transição
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add('animating');
      overlay.style.transform = backward ? 'rotateY(-180deg)' : 'rotateY(180deg)';
    }));

    // Após a animação, mostra o novo spread e desbloqueia para a próxima animação
    overlay.addEventListener('transitionend', () => {
      overlay.style.display = 'none';
      overlay.className     = 'flip-overlay';
      overlay.style.transform = '';
      current = target;
      show(current);
      flipping = false;
    }, { once: true });
  }

  // Inicializa no spread 0 (hoje) e liga os botões de navegação
  show(0);
  document.getElementById('btn-ant').addEventListener('click', () => flipTo(current + 1)); // Mais antigo
  document.getElementById('btn-seg').addEventListener('click', () => flipTo(current - 1)); // Mais recente
}
