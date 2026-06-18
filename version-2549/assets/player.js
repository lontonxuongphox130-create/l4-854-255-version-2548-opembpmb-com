(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function showMessage(player, text) {
    var message = player.querySelector(".player-message");
    if (message) {
      message.textContent = text;
      message.hidden = false;
    }
  }

  function initPlayer(player) {
    var video = player.querySelector("video");
    var poster = player.querySelector(".player-poster");
    var playButton = player.querySelector(".player-play");
    var muteButton = player.querySelector(".player-mute");
    var fullButton = player.querySelector(".player-full");
    var source = player.getAttribute("data-src");
    var initialized = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function bindSource() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;
      return new Promise(function (resolve, reject) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", resolve, { once: true });
          video.addEventListener("error", reject, { once: true });
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error("load"));
            }
          });
          return;
        }
        reject(new Error("unavailable"));
      });
    }

    function updatePlayState() {
      if (playButton) {
        playButton.textContent = video.paused ? "播放" : "暂停";
      }
    }

    function start() {
      bindSource().then(function () {
        if (poster) {
          poster.classList.add("is-hidden");
        }
        return video.play();
      }).catch(function () {
        showMessage(player, "播放加载失败，请稍后再试");
      });
    }

    function toggle() {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    if (poster) {
      poster.addEventListener("click", start);
    }
    if (playButton) {
      playButton.addEventListener("click", toggle);
    }
    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      });
    }
    if (fullButton) {
      fullButton.addEventListener("click", function () {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }
    video.addEventListener("click", toggle);
    video.addEventListener("play", updatePlayState);
    video.addEventListener("pause", updatePlayState);
    video.addEventListener("ended", updatePlayState);
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(initPlayer);
  });
})();
