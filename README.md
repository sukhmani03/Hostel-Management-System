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

## 🖥️ Running on VS Code

Follow these detailed steps to run the project using **Visual Studio Code**.

### Step 1 – Install Prerequisites

Before opening VS Code, make sure the following are installed on your machine:

| Tool | Download Link | Purpose |
|------|--------------|---------|
| **Node.js** (>= 16) | https://nodejs.org | Runs the backend server and frontend tooling |
| **MongoDB Community** | https://www.mongodb.com/try/download/community | Local database (or use MongoDB Atlas for cloud) |
| **Git** | https://git-scm.com | Clone and version-control the project |
| **VS Code** | https://code.visualstudio.com | Code editor |

> **Verify your installation** by running these in a terminal:
> ```bash
> node -v      # should print v16.x or higher
> npm -v       # should print 8.x or higher
> mongod --version   # should print MongoDB version
> git --version
> ```

---

### Step 2 – Clone and Open the Project in VS Code

1. Open **VS Code**.
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the Command Palette.
3. Type **Git: Clone** and select it.
4. Paste the repository URL:
   ```
   https://github.com/sukhmani03/Hostel-Management-System.git
   ```
5. Choose a folder on your machine to clone into, then click **Open** when prompted.

> **Alternatively**, clone via terminal then open in VS Code:
> ```bash
> git clone https://github.com/sukhmani03/Hostel-Management-System.git
> cd Hostel-Management-System
> code .
> ```

---

### Step 3 – Install Recommended VS Code Extensions

When you open the project, VS Code may prompt you to install recommended extensions. Click **Install All**.

If the prompt does not appear, install the extensions manually:

1. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS) to open the Extensions panel.
2. Search for and install each of the following:

| Extension | Publisher | Purpose |
|-----------|-----------|---------|
| **ESLint** | Dirk Baeumer | Highlights JavaScript/React linting errors |
| **Prettier – Code formatter** | Prettier | Auto-formats code on save |
| **ES7+ React/Redux Snippets** | dsznajder | Handy React code snippets |
| **MongoDB for VS Code** | MongoDB | Browse your MongoDB database inside VS Code |
| **DotENV** | mikestead | Syntax highlighting for `.env` files |
| **GitLens** | GitKraken | Enhanced Git history and blame info |

---

### Step 4 – Set Up Environment Variables

The backend requires a `.env` file to run:

1. In the VS Code **Explorer** (left sidebar), expand the `server/` folder.
2. Right-click `server/.env.example` → **Copy**, then paste it in the same folder and rename the copy to `.env`.
   > Or run in the VS Code integrated terminal (`Ctrl+\`` or `Ctrl+Backtick`):
   > ```bash
   > cp server/.env.example server/.env
   > ```
3. Open `server/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=7d
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> **Minimum required variables to start the app locally:**
> `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
> Email and Razorpay fields are only needed for those specific features.

---

### Step 5 – Install Dependencies

Open **two terminals** in VS Code using the integrated terminal:

- Press `Ctrl+\`` (backtick) to open the first terminal.
- Click the **+** icon in the terminal panel to open a second terminal.

**Terminal 1 – Backend:**
```bash
cd server
npm install
```

**Terminal 2 – Frontend:**
```bash
cd client
npm install
```

Wait for both installs to complete before proceeding.

---

### Step 6 – Start MongoDB

Make sure MongoDB is running **before** starting the backend.

- **Windows**: MongoDB may already run as a Windows Service. Check via **Services** app, or start manually:
  ```bash
  "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --dbpath="C:\data\db"
  ```
- **macOS/Linux**:
  ```bash
  sudo systemctl start mongod   # Linux (systemd)
  brew services start mongodb-community   # macOS (Homebrew)
  ```

> Alternatively, use **MongoDB Atlas** (free cloud database):
> 1. Create a free cluster at https://cloud.mongodb.com
> 2. Get your connection string (e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/hostel_management`)
> 3. Set `MONGODB_URI` in `server/.env` to that connection string.

---

### Step 7 – Run the Backend Server

In **Terminal 1** (inside the `server/` folder):

```bash
npm run dev
```

You should see:
```
MongoDB connected: localhost
Server running on port 5000
```

> If port 5000 is already in use, change `PORT=5000` to another port (e.g. `5001`) in `server/.env` and update the proxy in `client/package.json` to match.

---

### Step 8 – Run the Frontend

In **Terminal 2** (inside the `client/` folder):

```bash
npm start
```

A browser tab will automatically open at **http://localhost:3000**.

> The frontend is pre-configured to proxy all `/api/...` requests to `http://localhost:5000` (see `"proxy"` in `client/package.json`), so no extra CORS setup is needed.

---

### Step 9 – Debug with VS Code (Optional)

This project includes a `.vscode/launch.json` with ready-to-use debug configurations:

1. Press `F5` or go to **Run → Start Debugging** in the menu.
2. From the dropdown, select **"Debug Backend (Node.js)"** and press the green ▶ button.
3. VS Code will launch the Node.js server with the debugger attached.
4. You can now set **breakpoints** by clicking to the left of any line number in a `.js` file inside `server/`.
5. Use the **Debug toolbar** at the top to step through code, inspect variables, and view the call stack.

> The frontend (`npm start`) still needs to be started separately in a terminal as described in Step 8.

---

### Step 10 – Log In to the App

Open **http://localhost:3000** and log in using the demo credentials:

| Role    | Email               | Password   |
|---------|---------------------|------------|
| Admin   | admin@hostel.com    | admin123   |
| Warden  | warden@hostel.com   | warden123  |
| Student | student@hostel.com  | student123 |

---

### 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection error` | Make sure `mongod` is running and `MONGODB_URI` in `.env` is correct |
| `Cannot find module` | Run `npm install` in both `server/` and `client/` folders |
| `Port 5000 already in use` | Change `PORT` in `server/.env` and update the `proxy` in `client/package.json` |
| `npm run dev` not found | Install nodemon: `npm install -g nodemon` or run `npm install` inside `server/` |
| React app blank page | Open browser DevTools console (`F12`) for error details |
| CORS errors in browser | Ensure both frontend (`3000`) and backend (`5000`) are running and proxy is configured |

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
