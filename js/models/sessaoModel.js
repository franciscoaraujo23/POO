class SessaoModel {
  #id;
  #titulo;
  #categoria;
  #duracao;
  #descricao;
  #nivel;
  #tipo;
  #avaliacao;
  #url;
  #caminho;

    static #catalogo = [
    { id: 1, titulo: "Respiração 4-7-8 para Ansiedade", categoria: "respiração", duracao: 10, nivel: "iniciante", tipo: "vídeo", descricao: "Técnica de respiração para reduzir ansiedade aguda em poucos minutos.", avaliacao: 0, url: "https://www.youtube.com/embed/LiUnFJ8P4gM", caminho: "" },
    { id: 2, titulo: "Meditação de Ancoragem no Presente", categoria: "meditação", duracao: 5, nivel: "iniciante", tipo: "vídeo", descricao: "Exercício guiado de mindfulness para sair do piloto automático.", avaliacao: 0, url: "https://www.youtube.com/embed/VWxoEZACB_o", caminho: "mindfulness" },
    { id: 3, titulo: "Relaxamento Muscular Progressivo", categoria: "relaxamento", duracao: 12, nivel: "iniciante", tipo: "vídeo", descricao: "Tensão e relaxamento progressivo de grupos musculares.", avaliacao: 0, url: "https://www.youtube.com/embed/NIdukIWvgto", caminho: "taoismo" },
    { id: 4, titulo: "Meditação para Overthinking", categoria: "meditação", duracao: 13, nivel: "iniciante", tipo: "vídeo", descricao: "Técnica para observar pensamentos sem se prender a eles.", avaliacao: 0, url: "https://www.youtube.com/embed/CE6kq_8YlIk", caminho: "mindfulness" },
    { id: 5, titulo: "Body Scan para Adormecer", categoria: "sono", duracao: 27, nivel: "iniciante", tipo: "vídeo", descricao: "Varrimento corporal guiado para relaxar antes de dormir.", avaliacao: 0, url: "https://www.youtube.com/embed/dJljnvdBIUI", caminho: "taoismo" },
    { id: 6, titulo: "Respiração em Caixa", categoria: "respiração", duracao: 3, nivel: "iniciante", tipo: "vídeo", descricao: "Técnica 4-4-4-4 usada para acalmar o sistema nervoso.", avaliacao: 0, url: "https://www.youtube.com/embed/NLU0ffah75c", caminho: "" },
    { id: 7, titulo: "Foco Profundo - Pomodoro Guiado", categoria: "foco", duracao: 7, nivel: "intermédio", tipo: "vídeo", descricao: "Sessão de trabalho focado com música e pausas guiadas.", avaliacao: 0, url: "https://www.youtube.com/embed/hfxfJ7Qa4sg", caminho: "" },
    { id: 8, titulo: "Meditação Estoica - O Que Controlo", categoria: "meditação", duracao: 10, nivel: "intermédio", tipo: "vídeo", descricao: "Reflexão guiada baseada na dicotomia do controlo de Epicteto.", avaliacao: 0, url: "https://www.youtube.com/embed/1G0XGsRdgBY", caminho: "estoicismo" },
    { id: 9, titulo: "Sons da Natureza para Concentração", categoria: "foco", duracao: 60, nivel: "iniciante", tipo: "vídeo", descricao: "Ambiente sonoro natural para manter foco prolongado.", avaliacao: 0, url: "https://www.youtube.com/embed/OighwhOIKgQ", caminho: "taoismo" },
    { id: 10, titulo: "Visualização para Reduzir Ansiedade", categoria: "ansiedade", duracao: 20, nivel: "intermédio", tipo: "vídeo", descricao: "Técnica de visualização de lugar seguro para acalmar a mente.", avaliacao: 0, url: "https://www.youtube.com/embed/D7iRTG0J1d4", caminho: "" },
    { id: 11, titulo: "Meditação de Gratidão", categoria: "meditação", duracao: 13, nivel: "iniciante", tipo: "vídeo", descricao: "Prática guiada de gratidão baseada em evidência científica.", avaliacao: 0, url: "https://www.youtube.com/embed/DKqkTeTy-4w", caminho: "mindfulness" },
    { id: 12, titulo: "Ruído Branco para Dormir", categoria: "sono", duracao: 30, nivel: "iniciante", tipo: "vídeo", descricao: "Ruído branco contínuo para facilitar o adormecimento.", avaliacao: 0, url: "https://www.youtube.com/embed/73qcRzXuXMI", caminho: "" },
    { id: 13, titulo: "Técnica de Grounding 5-4-3-2-1", categoria: "ansiedade", duracao: 7, nivel: "iniciante", tipo: "vídeo", descricao: "Exercício sensorial para sair de estados de pânico ou dissociação.", avaliacao: 0, url: "https://www.youtube.com/embed/vgxwvDEBW8o", caminho: "mindfulness" },
    { id: 14, titulo: "Respiração Diafragmática", categoria: "respiração", duracao: 4, nivel: "iniciante", tipo: "vídeo", descricao: "Treino de respiração abdominal para reduzir tensão crónica.", avaliacao: 0, url: "https://www.youtube.com/embed/Mu39nw6R0Lk", caminho: "" },
    { id: 15, titulo: "Meditação para Clareza Mental", categoria: "foco", duracao: 18, nivel: "intermédio", tipo: "vídeo", descricao: "Prática guiada para organizar pensamentos e tomar decisões.", avaliacao: 0, url: "https://www.youtube.com/embed/GL1jeXV0dr8", caminho: "" }
    ];

  constructor(id, titulo, categoria, duracao, descricao, nivel, tipo, avaliacao, url, caminho) {
    this.#id = id;
    this.#titulo = titulo;
    this.#categoria = categoria;
    this.#duracao = duracao;
    this.#descricao = descricao;
    this.#nivel = nivel;
    this.#tipo = tipo;
    this.#avaliacao = avaliacao;
    this.#url = url;
    this.#caminho = caminho;
  }

  get id()        { return this.#id; }
  get titulo()    { return this.#titulo; }
  get categoria() { return this.#categoria; }
  get duracao()   { return this.#duracao; }
  get descricao() { return this.#descricao; }
  get nivel()     { return this.#nivel; }
  get tipo()      { return this.#tipo; }
  get url()       { return this.#url; }
  get caminho()   { return this.#caminho; }

  get avaliacao()      { return this.#avaliacao; }
  set avaliacao(valor) { this.#avaliacao = valor; }

  save() {
    const concluidas = JSON.parse(localStorage.getItem("mindnest_sessoes") || "[]");
    const entrada = {
      id: this.#id,
      titulo: this.#titulo,
      categoria: this.#categoria,
      duracao: this.#duracao,
      avaliacao: this.#avaliacao,
      data: new Date().toISOString()
    };
    concluidas.push(entrada);
    localStorage.setItem("mindnest_sessoes", JSON.stringify(concluidas));
  }

  static getAll() {
    return SessaoModel.#catalogo;
  }

  static getById(id) {
    return SessaoModel.#catalogo.find(s => s.id === id) || null;
  }

  static getByCategoria(categoria) {
    return SessaoModel.#catalogo.filter(s => s.categoria === categoria);
  }

  static getByCaminho(caminho) {
    return SessaoModel.#catalogo.filter(s => s.caminho === caminho);
  }

  static filtrar({ categoria, duracao, query, caminho } = {}) {
    return SessaoModel.#catalogo.filter(s => {
      if (categoria && s.categoria !== categoria) return false;
      if (caminho && s.caminho !== caminho) return false;
      if (query && !s.titulo.toLowerCase().includes(query.toLowerCase())) return false;
      if (duracao === "curta"  && s.duracao > 10)  return false;
      if (duracao === "media"  && (s.duracao <= 10 || s.duracao > 20)) return false;
      if (duracao === "longa"  && s.duracao <= 20) return false;
      return true;
    });
  }

  static getConcluidas() {
    return JSON.parse(localStorage.getItem("mindnest_sessoes") || "[]");
  }
}