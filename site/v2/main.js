// Mobile menu toggle.
const header = document.querySelector('.site-header');
const toggle = header?.querySelector('.nav-toggle');
const setMenu = (open) => {
  header.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
toggle?.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
header?.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && header?.classList.contains('is-open')) setMenu(false); });
