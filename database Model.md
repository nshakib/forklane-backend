# Database Models — ForkLane

Companion to `Project Requirements.md`. This is the schema: exact fields,
types, and relationships — derived from and consistent with the conceptual
models in Requirements §12. Matches what's implemented (Sequelize + SQLite,
swappable to Postgres/MySQL).

---

## Entity-Relationship overview

```
User ──1:N── Restaurant   (owner)
User ──1:N── Order
User ──1:N── Review

Restaurant ──1:N── MenuItem
Restaurant ──1:N── Order
Restaurant ──1:N── Review

Order ──1:N── OrderItem
MenuItem ──1:N── OrderItem
```

Every relationship is one-to-many from the "one" side down; no many-to-many
in v1 (no shared restaurant ownership, no order-spanning-restaurants — see
Requirements §5.2 and §13).

---

## User

| Field         | Type              | Notes                                      |
|---------------|-------------------|---------------------------------------------|
| id            | UUID (PK)         |                                             |
| name          | STRING            | required                                    |
| email         | STRING            | required, **unique**                        |
| passwordHash  | STRING            | required (bcrypt)                           |
| role          | ENUM              | `USER` \| `MANAGER` \| `ADMIN`, default `USER` |
| avatarUrl     | STRING            | nullable                                    |
| createdAt / updatedAt | DATETIME | auto                                        |

**Relations:** has many Restaurant (as owner), has many Order, has many Review.

---

## Restaurant

| Field         | Type        | Notes                                       |
|---------------|-------------|-----------------------------------------------|
| id            | UUID (PK)   |                                                |
| name          | STRING      | required                                      |
| slug          | STRING      | required, **unique** (derived from name)      |
| tagline       | STRING      |                                                |
| description   | TEXT        |                                                |
| cuisine       | STRING      | e.g. Japanese, Italian — flat string, not FK to a separate table **(default — no Category model in v1)** |
| priceLevel    | INTEGER     | 1–4 (`$`–`$$$$`)                              |
| rating        | FLOAT       | default 0, recalculated from Reviews          |
| reviewCount   | INTEGER     | default 0, recalculated from Reviews          |
| deliveryMins  | INTEGER     | estimated delivery time                       |
| address       | STRING      |                                                |
| city          | STRING      | used for filtering                            |
| heroImage     | STRING      | URL                                           |
| gallery       | TEXT        | JSON-encoded array of image URLs              |
| isFeatured    | BOOLEAN     | default false — drives homepage "Featured" section |
| ownerId       | UUID (FK → User) | required — see Requirements §4.1        |
| createdAt / updatedAt | DATETIME | auto                                 |

**Relations:** belongs to User (owner); has many MenuItem, Order, Review.
**Cascade:** deleting a Restaurant cascades to its MenuItems (Requirements §4.3).

---

## MenuItem

| Field         | Type        | Notes                          |
|---------------|-------------|----------------------------------|
| id            | UUID (PK)   |                                  |
| name          | STRING      | required                        |
| description   | TEXT        |                                  |
| price         | FLOAT       | required                        |
| category      | STRING      | e.g. Starters/Mains/Desserts/Drinks |
| image         | STRING      | URL                              |
| isAvailable   | BOOLEAN     | default true — "86'd" items stay listed but unorderable (Requirements §4.3) |
| restaurantId  | UUID (FK → Restaurant) | required          |

**Relations:** belongs to Restaurant; has many OrderItem.

---

## Order

| Field         | Type        | Notes                                        |
|---------------|-------------|-------------------------------------------------|
| id            | UUID (PK)   |                                                  |
| status        | ENUM        | `PENDING` \| `CONFIRMED` \| `PREPARING` \| `OUT_FOR_DELIVERY` \| `DELIVERED` \| `CANCELLED` — default `PENDING` |
| total         | FLOAT       | computed server-side at creation, never trusted from client (Requirements §5.2) |
| userId        | UUID (FK → User) | required                                  |
| restaurantId  | UUID (FK → Restaurant) | required — one restaurant per order (Requirements §5.2) |
| createdAt / updatedAt | DATETIME | auto — `createdAt` used for dashboard time-series charts |

**Relations:** belongs to User, belongs to Restaurant; has many OrderItem.
**State machine:** see Requirements §6 — `CANCELLED` only reachable from `PENDING`.

---

## OrderItem

| Field         | Type        | Notes                                          |
|---------------|-------------|---------------------------------------------------|
| id            | UUID (PK)   |                                                    |
| quantity      | INTEGER     | required                                          |
| priceAtOrder  | FLOAT       | **snapshotted** at order time — protects order history if the menu price later changes |
| orderId       | UUID (FK → Order) | required                                    |
| menuItemId    | UUID (FK → MenuItem) | required                                |

**Relations:** belongs to Order, belongs to MenuItem.
**Cascade:** deleting an Order cascades to its OrderItems.

---

## Review

| Field         | Type        | Notes                                    |
|---------------|-------------|---------------------------------------------|
| id            | UUID (PK)   |                                              |
| rating        | INTEGER     | 1–5, required                               |
| comment       | TEXT        |                                              |
| userId        | UUID (FK → User) | required                              |
| restaurantId  | UUID (FK → Restaurant) | required                        |
| createdAt     | DATETIME    | auto                                        |

**Relations:** belongs to User, belongs to Restaurant.
**Side effect:** on create, Restaurant.rating and Restaurant.reviewCount are
recalculated from all Reviews for that restaurant (Requirements §9).
**Note:** not gated on a completed Order in v1 (Requirements §9, §13).

---

## Indexes / constraints worth having

| Table       | Constraint                          | Why |
|-------------|--------------------------------------|-----|
| User        | unique(email)                        | login lookup, prevent duplicate accounts |
| Restaurant  | unique(slug)                         | clean URLs (`/restaurants/:slug`) |
| Restaurant  | index(cuisine), index(city)          | filter performance on Listing page |
| Order       | index(userId), index(restaurantId), index(status) | dashboard queries filter/group by these constantly |
| Review      | index(restaurantId)                  | rating recalculation + review list on Details page |

---

## What's deliberately not modeled (v1)

Matches Requirements §13:
- No `Category` table — cuisine is a flat string on Restaurant, not a
  normalized/managed list (Admin dashboard's "Categories" page in the
  wireframe would, if built, just manage distinct string values, not a real FK table).
- No `Payment` table — payment is simulated; `Order.total` is the only
  money field that exists.
- No `Rider`/`Delivery` table — explicitly skipped (see rider-role discussion).
- No `RefreshToken` table — single JWT access token only, no refresh flow.