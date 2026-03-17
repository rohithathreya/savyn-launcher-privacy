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