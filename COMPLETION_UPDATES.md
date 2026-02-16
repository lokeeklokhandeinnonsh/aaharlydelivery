# Aaharly Delivery Partner System — Completion & Production Stabilization Plan

**Document Type:** Technical Status & Roadmap  
**Target Phase:** Production Hardening (Phase 11)  
**System Status:** Functional MVP (85%) -> Production Reliable (Target)  
**Date:** February 2026

---

## 1. Current Completion Assessment

The Aaharly Delivery Partner System has achieved a functional Minimum Viable Product (MVP) state. The core "Happy Path" — login, fetch orders, navigate, verify location, and complete delivery — is fully implemented and operational.

The system integrates successfully across the Mobile App (React Native), Backend API (Node.js/Express), and Admin Dashboard.

### Component Completion Status

| Component | Status | Verification Scope |
|-----------|--------|-------------------|
| **Vendor Authentication** | 100% | Secure login, JWT management, secure storage, auto-logout on expiry. |
| **Delivery Workflow** | 90% | Fetching assigned orders, sorting by GPS distance, detailed order view. |
| **GPS Verification** | 85% | continuous tracking, distance calculation, 25m proximity trigger. |
| **Delivery Completion** | 90% | API submission, status transition (DELIVERED), timestamp logging. |
| **Notifications** | 80% | Firebase FCM integration, push event triggering on completion. |
| **Navigation** | 100% | External Google Maps deep linking with precise coordinates. |
| **State Management** | 100% | Zustand implementation for auth/delivery state, Axios interceptors. |
| **Admin Visibility** | 80% | Real-time status updates, order pipeline monitoring. |

**Overall System Completion:** ~85% (Functional Feature Complete)

---

## 2. Why The System Is Not Yet Production Safe

While the system functions correctly under ideal conditions, it currently lacks the resilience required for real-world logistics operations. The following risks prevent immediate production deployment:

### Operational Risks
1.  **Network Instability:** Delivery partners often operate in areas with poor or fluctuating signal (elevators, basements, remote sectors). The current system requires active connectivity for verification; a network drop at the doorstep prevents delivery completion.
2.  **Background App Termination:** Android OS aggressively kills background processes to save battery. If the app is minimized during navigation, the delivery state or verification logic might be reset, forcing the rider to restart the flow.
3.  **GPS Drifting & Spoofing:** Urban environments cause GPS signal reflection (multipath effect), leading to location jumps. Malicious actors may use "Mock Location" apps to falsify deliveries without visiting the location.
4.  **Token Refresh Race Conditions:** If the authentication token expires exactly while a rider is attempting to verify a delivery, the request will fail, potentially causing panic or duplicate attempts.
5.  **Duplicate API Submission:** A rider impatient with a loading spinner may tap "Confirm" multiple times, resulting in duplicate delivery records or race conditions in the backend.

---

## 3. Phase 11 — Production Hardening Goals

**Objective:** Transform the working MVP into an operationally reliable logistics system.

The focus shifts from "building new features" to "bulletproofing existing flows." The guiding philosophy for this phase is:

> **"Prevent incorrect deliveries systematically instead of handling operational complaints later."**

By enforcing rigid constraints and fail-safes now, we reduce the operational burden on the support team and ensure trusted delivery data.

---

## 4. Required Stability Features (CRITICAL)

The following mechanisms must be implemented before the system allows general access to delivery partners.

### 4.1 Offline Delivery Queue
**Problem:** API calls fail when network connectivity is lost at the delivery point.
**Solution:**
- Implement a local `ActionQueue` using persistent storage (AsyncStorage/MMKV).
- When "Confirm Delivery" is pressed without network:
    1.  Save the verification payload (ID, coords, timestamp) locally.
    2.  Mark the UI as "Pending Sync."
    3.  Allow the rider to proceed to the next task.
- **Auto-Sync:** A background worker or network listener must detect connection restoration and flush the queue sequentially to the backend.

### 4.2 Background Protection
**Problem:** App state is lost when the OS reclaims memory during external navigation.
**Solution:**
- Persist `activeDeliveryId` and navigation state to local storage immediately upon selection.
- On app launch (or foregrounding), check for a persisted active state.
- Automatically restore the specialized "Navigation/Verification" view if a delivery was in progress, preventing the rider from landing back on the default list view.

### 4.3 GPS Spoof Detection
**Problem:** Fake GPS apps can simulate presence at a location.
**Solution:**
- **Mock Location Flag:** Check the Android `isMockProvider` flag on incoming coordinates. Reject coordinates where this is true.
- **Speed Anomaly Checks:** Calculate speed between the last known location and the verification point. If the rider "teleported" (e.g., 5km in 1 second), reject the verification.
- **Accuracy Filter:** Reject GPS points with a `horizontalAccuracy` > 50 meters to ensure the rider is actually at the specific building, not just the general neighborhood.

