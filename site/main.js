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

// "Book a working session" form. Requests are sent to HubSpot (portal on the
// EU data centre) as form submissions: the visitor's email plus a "message"
// listing the interests they ticked. If sending fails, visitors are shown the
// direct email and phone details instead.
var HUBSPOT_PORTAL_ID = '147879281';
var HUBSPOT_FORM_ID = '2a481c15-844d-4414-984c-b214c20684c9';
var HUBSPOT_ENDPOINTS = ['https://api-eu1.hsforms.com', 'https://api.hsforms.com'];

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

  function hubSpotFields(address, interestText) {
    var fields = [{ objectTypeId: '0-1', name: 'email', value: address }];
    if (interestText !== null) {
      fields.push({ objectTypeId: '0-1', name: 'message', value: 'Working session request. Interested in: ' + interestText });
    }
    return fields;
  }

  async function postToHubSpot(base, fields) {
    var hutk = (document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/) || [])[1];
    var context = { pageUri: location.href, pageName: document.title };
    if (hutk) context.hutk = hutk;
    return fetch(base + '/submissions/v3/integration/submit/' +
      encodeURIComponent(HUBSPOT_PORTAL_ID) + '/' + encodeURIComponent(HUBSPOT_FORM_ID), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields, context: context })
    });
  }

  async function sendToHubSpot(address, interestText) {
    for (var i = 0; i < HUBSPOT_ENDPOINTS.length; i++) {
      var res;
      try {
        res = await postToHubSpot(HUBSPOT_ENDPOINTS[i], hubSpotFields(address, interestText));
      } catch (err) {
        continue; // Endpoint unreachable: try the next one.
      }
      if (res.ok) return true;
      if (res.status === 404) continue;
      if (res.status === 400) {
        // The form may not have a Message field; still capture the contact.
        res = await postToHubSpot(HUBSPOT_ENDPOINTS[i], hubSpotFields(address, null));
        return res.ok;
      }
      return false;
    }
    return false;
  }

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

    var interestText = interests.length ? interests.join(', ') : 'Not specified';
    var ok = false;
    try {
      ok = await sendToHubSpot(email.value, interestText);
    } catch (err) {
      ok = false;
    }

    form.hidden = true;
    (ok ? thanks : fallback).hidden = false;
  });
})();
