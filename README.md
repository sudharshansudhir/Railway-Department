# 🚆 Tower Wagon Driver Management System

A real-world railway compliance and duty management web application built for **Indian Railways (TRD/SA Division)**. The system digitizes driver bio records, daily duty logs, mileage calculations, safety checklists (T-Card), training & LR compliance, circular distribution, and reporting using a secure role-based architecture.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [User Roles](#user-roles)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

### Purpose
This system manages the daily operations and compliance of Tower Wagon Drivers across multiple railway depots. It ensures:
- Accurate duty logging with mileage calculations
- Daily safety checklists (T-Card) completion
- Training and certification tracking
- Road Learning (LR) compliance
- Centralized circular distribution

### Target Users
- **Tower Wagon Drivers (TWD)**: Field operators
- **SSE/TRD (Depot Managers)**: Depot supervisors
- **Sr.DEE/TRD/SA (Division Head)**: System administrators

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React + Vite | 19.x / 7.x |
| Styling | Tailwind CSS | 4.x |
| Backend | Node.js + Express | 22.x / 5.x |
| Database | MongoDB Atlas | 7.x |
| ODM | Mongoose | 9.x |
| Authentication | JWT + bcryptjs | - |
| File Storage | Cloudinary | - |
| PDF Viewer | react-pdf-viewer | 3.x |

---

## User Roles

### 🚛 Driver (Tower Wagon Driver)
- Login using PF Number
- Maintain bio data (HRMS ID, designation, pay, dates)
- Enter daily mileage (Sign ON / Sign OFF with GPS)
- Breath Analyser confirmation
- Daily T-Card safety checklist (12 items)
- View and acknowledge circulars
- Receive training / LR alerts

### 👷 Depot Manager (SSE/TRD)
- View drivers under same depot only
- View complete driver profile (read-only)
- View daily duty logs with stations & mileage
- View T-Card checklist submissions
- View training & LR compliance status
- View circular acknowledgement status
- Generate depot-level reports

### 🛡️ Super Admin (Sr.DEE/TRD/SA)
- Full access to all depots
- Register drivers and depot managers
- Upload PDF circulars (mandatory reading)
- View all users with detailed profiles
- Download consolidated reports
- System-wide monitoring

---

## Features

### Daily Mileage Module
- Sign ON with GPS-detected station
- TW Number entry
- Breath Analyser test confirmation
- Sign OFF with GPS-detected station
- Automatic mileage calculation: `(Hours × 20) + KM`
- Immutable daily duty logs

### T-Card Safety Checklist
12-item daily checklist:
1. Check Diesel level
2. Drain water sediments fuel filter
3. Check engine oil level and top up if necessary
4. Check fuel, oil, water and exhaust leak
5. Check air cleaner oil level
6. Check air line leak
7. Fill radiator tank with treated water if necessary
8. Clean compressor breather
9. Drain air receiver tank and close drain cock
10. Clean crank case breather
11. Start engine and note oil pressure
12. Record oil pressure and brake pressure

### Training & LR Compliance
- **PME**: 4-year cycle
- **GRS/RC**: 3-year cycle
- **TR4**: 3-year cycle
- **OC**: 6-month cycle
- **LR (Road Learning)**: 3-month section-wise validity
- Automatic overdue alerts

### Circular Management
- Admin uploads circulars as PDF
- Mandatory acknowledgement for Drivers & Managers
- In-app PDF viewer (no external tabs)
- Full-screen popup blocks access until acknowledged
- Stored securely in Cloudinary

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for PDF storage)

### 5-Minute Setup

```bash
# Clone and enter project
cd Railway-Department

# Backend setup
cd backend
cp .env.example .env    # Edit with your credentials
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend
cp .env.example .env    # Edit if needed
npm install
npm run dev
```

### Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Test Credentials

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| Super Admin | admin | admin123 | Full access |
| Driver | 15661407410 | 15661407410 | Must change on first login |
| SSE/TRD | 15605702938 | 15605702938 | Must change on first login |

---

## Installation

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Environment Configuration

### Backend (.env)

Create `backend/.env` from `backend/.env.example`:

```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB Atlas
# IMPORTANT: Replace <database> with your actual database name (e.g., railway, railway-prod)
# If you omit the database name, MongoDB will use "test" as default
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/railway

# JWT Secret (min 32 characters)
JWT_SECRET=your_secure_jwt_secret_key_minimum_32_characters

# Cloudinary (for PDF storage)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Get MONGO_URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Go to "Database" → "Connect"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials
6. **Replace `<database>` with your database name** (e.g., `railway` or `railway-prod`)

### Frontend (.env)

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URI=http://localhost:3000
```

---

## Running the Application

### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Mode

```bash
# Backend
cd backend
npm start

# Frontend (build first)
cd frontend
npm run build
npm run preview
```

### Utility Scripts

```bash
# Validate database integrity
cd backend
npm run validate

# Seed SSE/TRD accounts (from client data)
npm run seed:sse

# Seed local development data
npm run seed:local
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/change-password` | Change password (requires token) |

### Driver Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/driver/profile` | Get own profile |
| PUT | `/driver/profile/bio` | Update bio data |
| PUT | `/driver/profile/training` | Update training info |
| PUT | `/driver/profile/lr` | Add LR entry |
| POST | `/driver/signin` | Sign in for duty |
| POST | `/driver/signout` | Sign out from duty |
| POST | `/driver/tcard` | Submit T-Card checklist |
| GET | `/driver/active-duty` | Check active duty status |
| GET | `/driver/alerts` | Get overdue alerts |

### Depot Manager Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/depot/drivers` | Get depot drivers |
| GET | `/depot/driver/:id` | Get driver full profile |
| GET | `/depot/driver/:id/tcards` | Get driver T-Cards |
| GET | `/depot/reports` | Get depot report |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all users |
| GET | `/admin/users/:id` | Get user details |
| POST | `/admin/register` | Register new user |
| GET | `/admin/depots` | Get all depots |
| GET | `/admin/reports` | Get admin report |
| GET | `/admin/reports/download` | Download CSV report |

### Circular Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/circulars` | Upload circular (Admin) |
| GET | `/admin/circulars` | Get all circulars |
| GET | `/admin/circulars/latest` | Get latest for acknowledgement |
| POST | `/admin/circulars/acknowledge` | Acknowledge circular |
| GET | `/admin/circulars/status` | Check acknowledgement status |
| GET | `/admin/circulars/acknowledgement-report` | Admin acknowledgement report |

---

## Project Structure

```
Railway-Department/
├── backend/
│   ├── server.js              # Express app entry
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── seeder.js          # Dev data seeder
│   │   ├── seedSSETRD.js      # SSE/TRD account seeder
│   │   └── validateDatabase.js # DB integrity checks
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── circularController.js
│   │   ├── depotController.js
│   │   ├── driverController.js
│   │   └── tcardController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── circularAck.js     # Acknowledgement middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── DriverProfile.js
│   │   ├── DailyLog.js
│   │   ├── TCardChecklist.js
│   │   └── Circular.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── circularRoutes.js
│   │   ├── depotRoutes.js
│   │   └── driverRoutes.js
│   └── utils/
│       ├── cloudinary.js      # Cloudinary setup
│       ├── constants.js       # App constants
│       └── reportExporter.js  # CSV generation
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── App.jsx            # Route definitions
│       ├── main.jsx           # Entry point
│       ├── index.css          # Global styles
│       ├── api/
│       │   └── axios.jsx      # API client
│       ├── components/
│       │   ├── CircularPopup.jsx
│       │   ├── Footer.jsx
│       │   ├── Navbar.jsx
│       │   ├── PDFViewer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── UserDetailModal.jsx
│       ├── context/
│       │   └── CircularGuard.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── ChangePassword.jsx
│           ├── DriverDashboard.jsx
│           ├── DailyActivity.jsx
│           ├── DriverProfile.jsx
│           ├── DriverHealth.jsx
│           ├── DriverLR.jsx
│           ├── DepotManagerDashboard.jsx
│           ├── DriverDetails.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminRegister.jsx
│           ├── AdminCircularUpload.jsx
│           ├── AdminCircularStatus.jsx
│           ├── AdminReportDownload.jsx
│           ├── AdminUserDetail.jsx
│           └── CircularList.jsx
│
├── .gitignore
├── .ai-context.md             # AI session reference (git ignored)
└── README.md
```

