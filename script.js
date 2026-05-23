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
// Mounts each .lazy-loop <video> source only when it scrolls near the viewport,
// then plays muted and pauses again when it leaves. Keeps the page light and
// the films feel "alive" without forcing eager downloads.
// ═══════════════════════════════════════════════════════════════════════════
(function initLazyLoopVideos() {
    const videos = document.querySelectorAll('video.lazy-loop');
    if (!videos.length || !('IntersectionObserver' in window)) {
        // Fallback: just attach the src directly.
        videos.forEach(v => {
            const src = v.getAttribute('data-src');
            if (src && !v.src) v.src = src;
        });
        return;
    }

    const mount = (video) => {
        const src = video.getAttribute('data-src');
        if (src && !video.src) video.src = src;
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                mount(video);
                const playAttempt = video.play();
                if (playAttempt && typeof playAttempt.catch === 'function') {
                    playAttempt.catch(() => { /* autoplay blocked — that's fine */ });
                }
            } else {
                if (!video.paused) video.pause();
            }
        });
    }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

    videos.forEach(v => observer.observe(v));
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