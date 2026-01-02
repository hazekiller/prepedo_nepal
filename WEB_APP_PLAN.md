# Web Application Development Plan for Prepedo Nepal

## 1. Project Overview
**Goal**: Create a modern, responsive static web application (SPA) using Vite + React that mirrors the functionality of the existing mobile app.
**Stack**:
- **Frontend**: React.js (Vite)
- **Styling**: CSS Modules / Vanilla CSS (Modern, Responsive, Dark-themed matching mobile)
- **State Management**: Redux Toolkit (to match mobile architecture)
- **Routing**: React Router DOM v6
- **Maps**: Leaflet (OpenStreetMap) - Free and reliable for web
- **Real-time**: Socket.io-client

## 2. Directory Structure
We will create a new directory `web/` at the root of the project.
```
web/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Buttons, Inputs, Cards
│   │   ├── layout/      # Navbar, Sidebar, Layout wrappers
│   │   └── map/         # Web Map implementation
│   ├── hooks/           # Custom hooks (useSocket, useAuth)
│   ├── pages/           # Page views
│   │   ├── auth/        # Login, Register
│   │   ├── driver/      # Driver specific pages (Requests, Dashboard)
│   │   └── user/        # User specific pages (Booking)
│   ├── services/        # API and Socket services
│   │   ├── api.js       # Axios setup
│   │   └── socket.js    # Socket.io connection
│   ├── store/           # Redux setup
│   ├── styles/          # Global styles & variables (CSS)
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── index.html
└── vite.config.js
```

## 3. Implementation Phases

### Phase 1: Setup & Configuration
- Initialize Vite project.
- Install dependencies: `axios`, `react-router-dom`, `react-redux`, `@reduxjs/toolkit`, `socket.io-client`, `leaflet`, `react-leaflet`, `lucide-react` (icons).
- Configure environment variables (`.env`) for API URL and Socket URL.
- Setup Global CSS variables (Colors from mobile `config/colors.js`).

### Phase 2: Core Infrastructure
- **API Layer**: Create `api.js` with Axios interceptors for Auth tokens.
- **Auth Store**: Setup Redux similar to mobile's `auth` slice.
- **Socket Service**: specific `socketService` for web (handling connection/disconnection and event listeners).

### Phase 3: Authentication Feature
- **Login Page**:
  - UI matching a modern dark theme (Glassmorphism).
  - Functionality: POST `/api/auth/login`.
  - Store token in LocalStorage & Redux.
- **Register Page** (if needed): Basic driver/user registration.

### Phase 4: Driver Features (Priority)
- **Dashboard / Requests**:
  - **Map View**: Implement Leaflet map showing driver location (HTML5 Geolocation) and pickup/dropoff points.
  - **Request List**: Sidebar or Overlay showing incoming ride requests.
  - **Socket Integration**:
    - Listen for `booking:new`.
    - Real-time updates for "Booking Taken".
    - "Accept Ride" functionality.
- **Active Ride**:
  - View current ride details.
  - "Complete Ride" flow.

### Phase 5: User/Passenger Features (Secondary)
- **Book a Ride**:
  - Map interface to select Pickup/Dropoff.
  - Form to request ride.
- **Ride Status**:
  - Real-time driver tracking.

## 4. Design System
- **Theme**: Dark mode primary (matching mobile `#000000`, `#1A1A1A` gradients).
- **Colors**:
  - Primary: `COLORS.primary` (Gold/Yellow from logs/code).
  - Background: Dark/Black.
  - Cards: Dark grey with glass effect.
- **Responsiveness**: Fully responsive for Mobile Web usage.

## 5. Deployment
- **Build**: `npm run build` -> `dist/` folder.
- **Hosting**: Netlify / Vercel (easy to setup) or serve via Nginx on the same server as backend.
