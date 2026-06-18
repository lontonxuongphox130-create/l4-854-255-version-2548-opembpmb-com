(function () {
  function setupPlayer(source) {
    var video = document.querySelector("[data-player]");
    var button = document.querySelector("[data-play-button]");
    var error = document.querySelector("[data-play-error]");
    var hls = null;
    var attached = false;

    if (!video || !button || !source) {
      return;
    }

    function showError() {
      if (error) {
        error.textContent = "播放暂时无法加载";
        error.classList.add("is-visible");
      }
      button.classList.remove("is-hidden");
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(showError);
      }
    }

    function attach() {
      if (attached) {
        playVideo();
        return;
      }
      attached = true;
      video.setAttribute("controls", "controls");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        return;
      }
      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
    }

    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      attach();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
