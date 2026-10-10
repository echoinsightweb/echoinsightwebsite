import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Echo & Insight | Professional Mental Health Practice",
  description: "Echo & Insight offers professional mental healthcare, compassionate therapy, and confidential consultations. Book your appointment today at echoinsight.in.",
  metadataBase: new URL("https://echoinsight.in"),
  openGraph: {
    title: "Echo & Insight | Professional Mental Health Practice",
    description: "Compassionate, evidence-based therapy and mental healthcare. Book your appointment online.",
    url: "https://echoinsight.in",
    siteName: "Echo & Insight",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow pt-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-secondary-900 text-secondary-50 py-12 mt-20 border-t border-secondary-500/20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary-100">Echo &amp; Insight</h3>
              <p className="text-secondary-500 mb-4 max-w-sm">
                Providing compassionate, professional, and evidence-based mental healthcare to help you navigate life&apos;s challenges. Visit us at <a href="https://echoinsight.in" className="text-primary-400 hover:text-primary-300 transition-colors">echoinsight.in</a>.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-100">Quick Links</h4>
              <div className="flex flex-col gap-2 text-secondary-500">
                <Link href="/services" className="hover:text-white transition-colors">Therapy Services</Link>
                <Link href="/book" className="hover:text-white transition-colors">Book a Session</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
                <Link href="/admin/login" className="hover:text-white transition-colors">Professional Portal</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-100">Contact</h4>
              <div className="text-secondary-500 space-y-2">
                <p>Email: ridhi.mentalhealthpractitioner@gmail.com</p>
                <p>Phone: +91-9910043799</p>
                <p>Hours: Mon-Sat, 11:00 AM - 11:00 PM</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-secondary-500/20 text-center text-sm text-secondary-500">
            &copy; {new Date().getFullYear()} Echo &amp; Insight &mdash; <a href="https://echoinsight.in" className="hover:text-primary-400 transition-colors">echoinsight.in</a>. All rights reserved.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
