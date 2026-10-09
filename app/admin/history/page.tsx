import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient, Prisma } from "@prisma/client";

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

export default async function HistoryBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const whereClause: Prisma.BookingWhereInput = {
    status: "CONFIRMED",
    date: { lte: today }
  };

  if (search) {
    whereClause.OR = [
      { mobile: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { customerVpa: { contains: search, mode: "insensitive" } },
      { paymentOrderId: { contains: search, mode: "insensitive" } },
      { upiRrn: { contains: search, mode: "insensitive" } },
      { paymentReferenceId: { contains: search, mode: "insensitive" } }
    ];
  }

  const rawBookings = await prisma.booking.findMany({
    where: whereClause,
    orderBy: [
      { date: "desc" },
      { time: "desc" }
    ]
  });

  // Filter out bookings that are on today's date but the time hasn't passed yet
  const pastBookings = rawBookings.filter(b => b.date < today || (b.date === today && isPastIst(b.date, b.time)));

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-500 mt-2">View all past sessions and audit records.</p>
        </div>
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search mobile, email, VPA, ID..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm">
            Search
          </button>
          {search && (
            <a href="/admin/history" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm flex items-center">
              Clear
            </a>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">Date & Time</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Patient Details</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Service</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Payment Audit</th>
            </tr>
          </thead>
          <tbody>
            {pastBookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No past bookings found matching criteria.</td>
              </tr>
            ) : (
              pastBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{b.date}</div>
                    <div className="text-sm text-gray-500">{b.time} ({b.duration}m)</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{b.name}</div>
                    <div className="text-sm text-gray-500">{b.mobile}</div>
                    <div className="text-sm text-gray-500">{b.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-700">{b.serviceType}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{b.sessionType}</div>
                  </td>
                  <td className="p-4">
                    {b.paymentStatus === "SUCCESS" ? (
                      <div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold mb-2 inline-block">PAID</span>
                        <div className="text-xs text-gray-600 font-mono mt-1">VPA: {b.customerVpa || "N/A"}</div>
                        <div className="text-xs text-gray-600 font-mono mt-0.5">Ref: {b.paymentReferenceId || b.paymentOrderId || "N/A"}</div>
                      </div>
                    ) : b.paymentStatus === "NOT_APPLICABLE" ? (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold">FREE</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">PENDING</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
