/**
 * Savyn Website — Script (Clean, no heavy dependencies)
 */

// Beta Form Handling
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
                betaForm.style.display = 'none';
                successState.style.display = 'block';

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
            errorState.style.display = 'block';
            errorState.querySelector('.error-text').textContent = 
                err.message || 'Something went wrong. Please try again.';
            
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
