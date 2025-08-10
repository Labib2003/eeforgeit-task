# Multi-Stage Digital Competency Assessment Platform

This is the source code for a **multi-stage digital competency assessment platform** with role-based access for **Admins**, **Supervisors**, and **Students**.

## 📌 Live Deployment

**Frontend:** [https://test-school-labib2003.netlify.app](https://test-school-labib2003.netlify.app/)
**Backend API:** [https://eeforgeit-task.onrender.com](https://eeforgeit-task.onrender.com)

## 📂 Repository Structure

```
.
├── backend   # Express + MongoDB API
└── frontend  # React + Vite Client
```

## 🗄 Database Design

The database schema is documented here:
[📄 Database Design PDF](./Database_Design.pdf)

## 🚀 Running the Application Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Labib2003/eeforgeit-task
cd eeforgeit-task
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
vim .env # Update environment variables (MongoDB URI, JWT secrets, email credentials)
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
# Update axiosInstance.ts with backend API URL if needed
npm run dev
```

## 🧑‍💻 User Roles & Exam Flow

- **Admin** → Manages exams, questions, and users
- **Supervisor** → Reviews & evaluates submissions
- **Student** → Takes exams in **3 stages**:

  - Step 1: A1 & A2
  - Step 2: B1 & B2
  - Step 3: C1 & C2
  - Certificates are sent via email upon passing.

## 🔑 Highlights

- **OTP-based Login** (no manual signup needed)
- **Role-based Access Control**
- **Email Certificates with Nodemailer**
- **JWT Auth with Access & Refresh Tokens**
- **Strict Exam Timing & Level Validation**
