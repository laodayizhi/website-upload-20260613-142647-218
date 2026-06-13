(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    var showSlide = function (index) {
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
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var jumpForm = document.querySelector('[data-search-jump]');

  if (jumpForm) {
    jumpForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = jumpForm.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';

      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }

      window.location.href = target;
    });
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

  filterPanels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var list = panel.parentElement.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card, .horizontal-card')) : [];
    var urlQuery = new URLSearchParams(window.location.search).get('q') || '';

    if (input && urlQuery) {
      input.value = urlQuery;
    }

    var applyFilter = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || cardYear.indexOf(year) !== -1;
        var matchesType = !type || cardType.indexOf(type) !== -1;
        var show = matchesQuery && matchesYear && matchesType;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      panel.classList.toggle('is-empty', visible === 0);
    };

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  });
})();
