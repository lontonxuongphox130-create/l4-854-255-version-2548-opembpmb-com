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
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function schedule() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(target);
        schedule();
      });
    });
    schedule();
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var targetSelector = panel.getAttribute("data-target");
      var target = targetSelector ? document.querySelector(targetSelector) : document;
      if (!target) return;
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      var input = panel.querySelector(".js-search-input");
      var region = panel.querySelector(".js-region-filter");
      var year = panel.querySelector(".js-year-filter");

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          card.classList.toggle("hidden", !(matchKeyword && matchRegion && matchYear));
        });
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
