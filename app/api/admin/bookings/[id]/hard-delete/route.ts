import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Only allow hard delete for free bookings
    if (booking.paymentStatus !== "NOT_APPLICABLE" && booking.sessionType !== "free") {
       return NextResponse.json({ success: false, error: "Cannot delete paid bookings." }, { status: 400 });
    }

    await prisma.booking.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Booking deleted permanently." });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
