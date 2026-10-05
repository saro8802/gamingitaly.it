const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
const menuLinks = document.querySelectorAll('#site-menu a');
const year = document.querySelector('#current-year');

menuToggle?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Chiudi menu' : 'Apri menu');
});

menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Apri menu');
  });
});

if (year) {
  year.textContent = new Date().getFullYear();
}