// Controlador da página de login/registo.
// Coordena a autenticação com o AuthModel e a interface com o LoginView.
// Gere o login de utilizadores existentes e o registo de novos utilizadores.
import AuthModel from '../models/AuthModel.js';
import {
  getLoginFormData, getRegisterFormData,
  setLoginError, setRegisterError,
  bindLoginSubmit, bindRegisterSubmit,
  bindTabSwitch, applyTab
} from '../views/LoginView.js';

// Processa o formulário de login: valida campos, chama o AuthModel e redireciona para o dashboard
async function handleLogin() {
    const { email, password } = getLoginFormData();

    if (!email || !password) {
        setLoginError('Preenche todos os campos.');
        return;
    }

    const ok = await AuthModel.login(email, password);
    if (ok) {
        window.location.href = 'dashboard.html';
    } else {
        setLoginError('Email ou password incorretos.');
    }
}

// Processa o formulário de registo: valida campos, cria conta e redireciona para o onboarding
async function handleRegister() {
    const { nome, email, password, confirm } = getRegisterFormData();

    if (!nome || !email || !password) {
        setRegisterError('Preenche todos os campos.');
        return;
    }

    if (password.length < 8) {
        setRegisterError('A password deve ter pelo menos 8 caracteres.');
        return;
    }

    if (password !== confirm) {
        setRegisterError('As passwords não coincidem.');
        return;
    }

    const auth = new AuthModel(email, password);
    const ok = await auth.register();

    if (ok) {
        // Guarda o nome temporariamente para ser usado durante o onboarding
        localStorage.setItem('mindnest_nome_temp', nome);
        window.location.href = 'onboarding.html';
    } else {
        setRegisterError('Este email já está registado.');
    }
}

// Inicializa os eventos de troca de tab (login/registo) e submissão dos formulários
document.addEventListener('DOMContentLoaded', function () {
    bindTabSwitch(tab => applyTab(tab));
    bindLoginSubmit(handleLogin);
    bindRegisterSubmit(handleRegister);
});
