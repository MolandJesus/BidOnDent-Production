/**
 * Email templates for BidOnDent notification emails.
 *
 * Each template returns { subject, html, text } for a given context.
 * Templates use inline styles for email client compatibility.
 */

const BRAND_COLOR = "#2563eb";
const BRAND_NAME = "BidOnDent";
const BASE_URL = Deno.env.get("SITE_URL") ?? "https://bidondent.com";

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
<tr><td style="background:${BRAND_COLOR};padding:20px 24px">
<h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">${BRAND_NAME}</h1>
</td></tr>
<tr><td style="padding:24px">
<h2 style="margin:0 0 16px;color:#1e293b;font-size:18px">${title}</h2>
${body}
</td></tr>
<tr><td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0">
<p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">
${BRAND_NAME} · <a href="${BASE_URL}" style="color:${BRAND_COLOR};text-decoration:none">bidondent.com</a>
</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;margin:16px 0">${label}</a>`;
}

// ── Customer emails ──────────────────────────────────────────────

export function newBidReceived(ctx: {
  customerName: string;
  shopName: string;
  amount: number;
  reportId: string;
}) {
  const subject = `New bid from ${ctx.shopName} — $${ctx.amount.toLocaleString()}`;
  const html = wrap(
    "You received a new bid!",
    `<p style="color:#475569;line-height:1.6">Hi ${ctx.customerName},</p>
<p style="color:#475569;line-height:1.6"><strong>${ctx.shopName}</strong> submitted a bid of <strong>$${ctx.amount.toLocaleString()}</strong> on your damage report.</p>
${btn("View Bid", `${BASE_URL}/dashboard/customer/bids`)}
<p style="color:#94a3b8;font-size:13px">You can accept, compare, or decline this bid from your dashboard.</p>`
  );
  const text = `Hi ${ctx.customerName}, ${ctx.shopName} submitted a bid of $${ctx.amount.toLocaleString()} on your damage report. View it at ${BASE_URL}/dashboard/customer/bids`;
  return { subject, html, text };
}

export function claimDecisionNotification(ctx: {
  customerName: string;
  decision: "approved" | "denied";
  amount?: number | null;
  reason?: string | null;
  reportId: string;
}) {
  const isApproved = ctx.decision === "approved";
  const title = isApproved ? "Your claim has been approved!" : "Claim decision update";
  const subject = isApproved
    ? `Claim approved — $${(ctx.amount ?? 0).toLocaleString()}`
    : "Your insurance claim decision";

  const body = isApproved
    ? `<p style="color:#475569;line-height:1.6">Hi ${ctx.customerName},</p>
<p style="color:#475569;line-height:1.6">Great news! Your insurance claim has been <strong style="color:#16a34a">approved</strong> for <strong>$${(ctx.amount ?? 0).toLocaleString()}</strong>.</p>
${btn("View Details", `${BASE_URL}/dashboard/customer/reports`)}`
    : `<p style="color:#475569;line-height:1.6">Hi ${ctx.customerName},</p>
<p style="color:#475569;line-height:1.6">Your insurance claim has been <strong style="color:#dc2626">denied</strong>.</p>
${ctx.reason ? `<p style="color:#475569;line-height:1.6"><strong>Reason:</strong> ${ctx.reason}</p>` : ""}
${btn("View Details", `${BASE_URL}/dashboard/customer/reports`)}`;

  const text = isApproved
    ? `Hi ${ctx.customerName}, your claim was approved for $${(ctx.amount ?? 0).toLocaleString()}. View: ${BASE_URL}/dashboard/customer/reports`
    : `Hi ${ctx.customerName}, your claim was denied. ${ctx.reason ? `Reason: ${ctx.reason}` : ""} View: ${BASE_URL}/dashboard/customer/reports`;

  return { subject, html: wrap(title, body), text };
}

// ── Shop emails ──────────────────────────────────────────────────

export function nearbyReportAlert(ctx: {
  shopName: string;
  distanceMiles: number;
  damageType?: string;
  zipCode?: string;
}) {
  const subject = `New repair request ${ctx.distanceMiles.toFixed(1)} mi away`;
  const html = wrap(
    "New nearby repair request",
    `<p style="color:#475569;line-height:1.6">Hi ${ctx.shopName},</p>
<p style="color:#475569;line-height:1.6">A new damage report was submitted <strong>${ctx.distanceMiles.toFixed(1)} miles</strong> from your location${ctx.zipCode ? ` (ZIP: ${ctx.zipCode})` : ""}${ctx.damageType ? ` — ${ctx.damageType} damage` : ""}.</p>
${btn("View & Bid", `${BASE_URL}/dashboard/shops/requests`)}
<p style="color:#94a3b8;font-size:13px">You're receiving this because this report is within your service area.</p>`
  );
  const text = `Hi ${ctx.shopName}, a new damage report was submitted ${ctx.distanceMiles.toFixed(1)} mi from your location. View: ${BASE_URL}/dashboard/shops/requests`;
  return { subject, html, text };
}

export function bidStatusNotification(ctx: {
  shopName: string;
  customerName: string;
  status: "accepted" | "rejected";
  amount: number;
}) {
  const isAccepted = ctx.status === "accepted";
  const subject = isAccepted
    ? `Your bid of $${ctx.amount.toLocaleString()} was accepted!`
    : `Bid update — $${ctx.amount.toLocaleString()}`;

  const html = wrap(
    isAccepted ? "Your bid was accepted!" : "Bid status update",
    `<p style="color:#475569;line-height:1.6">Hi ${ctx.shopName},</p>
<p style="color:#475569;line-height:1.6">${ctx.customerName} has <strong style="color:${isAccepted ? "#16a34a" : "#dc2626"}">${ctx.status}</strong> your bid of <strong>$${ctx.amount.toLocaleString()}</strong>.</p>
${isAccepted ? btn("View Job", `${BASE_URL}/dashboard/shops/jobs`) : ""}
<p style="color:#94a3b8;font-size:13px">${isAccepted ? "You can now schedule the repair from your dashboard." : "Keep bidding on other repair requests in your area."}</p>`
  );
  const text = `Hi ${ctx.shopName}, ${ctx.customerName} has ${ctx.status} your bid of $${ctx.amount.toLocaleString()}. ${isAccepted ? `View: ${BASE_URL}/dashboard/shops/jobs` : ""}`;
  return { subject, html, text };
}

// ── Insurer emails ──────────────────────────────────────────────

export function newClaimSubmitted(ctx: {
  insurerName: string;
  policyNumber?: string;
  estimatedAmount?: number | null;
}) {
  const subject = `New insurance claim submitted${ctx.policyNumber ? ` — Policy ${ctx.policyNumber}` : ""}`;
  const html = wrap(
    "New claim requires review",
    `<p style="color:#475569;line-height:1.6">Hi ${ctx.insurerName},</p>
<p style="color:#475569;line-height:1.6">A new insurance claim has been submitted${ctx.policyNumber ? ` for policy <strong>${ctx.policyNumber}</strong>` : ""}${ctx.estimatedAmount ? ` with an estimated repair cost of <strong>$${ctx.estimatedAmount.toLocaleString()}</strong>` : ""}.</p>
${btn("Review Claim", `${BASE_URL}/dashboard/insurer/claims`)}
<p style="color:#94a3b8;font-size:13px">This claim is pending your review and decision.</p>`
  );
  const text = `New insurance claim submitted${ctx.policyNumber ? ` for policy ${ctx.policyNumber}` : ""}. Review at ${BASE_URL}/dashboard/insurer/claims`;
  return { subject, html, text };
}
