import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") ?? "kenvasquez3025@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  try {
    const { storeName, plan, amount, gcashRef, orderCode } = await req.json();

    const planLabel: Record<string, string> = {
      starter: "Starter — ₱299/mo",
      growth: "Growth — ₱599/mo",
      annual: "Annual — ₱2,988/yr",
    };

    const html = `
      <h2 style="color:#1a1a1a;font-family:sans-serif">New Payment Submission</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td style="padding:6px 16px 6px 0;color:#666;font-weight:600">Store</td><td style="padding:6px 0;color:#1a1a1a">${storeName ?? "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666;font-weight:600">Plan</td><td style="padding:6px 0;color:#1a1a1a">${planLabel[plan] ?? plan}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666;font-weight:600">Amount</td><td style="padding:6px 0;color:#1a1a1a">₱${Number(amount ?? 0).toLocaleString()}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666;font-weight:600">GCash Ref</td><td style="padding:6px 0;color:#1a1a1a;font-family:monospace">${gcashRef ?? "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666;font-weight:600">Order Code</td><td style="padding:6px 0;color:#1a1a1a;font-family:monospace;font-weight:700;font-size:16px">${orderCode ?? "—"}</td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:13px;color:#666;margin-top:16px">
        Approve or reject at <a href="https://crm.lightsquarepos.com">crm.lightsquarepos.com</a>
      </p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "LightSquare CRM <noreply@lightsquarepos.com>",
        to: [NOTIFY_EMAIL],
        subject: `[LightSquare] New payment — ${orderCode} · ${storeName ?? "unknown store"}`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend error:", body);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("notify-payment error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
