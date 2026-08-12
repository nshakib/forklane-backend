# Project Requirements — Food Discovery & Ordering Platform

## 1. Overview

The platform connects diners with restaurants for online food ordering. A diner
browses restaurants, opens a restaurant's menu, places an order, and tracks it
through preparation and delivery. Restaurant owners (Managers) manage their own
restaurant's menu and incoming orders. Admins oversee the whole platform — all
restaurants, all users, and platform-wide analytics.

This document is the product spec: what the system must do and the exact rules
it follows. It is not the database schema and not the API design — those are
derived from it. Every rule below is written so implementation doesn't require
guessing. Decisions marked **(default)** were chosen to hit a tight deadline
and can be changed later without restructuring the system.

## 2. User roles

Three roles exist: **Admin**, **Manager**, **User** (diner).

| Role        | How they join                          | How they log in           |
|-------------|-----------------------------------------|----------------------------|
| **User**    | Registers directly — email/password, Google, or demo login | Email/password, Google, or demo login |
| **Manager** | Registers directly, same as User — role is assigned at creation **(default: self-selected at signup)** | Email/password or demo login |
| **Admin**   | Seeded/created by another Admin — not self-registered **(default)** | Email/password or demo login |

Demo login (auto-filled credentials) is available for all three roles to speed
up grading/review.

### 2.1 Who can manage whom

| Action                                   | Manager | Admin |
|-------------------------------------------|:-------:|:-----:|
| Create/edit/delete **own** restaurant     | ✅      | ✅    |
| Create/edit/delete **any** restaurant     | ❌      | ✅    |
| Manage own restaurant's menu items        | ✅      | ✅    |
| Manage any restaurant's menu items        | ❌      | ✅    |
| View/update orders for own restaurant     | ✅      | ✅    |
| View/update orders for any restaurant     | ❌      | ✅    |
| View own restaurant's analytics           | ✅      | ✅    |
| View platform-wide analytics              | ❌      | ✅    |
| Block/unblock a User or Manager           | ❌      | ✅    |
| Place an order, write a review            | ✅ (as any logged-in account) | ✅ |

In short: a Manager's powers are scoped to the restaurant(s) they own. Admin
powers are platform-wide.

## 3. Accounts and authentication

### 3.1 Registration
- A person registers with name, email, password, and a role selection
  (User or Manager) **(default — see 2, revisit if a stricter model is needed)**.
- Google login is available and creates/matches a User account by email.
- No OTP/email verification step **(default — cut for time; account is usable immediately)**.

### 3.2 Login
- Email/password, Google (Users only), or **Demo Login** — a button per role
  that authenticates against seeded demo accounts (see §9) with zero typing.

### 3.3 Sessions
Every successful login/registration issues a JWT access token, returned to the
client and stored client-side (not a cookie, given no separate refresh-token
flow in this build **(default)**).

### 3.4 Password management
- **(default, cut for time)** No forgot-password/reset flow and no
  change-password flow in v1. Can be added later without touching other
  modules — it's additive.

## 4. Restaurant & menu lifecycle

### 4.1 Creating a restaurant
- Only Manager or Admin can create a restaurant.
- A created restaurant is immediately live/visible to diners — no
  draft/publish step **(default — simpler than the "draft → published"
  pattern used for schedules in other systems, since there's no per-slot
  booking logic here)**.
- Each restaurant has exactly one owner (`ownerId`). Admins are not
  restricted by ownership; Managers are.

### 4.2 Editing a restaurant
- Owner Manager or any Admin can edit any field at any time (name, tagline,
  description, cuisine, price level, delivery estimate, images).
- No field-locking rules — unlike time-sensitive systems, a restaurant
  profile isn't tied to bookings that would be broken by an edit.

### 4.3 Menu items
- Each menu item belongs to exactly one restaurant.
- Owner Manager or Admin can create/edit/delete items and toggle
  `isAvailable` (e.g., 86'd items stay listed but can't be ordered).
- Deleting a restaurant cascades to its menu items **(default)**.

## 5. Diner discovery & ordering

### 5.1 Discovery
- Diners see all restaurants; no time-of-day or "today only" visibility
  restriction (unlike appointment-slot systems — a restaurant listing isn't
  perishable the way a same-day time slot is).
