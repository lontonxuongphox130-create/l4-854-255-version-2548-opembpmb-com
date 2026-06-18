(function () {
  var Hls = window.Hls;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupHeader() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var categorySelect = panel.querySelector('[data-filter-category]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var noResults = document.querySelector('[data-no-results]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

      function matches(card) {
        var query = normalize(input ? input.value : '');
        var category = normalize(categorySelect ? categorySelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var text = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category
        ].join(' '));
        var categoryOk = !category || normalize(card.dataset.category) === category;
        var yearOk = !year || normalize(card.dataset.year) === year;
        return (!query || text.indexOf(query) !== -1) && categoryOk && yearOk;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var keep = matches(card);
          card.classList.toggle('is-hidden', !keep);
          if (keep) {
            visible += 1;
          }
        });
        if (noResults) {
          noResults.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (categorySelect) {
        categorySelect.addEventListener('change', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (input && q) {
        input.value = q;
      }
      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-play]');
      var message = player.querySelector('[data-player-message]');
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-src');
      var hasLoaded = false;

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add('is-visible');
        }
      }

      function load() {
        if (hasLoaded || !src) {
          return;
        }
        hasLoaded = true;
        player.classList.add('is-loading');
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            player.classList.remove('is-loading');
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }
            player.classList.remove('is-loading');
            showMessage('视频暂时无法播放');
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            player.classList.remove('is-loading');
          }, { once: true });
        } else {
          video.src = src;
          player.classList.remove('is-loading');
        }
      }

      function start() {
        load();
        player.classList.add('is-started');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-started');
          });
        }
      }

      function toggleVideo() {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', toggleVideo);
      video.addEventListener('play', function () {
        player.classList.add('is-started');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-started');
        }
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
