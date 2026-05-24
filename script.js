// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
(function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', 
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
})();

// ═══════════════════════════════════════════════════════════════════════════
// LAZY LOOPING PRODUCT FILMS
// Poster (Screen1.png) paints instantly; MP4 mounts only when a device frame
// enters the viewport. Pauses + rewinds when scrolled away. Respects
// prefers-reduced-motion. One URL — browser cache serves repeat frames.
// ═══════════════════════════════════════════════════════════════════════════
(function initLazyLoopVideos() {
    const videos = document.querySelectorAll('video.lazy-loop');
    if (!videos.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mounted = new WeakSet();

    const mount = (video) => {
        if (mounted.has(video)) return;
        const src = video.getAttribute('data-src');
        if (!src) return;
        mounted.add(video);
        video.src = src;
        video.load();
    };

    const play = (video) => {
        if (reduceMotion) return;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => { /* autoplay policy — poster stays */ });
        }
    };

    const pause = (video) => {
        if (!video.paused) video.pause();
        video.classList.remove('is-ready');
    };

    videos.forEach((video) => {
        video.addEventListener('canplay', () => {
            video.classList.add('is-ready');
        }, { once: true });
    });

    if (!('IntersectionObserver' in window)) {
        videos.forEach((v) => { mount(v); play(v); });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                mount(video);
                if (video.readyState >= 2) {
                    play(video);
                } else {
                    video.addEventListener('canplay', () => play(video), { once: true });
                }
            } else {
                pause(video);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '120px 0px 120px 0px',
    });

    videos.forEach((v) => observer.observe(v));
})();

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SIGNUP — Formspree
// ═══════════════════════════════════════════════════════════════════════════
(function initSignupForms() {
    document.querySelectorAll('.signup-form').forEach(form => {
        const input = form.querySelector('.signup-input');
        const btn = form.querySelector('.signup-btn');
        const success = form.querySelector('.signup-success');
        const error = form.querySelector('.signup-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = input.value.trim();
            if (!email) return;

            btn.classList.add('loading');
            btn.disabled = true;
            if (error) error.style.display = 'none';

            try {
                const res = await fetch('https://formspree.io/f/mlgwbpbj', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (res.ok) {
                    btn.style.opacity = '0';
                    input.style.opacity = '0';
                    setTimeout(() => {
                        if (success) success.style.display = 'flex';
                    }, 300);
                } else {
                    throw new Error('System anomaly. Retry sequence.');
                }
            } catch (err) {
                if (error) {
                    error.textContent = err.message || 'System anomaly. Retry sequence.';
                    error.style.display = 'block';
                }
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        });
    });
})();