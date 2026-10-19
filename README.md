# 🌟 EventHub — Full-Stack Event Registration & Management Platform

A high-performance, full-stack event registration and organizer management system built with modern engineering standards and a dark glassmorphic design system.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Framer Motion, Lucide React, React Hot Toast, Axios
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`)
- **Database**: MongoDB via Mongoose (with automated in-memory MongoDB fallback)
- **Styling**: Handcrafted CSS design tokens with glassmorphic cards, mesh gradients, and micro-interactions

---

## ✨ Features

### 👤 Attendee Experience
- **Live Event Discovery**: Browse events with real-time capacity progress indicators, countdown badges, and category filtering.
- **Instant Registration Modal**: Accessible, keyboard-friendly multi-step registration modal with client-side and server-side validation.
- **My Registrations Portal**: Attendees can look up their event passes by email and cancel registrations with an interactive confirmation dialog.
- **Seat Availability Tracking**: Automatic sold-out badges and real-time remaining spot computations.

### 🛡️ Organizer & Admin Portal (`/admin`)
- **JWT Authentication**: Secure organizer login with salted password hashing via Bcrypt.
- **Operational Metrics**: High-level dashboard counters for active events, total registrations, overall capacity, and capacity utilization percentage.
- **Event Management (CRUD)**: Create, edit, and delete events with custom categories, capacities, tags, and rich descriptions.
- **Attendee Roster Management**: View attendee rosters across all events with instant attendee removal actions.
- **1-Click Demo Login**: Quick-fill login button for instant demo and evaluation.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 3. Backend Setup
```bash
cd backend
npm install
npm start
```
*Note: If local MongoDB is not detected, an in-memory database will automatically launch and self-seed with demo data!*

Backend will run at: `http://localhost:5000`

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Access URL | Credentials |
|---|---|---|
| **Attendee** | `/my-registrations` | `abhi.18@example.com` |
| **Organizer / Admin** | `/admin` | `admin@eventhub.com` / `admin123` |

---

## 📡 API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List all events with registration count & spots remaining |
| `GET` | `/api/events/:id` | Get single event details |
| `POST` | `/api/register` | Register an attendee `{ user_name, user_email, event_id }` |
| `GET` | `/api/my-registrations?email=` | View registrations by attendee email |
| `DELETE` | `/api/registrations/:id` | Cancel a registration |
| `GET` | `/api/health` | Server health check |

### Organizer / Protected Endpoints (Requires `Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Organizer sign in & token issuance |
| `GET` | `/api/admin/me` | Current organizer profile |
| `GET` | `/api/admin/stats` | Dashboard aggregated statistics |
| `GET` | `/api/admin/registrations` | View all attendee registrations |
| `DELETE` | `/api/admin/registrations/:id` | Remove an attendee registration |
| `POST` | `/api/admin/events` | Create and publish a new event |
| `PUT` | `/api/admin/events/:id` | Update an existing event |
| `DELETE` | `/api/admin/events/:id` | Delete event and cascade-remove registrations |

---

## 📄 License
This project is open-source and available under the MIT License.
