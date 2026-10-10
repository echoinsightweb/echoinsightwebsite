"use client";

import { useState, useEffect } from "react";
import { load } from "@cashfreepayments/cashfree-js";

type SessionType = "free" | "paid";

export default function BookAppointmentPage() {
  const [sessionType, setSessionType] = useState<SessionType>("paid");
  const [availableDates, setAvailableDates] = useState<{dateStr: string, dayName: string, dayNum: number, monthName: string}[]>([]);
  const [busySlots, setBusySlots] = useState<{start: string, end: string}[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);

  useEffect(() => {
    load({ mode: "sandbox" }).then((cf: any) => setCashfree(cf));
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("type") === "free") {
        setSessionType("free");
      }
    }

    // Generate next 30 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      dates.push({
        dateStr: `${year}-${month}-${day}`,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" })
      });
    }
    setAvailableDates(dates);
  }, []);

  const [formData, setFormData] = useState({
    salutation: "Mr.",
    name: "",
    state: "",
    district: "",
    mobile: "+91-",
    email: "",
    serviceType: "",
    duration: "60",
    date: "",
    time: "",
    remarks: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (formData.date) {
      setFetchingSlots(true);
      setFormData(prev => ({ ...prev, time: "" })); // Reset time when date changes
      fetch(`/api/calendar/slots?date=${formData.date}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBusySlots(data.busyTimes);
          }
          setFetchingSlots(false);
        })
        .catch(() => setFetchingSlots(false));
    }
  }, [formData.date]);

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
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sessionType })
      });
      const data = await res.json();
      
      if (data.success) {
        if (sessionType === "free") {
          setStatus("success");
        } else {
          const orderRes = await fetch("/api/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: data.bookingId })
          });
          const orderData = await orderRes.json();
          if (orderData.success && cashfree) {
            cashfree.checkout({
              paymentSessionId: orderData.paymentSessionId,
              redirectTarget: "_self"
            });
          } else {
            setStatus("error");
          }
        }
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const isFree = sessionType === "free";

  return (
    <div className="w-full">
      {/* Hero Header */}
      <section
        className={`pt-24 pb-12 border-b border-secondary-500/10 ${
          isFree
            ? "bg-gradient-to-br from-accent-50 via-primary-50 to-secondary-50 dark:from-accent-900/20 dark:via-primary-900/20 dark:to-secondary-900"
            : "bg-secondary-50 dark:bg-secondary-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 text-center animate-slide-up">
          {isFree && (
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
              </svg>
              Completely Free — No Commitment
            </span>
          )}
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold mb-6 border border-green-200 dark:border-green-800/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            100% Online Sessions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isFree ? "Know Your Counsellor" : "Book an Appointment"}
          </h1>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
            {isFree
              ? "A complimentary 15-minute online session to meet your counsellor, ask your questions, and see if it's the right fit — with zero pressure."
              : "Take the first step towards better mental health. Schedule an online consultation at your convenience."}
          </p>
        </div>

        {/* Session Type Toggle */}
        <div className="max-w-xs mx-auto mt-8 flex rounded-full bg-white dark:bg-secondary-800 border border-secondary-500/20 p-1 shadow-sm">
          <button
            onClick={() => setSessionType("free")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
              isFree ? "bg-primary-600 text-white shadow" : "text-secondary-500 hover:text-foreground"
            }`}
          >
            Free Session
          </button>
          <button
            onClick={() => setSessionType("paid")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
              !isFree ? "bg-primary-600 text-white shadow" : "text-secondary-500 hover:text-foreground"
            }`}
          >
            Book Session
          </button>
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-8 md:p-10 shadow-2xl border border-secondary-500/10 animate-slide-up">

            {isFree && status !== "success" && (
              <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800 flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-primary-800 dark:text-primary-300 text-sm">Disclaimer: Free Session</p>
                  <p className="text-sm text-secondary-600 mt-1">
                    This will be a General Discussion with the Counsellor to discuss your requirements and know the counsellor, but it will <strong className="text-primary-700 dark:text-primary-400">not be a full session.</strong> No payment required.
                  </p>
                </div>
              </div>
            )}

            {status === "success" ? (
              <div className={`p-8 rounded-2xl flex flex-col items-center justify-center text-center ${isFree ? "bg-primary-50 text-primary-700" : "bg-green-50 text-green-700"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mb-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">
                  {isFree ? "Free Session Scheduled!" : "Appointment Requested!"}
                </h3>
                <p className="text-lg">
                  {isFree
                    ? "Your 15-minute introductory session has been booked. We have sent a confirmation to your email. See you soon!"
                    : "We have received your request and will confirm shortly via email."}
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setFormData({ salutation: "Mr.", name: "", state: "", district: "", mobile: "+91-", email: "", serviceType: "", duration: "60", date: "", time: "", remarks: "" });
                  }}
                  className="mt-8 underline font-medium hover:opacity-75 transition-opacity"
                >
                  {isFree ? "Schedule another free session" : "Book another session"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Personal Details */}
                <div>
                  <h3 className="text-xl font-bold mb-6 pb-2 border-b border-secondary-500/20 text-primary-600">
                    1. Personal Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Name &amp; Surname *</label>
                      <div className="flex gap-2">
                        <select
                          value={formData.salutation}
                          onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                          className="w-24 px-3 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all cursor-pointer"
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
                          className="flex-1 px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="mobile" className="block text-sm font-medium mb-2">Mobile No. *</label>
                        <input
                          required type="tel" id="mobile" value={formData.mobile}
                          onChange={e => {
                            let val = e.target.value;
                            if (!val.startsWith("+91-")) val = "+91-" + val.replace(/^\+91-?/, "");
                            const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                            setFormData({ ...formData, mobile: "+91-" + digitsOnly });
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none transition-all"
                          placeholder="+91-9910043799"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address *</label>
                        <input
                          required type="email" id="email" value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium mb-2">State *</label>
                        <select
                          required id="state" value={formData.state}
                          onChange={e => setFormData({ ...formData, state: e.target.value, district: "" })}
                          className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none transition-all"
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
                            className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none transition-all"
                          >
                            <option value="" disabled>Select a District</option>
                            {delhiDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div>
                  <h3 className="text-xl font-bold mb-6 pb-2 border-b border-secondary-500/20 text-primary-600">
                    2. Session Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="serviceType" className="block text-sm font-medium mb-2">Service Type *</label>
                      <select
                        required id="serviceType" value={formData.serviceType}
                        onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none transition-all"
                      >
                        <option value="" disabled>Select a Service</option>
                        <option value="Life Skills Counselling">Life Skills Counselling</option>
                        <option value="Relationship Counselling">Relationship Counselling</option>
                        <option value="Mental Health & Emotional Well-Being">Mental Health & Emotional Well-Being</option>
                        <option value="Parental & Child Behaviour Counselling">Parental & Child Behaviour Counselling</option>
                        <option value="Emotional & Communication Counselling">Emotional & Communication Counselling</option>
                      </select>
                    </div>

                    {isFree ? (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-50 border border-primary-200">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg">15</div>
                        <div>
                          <p className="font-bold text-primary-700">Introductory Session — 15 Minutes</p>
                          <p className="text-sm text-secondary-500 mt-0.5">Complimentary & Free</p>
                        </div>
                        <span className="ml-auto text-2xl font-extrabold text-primary-600">FREE</span>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-3">Consultation Duration &amp; Pricing *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className={`border rounded-xl p-5 cursor-pointer transition-all ${formData.duration === "60" ? "border-primary-500 bg-primary-50 shadow-md" : "border-secondary-500/30 hover:border-primary-500/50"}`}>
                            <input type="radio" name="duration" value="60" checked={formData.duration === "60"} onChange={e => setFormData({ ...formData, duration: e.target.value, time: "" })} className="sr-only" />
                            <div className="font-semibold text-xl text-center mb-1">60 Mins</div>
                            <div className="text-center text-primary-600 font-bold text-2xl">Rs.1500</div>
                          </label>
                          <label className={`border rounded-xl p-5 cursor-pointer transition-all ${formData.duration === "90" ? "border-primary-500 bg-primary-50 shadow-md" : "border-secondary-500/30 hover:border-primary-500/50"}`}>
                            <input type="radio" name="duration" value="90" checked={formData.duration === "90"} onChange={e => setFormData({ ...formData, duration: e.target.value, time: "" })} className="sr-only" />
                            <div className="font-semibold text-xl text-center mb-1">90 Mins</div>
                            <div className="text-center text-primary-600 font-bold text-2xl">Rs.2000</div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Date & Time */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Preferred Date *</label>
                        </div>
                        
                        <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-2 px-2">
                          {availableDates.length === 0 ? (
                            <div className="text-sm text-secondary-500 py-4 px-2">Loading calendar...</div>
                          ) : availableDates.map((dateObj) => {
                            const { dateStr, dayName, dayNum, monthName } = dateObj;
                            const isSelected = formData.date === dateStr;

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, date: dateStr }))}
                                className={`snap-start shrink-0 w-[4.5rem] py-3 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105"
                                    : "bg-white border-secondary-500/20 hover:border-primary-500/50 text-secondary-600 hover:bg-primary-50"
                                }`}
                              >
                                <span className="pointer-events-none text-[10px] uppercase font-bold opacity-80">{dayName}</span>
                                <span className="pointer-events-none text-2xl font-black my-0.5">{dayNum}</span>
                                <span className="pointer-events-none text-[10px] font-semibold opacity-80 uppercase">{monthName}</span>
                              </button>
                            );
                          })}
                        </div>
                        <input type="text" required value={formData.date} className="opacity-0 w-0 h-0 absolute pointer-events-none" readOnly tabIndex={-1} />
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Available Time Slots *</label>
                        {!formData.date ? (
                          <div className="p-6 rounded-xl border border-dashed border-secondary-500/30 bg-secondary-50 text-center text-secondary-500 text-sm">
                            Please select a date first to view available time slots.
                          </div>
                        ) : fetchingSlots ? (
                          <div className="p-6 rounded-xl border border-dashed border-primary-300 bg-primary-50 text-center text-primary-600 text-sm animate-pulse">
                            Checking calendar availability...
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {(() => {
                              try {
                                const [y, m, dayVal] = formData.date.split('-');
                                const selectedD = new Date(parseInt(y), parseInt(m)-1, parseInt(dayVal));
                                const isSunday = selectedD.getDay() === 0;
                                
                                if (isSunday) {
                                  return <div className="col-span-full text-secondary-500 italic py-4">We are closed on Sundays.</div>;
                                }

                                const slotsToRender: string[] = [];
                                for (let hour = 11; hour <= 21; hour++) {
                                  const ampm = hour >= 12 ? 'PM' : 'AM';
                                  const h = hour > 12 ? hour - 12 : hour;
                                  const hourStr = h < 10 ? `0${h}` : `${h}`;
                                  slotsToRender.push(`${hourStr}:00 ${ampm}`);
                                  if (hour !== 21) slotsToRender.push(`${hourStr}:30 ${ampm}`);
                                }

                                const baseDuration = isFree ? 15 : 30;

                                const availableBlocks = slotsToRender.filter(slot => {
                                  const [timeVal, modifier] = slot.split(" ");
                                  let [hours, minutes] = timeVal.split(":").map(Number);
                                  if (modifier === "PM" && hours < 12) hours += 12;
                                  if (modifier === "AM" && hours === 12) hours = 0;
                                  const slotStart = new Date(parseInt(y), parseInt(m)-1, parseInt(dayVal), hours, minutes);
                                  const slotEnd = new Date(slotStart.getTime() + baseDuration * 60000);

                                  const isOverlap = busySlots.some(b => {
                                    const bStart = new Date(b.start);
                                    const bEnd = new Date(b.end);
                                    return slotStart < bEnd && slotEnd > bStart;
                                  });

                                  const isPast = slotStart < new Date();
                                  
                                  return !isOverlap && !isPast;
                                });

                                if (availableBlocks.length === 0) {
                                  return <div className="col-span-full text-secondary-500 italic py-4">No available slots for this date.</div>;
                                }

                                const durationMins = isFree ? 15 : parseInt(formData.duration);
                                const requiredBlocks = isFree ? 1 : durationMins / 30;
                                
                                let highlightedSlots: string[] = [];
                                if (formData.time) {
                                   const startIndex = slotsToRender.indexOf(formData.time);
                                   for(let i=0; i<requiredBlocks; i++) {
                                      if (slotsToRender[startIndex + i]) {
                                          highlightedSlots.push(slotsToRender[startIndex + i]);
                                      }
                                   }
                                }

                                const handleSlotClick = (slot: string) => {
                                   const startIndex = slotsToRender.indexOf(slot);
                                   let canBook = true;
                                   for(let i=0; i<requiredBlocks; i++) {
                                      const nextSlot = slotsToRender[startIndex + i];
                                      if (!nextSlot || !availableBlocks.includes(nextSlot)) {
                                         canBook = false;
                                         break;
                                      }
                                   }
                                   
                                   if (!canBook) {
                                      alert(`Cannot book ${durationMins} minutes starting at ${slot}. The required consecutive time slots are not available. Please choose another time.`);
                                      return;
                                   }
                                   
                                   setFormData(prev => ({ ...prev, time: slot }));
                                };

                                return availableBlocks.map((slot) => {
                                  const isSelected = highlightedSlots.includes(slot);
                                  const isPrimary = slot === formData.time;

                                  return (
                                    <button
                                      key={slot} type="button"
                                      onClick={() => handleSlotClick(slot)}
                                      className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border cursor-pointer flex flex-col items-center justify-center ${
                                        isSelected
                                          ? isPrimary 
                                            ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20" 
                                            : "bg-primary-500 border-primary-500 text-white opacity-75"
                                          : "bg-white border-secondary-500/20 text-secondary-600 hover:border-primary-500/50 hover:bg-primary-50"
                                      }`}
                                    >
                                      <span>{slot}</span>
                                      {isSelected && !isPrimary && <span className="text-[10px] opacity-90 -mt-1 font-normal">(Continuation)</span>}
                                    </button>
                                  );
                                });
                              } catch(e) {
                                return null;
                              }
                            })()}
                          </div>
                        )}
                        <input type="text" required value={formData.time} className="opacity-0 w-0 h-0 absolute pointer-events-none" readOnly tabIndex={-1} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium mb-2">
                    {isFree ? "What would you like to know or share?" : "Any specific concerns you'd like to discuss?"}
                  </label>
                  <textarea
                    id="remarks" rows={4} value={formData.remarks}
                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none resize-none"
                    placeholder={isFree ? "Feel free to ask anything about the counsellor or their approach..." : "Briefly describe what you are looking for help with..."}
                  />
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-secondary-500/20">
                  <button
                    type="submit"
                    disabled={status === "loading" || fetchingSlots}
                    className={`w-full py-4 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center shadow-lg ${
                      isFree
                        ? "bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500"
                        : "bg-primary-600 hover:bg-primary-500"
                    }`}
                  >
                    {status === "loading" ? "Processing..." : isFree ? "Confirm Free Session \u2192" : "Proceed to Payment"}
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
