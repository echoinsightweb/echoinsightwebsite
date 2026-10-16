"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 glass-nav transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 hover:opacity-90 transition-opacity" aria-label="Echo & Insight Home">
          <Image
            src="/new_logo.png"
            alt="Echo & Insight Logo"
            width={765}
            height={713}
            quality={100}
            className="h-14 md:h-16 w-auto object-contain"
            priority
          />
          <div className="flex flex-col justify-center">
            <span className="font-serif text-xl sm:text-2xl md:text-[1.65rem] font-semibold tracking-tight text-primary-800 dark:text-primary-100 leading-none">
              Echo &amp; Insight
            </span>
            <span className="text-[8px] sm:text-[9.5px] md:text-[10.5px] font-medium tracking-[0.25em] text-secondary-500 dark:text-secondary-400 uppercase mt-1 select-none">
              COUNSELLING &amp; WELLBEING
            </span>
          </div>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center font-medium">
          <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-primary-500 transition-colors">About</Link>
          <Link href="/services" className="hover:text-primary-500 transition-colors">Services</Link>
          <Link href="/contact" className="hover:text-primary-500 transition-colors">Contact</Link>
          <Link href="/book" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5">
            Book Appointment
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-primary-600"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-6 flex flex-col gap-4 animate-slide-up">
          <Link onClick={() => setIsOpen(false)} href="/" className="text-lg font-medium hover:text-primary-600">Home</Link>
          <Link onClick={() => setIsOpen(false)} href="/about" className="text-lg font-medium hover:text-primary-600">About</Link>
          <Link onClick={() => setIsOpen(false)} href="/services" className="text-lg font-medium hover:text-primary-600">Services</Link>
          <Link onClick={() => setIsOpen(false)} href="/contact" className="text-lg font-medium hover:text-primary-600">Contact</Link>
          <div className="pt-2 border-t border-gray-100">
            <Link onClick={() => setIsOpen(false)} href="/book" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-full font-medium w-full text-center mt-2">
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
