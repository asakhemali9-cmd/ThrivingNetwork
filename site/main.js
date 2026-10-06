// Image placeholders: any .media[data-placeholder] without an <img> shows a
// captioned empty state until a real photo or logo is dropped in.
const PH_ICON =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' +
  '<path d="m21 15-5-5L5 21"/></svg>';

document.querySelectorAll('.media[data-placeholder]').forEach((el) => {
  if (el.querySelector('img')) return;
  const ph = document.createElement('div');
  ph.className = 'media__ph';
  ph.innerHTML = PH_ICON;
  const cap = document.createElement('span');
  cap.textContent = el.dataset.placeholder;
  ph.appendChild(cap);
  el.appendChild(ph);
});

// "Book a working session" form: swap to the confirmation message on submit.
// TODO: post the email to the partnerships inbox / CRM once an endpoint exists.
const form = document.getElementById('session-form');
const thanks = document.getElementById('session-thanks');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = form.elements.email;
  if (!email.checkValidity()) {
    email.reportValidity();
    return;
  }
  form.hidden = true;
  thanks.hidden = false;
});