### 4.4 Delivery Safety Locks
**Problem:** Operational errors or API tampering.
**Solution:**
- **Double Completion Lock:** Backend must check `status != DELIVERED` before processing a completion request. Return a specific "Already Completed" success code (200 OK) rather than an error to keep the client UI consistent.
- **Distance Guard:** Backend should re-verify the submitted coordinates against the target address coordinates (double verification). If the distance > 100m, reject the request even if the client bypassed client-side checks.

---

## 5. Reliability Improvements (IMPORTANT)

To ensure the app behaves predictably under stress:

### Retry Policies
- Implement exponential backoff for failed API requests (non-4xx errors).
- **Strategy:** Retry network requests 3 times with delays of 1s, 2s, and 5s before showing a failure dialog.

### Central Error Handling
- Move away from distinct `try/catch` blocks in components.
- Use a central error boundary and API client interceptor to handle standard errors (401 Unauthorized, 503 Service Unavailable) uniformly across the app.

### Network Awareness
- Integrate `NetInfo` to visibly show "Offline Mode" banners.
- Disable non-essential API calls (e.g., profile fetch, history fetch) when the network is unreachable.

### Token Refresh Mutex
- Implement a locking mechanism (mutex) for token refreshes.
- If multiple API calls fail with 401 simultaneously, only *one* refresh request should be sent. All other requests should wait and retry with the new token.

---

## 6. Operational Safeguards (ADMIN SIDE)

The backend and admin dashboard must support the improved strictness of the mobile app:

- **Delivery Audit Trail:** Log the raw GPS coordinates, timestamp, and accuracy radius for every successful verification.
- **Verification History:** Store failed attempts (e.g., "Attempted verification 500m away") to identify training issues or fraud.
- **Dispute Support:** Allow admins to override verification manually if a rider calls support (e.g., "GPS signal blocked by high-rise").
- **Suspicious Activity Flags:** Highlight deliveries in the dashboard that were verified with low accuracy or high speed (teleportation), flagging them for review.

---

## 7. UX Safety Improvements

The Delivery Partner UX must guide them through failures without confusion:

- **Clear Instructions:** Step-by-step text on existing screens must be unambiguous (e.g., "Stand near the building entrance").
- **Failure Explanations:** Instead of "Error 500," display "Weak GPS Signal - Please move to an open area" or "No Internet - Saved for later."
- **Recovery Flows:** A "Retry" button must be prominent on any screen that can fail.
- **Location Troubleshooting:** If location permission is denied or GPS is off, show a direct button to open Android System Settings.

---

## 8. Completion Criteria (100% Definition)

The system is considered **Production Ready** only when the following checklist is satisfied:

| Category | Criteria |
|:---|:---|
| **Reliability** | Offline queue successfully syncs data after app restart. |
| **Security** | Mock location apps are detected and blocked. |
| **Integrity** | Backend rejects verification attempts >100m from target. |
| **Stability** | App restores active delivery state after being killed by OS. |
| **Network** | "No Internet" banner works; app does not crash without signal. |
| **Logging** | Every delivery records specific verification metadata (accuracy, provider). |
| **Support** | Admins can view *why* a delivery failed verification in logs. |

---

## 9. Implementation Order (Step-by-Step Plan)

Developers must execute this plan strictly in the defined order to maintain stability. Front-end features depend on Back-end validation.

### Phase 1: Backend Validation & Hardening
1. Add `verification_metadata` JSON column to `UserMealSchedule` table.
2. Implement server-side distance calculation (Double Verification).
3. Implement `isMock` and `accuracy` checks in the Verification Service.
4. Implement idempotency checks (prevent double credit for same delivery).
5. Create comprehensive audit logs for verification attempts (success & failure).

### Phase 2: Mobile Core Reliability
1. Implement `NetInfo` monitoring and global connection state in Zustand.
2. Build the persistent `ActionQueue` (Offline Queue) logic.
3. Update `apiClient` to route requests to Queue when offline.
4. Implement Background Sync Worker.

### Phase 3: Mobile Security & State
1. Update `useLocation` to detect Mock Locations.
2. Implement state persistence for "Active Delivery" (resume after kill).
3. Add UI error boundaries and friendly failure messages.

### Phase 4: Admin Safeguards
1. Update Admin Order View to show verification metadata (map link, accuracy).
2. Add "Manual Override" button for support agents.
3. Deploy and Monitor logs.
