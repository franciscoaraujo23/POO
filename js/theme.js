// Gere o tema visual (claro/escuro) da aplicação.
// Guarda a preferência no localStorage e aplica-a automaticamente ao carregar a página.
(function () {
  // Ícones SVG para o botão de toggle
  const MOON = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const SUN  = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  // Aplica o tema ao elemento raiz e atualiza o ícone e o texto do botão
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon  = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (icon)  icon.innerHTML = theme === 'dark' ? SUN : MOON;
    if (label) label.textContent = theme === 'dark' ? 'Modo claro' : 'Modo noturno';
  }

  // Alterna entre modo claro e escuro e guarda a escolha no localStorage
  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mindnest-theme', next);
    applyTheme(next);
  };

  // Ao carregar a página, aplica o tema guardado e liga os botões de toggle
  document.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('mindnest-theme') || 'light';
    applyTheme(saved);
    document.querySelectorAll('.theme-toggle, .ob-theme-btn').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  });
})();
