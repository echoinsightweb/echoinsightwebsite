import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 mt-2">Manage your practice configurations and payment details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Configuration</h2>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary UPI ID (VPA)</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg bg-gray-50 focus:border-primary-500 outline-none" 
              placeholder="e.g., echoinsight@upi" 
              defaultValue="ridhi.mentalhealthpractitioner@okicici"
            />
            <p className="text-xs text-gray-500 mt-2">All payments via the payment gateway will be routed to this VPA.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
            <input 
              type="email" 
              className="w-full p-3 border rounded-lg bg-gray-50 focus:border-primary-500 outline-none" 
              defaultValue="echoinsightsupport@gmail.com"
            />
          </div>

          <div className="pt-4 border-t">
            <button type="button" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
