# 📘 Booking System Frontend

A modern React + TypeScript + Vite web app for managing businesses, shops, staff, working hours, inventory, and bookings — built as part of a multi-shop SaaS platform.

This is the frontend client, designed to integrate with the Booking System backend API.

------------------------------------------------------------
🚀 FEATURES
------------------------------------------------------------
- Authentication (JWT-based)
- Role-based dashboards (Business, Manager, Staff)
- Multi-shop management
- Team & permissions system
- Service library & assignment
- Booking calendar & scheduling
- Inventory management (central + per-shop)
- Responsive sidebar layout
- Protected & public routes
- Context-based authentication system

------------------------------------------------------------
🏗️ TECH STACK
------------------------------------------------------------
Framework: React 18
Language: TypeScript
Build Tool: Vite
Routing: React Router v6
State/Context: React Context API
Styling: Plain CSS
Auth: JWT (fetched from backend API)

------------------------------------------------------------
📂 PROJECT STRUCTURE
------------------------------------------------------------
src/
├── api/                 # API service functions
├── components/          # Reusable UI components
│   ├── Navbar/
│   └── Sidebar/
├── context/             # Global AuthContext
├── layouts/             # Protected & Public layout wrappers
├── pages/               # Route pages (Overview, Shops, Bookings, etc.)
├── styles/              # Global and page CSS
├── types/               # TypeScript interfaces
├── App.tsx              # Root component
├── Router.tsx           # Central route definitions
└── main.tsx             # Vite entry point

------------------------------------------------------------
⚙️ ENVIRONMENT VARIABLES
------------------------------------------------------------
Create a .env file in the project root:

VITE_API_URL=http://localhost:4000

The frontend will automatically use this URL for API requests to the backend server.

------------------------------------------------------------
🧩 INSTALLATION
------------------------------------------------------------
# Clone repository
git clone https://github.com/notTeo/BookingSystemFrontend.git
cd BookingSystemFrontend

# Install dependencies
npm install

# Start development server
npm run dev

Then visit:
http://localhost:5173

------------------------------------------------------------
🔗 BACKEND INTEGRATION
------------------------------------------------------------
The frontend connects to the Booking System Server via REST API.

Make sure your backend is running (by default on port 4000).

Example local setup:
Backend: http://localhost:4000
Frontend: http://localhost:5173

You can adjust this in .env:
VITE_API_URL=http://localhost:4000

For production:
VITE_API_URL=https://api.yourdomain.com

------------------------------------------------------------
🧠 DEVELOPMENT NOTES
------------------------------------------------------------
- The app expects a valid JWT stored in localStorage after login.
- The useAuth() hook provides access to the current user across the app.
- The ProtectedLayout ensures private pages are accessible only to logged-in users.
- The sidebar and dashboard visibility are dynamically role-based.

------------------------------------------------------------
🧱 BUILD FOR PRODUCTION
------------------------------------------------------------
npm run build

The optimized output will be available in /dist

To preview locally:
npm run preview

------------------------------------------------------------
📄 LICENSE
------------------------------------------------------------
This project is licensed under the MIT License — free for commercial and personal use.

------------------------------------------------------------
🧰 AUTHOR
------------------------------------------------------------
Developed by Nick Theodosis
GitHub: https://github.com/notTeo
