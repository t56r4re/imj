// js/products.js
window.allProducts = [
    {
        id: 1,
        name: 'Astro UI Kit',
        desc: '120+ components, Figma & HTML',
        price: 49,
        category: 'template'
    },
    {
        id: 2,
        name: 'Python scripts bundle',
        desc: 'Automation tools + web scrapers',
        price: 34,
        category: 'tool'
    },
    {
        id: 3,
        name: 'Next.js course',
        desc: 'From zero to deployment',
        price: 89,
        category: 'course'
    },
    {
        id: 4,
        name: 'Tailwind dashboard',
        desc: 'Admin template with dark mode',
        price: 29,
        category: 'template'
    },
    {
        id: 5,
        name: 'Video editing presets',
        desc: 'Premiere Pro & DaVinci',
        price: 24,
        category: 'tool'
    },
    {
        id: 6,
        name: 'Illustration pack',
        desc: '300+ vector assets',
        price: 59,
        category: 'template'
    }
];

function renderProductList(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('a');
        card.href = 'product-details.html'; // static link for demo
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image"></div>
            <h3>${p.name}</h3>
            <p class="product-desc">${p.desc}</p>
            <div class="product-price">$${p.price}</div>
        `;
        container.appendChild(card);
    });
}