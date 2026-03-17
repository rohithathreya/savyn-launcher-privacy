// ═══════════════════════════════════════════════════════════════════════════
// NEURAL BACKGROUND — Golden particle network
// ═══════════════════════════════════════════════════════════════════════════

(function initNeuralBackground() {
    const canvas = document.getElementById('neural-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, neurons;
    const CONNECTION_DIST = 180;
    const NEURON_COUNT_FACTOR = 0.00004; // particles per sq pixel

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createNeurons() {
        const count = Math.floor(width * height * NEURON_COUNT_FACTOR);
        neurons = Array.from({ length: Math.max(count, 20) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.005 + Math.random() * 0.01
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Update & draw neurons
        for (const n of neurons) {
            n.x += n.vx;
            n.y += n.vy;
            n.pulse += n.pulseSpeed;

            // Wrap around
            if (n.x < 0) n.x = width;
            if (n.x > width) n.x = 0;
            if (n.y < 0) n.y = height;
            if (n.y > height) n.y = 0;

            const alpha = 0.2 + Math.sin(n.pulse) * 0.15;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 195, 68, ${alpha})`;
            ctx.fill();
        }

        // Draw connections
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                const dx = neurons[i].x - neurons[j].x;
                const dy = neurons[i].y - neurons[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(neurons[i].x, neurons[i].y);
                    ctx.lineTo(neurons[j].x, neurons[j].y);
                    ctx.strokeStyle = `rgba(245, 195, 68, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    resize();
    createNeurons();
    draw();

    window.addEventListener('resize', () => {
        resize();
        createNeurons();
    });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL ANIMATIONS — Intersection Observer
// ═══════════════════════════════════════════════════════════════════════════

(function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
})();

// ═══════════════════════════════════════════════════════════════════════════
// (Beta form removed — app is live on Google Play)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// AGENT CARD HOVER ACCENT — Dynamic border glow based on data-accent
// ═══════════════════════════════════════════════════════════════════════════

(function initAgentCardAccents() {
    document.querySelectorAll('.agent-card').forEach(card => {
        const accent = card.dataset.accent;
        if (!accent) return;

        card.addEventListener('mouseenter', () => {
            card.style.borderColor = accent + '30'; // 30 = ~19% alpha
            card.querySelector('::before')
            card.style.setProperty('--card-accent', accent);
        });

        card.addEventListener('mouseleave', () => {
            card.style.borderColor = '';
        });
    });
})();
