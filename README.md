# 🎓 Omniscient IT Asset Management System

> **A Comprehensive, AI-Powered IT Asset Tracking & Management Dashboard.**  
> Built as a Final Year Project to demonstrate modern web development, state management, and real-time data visualization.

---

## 🌟 Key Features

* **🤖 Omniscient ChatBot:** An integrated, NLP-powered assistant that queries the live database (e.g., *"How many laptops are available?"* or *"Are there any open tickets?"*).
* **🌓 Seamless Dark Mode:** Flawless Light/Dark mode toggling built natively with Tailwind CSS, strictly passing accessibility contrast ratios.
* **⚡ Real-Time Global Search:** Instant fuzzy-matching across all 8 internal modules (Assets, Vendors, Employees, Software, etc.).
* **📊 Dashboard Analytics:** Visualizes 7-day rolling window hardware provisioning activities using Recharts.
* **📄 One-Click PDF Export:** Generate professional IT compliance reports directly from the dashboard.
* **🛡️ Role-Based Access Control:** Differentiated access levels for Employees, IT Techs, and Super Admins.

---

## 🏗️ Architecture & Tech Stack

This project uses a decoupled Client-Server architecture to ensure high performance and scalability.

### **Frontend (Client)**
* **React 18** (UI Library)
* **Vite** (Build Tool & Dev Server)
* **Tailwind CSS** (Utility-first styling & Dark Mode)
* **Zustand** (Global State Management)
* **TanStack React Query** (Data fetching, caching, and optimistic updates)
* **Framer Motion** (Fluid animations and page transitions)
* **Recharts** (Data visualization)

### **Backend (API)**
* **Node.js & Express** (RESTful API Server)
* **Prisma ORM** (Database schema and migrations)
* **SQLite** (Relational Database - easily swappable to PostgreSQL)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/it-asset-tracker.git
cd it-asset-tracker
```

### 2. Setup the Backend
```bash
cd backend-node
npm install
npx prisma generate
npx prisma db push
node server.js
```
*The backend server will run on `http://localhost:5000`.*

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will be available at `http://localhost:5173`.*

---

## 📸 Screenshots
*(Note: Replace these placeholders with actual screenshots of your running application before submitting your project!)*

### Dashboard & Analytics
![Dashboard Screenshot](https://via.placeholder.com/800x400.png?text=Dashboard+Analytics+Overview)

### Omniscient ChatBot in Action
![ChatBot Screenshot](https://via.placeholder.com/800x400.png?text=Omniscient+ChatBot+Answering+Queries)

### Asset Management (Dark Mode)
![Dark Mode Assets](https://via.placeholder.com/800x400.png?text=Asset+Registry+in+Dark+Mode)

---

## 👨‍💻 Developer
Developed with ❤️ by **Krish Limbachiya** for the Final Year Project presentation.
