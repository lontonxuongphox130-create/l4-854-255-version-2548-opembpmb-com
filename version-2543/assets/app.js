(function () {
    const base = document.documentElement.dataset.base || '';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function withBase(path) {
        if (!path) {
            return '#';
        }
        if (/^https?:\/\//.test(path)) {
            return path;
        }
        return base + path.replace(/^\.\//, '');
    }

    function setupMobileMenu() {
        const toggle = document.querySelector('[data-menu-toggle]');
        const panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
        });
    }

    function setupHeroSlider() {
        const slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });
        restart();
    }

    function renderResults(input, panel) {
        const query = normalize(input.value);
        const data = window.MOVIE_SEARCH_DATA || [];
        if (!query) {
            panel.classList.remove('is-open');
            panel.innerHTML = '';
            return;
        }
        const terms = query.split(/\s+/).filter(Boolean);
        const results = data.filter(function (item) {
            const haystack = normalize([
                item.title,
                item.region,
                item.year,
                item.category,
                item.genre,
                item.tags
            ].join(' '));
            return terms.every(function (term) {
                return haystack.includes(term);
            });
        }).slice(0, 24);

        panel.classList.add('is-open');
        if (!results.length) {
            panel.innerHTML = '<div class="empty-result">没有找到匹配影片</div>';
            return;
        }
        panel.innerHTML = results.map(function (item) {
            return [
                '<a class="search-result-item" href="' + withBase(item.url) + '">',
                    '<img src="' + withBase(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
                    '<span>',
                        '<strong>' + item.title + '</strong>',
                        '<span>' + item.region + ' · ' + item.year + ' · ' + item.category + '</span>',
                    '</span>',
                '</a>'
            ].join('');
        }).join('');
    }

    function setupSiteSearch() {
        document.querySelectorAll('form[role="search"]').forEach(function (form) {
            const input = form.querySelector('[data-site-search]');
            const panel = form.querySelector('[data-search-results]');
            if (!input || !panel) {
                return;
            }
            input.addEventListener('input', function () {
                renderResults(input, panel);
            });
            input.addEventListener('focus', function () {
                renderResults(input, panel);
            });
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                renderResults(input, panel);
            });
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove('is-open');
                }
            });
        });
    }

    function setupCardFilters() {
        const scope = document.querySelector('[data-filter-scope]');
        const list = document.querySelector('[data-card-list]');
        if (!scope || !list) {
            return;
        }
        const search = scope.querySelector('[data-card-filter]');
        const year = scope.querySelector('[data-year-filter]');
        const region = scope.querySelector('[data-region-filter]');
        const count = scope.querySelector('[data-filter-count]');
        const cards = Array.from(list.querySelectorAll('[data-movie-card]'));

        function apply() {
            const q = normalize(search && search.value);
            const selectedYear = normalize(year && year.value);
            const selectedRegion = normalize(region && region.value);
            let visible = 0;
            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.year
                ].join(' '));
                const okQuery = !q || haystack.includes(q);
                const okYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
                const okRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
                const show = okQuery && okYear && okRegion;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        [search, year, region].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
    }

    function setupBackToTop() {
        const button = document.querySelector('[data-back-to-top]');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 500);
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroSlider();
        setupSiteSearch();
        setupCardFilters();
        setupBackToTop();
    });
})();
