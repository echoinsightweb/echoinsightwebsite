"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RescheduleContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("+91-");
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  
  const [busySlots, setBusySlots] = useState<{start: string, end: string}[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (newDate) {
      setFetchingSlots(true);
      setNewTime(""); // Reset time when date changes
      fetch(`/api/calendar/slots?date=${newDate}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBusySlots(data.busyTimes);
          }
          setFetchingSlots(false);
        })
        .catch(() => setFetchingSlots(false));
    }
  }, [newDate]);


  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage("Invalid or missing token.");
      return;
    }
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/reschedule/verify?token=${token}&mobile=${encodeURIComponent(mobile)}`);
      const data = await res.json();

      if (data.success) {
        setBookingInfo(data.booking);
        setStep(2);
        setStatus("idle");
      } else {
        setErrorMessage(data.error || "Verification failed. Please check your mobile number.");
        setStatus("error");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      setStatus("error");
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/reschedule/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, mobile, newDate, newTime })
      });
      const data = await res.json();

      if (data.success) {
        setStep(3);
        setStatus("success");
      } else {
        setErrorMessage(data.error || "Failed to submit request.");
        setStatus("error");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      setStatus("error");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex justify-center bg-gray-50 dark:bg-secondary-900">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h1>
          <p className="text-gray-600 dark:text-gray-400">
            This reschedule link is invalid or missing. Please use the exact link provided in your calendar invitation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 bg-gray-50 dark:bg-secondary-900">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white dark:bg-secondary-800 rounded-3xl p-8 md:p-10 shadow-2xl border border-secondary-500/10">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reschedule Session</h1>
            <p className="text-secondary-500 mt-2">Subject to approval and minimum 24-hours notice.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
              {errorMessage}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleVerify} className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium mb-2">Verify Mobile Number</label>
                <input
                  required type="tel" value={mobile}
                  onChange={e => {
                    let val = e.target.value;
                    if (!val.startsWith("+91-")) val = "+91-" + val.replace(/^\+91-?/, "");
                    const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                    setMobile("+91-" + digitsOnly);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-secondary-500/30 bg-transparent focus:border-primary-500 outline-none"
                  placeholder="+91-9910043799"
                />
                <p className="text-xs text-secondary-500 mt-2">Enter the mobile number you used during booking.</p>
              </div>
              <button
                type="submit" disabled={status === "loading"}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 disabled:opacity-70 transition-all"
              >
                {status === "loading" ? "Verifying..." : "Verify Identity"}
              </button>
            </form>
          )}

          {step === 2 && bookingInfo && (
            <form onSubmit={handleRescheduleSubmit} className="space-y-8 animate-slide-up">
              <div className="p-5 rounded-2xl bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-500/20">
                <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-4">Current Booking</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-secondary-500 mb-1">Patient</span>
                    <strong className="text-lg">{bookingInfo.name}</strong>
                  </div>
                  <div>
                    <span className="block text-secondary-500 mb-1">Service</span>
                    <strong className="text-lg">{bookingInfo.serviceType}</strong>
                  </div>
                  <div>
                    <span className="block text-secondary-500 mb-1">Date</span>
                    <strong className="text-lg">{bookingInfo.date}</strong>
                  </div>
                  <div>
                    <span className="block text-secondary-500 mb-1">Time</span>
                    <strong className="text-lg">{bookingInfo.time} ({bookingInfo.duration} mins)</strong>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Select New Date & Time</h3>
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-2 px-2 mb-6">
                  {availableDates.map((dateObj) => {
                    const { dateStr, dayName, dayNum, monthName } = dateObj;
                    const isSelected = newDate === dateStr;
                    return (
                      <button
                        key={dateStr} type="button"
                        onClick={() => setNewDate(dateStr)}
                        className={`snap-start shrink-0 w-[4.5rem] py-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                          isSelected ? "bg-primary-600 border-primary-600 text-white shadow-lg scale-105" : "bg-white dark:bg-secondary-900 border-secondary-500/20 hover:border-primary-500/50"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold opacity-80">{dayName}</span>
                        <span className="text-2xl font-black my-0.5">{dayNum}</span>
                        <span className="text-[10px] font-semibold opacity-80 uppercase">{monthName}</span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  {!newDate ? (
                    <div className="p-4 rounded-xl border border-dashed border-secondary-500/30 text-center text-sm text-secondary-500">
                      Select a date to view available time slots.
                    </div>
                  ) : fetchingSlots ? (
                    <div className="p-6 rounded-xl border border-dashed border-primary-300 bg-primary-50 text-center text-primary-600 text-sm animate-pulse">
                      Checking calendar availability...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(() => {
                        const [y, m, dayVal] = newDate.split('-');
                        const selectedD = new Date(parseInt(y), parseInt(m)-1, parseInt(dayVal));
                        if (selectedD.getDay() === 0) {
                          return <div className="col-span-full text-secondary-500 italic">Closed on Sundays.</div>;
                        }
                        
                        const slotsToRender: string[] = [];
                        for (let hour = 11; hour <= 21; hour++) {
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const h = hour > 12 ? hour - 12 : hour;
                          const hourStr = h < 10 ? `0${h}` : `${h}`;
                          slotsToRender.push(`${hourStr}:00 ${ampm}`);
                          if (hour !== 21) slotsToRender.push(`${hourStr}:30 ${ampm}`);
                        }

                        const durationMins = bookingInfo.sessionType === "free" ? 15 : parseInt(bookingInfo.duration);

                        const validSlots = slotsToRender.filter(slot => {
                          const [timeVal, modifier] = slot.split(" ");
                          let [hours, minutes] = timeVal.split(":").map(Number);
                          if (modifier === "PM" && hours < 12) hours += 12;
                          if (modifier === "AM" && hours === 12) hours = 0;
                          
                          const slotStart = new Date(parseInt(y), parseInt(m)-1, parseInt(dayVal), hours, minutes);
                          const slotEnd = new Date(slotStart.getTime() + durationMins * 60000);

                          const isOverlap = busySlots.some(b => {
                            const bStart = new Date(b.start);
                            const bEnd = new Date(b.end);
                            return slotStart < bEnd && slotEnd > bStart;
                          });
                          
                          const isPast = slotStart < new Date();
                          return !isOverlap && !isPast;
                        });

                        if (validSlots.length === 0) {
                          return <div className="col-span-full text-secondary-500 italic py-4">No available slots for this date.</div>;
                        }

                        return validSlots.map((slot) => {
                          const isSelected = newTime === slot;
                          return (
                            <button
                              key={slot} type="button"
                              onClick={() => setNewTime(slot)}
                              className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border ${
                                isSelected ? "bg-primary-600 border-primary-600 text-white shadow-md" : "border-secondary-500/20 hover:border-primary-500/50"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
                <input type="text" required value={newDate} className="opacity-0 w-0 h-0 absolute pointer-events-none" readOnly tabIndex={-1} />
                <input type="text" required value={newTime} className="opacity-0 w-0 h-0 absolute pointer-events-none" readOnly tabIndex={-1} />
              </div>

              <button
                type="submit" disabled={status === "loading" || !newDate || !newTime}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-500 disabled:opacity-70 transition-all shadow-lg shadow-primary-500/25"
              >
                {status === "loading" ? "Submitting..." : "Submit Reschedule Request"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-12 animate-slide-up">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Request Submitted</h2>
              <p className="text-secondary-500 max-w-md mx-auto">
                Your reschedule request for {newDate} at {newTime} has been submitted to the admin for approval. You will receive an updated calendar invitation once approved.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ReschedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 pb-12 flex justify-center text-gray-500">Loading...</div>}>
      <RescheduleContent />
    </Suspense>
  );
}
