document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // Intersection Observer for Text Reveals
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    const textBlocks = document.querySelectorAll('.text-block');
    textBlocks.forEach(block => observer.observe(block));


    // ==========================================
    // Network Background Animation (Spreading Wave)
    // ==========================================
    const canvas = document.getElementById('network-bg');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    // Configuration
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const connectionDistance = window.innerWidth < 768 ? 100 : 150;

    // Wave Logic
    let waveRadius = 0;
    const waveSpeed = 15; // Speed of the spread
    const maxWaveRadius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) + 100; // Diagonal + buffer

    const particleSpeed = 0.3;
    const particleColor = 'rgba(212, 175, 55, 0.6)'; // Gold
    const lineColorBase = 'rgba(212, 175, 55, '; // Gold lines

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * particleSpeed;
            this.vy = (Math.random() - 0.5) * particleSpeed;
            this.size = Math.random() * 2 + 1.5;
            this.active = false; // Becomes active when wave hits it
        }

        update() {
            // Only move if active
            if (this.active) {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            } else {
                // Check if wave reached this particle
                const distFromTopLeft = Math.sqrt(this.x ** 2 + this.y ** 2);
                if (distFromTopLeft < waveRadius) {
                    this.active = true;
                }
            }
        }

        draw() {
            if (!this.active) return;

            ctx.fillStyle = particleColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        waveRadius = 0; // Reset wave on resize/init
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Expand wave
        if (waveRadius < maxWaveRadius) {
            waveRadius += waveSpeed;
        }

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            if (!particles[i].active) continue;

            for (let j = i + 1; j < particles.length; j++) {
                if (!particles[j].active) continue;

                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    // Opacity based on distance
                    const opacity = (1 - distance / connectionDistance) * 0.4;

                    ctx.beginPath();
                    ctx.strokeStyle = lineColorBase + opacity + ')';
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Initialize
    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    resize();
    initParticles();
    animate();


    // ==========================================
    // Scroll to Form
    // ==========================================
    const topBtn = document.getElementById('top-cta');
    const signupSection = document.getElementById('signup-section');
    const emailInput = document.querySelector('input[name="email"]');

    if (topBtn && signupSection) {
        topBtn.addEventListener('click', () => {
            signupSection.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                if (emailInput) emailInput.focus();
            }, 800);
        });
    }

});
