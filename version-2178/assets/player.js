(function () {
  window.setupMoviePlayer = function setupMoviePlayer(streamUrl) {
    var player = document.querySelector('[data-player]');

    if (!player || !streamUrl) {
      return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var trigger = player.querySelector('.player-trigger');
    var started = false;
    var hlsInstance = null;

    var attachStream = function () {
      if (started || !video) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    var playVideo = function () {
      attachStream();
      player.classList.add('is-playing');

      var playPromise = video.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    };

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
