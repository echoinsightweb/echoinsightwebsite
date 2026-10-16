import { NextResponse } from "next/server";
import { calendar } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // e.g., "2026-10-20"

    if (!dateStr) {
      return NextResponse.json({ success: false, error: "Date parameter is required" }, { status: 400 });
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    const istStart = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+05:30`;
    const istEnd = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59+05:30`;

    // 1. Fetch busy blocks from Database (Confirmed or Pending sessions)
    const dbBookings = await prisma.booking.findMany({
      where: {
        date: dateStr,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    const busyTimes: { start: string; end: string }[] = dbBookings.map((b) => {
      const [y, m, d] = b.date.split("-").map(Number);
      const [timeVal, modifier] = b.time.split(" ");
      let [hours, minutes] = timeVal.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const istSlotString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
      const slotStart = new Date(istSlotString);
      const durationMins = parseInt(b.duration || "60");
      const slotEnd = new Date(slotStart.getTime() + durationMins * 60000);

      return {
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      };
    });

    // 2. Query Google Calendar freebusy if credentials are valid
    try {
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: new Date(istStart).toISOString(),
          timeMax: new Date(istEnd).toISOString(),
          timeZone: "Asia/Kolkata",
          items: [{ id: "primary" }],
        },
      });

      const googleBusyBlocks = response.data.calendars?.primary?.busy || [];
      for (const block of googleBusyBlocks) {
        if (block.start && block.end) {
          busyTimes.push({
            start: new Date(block.start as string).toISOString(),
            end: new Date(block.end as string).toISOString(),
          });
        }
      }
    } catch (calendarError: any) {
      console.warn("Google Calendar freebusy unavailable (falling back to database slots):", calendarError?.message || calendarError);
    }

    return NextResponse.json({ success: true, busyTimes });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch slots" }, { status: 500 });
  }
}
