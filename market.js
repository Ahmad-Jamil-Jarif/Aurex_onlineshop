/* =============================================
   AUREX — market.js (Browse page)
   Full filter, search, sort engine
   ============================================= */

let ALL_LISTINGS = [];
let ALL_CATEGORIES = [];

// Active filter state
const filters = {
  search: '',
  category: null,
  conditions: [],
  badges: [],
  priceMin: null,
  priceMax: null
};

async function loadData() {
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return MARKET_FALLBACK;
  }
}

/* ---- APPLY FILTERS + SORT ---- */
function applyFilters() {
  let results = [...ALL_LISTINGS];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.seller.toLowerCase().includes(q)
    );
  }

  if (filters.category) {
    results = results.filter(l => l.category === filters.category);
  }

  if (filters.conditions.length > 0) {
    results = results.filter(l => filters.conditions.includes(l.condition));
  }

  if (filters.badges.length > 0) {
    results = results.filter(l => l.badgeType && filters.badges.includes(l.badgeType));
  }

  if (filters.priceMin !== null) {
    results = results.filter(l => l.price >= filters.priceMin);
  }
  if (filters.priceMax !== null) {
    results = results.filter(l => l.price <= filters.priceMax);
  }

  // Sort
  const sort = document.getElementById('sort-select')?.value || 'default';
  if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === 'discount') {
    results.sort((a, b) => {
      const da = a.originalPrice ? (1 - a.price / a.originalPrice) : 0;
      const db = b.originalPrice ? (1 - b.price / b.originalPrice) : 0;
      return db - da;
    });
  }

  renderGrid(results);
  renderResultsCount(results.length);
  renderActiveFilters();
}

/* ---- RENDER GRID ---- */
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
        <button class="product-card-wishlist">♡</button>
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

function renderGrid(listings) {
  const grid = document.getElementById('market-grid');
  const empty = document.getElementById('empty-state');
  if (!grid) return;

  if (listings.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = listings.map(item => renderCard(item)).join('');
  observeFadeIns();
}

function renderResultsCount(count) {
  const el = document.getElementById('results-count');
  if (el) el.innerHTML = `<strong>${count}</strong> listing${count !== 1 ? 's' : ''} found`;
}

/* ---- RENDER SIDEBAR CATEGORIES ---- */
function renderSidebarCategories(categories) {
  const el = document.getElementById('filter-categories');
  if (!el) return;

  const allBtn = document.createElement('button');
  allBtn.className = `filter-option-btn ${!filters.category ? 'active' : ''}`;
  allBtn.dataset.cat = '';
  allBtn.innerHTML = `<span>All Categories</span><span class="filter-option-count">${ALL_LISTINGS.length}</span>`;
  el.appendChild(allBtn);

  categories.forEach(cat => {
    const count = ALL_LISTINGS.filter(l => l.category === cat.id).length;
    const btn = document.createElement('button');
    btn.className = `filter-option-btn ${filters.category === cat.id ? 'active' : ''}`;
    btn.dataset.cat = cat.id;
    btn.innerHTML = `<span>${cat.icon} ${cat.label}</span><span class="filter-option-count">${count}</span>`;
    el.appendChild(btn);
  });

  el.addEventListener('click', e => {
    const btn = e.target.closest('.filter-option-btn');
    if (!btn) return;
    el.querySelectorAll('.filter-option-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filters.category = btn.dataset.cat || null;
    applyFilters();
  });
}

/* ---- ACTIVE FILTER TAGS ---- */
function renderActiveFilters() {
  const el = document.getElementById('active-filters');
  if (!el) return;
  const tags = [];

  if (filters.search) {
    tags.push({ label: `"${filters.search}"`, clear: () => { filters.search = ''; document.getElementById('sidebar-search').value = ''; applyFilters(); } });
  }
  if (filters.category) {
    const cat = ALL_CATEGORIES.find(c => c.id === filters.category);
    tags.push({ label: cat?.label || filters.category, clear: () => {
      filters.category = null;
      document.querySelectorAll('.filter-option-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.filter-option-btn[data-cat=""]')?.classList.add('active');
      applyFilters();
    }});
  }
  filters.conditions.forEach(c => {
    tags.push({ label: c, clear: () => {
      filters.conditions = filters.conditions.filter(x => x !== c);
      document.querySelector(`.condition-filter[value="${c}"]`).checked = false;
      applyFilters();
    }});
  });
  filters.badges.forEach(b => {
    const names = { hot: 'Hot Deal', verified: 'Verified', rare: 'Rare Find', artisan: 'Artisan' };
    tags.push({ label: names[b] || b, clear: () => {
      filters.badges = filters.badges.filter(x => x !== b);
      document.querySelector(`.badge-filter[value="${b}"]`).checked = false;
      applyFilters();
    }});
  });
  if (filters.priceMin !== null || filters.priceMax !== null) {
    const label = `$${filters.priceMin ?? 0} – $${filters.priceMax ?? '∞'}`;
    tags.push({ label, clear: () => {
      filters.priceMin = null; filters.priceMax = null;
      document.getElementById('price-min').value = '';
      document.getElementById('price-max').value = '';
      applyFilters();
    }});
  }

  el.innerHTML = tags.map((t, i) => `
    <span class="active-filter-tag" data-idx="${i}">
      ${t.label}
      <button>✕</button>
    </span>
  `).join('');

  el.querySelectorAll('.active-filter-tag').forEach((tag, i) => {
    tag.querySelector('button').addEventListener('click', () => tags[i].clear());
  });
}

function resetFilters() {
  filters.search = ''; filters.category = null;
  filters.conditions = []; filters.badges = [];
  filters.priceMin = null; filters.priceMax = null;
  document.querySelectorAll('.condition-filter, .badge-filter').forEach(cb => cb.checked = false);
  document.getElementById('sidebar-search').value = '';
  document.getElementById('price-min').value = '';
  document.getElementById('price-max').value = '';
  document.querySelectorAll('.filter-option-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-option-btn[data-cat=""]')?.classList.add('active');
  applyFilters();
}

/* ---- BIND ALL FILTER EVENTS ---- */
function bindFilterEvents() {
  // Search
  const searchInput = document.getElementById('sidebar-search');
  const navSearch = document.getElementById('market-nav-search');

  let searchTimer;
  function doSearch(val) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filters.search = val.trim();
      applyFilters();
    }, 280);
  }
  if (searchInput) searchInput.addEventListener('input', e => doSearch(e.target.value));
  if (navSearch) navSearch.addEventListener('input', e => {
    doSearch(e.target.value);
    if (searchInput) searchInput.value = e.target.value;
  });

  // Conditions
  document.querySelectorAll('.condition-filter').forEach(cb => {
    cb.addEventListener('change', () => {
      filters.conditions = [...document.querySelectorAll('.condition-filter:checked')].map(c => c.value);
      applyFilters();
    });
  });

  // Badges
  document.querySelectorAll('.badge-filter').forEach(cb => {
    cb.addEventListener('change', () => {
      filters.badges = [...document.querySelectorAll('.badge-filter:checked')].map(c => c.value);
      applyFilters();
    });
  });

  // Price
  document.getElementById('apply-price')?.addEventListener('click', () => {
    const min = parseFloat(document.getElementById('price-min').value);
    const max = parseFloat(document.getElementById('price-max').value);
    filters.priceMin = isNaN(min) ? null : min;
    filters.priceMax = isNaN(max) ? null : max;
    applyFilters();
  });

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);

  // Clear all
  document.getElementById('clear-filters')?.addEventListener('click', resetFilters);
}

