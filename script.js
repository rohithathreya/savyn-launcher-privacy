// ═══════════════════════════════════════════════════════════════════════════
// THE ATTRITION GRID ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
(function initAttritionVisual() {
    const grid = document.getElementById('dot-grid');
    if (!grid) return;

    // Inject exactly 100 dots to keep HTML clean
    for (let i = 0; i < 100; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        grid.appendChild(dot);
    }

    const states = [100, 15, 5, 1];
    let currentIndex = 0;

    function updateState() {
        const state = states[currentIndex];
        
        // Update the master class on the grid
        grid.className = `attrition-grid grid-${state}`;

        // Update the active label
        document.querySelectorAll('.a-label').forEach(label => {
            label.classList.remove('active');
        });
        const activeLabel = document.getElementById(`label-${state}`);
        if (activeLabel) activeLabel.classList.add('active');

        // Loop forward
        currentIndex = (currentIndex + 1) % states.length;
    }

    // Start sequence
    setTimeout(() => {
        updateState();
        setInterval(updateState, 2500); // Shift every 2.5 seconds
    }, 100);
})();

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