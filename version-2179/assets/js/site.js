(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }

    var input = scope.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
    var clearButton = scope.querySelector("[data-clear-filters]");
    var countNode = scope.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector("[data-no-results]");
    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function matchSelect(card, key, value) {
      if (!value) {
        return true;
      }
      var cardValue = normalize(card.getAttribute("data-" + key));
      return cardValue.indexOf(normalize(value)) !== -1;
    }

    function filterCards() {
      var query = normalize(input ? input.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));

        var queryMatch = !query || text.indexOf(query) !== -1;
        var selectMatch = selects.every(function (select) {
          return matchSelect(card, select.getAttribute("data-filter-select"), select.value);
        });

        var isVisible = queryMatch && selectMatch;
        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", filterCards);
    });
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        selects.forEach(function (select) {
          select.value = "";
        });
        filterCards();
      });
    }

    filterCards();
  }

  function initHlsPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll("video.js-hls-video"));
    if (!videos.length) {
      return;
    }

    videos.forEach(function (video) {
      var source = video.getAttribute("data-src");
      var status = video.parentElement ? video.parentElement.querySelector("[data-player-status]") : null;
      if (!source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已加载，点击播放器播放。");
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            setStatus("网络波动，正在重新加载播放源。");
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            setStatus("媒体解码异常，正在尝试恢复播放。");
          } else {
            hls.destroy();
            setStatus("当前浏览器暂时无法播放该 HLS 源。");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("当前浏览器使用原生 HLS 播放。");
      } else {
        video.src = source;
        setStatus("播放器已绑定播放源；如无法播放，请使用支持 HLS 的浏览器。");
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initHlsPlayers();
  });
})();
