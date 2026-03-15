// js/app.js
// shared utilities (mobile menu, etc)
document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            alert('Mobile navigation (demo) — in real project you would expand menu');
        });
    }

    // subtle hover for cards? already in css.
});