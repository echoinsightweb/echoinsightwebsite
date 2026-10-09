import { google } from "googleapis";

// Initialize the Google OAuth2 Client
// We use OAuth2 with a Refresh Token because creating Google Meet links requires 
// user consent, which a Service Account cannot provide for a standard @gmail.com account.
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  // Redirect URI is not strictly needed for background tasks if we already have the refresh token
  process.env.NEXTAUTH_URL // Using site URL as a placeholder
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
});

export const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export async function createBookingEvent({
  patientEmail,
  patientName,
  startTime, // ISO string
  endTime, // ISO string
  summary,
  description,
}: {
  patientEmail: string;
  patientName: string;
  startTime: string;
  endTime: string;
  summary: string;
  description: string;
}) {
  try {
    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: startTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endTime,
        timeZone: "Asia/Kolkata",
      },
      attendees: [
        { email: patientEmail, displayName: patientName },
        { email: "echoinsightsupport@gmail.com", displayName: "Echo & Insight" },
        { email: "ridhi.mentalhealthpractitioner@gmail.com", displayName: "Ridhi" }
      ],
      // Request Google Meet Link generation
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary", // Uses echoinsightsupport@gmail.com primary calendar
      requestBody: event,
      conferenceDataVersion: 1, // Crucial for generating Meet link
      sendUpdates: "all", // Crucial: Tells Google to send the email invite to the patient!
    });

    return {
      success: true,
      eventId: response.data.id,
      meetLink: response.data.hangoutLink,
      eventData: response.data,
    };
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return {
      success: false,
      error,
    };
  }
}

export async function updateBookingEvent({
  eventId,
  startTime,
  endTime,
}: {
  eventId: string;
  startTime: string;
  endTime: string;
}) {
  try {
    const event = {
      start: {
        dateTime: startTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endTime,
        timeZone: "Asia/Kolkata",
      },
    };

    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId: eventId,
      requestBody: event,
      sendUpdates: "all", // Triggers email update to patient
    });

    return { success: true, eventData: response.data };
  } catch (error) {
    console.error("Error updating Google Calendar event:", error);
    return { success: false, error };
  }
}

