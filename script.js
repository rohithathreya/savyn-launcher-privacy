document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // Neural Background Animation (Golden & Vibrant)
    // ============================================
    const canvas = document.getElementById('neural-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        let neurons = [];
        let pulses = [];

        // More vibrant config with golden colors
        const config = {
            neuronCount: window.innerWidth < 768 ? 50 : 100, // More particles
            synapseDistance: window.innerWidth < 768 ? 150 : 220,
            baseSpeed: 0.2,
            pulseChance: 0.025 // More frequent pulses
        };

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createNeurons();
        }

        function createNeurons() {
            neurons = [];
            for (let i = 0; i < config.neuronCount; i++) {
                neurons.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * config.baseSpeed,
                    vy: (Math.random() - 0.5) * config.baseSpeed,
                    radius: Math.random() * 2 + 1.5, // Slightly larger
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.015 + Math.random() * 0.015
                });
            }
        }

        function createPulse() {
            if (neurons.length < 2) return;
            const startNeuron = neurons[Math.floor(Math.random() * neurons.length)];
            const endNeuron = neurons[Math.floor(Math.random() * neurons.length)];
            if (startNeuron === endNeuron) return;

            const dx = endNeuron.x - startNeuron.x;
            const dy = endNeuron.y - startNeuron.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.synapseDistance * 1.5) {
                pulses.push({
                    startX: startNeuron.x,
                    startY: startNeuron.y,
                    endX: endNeuron.x,
                    endY: endNeuron.y,
                    progress: 0,
                    speed: 0.02 + Math.random() * 0.015
                });
            }
        }

        function updateNeurons() {
            neurons.forEach(neuron => {
                neuron.x += neuron.vx;
                neuron.y += neuron.vy;
                neuron.pulse += neuron.pulseSpeed;

                if (neuron.x < 0 || neuron.x > canvas.width) neuron.vx *= -1;
                if (neuron.y < 0 || neuron.y > canvas.height) neuron.vy *= -1;
            });

            pulses = pulses.filter(pulse => {
                pulse.progress += pulse.speed;
                return pulse.progress < 1;
            });

            if (Math.random() < config.pulseChance) createPulse();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections with golden glow
            ctx.lineWidth = 1;
            for (let i = 0; i < neurons.length; i++) {
                for (let j = i + 1; j < neurons.length; j++) {
                    const dx = neurons[i].x - neurons[j].x;
                    const dy = neurons[i].y - neurons[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.synapseDistance) {
                        const opacity = (1 - dist / config.synapseDistance) * 0.15;
                        ctx.strokeStyle = `rgba(245, 195, 68, ${opacity})`; // Golden lines
                        ctx.beginPath();
                        ctx.moveTo(neurons[i].x, neurons[i].y);
                        ctx.lineTo(neurons[j].x, neurons[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw Pulses with golden glow
            pulses.forEach(pulse => {
                const x = pulse.startX + (pulse.endX - pulse.startX) * pulse.progress;
                const y = pulse.startY + (pulse.endY - pulse.startY) * pulse.progress;

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
                gradient.addColorStop(0, 'rgba(255, 217, 90, 0.8)');
                gradient.addColorStop(0.5, 'rgba(245, 195, 68, 0.4)');
                gradient.addColorStop(1, 'rgba(245, 195, 68, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Neurons with golden glow
            neurons.forEach(neuron => {
                const pulseSize = Math.sin(neuron.pulse) * 0.3 + 1;

                // Outer glow
                const gradient = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, neuron.radius * pulseSize * 3);
                gradient.addColorStop(0, 'rgba(255, 217, 90, 0.6)');
                gradient.addColorStop(0.5, 'rgba(245, 195, 68, 0.2)');
                gradient.addColorStop(1, 'rgba(245, 195, 68, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(neuron.x, neuron.y, neuron.radius * pulseSize * 3, 0, Math.PI * 2);
                ctx.fill();

                // Inner core
                ctx.fillStyle = `rgba(255, 217, 90, ${0.5 + Math.sin(neuron.pulse) * 0.3})`;
                ctx.beginPath();
                ctx.arc(neuron.x, neuron.y, neuron.radius * pulseSize, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function animate() {
            updateNeurons();
            draw();
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // ============================================
    // Cycling Text Animation
    // ============================================
    function initCycling(container, interval = 2500) {
        if (!container) return;
        const items = container.querySelectorAll('.cycle-item, .exp-item');
        if (items.length === 0) return;

        let current = 0;

        setInterval(() => {
            items[current].classList.remove('active');
            current = (current + 1) % items.length;
            items[current].classList.add('active');
        }, interval);
    }

    const cyclingContainer = document.querySelector('.modes-cycle');
    initCycling(cyclingContainer);

    // Initialize experience cycling
    const expCyclingContainer = document.querySelector('.exp-cycle');
    initCycling(expCyclingContainer, 2000); // Slightly faster

    // ============================================
    // Scroll Animations
    // ============================================
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.story-block').forEach(el => observer.observe(el));

    // Smooth Scroll for CTA
    document.getElementById('top-cta')?.addEventListener('click', () => {
        document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            document.getElementById('email-input')?.focus();
        }, 800);
    });

    // ============================================
    // Beta Signup Form (CRITICAL LOGIC)
    // ============================================
    const API_URL = 'https://savyn-beta-api.savynlabs.workers.dev';

    const betaForm = document.getElementById('beta-form');
    const emailInput = document.getElementById('email-input');
    const submitBtn = document.getElementById('submit-btn');
    const successState = document.getElementById('success-state');
    const playOptInBtn = document.getElementById('play-opt-in-btn');
    const errorMessage = document.getElementById('error-message');

    if (betaForm) {
        betaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            if (!email) return;

            submitBtn.disabled = true;
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Joining...';
            errorMessage.classList.add('hidden');

            try {
                const response = await fetch(`${API_URL}/join-beta`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.ok) {
                    betaForm.classList.add('hidden');
                    successState.classList.remove('hidden');
                    if (data.optInUrl) {
                        playOptInBtn.href = data.optInUrl;
                    }
                } else {
                    throw new Error(data.error || 'Something went wrong');
                }
            } catch (error) {
                console.error('Signup error:', error);
                errorMessage.textContent = error.message || 'Network error. Please try again.';
                errorMessage.classList.remove('hidden');

                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});
