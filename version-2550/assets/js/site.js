(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function buildResult(movie) {
    var item = document.createElement('a');
    item.className = 'search-result';
    item.href = './' + movie.file;
    item.innerHTML = [
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
      '<span>',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</span>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '</span>'
    ].join('');
    return item;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  ready(function () {
    var year = document.querySelector('[data-year]');
    if (year) {
      year.textContent = new Date().getFullYear();
    }

    var toggle = document.querySelector('.menu-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    setupHero();
    setupGlobalSearch();
    setupPageFilters();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    var carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
    }

    start();
  }

  function setupGlobalSearch() {
    var input = document.querySelector('.global-search-input');
    var panel = document.querySelector('.search-panel');
    var data = window.SEARCH_MOVIES || [];
    if (!input || !panel || !data.length) {
      return;
    }

    function render() {
      var keyword = normalize(input.value);
      panel.innerHTML = '';
      if (!keyword) {
        panel.classList.remove('is-open');
        return;
      }
      var result = data.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.category + ' ' + movie.oneLine).indexOf(keyword) !== -1;
      }).slice(0, 12);

      if (!result.length) {
        var empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = '没有找到相关影片';
        panel.appendChild(empty);
      } else {
        result.forEach(function (movie) {
          panel.appendChild(buildResult(movie));
        });
      }
      panel.classList.add('is-open');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove('is-open');
      }
    });
  }

  function setupPageFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
    scopes.forEach(function (scope) {
      var section = scope.closest('.content-section') || document;
      var input = section.querySelector('.page-filter-input');
      var yearSelect = section.querySelector('.page-filter-year');
      var regionSelect = section.querySelector('.page-filter-region');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      if (!cards.length) {
        return;
      }

      fillSelect(yearSelect, collect(cards, 'year'));
      fillSelect(regionSelect, collect(cards, 'region'));

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-region'));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          var matchRegion = !region || card.getAttribute('data-region') === region;
          card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchRegion));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (regionSelect) {
        regionSelect.addEventListener('change', apply);
      }
    });
  }

  function collect(cards, name) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute('data-' + name);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort().reverse();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }
})();
