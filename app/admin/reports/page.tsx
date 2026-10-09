import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const bookings = await prisma.booking.findMany({
    where: { status: "CONFIRMED" }
  });

  const totalBookings = bookings.length;
  const freeSessions = bookings.filter(b => b.sessionType === "free").length;
  const paidSessions = bookings.filter(b => b.sessionType === "paid").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount ? b.amount / 100 : 0), 0); // assuming amount is in smallest currency unit

  const serviceBreakdown = bookings.reduce((acc, b) => {
    const s = b.serviceType || "Unknown Service";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-2">Aggregate booking data and revenue analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Confirmed Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Paid Sessions</h3>
          <p className="text-3xl font-bold text-gray-900">{paidSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Free Sessions</h3>
          <p className="text-3xl font-bold text-gray-900">{freeSessions}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Service Breakdown</h2>
        <div className="grid gap-4">
          {Object.entries(serviceBreakdown).length === 0 ? (
            <p className="text-gray-500">No data available.</p>
          ) : (
            Object.entries(serviceBreakdown).map(([service, count]) => (
              <div key={service} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{service}</span>
                <span className="font-bold text-gray-900">{count} bookings</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
