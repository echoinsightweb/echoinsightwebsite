import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Echo & Insight",
  description: "Privacy Policy detailing how Echo & Insight handles user data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-primary-900">Privacy Policy</h1>
      
      <div className="prose prose-lg text-secondary-700 max-w-none space-y-6">
        <p><em>Last Updated: October 2026</em></p>
        
        <p>
          Echo & Insight ("we", "us", or "our") respects your privacy and is committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
          website (echoinsight.in) and use our mental healthcare services.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">1. Confidentiality in Therapy</h2>
        <p>
          As a mental health practice, <strong>confidentiality is our highest priority</strong>. What you discuss during 
          your therapy sessions remains strictly confidential between you and your therapist. We will not disclose your 
          clinical records or session details to any third party without your explicit written consent, except where 
          required by law (e.g., risk of severe harm to self/others, or a court order).
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">2. Information We Collect</h2>
        <p>When you use our website or book an appointment, we may collect the following data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Identification Data:</strong> Name, age, email address, phone number.</li>
          <li><strong>Booking Data:</strong> Appointment dates, service types, and optional remarks you provide.</li>
          <li><strong>Financial Data:</strong> We do not store your credit card or bank details. Payment processing is handled entirely by our secure third-party payment gateway (Cashfree). We only store transaction reference IDs for reconciliation.</li>
        </ul>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Schedule and manage your appointments.</li>
          <li>Communicate with you regarding your bookings (e.g., sending meeting links via Email/WhatsApp).</li>
          <li>Send important notices regarding changes to our policies or services.</li>
          <li>Process payments and handle any potential disputes.</li>
        </ul>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your personal data from 
          unauthorized access, disclosure, alteration, or destruction. All data transmission over our website is encrypted 
          using SSL technology.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">5. Third-Party Services</h2>
        <p>
          We use trusted third-party service providers (such as Google Calendar, SendGrid, Twilio, and Cashfree) to 
          facilitate our services. These third parties have access to your personal data only to perform specific tasks 
          on our behalf and are obligated not to disclose or use it for any other purpose.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">6. Your Rights</h2>
        <p>
          You have the right to request access to the personal data we hold about you, request corrections to any inaccurate 
          data, or request the deletion of your data (subject to legal and professional record-keeping requirements).
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">7. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
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
