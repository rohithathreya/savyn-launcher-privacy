// ═══════════════════════════════════════════════════════════════════════════
// SOTA SPOTLIGHT EFFECT (Mouse tracking for Bento Grid)
// ═══════════════════════════════════════════════════════════════════════════

(function initSpotlightEffect() {
    const cardsContainer = document.getElementById('cards-container');
    if (!cardsContainer) return;

    cardsContainer.addEventListener('mousemove', (e) => {
        // Iterate through all cards in the grid
        for (const card of cardsContainer.children) {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to each specific card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set CSS variables on the card element
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL ANIMATIONS — Smooth Intersection Observer
// ═══════════════════════════════════════════════════════════════════════════

(function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before it hits the bottom
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed if you don't want it to repeat
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Grab everything with the animate class
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    // Add staggered delay for bento grid children so they don't pop in all at once
    const bentoCards = document.querySelectorAll('.bento-card.animate-on-scroll');
    bentoCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    elements.forEach(el => observer.observe(el));
})();

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SIGNUP — Formspree
// ═══════════════════════════════════════════════════════════════════════════

(function initSignupForms() {
    document.querySelectorAll('.signup-form').forEach(form => {
        const input = form.querySelector('.signup-input');
        const btn = form.querySelector('.signup-btn');
        const success = form.parentElement.querySelector('.signup-success');
        const error = form.parentElement.querySelector('.signup-error');

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
                    form.style.display = 'none';
                    if (success) success.style.display = 'block';
                } else {
                    throw new Error('Something went wrong. Please try again.');
                }
            } catch (err) {
                if (error) {
                    error.textContent = err.message || 'Something went wrong. Please try again.';
                    error.style.display = 'block';
                }
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        });
    });
})();

// ═══════════════════════════════════════════════════════════════════════════
// VISIONARY FUNNEL SPARKS ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

(function initSparksAnimation() {
    const canvas = document.getElementById('sparks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    let width, height;
    let floorHeights = new Float32Array(10);
    
    function resize() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = hero.offsetHeight;
        floorHeights = new Float32Array(width);
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    let accumulatedCount = 0;
    const maxAccumulation = 250;
    
    const dots = document.querySelectorAll('.flow-dot');
    const hero = document.querySelector('.hero');
    
    function spawnSlice(rect, intensityType, isMobile, hr) {
        if (!hero) return;
        
        // Spawn precisely from the animated dot
        const startX = (rect.left - hr.left) + Math.random() * rect.width;
        const startY = (rect.top - hr.top) + rect.height / 2;
        
        // Discarded ideas drift perpendicularly away and fade to nothing
        const distY = isMobile ? (Math.random() - 0.5) * 40 : (Math.random() * 80 + 30);
        const distX = isMobile ? (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 60 + 20) : (Math.random() - 0.5) * 40;
        
        particles.push({
            startX, startY,
            x: startX, y: startY,
            endX: startX + distX,
            endY: startY + distY,
            progress: 0,
            speed: Math.random() * 0.01 + 0.005, 
            thickness: intensityType === 1 ? 3 : (intensityType === 0.8 ? 2 : 1),
            length: Math.random() * 15 + 10,
            intensity: intensityType,
            isMobile
        });
    }

    function loop() {
        ctx.clearRect(0, 0, width, height);

        let hr = null;
        if (hero) hr = hero.getBoundingClientRect();
        
        const isMobile = window.innerWidth <= 768;

        // Spawn slices based on dot timing (heavy loss at 100%, stabilizing down the funnel)
        if (hr) {
            dots.forEach((dot, idx) => {
                const rect = dot.getBoundingClientRect();
                if (idx === 0 && Math.random() < 0.3) spawnSlice(rect, 1, isMobile, hr);
                if (idx === 1 && Math.random() < 0.1) spawnSlice(rect, 0.8, isMobile, hr);
                if (idx === 2 && Math.random() < 0.01) spawnSlice(rect, 0.5, isMobile, hr);
            });
        }

        // Elegantly update and render the detaching slices
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.progress += p.speed;
            
            if (p.progress >= 1) {
                particles.splice(i, 1);
                continue;
            }

            const t = p.progress;
            
            // Elegant deceleration
            const ease = 1 - Math.pow(1 - t, 2.5);
            p.x = p.startX + (p.endX - p.startX) * ease;
            p.y = p.startY + (p.endY - p.startY) * ease;

            // Draw clean literal slices (dashes)
            ctx.beginPath();
            
            // For horizontal pipes, slices are vertical dashes dropping.
            // For vertical pipes (mobile), slices are horizontal dashes drifting.
            if (p.isMobile) {
                // Determine direction of slice to make it trail correctly
                const dirX = Math.sign(p.endX - p.startX);
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - dirX * p.length, p.y);
            } else {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y - p.length);
            }
            
            // Slowly dissolve into oblivion
            const alpha = (1 - t) * (p.intensity === 1 ? 0.6 : 0.3);
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
            ctx.lineWidth = p.thickness;
            ctx.lineCap = 'round';
            
            if (t < 0.3) {
                ctx.shadowBlur = p.thickness * 2;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.stroke();
        }
        
        requestAnimationFrame(loop);
    }
    
    setTimeout(loop, 500);
})();