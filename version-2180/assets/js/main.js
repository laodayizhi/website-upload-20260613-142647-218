(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var current = 0;
        var timer;

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
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var region = root.querySelector('[data-filter-region]');
        var type = root.querySelector('[data-filter-type]');
        var year = root.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-card]'));
        var empty = root.querySelector('[data-empty]');

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function apply() {
            var keyword = valueOf(input);
            var regionValue = valueOf(region);
            var typeValue = valueOf(type);
            var yearValue = valueOf(year);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();

                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (regionValue && valueOf({ value: card.getAttribute('data-region') || '' }) !== regionValue) {
                    matched = false;
                }
                if (typeValue && valueOf({ value: card.getAttribute('data-type') || '' }) !== typeValue) {
                    matched = false;
                }
                if (yearValue && valueOf({ value: card.getAttribute('data-year') || '' }) !== yearValue) {
                    matched = false;
                }

                card.classList.toggle('hidden-by-filter', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, region, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
    });

    var searchRoot = document.querySelector('[data-search-root]');
    if (searchRoot && window.SITE_MOVIES) {
        var searchInput = searchRoot.querySelector('[data-search-input]');
        var searchRegion = searchRoot.querySelector('[data-search-region]');
        var searchType = searchRoot.querySelector('[data-search-type]');
        var resultGrid = searchRoot.querySelector('[data-search-results]');
        var searchEmpty = searchRoot.querySelector('[data-search-empty]');

        function clean(text) {
            return String(text || '').toLowerCase().trim();
        }

        function cardTemplate(movie) {
            return '<a class="movie-card portrait" href="' + movie.url + '">' +
                '<div class="cover-wrap">' +
                    '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">' +
                    '<div class="cover-shade"></div>' +
                    '<span class="pill cover-badge">' + movie.category + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                    '<h2 class="card-title card-title-small">' + movie.title + '</h2>' +
                    '<p class="card-text">' + movie.line + '</p>' +
                    '<div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
                '</div>' +
            '</a>';
        }

        function renderSearch() {
            var keyword = clean(searchInput && searchInput.value);
            var regionValue = clean(searchRegion && searchRegion.value);
            var typeValue = clean(searchType && searchType.value);
            var items = window.SITE_MOVIES.filter(function (movie) {
                var haystack = clean([movie.title, movie.line, movie.category, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' '));
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (regionValue && clean(movie.region) !== regionValue) {
                    return false;
                }
                if (typeValue && clean(movie.type) !== typeValue) {
                    return false;
                }
                return true;
            }).slice(0, 72);

            resultGrid.innerHTML = items.map(cardTemplate).join('');
            if (searchEmpty) {
                searchEmpty.classList.toggle('is-visible', items.length === 0);
            }
        }

        [searchInput, searchRegion, searchType].forEach(function (element) {
            if (element) {
                element.addEventListener('input', renderSearch);
                element.addEventListener('change', renderSearch);
            }
        });

        renderSearch();
    }
}());
