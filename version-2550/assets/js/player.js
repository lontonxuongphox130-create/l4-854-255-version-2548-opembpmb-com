(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var url = player.getAttribute('data-video-url');
      var initialized = false;

      function init() {
        if (!video || !url || initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
                video.src = url;
              }
            }
          });
        } else {
          video.src = url;
        }
      }

      function play() {
        init();
        var promise = video.play();
        player.classList.add('is-playing');
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            player.classList.remove('is-playing');
          }
        });
        video.addEventListener('click', function () {
          init();
        }, { once: true });
      }
    });
  });
})();
