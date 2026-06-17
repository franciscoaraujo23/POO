// Controlador da página de progresso.
// Carrega e apresenta estatísticas gerais, gráfico semanal, histórico de sessões,
// check-ins da semana, nível do utilizador e conquistas desbloqueadas.
import GamificacaoModel from '../models/GamificacaoModel.js';
import ReflexaoModel from '../models/ReflexaoModel.js';
import SessaoModel from '../models/sessaoModel.js';
import UserModel from '../models/UserModel.js';
import { getSessoesConcluidas, getCheckins } from '../services/service.js';
import {
  renderStatsMini, renderGraficoSemanal, renderHistoricoSessoes,
  renderCheckinsSemanais, renderNivel, renderConquistas
} from '../views/ProgressoView.js';

// Catálogo local de conquistas com função de progresso para cada uma.
// A função 'progresso' recebe o ctx (checkins, sessoes, reflexoes, nivel, temPerfil…)
// e devolve null se completada ou uma string com o progresso atual.
const CONQUISTAS_CATALOGO = [
  { id: '1passo',          nome: 'Primeiro Passo',       progresso: c => c.checkins >= 1   ? null : '0/1 check-ins'           },
  { id: '10checkins',      nome: '10 Check-ins',         progresso: c => c.checkins >= 10  ? null : `${c.checkins}/10`         },
  { id: '10sessoes',       nome: '10 Sessões',           progresso: c => c.sessoes >= 10   ? null : `${c.sessoes}/10`          },
  { id: '100sessoes',      nome: '100 Sessões',          progresso: c => c.sessoes >= 100  ? null : `${c.sessoes}/100`         },
  { id: '5nivel',          nome: 'Nível 5',              progresso: c => c.nivel >= 5      ? null : `Nível ${c.nivel}/5`       },
  { id: 'Autoconhecimento',nome: 'Autoconhecimento',     progresso: c => c.temPerfil       ? null : 'Completa o onboarding'    },
  { id: 'Escritor',        nome: 'Escritor',             progresso: c => c.reflexoes >= 1  ? null : '0/1 reflexões'            },
  { id: 'MestreCaminhos',  nome: 'Mestre dos Caminhos', progresso: c => c.caminhosConcluidos >= 3 ? null : `${c.caminhosConcluidos ?? 0}/3 caminhos` },
  { id: 'VozInterior',     nome: 'Voz Interior',        progresso: c => c.reflexoes >= 10 ? null : `${c.reflexoes}/10 reflexões` },
];

document.addEventListener('DOMContentLoaded', async () => {
  // Carrega todos os dados necessários em paralelo para melhorar o desempenho
  const [gamificacao, sessoes, checkins, reflexoes, utilizador, catalogo] = await Promise.all([
    GamificacaoModel.load(),
    getSessoesConcluidas(),
    getCheckins(),
    ReflexaoModel.getAll(),
    UserModel.get(),
    SessaoModel.getAll()
  ]);

  // Enriquece as sessões concluídas com a url do catálogo (para thumbnails do YouTube)
  const urlMap = Object.fromEntries(catalogo.map(s => [String(s.id), s.url || null]));
  const sessoesComUrl = sessoes.map(s => ({ ...s, url: urlMap[String(s.sessaoId)] || null }));

  // Renderiza os mini-stats com deltas mensais/semanais calculados a partir dos arrays reais
  renderStatsMini(sessoes, checkins, reflexoes);

  // Renderiza o gráfico de barras das sessões por dia nos últimos 7 dias
  renderGraficoSemanal(sessoes);

  // Renderiza as 5 sessões mais recentes concluídas (com thumbnails do YouTube)
  renderHistoricoSessoes(sessoesComUrl);

  // Renderiza o mapa de emoções dos check-ins da semana atual
  renderCheckinsSemanais(checkins);

  renderNivel(gamificacao);

  // Contexto com todos os contadores para calcular o progresso de cada conquista
  const ctx = {
    checkins:     checkins.length,
    sessoes:      sessoes.length,
    reflexoes:    reflexoes.length,
    nivel:        gamificacao?.nivel || 1,
    temPerfil:           !!utilizador?.perfilDominante,
    caminhosConcluidos:  new Set(sessoes.filter(s => s.caminho).map(s => s.caminho)).size
  };

  // Renderiza a grelha de conquistas com o estado de cada uma (desbloqueada ou bloqueada)
  renderConquistas(gamificacao, CONQUISTAS_CATALOGO, ctx);
});
