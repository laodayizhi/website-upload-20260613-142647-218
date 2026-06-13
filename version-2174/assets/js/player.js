import { H as Hls } from './hls-vendor.js';

function initializeHlsVideo(video) {
  const source = video.getAttribute('data-hls-src');

  if (!source) {
    return;
  }

  const canUseNativeHls = Boolean(
    video.canPlayType('application/vnd.apple.mpegurl') ||
    video.canPlayType('application/x-mpegURL')
  );

  if (canUseNativeHls) {
    video.src = source;
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    video._hlsInstance = hls;
    return;
  }

  video.src = source;
}

function setupPlayOverlay(button) {
  const targetId = button.getAttribute('data-player-target');
  const video = targetId ? document.getElementById(targetId) : null;

  if (!video) {
    return;
  }

  button.addEventListener('click', function () {
    button.hidden = true;
    video.play().catch(function () {
      button.hidden = false;
    });
  });

  video.addEventListener('play', function () {
    button.hidden = true;
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.hidden = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('video[data-hls-src]').forEach(initializeHlsVideo);
  document.querySelectorAll('.player-overlay').forEach(setupPlayOverlay);
});
