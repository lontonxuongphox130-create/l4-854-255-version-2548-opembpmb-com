(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilter(panelNode) {
    var parent = panelNode.parentElement || document;
    var cards = Array.prototype.slice.call(parent.querySelectorAll('[data-card]'));
    var input = panelNode.querySelector('[data-search-input]');
    var count = panelNode.querySelector('[data-result-count]');
    var state = {
      region: '全部',
      genre: '全部'
    };

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input && !input.value) {
      input.value = q;
    }

    panelNode.querySelectorAll('[data-filter]').forEach(function (button) {
      if (button.getAttribute('data-value') === '全部') {
        button.classList.add('is-active');
      }
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-filter');
        state[key] = button.getAttribute('data-value');
        panelNode.querySelectorAll('[data-filter="' + key + '"]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    function applyFilter() {
      var term = normalize(input ? input.value : '');
      var total = 0;

      cards.forEach(function (card) {
        var textValue = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-keywords')
        ].join(' '));
        var region = card.getAttribute('data-region') || '';
        var genre = card.getAttribute('data-genre') || '';
        var matchesTerm = !term || textValue.indexOf(term) !== -1;
        var matchesRegion = state.region === '全部' || region === state.region;
        var matchesGenre = state.genre === '全部' || genre === state.genre;
        var visible = matchesTerm && matchesRegion && matchesGenre;

        card.classList.toggle('is-hidden', !visible);

        if (visible) {
          total += 1;
        }
      });

      if (count) {
        count.textContent = String(total);
      }
    }

    applyFilter();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(setupFilter);
})();
