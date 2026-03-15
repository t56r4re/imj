// js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const txn = document.getElementById('txn-id')?.value;
            if (txn && txn.trim() !== '') {
                alert(`Order submitted! Transaction ID: ${txn}\nWe'll verify manually. Redirect to dashboard.`);
                window.location.href = 'dashboard.html';
            } else {
                alert('Please enter a transaction ID');
            }
        });
    }
});