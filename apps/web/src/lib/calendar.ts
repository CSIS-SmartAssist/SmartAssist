import { google } from "googleapis";
import * as logger from "@/lib/logger";

function getCalendarClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) {
    logger.error("calendar", "GOOGLE_SERVICE_ACCOUNT_JSON is not set");
    throw new Error("Calendar is not configured");
  }
  try {
    const credentials = JSON.parse(raw);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    return google.calendar({ version: "v3", auth });
  } catch (err) {
    logger.error("calendar", err instanceof Error ? err.message : String(err));
    throw err;
  }
}

export async function createCalendarEvent({
  title,
  description,
  startTime,
  endTime,
  location,
}: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
}) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    logger.error("calendar", "GOOGLE_CALENDAR_ID is not set");
    throw new Error("Calendar is not configured");
  }
  const calendar = getCalendarClient();
  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: title,
      description,
      location,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
    },
  });

  return event.data;
}
