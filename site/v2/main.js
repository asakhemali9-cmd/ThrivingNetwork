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

// "Book a working session" form. Requests are sent to HubSpot (EU data
// centre) as form submissions. If sending fails, visitors are shown the direct
// email and phone details instead.
const HUBSPOT_PORTAL_ID = '147879281';
const HUBSPOT_FORM_ID = '2a481c15-844d-4414-984c-b214c20684c9';
const HUBSPOT_ENDPOINTS = ['https://api-eu1.hsforms.com', 'https://api.hsforms.com'];

const form = document.getElementById('session-form');
const thanks = document.getElementById('session-thanks');
const fallback = document.getElementById('session-fallback');

const postToHubSpot = (base, fields) => {
  const hutk = (document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/) || [])[1];
  const context = { pageUri: location.href, pageName: document.title, ...(hutk && { hutk }) };
  return fetch(`${base}/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, context }),
  });
};

const sendToHubSpot = async (address) => {
  const emailField = { objectTypeId: '0-1', name: 'email', value: address };
  const messageField = { objectTypeId: '0-1', name: 'message', value: 'Working session request.' };
  for (const base of HUBSPOT_ENDPOINTS) {
    let res;
    try {
      res = await postToHubSpot(base, [emailField, messageField]);
    } catch {
      continue; // Endpoint unreachable: try the next one.
    }
    if (res.ok) return true;
    if (res.status === 404) continue;
    // The form may not have a Message field; still capture the contact.
    if (res.status === 400) return (await postToHubSpot(base, [emailField])).ok;
    return false;
  }
  return false;
};

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

  const ok = await sendToHubSpot(email.value);

  form.hidden = true;
  (ok ? thanks : fallback).hidden = false;
});
