import { NextResponse } from "next/server";
import { calendar } from "@/lib/google-calendar";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // e.g., "2023-11-20"

    if (!dateStr) {
      return NextResponse.json({ success: false, error: "Date parameter is required" }, { status: 400 });
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    const istStart = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+05:30`;
    const istEnd = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59+05:30`;
    
    // Use the freebusy API to check availability
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(istStart).toISOString(),
        timeMax: new Date(istEnd).toISOString(),
        timeZone: "Asia/Kolkata",
        items: [{ id: "primary" }],
      },
    });

    const busyBlocks = response.data.calendars?.primary?.busy || [];

    // Format busy blocks for the frontend
    const busyTimes = busyBlocks.map(block => ({
      start: new Date(block.start as string),
      end: new Date(block.end as string)
    }));

    return NextResponse.json({ success: true, busyTimes });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch slots" }, { status: 500 });
  }
}
