# Phase-Wise Implementation Plan: Echo & Insight — Professional Booking Website

**Brand**: Echo & Insight | **Domain**: [echoinsight.in](https://echoinsight.in) | **Timezone**: IST (Asia/Kolkata, New Delhi, UTC+5:30)

Based on the system architecture and problem statement, this document outlines the step-by-step development phases to build the Echo & Insight mental healthcare portfolio and appointment booking website.

---

## Phase 1: Setup & UI/UX Foundation [COMPLETED]
**Objective**: Establish the core Next.js project structure, design system, and build all static frontend pages for Echo & Insight (echoinsight.in).
- **Tasks**:
  - Initialize Next.js App Router project with Tailwind CSS (or Vanilla CSS modules). Configure base URL to `echoinsight.in`.
  - Implement global CSS styles, typography (Google Fonts), curated color palettes, and micro-animations.
  - Build public pages: Home (`/`), About (`/about`), and Services (`/services`). Added '100% Online Sessions' badges and messaging to headers.
  - Build the Contact Page (`/contact`) and Corporate Enquiry Page (`/corporate-enquiry`) with strict validation (Salutation dropdown, alphabetic names, exact +91- 10-digit mobile, states/districts dropdown).
  - Build the Book Appointment Page (`/book`) supporting two modes via `?type=free` URL param:
    - **Free 15-min "Know Your Counsellor"** session: no payment, calendar block, email/WhatsApp confirmation.
    - **Paid session**: 60-min and 90-min options only.
    - Includes dynamic 30-day date picker and limits slots between 11:00 AM and 11:00 PM (last slot 9:30 PM).
    - **Multi-Slot Selection & Validation**: Visually highlights 2 or 3 consecutive 30-minute blocks when a 60 or 90-minute session is selected. Strictly validates if the subsequent required contiguous slots are free in Google Calendar; immediately alerts and blocks selection if consecutive availability is broken.
  - Add "Know Your Counsellor" CTA button (linking to `/book?type=free`) on the Home page hero and Services page header.
  - Update all static contact information across the footer and contact pages.

## Phase 2: Database & Admin Authentication [COMPLETED]
**Objective**: Set up the backend data layer and secure the professional's Admin Dashboard.
- **Tasks**:
  - Initialize the database using **Supabase PostgreSQL** and configure **Prisma ORM** (Configured via `.env`).
  - Create the exact database schema models: `Booking`, `CorporateEnquiry`, and `ContactMessage`.
  - Implement a Heartbeat API endpoint (`/api/cron/heartbeat`) and configure Vercel Cron (`vercel.json`) to run every 3 days to bypass Supabase's 7-day inactivity pausing.
  - Set up NextAuth.js with the Google Provider for authentication.
  - Implement middleware to restrict admin login access exclusively to `ridhi.mentalhealthpractitioner@gmail.com` and `echoinsightsupport@gmail.com`.
  - Build the secure Admin Dashboard shell and the `/admin/login` page.

## Phase 3: Public APIs & Booking Sync [COMPLETED]
**Objective**: Handle incoming form submissions and synchronize availability with Google Calendar.
- **Tasks**:
  - Create `POST /api/enquiries` to save contact form submissions to the database.
  - Create `POST /api/appointments` to process new booking requests and save them with a "Pending" status.
  - Integrate the Google Calendar API using the `echoinsightsupport@gmail.com` account (Requires `https://www.googleapis.com/auth/calendar` scope).
  - Create `GET /api/calendar/slots` using the `freebusy` query method to dynamically fetch the professional's events, block out busy times, and serve available 15, 60, and 90-minute slots.
    - 15-min slots are reserved for **Free Introductory Sessions** only.
    - 60 and 90-min slots are for paid sessions (Corporate/Group uses custom duration).
  - Build the Settings configuration page (`/admin/settings`) to securely store and update the target UPI-ID.

## Phase 4: Payments & Webhooks
**Objective**: Facilitate secure UPI payments and handle transaction confirmations.
- **Tasks**:
  - Integrate a Payment Gateway API (e.g., Razorpay, Cashfree, or PhonePe).
  - Create `POST /api/checkout/create-order` to initialize a payment session dynamically routing funds to the configured UPI-ID.
  - Create a secure webhook endpoint `POST /api/webhooks/payment` to listen for real-time payment success or failure events from the gateway.
  - Implement logic to update the Appointment database status from "Pending" to "Confirmed" upon successful payment.

## Phase 5: Admin Dashboard Features & Manual Operations [COMPLETED - Including latest payment/reschedule updates]
**Objective**: Provide the professional with tools to view, manage, and override their practice.
- **Tasks**:
  - Build the "Upcoming Bookings" dashboard view (`/admin/dashboard` / `/admin/upcoming`). Includes a "Cancel Booking" action which performs a soft-delete (status: `CANCELLED`) and removes the Google Calendar event, while keeping the database record intact.
  - Build the "History" view (`/admin/history`) listing all past bookings with full patient details, payment auditing information, and strict time-based filtering to move today's past bookings here.
  - Implement search functionality to allow finding specific users or bookings by Mobile Number, Email ID, or UPI ID.
  - Build the "Cancelled" view (`/admin/cancelled`) listing all cancelled bookings.
    - **Revival Logic**: Admins can revive bookings to the SAME slot (with Google Calendar `freebusy` overlap prevention) or a NEW slot via Manual Booking override. Intimation emails are sent via Nodemailer on cancellation and revival.
    - **Permanent Deletion**: Admins can only permanently hard-delete Free/Dummy bookings (`paymentStatus: NOT_APPLICABLE`). Paid bookings can never be hard-deleted.
  - Build the "Payments" view (`/admin/payments`) acting as a standalone ledger tracking all transactions (`PENDING`, `SUCCESS`, `FAILED`) excluding free sessions.
  - Build the "Reports" view (`/admin/reports`) aggregating booking data dynamically from the database.
  - **Manual Admin Booking & Override**: Create a dynamic form for the admin to manually enter a new booking or edit an existing booking's time slot. Automatically fetches available Google Calendar slots, and implements the exact same 1:1 **brand styling (primary colors), multi-slot visual highlighting effects, date carousel UI, and strict contiguous block availability checking** as the public patient booking page. This ensures a perfectly unified look, logic, and user experience across the application.
  - **Reschedule Management**: Add UI to view user-submitted Reschedule Requests. Allow the admin to "Approve" (patches Google Calendar and updates DB) or "Reject". Also allow the admin to manually override/reschedule any booking without a user request.

## Phase 6: Rescheduling, Notifications & Automated Reminders
**Objective**: Ensure seamless communication with patients, handle reschedule policies, and send reminders.
- **Tasks**:
  - **Rescheduling Workflow**: 
    - Generate a secure `rescheduleToken` on booking creation.
    - Build `/reschedule` public page where users verify their identity (Token + Mobile Number) to request a new slot (checking availability via Google Calendar).
    - Enforce Policy: Minimum 24 hours before session, allowed only once.
    - Add the Reschedule Policy and secure link directly into the Google Calendar Event description at creation.
  - Integrate an Email provider (SendGrid/Nodemailer via `echoinsightsupport@gmail.com`) and the WhatsApp Business API (Twilio).
  - Update `POST /api/enquiries` to trigger real-time Email and WhatsApp alerts to the admin upon form submission.
  - Update the Payment Webhook success handler to:
    1. Write the confirmed appointment to the Google Calendar (blocking the slot).
    2. Send Confirmation Emails & WhatsApp messages to both the Patient and the Admin.
  - Set up a scheduled CRON job (e.g., Vercel Cron or Upstash QStash) running in the **IST timezone (Asia/Kolkata, New Delhi, UTC+5:30)**.
  - Implement the **Reminder Workflow**: Identify appointments starting in exactly 30 minutes (relative to IST) and dispatch automated WhatsApp & Email reminders to the Patient and Admin.

## Phase 7: DevSecOps & Security Hardening
**Objective**: Implement the detailed security architecture to protect patient data and secure the serverless infrastructure.
- **Tasks**:
  - **Authentication & Session Hardening**: Audit the NextAuth configuration to verify that the `signIn` callback strictly rejects unauthorized emails. Ensure JWT session cookies are configured with `HttpOnly`, `Secure` (forced in production), and `SameSite=Lax`.
  - **Database Sealing (Supabase)**: Enforce Supabase Row Level Security (RLS) policies to completely block direct public internet access to the database. Ensure all queries pass exclusively through the secure Vercel Next.js API routes using Prisma's parameterized queries to prevent SQL injection.
  - **Webhook & Cron Security**: Implement Cryptographic HMAC Signature Verification on `/api/webhooks/payment` to block spoofed payment confirmations. Audit all `/api/cron/*` endpoints to strictly enforce `Authorization: Bearer <CRON_SECRET>` validation.
  - **Secrets Management**: Audit `.env` configurations to ensure no critical API keys (Google Calendar, Twilio, SMTP, Payment Gateway) are exposed to the frontend (avoiding `NEXT_PUBLIC_` prefixes on backend secrets). Ensure least-privilege scoping on the Google Service Account.
  - **Rate Limiting & Abuse Prevention**: Leverage Vercel's Edge Network for infrastructure DDoS protection. Evaluate and implement application-level rate limiting (e.g., via Upstash Redis) on public endpoints like `/api/enquiries` and `/api/reschedule/request` to prevent spam and abuse.

## Phase 8: Testing, Verification & Deployment
**Objective**: Finalize the application, ensure robust error handling, and push to production.
- **Tasks**:
  - Perform End-to-End (E2E) testing of the entire booking and payment flow.
  - Verify that Google Calendar synchronization works under concurrent load (preventing double-bookings).
  - Test Admin login restrictions and verify the accuracy of dashboard reporting data.
  - Deploy the application to Vercel with the custom domain **echoinsight.in**.
  - Configure production environment variables (API keys, Database URLs, Webhook secrets).
  - Set `TZ=Asia/Kolkata` (IST, UTC+5:30) in Vercel environment variables to ensure all server-side timestamps and CRON jobs reference New Delhi time.
