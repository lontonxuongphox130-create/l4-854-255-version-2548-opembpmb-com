(function () {
  function setMenu(open) {
    var menu = document.querySelector('.js-mobile-menu');
    var body = document.body;
    if (!menu) {
      return;
    }
    menu.classList.toggle('is-open', open);
    body.classList.toggle('is-menu-open', open);
  }

  document.querySelectorAll('.js-mobile-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var menu = document.querySelector('.js-mobile-menu');
      setMenu(!menu.classList.contains('is-open'));
    });
  });

  var carousel = document.querySelector('.js-hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        show(Number(dot.getAttribute('data-hero-dot')));
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function filterCards(input) {
    var target = document.querySelector(input.getAttribute('data-target'));
    if (!target) {
      return;
    }
    var value = input.value.trim().toLowerCase();
    target.querySelectorAll('.movie-card').forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      card.style.display = !value || haystack.indexOf(value) > -1 ? '' : 'none';
    });
  }

  document.querySelectorAll('.js-filter-input').forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input);
    });
  });

  document.querySelectorAll('.js-sort-select').forEach(function (select) {
    select.addEventListener('change', function () {
      var target = document.querySelector(select.getAttribute('data-target'));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
      var mode = select.value;
      cards.sort(function (a, b) {
        if (mode === 'rating') {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        }
        if (mode === 'views') {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        }
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });
      cards.forEach(function (card) {
        target.appendChild(card);
      });
    });
  });

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\'': '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  var results = document.querySelector('[data-search-results]');
  if (results && window.MOVIE_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var titleNode = document.querySelector('[data-search-title]');
    var countNode = document.querySelector('[data-search-count]');
    var qInput = document.querySelector('[data-search-input]');

    if (qInput) {
      qInput.value = query;
    }
    if (titleNode) {
      titleNode.textContent = query ? '搜索结果：' + query : '搜索影片';
    }

    var normalized = query.toLowerCase();
    var matched = window.MOVIE_DATA.filter(function (movie) {
      if (!normalized) {
        return false;
      }
      return movie.search.toLowerCase().indexOf(normalized) > -1;
    });

    if (countNode) {
      countNode.textContent = query ? '找到 ' + matched.length + ' 部相关影片' : '输入关键词查找影片';
    }

    if (!query) {
      results.innerHTML = '<div class="empty-state"><h2>输入关键词开始搜索</h2><p>可搜索片名、地区、题材、标签或剧情关键词。</p></div>';
    } else if (!matched.length) {
      results.innerHTML = '<div class="empty-state"><h2>未找到相关影片</h2><p>可以尝试更短的片名、题材或地区关键词。</p><a class="btn btn-primary" href="movies.html">浏览全部影片</a></div>';
    } else {
      results.innerHTML = matched.map(function (movie) {
        return '<a class="movie-card card card-hover animate-fade-in" href="video/movie-' + movie.id + '.html">' +
          '<div class="movie-thumb"><img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy" decoding="async"><span class="duration-badge">' + escapeHTML(movie.duration) + '</span><span class="play-badge">▶</span></div>' +
          '<div class="movie-body"><span class="category-badge">' + escapeHTML(movie.category) + '</span><h3>' + escapeHTML(movie.title) + '</h3><p>' + escapeHTML(movie.oneLine) + '</p><div class="movie-meta"><span>' + escapeHTML(movie.year) + '</span><span>★ ' + escapeHTML(movie.rating) + '</span><span>' + escapeHTML(movie.views) + '</span></div></div>' +
          '</a>';
      }).join('');
    }
  }
})();
