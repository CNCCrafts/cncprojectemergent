# Design System: CNC Crafts

**Theme**: Orange + Navy Blue  
**Stack**: React + Vite + Tailwind CSS v4

---

## 1. Color Palette

### Primary Colors
| Token             | Hex       | Usage                              |
|-------------------|-----------|------------------------------------|
| `--color-primary` | `#0a2540` | Navy — backgrounds, headers, footer|
| `--color-accent`  | `#f97316` | Orange — CTAs, highlights, badges  |
| `--color-accent-light` | `#fb923c` | Orange hover, glow effects      |

### Neutral / Surface
| Token               | Hex       | Usage                               |
|---------------------|-----------|-------------------------------------|
| `--color-bg`        | `#f8f9fc` | Page background                     |
| `--color-bg-alt`    | `#eef1f8` | Alternate sections, hover states    |
| `--color-surface`   | `#ffffff` | Cards, modals, tables               |
| `--color-text`      | `#0a2540` | Primary body text (navy)            |
| `--color-text-muted`| `#64748b` | Secondary text, placeholders        |
| `--color-border`    | `#dde3f0` | Borders, dividers                   |

### Semantic Colors
| Token             | Hex       | Usage                               |
|-------------------|-----------|-------------------------------------|
| `--color-success` | `#10b981` | In-stock, delivered, success toasts |
| `--color-warning` | `#f59e0b` | Low stock, pending status           |
| `--color-danger`  | `#ef4444` | Out of stock, errors, delete actions|

### Applied Color Map
```
Navbar bg:    rgba(248,249,252,0.88) → scrolled: #fff
Hero bg:      radial-gradient(orange at 70% 50%, 8% opacity)
Page hero:    linear-gradient(135deg, #0a2540 → #163563)
CTA banner:   #0a2540 (navy) with white text
Footer:       #0a2540 (navy) with white text at 65% opacity
Admin nav:    #0a2540 (navy sidebar) with orange active indicator
Badges:       orange bg (#f97316) for offers, green for in-stock, red for out
Status pills: green (#16a34a), gray (#6b7280), orange (#f97316)
```

---

## 2. Typography

### Font Stack
| Role       | Font                | Fallback           | Weight Used              |
|-----------|---------------------|--------------------|--------------------------|
| Display    | `Playfair Display`  | Georgia, serif     | 600, 700                 |
| Body (UI)  | `Inter`             | system-ui, sans    | 300, 400, 500, 600, 700  |

### Font Sizing Scale
```
Hero title:   clamp(2.4rem, 4vw, 3.6rem)
Section h2:   2.2rem → 1.8rem (Playfair Display)
Page h1:      2.8rem (Playfair Display)
Card title:   1.05rem (Inter, weight 700)
Body text:    0.95rem (Inter, weight 400/500)
Small/meta:   0.82rem (Inter, weight 500/600, uppercase, letter-spacing 0.06em)
Price:        1.1rem (Inter, weight 700, orange accent)
Product name: 0.9rem (Inter, weight 600)
Badge text:   0.78rem (Inter, weight 600)
```

### Letter Spacing
```
Uppercase meta: 0.06em → 0.08em
Tracking:       0.2em (admin panel labels)
```

### Line Heights
```
Body:       1.6
Hero title: 1.15
Headings:   1.2–1.3
```

