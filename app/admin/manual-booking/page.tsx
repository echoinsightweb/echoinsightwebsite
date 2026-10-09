"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ManualBookingForm() {
  const searchParams = useSearchParams();
  const overrideId = searchParams.get("overrideId");

  const [formData, setFormData] = useState({
    salutation: "Mr.",
    name: "",
    mobile: "+91-",
    email: "",
    serviceType: "Mental Health & Emotional Well-Being",
    date: "",
    time: "",
    duration: "60",
    paymentStatus: "SUCCESS",
    remarks: ""
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "fetching">("idle");
  const [busySlots, setBusySlots] = useState<{start: string, end: string}[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [availableDates, setAvailableDates] = useState<{dateStr: string, dayName: string, dayNum: number, monthName: string}[]>([]);

  useEffect(() => {
    // Generate dates: today up to 60 days in the future
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
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

  useEffect(() => {
    if (overrideId) {
      setStatus("fetching");
      fetch(`/api/admin/bookings/${overrideId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.booking) {
            setFormData({
              salutation: data.booking.salutation,
              name: data.booking.name,
              mobile: data.booking.mobile,
              email: data.booking.email,
              serviceType: data.booking.serviceType,
              date: data.booking.date,
              time: data.booking.time,
              duration: data.booking.duration,
              paymentStatus: data.booking.paymentStatus,
              remarks: data.booking.remarks || "",
            });
            setStatus("idle");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    }
  }, [overrideId]);

  useEffect(() => {
    if (formData.date) {
      setFetchingSlots(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/manual-booking", {
        method: overrideId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, overrideId })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        if (!overrideId) {
          setFormData({
            salutation: "Mr.", name: "", mobile: "+91-", email: "", serviceType: "Mental Health & Emotional Well-Being",
            date: "", time: "", duration: "60", paymentStatus: "SUCCESS", remarks: ""
          });
        }
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "fetching") return <div className="p-8">Loading booking details...</div>;

  const isOverride = !!overrideId;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{isOverride ? "Override Booking Time" : "Create Manual Booking"}</h1>
        <p className="text-gray-500 mt-2">
          {isOverride ? "Modify the date, time, and remarks of an existing booking. This will update Google Calendar immediately." : "Add a session booked offline or over the phone. This will automatically sync to Google Calendar."}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {status === "success" && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-green-800 font-bold text-lg mb-1">{isOverride ? "Booking Updated!" : "Booking Created!"}</h3>
              <p className="text-green-700">{isOverride ? "The session time has been changed and calendar updated." : "The session has been saved and the Google Calendar invite has been sent."}</p>
            </div>
            {!isOverride && (
              <button onClick={() => setStatus("idle")} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                Create Another
              </button>
            )}
            {isOverride && (
              <a href="/admin/upcoming" className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                Back to Upcoming
              </a>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
            Failed to process request. Please check the network tab or try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Details */}
          <div>
            <h3 className="text-lg font-bold mb-4 pb-2 border-b">1. Patient Details {isOverride && <span className="text-red-500 text-sm font-normal ml-2">(Locked)</span>}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                <div className="flex gap-2">
                  <select
                    disabled={isOverride}
                    value={formData.salutation}
                    onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                    className="w-24 p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none disabled:opacity-50"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss">Miss</option>
                  </select>
                  <input
                    disabled={isOverride}
                    required type="text" value={formData.name}
                    onChange={e => {
                      const alphabetsOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFormData({ ...formData, name: alphabetsOnly });
                    }}
                    className="flex-1 p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none disabled:opacity-50" placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                <input
                  disabled={isOverride}
                  required type="tel" value={formData.mobile}
                  onChange={e => {
                    let val = e.target.value;
                    if (!val.startsWith("+91-")) val = "+91-" + val.replace(/^\+91-?/, "");
                    const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobile: "+91-" + digitsOnly });
                  }}
                  pattern="^\+91-[0-9]{10}$" maxLength={14} title="Must be exactly 10 digits after +91-"
                  className="w-full p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none disabled:opacity-50" placeholder="+91-9999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  disabled={isOverride}
                  required type="email" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                  className="w-full p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none disabled:opacity-50" placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div>
            <h3 className="text-lg font-bold mb-4 pb-2 border-b">2. Session Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type * {isOverride && <span className="text-red-500 text-sm font-normal">(Locked)</span>}</label>
                <select disabled={isOverride} required value={formData.serviceType} onChange={e => setFormData({ ...formData, serviceType: e.target.value })} className="w-full p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none disabled:opacity-50">
                  <option value="Life Skills Counselling">Life Skills Counselling</option>
                  <option value="Relationship Counselling">Relationship Counselling</option>
                  <option value="Mental Health & Emotional Well-Being">Mental Health & Emotional Well-Being</option>
                  <option value="Parental & Child Behaviour Counselling">Parental & Child Behaviour Counselling</option>
                  <option value="Emotional & Communication Counselling">Emotional & Communication Counselling</option>
                  <option value="Introductory Session">Introductory Session (Free)</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-2 px-2">
                  {availableDates.length === 0 ? (
                    <div className="text-sm text-gray-500 py-4 px-2">Loading calendar...</div>
                  ) : availableDates.map((dateObj) => {
                    const { dateStr, dayName, dayNum, monthName } = dateObj;
                    const isSelected = formData.date === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, date: dateStr, time: "" }))}
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
              </div>

              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
                {!formData.date ? (
                  <div className="p-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-500 text-sm">
                    Please select a date first to view available time slots.
                  </div>
                ) : fetchingSlots ? (
                  <div className="p-6 rounded-xl border border-dashed border-blue-300 bg-blue-50 text-center text-blue-500 text-sm animate-pulse">
                    Checking calendar availability...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(() => {
                      try {
                        const [y, m, dayVal] = formData.date.split('-');
                        const selectedD = new Date(parseInt(y), parseInt(m)-1, parseInt(dayVal));
                        
                        const slotsToRender: string[] = [];
                        for (let hour = 11; hour <= 21; hour++) {
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const h = hour > 12 ? hour - 12 : hour;
                          const hourStr = h < 10 ? `0${h}` : `${h}`;
                          slotsToRender.push(`${hourStr}:00 ${ampm}`);
                          if (hour !== 21) slotsToRender.push(`${hourStr}:30 ${ampm}`);
                        }

                        const durationMins = formData.duration === "15" ? 15 : parseInt(formData.duration);
                        const baseDuration = durationMins === 15 ? 15 : 30;

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

                          // For admin manual bookings, we can optionally allow booking past slots of today,
                          // but to be safe, let's filter past slots out unless it's the overridden slot.
                          const isPast = slotStart < new Date();
                          
                          return !isOverlap && (!isPast || (isOverride && formData.time === slot));
                        });

                        // Inject original slot if this is an override, even if it's in the past or overlapping (it overlaps with itself)
                        if (isOverride && formData.time && !availableBlocks.includes(formData.time)) {
                          availableBlocks.unshift(formData.time);
                        }

                        if (availableBlocks.length === 0) {
                          return <div className="col-span-full text-gray-500 italic py-4">No available slots for this date.</div>;
                        }

                        const requiredBlocks = durationMins === 15 ? 1 : durationMins / 30;
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
                              // If it's the override slot itself, we allow it even if it's technically overlapping itself
                              const isSelfOverride = isOverride && highlightedSlots.includes(nextSlot);
                              if (!nextSlot || (!availableBlocks.includes(nextSlot) && !isSelfOverride)) {
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
                          const isPrimary = formData.time === slot;
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration * {isOverride && <span className="text-red-500 text-sm font-normal">(Locked)</span>}</label>
                <select disabled={isOverride} required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value, time: "" })} className="w-full p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none disabled:opacity-50">
                  <option value="15">15 Minutes (Free)</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status {isOverride && <span className="text-red-500 text-sm font-normal">(Locked)</span>}</label>
                <select disabled={isOverride} required value={formData.paymentStatus} onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none disabled:opacity-50">
                  <option value="SUCCESS">Paid Online / Gateway Success</option>
                  <option value="OFFLINE">Paid Offline / Cash / Direct UPI</option>
                  <option value="NOT_APPLICABLE">Not Applicable (Free Session)</option>
                  <option value="PENDING">Pending Payment</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Remarks / Context (Optional)</label>
            <textarea rows={3} value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full p-3 border rounded-lg bg-gray-50 focus:border-blue-500 outline-none resize-none" placeholder="Any internal notes or context..."></textarea>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={status === "loading" || fetchingSlots}
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-70 flex items-center shadow-lg"
            >
              {status === "loading" ? "Processing Sync..." : isOverride ? "Update Time & Calendar" : "Create Booking & Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManualBookingPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading form...</div>}>
      <ManualBookingForm />
    </Suspense>
  );
}
