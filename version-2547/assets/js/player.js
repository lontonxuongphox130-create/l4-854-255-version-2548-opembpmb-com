(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function attach(video) {
    if (video.getAttribute("data-ready") === "1") return;
    var url = video.getAttribute("data-video-url");
    if (!url) return;
    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = url;
    }
    video.setAttribute("data-ready", "1");
  }

  function play(video, overlay) {
    attach(video);
    if (overlay) overlay.classList.add("is-hidden");
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        if (overlay) overlay.classList.remove("is-hidden");
      });
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-area")).forEach(function (area) {
      var video = area.querySelector("video[data-video-url]");
      var overlay = area.querySelector(".play-overlay");
      if (!video) return;
      if (overlay) {
        overlay.addEventListener("click", function () {
          play(video, overlay);
        });
      }
      video.addEventListener("play", function () {
        if (overlay) overlay.classList.add("is-hidden");
      });
      video.addEventListener("click", function () {
        if (video.paused) play(video, overlay);
      });
    });
  });
})();
