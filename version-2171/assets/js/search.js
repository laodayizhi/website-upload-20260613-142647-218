(function () {
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

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <span class="poster-frame">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</em>',
      '    <span class="card-line">' + escapeHtml(movie.oneLine) + '</span>',
      '    <span class="tag-row">' + tags + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function run() {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var title = document.getElementById('search-title');
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    input.value = q;
    var list = window.SEARCH_MOVIES;
    if (q) {
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });
      title.textContent = '“' + q + '”相关影片';
    } else {
      list = list.slice(0, 36);
      title.textContent = '热门影片搜索';
    }
    if (!list.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配的影片，可以尝试更换片名、题材或地区继续搜索。</div>';
      return;
    }
    results.innerHTML = list.slice(0, 120).map(card).join('');
  }

  document.addEventListener('DOMContentLoaded', run);
})();
