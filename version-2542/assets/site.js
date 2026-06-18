(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupRails() {
    document.querySelectorAll("[data-rail]").forEach(function (wrap) {
      var rail = wrap.querySelector("[data-rail-track]");
      var prev = wrap.querySelector("[data-rail-prev]");
      var next = wrap.querySelector("[data-rail-next]");
      if (!rail) {
        return;
      }
      function move(direction) {
        rail.scrollBy({ left: direction * Math.min(420, rail.clientWidth), behavior: "smooth" });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          move(-1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          move(1);
        });
      }
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var scope = document.querySelector(input.getAttribute("data-filter-scope")) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
          card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });
  }

  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    var poster = document.createElement("a");
    poster.className = "poster";
    poster.href = "./" + movie.file;
    var img = document.createElement("img");
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = "lazy";
    var year = document.createElement("span");
    year.className = "poster-year";
    year.textContent = movie.year;
    var play = document.createElement("span");
    play.className = "poster-play";
    play.textContent = "▶";
    poster.appendChild(img);
    poster.appendChild(year);
    poster.appendChild(play);
    var body = document.createElement("div");
    body.className = "card-body";
    var title = document.createElement("h3");
    var link = document.createElement("a");
    link.href = "./" + movie.file;
    link.textContent = movie.title;
    title.appendChild(link);
    var desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = movie.one_line;
    var tags = document.createElement("div");
    tags.className = "card-tags";
    movie.tags.slice(0, 3).forEach(function (tag) {
      var span = document.createElement("span");
      span.textContent = tag;
      tags.appendChild(span);
    });
    var meta = document.createElement("div");
    meta.className = "card-meta";
    [movie.region, movie.type, movie.rating.toFixed(1) + "分"].forEach(function (value) {
      var span = document.createElement("span");
      span.textContent = value;
      meta.appendChild(span);
    });
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(tags);
    body.appendChild(meta);
    article.appendChild(poster);
    article.appendChild(body);
    return article;
  }

  function setupSearchPage() {
    var mount = document.querySelector("[data-search-results]");
    if (!mount || !window.SEARCH_MOVIES) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render(query) {
      var q = query.trim().toLowerCase();
      mount.innerHTML = "";
      if (title) {
        title.textContent = q ? "搜索：" + query.trim() : "影片搜索";
      }
      if (!q) {
        var empty = document.createElement("div");
        empty.className = "search-empty";
        empty.textContent = "输入片名、类型、地区或标签，快速查找想看的影片。";
        mount.appendChild(empty);
        return;
      }
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.genre, movie.one_line, movie.tags.join(" ")].join(" ").toLowerCase().indexOf(q) !== -1;
      });
      if (!results.length) {
        var none = document.createElement("div");
        none.className = "search-empty";
        none.textContent = "未找到相关影片，换个关键词试试。";
        mount.appendChild(none);
        return;
      }
      var grid = document.createElement("div");
      grid.className = "movie-grid";
      results.slice(0, 240).forEach(function (movie) {
        grid.appendChild(createCard(movie));
      });
      mount.appendChild(grid);
    }

    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        history.replaceState(null, "", url);
        render(query);
      });
    }
    render(initial);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupRails();
    setupFilters();
    setupSearchPage();
  });
})();
