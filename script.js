// ═══════════════════════════════════════════════════════════════════════════
// SOTA SCROLL REVEAL (Clean & Performant)
// ═══════════════════════════════════════════════════════════════════════════

(function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', 
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve so it stays visible once it loads in
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Grab everything with the reveal class
    const elements = document.querySelectorAll('.animate-reveal');
    
    // Stagger the bento cards slightly if they load in at the same time
    const bentoCards = document.querySelectorAll('.bento-card.animate-reveal');
    bentoCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.08}s`;
    });

    elements.forEach(el => observer.observe(el));
})();

// Trigger the hero animation immediately on load
window.addEventListener('load', () => {
    const heroElements = document.querySelectorAll('.hero .animate-reveal');
    heroElements.forEach(el => el.classList.add('visible'));
});