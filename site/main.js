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
