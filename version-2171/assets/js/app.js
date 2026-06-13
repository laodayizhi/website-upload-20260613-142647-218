(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-target') || 0));
        restart();
      });
    });

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

    restart();
  }

  function setupLocalFilters() {
    selectAll('.filter-panel').forEach(function (panel) {
      var input = panel.querySelector('.local-filter');
      var chips = selectAll('[data-local-filter]', panel);
      var grid = panel.parentElement.querySelector('.movie-grid');
      if (!grid) {
        return;
      }
      var cards = selectAll('.movie-card', grid);
      var activeTerm = '';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedTerm = !activeTerm || haystack.indexOf(activeTerm) !== -1;
          card.classList.toggle('is-hidden', !(matchedQuery && matchedTerm));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          activeTerm = (chip.getAttribute('data-local-filter') || '').toLowerCase();
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    selectAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var stream = shell.getAttribute('data-stream');
      var attached = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function attach() {
        if (attached) {
          return Promise.resolve();
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal || !hls) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            window.setTimeout(resolve, 1200);
          });
        }

        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        shell.classList.add('is-playing');
        attach().then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              if (overlay) {
                overlay.classList.remove('is-hidden');
              }
            });
          }
        });
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    });
  }

  function markCurrentSearch() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    selectAll('input[name="q"]').forEach(function (input) {
      if (!input.value && q) {
        input.value = q;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupPlayers();
    markCurrentSearch();
  });
})();
