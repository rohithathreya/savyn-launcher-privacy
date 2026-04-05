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

// Sparks engine removed as per user request

// ═══════════════════════════════════════════════════════════════════════════
// FUNNEL PANNING VIEW
// ═══════════════════════════════════════════════════════════════════════════
(function initFunnelPan() {
    const pipe = document.getElementById('panning-pipe');
    if (!pipe) return;
    const nodes = pipe.querySelectorAll('.pipe-node');
    if (!nodes.length) return;

    let currentIndex = 0;

    function panToStage(index) {
        // Find the center of the mask
        const mask = pipe.parentElement;
        const maskWidth = mask.offsetWidth;

        const node = nodes[index];
        const nodeOffset = node.offsetLeft;
        const nodeWidth = node.offsetWidth;

        // Shift so node is perfectly centered inside the 300px mask
        const shiftX = (maskWidth / 2) - (nodeOffset + nodeWidth / 2);
        
        pipe.style.transform = `translateX(${shiftX}px)`;

        // Highlight active node
        nodes.forEach((n, i) => {
            if (i === index) {
                n.style.opacity = '1';
                n.style.transform = 'scale(1)';
            } else {
                n.style.opacity = '0';
                n.style.transform = 'scale(0.95)';
            }
        });
    }

    // Initial center
    setTimeout(() => panToStage(0), 100);

    // Cycle every 2.5 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % nodes.length;
        panToStage(currentIndex);
    }, 2500);

    window.addEventListener('resize', () => panToStage(currentIndex));
})();