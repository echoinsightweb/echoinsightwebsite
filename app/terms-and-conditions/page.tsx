import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Echo & Insight",
  description: "Terms and Conditions for using Echo & Insight website and services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-primary-900">Terms & Conditions</h1>
      
      <div className="prose prose-lg text-secondary-700 max-w-none space-y-6">
        <p><em>Last Updated: October 2026</em></p>
        
        <p>
          Welcome to Echo & Insight ("echoinsight.in", "we", "us", or "our"). By accessing our website and using our 
          services, you agree to be bound by the following Terms & Conditions. Please read them carefully.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">1. Nature of Services</h2>
        <p>
          Echo & Insight provides professional mental health counseling and therapy services. Our services are intended 
          to support emotional well-being and personal growth. 
        </p>
        <p className="font-bold text-red-600">
          We do not provide emergency medical services. If you are experiencing a medical emergency, acute crisis, 
          or having thoughts of self-harm, please contact your local emergency services or a crisis helpline immediately.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">2. User Eligibility</h2>
        <p>
          By booking a session or using this website, you represent that you are at least 18 years of age. If you are 
          under 18, you may only use our services with the explicit consent and involvement of a parent or legal guardian.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">3. Bookings and Payments</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>All appointments must be booked through the website.</li>
          <li>Payments are processed securely via our designated payment gateway.</li>
          <li>A booking is only confirmed once the full payment has been successfully received.</li>
          <li>Prices are subject to change without prior notice, though any already confirmed bookings will be honored at the original price.</li>
        </ul>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">4. Code of Conduct</h2>
        <p>
          We are committed to providing a safe, respectful, and non-judgmental environment. Any form of harassment, 
          abuse, or inappropriate behavior towards the therapist will result in the immediate termination of the session 
          without a refund, and may lead to a permanent ban from our services.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">5. Intellectual Property</h2>
        <p>
          The content, layout, design, data, databases, and graphics on this website are protected by intellectual 
          property laws and are owned by Echo & Insight. You may not reproduce, download, transmit, or distribute 
          any content from this website without our prior written consent.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">6. Limitation of Liability</h2>
        <p>
          While we strive to provide the highest standard of care, Echo & Insight shall not be liable for any direct, 
          indirect, incidental, or consequential damages arising out of the use or inability to use our services or website.
        </p>

        <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">7. Contact Information</h2>
        <p>For any queries regarding these terms, please contact us:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Email:</strong> <a href="mailto:echoinsightsupport@gmail.com" className="text-primary-600 hover:text-primary-800 transition-colors">echoinsightsupport@gmail.com</a></li>
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
