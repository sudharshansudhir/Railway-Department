# 🚆 Tower Wagon Driver Management System

Tower Wagon Driver Management System is a real-world railway compliance and duty management web application built for Indian Railways (TRD / SA Division). The system digitizes driver bio records, daily duty logs, mileage calculations, safety checklists (T-Card), training & LR compliance, circular distribution, and reporting using a secure role-based architecture.

The application is designed with three user roles: Driver, Depot Manager, and Super Admin, each having clearly separated permissions and access levels.

---

## Technology Stack

Frontend: React (Vite) + Tailwind CSS  
Backend: Node.js + Express.js  
Database: MongoDB (Mongoose)  
Authentication: JWT (JSON Web Token)  
Security: bcrypt  
File Storage: Cloudinary (PDF Circular uploads)  
Architecture: MERN Stack with REST APIs  

---

## User Roles Overview

Driver:
- Login using PF Number and password
- Maintain bio data (HRMS ID, designation, pay, dates)
- Enter daily mileage (Sign ON / Sign OFF)
- GPS-based station detection
- Breath Analyser confirmation
- Daily T-Card safety checklist (12 items)
- View circulars
- Receive training / LR alerts

Depot Manager:
- View drivers under same depot
- View complete driver profile (read-only)
- View daily duty logs with stations & mileage
- View T-Card checklist submissions
- Generate depot-level reports

Super Admin:
- Full access to all depots
- Register drivers and depot managers
- Upload PDF circulars
- View and download consolidated reports
- System-wide monitoring

---

## Project Folder Structure

project-root  
│  
├── backend  
│   ├── controllers  
│   ├── models  
│   ├── routes  
│   ├── middleware  
│   ├── utils  
│   └── server.js  
│  
├── frontend  
│   ├── src  
│   │   ├── pages  
│   │   ├── components  
│   │   ├── api  
│   │   └── App.jsx  
│   └── main.jsx  
│  
└── README.md  

---

## Installation and Setup Instructions

Step 1: Clone the repository

git clone <REPOSITORY_URL>

---

Step 2: Backend setup

Open terminal and run:

cd backend  
npm install  

Create a `.env` file inside the backend folder and add the following:

PORT=3000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_jwt_secret  

CLOUD_NAME=your_cloudinary_cloud_name  
CLOUDINARY_API_KEY=your_cloudinary_api_key  
CLOUDINARY_API_SECRET=your_cloudinary_api_secret  

Cloudinary credentials can be obtained by creating a free account at:  
https://www.cloudinary.com

Start backend server:

npm run dev  

Backend will run on:  
http://localhost:3000

---

Step 3: Frontend setup

Open a new terminal and run:

cd frontend  
npm install  

Start frontend server:

npm run dev  

Frontend will run on:  
http://localhost:5173

---

## Authentication Flow

- User logs in using PF Number and password
- JWT token is generated and stored in localStorage
- Role-based redirection:
  - Driver → /driver
  - Depot Manager → /manager
  - Super Admin → /admin
- Protected routes enforce access control

---

## Core Functional Features

Daily Mileage Module:
- Sign ON with GPS-detected station
- TW Number entry
- Breath Analyser test confirmation
- Sign OFF with GPS-detected station
- Automatic mileage calculation (Hours × 20 + KM)
- Immutable daily duty logs

T-Card Safety Checklist:
- Mandatory daily checklist (12 safety items)
- Checked / unchecked with remarks
- Stored date-wise per driver
- Viewable by Depot Manager & Admin

Training & LR Compliance:
- Training section, done date, due date, schedule
- LR validity tracking
- Overdue alerts generated automatically

Circular Management:
- Admin uploads circulars as PDF
- Stored securely in Cloudinary
- Viewable by all users

Reports:
- Date-wise duty reports
- Driver-wise mileage and hours
- Depot-wise summaries
- Downloadable by Admin / Manager

Location Tracking:
- Uses device GPS
- Converts coordinates to station name
- Auto-filled for Sign ON and Sign OFF

---

## Ports Used

Backend: 3000  
Frontend: 5173  

---

## Pending / Future Enhancements

- Mobile responsiveness verification
- Convert application to Web App (PWA)
- UI enhancements (if required)
- PDF reading permission checks
- Admin login and report audit tracking
- Deployment (Render / Railway / Vercel)

---

## Stack Summary

MERN + JWT + bcrypt + Cloudinary

---

## Developed For

Indian Railways  
TRD / SA Division  
Tower Wagon Driver Compliance & Safety Monitoring System

---

## Notes

- MongoDB must be accessible
- Cloudinary credentials are mandatory for circular upload
- Location permission is required for duty sign-in
- Best experienced on modern browsers
- Also mention the commit count in the commit message so it will be easy to track the current changes

---

## Project Status

Core backend and frontend completed  
Enhancements in progress
