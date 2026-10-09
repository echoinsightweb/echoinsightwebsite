import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createBookingEvent } from "@/lib/google-calendar";
import crypto from "crypto";

const prisma = new PrismaClient();

const RESCHEDULE_POLICY_TEXT = `
---
RESCHEDULE POLICY:
You may request to reschedule this session exactly once.
Reschedule requests must be made at least 24 hours prior to the session start time and are subject to approval.
To request a reschedule, click this secure link:
https://echoinsight.in/reschedule?token=
`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const isFree = data.duration === "15";

    const rescheduleToken = crypto.randomUUID();

    const [year, month, day] = data.date.split("-").map(Number);
    const [timeVal, modifier] = data.time.split(" ");
    let [hours, minutes] = timeVal.split(":").map(Number);
    
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const istString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
    const startDateTime = new Date(istString);
    const durationMins = isFree ? 15 : parseInt(data.duration);
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);
    
    const startTimeISO = startDateTime.toISOString();
    const endTimeISO = endDateTime.toISOString();

    const amount = isFree ? 0 : data.duration === "90" ? 200000 : 150000;

    // 1. Save to Database
    const booking = await prisma.booking.create({
      data: {
        sessionType: isFree ? "free" : "paid",
        salutation: data.salutation,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        state: "N/A", // Admin doesn't need to enter state/district for offline bookings
        district: "N/A",
        serviceType: data.serviceType,
        duration: data.duration,
        date: data.date,
        time: data.time,
        remarks: data.remarks,
        status: "CONFIRMED", // Manual bookings are instantly confirmed
        paymentStatus: data.paymentStatus,
        amount,
        rescheduleToken,
      }
    });

    const description = `${isFree ? "Free Introductory" : `Paid (${data.duration} mins)`} Session manually booked by Admin.\n\nPatient Details:\nName: ${data.salutation} ${data.name}\nPhone: ${data.mobile}\nService: ${data.serviceType}\nRemarks: ${data.remarks || "None"}\n${RESCHEDULE_POLICY_TEXT}${rescheduleToken}`;

    // 2. Create Google Calendar Event
    const calendarRes = await createBookingEvent({
      patientEmail: data.email,
      patientName: `${data.salutation} ${data.name}`,
      startTime: startTimeISO,
      endTime: endTimeISO,
      summary: `Echo & Insight: Session with ${data.name}`,
      description,
    });

    if (calendarRes.success && calendarRes.eventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: calendarRes.eventId }
      });
    } else {
      console.error("Failed to sync manual session to calendar:", calendarRes.error);
    }
    
    return NextResponse.json({
      success: true,
      message: "Booking created and calendar invite sent.",
    });

  } catch (error) {
    console.error("Error creating manual booking:", error);
    return NextResponse.json({ success: false, error: "Failed to process booking" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.overrideId) return NextResponse.json({ success: false, error: "Missing overrideId" }, { status: 400 });

    const existingBooking = await prisma.booking.findUnique({ where: { id: data.overrideId } });
    if (!existingBooking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    const [year, month, day] = data.date.split("-").map(Number);
    const [timeVal, modifier] = data.time.split(" ");
    let [hours, minutes] = timeVal.split(":").map(Number);
    
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const istString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
    const startDateTime = new Date(istString);
    const durationMins = existingBooking.sessionType === "free" ? 15 : parseInt(existingBooking.duration || "60");
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);
    
    const startTimeISO = startDateTime.toISOString();
    const endTimeISO = endDateTime.toISOString();

    // 1. Patch Google Calendar
    if (existingBooking.googleEventId) {
      const { updateBookingEvent } = await import("@/lib/google-calendar");
      await updateBookingEvent({
        eventId: existingBooking.googleEventId,
        startTime: startTimeISO,
        endTime: endTimeISO,
      });
    }

    // 2. Update Database
    await prisma.booking.update({
      where: { id: data.overrideId },
      data: {
        date: data.date,
        time: data.time,
        remarks: data.remarks,
        status: "CONFIRMED", // Make sure it revives if it was cancelled
      }
    });

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully.",
    });

  } catch (error) {
    console.error("Error updating manual booking:", error);
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}
