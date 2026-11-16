# CampusConnect — Smart Campus Management System

CampusConnect is a full-stack web application built with **React, Tailwind CSS, Axios, React Router, Node.js, Express.js, MongoDB, Mongoose, and JWT Authentication**. It provides a centralized digital portal for college students and campus administrators to manage announcements, submit and track facility complaints, register for college events, and coordinate lost & found items.

---

## Project Architecture

```text
├── backend/
│   ├── config/db.ts                  # Mongoose connection (MONGO_URI + MongoMemoryServer fallback)
│   ├── controllers/                  # Business logic for Auth, Announcements, Complaints, Events, Lost & Found, Users, Dashboards
│   ├── middleware/                   # JWT auth, role authorization, Multer file upload, error handlers
│   ├── models/                       # Mongoose schemas (User, Announcement, Complaint, Event, EventRegistration, LostFoundItem)
│   ├── routes/                       # Express REST API routers (/api/*)
│   └── seed/seedData.ts              # Initial sample dataset seeder
├── frontend/
│   ├── components/                   # Layout, Sidebar, ProtectedRoute, ConfirmDialog, StatusIndicator, LoadingSkeleton
│   ├── context/                      # AuthContext, ToastContext
│   ├── pages/                        # Dashboards (Student & Admin), Login, Register, Announcements, Complaints, Events, Lost & Found, Students, Profile
│   ├── services/                     # Axios client + modular REST service wrappers
│   ├── types/                        # TypeScript interfaces
│   ├── App.tsx                       # React Router route table & role guards
│   ├── index.css                     # Tailwind CSS v4 & typography tokens
│   └── main.tsx                      # React root mount
├── server.ts                         # Full-stack Express + Vite server entry point (Port 3000)
└── .env.example                      # Environment variable template
```

---

## MongoDB Collections

1. **Users**: Stores student & admin accounts, bcrypt-hashed passwords, roles (`STUDENT` | `ADMIN`), USN, department, semester, and phone.
2. **Announcements**: Campus circulars with title, description, category (`Academic`, `Examination`, `Events`, `Placement`, `General`), priority, and author reference.
3. **Complaints**: Student-reported campus issues with category (`Electrical`, `Water`, `Classroom`, `Internet`, `Cleaning`, `Other`), location, uploaded image URL, status (`Pending`, `In Progress`, `Resolved`), admin remarks, and a `statusHistory` timeline array.
4. **Events**: College events with date, time, venue, category, organizer, capacity, and optional banner image.
5. **EventRegistrations**: Tracks student registrations per event with a unique compound index on `{ event, student }`.
6. **LostFoundItems**: Lost and found reports with type (`Lost` | `Found`), location, date, contact info, status (`Open`, `Claimed`, `Resolved`), and optional photo.

---

## Local Setup & Execution

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- MongoDB Community Server or MongoDB Atlas URI (optional: if `MONGO_URI` is not reachable or omitted, the server automatically starts a local in-memory MongoDB instance via `mongodb-memory-server` so you can run and test immediately).

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and update values as needed:
```bash
cp .env.example .env
```

```env
MONGO_URI="mongodb://127.0.0.1:27017/campusconnect"
JWT_SECRET="your_secure_random_jwt_secret"
PORT=3000
```

### 4. Run in Development Mode
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Build & Run in Production Mode
```bash
npm run build
NODE_ENV=production npm start
```

---

## Demo Credentials (Auto-Seeded)

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Student | `student@campusconnect.edu`  | `Student@123`|
| Admin   | `admin@campusconnect.edu`    | `Admin@123`  |

---

## REST API Endpoints Summary

- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Verify active session and get user profile
- `GET /api/dashboard/student` — Student summary metrics, recent notices, events, and complaints
- `GET /api/dashboard/admin` — Admin metrics and Recharts analytics aggregations
- `GET | POST | PUT | DELETE /api/announcements` — Announcement CRUD (Write restricted to Admin)
- `GET | POST | DELETE /api/complaints` & `PUT /api/complaints/:id/status` — Complaint filing with image upload & Admin resolution updates
- `GET | POST | PUT | DELETE /api/events` & `POST | DELETE /api/events/:id/register` & `GET /api/events/:id/registrations` — Event management & capacity-checked student registration
- `GET | POST | PUT | DELETE /api/lost-found` — Lost & Found reporting with image upload
- `GET | PUT /api/users/profile` & `GET | DELETE /api/users/students` — Profile management & Admin student directory