/* ---- FADE IN ---- */
function observeFadeIns() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
}

/* ---- NAV SHADOW ---- */
function initNav() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10 ? '0 2px 32px rgba(0,0,0,0.4)' : '';
  }, { passive: true });
}

/* ---- READ URL PARAMS ---- */
function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const cat = params.get('cat');
  if (q) {
    filters.search = q;
    const searchInput = document.getElementById('sidebar-search');
    if (searchInput) searchInput.value = q;
    const navSearch = document.getElementById('market-nav-search');
    if (navSearch) navSearch.value = q;
  }
  if (cat) {
    filters.category = cat;
  }
}

/* ---- INIT ---- */
async function init() {
  const data = await loadData();
  ALL_LISTINGS = data.listings;
  ALL_CATEGORIES = data.categories;

  renderSidebarCategories(ALL_CATEGORIES);
  bindFilterEvents();
  readUrlParams();
  initNav();
  applyFilters();
}

document.addEventListener('DOMContentLoaded', init);

/* ---- FALLBACK ---- */
const MARKET_FALLBACK = {
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
  "listings": [
    { "id": 1, "title": "Sony WH-1000XM5 Headphones", "price": 249, "originalPrice": 399, "category": "electronics", "condition": "Like New", "seller": "Marcus T.", "location": "New York, US", "badge": "Hot Deal", "badgeType": "hot", "emoji": "🎧", "timeAgo": "2h ago", "description": "Barely used." },
    { "id": 2, "title": "Vintage Leather Jacket", "price": 185, "originalPrice": null, "category": "fashion", "condition": "Good", "seller": "Aisha K.", "location": "London, UK", "badge": "Rare Find", "badgeType": "rare", "emoji": "🧥", "timeAgo": "5h ago", "description": "90s era." },
    { "id": 3, "title": "iPad Pro 12.9\" M2", "price": 720, "originalPrice": 1099, "category": "electronics", "condition": "Like New", "seller": "Chen W.", "location": "Toronto, CA", "badge": "Verified", "badgeType": "verified", "emoji": "📱", "timeAgo": "1d ago", "description": "Apple Pencil included." },
    { "id": 4, "title": "Handwoven Moroccan Rug", "price": 320, "originalPrice": null, "category": "home", "condition": "New", "seller": "Fatima Z.", "location": "Marrakech, MA", "badge": "Artisan", "badgeType": "artisan", "emoji": "🪡", "timeAgo": "3h ago", "description": "Handmade." },
    { "id": 5, "title": "Canon EOS R6 Mark II", "price": 1850, "originalPrice": 2499, "category": "electronics", "condition": "Excellent", "seller": "David R.", "location": "Berlin, DE", "badge": "Hot Deal", "badgeType": "hot", "emoji": "📷", "timeAgo": "6h ago", "description": "Under 5000 actuations." },
    { "id": 6, "title": "Air Jordan 1 Retro", "price": 480, "originalPrice": null, "category": "fashion", "condition": "New", "seller": "Jordan P.", "location": "Chicago, US", "badge": "Rare Find", "badgeType": "rare", "emoji": "👟", "timeAgo": "12h ago", "description": "DS deadstock." },
    { "id": 7, "title": "Vintage Rolex Submariner", "price": 14500, "originalPrice": null, "category": "art", "condition": "Good", "seller": "Henri B.", "location": "Geneva, CH", "badge": "Verified", "badgeType": "verified", "emoji": "⌚", "timeAgo": "2d ago", "description": "1972 ref 1680." },
    { "id": 8, "title": "MacBook Pro 14\" M3 Pro", "price": 1799, "originalPrice": 2399, "category": "electronics", "condition": "Like New", "seller": "Sophie L.", "location": "Paris, FR", "badge": "Hot Deal", "badgeType": "hot", "emoji": "💻", "timeAgo": "8h ago", "description": "AppleCare+ 2026." },
    { "id": 9, "title": "Trek Domane SL 6 Road Bike", "price": 2200, "originalPrice": 3500, "category": "sports", "condition": "Excellent", "seller": "Lucas O.", "location": "Amsterdam, NL", "badge": "Verified", "badgeType": "verified", "emoji": "🚲", "timeAgo": "1d ago", "description": "Under 500km." },
    { "id": 10, "title": "Standing Desk Electric", "price": 390, "originalPrice": 640, "category": "home", "condition": "Like New", "seller": "Priya M.", "location": "Austin, US", "badge": "Hot Deal", "badgeType": "hot", "emoji": "🪑", "timeAgo": "4h ago", "description": "Moving sale." },
    { "id": 11, "title": "Dune First Edition", "price": 890, "originalPrice": null, "category": "books", "condition": "Good", "seller": "Oliver H.", "location": "Edinburgh, UK", "badge": "Rare Find", "badgeType": "rare", "emoji": "📖", "timeAgo": "3d ago", "description": "1965 Chilton Books." },
    { "id": 12, "title": "Chanel Classic Flap Bag", "price": 4200, "originalPrice": null, "category": "fashion", "condition": "Excellent", "seller": "Mei Y.", "location": "Hong Kong, HK", "badge": "Verified", "badgeType": "verified", "emoji": "👜", "timeAgo": "2d ago", "description": "Authenticity card included." },
    { "id": 13, "title": "PS5 Console + 3 Games", "price": 430, "originalPrice": 560, "category": "electronics", "condition": "Like New", "seller": "Raj S.", "location": "Dubai, AE", "badge": "Hot Deal", "badgeType": "hot", "emoji": "🎮", "timeAgo": "9h ago", "description": "All accessories." },
    { "id": 14, "title": "Oil Painting Abstract Coastal", "price": 750, "originalPrice": null, "category": "art", "condition": "New", "seller": "Nina A.", "location": "Lisbon, PT", "badge": "Artisan", "badgeType": "artisan", "emoji": "🎨", "timeAgo": "1d ago", "description": "Hand-signed original." },
    { "id": 15, "title": "Weber Genesis Gas Grill", "price": 680, "originalPrice": 1049, "category": "home", "condition": "Good", "seller": "Tom B.", "location": "Dallas, US", "badge": null, "badgeType": null, "emoji": "🔥", "timeAgo": "4d ago", "description": "Deep cleaned." },
    { "id": 16, "title": "Ping Pong Table Tournament", "price": 520, "originalPrice": 880, "category": "sports", "condition": "Good", "seller": "James C.", "location": "Melbourne, AU", "badge": null, "badgeType": null, "emoji": "🏓", "timeAgo": "5d ago", "description": "Butterfly Centrefold." }
  ]
};
