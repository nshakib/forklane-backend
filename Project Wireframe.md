# Project Wireframe — ForkLane

Companion to `Project Requirements.md`. This describes layout structure per
page — what's on screen and where — not visual styling (see design system:
Kitchen Ticket Rail palette/type) and not business rules (see Requirements).

Legend: `[ ]` = component block, indentation = nesting, `···` = repeats.

---

## 1. Landing / Home

```
[Navbar — sticky, full-width]
  Logo "ForkLane" | Home  Restaurants  About  Contact | 
  (logged out: Login button)
  (logged in: Cart icon, Profile dropdown → Dashboard / Profile / Logout)

[Hero — 60-70vh]
  Headline + subtext | Search bar (city/cuisine) | CTA "Find Food Near You"
  Background: food imagery, subtle animation on load

[Section 1 — Featured Restaurants]
  Heading + "View All" link
  [Card] [Card] [Card]   (3/row desktop, skeleton loader while fetching)

[Section 2 — Browse by Cuisine]
  Row of cuisine chips/icons (Japanese, Italian, Mexican, ...) → links to
  Listing page pre-filtered

[Section 3 — How It Works]
  3-step visual: Browse → Order → Enjoy

[Section 4 — Stats/Highlights]
  Restaurants count | Orders delivered | Cities served | Avg rating
  (real numbers from API, not static)

[Section 5 — Top Rated]
  [Card] [Card] [Card] sorted by rating

[Section 6 — Testimonials]
  Review quotes pulled from seeded Review data, carousel or 3-grid

[Section 7 — Become a Partner (Manager signup CTA)]
  Short pitch + "List Your Restaurant" → Register page (role=Manager)

[Section 8 — Newsletter / Contact CTA]
  Email input + Subscribe button (client + server validated)

[Footer]
  Logo + tagline | Quick links (Home/Restaurants/About/Contact/Help)
  Social icons | Contact info | © ForkLane
```

---

## 2. Restaurant Listing / Explore

```
[Navbar — same as Home]

[Page header]
  "Explore Restaurants" + result count

[Filter bar — sticky under navbar on scroll]
  [Search input] [Cuisine dropdown] [Price level dropdown] [City dropdown]
  [Sort dropdown: Featured/Rating/Delivery time/Newest]

[Results grid]
  [Card] [Card] [Card]     ← 3/row desktop, 2/row tablet, 1/row mobile
  ···
  Skeleton loaders while loading; "No results" empty state with reset filters

[Pagination]
  ← 1 2 3 ... 8 →   (or infinite scroll — pick one, don't build both)

[Footer]
```

Card component (reused everywhere): image, name, cuisine tag, rating + price
level ($$–$$$$), delivery time, "View Details" button — fixed height/width.

---

## 3. Restaurant Details

```
[Navbar]

[Hero strip]
  Restaurant image/gallery (carousel) | Name, cuisine, rating, price level,
  delivery time, address

[Tabs or stacked sections]
  [Overview] — description, tagline
  [Menu] — grouped by category (Starters/Mains/Desserts/Drinks)
           each item: image, name, description, price, [Add to Order]
  [Reviews] — rating summary + list of reviews (user, rating, comment, date)
           [Write a Review] form for logged-in users
  [Related Restaurants] — 3 cards, same cuisine

[Sticky order summary — sidebar on desktop, bottom sheet on mobile]
  Selected items, quantities, running total, [Place Order] button
  (disabled + validation message if cart empty or user not logged in)

[Footer]
```

---

## 4. Login / Register

```
[Centered card on branded background]

Login:
  [Email] [Password] [Login button w/ loading state]
  [Demo Login: User] [Demo Login: Manager] [Demo Login: Admin]  ← 3 buttons
  [Continue with Google]
  "No account? Register" link

Register:
  [Name] [Email] [Password] [Confirm Password] [Role: User/Manager toggle]
  [Register button w/ loading state]
  [Continue with Google]
  "Have an account? Login" link

Both: inline validation errors per field, success state before redirect
```

---

## 5. User Dashboard

```
[Dashboard shell — sidebar (left) + content (right), collapses to top nav on mobile]

Sidebar:
  [Avatar + name]
  Overview
  My Orders
  Profile
  Settings
  (Profile dropdown in dashboard navbar: Profile / Logout)

Overview page:
  [Card: Total Orders] [Card: Total Spent] [Card: Favorite Cuisine]
  [Recent Orders table] — restaurant, date, total, status, paginated

My Orders page:
  [Filter: status] [Table: order#, restaurant, date, items, total, status]
  paginated, row click → order detail modal/page

Profile page:
  [Editable form: name, email (readonly), avatar] [Save button w/ states]
```

---

## 6. Manager Dashboard

```
Sidebar:
  Overview
  My Restaurant(s)
  Menu Items
  Orders
  Settings
  (Profile dropdown: Profile / Logout)

Overview page:
  [Card: Total Orders] [Card: Revenue] [Card: Menu Items] [Card: Avg Rating]
  [Chart: Orders over time — line]
  [Chart: Orders by status — pie]

My Restaurant(s) page:
  [Card per restaurant they own] [Edit] [+ Add Restaurant]
  Edit form: name, tagline, description, cuisine, price level, images,
  address, city — validated, loading/success states

Menu Items page:
  [Table: item, category, price, available toggle, edit, delete]
  paginated, filterable by category
  [+ Add Menu Item] form (modal or page)

Orders page:
  [Filter: status] [Table: order#, customer, items, total, status, date]
  paginated; status update control per row (Confirmed→Preparing→...)
```

---

## 7. Admin Dashboard

```
Sidebar:
  Overview
  Manage Users
  Manage Restaurants
  Analytics
  Categories        (cuisine list management)
  Settings
  (Profile dropdown: Profile / Logout)

Overview page:
  [Card: Total Users] [Card: Total Restaurants] [Card: Total Orders]
  [Card: Total Revenue]
  [Chart: Orders over time — line]
  [Chart: Orders by status — pie]
  [Chart: Top restaurants by revenue — bar]

Manage Users page:
  [Table: name, email, role, status, joined] paginated, filterable by role
  actions: block/unblock

Manage Restaurants page:
  [Table: name, owner, cuisine, rating, status] paginated, filterable
  actions: edit, delete (any restaurant, not just own)

Analytics page:
  Same charts as Overview, larger/expanded, with date-range filter
```

---

## 8. Additional pages

```
About:      [Hero] [Story section] [Team/values section] [CTA]
Contact:    [Contact form: name, email, subject, message — validated]
            [Contact info card] [Map/address]
Help:       [Search FAQ] [Accordion: grouped Q&A] [Still need help? → Contact]
```

All secondary pages share Navbar + Footer from Home.

---

## 9. Shared components (build once, reuse everywhere)

- `Navbar` (public + dashboard variants)
- `Footer`
- `RestaurantCard`
- `MenuItemRow`
- `StatCard` (dashboard overview cards)
- `DataTable` (paginated, filterable — used in every dashboard table)
- `FormField` (label + input + inline error, used in all 6 forms)
- `Modal` / `Drawer`
- `SkeletonCard` / `SkeletonRow`
- `Toast` (success/error feedback after form submit)

Building these first, before any single page, is what makes the rest fast —
every page below just assembles these.