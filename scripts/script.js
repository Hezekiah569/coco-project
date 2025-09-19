(function () {
    const cursor = document.getElementById('cursor');

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;
    let px = tx, py = ty;
    let angle = 0;
    const ease = 0.18;

    function onPointerMove(e) {
        tx = e.clientX;
        ty = e.clientY;
    }

    function computeAngle(fromX, fromY, toX, toY) {
        return Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    }

    function raf() {
        x += (tx - x) * ease;
        y += (ty - y) * ease;
        const a = computeAngle(px, py, x, y);
        angle += (a - angle) * 0.25;
        cursor.style.transform = `translate(${x - 32}px, ${y - 32}px) rotate(${angle}deg)`;
        px += (x - px) * 0.35;
        py += (y - py) * 0.35;
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Audio buffer method
    let audioCtx = null;
    let clickBuffer = null;

    async function loadClickSound() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const resp = await fetch("assets/tapos-na-po.mp3"); // path updated to assets folder
        const data = await resp.arrayBuffer();
        clickBuffer = await audioCtx.decodeAudioData(data);
    }

    function playClickSound() {
        if (!clickBuffer) return;
        const source = audioCtx.createBufferSource();
        source.buffer = clickBuffer;
        source.connect(audioCtx.destination);
        source.start();
    }

    function onPointerDown(e) {
        cursor.classList.add('pressed');
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        playClickSound();
    }

    function onPointerUp(e) {
        cursor.classList.remove('pressed');
    }

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
        document.body.style.cursor = 'auto';
        cursor.style.display = 'none';
        window.removeEventListener('pointermove', onPointerMove);
    }

    document.addEventListener('selectstart', e => e.preventDefault());

    tx = x; ty = y;

    const initAudioOnFirstGesture = function (e) {
        loadClickSound();
        window.removeEventListener('pointerdown', initAudioOnFirstGesture);
    };
    window.addEventListener('pointerdown', initAudioOnFirstGesture, { passive: true });

})();

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active'); // animate hamburger to X
});

// Auto-play videos on hover, toggle mute, and custom draggable progress bar
document.querySelectorAll('.friend-card video').forEach(video => {
    const wrapper = video.closest('.video-wrapper');
    const volumeOverlay = wrapper.querySelector('.volume-overlay');
    const progressContainer = wrapper.querySelector('.progress-container');
    const progressBar = wrapper.querySelector('.progress-bar');

    let isDragging = false;

    // Hover preview (muted)
    video.addEventListener('mouseenter', () => {
        video.muted = true;
        video.play();
        if (volumeOverlay) volumeOverlay.textContent = '🔇';
    });

    // Pause on leave
    video.addEventListener('mouseleave', () => {
        video.pause();
    });

    // Update progress bar while playing (skip if dragging)
    video.addEventListener('timeupdate', () => {
        if (!isDragging && progressBar) {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = percent + '%';
        }
    });

    // Function to scrub
    function scrub(e) {
        const rect = progressContainer.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const newTime = Math.max(0, Math.min(offsetX / rect.width, 1)) * video.duration;
        video.currentTime = newTime;
        const percent = (newTime / video.duration) * 100;
        progressBar.style.width = percent + '%';
    }

    // Start drag
    progressContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        scrub(e);
    });

    // Dragging
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            scrub(e);
        }
    });

    // Stop drag
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
        }
    });

    // Toggle mute via video click
    video.addEventListener('click', () => {
        video.muted = !video.muted;
        if (!video.paused) video.play();
        if (volumeOverlay) volumeOverlay.textContent = video.muted ? '🔇' : '🔊';
    });

    // Toggle mute via volume icon click
    if (volumeOverlay) {
        volumeOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            if (!video.paused) video.play();
            volumeOverlay.textContent = video.muted ? '🔇' : '🔊';
        });
    }
});


