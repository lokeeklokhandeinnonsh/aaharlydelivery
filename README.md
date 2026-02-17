# Aaharly Delivery Partner System

> **Professional Documentation — Version 1.0**
> Last Updated: February 2026

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

### Purpose of the Delivery App

The **Aaharly Delivery Partner System** is a GPS-based meal-delivery management platform designed to streamline the last-mile delivery process for a subscription-based meal service. The system connects three pillars — a **mobile delivery app**, a **centralized backend API**, and an **admin dashboard** — to ensure that meals reach customers on time with verified, location-aware proof of delivery.

### Role of the Admin Dashboard

The Admin Dashboard provides operational staff and management with a centralized control panel for:

- Monitoring real-time delivery statuses across all active vendors
- Managing vendor accounts, meal plans, subscriptions, and user profiles
- Reviewing quality audits, support tickets, and vendor requests
- Generating reports and settlement summaries

### Role of the Backend APIs

The backend API serves as the single source of truth for all data and business logic. It powers:

- Vendor authentication and session management
- Meal plan creation, scheduling, and calendar management
- Delivery assignment, GPS-based verification, and status tracking
- Order lifecycle management (pending → preparing → dispatched → delivered)
- Admin operations including user management, reporting, and quality control
- Public-facing endpoints for customer account and subscription management

### Current Development Stage

The project is in **active development**:

- The **Backend API** is substantially built, with working controllers, services, and a fully defined Prisma database schema covering vendors, users, meals, subscriptions, deliveries, inventory, QA, and support.
- The **Admin Dashboard** is operational with core vendor and order management capabilities.
- The **Mobile Delivery App** (React Native) has its foundational screens, navigation structure, and API integration layer implemented, including the GPS-based delivery verification flow.

Parts of the backend and admin panel are already implemented and functional. The mobile app is in its first phase of delivery partner features.

---

## 2. System Architecture Overview

The Aaharly platform follows a multi-tier architecture with clear separation between the client layer, application layer, data layer, and external services.

### Components

| Component | Technology | Role |
|-----------|-----------|------|
| **Mobile App** | React Native (TypeScript) | Delivery partner interface for GPS-verified deliveries |
| **Backend API Server** | Node.js, Express, TypeScript, TSOA | RESTful API with Swagger documentation, business logic, and cron services |
| **Admin Dashboard** | Web-based (React) | Operations management, monitoring, and reporting console |
| **Database** | PostgreSQL (via Prisma ORM) | Persistent storage for all entities — vendors, users, meals, orders, etc. |
| **Notification System** | Firebase Cloud Messaging (FCM) | Push notifications to customers and vendors via FCM tokens |
| **File Storage** | Supabase S3 Storage | Image uploads for meals, QA documents, and vendor assets |

