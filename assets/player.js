import { H as Hls } from './hls-vendor-dru42stk.js';

function initPlayer(shell) {
    var video = shell.querySelector('video[data-src]');
    var playButton = shell.querySelector('[data-play-button]');
    var status = shell.querySelector('[data-player-status]');

    if (!video || !playButton) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hls = null;
    var ready = false;

    function showStatus(message) {
        if (!status) {
            return;
        }
        status.textContent = message;
        status.hidden = false;
    }

    function hideStatus() {
        if (status) {
            status.hidden = true;
        }
    }

    function attachSource() {
        if (ready || !source) {
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
                hideStatus();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showStatus('视频加载失败，请稍后重试');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                ready = true;
                hideStatus();
            }, { once: true });
            video.addEventListener('error', function () {
                showStatus('视频加载失败，请稍后重试');
            });
        } else {
            showStatus('当前浏览器不支持 HLS 播放');
        }
    }

    function startPlayback() {
        attachSource();
        playButton.classList.add('is-hidden');
        video.controls = true;
        var playback = video.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(function () {
                playButton.classList.remove('is-hidden');
            });
        }
    }

    playButton.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });
    video.addEventListener('play', function () {
        playButton.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.controls || video.currentTime === 0) {
            playButton.classList.remove('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);
