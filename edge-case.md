# Edge Cases & Corner Scenarios: Echo & Insight Website

This document outlines all potential corner scenarios and edge cases based on the `ImplementationPlan-Website.md` for the Echo & Insight project. Addressing these cases ensures a robust, secure, and user-friendly experience.

## Phase 1: Setup & UI/UX Foundation

### Form & Input Handling
*   **+91 Mobile Enforcement:** 
    *   User enters more or fewer than 10 digits after the country code.
    *   User attempts to paste a number containing spaces, hyphens, or country codes (e.g., "+91 +91 9876543210").
    *   Non-numeric characters in the phone number field.
*   **State & District Dropdown:** 
    *   User selects a State but the District dropdown fails to load due to network error.
    *   User submits the form before the District dropdown is populated.
*   **URL Parameters (`/book?type=free`):**
    *   User manually alters the URL parameter to an invalid value (e.g., `?type=invalid` or `?type=paid`).
    *   User accesses `/book` without any query parameters.

### UI/UX & Responsive Design
*   Micro-animations performance on low-end devices or slow networks.
*   Extremely long names or text strings breaking the UI layout in the Contact or Booking forms.
*   Dark mode/Light mode inconsistencies if OS-level preferences conflict with the website's default theme (if not handled explicitly).

## Phase 2: Database & Admin Authentication

### Authentication Security
*   **Unauthorized Login Attempts:** Users other than `ridhi.mentalhealthpractitioner@gmail.com` attempting to log in via Google.
*   **Session Management:** 
    *   Admin session expires while they are actively filling out or viewing a long report.
    *   Multiple concurrent logins from different devices/IPs by the Admin (decide if allowed).
*   **Database Resilience:**
    *   Database connection timeouts or temporary unavailabilities (Neon/Supabase downtime).
    *   Handling database migrations without causing downtime during active bookings.

## Phase 3: Public APIs & Booking Sync

### Form Submissions & Validation
*   Client-side validation is bypassed via tools like Postman (backend validation must strictly mirror frontend).
*   Excessive payload size or malformed JSON sent to `/api/enquiries` or `/api/appointments`.
*   Rate limiting API endpoints to prevent spam form submissions.

### Google Calendar Integration & Concurrency
*   **Race Conditions (Double Booking):** Two users attempt to book the exact same slot simultaneously.
*   **API Rate Limits:** Exceeding Google Calendar API read quota limits during high traffic.
*   **Timezone Discrepancies:** Client browser timezone differs from IST; slots must be correctly converted and displayed in the user's local time (or explicitly state IST everywhere).
*   **Invalid Slot Types & Durations:** 
    *   A user attempting to book a 15-minute slot for a paid session.
    *   A user attempting to book a 60/90-minute slot using the `?type=free` parameter.
    *   A user (or Admin) selecting a 60/90-minute slot where the *start* time is free, but the *subsequent required 30-minute blocks* are booked (System immediately alerts and prevents selection across both public and admin interfaces).
    *   User or Admin selects a valid time slot, then alters the duration, breaking the consecutive availability (System instantly clears the selected time to force re-validation across both public and admin interfaces).
*   **Past Slots:** API mistakenly serving slots that have just passed in the last few minutes.
*   **Settings Cache:** Admin updates the UPI-ID in `/admin/settings`, but the old UPI-ID remains cached in subsequent payment sessions.

## Phase 4: Payments & Webhooks

### Payment Processing
*   **Payment Gateway Downtime:** Razorpay/Cashfree/PhonePe API is completely unresponsive.
*   **Price Tampering:** A malicious user modifies the requested payment amount on the client side before the order creation.
*   **Dynamic UPI-ID Change:** The Admin changes the target UPI-ID exactly while a user is in the middle of a checkout session.

