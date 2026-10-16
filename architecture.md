# System Architecture: Echo & Insight — Professional Booking Website

**Brand**: Echo & Insight | **Domain**: [echoinsight.in](https://echoinsight.in) | **Timezone**: IST (Asia/Kolkata, New Delhi, UTC+5:30)

This document outlines the detailed system architecture for the **Echo & Insight** mental healthcare portfolio and booking website (echoinsight.in), based on the requirements defined in `ProblemStatement.md`.

## 1. High-Level Architecture

The application will follow a **modern serverless architecture** utilizing a unified full-stack framework. 

- **Framework**: **Next.js (App Router)** - Chosen for its excellent SEO capabilities, server-side rendering (SSR), and built-in API routes which eliminate the need for a separate backend server.
- **Frontend**: React.js with Vanilla CSS (or CSS Modules) to ensure rich, flexible aesthetics and micro-animations.
- **Backend/API**: Next.js API Routes (Serverless Functions) to handle business logic, webhooks, admin functions, and third-party integrations securely.
- **Database**: **Supabase PostgreSQL** with **Prisma ORM** for type-safe database access to store enquiries, appointments, payment statuses, and admin settings.
- **Hosting**: **Vercel** - Optimized for Next.js, providing automatic scaling and edge network capabilities. Custom domain: **echoinsight.in**.
- **Timezone**: All server-side date/time operations, CRON jobs, and calendar slots use **IST (Asia/Kolkata, UTC+5:30)**. Environment variable `TZ=Asia/Kolkata` must be set in Vercel.

---

## 2. System Components & Flow

### 2.1. Frontend Architecture
The client-side will be structured into reusable React components and segregated into public and admin areas:
- **Public Pages**: `/` (Home), `/about`, `/services`, `/book`, `/contact`, `/cancellation-policy`, `/terms-and-conditions`, `/privacy-policy`.
- **Admin Pages**: `/admin/login`, `/admin/dashboard` (Upcoming Bookings), `/admin/history` (All Bookings), `/admin/reports` (Month-wise Sales), `/admin/settings` (UPI Configuration).
- **UI Components**: `HeroVideo`, `ServiceCard`, `CalendarWidget`, `TimeSlotPicker`, `EnquiryForm`, `NotificationToast`, `AdminSidebar`, `DataTables`, `SalesChart`.
- **State Management**: React Context API (or Zustand) for managing booking flow state and admin authentication state.
- **Styling**: Global CSS variables for design tokens (colors, fonts), and CSS modules for component-level scoping.

### 2.2. Backend (API Routes)
The serverless backend will expose several RESTful endpoints. Admin routes will be protected by middleware verifying authentication (e.g., JWT).
- **Public Routes**:
  - `POST /api/enquiries`: Validates and saves general enquiries, triggers notifications.
  - `GET /api/calendar/slots`: Fetches the professional's Google Calendar events and computes available 45m/60m/90m slots.
  - `POST /api/checkout/create-order`: Initializes a payment session for the UPI payment.
  - `POST /api/webhooks/payment`: Secure webhook to receive real-time payment success/failure events.
  - `GET /api/cron/heartbeat`: Protected by `CRON_SECRET`, executes a lightweight query (`SELECT 1`) to act as a heartbeat, preventing Supabase from pausing the free-tier database.
- **Admin Authenticated Routes**:
  - `POST /api/admin/login`: Authenticates the admin using NextAuth (Google Provider), strictly restricted to `ridhi.mentalhealthpractitioner@gmail.com`, and sets a secure session cookie.
  - `GET /api/admin/bookings`: Fetches future and past bookings with search/filter capabilities (Mobile/Email/VPA).
  - `GET /api/admin/reports`: Aggregates booking data for month-wise sales reporting.
  - `GET /api/admin/settings`: Retrieves the active UPI-ID.
  - `PUT /api/admin/settings`: Updates the professional's UPI-ID used for payments.

---

## 3. Core Workflows & Integrations

### 3.1. The Appointment Booking & Payment Workflow
1. **Slot Selection**: User selects a date, time slot, and duration (15/60/90 mins) via the UI. The frontend fetches available 30-min base slots from `/api/calendar/slots`, and strictly validates consecutive availability on the client-side for multi-slot sessions, visually highlighting the entire block.
2. **Details Entry**: User inputs their details (Name, Email, Mobile).
3. **Payment Initiation**: Frontend calls `/api/checkout/create-order`. The backend fetches the Cashfree API keys (via env vars), creates a "Pending" appointment, uses `cashfree-pg` SDK to create an order, and returns a `payment_session_id`.
4. **Cashfree Checkout**: Frontend passes the `payment_session_id` into the `@cashfreepayments/cashfree-js` SDK to open the checkout modal securely without leaving the site.
5. **Redirection & Polling**: Upon payment completion or cancellation, the user is redirected to `/book/status`. The page polls `/api/checkout/status`, which actively queries `Cashfree.PGFetchOrder` for instant reconciliation or gracefully times out after 30 seconds if the user abandoned the session.
6. **Webhook & Proactive Confirmation (Background)**: Cashfree concurrently triggers `POST /api/webhooks/payment` with a cryptographic `x-webhook-signature`. Simultaneously, the polling mechanism may fetch the successful order. Both systems route to a central `lib/fulfillment.ts` module which utilizes an atomic database lock to strictly ensure the appointment status updates to "Confirmed", the **Google Calendar API** blocks the slot, and confirmations are dispatched via **SendGrid** and **Twilio WhatsApp** exactly once.

### 3.2. Automated Reminders Workflow
1. A scheduled cron job (using a free external service like **cron-job.org** due to Vercel Hobby tier limitations) runs every 15 minutes to check for appointments starting in exactly 30 minutes. All time comparisons are performed in **IST (Asia/Kolkata, UTC+5:30)**.
2. For each matching appointment, it triggers the Email and WhatsApp APIs.
3. A 30-minute reminder is dispatched to both the Patient and the Admin (`echoinsightsupport@gmail.com` / `ridhi.mentalhealthpractitioner@gmail.com` / `+91-9910043799`).

### 3.3. Admin Management Workflow
1. Professional logs in via `/admin/login`. Backend issues a secure session token.
2. The **Upcoming Bookings** dashboard fetches future bookings from `/api/admin/bookings`. Admins can cancel these (soft-delete, removes Calendar event).
3. The **Cancelled Bookings** dashboard lists soft-deleted bookings. Admins can revive them to the same slot (with freebusy check) or a new slot. Free bookings can be permanently hard-deleted.
4. The **Reports** view fetches aggregated financial data from `/api/admin/reports`.
5. The **Payments** view acts as a ledger for tracking `SUCCESS`, `PENDING`, and `FAILED` transactions.
6. The professional can search for a user via the frontend search bar, triggering a query `?search=[email/mobile/vpa]`.
7. In **Settings**, the professional can update their UPI-ID, which is saved to the database and immediately utilized for all future payment initializations.

---

## 4. Data Model (Database Schema)

We will use a relational structure hosted on Supabase PostgreSQL, accessed via Prisma ORM. Key tables include:

**`Booking` Table (Replaces Appointment)**
- `id` (String, cuid, PK)
- `sessionType` (String: "free" or "paid")
- `salutation` (String)
- `name` (String)
- `email` (String)
- `mobile` (String)
- `state` (String)
- `district` (String)
- `serviceType` (String, nullable)
- `duration` (String, nullable: "60" or "90")
- `date` (String)
- `time` (String)
- `remarks` (Text, nullable)
- `status` (String: PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `amount` (Int, nullable)
- `paymentStatus` (String: PENDING, SUCCESS, FAILED, etc.)
- `paymentOrderId` (String, nullable)
- `paymentReferenceId` (String, nullable)
- `upiRrn` (String, nullable)
- `customerVpa` (String, nullable)
- `paymentRawResponse` (Json, nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**`CorporateEnquiry` Table**
- `id` (String, cuid, PK)
- `salutation` (String)
- `name` (String)
- `corporateName` (String)
- `email` (String)
- `mobile` (String)
- `state` (String)
- `district` (String)
- `requirementBrief` (Text)
- `status` (String: NEW, CONTACTED, CLOSED)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**`ContactMessage` Table (Replaces Enquiry)**
- `id` (String, cuid, PK)
- `salutation` (String)
- `name` (String)
- `email` (String)
- `mobile` (String)
- `state` (String)
- `district` (String)
- `remarks` (Text)
- `status` (String: UNREAD, READ, RESPONDED)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

## 5. Security Architecture Plan

A comprehensive defense-in-depth strategy is employed across the frontend, serverless backend, database, and integrations to ensure the confidentiality, integrity, and availability of patient data.

### 5.1. Authentication & Authorization (NextAuth & Admin)
- **Identity Provider (IdP)**: Admin authentication relies on Google OAuth 2.0 via `next-auth`, leveraging Google's robust security infrastructure (MFA, suspicious login detection).
- **Strict Access Control**: Application-level authorization uses a strict hardcoded whitelist array during the `signIn` callback, restricting access exclusively to `ridhi.mentalhealthpractitioner@gmail.com` and `echoinsightsupport@gmail.com`.
- **Session Management**: Sessions are managed via JSON Web Tokens (JWT). The tokens are stored in `HttpOnly`, `Secure` (in production), and `SameSite=Lax` cookies, neutralizing Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) vulnerabilities.

### 5.2. Data Security & Database (Supabase PostgreSQL & Prisma)
- **Injection Prevention**: All database interactions go through Prisma ORM. Prisma inherently uses parameterized queries, completely eliminating the risk of SQL Injection attacks.
- **Data Privacy & Compliance**: No highly sensitive Personally Identifiable Information (PII) like raw financial instruments (credit cards, passwords) are stored. Only necessary transaction references (`upiRrn`, `customerVpa`) and booking details are retained.
- **Connection Security**: The backend connects to Supabase over encrypted connections (`postgres://` over TLS). Database credentials (`DATABASE_URL`, `DIRECT_URL`) are isolated as Vercel environment variables.
- **Architecture Isolation**: The database is completely sealed from the public internet client-side. Supabase Row Level Security (RLS) is not required on the client side since all DB queries are exclusively executed within the secure, server-side Next.js API routes (using a service role connection).

### 5.3. API & Endpoint Security (Next.js & Vercel)
- **Server-Side Execution**: `app/api` routes execute on Vercel's isolated Node.js instances. Sensitive keys (Google, Twilio, SMTP, Payment Gateway) are completely hidden from the browser.
- **Webhook Integrity (Payment Gateway)**: The `/api/webhooks/payment` endpoint relies on Cryptographic HMAC Signature Verification. When a specific payment gateway (Razorpay/Cashfree/PhonePe) is finalized, incoming webhook payloads will be verified against a server-side webhook secret to prevent spoofed success events.
- **Cron Job Protection**: Automated endpoints (`/api/cron/heartbeat` and `/api/cron/reminders`) are secured by verifying the `Authorization: Bearer <CRON_SECRET>` header. This ensures only Vercel's internal cron infrastructure can trigger them, preventing public abuse.
- **Concurrency & Idempotency**: Temporary database constraints and logical checks (e.g., verifying `status !== 'SUCCESS'` before updating) ensure idempotent webhook handling and prevent double-booking of the same calendar slot.
- **DDoS Mitigation**: The application is protected by Vercel's Edge Network, which provides automatic out-of-the-box infrastructure DDoS protection. 

### 5.4. Third-Party Integrations Security
- **Google Cloud Integration (Calendar)**: Uses a restricted Google Service Account / OAuth app with scopes strictly limited to Calendar access (`https://www.googleapis.com/auth/calendar`).
- **Communication APIs (Twilio & SendGrid)**: API keys are scoped with least-privilege permissions (send-only), minimizing the blast radius in the unlikely event of a compromise.
- **Reschedule Token Security**: Patient reschedule links utilize cryptographically secure, pseudo-random UUIDs (`crypto.randomUUID()`) generated at booking. The API enforces strict policies (e.g., verifying the token matches the patient's mobile number, limit 1 reschedule, minimum 24-hour notice) before allowing any calendar modifications.

---

## 6. Development Phases
1. **Phase 1: Setup & UI/UX**: Next.js initialization for **Echo & Insight** (echoinsight.in), CSS styling, responsive layouts, brand logo, and dummy data integration.
2. **Phase 2: Admin Panel & Auth**: Database setup (Prisma), secure Admin login, and Settings configuration (UPI-ID).
3. **Phase 3: Public API & Booking**: Google Calendar read-integration, Enquiry API. All slots served in IST (Asia/Kolkata).
4. **Phase 4: Payments & Webhooks**: Payment gateway integration utilizing the dynamic UPI-ID, secure webhook handling.
5. **Phase 5: Admin Dashboard Features**: Build Booking History, upcoming bookings UI, User search, Reporting aggregations, and Manual Admin Booking/Override. The Manual Override form shares the exact same 1:1 visual styling (primary color scheme), date carousel, and strict multi-slot contiguous availability checking as the public booking page. All timestamps displayed in IST.
6. **Phase 6: Notifications & Sync**: Twilio, SendGrid, and Google Calendar write-integration on successful payment. CRON reminders run in IST (UTC+5:30).
7. **Phase 7: Testing & Deployment**: Vercel deployment with custom domain **echoinsight.in**, `TZ=Asia/Kolkata` env var, end-to-end booking tests.
