# 🟡 AUREX — Premium Marketplace Front-End

## 📌 What Is AUREX?

**AUREX** is a two-page front-end web application that simulates a premium buy-and-sell marketplace.

It includes:

- **Landing Page (`index.html`)** — showcases the platform and featured listings  
- **Browse Page (`market.html`)** — allows users to search, filter, and sort listings  

### 💡 Name Meaning
- **“aur”** → from *aurum* (Latin for gold)  
- **“ex”** → from *exchange*  

➡️ Together, **AUREX** represents a premium gold-themed marketplace.

### ⚙️ Core Concept
The app is fully **data-driven**:
- **HTML** → structure  
- **CSS** → design  
- **JavaScript + JSON** → content & interactivity  

All product data is stored in a single `data.json` file and dynamically rendered.

---

# 🛠️ Technology Stack

| Technology | Description | Role in AUREX |
|------------|------------|--------------|
| **HTML5** | Structure of web pages | Defines layout: navbars, sections, grids, forms |
| **CSS3** | Styling system | Dark theme, gold accents, animations, responsive design |
| **Vanilla JavaScript** | Core scripting (no frameworks) | Handles data fetching, filtering, search, sorting |
| **JSON (`data.json`)** | Data format | Stores listings, categories, and stats |
| **VS Code Live Server** | Local dev server | Enables `fetch()` to work (avoids CORS issues) |
| **Google Fonts** | Typography | Uses *Playfair Display* + *DM Sans* |
| **CSS Variables** | Reusable design tokens | Centralized color, spacing, and theme control |
| **IntersectionObserver API** | Scroll detection | Triggers fade-in animations |
| **URLSearchParams API** | URL query handling | Passes search/category between pages |

---

# 📁 Project Structure

## 📄 `data.json` — Data Layer

Single source of truth containing:

### 🔹 Categories (8)
- `id`, `label`, `icon`, `count`

### 🔹 Stats (4)
- `label`, `value`

### 🔹 Listings (16)
Each listing includes:
- `id`, `title`, `price`, `originalPrice`
- `category`, `condition`
- `seller`, `sellerRating`
- `location`
- `rating`, `reviews`
- `badge`, `badgeType`
- `emoji`, `description`, `timeAgo`

---

## 🎨 `styles.css` — Shared Styles

Used across all pages:

- CSS variables (`:root`)
- Dark theme + gold accents
- Grain texture overlay
- Buttons:
  - `.btn-gold`
  - `.btn-outline-gold`
  - `.btn-ghost`
- Navbar with blur effect
- Product cards with hover animation
- Badge styles:
  - `.badge-hot`
  - `.badge-verified`
  - `.badge-rare`
  - `.badge-artisan`
- Responsive design

---

## 🏠 `home.css` — Homepage Styles

- Hero section with glow effects
- Animated headings
- Search bar with tags
- Categories grid (8 columns)
- Product grids
- “How It Works” section
- Sell CTA section

---

## 🛒 `market.css` — Browse Page Styles

- Two-column layout:
  - Sidebar (filters)
  - Main content (products)
- Sticky filter sidebar
- Filter groups & checkboxes
- Price input controls
- Active filter tags
- Responsive product grid
- Empty state UI

---

## 🌐 `index.html` — Homepage

### Sections:
- Navigation bar
- Hero section
- Stats bar
- Categories grid
- Featured listings
- Trending listings
- “How It Works”
- Sell CTA
- Footer

📌 Dynamic containers:
```html
<div id="featured-grid"></div>
<div id="categories-grid"></div>
