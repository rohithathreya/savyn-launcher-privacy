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