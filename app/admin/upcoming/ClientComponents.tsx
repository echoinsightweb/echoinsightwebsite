"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RescheduleActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this reschedule request?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reschedule/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (e) {
      alert("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button 
        onClick={() => handleAction("REJECT")}
        disabled={loading}
        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
      >
        Reject
      </button>
      <button 
        onClick={() => handleAction("APPROVE")}
        disabled={loading}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold shadow-md disabled:opacity-50"
      >
        {loading ? "Processing..." : "Approve Request"}
      </button>
    </div>
  );
}

export function CancelBookingAction({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking? This will remove the Google Calendar event, but the record will remain in the database.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (e) {
      alert("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="text-sm text-red-600 font-medium hover:underline ml-4 disabled:opacity-50"
    >
      {loading ? "Canceling..." : "Cancel Booking"}
    </button>
  );
}
