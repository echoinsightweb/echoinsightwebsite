"use client";

import { useState } from "react";
import Link from "next/link";

export default function CorporateEnquiryPage() {
  const [formData, setFormData] = useState({
    salutation: "Mr.",
    name: "",
    email: "",
    mobile: "+91-",
    corporateName: "",
    state: "",
    district: "",
    requirementBrief: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry",
  ];

  const delhiDistricts = [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi",
    "South West Delhi", "West Delhi",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "corporate" })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/20 blur-[100px]" />
      </div>

      <section className="container-custom max-w-4xl relative z-10">
        <div className="text-center mb-10 animate-slide-down">
          <Link href="/services" className="inline-flex items-center text-sm font-semibold text-secondary-500 hover:text-primary-600 mb-6 transition-colors">
            ← Back to Services
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
            Corporate &amp; Group <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">Workshops</span>
          </h1>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
            Partner with us to foster a culture of well-being. Fill out the form below and we will get back to you with a customized proposal.
          </p>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-3xl shadow-xl overflow-hidden border border-secondary-500/10">
          <div className="p-8 md:p-12">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Enquiry Submitted!</h2>
                <p className="text-lg text-secondary-500 mb-8 max-w-md mx-auto">
                  Thank you for your interest. Our team will review your requirements and reach out to you shortly.
                </p>
                <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-xl font-bold transition-all hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/25">
                  Return to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Contact Person Name *</label>
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
                      <input
                        required type="text" id="name" value={formData.name}
                        onChange={e => {
                          const alphabetsOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                          setFormData({ ...formData, name: alphabetsOnly });
                        }}
                        pattern="^[A-Za-z\s]+$"
                        title="Name must contain only alphabets and spaces"
                        className="flex-1 px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="corporateName" className="block text-sm font-medium mb-2">Corporate / Organization Name *</label>
                    <input
                      required type="text" id="corporateName" value={formData.corporateName}
                      onChange={e => setFormData({ ...formData, corporateName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Work Email Address *</label>
                    <input
                      required type="email" id="email" value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                      title="Please enter a valid email address (e.g., john@example.com)"
                      className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                      placeholder="john@acme.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium mb-2">Mobile Number *</label>
                    <input
                      required type="tel" id="mobile" value={formData.mobile}
                      onChange={e => {
                        let val = e.target.value;
                        if (!val.startsWith("+91-")) val = "+91-" + val.replace(/^\+91-?/, "");
                        const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, mobile: "+91-" + digitsOnly });
                      }}
                      pattern="^\+91-[0-9]{10}$"
                      maxLength={14}
                      title="Must be exactly 10 digits after +91-"
                      className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                      placeholder="+91-9999999999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-2">State *</label>
                    <select
                      required id="state" value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value, district: "" })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-foreground appearance-none"
                    >
                      <option value="" disabled>Select a State</option>
                      {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {formData.state === "Delhi" && (
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium mb-2">District (New Delhi) *</label>
                      <select
                        required id="district" value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-foreground appearance-none"
                      >
                        <option value="" disabled>Select a District</option>
                        {delhiDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="requirementBrief" className="block text-sm font-medium mb-2">Requirement Brief *</label>
                  <textarea
                    required id="requirementBrief" rows={5} value={formData.requirementBrief}
                    onChange={e => setFormData({ ...formData, requirementBrief: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                    placeholder="Tell us about the objectives, audience size, preferred dates, and any specific topics you'd like covered..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/25 cursor-pointer"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending Enquiry...
                      </span>
                    ) : (
                      "Send Enquiry \u2192"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
