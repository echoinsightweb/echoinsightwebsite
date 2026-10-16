"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    salutation: "Mr.",
    name: "",
    state: "",
    district: "",
    mobile: "+91-",
    email: "",
    remarks: ""
  });

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
  ];

  const delhiDistricts = [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
  ];
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "contact" })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setFormData({ salutation: "Mr.", name: "", state: "", district: "", mobile: "+91-", email: "", remarks: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="pt-24 pb-12 bg-secondary-50 dark:bg-secondary-900 border-b border-secondary-500/10">
        <div className="max-w-7xl mx-auto px-6 text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">Have a question or need assistance? Fill out the form below and our team will get back to you shortly.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Details */}
          <div className="space-y-12 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6 text-secondary-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <a href="mailto:echoinsightsupport@gmail.com" className="hover:text-primary-600 transition-colors">
                      echoinsightsupport@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.08-7.074-6.97l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p>+91-9910043799</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Location</h3>
                    <p>New Delhi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-8 border border-secondary-500/20">
              <h2 className="text-xl font-bold mb-4">Business Hours</h2>
              <ul className="space-y-2 text-secondary-500">
                <li className="flex justify-between"><span>Monday - Friday</span> <span>11:00 AM - 11:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday</span> <span>11:00 AM - 11:00 PM</span></li>
                <li className="flex justify-between text-secondary-400"><span>Sunday</span> <span>Closed</span></li>
              </ul>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-8 md:p-10 shadow-2xl border border-secondary-500/10 animate-slide-up animation-delay-200">
            <h2 className="text-2xl font-bold mb-6">Send an Enquiry</h2>
            
            {status === "success" ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Message Sent Successfully!</h3>
                <p>We'll get back to you as soon as possible.</p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-green-700 underline font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Name & Surname *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.salutation}
                      onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                      className="w-24 px-3 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-foreground appearance-none cursor-pointer"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Mx.">Mx.</option>
                    </select>
                    <input required type="text" id="name" value={formData.name} onChange={e => {
                      const alphabetsOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFormData({...formData, name: alphabetsOnly});
                    }} pattern="^[A-Za-z\s]+$" title="Name must contain only alphabets and spaces" className="flex-1 w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" placeholder="John Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium mb-2">Mobile No. *</label>
                    <input required type="tel" id="mobile" value={formData.mobile} onChange={e => {
                      let val = e.target.value;
                      if (!val.startsWith("+91-")) val = "+91-" + val.replace(/^\+91-?/, "");
                      const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, mobile: "+91-" + digitsOnly});
                    }} 
                    pattern="^\+91-[0-9]{10}$" maxLength={14} title="Must be exactly 10 digits after +91-"
                    className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" placeholder="+91-9910043799" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address *</label>
                    <input required type="email" id="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}" title="Please enter a valid email address (e.g., john@example.com)"
                    className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-2">State *</label>
                    <select required id="state" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, district: ""})} className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-foreground appearance-none">
                      <option value="" disabled>Select a State</option>
                      {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                  {formData.state === "Delhi" && (
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium mb-2">District *</label>
                      <select required id="district" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-foreground appearance-none">
                        <option value="" disabled>Select a District</option>
                        {delhiDistricts.map(district => <option key={district} value={district}>{district}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium mb-2">Remarks / Message</label>
                  <textarea id="remarks" rows={4} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={status === "loading"}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
