/**
 * Savyn Website — Script
 */

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Hero Entry
const tl = gsap.timeline();

tl.from('.hero-eyebrow', {
    y: 20,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
})
    .from('.line-reveal', {
        y: 100,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out"
    }, "-=0.8")
    .from('.hero-subline', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.6")
    .from('.hero-actions', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8")
    .from('.scroll-indicator', {
        opacity: 0,
        duration: 1
    }, "-=0.5");


// Text Reveals on Scroll
document.querySelectorAll('.section-text-reveal').forEach(text => {
    gsap.from(text, {
        scrollTrigger: {
            trigger: text,
            start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE ANIMATIONS (MatchMedia)
// ═══════════════════════════════════════════════════════════════════════════

let mm = gsap.matchMedia();

mm.add("(min-width: 769px)", () => {
    // DESKTOP: Radial Table Layout

    // Staggered Entry
    gsap.from('.member', {
        scrollTrigger: {
            trigger: '.council-visual',
            start: "top 70%",
        },
        scale: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)"
    });

    // Table Rotation
    gsap.to('.council-visual', {
        scrollTrigger: {
            trigger: '.council-visual',
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        rotationY: 15,
    });
});

mm.add("(max-width: 768px)", () => {
    // MOBILE: Vertical 3D Stack (The "Sexy" Table)

    // Reset any desktop transforms just in case
    gsap.set('.member', { clearProps: "all" });

    const members = gsap.utils.toArray('.member');
    const totalMembers = members.length;

    // Create a timeline that spans the scroll distance of the container
    const mobileCouncilTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.council-visual-wrapper',
            start: "top 70%",
            end: "bottom bottom",
            scrub: 1,
        }
    });

    members.forEach((member, i) => {
        // Calculate offset for stack effect
        // 0 is top, totalMembers is bottom
        const yOffset = i * 60;
        const zOffset = (totalMembers - i) * 20;
        const scale = 1 - (i * 0.05);

        // Initial State: All stacked at bottom or top, invisible
        gsap.set(member, {
            y: 300,
            z: 0,
            scale: 0.8,
            opacity: 0
        });

        // Animation: Fly in to their "Stack" position
        mobileCouncilTl.to(member, {
            y: yOffset,
            z: zOffset,
            scale: scale < 0.6 ? 0.6 : scale, // Min scale
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, i * 0.15); // Stagger start times
    });
});


// Feature Cards
gsap.utils.toArray('.glass-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        delay: i * 0.2,
        ease: "power3.out"
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTONS
// ═══════════════════════════════════════════════════════════════════════════

const buttons = document.querySelectorAll('.magnetic-btn');

buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out"
        });

        gsap.to(btn.querySelector('.btn-content'), {
            x: x * 0.15,
            y: y * 0.15,
            duration: 0.3,
            ease: "power2.out"
        });

        // Glow follow
        const glow = btn.querySelector('.btn-glow');
        if (glow) {
            gsap.to(glow, {
                x: x,
                y: y,
                duration: 0.3
            });
        }
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to([btn, btn.querySelector('.btn-content')], {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// BETA FORM HANDLING
// ═══════════════════════════════════════════════════════════════════════════

const betaForm = document.getElementById('beta-form');
const emailInput = document.getElementById('email-input');
const submitBtn = document.getElementById('submit-btn');
const successState = document.getElementById('success-state');
const errorState = document.getElementById('error-state');

if (betaForm) {
    betaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) return;

        // Show loading
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-flex';
        submitBtn.disabled = true;
        errorState.style.display = 'none';

        try {
            const response = await fetch('https://savyn-beta-api.savynlabs.workers.dev/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                // Success animation
                gsap.to(betaForm, {
                    opacity: 0,
                    y: -20,
                    duration: 0.5,
                    onComplete: () => {
                        betaForm.style.display = 'none';
                        successState.style.display = 'block';
                        gsap.from(successState, {
                            opacity: 0,
                            y: 20,
                            duration: 0.5
                        });
                    }
                });

                if (data.hasAccess && data.playStoreUrl) {
                    const playLink = document.getElementById('play-store-link');
                    playLink.href = data.playStoreUrl;
                    playLink.style.display = 'inline-block';
                    document.querySelector('.success-text').textContent =
                        "You're already in! Download Savyn now.";
                }
            } else {
                throw new Error(data.message || 'Something went wrong');
            }
        } catch (err) {
            // Error
            errorState.style.display = 'block';
            errorState.querySelector('.error-text').textContent =
                err.message || 'Something went wrong. Please try again.';

            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}
