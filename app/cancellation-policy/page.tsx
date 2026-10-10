import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Echo & Insight",
  description: "Cancellation and Refund Policy for Echo & Insight mental health services.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-primary-900">Cancellation & Refund Policy</h1>
      
      <div className="prose prose-lg text-secondary-700 max-w-none space-y-6">
        <p>
          At Echo & Insight, we value your time and the commitment you make to your mental health. 
          When you book a session, we reserve that time exclusively for you. Therefore, we have established 
          the following cancellation and refund policy.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">1. Session Rescheduling</h2>
        <p>
          We understand that unforeseen circumstances may arise. You may request to reschedule a booked session 
          <strong> exactly once</strong> without any penalty, provided that the request is made at least 
          <strong> 24 hours prior</strong> to the scheduled start time of the session.
        </p>
        <p>
          Reschedule requests made within 24 hours of the session start time will not be accepted, and the 
          session will be considered confirmed.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">2. Cancellations & No-Shows</h2>
        <p>
          We do not offer direct cancellations or refunds for booked and paid sessions. If you are unable to 
          attend your session, you must utilize the reschedule option mentioned above (with a minimum of 24 hours' notice).
        </p>
        <p>
          If you fail to attend the session at the scheduled time ("no-show") or attempt to cancel within 24 hours 
          of the session, the session will be marked as completed, and the full fee will be forfeited. No refunds 
          will be issued under these circumstances.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">3. Therapist Cancellations</h2>
        <p>
          In the rare event that the therapist (Ridhi) needs to cancel or postpone a session due to an emergency 
          or unforeseen circumstances, you will be notified as soon as possible. In such cases, you will be offered 
          the choice of rescheduling the session to a mutually convenient time or receiving a full refund.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">4. Refunds for Failed Transactions</h2>
        <p>
          If your payment fails during the booking process but money is deducted from your bank account, the 
          payment gateway will automatically initiate a refund to your original payment method. This typically 
          takes 5-7 business days depending on your bank.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">5. Contact Us</h2>
        <p>
          If you have any questions regarding this policy or need assistance with your booking, please reach out to us:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Email:</strong> ridhi.mentalhealthpractitioner@gmail.com</li>
          <li><strong>Phone:</strong> +91-9910043799</li>
        </ul>

        <div className="mt-12 pt-8 border-t border-secondary-200">
          <Link href="/" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">
            &larr; Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
