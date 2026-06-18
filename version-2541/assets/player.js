(function () {
  window.initMoviePlayer = function (videoId, playId, source) {
    var video = document.getElementById(videoId);
    var play = document.getElementById(playId);
    var hls = null;
    var ready = false;

    if (!video || !play || !source) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        ready = true;
      }
    }

    function start() {
      attach();
      play.classList.add('is-hidden');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          play.classList.remove('is-hidden');
        });
      }
    }

    play.addEventListener('click', start);
    video.addEventListener('play', function () {
      play.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        play.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      play.classList.remove('is-hidden');
    });
    video.addEventListener('error', function () {
      if (hls) {
        hls.destroy();
        hls = null;
        ready = false;
      }
    });
  };
})();
