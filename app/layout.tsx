import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

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
        {/* Navigation */}
        <header className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity" aria-label="Echo & Insight Home">
              <Image
                src="/new_logo.png"
                alt="Echo & Insight Logo"
                width={288}
                height={96}
                quality={100}
                className="h-20 md:h-24 w-auto object-contain mix-blend-multiply dark:mix-blend-normal"
                priority
              />
              <span className="text-xl font-bold tracking-tight text-primary-600 hidden sm:block">Echo &amp; Insight</span>
            </Link>
            <nav className="hidden md:flex gap-8 items-center font-medium">
              <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-primary-500 transition-colors">About</Link>
              <Link href="/services" className="hover:text-primary-500 transition-colors">Services</Link>
              <Link href="/contact" className="hover:text-primary-500 transition-colors">Contact</Link>
              <Link href="/book" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5">
                Book Appointment
              </Link>
            </nav>
            {/* Mobile Menu Button - simplified for layout */}
            <button className="md:hidden p-2 text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </header>

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
      </body>
    </html>
  );
}