### Webhook Reliability & Status Checks
*   **Race Conditions (Duplicate Fulfillment):** Both the frontend status poll and the background Cashfree Webhook execute simultaneously when a payment succeeds. (Resolved by `lib/fulfillment.ts` utilizing an atomic Prisma `updateMany` where `paymentStatus === 'PENDING'`. The first process to lock the row fulfills the Google Calendar/Emails exactly once, preventing duplicate invites and emails).
*   **Abandoned Payments:** User opens the Cashfree checkout window but closes it or cancels without paying. Cashfree does not send a webhook immediately, leaving the database stuck in `PENDING`. (Resolved by adding a 30-second client-side polling timeout in `/book/status`, coupled with a proactive `Cashfree.PGFetchOrder` backend API check to determine the exact status rather than solely relying on webhooks).
*   **Delayed Webhooks:** User completes payment, but the webhook is delayed by several minutes. User leaves the site without seeing a confirmation screen. (Resolved by the proactive `/api/checkout/status` check fetching the real-time order status directly from Cashfree).
*   **Duplicate Webhooks:** The payment gateway sends the same successful webhook event multiple times. (Resolved by the same atomic `updateMany` lock).
*   **Missed Webhooks:** The webhook fails to reach the server due to network issues (need a cron job to poll/reconcile "Pending" appointments that might have succeeded).
*   **Security:** Malicious actors sending spoofed webhook requests to `/api/webhooks/payment` to falsely confirm appointments. (Resolved via HMAC-SHA256 signature verification matching `x-webhook-signature`).
*   **Partial/Over Payments:** The user pays an amount different from the requested amount.
*   **Mismatched Environments:** Using Production keys while the Cashfree JS SDK is in Sandbox mode, causing a `payment_session_id is not present` error. (Resolved by mapping the SDK mode to `NEXT_PUBLIC_CASHFREE_ENVIRONMENT`).

## Phase 5: Admin Dashboard Features

### Data Handling & Edge Cases
*   **Search Limitations:** Search queries containing special characters (SQL Injection attempts or regex breaking).
*   **Pagination & Performance:** The "History" view loading too slowly when the number of past bookings reaches into the thousands.
*   **Empty States:** Viewing the "Reports" or "History" tabs when there is absolutely zero data.
*   **Data Export/Report Generation:** Memory limit exceeded when exporting a massive date range in the Reports view.

### Cancellation, Revival & Hard Deletions
*   **Time Slot Conflicts during Revival:** Admin attempts to revive a cancelled booking into the SAME slot, but a new patient has already booked that exact slot. (System must reject and redirect to manual override for a NEW slot).
*   **Orphaned Payments:** Attempting to hard-delete a paid booking. (System strictly hides the delete button and blocks the API if `paymentStatus` is not `NOT_APPLICABLE` or session is not `free`).
*   **Email Intimation Failures:** The system attempts to send a cancellation or revival email, but SMTP credentials are missing or the provider is down. (System should log a warning but still successfully update the database and Google Calendar).
*   **Past Date Revivals:** Admin revives a booking where the original slot date is already in the past. (Should only allow revival if manually assigned a future slot via the override form).

## Phase 6: Notifications & Automated Reminders

### Messaging APIs
*   **Invalid Contact Info:** User provides a valid-looking but non-existent phone number or email, causing Twilio or SendGrid to throw errors.
*   **Provider Outages:** Twilio (WhatsApp) or SendGrid (Email) APIs go down. Should the system queue the messages and retry later?

### CRON Jobs & Reminders
*   **Timezone Issues:** Vercel server runs on UTC, causing the 30-minute reminder check to calculate times incorrectly relative to IST.
*   **Missed CRON Execution:** The serverless CRON job fails to fire for a specific hour/minute.
*   **Duplicate Reminders:** The CRON job runs twice or takes too long, resulting in users receiving the same reminder multiple times.
*   **Cancelled Appointments:** Sending a 30-minute reminder for an appointment that the Admin just manually cancelled.

## Phase 7: Testing, Verification & Deployment

### Environment & Deployment
*   Missing or incorrect environment variables (API keys, webhook secrets) in the Vercel production environment.
*   `TZ=Asia/Kolkata` not properly affecting all server-side Node.js instances.
*   Client-side routing issues (404 errors) when a user directly navigates to a nested route (e.g., `echoinsight.in/book`) or refreshes the page.
*   Content Security Policy (CSP) blocking external scripts (like Payment Gateway iframes or Google Fonts).
