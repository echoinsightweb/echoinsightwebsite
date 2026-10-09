import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const mobile = searchParams.get("mobile");

    if (!token || !mobile) {
      return NextResponse.json({ success: false, error: "Missing token or mobile number" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { rescheduleToken: token }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 404 });
    }

    if (booking.mobile !== mobile) {
      return NextResponse.json({ success: false, error: "Mobile number does not match" }, { status: 403 });
    }

    // Check if within 24 hours
    const [year, month, day] = booking.date.split("-").map(Number);
    const [timeVal, modifier] = booking.time.split(" ");
    let [hours, minutes] = timeVal.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    
    const sessionTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    const diffHours = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return NextResponse.json({ success: false, error: "Rescheduling is only allowed up to 24 hours before the session." }, { status: 403 });
    }

    if (booking.rescheduleCount >= 1) {
      return NextResponse.json({ success: false, error: "This booking has already been rescheduled once." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        name: booking.name,
        serviceType: booking.serviceType,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        sessionType: booking.sessionType
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
