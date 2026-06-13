(function () {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var layer = player.querySelector('.play-layer');
        var button = player.querySelector('.play-button');
        var stream = player.getAttribute('data-stream');
        var loaded = false;
        var requested = false;
        var hlsInstance = null;

        function markPlaying() {
            player.classList.add('is-playing');
        }

        function markPaused() {
            if (video.paused) {
                player.classList.remove('is-playing');
            }
        }

        function tryPlay() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(markPlaying).catch(function () {
                    player.classList.remove('is-playing');
                });
            } else {
                markPlaying();
            }
        }

        function loadStream() {
            if (loaded || !stream || !video) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (requested) {
                        tryPlay();
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = stream;
            }
        }

        function startPlayback() {
            requested = true;
            loadStream();
            if (video.readyState > 0 || video.src) {
                tryPlay();
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        }

        if (layer) {
            layer.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', markPlaying);
        video.addEventListener('pause', markPaused);
        video.addEventListener('ended', markPaused);
    });
}());
