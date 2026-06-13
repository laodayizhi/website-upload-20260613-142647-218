(function () {
  var ready = function (callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.hidden = expanded;
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    var show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };
    var play = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    root.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    root.addEventListener('mouseleave', play);
    play();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var grid = panel.parentElement.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var search = panel.querySelector('[data-filter-search]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var apply = function () {
        var q = (search && search.value || '').trim().toLowerCase();
        var typeValue = type && type.value || '';
        var yearValue = year && year.value || '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-category'),
            card.getAttribute('data-region'),
            card.textContent
          ].join(' ').toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (typeValue && haystack.indexOf(typeValue.toLowerCase()) === -1) {
            ok = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            ok = false;
          }
          card.hidden = !ok;
        });
      };
      [search, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-page-input]');
    if (!results || !input || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    var render = function () {
      var q = input.value.trim().toLowerCase();
      var list = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.category,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(renderCard).join('');
    };
    input.addEventListener('input', render);
    if (initial) {
      render();
    }
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-title="' + escapeAttr(movie.title) + '" data-year="' + escapeAttr(movie.year) + '" data-type="' + escapeAttr(movie.type) + '" data-category="' + escapeAttr(movie.category) + '" data-region="' + escapeAttr(movie.region) + '">' +
        '<a class="poster-link" href="' + escapeAttr(movie.url) + '">' +
          '<span class="poster-glow"></span>' +
          '<img loading="lazy" src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '">' +
          '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
          '<span class="poster-play">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
          '<h3><a href="' + escapeAttr(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initPlayer() {
    var video = document.querySelector('.movie-player[data-hls]');
    if (!video) {
      return;
    }
    var button = document.querySelector('.player-start');
    var url = video.getAttribute('data-hls');
    var loaded = false;
    var load = function () {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        window.__hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    };
    var start = function () {
      load();
      if (button) {
        button.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });
    load();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[match];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }
})();
