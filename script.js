const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const shareButtons = document.querySelectorAll('.share-article');
const year = document.querySelector('#current-year');

menuToggle?.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Chiudi menu' : 'Apri menu');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
    navMenu.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Apri menu');
  });
});

shareButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const shareData = { title: 'gamingitaly.it', text: button.dataset.share, url: window.location.href.split('#')[0] };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    try {
      await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      button.innerHTML = 'Link copiato <span aria-hidden="true">✓</span>';
      setTimeout(() => { button.innerHTML = 'Condividi <span aria-hidden="true">↗</span>'; }, 2200);
    } catch {
      button.innerHTML = 'Condivisione non disponibile';
    }
  });
});

if (year) {
  year.textContent = new Date().getFullYear();
}
