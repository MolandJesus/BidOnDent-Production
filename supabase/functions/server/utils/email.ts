/**
 * Email sending utility using Resend.
 *
 * Resend is a simple email API that works with a single fetch call.
 * Set RESEND_API_KEY in Supabase edge function secrets.
 *
 * Docs: https://resend.com/docs/send-with-deno
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_ADDRESS = Deno.env.get("EMAIL_FROM_ADDRESS") ?? "BidOnDent <notifications@bidondent.com>";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  /** Optional plain-text fallback */
  text?: string;
  /** Optional reply-to address */
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a single email via Resend API.
 *
 * Returns a result object — never throws.
 * Callers should treat email failure as non-blocking (log and continue).
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.warn("sendEmail: RESEND_API_KEY not configured — email skipped");
    return { success: false, error: "Email provider not configured" };
  }

  if (!payload.to || !payload.subject || !payload.html) {
    return { success: false, error: "Missing required email fields (to, subject, html)" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        ...(payload.text ? { text: payload.text } : {}),
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`sendEmail: Resend API error ${response.status}:`, errorBody);
      return { success: false, error: `Resend API error: ${response.status}` };
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("sendEmail: network error:", msg);
    return { success: false, error: msg };
  }
}
