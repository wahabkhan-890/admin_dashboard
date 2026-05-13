# Admin Dashboard System

## Project Overview
Admin Dashboard System is a full-stack web application built to manage authenticated users through separate user and administrator experiences. It provides secure authentication, profile and settings management, and a role-based administrative control panel.

The project is designed for:
- End users who need a personal dashboard and account settings.
- Administrators who need visibility and control over user lifecycle operations.

This system solves common operational needs such as controlled access, account management, admin-level user moderation, and traceable admin activity via audit logs.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Pages Overview](#pages-overview)
- [Installation Guide](#installation-guide)
- [Folder Structure](#folder-structure)
- [Future Improvements](#future-improvements)
- [Author](#author)

## Features

### Authentication System (Login/Register)
- Email/password registration using Supabase Auth.
- Secure login with validation and user-friendly error handling.
- Email verification and password reset flow support.
- Session-aware redirects based on authentication state.

### Role-Based Access Control (Admin/User)
- Role values are resolved from the `users` table.
- Route guards enforce role-based navigation:
  - `UserRoute` for user dashboard access.
  - `AdminRoute` for admin-only pages.
  - `ProtectedRoute` for authenticated access.
  - `PublicRoute` for unauthenticated-only pages.
- Inactive accounts are blocked from protected areas.

### User Dashboard
- Displays account identity, status, role, and member timeline.
- Shows profile completeness indicators and recent sign-in context.
- Handles offline state and recovery/retry behavior.

### Admin Dashboard
- Lists users with pagination, search, and filters (role/status).
- Includes user management actions:
  - Promote user role to admin.
  - Activate/deactivate user account.
  - Delete users.
- Displays live operational stats (total, active, inactive, admins, new users).

### Profile Management
- Editable display name.
- Avatar upload and preview flow.
- Avatar storage through Supabase Storage (`avatars` bucket).

### Settings Management
- Unified settings page for profile and security updates.
- Readable account identity with actionable account controls.

### Password Update System
- Password update via Supabase Auth with client-side validation.
- Success/error toast feedback for user confidence.

### Account Deletion Feature
- Secure account deletion confirmation flow (`DELETE` keyword).
- Uses Supabase Edge Function invocation for deletion logic.
- Auto sign-out and redirect behavior after successful deletion.

### Protected Routes System
- Route-level access control using dedicated wrappers.
- Loading-state handling prevents premature redirects.
- Redirects are aligned with authenticated role state.

## Technology Stack
- React.js
- JavaScript (ES Modules)
- Supabase
  - Authentication
  - PostgreSQL Database
  - Storage
  - Edge Functions
- React Router DOM
- Tailwind CSS
- Vite

## Pages Overview

### Login Page
The Login page authenticates users using Supabase `signInWithPassword`. It validates input, handles unverified/inactive account states, and redirects users to role-appropriate dashboards after successful sign-in.

### Register Page
The Register page creates a new Supabase Auth user and inserts a profile record into the `users` table with default `user` role assignment. It supports optional avatar selection preview and redirects to the login page after successful registration.

### User Dashboard
The User Dashboard fetches user profile data from the database and renders account status, profile completeness, and membership timeline insights. It includes retry/offline handling to improve reliability.

### Settings Page
The Settings page provides three major account operations:
- Profile update: Change display name and avatar.
- Password change: Update credentials securely via Supabase Auth.
- Account deletion: Confirmed destructive action with trace-aware server invocation and sign-out.

### Admin Dashboard
The Admin Dashboard acts as a user management control panel. It supports user search/filtering, role updates, status toggling, account deletion, and admin activity logging into `audit_logs`.

## Installation Guide

1. Clone the repository
```bash
git clone <your-repository-url>
cd Admain_dashbord
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the project root and add:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_publishable_or_anon_key
```

4. Run the project locally
```bash
npm run dev
```

Optional commands:
```bash
npm run build
npm run preview
npm run lint
```

## Folder Structure
```text
Admain_dashbord/
  public/
  src/
    assets/
    components/
      Layout/
      UI/
    config/
    context/
    hooks/
    pages/
      admin/
      login/
      register/
      user/
    routes/
    services/
    App.jsx
    main.jsx
  supabase/
  index.html
  package.json
```

## Future Improvements
- Improve state management with a centralized data layer for complex admin workflows.
- Introduce an API abstraction/service layer per domain module.
- Add unit and integration tests for auth guards and critical settings actions.
- Enhance dashboard performance with memoized selectors and request caching.
- Refine UX consistency and accessibility across forms, tables, and feedback states.

## Author
Wahab Khan
