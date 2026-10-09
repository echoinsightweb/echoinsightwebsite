import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateBookingEvent } from "@/lib/google-calendar";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json(); // "APPROVE" or "REJECT"
    const { id: bookingId } = await params;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    if (action === "REJECT") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          rescheduleStatus: "REJECTED",
          rescheduleRequestedDate: null,
          rescheduleRequestedTime: null,
        }
      });
      // Admin should ideally email the patient to inform them manually or we integrate sendgrid
      return NextResponse.json({ success: true, message: "Request rejected" });
    }

    if (action === "APPROVE") {
      if (!booking.rescheduleRequestedDate || !booking.rescheduleRequestedTime || !booking.googleEventId) {
        return NextResponse.json({ success: false, error: "Missing required reschedule details or Google Event ID" }, { status: 400 });
      }

      const [year, month, day] = booking.rescheduleRequestedDate.split("-").map(Number);
      const [timeVal, modifier] = booking.rescheduleRequestedTime.split(" ");
      let [hours, minutes] = timeVal.split(":").map(Number);
      
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const istString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
      const startDateTime = new Date(istString);
      const isFree = booking.sessionType === "free";
      const durationMins = isFree ? 15 : parseInt(booking.duration || "60");
      const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);
      
      const startTimeISO = startDateTime.toISOString();
      const endTimeISO = endDateTime.toISOString();

      // 1. Patch Google Calendar (This automatically sends the new invite)
      const calRes = await updateBookingEvent({
        eventId: booking.googleEventId,
        startTime: startTimeISO,
        endTime: endTimeISO,
      });

      if (!calRes.success) {
        return NextResponse.json({ success: false, error: "Failed to update Google Calendar" }, { status: 500 });
      }

      // 2. Update DB
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          date: booking.rescheduleRequestedDate,
          time: booking.rescheduleRequestedTime,
          rescheduleCount: booking.rescheduleCount + 1,
          rescheduleStatus: "APPROVED",
          rescheduleRequestedDate: null,
          rescheduleRequestedTime: null,
        }
      });

      return NextResponse.json({ success: true, message: "Reschedule approved and calendar updated" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