### Import (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
```

### CSS Variables
```css
--font-body:    'Inter', system-ui, sans-serif;
--font-display: 'Playfair Display', Georgia, serif;
```

---

## 3. Spacing & Layout

### Container
```
Max-width: 1200px
Padding:   0 24px (mobile: 0 16px)
```

### Section Padding
```
Standard:  80px 0
Compact:   64px 0
Hero:      80px 24px 60px
```

### Grid Gaps
```
Product grid:   24px
Category grid:  20px
Features grid:  24px
Stats grid:     20px
```

### Component Spacing
```
Card padding:     28px 20px (category), 18px (product body)
Button padding:   12px 24px (primary), 14px 28px (hero CTA)
Modal padding:    20px 24px (header), 24px (body)
Table cell:       12px 16px
```

---

## 4. Border Radius
| Token          | Value | Usage                       |
|----------------|-------|-----------------------------|
| `--radius`     | 12px  | Cards, modals, sections     |
| `--radius-sm`  | 8px   | Buttons, inputs, small cards|
| `pill`         | 99px  | Badges, status pills, CTAs  |
| `full`         | 50%   | Circular icons, avatars     |

---

## 5. Shadows
| Token           | Value                                                    |
|-----------------|----------------------------------------------------------|
| `--shadow`      | `0 4px 20px rgba(10,37,64,0.08)`                        |
| `--shadow-lg`   | `0 12px 40px rgba(10,37,64,0.14)`                       |
| `hover:shadow`  | `0 6px 20px rgba(249,115,22,0.35)` (orange glow on btn) |

---

## 6. Transitions
```css
--transition: 0.22s ease;
```
Applied to: buttons, cards, links, inputs, hover states.

---

## 7. Key Components

### Buttons

**Primary Button**
```
bg:         #f97316 (orange)
text:       white
padding:    12px 24px
radius:     8px (--radius-sm)
font:       Inter 600, 0.95rem
hover:      bg #fb923c, translateY(-1px), box-shadow orange glow
disabled:   opacity 0.6, cursor not-allowed
```

**Ghost Button**
```
bg:         transparent
border:     2px solid #dde3f0
text:       #0a2540
radius:     8px
hover:      border-color #f97316, text orange
```

### Cards

**Category Card**
```
bg:         white
border:     1px solid #dde3f0
radius:     12px
padding:    28px 20px
hover:      translateY(-4px), shadow-lg, orange border overlay via ::after
```

**Product Card**
```
bg:         white
border:     1px solid #dde3f0
radius:     12px (overflow hidden)
hover:      translateY(-4px), shadow-lg, image scale(1.05)
```

### Navbar
```
position:   fixed top, z-index 1000
height:     70px
bg:         rgba(248,249,252,0.88) → scrolled: rgba(255,255,255,0.97)
backdrop:   blur(16px)
border:     1px solid transparent → scrolled: #dde3f0
```

### Admin Sidebar
```
width:      220px
bg:         #0a2540 (navy)
height:     calc(100vh - 70px)
position:   sticky top 70px
active:     orange (#f97316) background 18% opacity + right border 3px solid orange
```

### Offer Banner
```
bg:         #0a2540 (navy)
text:       white
close btn:  rgba(255,255,255,0.2)
```

---

## 8. Icon Library
- **Tabler Icons** (`@tabler/icons-webfont`) — free, open-source icon set
- Import: `https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css`
- Usage: `<i className="ti ti-shopping-bag-plus" />`

---

## 9. Animations

### Keyframes
```css
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
```

### Applied To
- Cart drawer: slideIn (0.3s)
- Cart overlay: fadeIn (0.2s)
- Modal: scaleIn (0.22s)
- Toast: slideDown (0.3s)
- Skeleton cards: shimmer (1.5s infinite)
- Spinner: spin (1s linear infinite)
- Product image: scale(1.05) on hover (0.4s)
- Card hover: translateY(-4px) (0.22s)
- Rotate chevron: rotate(180deg) on expand

---

## 10. Admin Panel Specific

### Stats Cards
```
Grid:      auto-fill, minmax(180px, 1fr)
Gap:       20px
Card:      white, border, radius 12px, padding 24px
Variants:  --warn (amber border), --accent (orange border), --offer (blue border)
Value:     Inter 700, 1.8rem
Label:     uppercase, 0.82rem, muted, letter-spacing 0.06em
```

### Admin Tables
```
Header bg: #eef1f8
Cell:      12px 16px padding, 0.92rem font
Hover:     bg #f8f9fc
Row warn:  bg #fffbf0 (low stock)
Row danger: bg #fff8f8 (out of stock)
```

### Modal (Product CRUD)
```
Overlay:   rgba(0,0,0,0.5), backdrop blur, z-index 3000
Width:     max 560px
Radius:    12px
Anim:      scaleIn 0.22s
Header:    flex, spacing, border-bottom
Footer:    flex-end, gap 12px, border-top
```

### Toast Notifications
```
Position:  fixed top (70px + 16px), right 24px, z-index 9999
Success:   bg #dcfce7, text #15803d, border #86efac
Error:     bg #fee2e2, text #dc2626, border #fca5a5
Anim:      slideDown 0.3s
```

---

## 11. Responsive Breakpoints

| Screen      | Changes                                                  |
|-------------|----------------------------------------------------------|
| ≤900px      | Hero → single column (hide visual), about/contact → stack, admin → horizontal sidebar |
| ≤640px      | Nav links hidden (hamburger), category grid → 2 cols, features → 1 col, hero actions → column |

---

## 12. CSS Architecture
- **Global**: `client/src/index.css` — Tailwind import, CSS variables, base resets, utility classes
- **Component styles**: `client/src/styles/index.css` — all component-specific classes (navbar, hero, cards, cart, admin, footer, etc.)
- **Auth/Track**: `client/src/styles/auth-track.css` — login modal, track order page styles
- **Tailwind**: v4 via `@tailwindcss/vite` plugin, no config file needed (CSS-first config via `@import "tailwindcss"`)
