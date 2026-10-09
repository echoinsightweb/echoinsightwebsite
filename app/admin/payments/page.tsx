import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const payments = await prisma.booking.findMany({
    where: { 
      sessionType: "paid"
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payments Ledger</h1>
        <p className="text-gray-500 mt-2">Track all pending, successful, and failed payment transactions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">Generated On</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Patient</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Reference / VPA</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No payment records found.</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{new Date(p.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.mobile}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {p.amount ? `₹${(p.amount / 100).toLocaleString()}` : "-"}
                  </td>
                  <td className="p-4">
                    {p.paymentStatus === "SUCCESS" ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">SUCCESS</span>
                    ) : p.paymentStatus === "FAILED" ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">FAILED</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">PENDING</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-mono text-gray-600">VPA: {p.customerVpa || "N/A"}</div>
                    <div className="text-xs font-mono text-gray-600 mt-1">Ref: {p.paymentReferenceId || p.paymentOrderId || "N/A"}</div>
                    <div className="text-xs font-mono text-gray-400 mt-1">Booking: {p.id.slice(-6)}</div>
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
