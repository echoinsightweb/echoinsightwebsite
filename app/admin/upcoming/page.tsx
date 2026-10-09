import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { RescheduleActions, CancelBookingAction } from "./ClientComponents";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

function isPastIst(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
  const bookingDate = new Date(dateString);
  return bookingDate < new Date();
}

export default async function UpcomingBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  // Fetch upcoming and confirmed bookings
  const rawBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      date: { gte: today }
    },
    orderBy: [
      { date: "asc" },
      { time: "asc" }
    ]
  });

  // Filter out the bookings that are from today but the time has already passed
  const bookings = rawBookings.filter(b => b.date > today || (b.date === today && !isPastIst(b.date, b.time)));

  const rescheduleRequests = bookings.filter(b => b.rescheduleStatus === "REQUESTED");

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Bookings</h1>
          <p className="text-gray-500 mt-2">Manage your schedule and approve reschedule requests.</p>
        </div>
      </div>

      {rescheduleRequests.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Action Required: Reschedule Requests
          </h2>
          <div className="grid gap-4">
            {rescheduleRequests.map(req => (
              <div key={req.id} className="bg-orange-50 border border-orange-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg">{req.salutation} {req.name}</h3>
                  <p className="text-sm text-gray-600">{req.mobile} • {req.serviceType}</p>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="text-gray-500 line-through">
                      Old: {req.date} at {req.time}
                    </div>
                    <div className="font-bold text-orange-700">
                      New: {req.rescheduleRequestedDate} at {req.rescheduleRequestedTime}
                    </div>
                  </div>
                </div>
                <RescheduleActions bookingId={req.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmed Schedule</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Patient Details</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Service</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No upcoming bookings found.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{b.date}</div>
                      <div className="text-sm text-gray-500">{b.time} ({b.duration}m)</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{b.name}</div>
                      <div className="text-sm text-gray-500">{b.mobile}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">{b.serviceType}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{b.sessionType}</div>
                    </td>
                    <td className="p-4 text-right">
                      <a href={`/admin/manual-booking?overrideId=${b.id}`} className="text-sm text-blue-600 font-medium hover:underline">
                        Manual Override
                      </a>
                      <CancelBookingAction bookingId={b.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
