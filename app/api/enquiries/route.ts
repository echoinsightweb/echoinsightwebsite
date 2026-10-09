import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendIntimationEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const prisma = new PrismaClient();
const ADMIN_EMAIL = process.env.SMTP_USER || "echoinsightsupport@gmail.com";
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || "+919999999999";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Determine if it's a corporate enquiry or a standard contact message
    if (data.type === "corporate") {
      await prisma.corporateEnquiry.create({
        data: {
          salutation: data.salutation,
          corporateName: data.corporateName,
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          state: data.state,
          district: data.district,
          requirementBrief: data.requirementBrief,
        }
      });
    } else {
      await prisma.contactMessage.create({
        data: {
          salutation: data.salutation,
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          state: data.state,
          district: data.district,
          remarks: data.remarks,
        }
      });
    }

    // Trigger Email/WhatsApp notifications to admin
    const emailSubject = data.type === "corporate" ? `New Corporate Enquiry: ${data.corporateName}` : `New Contact Message: ${data.name}`;
    const emailHtml = data.type === "corporate" 
      ? `<p><strong>Corporate Name:</strong> ${data.corporateName}</p>
         <p><strong>Name:</strong> ${data.salutation} ${data.name}</p>
         <p><strong>Mobile:</strong> ${data.mobile}</p>
         <p><strong>Email:</strong> ${data.email}</p>
         <p><strong>Location:</strong> ${data.district}, ${data.state}</p>
         <p><strong>Requirement:</strong> ${data.requirementBrief}</p>`
      : `<p><strong>Name:</strong> ${data.salutation} ${data.name}</p>
         <p><strong>Mobile:</strong> ${data.mobile}</p>
         <p><strong>Email:</strong> ${data.email}</p>
         <p><strong>Location:</strong> ${data.district}, ${data.state}</p>
         <p><strong>Remarks:</strong> ${data.remarks}</p>`;

    await sendIntimationEmail({
      to: ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });

    const waText = data.type === "corporate" 
      ? `Echo & Insight Admin Alert\nNew Corporate Enquiry from ${data.corporateName}\nName: ${data.name}\nMobile: ${data.mobile}\nReq: ${data.requirementBrief}`
      : `Echo & Insight Admin Alert\nNew Message from ${data.name}\nMobile: ${data.mobile}\nRemarks: ${data.remarks}`;
    
    await sendWhatsAppMessage(ADMIN_WHATSAPP, waText);
    return NextResponse.json({ success: true, message: "Enquiry submitted successfully." });
  } catch (error) {
    console.error("Error submitting enquiry:", error);
    return NextResponse.json({ success: false, error: "Failed to process enquiry." }, { status: 500 });
  }
}
