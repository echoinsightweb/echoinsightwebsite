import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const contactMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" }
  });

  const corporateEnquiries = await prisma.corporateEnquiry.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enquiries & Messages</h1>
        <p className="text-gray-500 mt-2">Manage all contact submissions and corporate requests.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Contact Messages */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Messages</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[600px] overflow-y-auto">
            {contactMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No messages found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {contactMessages.map((msg) => (
                  <div key={msg.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{msg.name}</h3>
                      <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {msg.email} • {msg.mobile} • {msg.state}, {msg.district}
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {msg.remarks}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Corporate Enquiries */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Corporate Enquiries</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[600px] overflow-y-auto">
            {corporateEnquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No corporate enquiries found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {corporateEnquiries.map((enq) => (
                  <div key={enq.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{enq.corporateName}</h3>
                        <p className="text-sm text-gray-500">Contact: {enq.name}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(enq.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {enq.email} • {enq.mobile} • {enq.state}, {enq.district}
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {enq.requirementBrief}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
