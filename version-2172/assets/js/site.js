(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function(dot, dotIndex) {
        dot.addEventListener("click", function() {
          showSlide(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function() {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (filterPanel && cards.length) {
      var searchInput = filterPanel.querySelector(".js-movie-search");
      var categorySelect = filterPanel.querySelector(".js-category-filter");
      var typeSelect = filterPanel.querySelector(".js-type-filter");
      var regionSelect = filterPanel.querySelector(".js-region-filter");
      var yearSelect = filterPanel.querySelector(".js-year-filter");
      var countNode = filterPanel.querySelector("[data-filter-count]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && searchInput) {
        searchInput.value = q;
      }

      function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var category = normalize(categorySelect ? categorySelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;

        cards.forEach(function(card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = "当前显示 " + visible + " 部影片";
        }
      }

      [searchInput, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function(node) {
        if (node) {
          node.addEventListener("input", applyFilters);
          node.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
