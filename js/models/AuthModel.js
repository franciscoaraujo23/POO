class AuthModel {
  // Atributos privados — só acessíveis dentro da classe
  #email;
  #password;

  // Recebe email e password e guarda-os nos atributos privados
  constructor(email, password) {
    this.#email = email;
    this.#password = password;
  }

  // Regista um novo utilizador no localStorage. Devolve false se o email já existir.
  register() {
    const utilizadores =
      JSON.parse(localStorage.getItem("mindnest_auth")) || [];
    const jaExiste = utilizadores.find((u) => u.email === this.#email);
    if (jaExiste) return false;
    utilizadores.push({ email: this.#email, password: this.#password });
    localStorage.setItem("mindnest_auth", JSON.stringify(utilizadores));
    return true;
  }

  // Verifica as credenciais e cria uma sessão se forem válidas
  static login(email, password) {
    const utilizadores =
      JSON.parse(localStorage.getItem("mindnest_auth")) || [];
    const utilizador = utilizadores.find(
      (u) => u.email === email && u.password === password,
    );
    if (utilizador) {
      localStorage.setItem("mindnest_sessao", JSON.stringify({ email }));
      return true;
    }
    return false;
  }

  // Remove a sessão ativa — efetivamente faz logout
  static logout() {
    localStorage.removeItem("mindnest_sessao");
  }

  // Devolve true se houver uma sessão ativa no localStorage
  static isLogged() {
    return localStorage.getItem("mindnest_sessao") !== null;
  }

  // Devolve os dados da sessão atual (objeto com email), ou null se não houver sessão
  static getUserLogged() {
    return JSON.parse(localStorage.getItem("mindnest_sessao"));
  }

  // Setter com validação — só atualiza a password se tiver 8 ou mais caracteres
  set password(v) {
    if (v.length < 8) return;
    this.#password = v;
  }
}
