# ForkLane — Backend

Food discovery & ordering platform backend. See `Project Requirements.md`,
`Project Wireframe.md`, and `Database Models.md` for the product spec, page
layouts, and schema design this implementation follows.

## Tech stack

| Layer            | Choice                          |
|-------------------|----------------------------------|
| Runtime           | Node.js                          |
| Language          | TypeScript                       |
| Web framework     | Express                          |
| Database          | PostgreSQL                       |
| ORM               | Prisma                           |
| Auth              | JWT (jsonwebtoken) + bcrypt password hashing |
| Validation        | Zod (request body/query schema validation) |
| Architecture      | Module-based (feature-per-folder) |

> Note: an earlier working prototype of this backend used Sequelize + SQLite
> in plain JS as a sandbox-only substitute (Prisma's engine binaries
> couldn't be downloaded in that environment, and module architecture /
> TypeScript weren't yet decided). This README describes the intended
> production stack — TypeScript + Prisma + PostgreSQL, module architecture —
> which you run locally.

## Folder structure — module architecture

Each feature is a self-contained module: its own route, controller,
service (business logic + Prisma calls), and Zod validation schema live
together, instead of being split across global `routes/`/`controllers/`
folders. This is the same pattern the reference PH-Healthcare project uses.

```
src/
  app/
    modules/
      Auth/
        auth.route.ts
        auth.controller.ts
        auth.service.ts
        auth.validation.ts
      User/
        user.route.ts
        user.controller.ts
        user.service.ts
        user.validation.ts
      Restaurant/
        restaurant.route.ts
        restaurant.controller.ts
        restaurant.service.ts
        restaurant.validation.ts
      MenuItem/
        menuItem.route.ts
        menuItem.controller.ts
        menuItem.service.ts
        menuItem.validation.ts
      Order/
        order.route.ts
        order.controller.ts
        order.service.ts
        order.validation.ts
      Review/
        review.route.ts
        review.controller.ts
        review.service.ts
        review.validation.ts
      Dashboard/
        dashboard.route.ts
        dashboard.controller.ts
        dashboard.service.ts
    middlewares/
      auth.ts                  JWT verification + role-based access control
      validateRequest.ts        Zod schema validation middleware
      globalErrorHandler.ts     centralized error handling
      notFound.ts
    routes/
      index.ts                  combines every module's router
    errors/
      AppError.ts                custom error class
    interfaces/
      index.d.ts                  shared TS types (e.g. Express Request augmentation for req.user)
    config/
      index.ts                     env var loading
  app.ts                            Express app setup (middleware, routes mounted)
  server.ts                         entry point — starts the HTTP server
prisma/
  schema.prisma                      data model (source of truth — see Database Models.md)
  seed.ts                             demo data + demo accounts
```

**Convention per module:** `*.route.ts` defines Express routes and wires in
`validateRequest(schema)` + `auth`/`requireRole` middleware →
`*.controller.ts` handles req/res, calls the service, catches errors →
`*.service.ts` holds the actual Prisma queries and business rules →
`*.validation.ts` holds the Zod schemas for that module's request bodies.

## Environment variables

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/forklane"
JWT_SECRET="change-me"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

## Setup

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts
npm run dev
```

## Demo accounts (seeded)

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin@demo.com    | Admin123!   |
| Manager | manager@demo.com  | Manager123! |
| User    | user@demo.com     | User123!    |

## Scripts

| Command          | Does what                          |
|-------------------|--------------------------------------|
| `npm run dev`      | Start server with autoreload (ts-node-dev/nodemon) |
| `npm run build`    | Compile TypeScript to `dist/`         |
| `npm start`        | Run compiled server (production)      |
| `npx prisma studio`| Browse the database in a GUI          |
| `npx ts-node prisma/seed.ts` | Reseed demo data            |

## Docs

- `Project Requirements.md` — roles, auth rules, order lifecycle, what's in/out of scope for v1
- `Project Wireframe.md` — page-by-page layout structure
- `Database Models.md` — entity fields, relationships, constraints
- ERD — visual entity-relationship diagram (see conversation)