(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilter() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var content = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.textContent
        ].join(" ").toLowerCase();
        card.style.display = !query || content.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function renderSearch() {
    var main = document.querySelector('[data-page="search"]');
    var input = document.getElementById("searchInput");
    var target = document.getElementById("searchResults");
    if (!main || !input || !target || !window.SEARCH_ITEMS) {
      return;
    }
    var query = getQuery();
    input.value = query;

    function card(item) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="duration-badge">' + escapeHtml(item.type) + '</span>',
        '<span class="play-hover">▶</span>',
        '</a>',
        '<div class="movie-info">',
        '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>★ ' + item.rating + '</span></div>',
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p>' + escapeHtml(item.desc) + '</p>',
        '<div class="tag-list"><span>' + escapeHtml(item.genre) + '</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }

    function search() {
      var value = input.value.trim().toLowerCase();
      var results = window.SEARCH_ITEMS.filter(function (item) {
        var text = [item.title, item.desc, item.genre, item.year, item.region, item.type].join(" ").toLowerCase();
        return !value || text.indexOf(value) !== -1;
      }).slice(0, 120);
      target.innerHTML = results.map(card).join("");
    }

    input.addEventListener("input", search);
    search();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilter();
    renderSearch();
  });
})();
