# Aaharly Delivery Partner System

> **A comprehensive meal delivery management ecosystem** comprising a React Native mobile application for delivery partners, a Node.js/Express backend API server, and a React-based admin dashboard — designed to streamline daily meal subscription deliveries with GPS-based verification.

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Active Development — Backend APIs and Admin Dashboard partially implemented

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Existing Project Structure](#3-existing-project-structure)
4. [Current Implemented Features](#4-current-implemented-features)
5. [Updated Delivery Verification Flow](#5-updated-delivery-verification-flow)
6. [Existing API Analysis (High-Level)](#6-existing-api-analysis-high-level)
7. [Admin Dashboard Role](#7-admin-dashboard-role)
8. [Data Flow Explanation](#8-data-flow-explanation)
9. [Backend Integration Plan (Future Scope)](#9-backend-integration-plan-future-scope)
10. [Security & Compliance Overview](#10-security--compliance-overview)
11. [Testing & Validation Strategy](#11-testing--validation-strategy)
12. [Deployment Overview](#12-deployment-overview)
13. [Limitations (Current System)](#13-limitations-current-system)
14. [Future Roadmap (Decision Pending)](#14-future-roadmap-decision-pending)
15. [Development Guidelines](#15-development-guidelines)
16. [Conclusion](#16-conclusion)

---

## 1. Introduction

### Purpose

The **Aaharly Delivery Partner System** is a technology platform built to manage the end-to-end lifecycle of daily meal subscription deliveries. Aaharly operates as a health-focused meal subscription service where customers receive curated, nutrition-aware meals on a recurring schedule. This system provides the digital infrastructure necessary to coordinate vendors (kitchens), delivery personnel, and administrative operations across the entire delivery pipeline.

### Role of the Delivery Mobile App

The React Native mobile application serves as the primary tool for delivery partners on the ground. It enables them to:

- Authenticate securely via vendor credentials
- View and accept assigned delivery orders
- Navigate to delivery locations using external maps integration
- Verify deliveries through GPS-based location confirmation
- Report delivery completion and status updates in real time

### Role of the Admin Dashboard

The web-based admin dashboard acts as the central command center for Aaharly operations. Built with React and Vite, it provides administrators and vendor managers with tools for:

- Monitoring live delivery statuses and order pipelines
- Managing vendors, users, subscriptions, and meal plans
- Overseeing production batches, inventory levels, and kitchen prep workflows
- Viewing financial reports, QA audits, and performance analytics
- Handling support tickets and vendor requests

### Role of the Backend APIs

The backend API server, built with Express.js, TypeScript, and TSOA, functions as the unified data layer connecting all client applications. It handles:

- Authentication and authorization for admins, vendors, and public users
- CRUD operations for meals, meal plans, subscriptions, and orders
- Delivery scheduling, dispatch management, and status tracking
- Production batch management and inventory control
- Reporting, settlement calculations, and QA auditing

### Current Development Stage

The system is in **active development** with the following status:

| Component | Status |
|-----------|--------|
| Backend API Server | Core APIs implemented — user, vendor, subscription, meal management, delivery, production, and reporting modules operational |
| Admin Dashboard | Functional — dashboard, user management, vendor management, meals, orders, subscriptions, offers, reports, and vendor-specific pages active |
| Mobile Delivery App | In development — login, dashboard, order details, GPS verification, delivery success, profile, and help/support screens built |

---

## 2. System Architecture Overview

### Components

The Aaharly ecosystem consists of five primary components that communicate through RESTful APIs:

- **Mobile App (React Native):** Cross-platform delivery partner application targeting Android. Built with React Native CLI (v0.83.x), React Navigation for routing, Axios for API calls, and Geolocation Service for GPS verification.

- **Backend API Server (Node.js/Express/TSOA):** TypeScript-based REST API server using the TSOA framework for auto-generated routes, Swagger documentation, and type-safe controllers. Handles all business logic, data validation, and inter-service communication.

- **Admin Dashboard (React/Vite):** Single-page application built with React 19, Vite, React Router DOM, Framer Motion for animations, Recharts for data visualization, and Axios for API communication. Supports role-based views for Super Admin, Vendor Admin, and Vendor Staff.

- **Database (PostgreSQL):** Relational database managed through Prisma ORM (v7) with a comprehensive schema covering 20+ models including users, vendors, subscriptions, meals, production batches, inventory, QA audits, and support tickets.

- **Notification System (Firebase):** Firebase Cloud Messaging (FCM) integration for push notifications to delivery partners and customers. FCM tokens are stored per user and vendor for targeted delivery updates.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AAHARLY DELIVERY ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐                        ┌──────────────────────┐   │
│  │  DELIVERY MOBILE  │                        │   ADMIN DASHBOARD    │   │
│  │    APP (React     │                        │   (React + Vite)     │   │
│  │     Native)       │                        │                      │   │
│  │                   │                        │  • Super Admin View  │   │
│  │  • Login          │                        │  • Vendor Admin View │   │
│  │  • Dashboard      │                        │  • Vendor Staff View │   │
│  │  • Order Details  │                        │                      │   │
│  │  • GPS Verify     │                        │  Pages:              │   │
│  │  • Profile        │                        │  • Dashboard Home    │   │
│  │  • Help/Support   │                        │  • Users / Vendors   │   │
│  │                   │                        │  • Meals / Orders    │   │
│  └────────┬─────────┘                        │  • Subscriptions     │   │
│           │                                   │  • Reports / Offers  │   │
│           │  Axios HTTP                       │  • Production        │   │
│           │  Requests                         │  • Kitchen / Dispatch│   │
│           │                                   │  • Inventory         │   │
│           │                                   └──────────┬───────────┘   │
│           │                                              │               │
│           │           Axios HTTP Requests                 │               │
│           ▼                                              ▼               │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                    BACKEND API SERVER                              │   │
│  │              (Express + TypeScript + TSOA)                        │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │   │
│  │  │   PUBLIC     │  │    ADMIN      │  │       VENDOR            │  │   │
│  │  │ CONTROLLERS  │  │ CONTROLLERS   │  │    CONTROLLERS          │  │   │
│  │  │             │  │              │  │                         │  │   │
│  │  │ • Account   │  │ • Auth       │  │ • Auth / Dashboard     │  │   │
│  │  │ • Address   │  │ • Users      │  │ • Delivery / Dispatch  │  │   │
│  │  │ • User      │  │ • Vendors    │  │ • Production / Kitchen │  │   │
│  │  │ • MealPlan  │  │ • MealPlan   │  │ • Inventory / Finance  │  │   │
│  │  │ • Category  │  │ • Categories │  │ • Subscription / QA    │  │   │
│  │  │ • Meal      │  │ • Subscript. │  │ • Support / Reports    │  │   │
│  │  │ • Status    │  │ • Orders     │  │ • Customers / Requests │  │   │
│  │  │             │  │ • Reports    │  │ • MealPlan             │  │   │
│  │  │             │  │ • Dashboard  │  │                         │  │   │
│  │  │             │  │ • QA/Support │  │                         │  │   │
│  │  │             │  │ • Dispatch   │  │                         │  │   │
│  │  │             │  │ • Production │  │                         │  │   │
│  │  │             │  │ • Pincodes   │  │                         │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────────────────┘  │   │
│  │                                                                   │   │
│  │  ┌──────────────────────┐  ┌───────────────────────────────────┐  │   │
│  │  │    MIDDLEWARE LAYER   │  │        SERVICE LAYER              │  │   │
│  │  │  • JWT Auth           │  │  • Business Logic                │  │   │
│  │  │  • TSOA Auth          │  │  • Data Transformation           │  │   │
│  │  │  • Error Handling     │  │  • Validation & Processing       │  │   │
│  │  └──────────────────────┘  └───────────────────────────────────┘  │   │
│  │                                                                   │   │
│  │  ┌───────────────────────────────────────────────────────────────┐│   │
│  │  │                    SWAGGER / API DOCS                         ││   │
│  │  │              Auto-generated via TSOA at /api-docs             ││   │
│  │  └───────────────────────────────────────────────────────────────┘│   │
│  └───────────────────────────┬───────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                    POSTGRESQL DATABASE                             │   │
│  │                  (Prisma ORM v7 + pg Adapter)                     │   │
│  │                                                                   │   │
│  │  Core Models:                                                     │   │
│  │  Admin • User • Profile • Address • Vendor • VendorUser           │   │
│  │  Subscription • MealPlan • Meal • MealCategory • MealCalendar     │   │
│  │  UserMealSchedule • ProductionBatch • InventoryItem               │   │
│  │  InventoryTransaction • VendorSettlement • VendorRequest          │   │
│  │  VendorPincode • QAAudit • SupportTicket • AuditLog • Offer       │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │              EXTERNAL SERVICES                                    │   │
│  │  • Firebase Admin SDK — Push Notifications (FCM)                  │   │
│  │  • AWS S3 — File/Image Storage                                    │   │
│  │  • Google Maps — External Navigation (via deep link)              │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Communication Pattern

All communication between the mobile app, admin dashboard, and backend follows a standard RESTful pattern:

- **Mobile App → Backend:** Axios-based HTTP client with JWT bearer token authentication. The mobile app maintains an API client layer with interceptors for token refresh and error handling.
- **Admin Dashboard → Backend:** Axios clients organized by domain (admin, vendor, dashboard, orders, reports, offers) with authentication context managing session state.
- **Backend → Database:** Prisma ORM with PostgreSQL adapter for type-safe database queries. Connection pooling configured via `pg.Pool` with SSL support for cloud deployments.
- **Backend → Firebase:** Firebase Admin SDK for server-side push notification dispatch to delivery partners and customers.

---

## 3. Existing Project Structure

### Backend API

**Location:** `C:\Aaharly-API\Aaharly-api\Aaharly-api`

The backend follows a layered architecture with clear separation of concerns:

#### Controllers

Organized into three namespaces reflecting access patterns:

- **Public Controllers** — Unauthenticated or customer-facing endpoints:
  - `AccountController` — User registration, login, OTP verification, and session management
  - `AddressController` — Customer address CRUD with geolocation (lat/lng) storage
  - `UserController` — Profile management and user data retrieval
  - `MealPlanController` — Public-facing meal plan browsing
  - `CategoryController` — Nutrition category listing and filtering
  - `MealController` — Meal details, components, and nutritional information
  - `ServerStatusController` — Health check endpoint

- **Admin Controllers** — Protected endpoints for administrative operations:
  - `AdminAuthController` — Admin login and session management
  - `AdminMealPlanController` — Full CRUD for meal plans with calendar assignment
  - `AdminUserController` / `AdminUserProfileController` / `AdminUserAccountController` — User management operations
  - `AdminCategoryController` — Nutrition category management
  - `AdminVendorController` — Vendor onboarding, updates, and status management
  - `AdminSubscriptionController` — Subscription oversight and modifications
  - `AdminOrderController` — Order monitoring and intervention
  - `AdminDispatchController` — Dispatch coordination
  - `AdminProductionController` / `SystemProductionController` — Production batch oversight
  - `AdminReportController` — Report generation and retrieval
  - `DashboardController` — Aggregated dashboard statistics
  - `PincodeController` — Service area (pincode) management
  - `QAController` — Quality assurance audit management
  - `SupportController` — Support ticket administration
  - `VendorRequestController` — Vendor request approval/rejection
  - `AdminOfferController` — Promotional offer and coupon management

- **Vendor Controllers** — Vendor-authenticated endpoints for kitchen and delivery operations:
  - `VendorAuthController` — Vendor user login and authentication
  - `VendorDashboardController` — Vendor-specific dashboard metrics
  - `VendorUserController` — Vendor staff management
  - `DeliveryController` — Delivery listing, status updates, and verification
  - `DispatchController` — Meal handover and dispatch tracking
  - `ProductionController` — Production batch management and status updates
  - `KitchenController` — Kitchen preparation workflows
  - `InventoryController` — Stock management and transaction logging
  - `FinanceController` — Settlement and financial overview
  - `SubscriptionController` — Vendor-side subscription visibility
  - `CustomerController` — Customer information for assigned deliveries
  - `MealPlanController` — Vendor-side meal plan viewing
  - `ReportController` — Vendor performance reports
  - `QAController` — QA audit compliance from vendor perspective
  - `SupportController` — Vendor support ticket creation and tracking
  - `VendorRequestController` — Vendor change/pause requests

#### Services

The service layer contains the core business logic, mirroring the controller structure:

- **Shared Services** — Cross-cutting concerns used by multiple controllers:
  - `account.service.ts` — User account business logic (registration, OTP, login flows)
  - `address.service.ts` — Address validation and geolocation processing
  - `category.service.ts` / `meal.service.ts` / `mealPlan.service.ts` — Content management logic
  - `mealCalendar.service.ts` — Day-wise meal scheduling and calendar operations
  - `productionBatch.service.ts` — Batch creation and completion tracking
  - `profile.service.ts` — User profile and health data calculations (BMI, diet)
  - `subscription-plan.service.ts` — Plan assignment and duration management
  - `upload.service.ts` — File upload handling (AWS S3 integration)
  - `vendorAssignment.service.ts` — Pincode-based vendor-to-user assignment
  - `user.service.ts` — Core user data operations

- **Admin Services** — Business logic for admin-specific operations:
  - `dashboard.service.ts` — Aggregated metrics and statistics
  - `vendor.service.ts` — Vendor lifecycle management
  - `subscription.service.ts` — Admin subscription modifications
  - `dispatch.service.ts` / `order.service.ts` — Order and dispatch handling
  - `report.service.ts` — Report data assembly
  - `qa.service.ts` — Audit scoring and document management
  - `support.service.ts` — Ticket management
  - `pincode.service.ts` — Service area operations
  - `request.service.ts` — Vendor request processing

- **Vendor Services** — Business logic for vendor operations:
  - `delivery.service.ts` — Core delivery management, status transitions, and GPS verification
  - `dashboard.service.ts` — Vendor dashboard aggregations
  - `production.service.ts` — Batch lifecycle management
  - `kitchen.service.ts` — Kitchen preparation order management
  - `inventory.service.ts` — Stock tracking and transaction logging
  - `dispatch.service.ts` — Handover coordination
  - `finance.service.ts` — Settlement calculation
  - `customer.service.ts` — Customer data retrieval for deliveries
  - `vendorAuth.service.ts` — Vendor login, password hashing, JWT issuance
  - `vendorUser.service.ts` — Vendor staff CRUD
  - `report.service.ts` — Vendor-specific report generation
  - `subscription.service.ts` — Vendor-side subscription queries
  - `mealPlan.service.ts` — Vendor meal plan access
  - `qa.service.ts` — Vendor QA compliance
  - `support.service.ts` — Vendor ticket submissions
  - `request.service.ts` — Vendor request creation

#### Database Layer

- **ORM:** Prisma v7 with PostgreSQL driver adapter (`@prisma/adapter-pg`)
- **Schema:** 20+ models with comprehensive enum definitions covering meal types, delivery statuses, subscription states, vendor roles, batch statuses, inventory transaction types, and more
- **Connection Management:** pg.Pool with configurable connection limits, SSL auto-detection for Supabase/Render deployments, and idle timeout management
- **Migrations:** Managed through Prisma migration system

#### Authentication

- **JWT-based authentication** with Bearer token scheme
- **Middleware:** `auth.ts` for standard JWT verification, `jwtAuth.ts` for additional JWT utilities, `tsoaAuth.ts` for TSOA-integrated security decorators
- **Role-based access:** Admin roles (superadmin, admin, merchant, ops, qa, support) and Vendor roles (admin, staff)
- **Password hashing:** bcrypt for secure password storage

#### API Documentation

- **TSOA-generated Swagger specification** served at `/api-docs`
- **Interactive Swagger UI** with persistent authorization, request duration display, and try-it-out enabled by default
- **Auto-generated routes** via TSOA for type-safe controller registration

---

### Admin Dashboard

**Location:** `C:\Aaharly Admin Dashboard\aaharly-admin dashboard\aaharly-admin-dashboard`

The admin dashboard is a Vite-powered React TypeScript application with role-based routing and modern UI patterns.

#### Admin UI

- **Framework:** React 19 with Vite build tooling
- **Routing:** React Router DOM v7 with protected routes and role-based redirectors
- **State Management:** React Context API for authentication state (`AuthContext`)
- **Styling:** Vanilla CSS with component-scoped stylesheets
- **Animations:** Framer Motion for smooth transitions and micro-interactions
- **Charts:** Recharts for data visualization in reports and dashboards
- **Notifications:** react-hot-toast for user feedback

#### Order Management

- **Orders Page:** Displays order pipelines with status tracking
- **Dispatch Center:** Coordinates meal handover from kitchen to delivery partners
- **Kitchen Prep Page:** Kitchen preparation queue management for vendor staff

#### User Management

- **Users Page:** Customer listing with detail drawers (`UserDetailsDrawer`), user rows, and profile viewing
- **Vendors Page:** Vendor listing with creation modals (`CreateVendorModal`), edit drawers (`EditVendorDrawer`), and status management
- **Customers Page:** Vendor-specific customer view for assigned deliveries

#### Monitoring & Analytics

- **Dashboard Home:** Aggregated statistics, charts, and system health metrics
- **Reports Page:** Performance reports with time-range filters and exportable data
- **Production Dashboard:** Production batch monitoring and completion tracking
- **Inventory Page:** Stock levels, low-stock alerts, and transaction history

#### Additional Modules

- **Meals Page:** Meal catalogue management with `MealEditor` and `MealRow` components
- **Nutrition Categories Page:** BMI-based meal categorization management with `CreateCategoryModal`
- **Subscriptions Page:** Subscription lifecycle overview
- **Offers Page:** Promotional offers and coupon code management
- **Login Page:** Authentication entry point with styling and session management

#### Layout & Navigation

- **Dashboard Layout:** Persistent sidebar navigation + header layout
- **Sidebar:** Multi-section navigation organized by admin role (Super Admin, Vendor Admin, Vendor Staff)
- **Header:** User context display, search, and session controls

---

### Mobile App

**Location:** `C:\aaharly-delivery-app\AaharlyDelivery`

The delivery partner mobile app is a React Native CLI project (non-Expo) targeting Android.

#### Screens

| Screen | Purpose |
|--------|---------|
| `LoginScreen` | Vendor credential authentication with branded design |
| `DashboardScreen` | Active delivery overview, order list, and quick actions |
| `OrderDetailsScreen` | Detailed order view with customer info, address, meal details, and navigation trigger |
| `VerifyScreen` | GPS-based delivery verification with location proximity check |
| `DeliverySuccessScreen` | Post-delivery confirmation display with delivery summary |
| `ProfileScreen` | Delivery partner profile information and settings |
| `HelpSupportScreen` | Help articles and support contact options |
| `PlaceholderScreen` | Temporary placeholder for History and Map tabs |

#### Navigation

- **Root Navigator:** Stack navigator handling the primary authentication and delivery flow:
  `Login → MainTabs → OrderDetails → Verify → DeliverySuccess → HelpSupport`
- **Tab Navigator:** Bottom tab navigation with four tabs — Dashboard, History (placeholder), Map (placeholder), and Settings (Profile)
- **Design:** Dark theme with custom fonts (Plus Jakarta Sans), Material Community Icons, and tab bar with active state indicators

#### API Integration

- **API Client:** Centralized Axios-based HTTP client (`apiClient.ts`) with JWT token management and request/response interceptors
- **Auth API:** Login, token refresh, and session management endpoints (`authApi.ts`)
- **Delivery API:** Delivery listing, status updates, GPS verification, and order actions (`deliveryApi.ts`)

#### Supporting Modules

- **Hooks:** Custom hooks including `useLocation` for GPS-based location tracking and distance calculations
- **Theme:** Centralized color palette (`colors.ts`) and font configuration (`fonts.ts`)
- **Components:** Reusable UI components — `GlassCard`, `GlowButton`, `Header`, `Logo`
- **Services:** API layer with organized client modules

---

## 4. Current Implemented Features

The following features have been confirmed as implemented based on codebase analysis:

### Backend API — Implemented

- **User Account Management** — Registration, login, OTP-based verification, profile creation and updates
- **Vendor Authentication** — Vendor user login, JWT issuance, password management via bcrypt
- **Admin Authentication** — Admin login with role-based access (superadmin, admin, merchant, ops, qa, support)
- **Meal Plan Management** — Full CRUD for meal plans with pricing, duration, nutrition metadata, and category linking
- **Meal Management** — Meal creation with components (roti, dal, sabzi, salad, rice), nutritional fields (calories, protein, carbs, fats), and swap options
- **Meal Calendar** — Day-wise meal scheduling within nutrition categories
- **Subscription Management** — Subscription creation with plan linking, vendor assignment, date ranges, and status tracking (active, paused, expired)
- **User Meal Scheduling** — Per-user meal delivery schedule with slot numbers, delivery status, and skip functionality
- **Vendor Management** — Vendor onboarding, profile management, status tracking, and pincode-based service area assignment
- **Vendor Staff Management** — Vendor user CRUD with role distinction (admin vs staff)
- **Production Batch Management** — Batch creation by vendor-meal-date, target/completed quantity tracking, and batch status lifecycle
- **Inventory Management** — Stock tracking with items, transaction logging (usage, wastage, restock), and low-stock thresholds
- **Delivery Management** — Delivery listing, status transitions (PENDING → PREPARING → READY_TO_DISPATCH → HANDED_OVER → DELIVERED → CANCELLED), and GPS verification
- **Dispatch Management** — Meal handover coordination between kitchen and delivery teams
- **Order Management** — Order viewing and status oversight
- **Financial Settlements** — Vendor settlement records with total orders, amount, deductions, and net payable
- **QA Auditing** — Vendor quality audits with scoring, checklists, document uploads, and status tracking
- **Support Tickets** — Ticket creation with type categorization, status workflow (OPEN → IN_PROGRESS → RESOLVED → CLOSED), and threaded comments
- **Vendor Requests** — Request system for subscription pauses, plan changes, delivery skips, and nutrition changes with approval workflow
- **Offer & Coupon System** — Promotional offers with discount types (flat/percentage), coupon codes with usage limits
- **Dashboard Statistics** — Aggregated metrics for both admin and vendor dashboards
- **Report Generation** — Vendor report snapshots and admin report retrieval
- **Audit Logging** — System-wide audit log capturing action, resource, actor, and details
- **Swagger API Documentation** — Auto-generated interactive API documentation at `/api-docs`

### Admin Dashboard — Implemented

- **Authentication** — Login page with session management and AuthContext
- **Role-Based Routing** — Separate views for Super Admin (Dashboard Home), Vendor Admin (Production Dashboard), and Vendor Staff (Kitchen Prep)
- **Dashboard Home** — Central monitoring page with aggregated statistics and charts
- **User Management** — User listing, detail drawers, and profile viewing
- **Vendor Management** — Vendor listing, creation modals, edit drawers, and status management
- **Meal Management** — Meal catalogue with editor and row-based listing
- **Nutrition Categories** — BMI-based category management with creation modals
- **Subscription Management** — Subscription overview page
- **Order Management** — Order listing with status tracking
- **Offer Management** — Offer and coupon management interface
- **Production Dashboard** — Batch monitoring for vendor admins
- **Kitchen Prep** — Kitchen queue management for vendor staff
- **Dispatch Center** — Dispatch coordination interface
- **Inventory Management** — Stock and transaction viewing
- **Customer Management** — Vendor-specific customer listing
- **Reports** — Performance reports with data visualization
- **Error Boundary** — Global error handling wrapper

### Mobile App — Implemented

- **Vendor Login** — Credential-based authentication with branded UI, glassmorphism card, and gradient button
- **Delivery Dashboard** — Active delivery listing with order cards and status indicators
- **Order Details** — Comprehensive order view with customer address, meal details, and external Maps navigation button
- **GPS-Based Verification** — Location tracking via `react-native-geolocation-service`, proximity calculation, and automatic verification on location match
- **Delivery Success** — Post-completion confirmation screen with delivery summary
- **Profile Screen** — Delivery partner profile information
- **Help & Support** — Support resources and contact options
- **Tab Navigation** — Bottom tab bar with Dashboard, History (placeholder), Map (placeholder), and Settings tabs
- **Dark Theme UI** — Consistent dark theme with custom color palette, Plus Jakarta Sans typography, and Material Community Icons
- **Reusable Components** — GlassCard for card layouts, GlowButton for action buttons, branded Header and Logo components

---

## 5. Updated Delivery Verification Flow

### Overview

The delivery verification workflow has been streamlined to use a **GPS-only verification model**, removing the previously considered OTP-based and photo proof verification steps. This decision simplifies the delivery partner experience while maintaining sufficient delivery confirmation accuracy.

### Workflow Steps

```
Step 1: VENDOR LOGIN
  │  Delivery partner authenticates with vendor credentials
  │  JWT token issued and stored locally
  │
  ▼
Step 2: FETCH NEARBY DELIVERIES
  │  Dashboard loads assigned deliveries from backend
  │  Orders filtered by vendor assignment and date
  │
  ▼
Step 3: DISTANCE-BASED SORTING
  │  Deliveries sorted by proximity to partner's current location
  │  Partner selects the nearest or most convenient delivery
  │
  ▼
Step 4: ORDER DETAILS REVIEW
  │  Partner reviews customer address, meal details, and special instructions
  │  Partner initiates external Google Maps navigation for route guidance
  │
  ▼
Step 5: LOCATION VERIFICATION
  │  Partner arrives at delivery location
  │  App continuously tracks GPS coordinates via Geolocation Service
  │  System calculates distance between partner location and customer address
  │  Verification triggers when partner is within acceptable proximity threshold
  │
  ▼
Step 6: SUBMIT CONFIRMATION
  │  Partner confirms delivery completion
  │  Backend receives verification with GPS coordinates and timestamp
  │  Delivery status updated to DELIVERED
  │
  ▼
Step 7: CUSTOMER NOTIFICATION
  │  System triggers push notification to customer via Firebase (FCM)
  │  Customer informed of successful delivery
  │
  ▼
Step 8: DASHBOARD UPDATE
  │  Admin dashboard reflects completed delivery in real time
  │  Vendor dashboard statistics updated
  │  Order status pipeline advanced
  │
  ▼
  DELIVERY COMPLETE
```

### Why OTP and Photo Proof Were Removed

| Removed Feature | Reason |
|----------------|--------|
| **OTP Verification** | Added friction to the delivery process. Customers would need to share a code, creating delays and poor user experience for daily meal deliveries. GPS proximity is sufficient for routine subscription deliveries. |
| **Photo Proof** | Increased delivery time per order. Storage and review overhead for daily meal deliveries was disproportionate to the verification value. Location-based confirmation provides adequate proof for the subscription model. |

### Business Logic Benefits

- **Faster Deliveries:** Removing verification steps reduces per-delivery time, enabling partners to complete more deliveries per shift
- **Lower Customer Friction:** No need for customers to be present at the door or share OTP codes
- **Reduced Infrastructure Cost:** No image storage or OTP SMS costs
- **Simpler Partner Training:** Straightforward deliver-and-confirm workflow
- **Scalable Model:** GPS verification scales without incremental cost per delivery

---

## 6. Existing API Analysis (High-Level)

### Public APIs

The public API surface handles customer-facing operations without requiring admin or vendor authentication:

- **Account APIs** — Handle the full user lifecycle including registration, mobile/email/Google login, OTP generation and verification, token refresh, and profile updates. These APIs form the entry point for the customer mobile application.
- **Address APIs** — Manage customer delivery addresses with support for multiple types (home, office, college, other), geolocation coordinates (latitude/longitude), pincode tracking, and default address designation.
- **User APIs** — Expose user profile data including health metrics (BMI, weight goals, activity levels, diet type), which drive the personalized meal plan recommendations.
- **Meal Plan APIs** — Allow customers to browse available meal plans with pricing, duration options (6 days, 15 days, 1 month), and associated meal catalogues.
- **Category APIs** — Expose nutrition categories based on BMI ranges, enabling the frontend to display appropriately targeted meal plan groups.
- **Meal APIs** — Provide detailed meal information including components (roti, dal, sabzi, salad, rice), nutritional breakdown (calories, protein, carbs, fats), images, and swap options.
- **Server Status API** — Health check endpoint for uptime monitoring and deployment verification.

### Admin APIs

The admin API surface enables comprehensive backend management:

- **Authentication APIs** — Admin login with role assignment and session management.
- **User Management APIs** — Admin oversight of customer accounts, profiles, and account states.
- **Vendor Management APIs** — Full vendor lifecycle management including onboarding, credential setup, pincode assignment, and vendor status transitions.
- **Subscription APIs** — Administrative control over customer subscriptions including status changes, vendor reassignment, and plan modifications.
- **Meal & Category Management APIs** — CRUD operations for the meal catalogue, meal plan creation with pricing and calendar scheduling, and nutrition category management.
- **Order & Dispatch APIs** — Order pipeline visibility and dispatch coordination between kitchen and delivery teams.
- **Production APIs** — System-level production batch management and oversight.
- **Dashboard APIs** — Aggregated statistics endpoints providing order counts, delivery metrics, active subscription numbers, and vendor performance summaries.
- **Report APIs** — Report data retrieval for performance analysis and operational review.
- **QA & Support APIs** — Quality audit management (scoring, checklists, documents) and support ticket administration.
- **Vendor Request APIs** — Approval/rejection workflows for vendor-initiated change requests.
- **Pincode APIs** — Service area management associating vendors with delivery zones.
- **Offer APIs** — Promotional offer and coupon code management with discount types and usage tracking.

### Vendor APIs

The vendor API surface serves kitchen operations and delivery management:

- **Authentication APIs** — Vendor user login with JWT issuance and bcrypt password verification.
- **Delivery APIs** — Core delivery operations including listing assigned deliveries, updating delivery statuses through the lifecycle (PENDING through DELIVERED), and GPS-based delivery verification.
- **Dashboard APIs** — Vendor-specific metrics including daily delivery counts, production completion rates, and active subscription summaries.
- **Production APIs** — Batch management with target quantity setting, completion tracking, and status transitions (PENDING → IN_PROGRESS → COMPLETED).
- **Kitchen APIs** — Kitchen preparation queue management for daily cooking operations.
- **Dispatch APIs** — Meal handover coordination and dispatch status tracking.
- **Inventory APIs** — Stock item CRUD, transaction logging (usage, wastage, restock), and low-stock threshold monitoring.
- **Finance APIs** — Vendor settlement overview with order counts, gross amounts, deductions, and net payable calculations.
- **Customer APIs** — Customer information retrieval for delivery operations.
- **Support APIs** — Vendor-side ticket creation and tracking.
- **Report APIs** — Vendor performance report generation and retrieval.

### Frontend-Backend Interaction

- **Mobile App:** The delivery app communicates exclusively through the Vendor Authentication and Delivery API endpoints. The `authApi.ts` module handles login and token management, while `deliveryApi.ts` manages all delivery-related operations including fetching orders, updating statuses, and submitting GPS verification data.
- **Admin Dashboard:** Six dedicated API client modules (`adminClient.ts`, `adminOrderClient.ts`, `dashboardClient.ts`, `offerClient.ts`, `reportClient.ts`, `vendorClient.ts`) encapsulate all admin-facing API calls. The dashboard additionally uses a services-layer `vendorClient.ts` for vendor-specific operations.

### Visible Limitations

- Some API controllers appear to have minimal implementation, suggesting they may be scaffolded but not fully feature-complete
- The cron service exists but its scheduled tasks and their current activation status are unclear from the controller surface alone
- Rate limiting and request throttling are not visibly implemented at the middleware layer
- API versioning is not currently enforced in the route structure

---

## 7. Admin Dashboard Role

### Monitoring Deliveries

The admin dashboard provides centralized visibility into the delivery pipeline:

- **Real-Time Order Status** — The Orders Page displays active orders with status progression from PENDING through DELIVERED or CANCELLED
- **Dispatch Coordination** — The Dispatch Center enables admins and vendor managers to coordinate meal handover from kitchen to delivery, tracking the READY_TO_DISPATCH and HANDED_OVER stages
- **Dashboard Metrics** — The Dashboard Home aggregates delivery counts, completion rates, and daily performance indicators using Recharts visualizations

### Managing Vendors

Vendor management is a core function of the admin dashboard:

- **Vendor Onboarding** — The `CreateVendorModal` allows admins to register new vendors with name, contact, address, and service area details
- **Vendor Profile Editing** — The `EditVendorDrawer` enables admins to update vendor information and status
- **Service Area Control** — Pincode management associates vendors with delivery zones, determining which customers are served by which kitchen
- **Vendor Staff** — Admins can view and manage vendor users (admin and staff roles) associated with each vendor
- **Vendor Request Processing** — Admins review and approve/reject vendor-initiated requests for subscription pauses, plan changes, delivery skips, and nutrition modifications

### Viewing Performance

- **Reports Page** — Time-range filtered performance reports with exportable data
- **Production Dashboard** — Batch completion tracking, target vs. actual quantities, and daily production status
- **Vendor Report Snapshots** — Historical performance data stored per vendor per date
- **Dashboard Charts** — Visual analytics powered by Recharts for trend monitoring

### Handling Complaints

- **Support Ticket System** — Tickets categorized by type (ingredient shortage, equipment issue, delivery delay, quality clarification) with status workflows and threaded comments
- **QA Audit Management** — Quality audits with scoring, checklists, document uploads, and status tracking (PENDING, PASSED, FAILED, NEEDS_IMPROVEMENT)
- **Vendor Requests** — Structured request pipeline for vendor-initiated changes with admin approval gates

### Controlling System

- **Role-Based Access** — The dashboard implements three role tiers:
  - **Super Admin** — Full access to all management pages, dashboard home, users, vendors, meals, subscriptions, orders, categories, offers, and reports
  - **Vendor Admin** — Scoped to Production Dashboard, kitchen, dispatch, inventory, customers, and vendor-specific reports
  - **Vendor Staff** — Limited to Kitchen Prep view for daily cooking operations
- **Protected Routes** — Authentication context enforces login requirements across all dashboard pages, redirecting unauthenticated users to the login page

### Connection to Backend

The admin dashboard connects to the backend through six dedicated API client modules:

- `adminClient.ts` — Primary admin operations (users, vendors, categories, meals, meal plans, subscriptions)
- `adminOrderClient.ts` — Order-specific operations
- `dashboardClient.ts` — Dashboard metrics and statistics
- `offerClient.ts` — Offer and coupon management
- `reportClient.ts` — Report data retrieval
- `vendorClient.ts` — Vendor authentication and vendor-scoped operations

All clients use Axios with base URL configuration from environment variables and include authentication headers for protected endpoints.

---

## 8. Data Flow Explanation

### End-to-End Delivery Lifecycle

The following describes the complete data flow from user login through delivery completion and reporting:

```
┌──────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW: DELIVERY LIFECYCLE                 │
└──────────────────────────────────────────────────────────────────────┘

PHASE 1: AUTHENTICATION
────────────────────────
  Delivery Partner opens Mobile App
       │
       ▼
  LoginScreen → POST /vendor/auth/login
       │          (email + password)
       │
       ▼
  Backend validates credentials via vendorAuth.service.ts
       │  • Finds VendorUser by email
       │  • Compares bcrypt hash
       │  • Issues JWT token with vendor_id and role
       │
       ▼
  Token stored in AsyncStorage on device
  App navigates to MainTabs (DashboardScreen)


PHASE 2: DELIVERY ASSIGNMENT & LISTING
───────────────────────────────────────
  DashboardScreen → GET /vendor/deliveries
       │              (with JWT Bearer token)
       │
       ▼
  delivery.service.ts queries UserMealSchedule
       │  • Filters by vendor_id, delivery date, and status
       │  • Joins with User, Address, Meal, and Subscription data
       │  • Returns enriched delivery list
       │
       ▼
  Mobile app receives delivery list
       │  • Renders order cards with customer info
       │  • Sorts by proximity using useLocation hook
       │  • Displays delivery status indicators


PHASE 3: ORDER DETAILS & NAVIGATION
────────────────────────────────────
  Partner taps order card → OrderDetailsScreen
       │
       ▼
  Screen displays:
       │  • Customer name, address, and delivery instructions
       │  • Meal details (title, components, nutritional info)
       │  • Delivery slot and scheduled time
       │
       ▼
  Partner taps "Navigate" button
       │  • Opens external Google Maps with customer coordinates
       │  • Deep link: google.navigation:q={lat},{lng}


PHASE 4: GPS VERIFICATION
──────────────────────────
  Partner arrives at location → VerifyScreen
       │
       ▼
  useLocation hook activates GPS tracking
       │  • Continuous position monitoring via react-native-geolocation-service
       │  • Calculates distance to customer address coordinates
       │  • Compares against proximity threshold
       │
       ▼
  Distance within threshold → Verification enabled
       │
       ▼
  Partner confirms delivery
       │  → POST /vendor/deliveries/{id}/verify
       │     (GPS coordinates + timestamp)


PHASE 5: STATUS UPDATE & NOTIFICATION
──────────────────────────────────────
  delivery.service.ts processes verification
       │  • Updates UserMealSchedule.delivery_status → DELIVERED
       │  • Records delivery timestamp
       │  • Stores GPS verification coordinates
       │
       ▼
  Firebase notification triggered
       │  • Customer FCM token retrieved from User record
       │  • Push notification sent: "Your meal has been delivered"
       │
       ▼
  Mobile app navigates to DeliverySuccessScreen
       │  • Displays delivery confirmation
       │  • Shows delivery summary


PHASE 6: DASHBOARD UPDATE & REPORTING
──────────────────────────────────────
  Admin Dashboard reflects changes in real time
       │
       ├─→ Dashboard Home: Updated delivery counts and completion rates
       ├─→ Orders Page: Order status pipeline updated
       ├─→ Vendor Dashboard: Vendor-specific metrics refreshed
       │
       ▼
  Report data accumulated
       │  • VendorReportSnapshot records capture daily metrics
       │  • VendorSettlement records aggregate for financial reconciliation
       │  • AuditLog captures delivery event for compliance
```

---

## 9. Backend Integration Plan (Future Scope)

### How Current APIs Support the New Flow

The existing backend architecture is well-positioned to support the streamlined GPS-only delivery verification flow:

- **Delivery Controller and Service** — The `DeliveryController.ts` and `delivery.service.ts` already contain the foundational endpoints for delivery listing, status updates, and verification. The existing delivery status enum (PENDING → PREPARING → READY_TO_DISPATCH → HANDED_OVER → DELIVERED → CANCELLED) fully covers the required lifecycle.

- **User Meal Schedule Model** — The `UserMealSchedule` model already stores `delivery_status`, `dispatched_at`, vendor association, and user-address linkage. The model can accommodate GPS verification data through minor extensions.

- **Authentication System** — The JWT-based authentication with vendor-scoped tokens already supports the mobile app's login and API access requirements.

- **Firebase Integration** — Firebase Admin SDK and client SDK are already included in the backend dependencies, supporting push notification dispatch upon delivery completion.

### Areas That May Require Extension

The following areas should be reviewed for potential future extension, though no implementation changes are recommended at this time:

- **GPS Coordinate Storage** — The current `UserMealSchedule` model may benefit from dedicated fields for storing delivery verification coordinates (partner latitude, partner longitude, verification timestamp, distance at verification)
- **Delivery Assignment Logic** — The system currently assigns deliveries through vendor-subscription relationships. Future optimization may require a dedicated delivery assignment module that considers partner location, route efficiency, and workload balancing
- **Real-Time Status Sync** — The current polling-based approach for delivery status updates could be enhanced with WebSocket or Server-Sent Events for live dashboard updates
- **Notification Templates** — Firebase notification content is currently handled inline. A templating system may be beneficial as notification types grow
- **Offline Delivery Queue** — The mobile app currently requires network connectivity for delivery verification. A local queue with sync mechanism could support areas with intermittent connectivity

### What Should Be Reviewed Before Changes

- **Database Schema Impact** — Any model changes should be evaluated against existing Prisma migrations and the current production data
- **API Backward Compatibility** — New endpoint versions should maintain compatibility with existing admin dashboard and mobile app clients
- **Service Layer Boundaries** — New business logic should respect the existing service-controller separation pattern
- **Authentication Scope** — Any new endpoints should properly implement TSOA security decorators consistent with existing controllers
- **Testing Coverage** — Jest testing infrastructure exists but test coverage should be assessed before major changes

---

## 10. Security & Compliance Overview

### Authentication System

- **JWT Token-Based Authentication** — All protected endpoints require a valid JWT Bearer token. Tokens are issued upon successful login and verified on every subsequent request through the middleware layer.
- **Password Security** — User and vendor passwords are hashed using bcrypt before storage, preventing plaintext password exposure in the database.
- **OTP-Based Verification** — Customer accounts support OTP-based verification for mobile number validation, with expiry timestamps to prevent stale OTP usage.
- **Token Lifecycle** — The mobile app implements token storage via AsyncStorage, with the API client handling token attachment on outgoing requests.

### Authorization

- **Role-Based Access Control (RBAC)** — The system implements multi-tiered authorization:
  - **Admin Roles:** superadmin, admin, merchant, ops, qa, support — each with scoped access within the admin dashboard
  - **Vendor Roles:** admin and staff — determining access level within vendor operations
  - **Public Access:** Unauthenticated endpoints limited to browsing meal plans, categories, and server status
- **TSOA Security Decorators** — The TSOA framework enforces authentication requirements at the controller level through `tsoaAuth.ts`, ensuring consistent security application across all protected routes.
- **Route Protection** — The admin dashboard implements client-side route guards via `ProtectedRoute` component, redirecting unauthenticated users to the login page.

### Data Privacy

- **User Health Data** — Profile data including BMI, weight, dietary preferences, and allergies is stored in the database. Access is scoped to the user and authorized admin/vendor personnel.
- **Address Data** — Customer delivery addresses with geolocation coordinates are stored with user-scoped access controls.
- **Minimal Data Exposure** — API responses should be reviewed to ensure sensitive fields are not included unnecessarily in public-facing responses.

### Location Security

- **GPS Data Handling** — Delivery partner GPS coordinates used for verification should be treated as transient data, stored only for the verification event and audit purposes.
- **Customer Location Protection** — Customer address coordinates are exposed only to assigned delivery partners and authorized vendor/admin users.
- **Geofencing Logic** — Proximity verification occurs on the client side with server-side validation, ensuring the verification threshold cannot be trivially bypassed.

### Admin Access Control

- **Role-Scoped Dashboard Views** — The admin dashboard renders different navigation options and default landing pages based on authenticated role.
- **Audit Logging** — The `AuditLog` model captures administrative actions with actor identification, action type, target resource, and detailed metadata for compliance tracking.
- **Session Management** — Authentication context manages session state with login/logout flows and token-based session persistence.

---

## 11. Testing & Validation Strategy

### Manual Testing

- **Screen-Level Testing** — Each mobile app screen should be manually tested through the complete user flow: Login → Dashboard → Order Details → Navigation → Verify → Delivery Success
- **Admin Dashboard Flow Testing** — Dashboard features should be validated by role: Super Admin full-access flow, Vendor Admin production-focused flow, and Vendor Staff kitchen-limited flow
- **Edge Case Validation** — Testing should cover network interruption scenarios, invalid credentials, expired tokens, and empty delivery lists

### GPS Testing

- **Location Accuracy Testing** — GPS verification should be tested at actual delivery locations to validate proximity threshold accuracy
- **Mock Location Detection** — The system should be evaluated for resistance to GPS spoofing applications that could falsify delivery location
- **Distance Calculation Validation** — The `useLocation` hook's distance calculation algorithm should be verified against known reference distances
- **Geolocation Permission Handling** — Testing should cover scenarios where the delivery partner denies location permissions or has location services disabled

### Admin Validation

- **Role-Based Rendering** — Verify that Super Admin, Vendor Admin, and Vendor Staff roles see appropriate navigation items and page access
- **Data Integrity Checks** — Confirm that admin operations (vendor creation, subscription modifications, batch management) correctly persist to the database and reflect in subsequent queries
- **Dashboard Metrics Accuracy** — Cross-validate dashboard statistics against raw database queries to ensure aggregation correctness

### API Validation

- **Swagger UI Testing** — The interactive Swagger documentation at `/api-docs` provides built-in API testing capability with "Try it out" functionality
- **Authentication Flow Testing** — Validate complete login → token issuance → protected API access → token expiry → unauthorized response cycle
- **Status Transition Validation** — Verify that delivery status transitions follow the defined lifecycle and reject invalid state changes
- **Input Validation** — TSOA's built-in validation (via `ValidateError`) should be tested with malformed inputs to confirm proper 422 responses

---

## 12. Deployment Overview

### Backend Hosting

The backend API server is configured for multiple deployment targets:

- **Cloud Hosting (Primary)** — The project includes configuration for Render (`render.yaml`) and Fly.io (`fly.toml`) deployments, with PostgreSQL database hosting on cloud providers such as Supabase (detected via connection string analysis)
- **Docker Support** — A `Dockerfile` and `docker-compose.yml` are present for containerized deployment, enabling consistent environments across development and production
- **Serverless Option** — AWS Lambda deployment configuration exists via `serverless.yml` with `serverless-http` adapter, providing a serverless hosting alternative
- **Process Management** — PM2 configuration (`ecosystem.config.js`) supports process management for traditional server deployments

### Admin Dashboard Hosting

- **Static Build** — The Vite-based admin dashboard produces a static build (`dist/` directory) suitable for hosting on any static file server or CDN
- **Build Process** — TypeScript compilation followed by Vite bundling produces optimized production assets
- **Environment Configuration** — API endpoint configuration via `.env` file allows the dashboard to target different backend environments (development, staging, production)

### Mobile App Release Process

- **Android Build** — The React Native CLI project targets Android via Gradle build system. The `android/` directory contains the native Android project structure
- **iOS Build** — The `ios/` directory contains the native iOS project structure with CocoaPods dependency management, though primary development has focused on Android
- **Distribution** — Android builds can be distributed through Google Play Store internal testing tracks or direct APK distribution for testing phases

---

## 13. Limitations (Current System)

### Known Technical Limitations

- **No Real-Time Communication** — The system currently relies on HTTP polling for status updates. WebSocket or Server-Sent Events (SSE) are not implemented, meaning the admin dashboard and mobile app may not reflect delivery status changes instantaneously.
- **No Offline Support** — The mobile app requires active network connectivity for all operations including delivery listing, verification, and status updates. There is no local queue or sync mechanism for areas with poor connectivity.
- **History and Map Tabs** — The mobile app's tab navigator includes History and Map tabs that currently render placeholder screens, indicating these features are planned but not yet implemented.
- **Single Database Connection Point** — The backend uses a single PostgreSQL connection pool. Under high traffic, connection limits may become a bottleneck without horizontal scaling or read replicas.

### Scalability Constraints

- **Monolithic Backend** — The API server runs as a single Express application. As the system grows, microservice decomposition may be necessary for independent scaling of delivery, production, and reporting modules.
- **Synchronous Notification Delivery** — Push notifications are sent synchronously during delivery verification requests. High delivery volumes could introduce latency without an asynchronous notification queue.
- **Single-Region Database** — The PostgreSQL database is hosted in a single region. Multi-region deployment or read replicas would be needed for geographic scaling.

### Integration Gaps

- **Payment Integration** — No payment gateway integration is visible in the current codebase. Subscription payments, vendor settlements, and financial transactions appear to be tracked but not processed electronically.
- **SMS/Communication Gateway** — OTP delivery mechanism is defined in the schema but the actual SMS delivery integration is not apparent in the service layer.
- **Route Optimization** — Delivery route planning relies on the partner's judgement and Google Maps navigation. There is no system-level route optimization or delivery sequence recommendation.
- **Analytics Engine** — While reports and dashboard metrics exist, a dedicated analytics engine for trend analysis, demand forecasting, or operational insights is not implemented.

### Monitoring Gaps

- **Application Monitoring** — No APM (Application Performance Monitoring) integration is visible. Error tracking, performance metrics, and alerting rely on console logging.
- **Infrastructure Monitoring** — Database connection pool health, API response times, and server resource utilization are not tracked through a dedicated monitoring stack.
- **Delivery Partner Tracking** — Real-time delivery partner location tracking for the admin dashboard is not implemented. Location data is only captured at the point of delivery verification.

---

## 14. Future Roadmap (Decision Pending)

The following features are under consideration for future development. Final decisions on scope, priority, and timeline will be made based on business requirements, user feedback, and technical feasibility assessment.

### Route Optimization

- Intelligent delivery sequence recommendation based on customer locations, traffic patterns, and delivery time windows
- Multi-stop route planning to maximize deliveries per trip
- Integration with mapping APIs for real-time traffic-aware routing

### Advanced Analytics

- Demand forecasting based on historical subscription patterns and seasonal trends
- Delivery partner performance scoring and efficiency metrics
- Customer churn prediction and retention analysis
- Vendor performance benchmarking and quality trend analysis
- Production demand prediction to minimize food waste

### Safety & Emergency Features (SOS)

- Panic button for delivery partners in emergency situations
- Automated alerts to operations team with partner location
- Incident reporting and follow-up tracking

### Offline Support

- Local delivery queue with automatic sync when connectivity is restored
- Cached delivery data for partner access in low-connectivity areas
- Optimistic UI updates with conflict resolution on reconnection

### AI-Powered Predictions

- Predictive delivery time estimation based on historical data, distance, and traffic patterns
- Automated vendor-partner assignment optimization
- Anomaly detection for delivery delays, GPS spoofing, and unusual patterns
- Smart production batch quantity recommendations based on subscription data

### Additional Considerations

- **Multi-Language Support** — Localization for regional languages
- **Customer Feedback Loop** — Post-delivery rating system for quality and service
- **Live Tracking** — Real-time delivery partner location sharing with customers
- **In-App Communication** — Chat or calling between delivery partners and customers without exposing personal phone numbers
- **Automated Financial Settlements** — Payment gateway integration for automated vendor payouts

All roadmap items are subject to stakeholder review and approval before entering the development pipeline.

---

## 15. Development Guidelines

### Core Principles

The Aaharly Delivery Partner System follows a disciplined development methodology to ensure system stability, code quality, and operational reliability:

#### No Direct Code Edits Without Approval

- All code changes must be reviewed and approved before merging into the main codebase
- No direct modifications to production-deployed controllers, services, or database schemas without prior review
- Emergency hotfixes must be documented and retroactively reviewed

#### Documentation-First Approach

- System architecture, feature specifications, and integration plans must be documented before implementation begins
- API changes should be reflected in TSOA controller annotations to ensure Swagger documentation stays current
- Database schema changes must be accompanied by migration documentation

#### Testing Before Implementation

- New features should have test criteria defined before development starts
- API endpoints should be validated through Swagger UI testing during development
- GPS-dependent features must undergo real-world location testing, not just simulated environments

#### Review-Based Development

- All code follows a pull request workflow with mandatory peer review
- Database schema changes require additional review for migration safety and backward compatibility
- Service layer changes that affect multiple controllers must be reviewed for cross-cutting impact

### Technical Standards

- **TypeScript Strict Mode** — All backend and mobile app code is written in TypeScript for type safety
- **TSOA Framework Conventions** — Backend controllers must follow TSOA decorator patterns for consistent route generation and documentation
- **Prisma Schema Management** — All database changes must be expressed through Prisma schema modifications and proper migration files
- **Component Reusability** — Frontend components should be built for reuse across screens and pages
- **Separation of Concerns** — Controllers handle HTTP request/response, services contain business logic, and database access is centralized through Prisma

---

## 16. Conclusion

### Current System Strength

The Aaharly Delivery Partner System represents a well-architected, multi-component delivery management platform:

- **Comprehensive Backend** — Over 40 controllers and 40+ services covering the full spectrum of meal subscription operations, from user registration and meal planning through production, delivery, QA, and financial settlement
- **Feature-Rich Admin Dashboard** — A role-aware administrative interface providing visibility and control across all operational domains, with modern UI patterns and data visualization
- **Purpose-Built Mobile App** — A focused delivery partner application with streamlined GPS verification, clean dark-themed UI, and efficient navigation architecture
- **Solid Data Foundation** — A normalized PostgreSQL database with 20+ models, comprehensive enum types, and Prisma ORM for type-safe data access
- **API Documentation** — Auto-generated Swagger documentation ensuring API discoverability and testability for all stakeholders

### Expansion Potential

The existing architecture provides a strong foundation for growth:

- The modular controller-service-database layer pattern supports feature addition without structural refactoring
- The role-based access control system accommodates new user types and permission levels
- The database schema's relational design allows for new entity relationships without breaking existing data flows
- Cloud-ready deployment configurations (Docker, Render, Fly.io, AWS Lambda) provide horizontal scaling pathways

### Professional Development Approach

The Aaharly team maintains a disciplined development process:

- Documentation-first methodology ensures clarity and alignment before code changes
- Review-based workflows prevent regressions and maintain code quality standards
- Incremental feature development prioritizes stability over speed
- Security-first design with JWT authentication, bcrypt password hashing, and role-based access control protect the platform and its users

---

*This document is maintained as part of the Aaharly Delivery Partner System project documentation. For questions or contributions, please contact the development team.*
