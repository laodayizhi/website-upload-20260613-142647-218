(() => {
    const panel = document.querySelector('[data-player]');

    if (!panel) {
        return;
    }

    const video = panel.querySelector('video');
    const button = panel.querySelector('[data-play-button]');
    const config = document.getElementById('stream-config');
    let stream = '';
    let connected = false;
    let hls = null;

    try {
        stream = JSON.parse(config.textContent).url || '';
    } catch (error) {
        stream = '';
    }

    const connect = () => {
        if (!stream || connected) {
            return;
        }

        connected = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            return;
        }

        video.src = stream;
    };

    const start = () => {
        connect();

        if (button) {
            button.classList.add('is-hidden');
        }

        video.play().catch(() => {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });
    };

    if (button) {
        button.addEventListener('click', start);
    }

    video.addEventListener('click', () => {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', () => {
        if (button) {
            button.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
})();
