// Mobile menu toggle.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = header.querySelector('.nav-toggle');

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(!header.classList.contains('is-open'));
  });
  header.querySelectorAll('.site-nav a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) setMenu(false);
  });
})();

// "Where are you today?" chooser: highlights the matching product card.
(function () {
  var options = document.querySelectorAll('[data-pick]');
  var grid = document.getElementById('products');
  var cards = grid.querySelectorAll('.product');
  var pick = null;

  function render() {
    grid.classList.toggle('has-pick', pick !== null);
    options.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.pick === pick));
    });
    cards.forEach(function (card) {
      card.classList.toggle('is-match', card.dataset.key === pick);
    });
  }

  options.forEach(function (btn) {
    btn.addEventListener('click', function () {
      pick = pick === btn.dataset.pick ? null : btn.dataset.pick;
      render();
    });
  });
})();

// "Book a working session" form. Submissions are relayed to the partnerships
// inbox by FormSubmit (https://formsubmit.co). Until that inbox confirms the
// one-time activation email, or if the request fails, visitors are shown the
// direct email and phone details instead.
(function () {
  var form = document.getElementById('cta-form');
  var thanks = document.getElementById('cta-thanks');
  var fallback = document.getElementById('cta-fallback');
  var email = document.getElementById('cta-email');
  var toggles = form.querySelectorAll('.interests button');

  function setInterest(label, on) {
    toggles.forEach(function (btn) {
      if (btn.dataset.label === label) btn.setAttribute('aria-pressed', String(on));
    });
  }

  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
    });
  });

  // Section CTAs that jump to the form pre-select the relevant interest.
  document.querySelectorAll('[data-interest]').forEach(function (link) {
    link.addEventListener('click', function () {
      setInterest(link.dataset.interest, true);
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    // Honeypot: bots fill hidden fields, people don't.
    if (form.elements._honey.value) return;

    var interests = Array.prototype.filter
      .call(toggles, function (btn) { return btn.getAttribute('aria-pressed') === 'true'; })
      .map(function (btn) { return btn.dataset.label; });

    var button = form.querySelector('button[type=submit]');
    button.disabled = true;
    button.textContent = 'Sending…';

    var ok = false;
    try {
      var res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email.value,
          interested_in: interests.length ? interests.join(', ') : 'Not specified',
          _subject: form.elements._subject.value,
          _template: 'table',
          source: location.href
        })
      });
      var data = await res.json();
      ok = res.ok && String(data.success) === 'true';
    } catch (err) {
      ok = false;
    }

    form.hidden = true;
    (ok ? thanks : fallback).hidden = false;
  });
})();
