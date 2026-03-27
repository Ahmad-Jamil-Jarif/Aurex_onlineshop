/* =============================================
   AUREX — main.js (Home page)
   ============================================= */

let ALL_DATA = null;

async function loadData() {
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return FALLBACK;
  }
}

/* ---- RENDER CARDS ---- */
function renderCard(item) {
  const discount = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : null;
  const badgeHtml = item.badge
    ? `<span class="badge badge-${item.badgeType}">${item.badge}</span>`
    : '';
  const initials = item.seller.split(' ').map(w => w[0]).join('');
  return `
    <div class="product-card fade-in">
      <div class="product-card-img">
        <span>${item.emoji}</span>
        <div class="product-card-img-badge">${badgeHtml}</div>
        <button class="product-card-wishlist" title="Add to wishlist">♡</button>
      </div>
      <div class="product-card-body">
        <div class="product-card-title">${item.title}</div>
        <div class="product-card-meta">
          <span class="product-condition">${item.condition}</span>
          <span class="product-location">📍 ${item.location.split(',')[0]}</span>
        </div>
        <div class="product-card-price">
          <span class="product-price">$${item.price.toLocaleString()}</span>
          ${item.originalPrice ? `<span class="product-original-price">$${item.originalPrice.toLocaleString()}</span>` : ''}
          ${discount ? `<span class="product-discount">-${discount}%</span>` : ''}
        </div>
      </div>
      <div class="product-card-footer">
        <div class="seller-info">
          <div class="seller-avatar">${initials}</div>
          <span class="seller-name">${item.seller}</span>
        </div>
        <span class="product-time">${item.timeAgo}</span>
      </div>
    </div>
  `;
}

function renderCategories(categories) {
  const el = document.getElementById('categories-grid');
  if (!el) return;
  el.innerHTML = categories.map(c => `
    <div class="category-card fade-in" onclick="window.location='market.html?cat=${c.id}'">
      <div class="category-icon">${c.icon}</div>
      <div class="category-label">${c.label}</div>
      <div class="category-count">${c.count.toLocaleString()}</div>
    </div>
  `).join('');
  observeFadeIns();
}

function renderTrust(stats) {
  const el = document.getElementById('hero-trust');
  if (!el) return;
  el.innerHTML = stats.map((s, i) => `
    ${i > 0 ? '<div class="trust-divider"></div>' : ''}
    <div class="trust-item">
      <span class="trust-icon">✦</span>
      <span><strong style="color:var(--text)">${s.value}</strong> ${s.label}</span>
    </div>
  `).join('');
}

function renderFeatured(listings) {
  const el = document.getElementById('featured-grid');
  if (!el) return;
  const featured = listings.slice(0, 8);
  el.innerHTML = featured.map(item => renderCard(item)).join('');
  observeFadeIns();
}

function renderTrending(listings) {
  const el = document.getElementById('trending-grid');
  if (!el) return;
  const trending = listings.filter(l => l.badgeType === 'hot').slice(0, 4);
  el.innerHTML = trending.map(item => renderCard(item)).join('');
  observeFadeIns();
}

/* ---- SEARCH ---- */
function goToMarket() {
  const q = document.getElementById('hero-search-input')?.value.trim();
  window.location.href = q ? `market.html?q=${encodeURIComponent(q)}` : 'market.html';
}

function searchFor(term) {
  window.location.href = `market.html?q=${encodeURIComponent(term)}`;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'hero-search-input') goToMarket();
});

/* ---- FADE IN OBSERVER ---- */
function observeFadeIns() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
}

/* ---- NAV SHADOW ---- */
function initNav() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10 ? '0 2px 32px rgba(0,0,0,0.4)' : '';
  }, { passive: true });
}

