# MindNest

Aplicação web de bem-estar mental desenvolvida no âmbito da unidade curricular de **Programação Orientada a Objetos** do curso de **Tecnologias e Sistemas de Informação para a Web** na **Escola Superior de Media Artes e Design (ESMAD)**, ano letivo 2025/2026.

A aplicação permite registar o estado emocional diário, aceder a sessões guiadas de meditação, respiração e foco, escrever reflexões pessoais e acompanhar o progresso individual através de um sistema de gamificação.

---

## Como Executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm

### Instalação

```bash
npm install
```

### Arranque do servidor

```bash
npm start
```

O servidor REST arranca em `http://localhost:3000`.

Abrir `html/index.html` num browser com Live Server ou equivalente.

---

## Repositório

[https://github.com/franciscoaraujo23/POO](https://github.com/franciscoaraujo23/POO)

---

## Arquitetura

O projeto segue o padrão **MVC (Model-View-Controller)** implementado em JavaScript vanilla com módulos ES6:

- **Models** — encapsulam os dados e a lógica de negócio; comunicam com a API REST através da camada de serviço
- **Views** — funções de renderização que constroem o DOM dinamicamente com template strings; não têm acesso direto à API
- **Controllers** — coordenam o carregamento de dados, a lógica de interação e a atualização das vistas

A persistência é assegurada por `json-server` com autenticação JWT via `json-server-auth`. Cada coleção é protegida por um código de rota (660 — leitura/escrita para utilizadores autenticados, sem acesso público).

---

## Estrutura do Projeto

```
Projeto3/
├── html/                          # Páginas HTML
│   ├── index.html                 # Página pública (landing page)
│   ├── login.html                 # Autenticação (login e registo)
│   ├── onboarding.html            # Configuração inicial do perfil
│   ├── dashboard.html             # Painel principal
│   ├── checkin.html               # Check-in emocional diário
│   ├── sessao.html                # Reprodução de sessões
│   ├── biblioteca.html            # Catálogo de sessões
│   ├── reflexoes.html             # Diário de reflexões
│   ├── favoritos.html             # Sessões favoritas
│   ├── progresso.html             # Estatísticas e conquistas
│   ├── perfil.html                # Perfil do utilizador
│   ├── sos.html                   # Modo de crise emocional
│   └── admin.html                 # Painel de administração
├── js/
│   ├── models/                    # Modelos (dados e lógica de negócio)
│   │   ├── entradaModel.js        # Classe base com #id e #data privados
│   │   ├── AuthModel.js           # Autenticação (login, registo, sessão)
│   │   ├── UserModel.js           # Perfil do utilizador
│   │   ├── CheckinModel.js        # Check-in emocional (extends EntradaModel)
│   │   ├── ReflexaoModel.js       # Reflexões (extends EntradaModel)
│   │   ├── sessaoModel.js         # Sessões de bem-estar e catálogo
│   │   └── GamificacaoModel.js    # Pontos, nível e conquistas
│   ├── views/                     # Vistas (renderização dinâmica)
│   │   ├── LoginView.js
│   │   ├── SidebarView.js
│   │   ├── DashboardView.js
│   │   ├── CheckinView.js
│   │   ├── SessaoView.js
│   │   ├── BibliotecaView.js
│   │   ├── ReflexaoView.js
│   │   ├── FavoritosView.js
│   │   ├── ProgressoView.js
│   │   ├── CaminhoView.js
│   │   ├── PerfilView.js
│   │   ├── SosView.js
│   │   └── AdminView.js
│   ├── controllers/               # Controladores (coordenação Model–View)
│   │   ├── LoginController.js
│   │   ├── DashboardController.js
│   │   ├── CheckinController.js
│   │   ├── SessaoController.js
│   │   ├── BibliotecaController.js
│   │   ├── ReflexaoController.js
│   │   ├── FavoritosController.js
│   │   ├── ProgressoController.js
│   │   ├── PerfilController.js
│   │   ├── SosController.js
│   │   └── AdminController.js
│   ├── services/
│   │   └── service.js             # Camada de acesso à API (Fetch API + JWT)
│   ├── utils/
│   │   ├── notificacao.js         # Sistema de notificações toast e histórico
│   │   └── emocaoIcons.js         # Utilitário de ícones por emoção e categoria
│   └── init.js                    # Verificação de sessão e notificações pendentes
├── style/                         # Folhas de estilo CSS por página
├── assets/                        # Imagens e ícones
├── db.json                        # Base de dados local (json-server)
├── routes.json                    # Rotas e permissões da API
└── package.json
```

---

## Tecnologias

| Tecnologia | Utilização |
|---|---|
| HTML5 + CSS3 | Estrutura semântica e estilização das páginas |
| JavaScript ES6+ | Lógica da aplicação (módulos, classes, campos privados, async/await) |
| json-server 0.17 | Servidor REST local com base de dados em ficheiro JSON |
| json-server-auth 2.1 | Autenticação JWT com registo, login e controlo de acessos por rota |
| Fetch API | Comunicação assíncrona com a API REST |
| localStorage | Persistência da sessão, preferências e histórico de notificações |

---

## Modelo de Classes

| Classe | Ficheiro | Conceitos de POO aplicados |
|---|---|---|
| `EntradaModel` | `js/models/entradaModel.js` | Classe base; `#id` e `#data` privados; método `_restore()` para reconstituição a partir da API |
| `CheckinModel` | `js/models/CheckinModel.js` | Herança (`extends EntradaModel`, `super()`); override de `save()`; método estático `getAll()` |
| `ReflexaoModel` | `js/models/ReflexaoModel.js` | Herança (`extends EntradaModel`, `super()`); override de `save()`, `getAll()` e `delete()` |
| `SessaoModel` | `js/models/sessaoModel.js` | `#id` e `#avaliacao` privados; setter `avaliacao` com validação (0–5); métodos estáticos de consulta e filtragem do catálogo |
| `UserModel` | `js/models/UserModel.js` | `#id`, `#role`, `#favoritos` e `#preferencias` privados; getters com cópias defensivas; encapsulamento do perfil |
| `GamificacaoModel` | `js/models/GamificacaoModel.js` | `#pontos` e `#nivel` privados; `static #conquistasDisponiveis`; método `calcularNivel()` |
| `AuthModel` | `js/models/AuthModel.js` | `#password` privado com setter validado; `static login()` e `static logout()`; gestão da sessão em `localStorage` |

---

## Funcionalidades

### Autenticação e Perfil
- Registo e autenticação com JWT (json-server-auth)
- Onboarding inicial para definição do perfil psicológico dominante (overthinking, ansiedade, foco, sono)
- Edição de dados pessoais e preferências (objetivo, duração preferida)
- Modo noturno com persistência entre sessões

### Dashboard
- Estatísticas semanais (sessões concluídas, dias ativos, pontos)
- Sessões recomendadas personalizadas com base no perfil psicológico e no objetivo do utilizador
- Pesquisa em tempo real sobre o catálogo
- Histórico de notificações acessível através do ícone de sino

### Check-in Emocional
- Fluxo de quatro passos: seleção de emoção, intensidade, contexto (o que pesa / qualidade do sono) e nota livre
- Histórico semanal com visualização da emoção registada por dia
- Edição do check-in do dia corrente

### Sessões Guiadas
- Catálogo com sessões de meditação, respiração, foco, relaxamento, sono e ansiedade
- Reprodução via player de vídeo YouTube integrado
- Avaliação de 1 a 5 estrelas com cálculo de média global (agregado partilhado entre todos os utilizadores)
- Sistema de favoritos
- Quiz pós-sessão para recolha de feedback

### Biblioteca
- Filtros por categoria, duração e pesquisa por título
- Visualização da avaliação média global em cada cartão de sessão

### Caminhos Filosóficos
- Percursos temáticos organizados em três tradições: Mindfulness, Estoicismo e Taoismo
- Sessões agrupadas por caminho com progressão sequencial

### Reflexões
- Três modos de escrita: reflexão guiada (estoica), escrita livre e diário de gratidão
- Histórico de entradas com ordenação cronológica e opção de eliminação

### Progresso e Gamificação
- Mini-estatísticas de reflexões, sessões, horas praticadas e check-ins
- Gráfico de atividade dos últimos sete dias
- Sistema de pontos e níveis (Mente Desperta → Mente Plena)
- Grelha de conquistas com indicação de progresso
- Histórico das sessões mais recentes com thumbnail do vídeo

### Notificações
- Toasts imediatos para conquistas desbloqueadas e conclusão de sessões e check-ins
- Histórico persistente em `localStorage` acessível no dashboard

### Modo SOS
- Acesso rápido a técnicas de estabilização emocional em situações de crise
- Disponível sem necessidade de navegar pelos menus principais

### Administração
- Painel restrito ao papel `admin`
- Gestão de utilizadores registados