- Search (by name/cuisine/description), filter (cuisine, price level, city),
  sort (featured, rating, delivery time, newest), and pagination are always
  available.

### 5.2 Placing an order
1. Diner selects one or more menu items (with quantities) from **one**
   restaurant per order **(default — no cross-restaurant cart)**.
2. Diner "pays" — payment is simulated **(default, see §8)**; no real
   payment gateway is integrated.
3. On success, an Order is created with status `PENDING` and a total
   computed server-side from current menu prices (never trusted from the
   client).
4. No serial numbers / no slot logic — orders are just timestamped and
   queued in creation order.

## 6. Order lifecycle

```
PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
   |
   └──→ CANCELLED
```

- **PENDING** — set automatically when the order is placed/paid.
- **CONFIRMED / PREPARING / OUT_FOR_DELIVERY / DELIVERED** — set manually by
  the owning Manager or an Admin, in order; no skipping stages
  **(default — enforce in UI, not strictly in DB, to save time)**.
- **CANCELLED** — reachable **only from PENDING**, and only by the diner who
  placed the order **(default, see §7)**. Once a restaurant confirms an
  order, the diner can no longer cancel it themselves.
- There is no driver/delivery-tracking entity **(default)** —
  `OUT_FOR_DELIVERY` is just a status flag the restaurant sets.

## 7. Cancellation & refunds

| When the diner cancels           | Allowed? | Refund? |
|-----------------------------------|:--------:|:-------:|
| While order is `PENDING`          | ✅       | ✅ (simulated — order total is voided) |
| Once order is `CONFIRMED` or later| ❌       | — |

This is intentionally simpler than time-window refund rules (e.g., "more than
1 hour before start") because there's no scheduled time attached to a food
order — the trigger is restaurant action (confirming), not a clock.

## 8. Payments

**(default)** Payment is simulated: submitting the order form with a
"Place Order" action is treated as a successful payment, and the order total
is stored on the Order record. No payment gateway, no invoice PDF, no refund
processing beyond marking the order `CANCELLED`. This satisfies the
checklist's form-validation/loading-state requirements without requiring a
real payment integration under deadline.

## 9. Reviews

- Any logged-in diner can review any restaurant **(default — not gated on
  having a completed order there, to avoid extra lookup logic)**.
- A review is a rating (1–5) + comment, tied to one user and one restaurant.
- A restaurant's `rating` and `reviewCount` are recalculated from all its
  reviews whenever a new review is submitted.

## 10. Dashboards & analytics

- **User dashboard**: order count, total spent, recent orders, profile.
- **Manager dashboard**: same shape as Admin's but scoped to their own
  restaurant(s) only — order volume, revenue, order status breakdown.
- **Admin dashboard**: platform-wide — total users, total restaurants, total
  orders, total revenue, orders-over-time (line), orders-by-status (pie),
  top restaurants by revenue (bar). All charts reflect real seeded data, not
  static mockups.

## 11. Demo accounts (seeded)

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin@demo.com    | Admin123!   |
| Manager | manager@demo.com  | Manager123! |
| User    | user@demo.com     | User123!    |

## 12. Conceptual data models

Not a schema — what each entity needs to hold.

- **User** — name, email, password hash, role (`USER`/`MANAGER`/`ADMIN`),
  avatar URL.
- **Restaurant** — name, slug, tagline, description, cuisine, price level,
  rating, review count, delivery estimate, address/city, images, owner
  (User), featured flag.
- **MenuItem** — name, description, price, category, image, availability
  flag, belongs to one Restaurant.
- **Order** — status, total, belongs to one User and one Restaurant, has many
  OrderItems.
- **OrderItem** — quantity, price-at-order-time (snapshotted so later menu
  price changes don't rewrite history), belongs to one Order and one
  MenuItem.
- **Review** — rating, comment, belongs to one User and one Restaurant.

## 13. Explicitly out of scope for v1 (revisit post-deadline)

- Real payment gateway integration
- Email OTP verification / forgot-password flow
- Review gated on completed order
- Driver/delivery tracking role
- Multi-restaurant cart / split orders
- Draft vs. published restaurant state