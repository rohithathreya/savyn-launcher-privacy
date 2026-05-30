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
// HERO STORIES PLAYER
// Insta-stories style pair: 2 videos, 2 progress bars above the phone frame,
// prev/next controls flanking the device (not on the screen). Auto-advances on
// `ended`; sequence loops. Active video is
// lazy-mounted on first view; the next video pre-mounts when the active one
// crosses 70% so the swap is buttery.
// ═══════════════════════════════════════════════════════════════════════════
(function initStoriesPlayer() {
    const containers = document.querySelectorAll('[data-stories-player]');
    if (!containers.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    containers.forEach(initOne);

    function initOne(container) {
        const videos = Array.from(container.querySelectorAll('.stories-video'));
        const fills = Array.from(container.querySelectorAll('.stories-bar-fill'));
        const captions = Array.from(container.querySelectorAll('.stories-caption'));
        const prevBtn = container.querySelector('.stories-nav-prev');
        const nextBtn = container.querySelector('.stories-nav-next');
        if (videos.length === 0) return;

        let active = 0;
        let inView = false;
        let rafId = 0;
        const mounted = new WeakSet();

        const mount = (video) => {
            if (mounted.has(video)) return;
            const src = video.getAttribute('data-src');
            if (!src) return;
            mounted.add(video);
            video.src = src;
            video.load();
        };

        const paintBars = () => {
            // Past bars filled, future bars empty, active driven by playback.
            videos.forEach((v, i) => {
                const fill = fills[i];
                if (!fill) return;
                if (i < active) {
                    fill.style.width = '100%';
                } else if (i > active) {
                    fill.style.width = '0%';
                } else {
                    const d = v.duration;
                    if (Number.isFinite(d) && d > 0) {
                        fill.style.width = `${Math.min(100, (v.currentTime / d) * 100)}%`;
                    }
                }
            });
        };

        const tick = () => {
            paintBars();
            // Pre-mount the next video at 70% so swap-in is instant.
            const v = videos[active];
            if (v && Number.isFinite(v.duration) && v.duration > 0) {
                const p = v.currentTime / v.duration;
                if (p > 0.7) {
                    const nextIdx = (active + 1) % videos.length;
                    if (nextIdx !== active) mount(videos[nextIdx]);
                }
            }
            rafId = requestAnimationFrame(tick);
        };

        const startTick = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(tick);
        };
        const stopTick = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
        };

        const playActive = () => {
            const v = videos[active];
            if (!v) return;
            mount(v);
            if (reduceMotion) {
                paintBars();
                return;
            }
            const attempt = v.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(() => { /* autoplay policy — poster stays */ });
            }
            startTick();
        };

        const pauseActive = () => {
            const v = videos[active];
            if (v && !v.paused) v.pause();
            stopTick();
        };

        const swapTo = (nextIdx, direction) => {
            if (nextIdx === active) return;
            const oldV = videos[active];
            if (oldV) {
                oldV.pause();
                oldV.currentTime = 0;
                oldV.classList.remove('is-active');
            }
            // Bar of the leaving slot: fill if going forward, clear if going back.
            const oldFill = fills[active];
            if (oldFill) oldFill.style.width = direction === 'forward' ? '100%' : '0%';

            active = nextIdx;
            const newV = videos[active];
            if (newV) newV.classList.add('is-active');
            const newFill = fills[active];
            if (newFill) newFill.style.width = '0%';

            // Cross-fade the matching caption — only the active one is visible.
            captions.forEach((c, i) => c.classList.toggle('is-active', i === active));

            if (inView) playActive();
        };

        const advance = () => {
            const next = (active + 1) % videos.length;
            swapTo(next, 'forward');
        };
        const back = () => {
            if (active > 0) {
                swapTo(active - 1, 'back');
            } else {
                // First story — tap left restarts it.
                const v = videos[active];
                if (v) {
                    v.currentTime = 0;
                    if (inView) playActive();
                }
            }
        };

        // ended → roll to the next story; loops at the end of the sequence.
        videos.forEach((v, idx) => {
            v.addEventListener('ended', () => {
                if (idx === active) advance();
            });
        });

        if (prevBtn) prevBtn.addEventListener('click', back);
        if (nextBtn) nextBtn.addEventListener('click', advance);

        // ── Hold-to-pause (Insta-stories) ─────────────────────────────────────
        // Press-and-hold on the device frame freezes the current story (video +
        // progress bar fill stop advancing). Release resumes. Short taps don't
        // trigger pause — we wait 140ms before pausing so accidental flicks
        // still feel responsive on the prev/next buttons that live alongside.
        const deviceFrame = container.querySelector('.device-hero');
        if (deviceFrame) {
            let holdTimer = 0;
            let holding = false;
            const HOLD_DELAY_MS = 140;

            const startHold = (e) => {
                // Don't intercept the nav buttons — they're siblings of the
                // device frame and handle their own clicks. We only catch
                // events that originate from the device itself.
                if (e.target.closest('.stories-nav')) return;
                if (holdTimer) clearTimeout(holdTimer);
                holdTimer = setTimeout(() => {
                    holding = true;
                    const v = videos[active];
                    if (v && !v.paused) v.pause();
                    stopTick();
                    container.classList.add('is-holding');
                }, HOLD_DELAY_MS);
            };

            const endHold = () => {
                if (holdTimer) {
                    clearTimeout(holdTimer);
                    holdTimer = 0;
                }
                if (!holding) return;
                holding = false;
                container.classList.remove('is-holding');
                if (inView) playActive();
            };

            // Pointer events cover mouse + touch + stylus in one shot. We bind
            // start to the device, end to the window so a finger sliding off
            // the frame still releases the hold cleanly.
            deviceFrame.addEventListener('pointerdown', startHold);
            window.addEventListener('pointerup', endHold);
            window.addEventListener('pointercancel', endHold);
            // Block the device's context menu on long-press (iOS Safari + some
            // Android browsers show "save image"-style menus on long-press).
            deviceFrame.addEventListener('contextmenu', (e) => {
                if (holding) e.preventDefault();
            });
        }

        if (!('IntersectionObserver' in window)) {
            inView = true;
            playActive();
            return;
        }

        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                inView = e.isIntersecting;
                if (e.isIntersecting) {
                    playActive();
                } else {
                    pauseActive();
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '120px 0px 120px 0px',
        });
        obs.observe(container);
    }
})();

// ═══════════════════════════════════════════════════════════════════════════
// HERO CLUTTER CYCLER
// Rotates the struck-through "noise" phrases above the gold line. Each phrase
// fades in, a gold rule strikes across it, then it fades out as the next
// arrives. Under prefers-reduced-motion we leave the first phrase statically
// struck (no cycling).
// ═══════════════════════════════════════════════════════════════════════════
(function initHeroClutterCycler() {
    const track = document.querySelector('[data-hero-cycler]');
    if (!track) return;

    const items = Array.from(track.querySelectorAll('.hero-cycler-item'));
    if (items.length <= 1) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // first item keeps .is-active — static, struck

    const HOLD_MS = 1200;
    let idx = 0;

    setInterval(() => {
        items[idx].classList.remove('is-active');
        idx = (idx + 1) % items.length;
        items[idx].classList.add('is-active');
    }, HOLD_MS);
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