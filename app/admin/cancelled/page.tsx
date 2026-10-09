import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { CancelledActions } from "./ClientComponents";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function CancelledBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const cancelledBookings = await prisma.booking.findMany({
    where: { status: "CANCELLED" },
    orderBy: [
      { date: "desc" },
      { time: "desc" }
    ]
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cancelled Bookings</h1>
        <p className="text-gray-500 mt-2">View all bookings that have been cancelled. You can revive them or permanently delete test/free bookings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">Date & Time</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Patient Details</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Payment Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cancelledBookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No cancelled bookings found.</td>
              </tr>
            ) : (
              cancelledBookings.map((b) => {
                const isFree = b.paymentStatus === "NOT_APPLICABLE" || b.sessionType === "free";

                return (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-red-50/50 transition-colors bg-red-50/20">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 line-through opacity-70">{b.date}</div>
                      <div className="text-sm text-gray-500 line-through opacity-70">{b.time} ({b.duration}m)</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{b.name}</div>
                      <div className="text-sm text-gray-500">{b.mobile}</div>
                      <div className="text-sm text-gray-500">{b.email}</div>
                      <div className="text-xs font-medium text-gray-700 mt-1 uppercase">{b.serviceType}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold block w-max">CANCELLED</span>
                      {b.paymentStatus === "SUCCESS" && (
                        <div className="mt-2 text-xs text-gray-600 font-mono">
                          Refund Review: {b.paymentReferenceId || "N/A"}
                        </div>
                      )}
                    </td>
                    <td className="p-4 flex justify-end">
                      <CancelledActions bookingId={b.id} isFree={isFree} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
