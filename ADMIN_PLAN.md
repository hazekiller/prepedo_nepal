# Admin System Implementation Plan

## 1. System Analysis & Gaps
Currently, the **Prepedo** system relies on hardcoded environment variables or static code for critical business logic. This makes it difficult for administrators to react to market changes (e.g., fuel price hikes, rain surges) without redeploying the backend.

### Identified Hardcoded Logic (To be made Dynamic)
1.  **Pricing Model**: Base fares, per-km rates, and booking fees are hardcoded in `bookingController.js`.
2.  **Surge Pricing**: Time-based logic (Morning/Evening rush) is hardcoded.
3.  **Commissions**: Platform commission (15%) is hardcoded.
4.  **Driver Approval**: Currently manual database updates or simple API toggles without visual document verification.

## 2. Implementation Roadmap

### Phase 1: Dynamic Settings Engine (Backend)
**Objective**: Move all business constants to a database table (`system_settings`) configurable via API.

*   **Database**:
    *   Create `system_settings` table (Key-Value pair storage).
    *   Seed with current default values (e.g., `bike_base_fare: 60`, `commission_rate: 15`).
*   **API**:
    *   `GET /api/admin/settings`: Fetch all configuration.
    *   `PUT /api/admin/settings`: Update configuration.
*   **Integration**:
    *   Refactor `bookingController.js` `calculateFare()` to query these settings instead of `process.env`.

### Phase 2: Advanced Admin UI (Frontend)
**Objective**: Create a comprehensive control panel in the Web Admin.

*   **Settings Page (`/admin/settings`)**:
    *   **Pricing Control**: Inputs to change Base Fare per vehicle type, Per KM rate, and Minimum Fare.
    *   **Surge Control**: Toggle "Rain Mode" (Global 1.5x) or adjust Rush Hour multipliers.
    *   **Commission**: Slider/Input to adjust platform fee percentage.
*   **Driver Verification Portal (`/admin/drivers/:id`)**:
    *   Detailed view of a specific driver.
    *   **Document Viewer**: Display License and Bluebook images side-by-side with user details for proper verification before approval.
*   **Live Operations Map (`/admin/map`)**:
    *   Real-time map showing all "Online" drivers and "Active" trips using Leaflet.

### Phase 3: Reports & Analytics
*   **Financial Reports**: Breakdown of Revenue vs. Driver Earnings.
*   **Trip Logs**: searchable history of all rides with "Replay" map route (using stored pickup/dropoff coords).

## 3. Immediate Action Items
1.  Create `system_settings` table.
2.  Create `Settings` Controller & Routes.
3.  Build the **Global Settings** UI in Admin Panel.
4.  Refactor `DriverRequest` UI to show documents.

This plan ensures the Admin Panel is not just a viewer, but a **Command Center** for the entire platform.