---

## Security

### Authentication Flow
1. User logs in with PF Number + Password
2. First login requires password change (initial password = PF Number)
3. JWT token generated with role and depot info
4. Token stored in localStorage (expires in 24 hours)
5. Protected routes verify token and role

### Security Features
- Passwords hashed with bcrypt (10 rounds)
- JWT-based authentication
- Role-based access control (RBAC)
- Depot-level data isolation for managers
- CORS protection
- Input validation on all endpoints
- First-login password change enforcement
- Circular acknowledgement requirement

---

## Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)

1. Set environment variables on hosting platform
2. Ensure `NODE_ENV=production`
3. Deploy with `npm start`

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_API_URI` to production backend URL
4. Configure SPA routing (redirect all to index.html)

### Database
- Use MongoDB Atlas for production
- Enable IP whitelist for your deployment servers
- Create database indexes for performance:
  - `User.pfNo` (unique)
  - `DailyLog.driverId` + `DailyLog.logDate`
  - `TCardChecklist.driverId` + `TCardChecklist.date`

---

## Troubleshooting

### Backend Issues

**MongoDB Connected to "test" Database**
```
📍 Database: test
```
**Problem:** Your MongoDB URI doesn't specify a database name, so it defaults to "test".

**Solution:**
1. Open `backend/.env`
2. Update your `MONGO_URI` from:
   ```
   mongodb+srv://user:pass@cluster.net
   ```
   to:
   ```
   mongodb+srv://user:pass@cluster.net/railway
   ```
3. Restart the backend server
4. Verify you see: `📍 Database: railway`

**MongoDB Connection Failed**
```
❌ MongoDB Connection Failed: ECONNREFUSED
```
- Check `MONGO_URI` in `.env`
- Verify IP whitelist on MongoDB Atlas
- Try: `NODE_ENV=development npm run dev:local` for local MongoDB

**JWT Secret Error**
```
Error: secretOrPrivateKey must have a value
```
- Ensure `JWT_SECRET` is set in `.env`

### Frontend Issues

**API Connection Failed**
```
Network Error / CORS
```
- Verify backend is running on port 3000
- Check `VITE_API_URI` in `.env`
- Ensure backend CORS allows frontend origin

**Blank Page After Login**
- Clear browser localStorage
- Check browser console for errors
- Verify token is being stored

### Common Fixes

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset development database
cd backend
npm run seed:local

# Validate database integrity
npm run validate
```

---

## Contributing

### Git Commit Convention

```
[Commit #X] Area - Short Description

Examples:
[Commit #12] Auth - Add password change validation
[Commit #13] UI - Fix T-Card date picker
[Commit #14] API - Optimize duty log queries
```

### Development Guidelines

1. **No functional behavior changes** without discussion
2. **Test all roles** after changes
3. **Keep components small** and focused
4. **Use constants** from `utils/constants.js`
5. **Handle errors** gracefully with user feedback

---

## License

ISC License - Developed by Sri Shakthi CSE Department

---

## Support

For queries, contact: ssrskillworks@gmail.com

GitHub: [Railway-Department](https://github.com/sudharshansudhir/Railway-Department)

