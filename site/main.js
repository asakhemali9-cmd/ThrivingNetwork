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

// "Book a working session" form. Submissions are relayed to the partnerships
// inbox by FormSubmit (https://formsubmit.co). Until that inbox confirms the
// one-time activation email, or if the request fails, visitors are shown the
// direct email and phone details instead.
const form = document.getElementById('session-form');
const thanks = document.getElementById('session-thanks');
const fallback = document.getElementById('session-fallback');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.elements.email;
  if (!email.checkValidity()) {
    email.reportValidity();
    return;
  }
  // Honeypot: bots fill hidden fields, people don't.
  if (form.elements._honey.value) return;

  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = 'Sending…';

  let ok = false;
  try {
    const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: email.value,
        _subject: form.elements._subject.value,
        _template: 'table',
        source: location.href,
      }),
    });
    const data = await res.json();
    ok = res.ok && String(data.success) === 'true';
  } catch {
    ok = false;
  }

  form.hidden = true;
  (ok ? thanks : fallback).hidden = false;
});