### Communication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AAHARLY SYSTEM ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────────────┐   │
│   │  Mobile App   │    │    Admin      │    │   Customer App        │   │
│   │  (React       │    │    Dashboard  │    │   (Future)            │   │
│   │   Native)     │    │    (React)    │    │                       │   │
│   └──────┬────────┘    └──────┬────────┘    └──────────┬────────────┘   │
│          │                    │                        │                │
│          │  HTTPS/REST        │  HTTPS/REST             │  HTTPS/REST   │
│          ▼                    ▼                        ▼                │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    BACKEND API SERVER                           │   │
│   │              (Express + TSOA + TypeScript)                      │   │
│   │                                                                 │   │
│   │   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐   │   │
│   │   │ Vendor   │  │  Admin    │  │  Public  │  │  Shared     │   │   │
│   │   │ Routes   │  │  Routes   │  │  Routes  │  │  Services   │   │   │
│   │   │ /vendor/*│  │  /admin/* │  │  /*      │  │             │   │   │
│   │   └──────────┘  └───────────┘  └──────────┘  └─────────────┘   │   │
│   │                                                                 │   │
│   │   ┌──────────────────┐   ┌──────────────────┐                   │   │
│   │   │   JWT Auth       │   │   Cron Service    │                   │   │
│   │   │   Middleware      │   │   (Scheduled      │                   │   │
│   │   │                  │   │    Tasks)          │                   │   │
│   │   └──────────────────┘   └──────────────────┘                   │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                      │
│                    ┌─────────────┼─────────────┐                        │
│                    ▼             ▼             ▼                        │
│            ┌──────────┐  ┌──────────┐  ┌──────────────┐                │
│            │PostgreSQL│  │ Firebase │  │  Supabase    │                │
│            │(Prisma)  │  │  (FCM +  │  │  S3 Storage  │                │
│            │          │  │  Auth)   │  │              │                │
│            └──────────┘  └──────────┘  └──────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### How Components Communicate

- The **Mobile App** communicates with the backend via Axios HTTP client, using JWT-based vendor authentication for all protected routes under `/vendor/*`.
- The **Admin Dashboard** connects to the same backend over REST, authenticating through a separate admin JWT scheme for routes under `/admin/*`.
- The backend uses **Prisma ORM** for all database operations against PostgreSQL.
- **Firebase Admin SDK** is integrated for push notifications and can be used for customer-facing FCM token management.
- **Supabase S3** handles file uploads (meal images, QA documents) through the backend upload service.

---

## 3. Existing Project Structure

### Backend API

**Location:** `C:\Users\pc\aaharly-api`

The backend follows a layered architecture using TSOA (TypeScript OpenAPI) for auto-generated routes and Swagger documentation, with dependency injection via TypeDI.

#### Controllers (Request Handling Layer)

Controllers are organized by domain:

- **Admin Controllers** — 20 controllers covering authentication, meal plans, user management, vendor operations, categories, subscriptions, QA audits, support tickets, dispatch, production, orders, reports, dashboard, vendor requests, and pincode management.
- **Vendor Controllers** — 16 controllers handling vendor authentication, delivery operations (GPS verification, completion, nearby deliveries), production batches, kitchen management, inventory, dispatch, finance, QA, reporting, customer interaction, support, subscriptions, and meal plans.
- **Public Controllers** — 8 controllers for customer-facing operations including account management, address CRUD, user profiles, meal browsing, meal plan viewing, category listing, and server health checks.

#### Services (Business Logic Layer)

Services mirror the controller structure:

- **Admin Services** — 14 services including dashboard analytics, vendor management, order processing, subscription management, QA auditing, support ticket handling, dispatch coordination, report generation, user account/profile management, and pincode configuration.
- **Vendor Services** — 16 services covering delivery GPS verification, vendor authentication with JWT, production batch management, kitchen operations, inventory tracking, dispatch workflows, financial settlements, QA compliance, reporting snapshots, and customer interaction.
- **Shared Services** — 13 services for cross-cutting concerns such as account management, address handling, meal/category CRUD, meal calendar scheduling, meal plan previews, production batch generation, profile management, subscription plan logic, file uploads, user management, and vendor assignment.

#### Database Layer

- **ORM:** Prisma with PostgreSQL adapter
- **Schema:** Comprehensive schema with 20+ models including Admin, User, Profile, Address, Subscription, MealPlan, Meal, MealCalendar, UserMealSchedule, Vendor, VendorUser, ProductionBatch, InventoryItem, QAAudit, SupportTicket, VendorSettlement, VendorRequest, VendorPincode, Offer, CouponCode, and AuditLog
- **Enums:** Fully defined statuses for delivery lifecycle (PENDING → PREPARING → READY_TO_DISPATCH → HANDED_OVER → DELIVERED → CANCELLED), roles, meal types, batch statuses, and more

#### Authentication

- **JWT-based authentication** with three separate secret keys:
  - `JWT_SECRET_KEY` — General user authentication
  - `JWT_ADMIN_SECRET` — Admin panel authentication
  - `JWT_VENDOR_SECRET` — Vendor/delivery partner authentication
- **Middleware:** Dedicated auth middleware (`auth.ts`, `jwtAuth.ts`, `tsoaAuth.ts`) with TSOA security integration for route-level authorization

#### Additional Infrastructure

- **Swagger/OpenAPI:** Auto-generated API documentation available at `/api-docs`
- **Cron Service:** Scheduled task runner for automated background operations
- **IoC Container:** Dependency injection via TypeDI for clean service instantiation
- **Error Handling:** Centralized error middleware with validation error formatting, Prisma error mapping, and UUID format validation

---

### Admin Dashboard

**Location:** `C:\Aaharly Admin Dashboard\aaharly-admin dashboard\aaharly-admin-dashboard`

The Admin Dashboard is a web-based React application providing a management interface for operational staff.

#### Admin UI

- Interactive web interface for system administration
- Dashboard views with key performance metrics and summaries
- Responsive layout for desktop operation

#### Order Management

- View and track all active and historical meal delivery orders
- Monitor delivery status transitions across the full lifecycle
- Manage user meal schedules and subscription-based order generation

#### User Management

- View and manage customer profiles, accounts, and addresses
- Handle vendor onboarding, status changes, and role assignments
- Admin account management with role-based access (superadmin, admin, merchant, ops, qa, support)

#### Monitoring

- Real-time dashboard with delivery and vendor activity summaries
- QA audit tracking and compliance monitoring
- Support ticket visibility and resolution workflow
- Vendor report snapshots and settlement oversight

---

### Mobile App (Delivery Partner)

**Location:** `C:\Users\pc\aaharly-delivery\aaharlydelivery`

The mobile app is built with React Native (TypeScript) targeting Android and iOS, designed for delivery partners to manage their assigned deliveries with GPS-based verification.

#### Screens

| Screen | Purpose |
|--------|---------|
| `LoginScreen` | Vendor authentication via email/password |
| `DashboardScreen` | Overview of assigned deliveries and daily summary |
| `OrderDetailsScreen` | Detailed view of a specific delivery order |
| `VerifyScreen` | GPS-based location verification before delivery completion |
| `DeliverySuccessScreen` | Confirmation screen after successful delivery |
| `ProfileScreen` | Vendor partner profile and settings |
| `HelpSupportScreen` | Access to support and help resources |
| `PlaceholderScreen` | Reserved for future tab content |

#### Navigation

- **RootNavigator** — Stack-based navigation managing the core flow: Login → MainTabs → OrderDetails → Verify → DeliverySuccess → HelpSupport
- **TabNavigator** — Bottom tab navigation for daily operations once authenticated (Dashboard, Profile, Help)
- **Phase 1 Simplification** — LocationCheck and PhotoProof screens have been intentionally removed; verification is GPS-only

#### API Integration

- **apiClient.ts** — Centralized Axios HTTP client configured with base URL, JWT token injection via AsyncStorage, request/response interceptors, and error handling
- **authApi.ts** — Vendor login, session persistence (token + vendor info in AsyncStorage), logout with token clearing, and session retrieval
- **deliveryApi.ts** — Three core delivery APIs:
  - `verifyLocation` — POST to verify delivery partner proximity via GPS
  - `completeDelivery` — POST to mark delivery as completed with GPS coordinates
  - `getNearbyDeliveries` — GET nearby deliveries sorted by distance with configurable radius and filters

#### Key Libraries

- **react-native-geolocation-service** — High-accuracy GPS location tracking
- **react-native-reanimated** — Smooth animations and transitions
- **react-native-linear-gradient** — Gradient-based UI styling
- **react-native-vector-icons** — Icon system for the interface
- **@react-native-async-storage/async-storage** — Secure local storage for tokens and session data

---

## 4. Current Implemented Features

The following features are confirmed as implemented based on codebase analysis:

### Backend API — Implemented

- ✅ Vendor authentication (email/password login with JWT token issuance)
- ✅ Admin authentication (separate JWT scheme with role enforcement)
- ✅ Meal plan CRUD operations (create, read, update, manage meal plans)
- ✅ Meal management (individual meals with nutritional data, components, swap options)
- ✅ Meal calendar scheduling (day-wise meal assignments per category)
- ✅ User meal schedule management (subscription-based daily meal assignments)
- ✅ Category management (weight loss, weight gain, normal — BMI-based)
- ✅ Subscription management (6-day, 15-day, 1-month plans with active/paused/expired states)
- ✅ Vendor management (onboarding, status control, pincode assignment)
- ✅ Vendor delivery endpoints (GPS verify-location, complete-delivery, nearby-deliveries)
- ✅ Production batch management (batch creation, tracking, status progression)
- ✅ Inventory tracking (stock levels, transactions, low-stock thresholds)
- ✅ Kitchen operations management
- ✅ Dispatch coordination
- ✅ QA audit system (audit scoring, checklists, document uploads)
- ✅ Support ticket system (vendor tickets with comments and status tracking)
- ✅ Vendor request workflow (pause subscription, plan change, delivery skip, etc.)
- ✅ Financial settlement tracking (vendor payouts with deductions)
- ✅ Reporting and dashboard analytics
- ✅ Offer and coupon code management
- ✅ User profile management (health data, BMI calculation, dietary preferences)
- ✅ Address management (with geocoordinates and pincode)
- ✅ Swagger/OpenAPI documentation auto-generation
- ✅ Cron-based scheduled task execution
- ✅ File upload service (via Supabase S3)
- ✅ Audit logging
- ✅ OTP infrastructure (SMS via Fast2SMS)

### Admin Dashboard — Implemented

- ✅ Admin login and session management
- ✅ Vendor account management interface
- ✅ Order monitoring and status tracking
- ✅ User and subscription management views
- ✅ Dashboard analytics and summaries

### Mobile App — Implemented

- ✅ Vendor login screen with credential-based authentication
- ✅ Delivery dashboard with order listing
- ✅ Order detail view with delivery information
- ✅ GPS-based location verification screen
- ✅ Delivery completion and success confirmation
- ✅ Vendor profile management
- ✅ Help and support access
- ✅ Tab-based navigation structure
- ✅ Centralized API client with auth token management
- ✅ Custom hook for GPS location tracking (`useLocation`)

---

## 5. Updated Delivery Verification Flow

The delivery verification process has been redesigned to use a **GPS-only approach**, removing the previous OTP and photo proof steps for a streamlined, friction-free experience.

### Workflow Steps

```
┌─────────────────────────────────────────────────────────────────┐
│                   DELIVERY VERIFICATION FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: VENDOR LOGIN                                            │
│  ├── Delivery partner opens mobile app                           │
│  ├── Authenticates with email and password                       │
│  └── JWT token issued and stored locally                         │
│                ▼                                                 │
│  Step 2: FETCH NEARBY DELIVERIES                                 │
│  ├── App captures current GPS coordinates                        │
│  ├── Calls /vendor/delivery/nearby API                           │
│  └── Receives list of pending deliveries in area                 │
│                ▼                                                 │
│  Step 3: DISTANCE-BASED SORTING                                  │
│  ├── Deliveries sorted nearest-first by distance                 │
│  ├── Distance displayed in meters or kilometers                  │
│  └── Estimated delivery time shown per order                     │
│                ▼                                                 │
│  Step 4: LOCATION VERIFICATION                                   │
│  ├── Partner selects a delivery and navigates to address          │
│  ├── Calls /vendor/delivery/verify-location API                  │
│  ├── Backend calculates distance from delivery coordinates        │
│  └── Returns verified/not-verified with distance threshold        │
│                ▼                                                 │
│  Step 5: SUBMIT CONFIRMATION                                     │
│  ├── If GPS verification passes, partner confirms delivery        │
│  ├── Calls /vendor/delivery/{id}/complete API                    │
│  └── GPS coordinates logged as proof of delivery                  │
│                ▼                                                 │
│  Step 6: DELIVERY SUCCESS                                        │
│  ├── Backend marks order status as DELIVERED                      │
│  ├── Verification status set to GPS_VERIFIED                     │
│  └── Success screen displayed to partner                         │
│                ▼                                                 │
│  Step 7: CUSTOMER NOTIFICATION                                   │
│  ├── FCM notification triggered to customer device                │
│  └── Delivery confirmation with timestamp                        │
│                ▼                                                 │
│  Step 8: DASHBOARD UPDATE                                        │
│  ├── Admin dashboard reflects updated delivery status             │
│  ├── Vendor report snapshots updated                             │
│  └── Settlement calculations adjusted                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why OTP and Photo Proof Were Removed

- **OTP Friction** — Requiring customers to share an OTP added unnecessary delay. Many subscription meal deliveries happen when customers are at work or unavailable. GPS proximity is sufficient proof.
- **Photo Proof Overhead** — Photo capture introduced app complexity, storage costs, and privacy concerns. GPS verification provides equivalent assurance with a simpler experience.
- **Faster Deliveries** — Partners can complete deliveries in fewer steps, improving throughput during peak meal hours.
- **Reduced Customer Interaction** — For subscription-based daily deliveries, contactless drop-off with GPS proof is the preferred model.

### Business Logic Benefits

- Lower delivery completion time per order
- Reduced customer complaint rate related to OTP delays
- Simplified partner training and onboarding
- Lower infrastructure cost (no photo storage or SMS for OTP)
- Verifiable GPS logs retained for dispute resolution

---

## 6. Existing API Analysis (High-Level)

### Major API Categories

#### Vendor Authentication APIs (`/vendor/auth/*`)

- Handle delivery partner login via email/password credentials
- Issue JWT tokens containing vendor ID, vendor user ID, and role
- Provide secure session establishment for all subsequent vendor API calls

#### Vendor Delivery APIs (`/vendor/delivery/*`)

- **Verify Location** — Accepts delivery partner's GPS coordinates and a delivery ID, calculates distance from delivery address, returns verification status with configurable distance threshold
- **Complete Delivery** — Records delivery completion with GPS proof, marks the delivery as delivered, triggers downstream notifications
- **Nearby Deliveries** — Returns deliveries within a configurable search radius, sorted by proximity, with optional status and limit filters

#### Vendor Operational APIs (`/vendor/*`)

- Production management endpoints for batch creation and status tracking
- Kitchen operations for food preparation workflow
- Inventory tracking with stock level management and transaction history
- Dispatch coordination for order handover
- Financial summary and settlement view
- QA compliance submissions
- Reporting and dashboard summaries
- Support ticket creation and tracking
- Subscription and meal plan access

#### Admin Management APIs (`/admin/*`)

- Full CRUD operations for vendors, users, profiles, accounts, meal plans, and categories
- Subscription oversight and management
- Order and delivery monitoring
- QA audit creation and review
- Support ticket management
- Dashboard analytics with aggregated metrics
- Report generation
- Vendor request approval/rejection workflow
- Pincode-based vendor service area configuration
- Dispatch management and production oversight

#### Public APIs (`/*`)

- Customer account registration, login, and profile management
- Address management with geocoordinates
- Meal plan browsing and preview
- Category-based meal discovery
- Server health status check

### Frontend–API Interaction

- The mobile app uses a centralized `apiClient` (Axios-based) that automatically injects the vendor JWT token from local storage into all request headers
- Request interceptors handle authentication; response interceptors manage error formatting and session expiry
- The app calls vendor-scoped endpoints exclusively (`/vendor/*`) using the `vendor_bearer` security scheme

### Admin–API Interaction

- The admin dashboard connects to admin-scoped endpoints (`/admin/*`) using a separate `admin_bearer` security scheme
- Admin JWT tokens carry admin role information for fine-grained access control
- TSOA generates the Swagger spec, making all endpoints self-documented at `/api-docs`

### Observed Limitations

- Some vendor delivery endpoints reference services that may need extended database queries for full GPS-based delivery tracking (the DeliveryStatus enum is defined in the schema, but delivery-specific tables for GPS logs are not yet present)
- Customer notification flow via FCM is configured but may need additional integration testing for delivery completion triggers
- The nearby-deliveries endpoint performs distance calculations that currently rely on service-layer logic rather than database-level geospatial queries

---

## 7. Admin Dashboard Role

### Monitoring Deliveries

The admin dashboard provides a centralized view of all active and historical deliveries:

- Track real-time delivery status across all vendors (PENDING → PREPARING → READY_TO_DISPATCH → HANDED_OVER → DELIVERED → CANCELLED)
- View daily delivery counts, completion rates, and delay metrics
- Monitor vendor-specific delivery performance through report snapshots

### Managing Vendors

- Onboard new vendors and manage their status lifecycle (onboarding → active → inactive)
- Assign and manage vendor users with role-based access (admin, staff)
- Configure vendor service areas through pincode management
- Review and act on vendor requests (subscription pauses, plan changes, delivery skips)

### Viewing Performance

- Dashboard analytics with aggregated KPIs for delivery volume, completion rates, and customer satisfaction
- Vendor report snapshots providing daily/weekly operational summaries
- Financial settlement reports showing order volumes, earnings, deductions, and net payouts

### Handling Complaints

- Support ticket management with full lifecycle tracking (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
- Categorized ticket types: ingredient shortages, equipment issues, delivery delays, quality clarifications
- Threaded comments for communication between admin and vendor teams

### Controlling System

- Admin role hierarchy: superadmin, admin, merchant, ops, qa, support
- QA audit management with scoring, checklists, issue tracking, and document uploads
- Offer and coupon code management for promotional campaigns
- Production batch oversight and scheduling
- Meal plan and meal category configuration

### Connection to Backend

The admin dashboard communicates exclusively through the backend REST API using admin-authenticated endpoints. All data displayed in the dashboard is fetched in real-time from the PostgreSQL database via the backend services. The admin JWT scheme ensures that only authorized personnel with appropriate roles can access specific administration features.

---

## 8. Data Flow Explanation

### End-to-End Delivery Data Flow

```
STEP 1: LOGIN
─────────────────────────────────────────────────────────
  Delivery Partner → [LoginScreen] → POST /vendor/auth/login
  → VendorAuthService validates credentials against VendorUser table
  → JWT token generated with vendor_id, vendor_user_id, role
  → Token stored in AsyncStorage on device
  → Partner redirected to Dashboard

STEP 2: FETCH DELIVERIES
─────────────────────────────────────────────────────────
  Dashboard → [useLocation hook] → Device GPS coordinates captured
  → GET /vendor/delivery/nearby?lat=X&lng=Y&maxDistance=10
  → VendorDeliveryService queries UserMealSchedule for pending deliveries
  → Distance calculated from partner location to each delivery address
  → Results sorted by proximity and returned to app
  → Dashboard displays delivery list sorted nearest-first

STEP 3: SELECT & VIEW ORDER
─────────────────────────────────────────────────────────
  Partner taps delivery → [OrderDetailsScreen]
  → Order details displayed (customer name, address, meal plan, meal type)
  → "Verify & Deliver" action available

STEP 4: LOCATION VERIFICATION
─────────────────────────────────────────────────────────
  Partner navigates to address → [VerifyScreen]
  → App captures high-accuracy GPS coordinates
  → POST /vendor/delivery/verify-location
  → Backend calculates distance between partner and delivery address
  → Returns: verified (boolean), distance (meters), threshold, canComplete
  → If verified → "Complete Delivery" button enabled

STEP 5: DELIVERY COMPLETION
─────────────────────────────────────────────────────────
  Partner confirms delivery → POST /vendor/delivery/{id}/complete
  → GPS coordinates logged as delivery proof
  → UserMealSchedule.delivery_status updated to DELIVERED
  → Verification status set to GPS_VERIFIED
  → Completion timestamp recorded

STEP 6: NOTIFICATION
─────────────────────────────────────────────────────────
  Backend triggers post-delivery actions:
  → FCM push notification sent to customer via stored fcm_token
  → Notification contains delivery confirmation and timestamp
  → App shows [DeliverySuccessScreen] to partner

STEP 7: REPORTING & SETTLEMENT
─────────────────────────────────────────────────────────
  Backend processes completed delivery:
  → VendorReportSnapshot updated with delivery data
  → VendorSettlement calculations adjusted
  → AuditLog entry created for the delivery event
  → Admin dashboard reflects updated delivery count and status
  → Cron service may aggregate daily reports
```

---

## 9. Backend Integration Plan (Future Scope)

### How Current APIs Can Support the New Flow

The existing backend infrastructure provides a strong foundation for the GPS-based delivery verification flow:

- The `DeliveryStatus` enum is already defined in the Prisma schema with the full lifecycle (PENDING through DELIVERED/CANCELLED)
- The `UserMealSchedule` model includes `delivery_status`, `dispatched_at`, and `address_id` fields, providing the core data structure for delivery tracking
- The `Address` model stores `lat` and `lng` coordinates, enabling GPS distance calculations
- The vendor authentication system with separate JWT secrets is production-ready
- The vendor delivery controller and service layer are implemented with the three required endpoints

### What May Be Extended Later

- A dedicated delivery log or GPS proof table may be introduced to store historical GPS coordinates for each delivery event, supporting audit trails and dispute resolution
- The nearby-deliveries service may benefit from database-level geospatial indexing (PostGIS) for improved performance at scale
- The notification service may be extended to include SMS fallback for customers without FCM tokens
- Batch delivery assignment logic could be introduced for route-optimized delivery grouping
- Real-time WebSocket support could replace polling for live delivery tracking on the admin dashboard

### What Should Be Reviewed Before Changes

- The `UserMealSchedule` model's relationship to delivery tracking should be evaluated — a separate `Delivery` model may provide cleaner separation of concerns
- The distance calculation algorithm in the delivery service should be reviewed for accuracy at edge cases (GPS drift, multi-story buildings, etc.)
- Rate limiting should be assessed on the verify-location endpoint to prevent GPS spoofing abuse
- The FCM notification trigger should be validated end-to-end in a staging environment before production rollout
- Database migration strategy should be planned for any schema changes to avoid data loss on active subscriptions

---

## 10. Security & Compliance Overview

### Authentication System

The platform implements a multi-scheme JWT authentication architecture:

- **Three-tier JWT secrets** — Separate signing keys for general users, admin personnel, and vendor partners, preventing cross-domain token reuse
- **Token expiration** — Configurable JWT expiration with environment-variable control
- **Production enforcement** — In production environments, missing JWT secrets cause application startup failure, preventing deployment with default keys
- **Session persistence** — Vendor tokens stored securely in device AsyncStorage with explicit clearing on logout

### Authorization

- **TSOA Security Decorators** — Route-level security enforcement using `@Security('vendor_bearer')` and `@Security('admin_bearer')` decorators, ensuring all protected endpoints require valid tokens
- **Role-based access control** — Admin roles (superadmin, admin, merchant, ops, qa, support) and vendor roles (admin, staff) enable granular permission management
- **Vendor isolation** — Vendor endpoints extract `vendorId` from the authenticated token, ensuring vendors can only access their own data

### Data Privacy

- **Password hashing** — bcrypt-based password hashing for all stored credentials
- **Minimal data exposure** — API responses are structured through DTOs to control which fields are returned to clients
- **Audit logging** — All significant actions are recorded in the AuditLog table with actor identification

### Location Security

- **GPS accuracy tracking** — The verification system accepts and logs GPS accuracy values, allowing backend filtering of low-accuracy readings
- **Distance threshold enforcement** — Configurable proximity thresholds prevent false delivery confirmations from distant locations
- **Coordinate logging** — Delivery completion coordinates are recorded for post-delivery verification and dispute resolution

### Admin Access Control

- **Separate authentication scheme** — Admin access uses a distinct JWT secret and authentication flow, completely isolated from vendor and public APIs
- **Role hierarchy** — Admin roles from superadmin to support allow fine-grained access to different dashboard features
- **Environment-specific enforcement** — Production environments require all security secrets to be explicitly configured

---

## 11. Testing & Validation Strategy

### Manual Testing

- **End-to-end delivery flow testing** — Walk through the complete flow from vendor login through delivery completion to verify each screen transition and API call
- **Edge case validation** — Test with expired tokens, network failures, invalid GPS coordinates, and simultaneous delivery attempts
- **Cross-device testing** — Validate the mobile app on multiple Android devices and screen sizes
- **Admin dashboard validation** — Verify that delivery status changes in the mobile app are reflected in real-time on the admin dashboard

### GPS Testing

- **High-accuracy testing** — Validate GPS accuracy thresholds in real-world conditions (outdoor, indoor, urban canyon)
- **Proximity verification** — Test the distance calculation with known coordinates to ensure threshold enforcement is accurate
- **GPS drift scenarios** — Verify system behavior when GPS readings fluctuate near the threshold boundary
- **Location permission handling** — Test app behavior when location permissions are denied, revoked, or set to approximate-only

### Admin Validation

- **Role-based access testing** — Verify that each admin role can only access authorized features
- **Data integrity verification** — Confirm that admin actions (vendor approval, order updates) correctly propagate through the system
- **Report accuracy** — Cross-reference dashboard analytics with raw database records
- **Concurrent user testing** — Validate admin dashboard behavior with multiple simultaneous admin sessions

### API Validation

- **Swagger documentation review** — Use the auto-generated Swagger UI at `/api-docs` to interactively test all endpoints
- **Authentication flow testing** — Verify token issuance, expiration, and rejection for each security scheme
- **Error response validation** — Confirm that all error codes (400, 401, 404, 422, 500) return properly formatted responses
- **Input validation testing** — Test TSOA validation rules by submitting malformed payloads and verifying 422 responses

---

## 12. Deployment Overview

### Backend Hosting

The backend API is prepared for multiple deployment targets:

- **Docker** — A `Dockerfile` and `docker-compose.yml` are included for containerized deployment, enabling consistent environments across development, staging, and production
- **Render** — A `render.yaml` configuration is present for deployment to the Render cloud platform
- **Fly.io** — A `fly.toml` configuration supports deployment to Fly.io's edge network
- **AWS Lambda** — A `serverless.yml` configuration with `serverless-http` integration enables serverless deployment via AWS Lambda and API Gateway
- **PM2** — An `ecosystem.config.js` is configured for PM2 process management on traditional VPS hosting

The backend listens on a configurable port (default 4000) and binds to `0.0.0.0` for external access.

### Admin Dashboard Hosting

- The admin dashboard is a web application that can be hosted on any static hosting platform or served alongside the backend
- Standard deployment options include Vercel, Netlify, AWS S3 + CloudFront, or a dedicated web server
- The dashboard connects to the backend API via configured base URL, requiring CORS to be properly set (CORS is enabled on the backend)

### Mobile App Release Process

- The React Native mobile app targets both Android and iOS platforms
- Android builds are generated through the standard Gradle build process in the `android/` directory
- iOS builds are configured through Xcode projects in the `ios/` directory
- App releases follow standard Google Play Store and Apple App Store submission processes
- The app's API endpoint is configured via the `apiClient.ts` base URL, which must be updated for production deployment

---

## 13. Limitations (Current System)

### Known Technical Limitations

- **GPS-only verification** — The current system relies exclusively on GPS for delivery proof; in areas with poor GPS signal (dense urban environments, basements), verification may be unreliable
- **No offline support** — The mobile app requires an active internet connection for all operations; deliveries cannot be completed or queued when offline
- **No real-time tracking** — The system uses polling rather than WebSockets, meaning delivery status updates on the admin dashboard are not instantaneous

### Scalability Constraints

- **Distance calculations** — The nearby-deliveries endpoint performs distance calculations in application code rather than using database-level geospatial queries (PostGIS), which may become a bottleneck with thousands of concurrent deliveries
- **Single database** — The system uses a single PostgreSQL instance; horizontal scaling would require read replicas or database sharding
- **No caching layer** — API responses are served directly from the database without Redis or similar caching, which may impact performance under high load

### Integration Gaps

- **FCM notification reliability** — Push notification delivery depends on customer network connectivity and FCM token freshness; there is no SMS fallback mechanism
- **No payment gateway integration** — Financial settlements are tracked in the database but do not integrate with a payment processor for automated vendor payouts
- **No customer-facing mobile app** — The current mobile app serves delivery partners only; customer ordering and tracking require a separate application

### Monitoring Gaps

- **No application performance monitoring (APM)** — No tools like New Relic, Datadog, or Sentry are integrated for runtime error tracking and performance monitoring
- **Limited logging** — The backend uses console-based logging via Morgan; a structured logging solution (Winston, Pino) with log aggregation would improve debugging
- **No health check alerting** — While a server status endpoint exists, there is no automated alerting for downtime or degraded performance

---

## 14. Future Roadmap (Decision Pending)

The following features are under consideration for future development phases. All decisions will be taken based on business requirements, technical feasibility assessments, and stakeholder reviews.

### Route Optimization

- Implement intelligent delivery route planning using clustering algorithms
- Suggest optimal delivery sequences to minimize total travel distance and time
- Consider integration with mapping services for real-time traffic-aware routing

### Advanced Analytics

- Build a comprehensive analytics engine with delivery time trends, vendor performance scoring, customer satisfaction metrics, and operational cost analysis
- Introduce predictive dashboards for meal demand forecasting and resource planning
- Generate automated weekly/monthly executive reports

### SOS / Emergency Support

- Add an in-app emergency button for delivery partners facing safety concerns
- Enable real-time location sharing with admin team during SOS events
- Integrate with local emergency services where applicable

### Offline Support

- Enable delivery completion in offline mode with local queue and auto-sync
- Cache active delivery assignments on device for uninterrupted operation
- Implement conflict resolution for data synced after reconnection

### AI-Based Prediction

- Predict meal delivery volumes based on historical subscription data and seasonal trends
- Automate production batch quantity recommendations
- Suggest optimal vendor-customer matching based on delivery patterns and proximity

### Additional Considerations

- **Customer-facing mobile application** for order placement, subscription management, and delivery tracking
- **Real-time WebSocket communication** for live delivery tracking on the admin dashboard
- **Multi-language support** for broader geographic expansion
- **Geofencing** for automated delivery zone management and vendor area enforcement

All future features will undergo a formal review and approval process before implementation begins.

---

## 15. Development Guidelines

### No Direct Code Edits Without Approval

- All code modifications must be reviewed and approved before being applied
- Changes to database schema, API contracts, or authentication flow require explicit sign-off
- No direct hotfixes to production code without documented review

### Documentation-First Approach

- Every new feature, API endpoint, or system change must be documented before implementation begins
- Architecture decisions should be recorded with rationale and alternatives considered
- API changes must be reflected in Swagger documentation and communicated to all consuming applications

### Testing Before Implementation

- All proposed changes should be validated in a development or staging environment before production deployment
- GPS-related features must be tested in real-world conditions with multiple device types
- Database migrations must be tested against a copy of production data to verify backward compatibility

### Review-Based Development

- Code reviews are mandatory for all pull requests
- Architecture reviews are required for features that introduce new dependencies, modify the database schema, or change authentication flows
- Security reviews must be conducted for any changes affecting authentication, authorization, or data privacy
- Performance reviews should accompany features that may impact API response times or database query load

---

## 16. Conclusion

### Current System Strength

The Aaharly Delivery Partner System stands on a solid technical foundation:

- A **well-structured backend API** with 44+ controllers, comprehensive service layer, and a production-ready PostgreSQL schema covering all aspects of meal delivery operations
- A **functional admin dashboard** providing operational visibility and control over vendors, orders, quality, and support
- A **purpose-built mobile app** with GPS-based delivery verification, streamlined navigation, and clean API integration
- A **multi-scheme authentication architecture** ensuring secure, role-based access across all system components
- **Multiple deployment options** (Docker, Render, Fly.io, AWS Lambda, PM2) providing flexibility for infrastructure decisions

### Expansion Potential

The system is architected for growth:

- The modular controller-service-database pattern allows new features to be added without disrupting existing functionality
- The auto-generated Swagger documentation ensures API-first development practices
- The separate admin, vendor, and public API namespaces provide clean boundaries for feature expansion
- The comprehensive Prisma schema supports extension through new models and relations

### Professional Development Approach

The project follows a disciplined development methodology:

- Documentation-first approach ensures clarity before code changes
- Multi-environment JWT secrets enforce production-grade security from day one
- Layered architecture (controllers → services → database) maintains code quality and testability
- Review-based development prevents unplanned changes from affecting system stability

---

*This document is the official technical reference for the Aaharly Delivery Partner System. For questions, clarifications, or update requests, please follow the established review and approval process.*
