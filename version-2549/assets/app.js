(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!opened));
      menu.hidden = opened;
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var result = panel.querySelector("[data-filter-result]");
    var items = Array.prototype.slice.call(document.querySelectorAll(".searchable-item"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && input) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function matchItem(item, keyword, selectedRegion, selectedYear, selectedType) {
      var searchText = normalize(item.getAttribute("data-search"));
      var itemRegion = item.getAttribute("data-region") || "";
      var itemYear = item.getAttribute("data-year") || "";
      var itemType = item.getAttribute("data-type") || "";
      if (keyword && searchText.indexOf(keyword) === -1) {
        return false;
      }
      if (selectedRegion && itemRegion !== selectedRegion) {
        return false;
      }
      if (selectedYear && itemYear !== selectedYear) {
        return false;
      }
      if (selectedType && itemType !== selectedType) {
        return false;
      }
      return true;
    }

    function filter() {
      var keyword = normalize(input && input.value);
      var selectedRegion = region ? region.value : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      var visible = 0;
      items.forEach(function (item) {
        var matched = matchItem(item, keyword, selectedRegion, selectedYear, selectedType);
        item.classList.toggle("is-hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (result) {
        result.textContent = visible > 0 ? "已匹配 " + visible + " 部影片" : "未找到相关影片";
      }
    }

    [input, region, year, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", filter);
      control.addEventListener("change", filter);
    });
    filter();
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
