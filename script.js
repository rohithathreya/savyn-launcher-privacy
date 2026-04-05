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
    
    const links = document.querySelectorAll('.pipe-link');
    const hero = document.querySelector('.hero');
    const flipText = document.getElementById('flip-text');
    
    function spawnSpark(rect, intensityType) {
        if (!hero) return;
        const heroRect = hero.getBoundingClientRect();
        
        const x = (rect.left - heroRect.left) + Math.random() * rect.width;
        const y = (rect.top - heroRect.top) + rect.height / 2;
        
        particles.push({
            x: x,
            y: y + Math.random() * 5,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 1.5 + 0.5,
            life: 1,
            size: Math.random() * 1.5 + 0.5,
            intensity: intensityType,
            settled: false
        });
    }

    function loop() {
        ctx.clearRect(0, 0, width, height);

        links.forEach((link, idx) => {
            const rect = link.getBoundingClientRect();
            // Link 1 (100 -> 15): Heavy drop
            if (idx === 0 && Math.random() < 0.25) spawnSpark(rect, 1);
            // Link 2 (15 -> 5): Medium drop
            if (idx === 1 && Math.random() < 0.10) spawnSpark(rect, 0.8);
            // Link 3 (5 -> 1): Rare drop
            if (idx === 2 && Math.random() < 0.02) spawnSpark(rect, 0.5);
        });

        // Update Physics
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            
            if (!p.settled) {
                p.vy += 0.08; // gravity
                p.x += p.vx;
                p.y += p.vy;
                p.vx += (Math.random() - 0.5) * 0.2; // wind
                
                let px = Math.floor(p.x);
                if (px >= 0 && px < width) {
                    const currentFloorY = height - 10 - floorHeights[px];
                    if (p.y >= currentFloorY) {
                        p.settled = true;
                        p.y = currentFloorY;
                        
                        floorHeights[px] += p.size * 0.5; // build the pile
                        // Smooth mountain to neighbors
                        for (let j = -4; j <= 4; j++) {
                            if (px + j >= 0 && px + j < width) {
                                floorHeights[px + j] += (4 - Math.abs(j)) * 0.08;
                            }
                        }
                        
                        accumulatedCount++;
                    }
                } else if (p.y > height) {
                    particles.splice(i, 1);
                    continue;
                }
            } else {
                p.life *= 0.99;
                if (Math.random() < 0.005 || p.life < 0.1) {
                    particles.splice(i, 1);
                    continue;
                }
            }

            // Draw spark
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            
            if (p.settled) {
                ctx.fillStyle = `rgba(180, 200, 255, ${p.life * 0.6})`;
                ctx.shadowBlur = Math.random() < 0.05 ? 5 : 0;
            } else {
                const alpha = p.intensity === 1 ? 0.9 : 0.6;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            }
            
            ctx.fill();
            ctx.shadowBlur = 0; 
        }
        
        // Render & Bleed Floor Pile
        for (let x = 0; x < width; x++) {
            if (floorHeights[x] > 0) {
                if (x % 3 === 0) {
                    ctx.fillStyle = `rgba(200, 220, 255, ${Math.min(floorHeights[x] / 25, 0.5)})`;
                    ctx.fillRect(x, height - 10 - floorHeights[x], 3, floorHeights[x]);
                }
                floorHeights[x] *= 0.998; // physically sink over time
            }
        }
        
        accumulatedCount = Math.max(0, accumulatedCount - 0.5);

        if (flipText) {
            let ratio = Math.min(accumulatedCount / maxAccumulation, 1);
            if (ratio > 0.8) {
                flipText.classList.add('flipped');
            } else if (ratio < 0.3) {
                flipText.classList.remove('flipped');
            }
        }
        
        requestAnimationFrame(loop);
    }
    
    setTimeout(loop, 500);
})();