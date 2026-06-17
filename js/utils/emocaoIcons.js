// Utilitário de ícones de imagem para emoções, categorias e conquistas.
// Substitui o uso de emojis por imagens da pasta assets/icons/,
// garantindo consistência visual em toda a aplicação.

// Mapa de emoções para o caminho da imagem correspondente
const EMOCAO_ICON = {
  calmo:     '../assets/icons/calm.png',
  pensativo: '../assets/icons/pensative.png',
  cansado:   '../assets/icons/tired.png',
  focado:    '../assets/icons/focus.png',
  triste:    '../assets/icons/sad.png',
  ansioso:   '../assets/icons/ansious.png',
  confuso:   '../assets/icons/confused.png',
  grato:     '../assets/icons/gratitude.png',
  motivado:  '../assets/icons/energy.png'
};

// Mapa de categorias de sessão para o caminho da imagem correspondente
const CATEGORIA_ICON = {
  respiracao:  '../assets/icons/breathe.png',
  meditacao:   '../assets/icons/relax.png',
  foco:        '../assets/icons/focus.png',
  relaxamento: '../assets/icons/relax.png',
  sono:        '../assets/icons/tired.png',
  ansiedade:   '../assets/icons/ansious.png'
};

// Mapa de IDs de conquistas para o caminho da imagem correspondente
const CONQUISTA_ICON = {
  '1passo':          '../assets/badges/1passo.png',
  '10checkins':      '../assets/badges/10checkins.png',
  '10sessoes':       '../assets/badges/10sessoes.png',
  '100sessoes':      '../assets/badges/100sessoes.png',
  '5nivel':          '../assets/badges/5nivel.png',
  'Autoconhecimento':'../assets/badges/Autoconhecimento.png',
  'Escritor':        '../assets/badges/Escritor.png',
  'MestreCaminhos':  '../assets/badges/MestreCaminhos.png',
  'VozInterior':     '../assets/badges/VozInterior.png',
};

// Devolve uma tag <img> para a emoção indicada, com o tamanho especificado
function emocaoImg(emocao, size = 24) {
  const src = EMOCAO_ICON[emocao];
  if (!src) return '';
  return `<img src="${src}" alt="${emocao}" width="${size}" height="${size}" style="object-fit:contain;">`;
}

// Devolve uma tag <img> para a categoria de sessão indicada, com o tamanho especificado
function categoriaImg(categoria, size = 24) {
  const src = CATEGORIA_ICON[categoria];
  if (!src) return '';
  return `<img src="${src}" alt="${categoria}" width="${size}" height="${size}" style="object-fit:contain;">`;
}

// Devolve uma tag <img> para o ID de conquista indicado, com o tamanho especificado
function conquistaImg(id, size = 28) {
  const src = CONQUISTA_ICON[id];
  if (!src) return '';
  return `<img src="${src}" alt="${id}" width="${size}" height="${size}" style="object-fit:contain;">`;
}

export { EMOCAO_ICON, CATEGORIA_ICON, CONQUISTA_ICON, emocaoImg, categoriaImg, conquistaImg };
