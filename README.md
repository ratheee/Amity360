# Amity 360

A campus management platform for **Amity University Rajasthan**, built with React, TypeScript and Vite.

Students, faculty and administrators each get a role-specific experience for mess feedback, campus navigation, academic resources, complaints, and announcements and events.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run typecheck  # typecheck only
npm run preview    # serve the production build locally
```

### Review mode

The app now ships as the **full application** (`REVIEW_MODE = false` in [src/config.ts](src/config.ts)). Set it to `true` to switch back to review mode, where:

- Sign-in, the app layout and the profile page work as normal.
- The dashboard shows project progress (`PROJECT_PROGRESS`, currently 45%), the development phases and the tech stack.
- Every other module opens a design page listing its target users, planned features and workflow (from [src/data/plan.ts](src/data/plan.ts)) instead of the working screen.
- Every role can open every module page, including the Admin Panel.

### Demo accounts

| Role          | Email                  | Password      |
| ------------- | ---------------------- | ------------- |
| Student       | student@amity360.edu   | Student@123   |
| Faculty       | faculty@amity360.edu   | Faculty@123   |
| Administrator | admin@amity360.edu     | Admin@123     |

The login screen has one-click buttons that fill these in. You can also register new student or faculty accounts. Admin accounts can't be self-registered; an admin promotes users from **Admin Panel → Users**.

> **Current phase: frontend.** Data lives in a mock database in the browser's `localStorage`. To reset it, run `localStorage.removeItem('amity360.db')` in the browser console and reload.

## Features

| Module | Student | Faculty | Admin |
| --- | --- | --- | --- |
| **Auth** | Register, sign in, profile, change password | Same | Same and role management |
| **Mess Feedback** | Weekly menu; rate each meal once a day (overall, taste, hygiene, quantity) | View ratings | View ratings; alerted on low ratings |
| **Campus Navigation** | Interactive map, search and filter, building details, shortest walking route | Same | Same |
| **Academic Resources** | Browse and filter material; submit assignments | Publish material; create assignments; grade | Same as faculty |
| **Complaints** | Raise and track tickets with a timeline | Same | Manage all tickets; update status with notes |
| **Announcements & Events** | Read, filter, RSVP to events | Post announcements and events | Post, pin, delete any |
| **Admin Dashboard** | – | – | Stats, complaint queue, mess analytics, user management |

Across the app: responsive sidebar, global search (modules and buildings), a notification centre, toasts, form validation, and loading, empty and error states.

## Project structure

```
src/
├── main.tsx                 # Entry: mounts providers + App
├── App.tsx                  # Auth guard, role checks, page switch
├── config.ts                # REVIEW_MODE flag and project progress
├── types.ts                 # Shared domain types (User, Complaint, …)
├── components/
│   ├── layout/              # AppLayout, Sidebar, Topbar (search + notifications)
│   ├── ui/                  # Button, Field, Modal, Badge, StarRating, Panel, PageHeader, Tabs, StatCard, States
│   └── ComplaintDetailModal.tsx   # Shared by Complaints & Admin pages
├── context/
│   ├── auth.ts              # Auth context + useAuth / useCurrentUser hooks
│   ├── AuthContext.tsx      # Current user, login/register/logout
│   └── ToastContext.tsx     # Toast notifications
├── hooks/
│   ├── useHashRoute.ts      # Tiny hash router (#/mess, #/admin, …)
│   ├── useAsync.ts          # Data loading with loading/error/reload
│   └── useForm.ts           # Form state + validation
├── services/
│   ├── api.ts               # ← the only data access layer used by pages
│   └── mockDb.ts            # localStorage database (replaced by backend)
├── data/                    # Module registry, labels, seed data, campus map graph,
│                            #   module plans and project phases (plan.ts)
├── pages/                   # One file per screen (auth/, admin/, …)
│   └── review/              # Review-mode dashboard and module design pages
├── utils/                   # Formatting + validators
└── styles/                  # global.css (base), components.css, pages.css
```

## Roadmap

1. **Frontend:** all module screens built and working.
2. **Backend:** Node.js and Express REST API mirroring `services/api.ts`.
3. **Authentication:** bcrypt password hashing, JWT sessions, role middleware.
4. **Database:** MongoDB with Mongoose models for every domain type; file uploads for resources and submissions.
5. **Testing:** Vitest and React Testing Library for the frontend, Supertest for the API.