/* ---- INIT ---- */
async function init() {
  ALL_DATA = await loadData();
  renderTrust(ALL_DATA.stats);
  renderCategories(ALL_DATA.categories);
  renderFeatured(ALL_DATA.listings);
  renderTrending(ALL_DATA.listings);
  initNav();
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-in').forEach(el => el.classList.add('visible'));
  }, 60);
  observeFadeIns();
}

document.addEventListener('DOMContentLoaded', init);

/* ---- FALLBACK DATA ---- */
const FALLBACK = {
  "categories": [
    { "id": "electronics","label": "Electronics","icon": "⚡","count": 4821 },
    { "id": "fashion","label": "Fashion","icon": "◈","count": 7304 },
    { "id": "home","label": "Home & Living","icon": "⌂","count": 3192 },
    { "id": "sports","label": "Sports","icon": "◎","count": 2140 },
    { "id": "art","label": "Art & Collectibles","icon": "◇","count": 987 },
    { "id": "vehicles","label": "Vehicles","icon": "◉","count": 1563 },
    { "id": "books","label": "Books & Media","icon": "○","count": 6022 },
    { "id": "other","label": "Everything Else","icon": "⊕","count": 3411 }
  ],
  "stats": [
    { "label": "Active Listings", "value": "2.4M+" },
    { "label": "Verified Sellers", "value": "180K+" },
    { "label": "Daily Trades", "value": "94K+" },
    { "label": "Countries", "value": "48" }
  ],
  "listings": [
    { "id": 1, "title": "Sony WH-1000XM5 Headphones", "price": 249, "originalPrice": 399, "category": "electronics", "condition": "Like New", "seller": "Marcus T.", "location": "New York, US", "badge": "Hot Deal", "badgeType": "hot", "emoji": "🎧", "timeAgo": "2h ago" },
    { "id": 2, "title": "Vintage Leather Jacket", "price": 185, "originalPrice": null, "category": "fashion", "condition": "Good", "seller": "Aisha K.", "location": "London, UK", "badge": "Rare Find", "badgeType": "rare", "emoji": "🧥", "timeAgo": "5h ago" },
    { "id": 3, "title": "iPad Pro 12.9\" M2", "price": 720, "originalPrice": 1099, "category": "electronics", "condition": "Like New", "seller": "Chen W.", "location": "Toronto, CA", "badge": "Verified", "badgeType": "verified", "emoji": "📱", "timeAgo": "1d ago" },
    { "id": 4, "title": "Handwoven Moroccan Rug", "price": 320, "originalPrice": null, "category": "home", "condition": "New", "seller": "Fatima Z.", "location": "Marrakech, MA", "badge": "Artisan", "badgeType": "artisan", "emoji": "🪡", "timeAgo": "3h ago" },
    { "id": 5, "title": "Canon EOS R6 Mark II", "price": 1850, "originalPrice": 2499, "category": "electronics", "condition": "Excellent", "seller": "David R.", "location": "Berlin, DE", "badge": "Hot Deal", "badgeType": "hot", "emoji": "📷", "timeAgo": "6h ago" },
    { "id": 6, "title": "Air Jordan 1 Retro", "price": 480, "originalPrice": null, "category": "fashion", "condition": "New", "seller": "Jordan P.", "location": "Chicago, US", "badge": "Rare Find", "badgeType": "rare", "emoji": "👟", "timeAgo": "12h ago" },
    { "id": 7, "title": "Vintage Rolex Submariner", "price": 14500, "originalPrice": null, "category": "art", "condition": "Good", "seller": "Henri B.", "location": "Geneva, CH", "badge": "Verified", "badgeType": "verified", "emoji": "⌚", "timeAgo": "2d ago" },
    { "id": 8, "title": "MacBook Pro 14\" M3 Pro", "price": 1799, "originalPrice": 2399, "category": "electronics", "condition": "Like New", "seller": "Sophie L.", "location": "Paris, FR", "badge": "Hot Deal", "badgeType": "hot", "emoji": "💻", "timeAgo": "8h ago" }
  ]
};
