(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (menuToggle && siteNav) {
        menuToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', siteNav.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || './search.html';
            window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
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

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    var searchInput = document.querySelector('[data-card-search]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var list = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    function applyQueryFromUrl() {
        if (!searchInput) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            searchInput.value = query;
        }
    }

    function filterCards() {
        if (!list) {
            return;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var category = categoryFilter ? categoryFilter.value : '';
        var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-row'));
        var visible = 0;

        items.forEach(function (item) {
            var text = (item.getAttribute('data-search') || '').toLowerCase();
            var itemCategory = item.getAttribute('data-category') || '';
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedCategory = !category || itemCategory === category;
            var show = matchedQuery && matchedCategory;
            item.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    applyQueryFromUrl();

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCards);
    }

    filterCards();

    var scrollPlayer = document.querySelector('[data-scroll-player]');
    var player = document.querySelector('[data-player]');

    if (scrollPlayer && player) {
        scrollPlayer.addEventListener('click', function (event) {
            event.preventDefault();
            player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var playButton = player.querySelector('[data-play-button]');
            if (playButton) {
                playButton.focus();
            }
        });
    }
})();
