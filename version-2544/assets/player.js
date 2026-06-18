(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupPlayer(card) {
    var video = card.querySelector("video");
    var overlay = card.querySelector(".player-overlay");
    var stream = card.getAttribute("data-stream");
    var mounted = false;
    var hls = null;

    function attach() {
      if (mounted || !video || !stream) {
        return;
      }
      mounted = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!mounted) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
