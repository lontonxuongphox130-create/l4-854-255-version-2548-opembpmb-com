import { H as Hls } from './hls-vendor-dru42stk.js';

function getVideo(targetId) {
    if (!targetId) {
        return document.querySelector('video[data-src]');
    }
    return document.getElementById(targetId);
}

function markPlaying(video) {
    const shell = video.closest('.video-shell');
    if (shell) {
        shell.classList.add('is-playing');
    }
}

function showPlayerError(video, message) {
    const card = video.closest('.player-card');
    if (!card) {
        return;
    }
    let node = card.querySelector('[data-player-message]');
    if (!node) {
        node = document.createElement('p');
        node.className = 'player-note';
        node.dataset.playerMessage = 'true';
        card.appendChild(node);
    }
    node.textContent = message;
}

async function startPlayback(video) {
    const source = video.dataset.src;
    if (!source) {
        showPlayerError(video, '当前影片没有可用播放源。');
        return;
    }

    try {
        if (video.dataset.ready === 'true') {
            await video.play();
            markPlaying(video);
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            await video.play();
            markPlaying(video);
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
            hls.on(Hls.Events.MANIFEST_PARSED, async function () {
                video.dataset.ready = 'true';
                await video.play();
                markPlaying(video);
            });
            hls.on(Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    showPlayerError(video, '播放源加载失败，请检查网络或稍后重试。');
                }
            });
            video._hlsInstance = hls;
            return;
        }

        video.src = source;
        video.dataset.ready = 'true';
        await video.play();
        markPlaying(video);
    } catch (error) {
        showPlayerError(video, '浏览器阻止自动播放，请再次点击播放按钮。');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-play-target]').forEach(function (button) {
        button.addEventListener('click', function () {
            const video = getVideo(button.dataset.playTarget);
            if (video) {
                startPlayback(video);
            }
        });
    });

    document.querySelectorAll('video[data-src]').forEach(function (video) {
        video.addEventListener('play', function () {
            markPlaying(video);
        });
    });
});
