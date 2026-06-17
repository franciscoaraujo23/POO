// View da página de login/registo.
// Responsável por ler os dados dos formulários, mostrar erros
// e ligar os eventos de submissão e troca de tab.

// Lê e devolve os dados do formulário de login
export function getLoginFormData() {
  return {
    email: document.getElementById("login-email").value,
    password: document.getElementById("login-password").value,
  };
}

// Lê e devolve os dados do formulário de registo (nome, email, password e confirmação)
export function getRegisterFormData() {
  return {
    nome:     document.getElementById("reg-name").value,
    email:    document.getElementById("reg-email").value,
    password: document.getElementById("reg-password").value,
    confirm:  document.getElementById("reg-confirm").value,
  };
}

// Mostra uma mensagem de erro no formulário de login
export function setLoginError(message) {
  document.getElementById('login-error').textContent = message;
}

// Mostra uma mensagem de erro no formulário de registo
export function setRegisterError(message) {
  document.getElementById('reg-error').textContent = message;
}

// Liga o evento de submissão do formulário de login ao handler recebido
export function bindLoginSubmit(handler) {
  document.getElementById('form-login')
    .querySelector('form')
    .addEventListener('submit', function(e) {
      e.preventDefault();
      handler();
    });
}

// Liga o evento de submissão do formulário de registo ao handler recebido
export function bindRegisterSubmit(handler) {
  document.getElementById('form-register')
    .querySelector('form')
    .addEventListener('submit', function(e) {
      e.preventDefault();
      handler();
    });
}

// Aplica visualmente a tab ativa (login ou registo): mostra o formulário correto e destaca o tab
export function applyTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-register').classList.toggle('hidden', isLogin);
}

// Liga os elementos com data-switch-tab ao handler de troca de tab
export function bindTabSwitch(handler) {
  document.querySelectorAll('[data-switch-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      handler(el.dataset.switchTab);
    });
  });
}
