// Google Calendar API Helper Utility
// Adheres strictly to Google REST API v3 and OAuth integration guidelines

// Standard Client-ID for OAuth2 in this sandbox environment.
// Users can configure their own or use the platform's default flow.
const CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || "33682855140-everdocs-oauth-demo.apps.googleusercontent.com";

// Scopes required for Calendar access
export const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly"
];

export interface CalendarEventInput {
  summary: string;
  description: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  attendeeEmail: string;
  attendeeName: string;
  hostEmail?: string;
}

/**
 * Initiates the Google OAuth2 Implicit Flow on the client to obtain an Access Token.
 * This ensures compliance with standard secure browser-based popup or redirect authorization.
 */
export function initiateGoogleOAuth(redirectPath?: string) {
  const path = redirectPath || "/help-desk";
  const redirectUri = window.location.origin + path;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  
  authUrl.searchParams.append("client_id", CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "token");
  authUrl.searchParams.append("scope", CALENDAR_SCOPES.join(" "));
  authUrl.searchParams.append("prompt", "select_account");
  
  // Set state to handle return redirect
  localStorage.setItem("google_oauth_pending_booking", "true");
  
  window.location.href = authUrl.toString();
}

/**
 * Parse and retrieve the access token from the URL hash fragment if present (e.g., redirect redirect callback)
 */
export function checkAndSaveAccessToken(): string | null {
  const hash = window.location.hash;
  if (!hash) return localStorage.getItem("google_calendar_access_token");

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get("access_token");
  const error = params.get("error");

  if (accessToken) {
    localStorage.setItem("google_calendar_access_token", accessToken);
    // Set expiration time (Google defaults to 3600 seconds)
    const expiresIn = parseInt(params.get("expires_in") || "3600");
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem("google_calendar_token_expiry", expiryTime.toString());
    
    // Clean up hash from URL bar
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return accessToken;
  }

  if (error) {
    console.error("OAuth error:", error);
  }

  return localStorage.getItem("google_calendar_access_token");
}

/**
 * Returns a valid token or null if expired or missing
 */
export function getActiveGoogleToken(): string | null {
  const token = localStorage.getItem("google_calendar_access_token");
  const expiry = localStorage.getItem("google_calendar_token_expiry");
  
  if (!token) return null;
  
  if (expiry) {
    const expired = Date.now() > parseInt(expiry);
    if (expired) {
      logoutGoogle();
      return null;
    }
  }
  
  return token;
}

export function logoutGoogle() {
  localStorage.removeItem("google_calendar_access_token");
  localStorage.removeItem("google_calendar_token_expiry");
  localStorage.removeItem("google_oauth_pending_booking");
}

/**
 * Fetch calendar events for a specific day from the user's primary calendar 
 * to determine busy blocks and prevent double booking.
 */
export async function fetchCalendarBusySlots(accessToken: string, dateStr: string): Promise<{ start: string; end: string }[]> {
  try {
    const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();
    
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.append("timeMin", timeMin);
    url.searchParams.append("timeMax", timeMax);
    url.searchParams.append("singleEvents", "true");
    url.searchParams.append("orderBy", "startTime");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Google API returned code ${res.status}`);
    }

    const data = await res.json();
    return (data.items || []).map((ev: any) => ({
      start: ev.start?.dateTime || ev.start?.date,
      end: ev.end?.dateTime || ev.end?.date,
    }));
  } catch (error) {
    console.error("Failed to query Google Calendar freebusy/events:", error);
    return [];
  }
}

/**
 * High-craft function to schedule a real Calendar Event with a dynamically generated
 * Google Meet conference video channel link.
 */
export async function createGoogleCalendarEvent(accessToken: string, event: CalendarEventInput) {
  const eventDetails = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
    end: {
      dateTime: event.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
    attendees: [
      { email: event.attendeeEmail, displayName: event.attendeeName },
      ...(event.hostEmail ? [{ email: event.hostEmail }] : [])
    ],
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet"
        }
      }
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 15 }
      ]
    }
  };

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  // Request Google Meet creation parameter
  url.searchParams.append("conferenceDataVersion", "1");
  url.searchParams.append("sendUpdates", "all");

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventDetails),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar create event failed: ${errText}`);
  }

  const result = await res.json();
  
  return {
    eventId: result.id,
    htmlLink: result.htmlLink,
    meetLink: result.conferenceData?.entryPoints?.find((item: any) => item.entryPointType === "video")?.uri || null
  };
}
