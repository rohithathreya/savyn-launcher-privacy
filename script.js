// ═══════════════════════════════════════════════════════════════════════════
// THE ATTRITION GRID ANIMATION - SOTA CASCADE
// ═══════════════════════════════════════════════════════════════════════════
(function initAttritionVisual() {
    const grid = document.getElementById('dot-grid');
    if (!grid) return;

    // Inject exactly 100 dots and assign CSS variables for stagger delay
    for (let i = 0; i < 100; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        // This variable creates the sweeping ripple effect in CSS
        dot.style.setProperty('--i', i); 
        grid.appendChild(dot);
    }

    const stateData = [
        { state: 100, val: "100", text: "great ideas & goals" },
        { state: 15, val: "<15", text: "saved for later" },
        { state: 5, val: "<5", text: "actually revisited" },
        { state: 1, val: "<2", text: "acted upon" }
    ];
    let currentIndex = 0;

    const lblWrap = document.getElementById('single-cycling-label');
    const lblVal = document.getElementById('cycle-val');
    const lblText = document.getElementById('cycle-text');

    function updateState() {
        const data = stateData[currentIndex];
        
        // Update the master class to trigger CSS cascade
        grid.className = `attrition-grid grid-${data.state}`;

        // Fade text out cleanly
        lblWrap.style.opacity = '0';
        
        setTimeout(() => {
            lblVal.innerText = data.val;
            lblText.innerText = data.text;
            
            if (data.state === 1) {
                lblWrap.style.textShadow = '0 0 15px rgba(255,255,255,0.6)';
            } else {
                lblWrap.style.textShadow = 'none';
            }

            lblWrap.style.opacity = '1';
        }, 300); // Sync text swap with the fade out

        // Loop forward
        currentIndex = (currentIndex + 1) % stateData.length;
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