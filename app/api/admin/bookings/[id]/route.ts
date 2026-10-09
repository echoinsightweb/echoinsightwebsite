import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { calendar } from "@/lib/google-calendar";
import { sendIntimationEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Try to delete from Google Calendar if it exists
    if (booking.googleEventId) {
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: booking.googleEventId,
          sendUpdates: "all", // This triggers the cancellation email to the patient natively by Google
        });
      } catch (calError) {
        console.error("Failed to delete event from Google Calendar:", calError);
      }
    }

    // Soft delete: keep the record but mark as cancelled
    await prisma.booking.update({ 
      where: { id },
      data: { status: "CANCELLED" }
    });

    // Send custom cancellation intimation email via Nodemailer
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Booking Cancelled</h2>
        <p>Dear ${booking.salutation} ${booking.name},</p>
        <p>This email is to inform you that your upcoming session on <strong>${booking.date}</strong> at <strong>${booking.time}</strong> has been cancelled.</p>
        <p>If this cancellation was made in error or if you have any questions, please contact us.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>Echo & Insight Support</strong></p>
      </div>
    `;

    await sendIntimationEmail({
      to: booking.email,
      subject: "Update: Your Session at Echo & Insight has been Cancelled",
      html: emailHtml,
    });

    return NextResponse.json({ success: true, message: "Booking cancelled successfully." });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
