# Drive Prime Car Marketplace

Drive Prime is a full-stack car marketplace web application. It features a modern, responsive frontend built with React and Vite, paired with a robust backend powered by Node.js, Express, and MySQL. The platform facilitates browsing, buying, and selling cars with real-time updates and dealership management features.

## 🚀 Features

- **User Authentication & Authorization**: Secure login and registration using JWT and bcrypt. Role-based access control (e.g., Admin, Dealer, User).
- **Vehicle Listings**: Browse, search, and filter cars. View detailed car information including images and documents.
- **Real-Time Updates**: Features Server-Sent Events (SSE) for live data push to connected clients.
- **Appointments & Messages**: Integrated scheduling for test drives/viewings and in-app messaging between users and dealerships.
- **Admin Dashboard**: Approvals for pending vehicles, flag management, brands, and platform settings.
- **Dealership Management**: Dealership profiles, inventory management, and contact handling.

## 💻 Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM 7
- Framer Motion (UI Animations)
- React Icons

### Backend
- Node.js & Express.js
- MySQL2 (Database Driver)
- JSON Web Token (JWT)
- bcryptjs (Password Hashing)
- Nodemailer (Email Services)
- cors & dotenv

## 📋 Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v18 or higher recommended)
- MySQL Server

## 🛠️ Setup & Installation

### 1. Navigate to project

Navigate to the project directory:
```bash
cd car-marketplace
```

### 2. Backend Setup
1. Open the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Check the `.env` file in the `backend` folder and configure your local MySQL database credentials, JWT secret, and email setup.
4. Run the database setup script to auto-create the database and tables:
   ```bash
   npm run setup
   ```
5. Start the backend server:
   ```bash
   npm start
   # or for development mode (nodemon):
   npm run dev
   ```
   The API should now be running on `http://localhost:3001`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the project root:
   ```bash
   cd car-marketplace
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The platform frontend will be accessible at `http://localhost:5173`.

## 📂 Project Structure

```text
car-marketplace/
├── backend/                  # Node.js/Express backend API
│   ├── middleware/           # Request interceptors & auth checks
│   ├── routes/               # API endpoint definitions (auth, listings, etc.)
│   ├── db.js                 # MySQL connection setup
│   ├── server.js             # Express app entry point
│   ├── setujs                # Database & schema creation script
│   └── sse.js                # Server-Sent Events integration
├── public/                   # Static public assets
├── src/                      # React frontend
│   ├── assets/               # Brand images and icons
│   ├── components/           # Reusable functional UI components
│   ├── context/              # React context providers
│   ├── data/                 # Static fallback data and constants
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Helper utilities and API clients
│   ├── pages/                # Main application views/routes
│   └── store/                # Global state management
├── index.html                # Main HTML template
├── package.json              # Main project dependencies & scripts
└── vite.config.js            # Vite configuration
```
