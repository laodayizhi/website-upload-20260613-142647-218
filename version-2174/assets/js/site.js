(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = !mobileNav.hasAttribute('hidden');
      if (isOpen) {
        mobileNav.setAttribute('hidden', '');
        menuToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileNav.removeAttribute('hidden');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('[data-go-slide]'));
  let currentSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startSlider() {
    if (slides.length <= 1) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const target = Number(dot.getAttribute('data-go-slide') || 0);
      showSlide(target);
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  const quickSearchForms = document.querySelectorAll('.quick-search-form');
  quickSearchForms.forEach(function (form) {
    form.addEventListener('submit', function () {
      const input = form.querySelector('input[name="q"]');
      if (input) {
        input.value = input.value.trim();
      }
    });
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilterPanel(panel) {
    const list = panel.parentElement.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const input = panel.querySelector('.filter-input');
    const selects = Array.from(panel.querySelectorAll('.filter-select'));
    const count = panel.querySelector('[data-filter-count]');

    function applyFilters() {
      const query = normalize(input ? input.value : '');
      const selected = {};

      selects.forEach(function (select) {
        const key = select.getAttribute('data-filter-key');
        if (key) {
          selected[key] = normalize(select.value);
        }
      });

      let visible = 0;
      cards.forEach(function (card) {
        const text = normalize(card.textContent);
        const matchesQuery = !query || text.indexOf(query) !== -1;
        const matchesSelects = Object.keys(selected).every(function (key) {
          return !selected[key] || normalize(card.dataset[key]).indexOf(selected[key]) !== -1;
        });
        const shouldShow = matchesQuery && matchesSelects;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get('q');
    if (queryFromUrl && input) {
      input.value = queryFromUrl;
    }

    applyFilters();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(setupFilterPanel);
}());
