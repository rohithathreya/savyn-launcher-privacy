/**
 * Savyn Website
 */

// Cycling words
const words = ['Work.', 'Exercise.', 'Relationships.', 'Meals.', 'Hobbies.', 'Chilling.'];
const cycleEl = document.getElementById('cycle-word');
let wordIndex = 0;

if (cycleEl) {
    setInterval(() => {
        wordIndex = (wordIndex + 1) % words.length;
        cycleEl.style.animation = 'none';
        cycleEl.offsetHeight; // trigger reflow
        cycleEl.textContent = words[wordIndex];
        cycleEl.style.animation = 'cycleIn 0.5s ease';
    }, 2000);
}

// Beta signup form
const form = document.getElementById('beta-form');
const emailInput = document.getElementById('email-input');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('success-msg');
const errorMsg = document.getElementById('error-msg');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        errorMsg.style.display = 'none';

        try {
            const res = await fetch('https://savyn-beta-api.savynlabs.workers.dev/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                form.style.display = 'none';
                successMsg.style.display = 'block';
            } else {
                throw new Error(data.message || 'Something went wrong');
            }
        } catch (err) {
            errorMsg.textContent = err.message || 'Something went wrong. Try again.';
            errorMsg.style.display = 'block';
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
