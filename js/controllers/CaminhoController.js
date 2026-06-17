import SessaoModel from '../models/sessaoModel.js';
import UserModel from '../models/UserModel.js';
import { renderCaminho, renderSessoesCaminho } from '../views/CaminhoView.js';

const CAMINHOS = {
  estoicismo: {
    titulo: 'O Caminho do Estoico',
    subtitulo: 'Controlo, aceitação e dever.',
    desc: 'Aprende a distinguir o que depende de ti. Desenvolve resiliência, clareza mental e serenidade perante os desafios da vida.',
    icon: '⚖️',
    cor: 'dusk'
  },
  mindfulness: {
    titulo: 'O Caminho da Presença',
    subtitulo: 'Para, respira, observa.',
    desc: 'A paz está no momento que habitas agora. Treina a atenção plena e aprende a observar os teus pensamentos sem te perderes neles.',
    icon: '🧘',
    cor: 'mist'
  },
  taoismo: {
    titulo: 'O Caminho do Tao',
    subtitulo: 'Flui com o que é. Resiste ao que não és.',
    desc: 'Descobre a sabedoria do não-esforço. Aprende a mover-te em harmonia com a natureza das coisas e a soltar o controlo.',
    icon: '☯️',
    cor: 'fog'
  }
};

const params = new URLSearchParams(window.location.search);
const tipo   = (params.get('tipo') || '').toLowerCase();

document.addEventListener('DOMContentLoaded', async () => {
  const meta = CAMINHOS[tipo];
  if (!meta) {
    window.location.href = 'biblioteca.html';
    return;
  }

  renderCaminho(tipo, meta);

  const [todas, utilizador] = await Promise.all([SessaoModel.getAll(), UserModel.get()]);
  const filtradas = todas.filter(s => s.caminho === tipo);
  const favIds = utilizador?.favoritos ?? [];
  renderSessoesCaminho(filtradas, favIds);

  document.getElementById('caminho-sessoes').addEventListener('click', async e => {
    const btn = e.target.closest('.fav-btn');
    if (!btn || !utilizador) return;
    e.stopPropagation();
    e.preventDefault();
    const id = parseInt(btn.dataset.favId, 10);
    const isFav = btn.classList.contains('active');
    if (isFav) await utilizador.removeFavorito(id);
    else       await utilizador.addFavorito(id);
    btn.classList.toggle('active', !isFav);
    btn.querySelector('img').src = `../assets/icons/${!isFav ? 'like' : 'nolike'}.png`;
  }, true);
});
