# 🏠 Hostel Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing hostel operations with role-based access control.

## 🔹 Features

- **Authentication** – JWT-based login/signup with roles: Admin, Student, Warden
- **Student Management** – Add/edit/delete students, assign rooms, QR code generation
- **Room Management** – Single/Double/Triple rooms, AC/Non-AC, availability tracking
- **Payment Module** – Razorpay integration (test mode), payment history
- **Dashboard Analytics** – Charts for revenue, room occupancy, and more
- **Complaints System** – Students raise issues; admin/warden tracks & resolves
- **Attendance Tracking** – Daily attendance marking per student
- **Email Notifications** – Via Nodemailer (Gmail SMTP)

---

## 🔹 Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | React 18, React Router v6, Recharts|
| Backend    | Node.js, Express.js                |
| Database   | MongoDB with Mongoose              |
| Auth       | JWT + bcryptjs                     |
| Payments   | Razorpay (test mode)               |
| Email      | Nodemailer                         |

---

## 🔹 Project Structure

```
Hostel-Management-System/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/      # Navbar, Sidebar, Layout, ProtectedRoute
│       ├── modules/admin/   # Dashboard, Students, Rooms, Payments, Complaints, Attendance
│       ├── pages/           # Login, Signup
│       ├── services/        # Axios API calls
│       └── utils/           # Auth helpers
└── server/                  # Node.js backend
    ├── controllers/         # Business logic
    ├── middleware/          # Auth & error handling
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routes
    └── server.js            # Entry point
```

---

## 🔹 Setup Guide

### Prerequisites
- Node.js >= 16
- MongoDB (local or Atlas)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/sukhmani03/Hostel-Management-System.git
cd Hostel-Management-System
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

**Environment Variables** (`server/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Setup Frontend

```bash
cd client
npm install
npm start
```

The frontend runs on http://localhost:3000 and proxies API calls to http://localhost:5000.

---

## 🔹 Demo Credentials

| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | admin@hostel.com    | admin123  |
| Warden  | warden@hostel.com   | warden123 |
| Student | student@hostel.com  | student123|

---

## 🔹 API Routes

| Method | Route                         | Description           | Auth |
|--------|-------------------------------|-----------------------|------|
| POST   | /api/auth/register            | Register user         | No   |
| POST   | /api/auth/login               | Login                 | No   |
| GET    | /api/auth/me                  | Get current user      | Yes  |
| GET    | /api/students                 | List students         | Yes  |
| POST   | /api/students                 | Create student        | Admin|
| PUT    | /api/students/:id             | Update student        | Admin|
| DELETE | /api/students/:id             | Delete student        | Admin|
| PUT    | /api/students/:id/assign-room | Assign room           | Admin|
| GET    | /api/students/:id/qr          | Get QR code           | Yes  |
| GET    | /api/rooms                    | List rooms            | Yes  |
| POST   | /api/rooms                    | Create room           | Admin|
| PUT    | /api/rooms/:id                | Update room           | Admin|
| DELETE | /api/rooms/:id                | Delete room           | Admin|
| GET    | /api/payments                 | List payments         | Yes  |
| POST   | /api/payments                 | Create payment        | Yes  |
| POST   | /api/payments/create-order    | Razorpay order        | Yes  |
| POST   | /api/payments/verify          | Verify payment        | Yes  |
| GET    | /api/complaints               | List complaints       | Yes  |
| POST   | /api/complaints               | Create complaint      | Yes  |
| PUT    | /api/complaints/:id           | Update complaint      | Admin|
| GET    | /api/attendance               | Get attendance        | Yes  |
| POST   | /api/attendance               | Mark attendance       | Yes  |
| GET    | /api/dashboard/stats          | Dashboard stats       | Admin|
