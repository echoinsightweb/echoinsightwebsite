import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const today = new Date().toISOString().split("T")[0];

  const todaysAppointmentsCount = await prisma.booking.count({
    where: { date: today, status: "CONFIRMED" }
  });

  const newEnquiriesCount = await prisma.corporateEnquiry.count({
    where: { status: "NEW" }
  });

  const pendingPaymentsCount = await prisma.booking.count({
    where: { paymentStatus: "PENDING", status: "PENDING" }
  });

  const recentActivity = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, {session.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Today's Appointments</h3>
          <p className="text-3xl font-bold text-gray-900">{todaysAppointmentsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">New Enquiries</h3>
          <p className="text-3xl font-bold text-gray-900">{newEnquiriesCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Payments</h3>
          <p className="text-3xl font-bold text-gray-900">{pendingPaymentsCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="flex flex-col gap-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No recent activity found.</p>
            </div>
          ) : (
            recentActivity.map(booking => (
              <div key={booking.id} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-bold text-gray-800">New Booking: {booking.name}</p>
                  <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                </div>
                <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                  {booking.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
