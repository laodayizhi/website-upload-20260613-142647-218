(() => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const show = (index) => {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => show(index));
        });

        window.setInterval(() => show(current + 1), 5200);
    }

    const input = document.querySelector('[data-search-input]');
    const items = Array.from(document.querySelectorAll('[data-search-item]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-button]'));
    let activeFilter = '';

    const apply = () => {
        const term = input ? input.value.trim().toLowerCase() : '';

        items.forEach((item) => {
            const keywords = (item.getAttribute('data-keywords') || '').toLowerCase();
            const matchesTerm = !term || keywords.includes(term);
            const matchesFilter = !activeFilter || keywords.includes(activeFilter.toLowerCase());
            item.hidden = !(matchesTerm && matchesFilter);
        });
    };

    if (input) {
        const query = new URLSearchParams(window.location.search).get('q');

        if (query) {
            input.value = query;
        }

        input.addEventListener('input', apply);
        apply();
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.getAttribute('data-filter-button') || '';

            filterButtons.forEach((entry) => {
                entry.classList.toggle('active', entry === button);
            });

            apply();
        });
    });
})();
