# Admin Routing Implementation

## Overview
This document outlines the implementation of proper admin routing and unified header components for the Martyrs Archive project.

## Changes Made

### 1. Unified Header Component (`client/src/components/Header.js`)
- **Purpose**: Single reusable header component that adapts based on context
- **Features**:
  - Automatically detects if user is on admin pages (`/admin/*`)
  - Shows different navigation links for client vs admin pages
  - Client pages: Home, Martyrs, Map, Add Martyr, Admin Login
  - Admin pages: Dashboard, Add Martyr, View Site, Logout
  - Active link highlighting
  - Logout functionality for admin users

### 2. Protected Route Component (`client/src/components/ProtectedRoute.js`)
- **Purpose**: Authentication guard for admin routes
- **Features**:
  - Checks for `adminToken` in localStorage
  - Redirects to `/admin/login` if not authenticated
  - Wraps admin components to ensure security

### 3. Separated Page Components
All page components have been extracted from the monolithic `App.js` into separate files:

#### Client Pages (`client/src/pages/`)
- `HomePage.js` - Landing page with welcome content
- `MartyrsPage.js` - List of all martyrs
- `MartyrDetailPage.js` - Individual martyr details
- `MapPage.js` - Interactive map with martyr locations
- `AddMartyrPage.js` - Public form to add new martyrs
- `NotFoundPage.js` - 404 error page

#### Admin Pages (`client/src/pages/admin/`)
- `AdminLoginPage.js` - Admin authentication
- `AdminDashboardPage.js` - Main admin dashboard with martyr management
- `AdminAddMartyrPage.js` - Admin form to add martyrs directly
- `AdminEditMartyrPage.js` - Edit existing martyr information

### 4. Updated App.js Routing
- **Clean routing structure** with proper separation of concerns
- **Protected admin routes** using `ProtectedRoute` component
- **Public routes** accessible to all users
- **Proper route organization** with clear comments

## Route Structure

### Public Routes
- `/` - Home page
- `/martyrs` - Martyrs listing
- `/martyr/:id` - Individual martyr details
- `/map` - Interactive map
- `/add-martyr` - Public martyr submission form

### Admin Routes (Protected)
- `/admin/login` - Admin authentication (public)
- `/admin/dashboard` - Admin dashboard (protected)
- `/admin/add-martyr` - Admin add martyr form (protected)
- `/admin/edit-martyr/:id` - Admin edit martyr form (protected)

## Authentication Flow

1. **Admin Login**: User visits `/admin/login` and enters credentials
2. **Token Storage**: Upon successful login, `adminToken` is stored in localStorage
3. **Protected Access**: All admin routes check for valid token
4. **Automatic Redirect**: Unauthenticated users are redirected to login
5. **Logout**: Clearing token and redirecting to login page

## Header Behavior

### Client Pages
- Shows "أرشيف الشهداء" (Martyrs Archive) title
- Navigation: الرئيسية, الشهداء, الخريطة, إضافة شهيد, المدير
- "المدير" button links to admin login

### Admin Pages
- Shows "لوحة تحكم المدير" (Admin Dashboard) title
- Navigation: لوحة التحكم, إضافة شهيد, عرض الموقع
- Logout button for authenticated admins
- "عرض الموقع" links back to public site

## Benefits

1. **Security**: Admin routes are properly protected
2. **User Experience**: Consistent navigation across all pages
3. **Maintainability**: Separated components are easier to maintain
4. **Scalability**: Easy to add new admin or client pages
5. **Code Organization**: Clear separation between client and admin functionality

## Usage

### For Developers
- Add new client pages in `client/src/pages/`
- Add new admin pages in `client/src/pages/admin/`
- Use `ProtectedRoute` for any new admin routes
- Import components from the new structure

### For Users
- **Public users**: Can access all client pages and submit martyr information
- **Admins**: Must login at `/admin/login` to access admin functionality
- **Navigation**: Header automatically adapts based on current page type

## File Structure
```
client/src/
├── components/
│   ├── Header.js
│   ├── ProtectedRoute.js
│   └── index.js
├── pages/
│   ├── HomePage.js
│   ├── MartyrsPage.js
│   ├── MartyrDetailPage.js
│   ├── MapPage.js
│   ├── AddMartyrPage.js
│   ├── NotFoundPage.js
│   ├── admin/
│   │   ├── AdminLoginPage.js
│   │   ├── AdminDashboardPage.js
│   │   ├── AdminAddMartyrPage.js
│   │   └── AdminEditMartyrPage.js
│   └── index.js
└── App.js (updated)
```

This implementation provides a robust, secure, and user-friendly admin system while maintaining a clean separation between public and administrative functionality.
