"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Trash2 } from "lucide-react";

export function CancelledActions({ bookingId, isFree }: { bookingId: string, isFree: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRevive = async () => {
    const keepSameSlot = confirm("Do you want to revive this booking in the SAME time slot?\n\n• Click OK to revive in the SAME slot.\n• Click Cancel to manually pick a NEW slot.");
    
    if (!keepSameSlot) {
      router.push(`/admin/manual-booking?overrideId=${bookingId}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/revive`, {
        method: "POST"
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.refresh();
      } else if (data.error === "SLOT_UNAVAILABLE") {
        alert("The original time slot is no longer available (it has been booked by someone else). You will now be redirected to select a new slot.");
        router.push(`/admin/manual-booking?overrideId=${bookingId}`);
      } else {
        alert("Failed to revive booking: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this free booking? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/hard-delete`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete booking.");
      }
    } catch (e) {
      alert("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={handleRevive}
        disabled={loading}
        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-xs font-semibold disabled:opacity-50 transition"
      >
        <RefreshCcw className="w-3 h-3" />
        {loading ? "Reviving..." : "Revive Booking"}
      </button>

      {isFree && (
        <button 
          onClick={handleHardDelete}
          disabled={loading}
          className="flex items-center justify-center gap-1 px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md text-xs font-medium disabled:opacity-50 transition"
        >
          <Trash2 className="w-3 h-3" />
          {loading ? "Deleting..." : "Delete Permanently"}
        </button>
      )}
    </div>
  );
}
