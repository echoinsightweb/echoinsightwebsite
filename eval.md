# Evaluation Plan: Echo & Insight Website

This document serves as a checklist and evaluation plan to ensure all requirements outlined in the `ImplementationPlan-Website.md` are met.

## Phase 1: Setup & UI/UX Foundation
- [ ] Next.js App Router project initialized with Tailwind CSS (or Vanilla CSS modules).
- [ ] Base URL configured to `echoinsight.in`.
- [ ] Global CSS styles, Google Fonts typography, curated color palettes, and micro-animations implemented.
- [ ] Home (`/`), About (`/about`), and Services (`/services`) pages built and rendering correctly.
- [ ] '100% Online Sessions' badges and messaging present in headers.
- [ ] Contact Page (`/contact`) built with strict validation (Salutation, alphabetic names, +91 10-digit mobile, state/district dropdown).
- [ ] Corporate Enquiry Page (`/corporate-enquiry`) built with strict validation.
- [ ] Book Appointment Page (`/book`) supports `?type=free` for 15-min "Know Your Counsellor" session (no payment, calendar block, confirmations).
- [ ] Book Appointment Page supports 60-min and 90-min paid sessions.
- [ ] Dynamic 30-day date picker limits slots between 11:00 AM and 11:00 PM (last slot 9:30 PM).
- [ ] "Know Your Counsellor" CTA button on Home page hero and Services page header links to `/book?type=free`.
- [ ] Static contact information updated across footer and contact pages.

## Phase 2: Database & Admin Authentication
- [ ] Supabase PostgreSQL database initialized and Prisma ORM configured.
- [ ] Database schema models created exactly as specified: `Booking`, `CorporateEnquiry`, and `ContactMessage`.
- [ ] Heartbeat API endpoint created (`/api/cron/heartbeat`) and `vercel.json` configured to prevent Supabase inactivity pausing.
- [ ] NextAuth.js configured with Google Provider.
- [ ] Middleware restricts admin login access to `ridhi.mentalhealthpractitioner@gmail.com` exclusively.
- [ ] Secure Admin Dashboard shell and `/admin/login` page built.

## Phase 3: Public APIs & Booking Sync
- [ ] `POST /api/enquiries` endpoint successfully saves contact form submissions to the database.
- [ ] `POST /api/appointments` endpoint processes and saves new booking requests with "Pending" status.
- [ ] Google Calendar API read functionality integrated.
- [ ] `GET /api/calendar/slots` fetches events, blocks busy times, and serves available 15, 60, and 90-minute slots.
- [ ] 15-min slots strictly reserved for Free Introductory Sessions; 60/90-min strictly for paid sessions.
- [ ] Settings configuration page (`/admin/settings`) securely stores/updates the target UPI-ID.

## Phase 4: Payments & Webhooks
- [ ] Payment Gateway API (e.g., Razorpay, Cashfree, or PhonePe) successfully integrated.
- [ ] `POST /api/checkout/create-order` initializes payment session dynamically routing to configured UPI-ID.
- [ ] Secure webhook `POST /api/webhooks/payment` listens for real-time payment success/failure events.
- [ ] Appointment database status automatically updates from "Pending" to "Confirmed" upon successful payment.

## Phase 5: Admin Dashboard Features
- [ ] "Upcoming Bookings" dashboard view (`/admin/dashboard`) built and displays data correctly.
- [ ] "History" view (`/admin/history`) lists all past bookings with full patient details and payment auditing information (RRN, VPA).
- [ ] Search functionality allows finding users/bookings by Mobile Number, Email ID, or UPI ID (Customer VPA) accurately.
- [ ] "Reports" view (`/admin/reports`) accurately aggregates revenue relying on the decoupled `paymentStatus` instead of booking status.
- [ ] "Manual Booking & Override" view correctly implements the rich patient booking UI, syncs soft-deletions/updates to Google Calendar, and restricts dates to today/future.

## Phase 6: Notifications & Automated Reminders
- [ ] Email provider (SendGrid/Nodemailer) and WhatsApp Business API (Twilio) integrated.
- [ ] `POST /api/enquiries` triggers real-time Email and WhatsApp alerts to admin upon form submission.
- [ ] Payment Webhook success handler successfully writes confirmed appointments to Google Calendar (blocking slot).
- [ ] Payment Webhook success handler sends Confirmation Emails & WhatsApp messages to Patient and Admin.
- [ ] Scheduled CRON job set up and running in IST timezone.
- [ ] Reminder Workflow accurately dispatches WhatsApp & Email reminders exactly 30 minutes before appointment (relative to IST) to Patient and Admin.

## Phase 7: Testing, Verification & Deployment
- [ ] End-to-End (E2E) testing of the entire booking and payment flow completed without errors.
- [ ] Google Calendar synchronization verified under concurrent load (no double-bookings possible).
- [ ] Admin login restrictions verified (only authorized email can access).
- [ ] Accuracy of dashboard reporting data verified.
- [ ] Application deployed successfully to Vercel with custom domain `echoinsight.in`.
- [ ] Production environment variables configured securely in Vercel.
- [ ] `TZ=Asia/Kolkata` (IST) explicitly set in Vercel environment variables.
