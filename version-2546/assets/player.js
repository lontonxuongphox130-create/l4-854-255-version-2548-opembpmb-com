(function () {
  function init(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var status = box.querySelector('.player-status');
    var src = box.getAttribute('data-hls');
    var hls = null;

    function showStatus(text) {
      if (!status) {
        return;
      }
      status.textContent = text;
      status.classList.add('is-visible');
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function prepare() {
      if (!video || !src) {
        showStatus('播放加载失败，请稍后重试');
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            showStatus('正在重新连接');
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            showStatus('正在恢复播放');
          } else {
            showStatus('播放加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        showStatus('播放加载失败，请稍后重试');
      }
    }

    function start() {
      if (!video) {
        return;
      }
      var promise = video.play();
      hideOverlay();
      if (promise && promise.catch) {
        promise.catch(function () {
          showStatus('点击视频继续播放');
        });
      }
    }

    prepare();

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', hideOverlay);
      video.addEventListener('pause', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.player-box').forEach(init);
})();
