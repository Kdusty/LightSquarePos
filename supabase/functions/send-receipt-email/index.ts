import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { to, txn, storeName, birInfo } = await req.json();

    if (!to || !txn) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const html = buildReceiptHtml(txn, storeName, birInfo);
    const shortId = "#" + txn.id.split("-")[0].substring(0, 5).toUpperCase();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "LightSquare POS <info@lightsquarepos.com>",
        to: [to],
        subject: `Receipt ${shortId} from ${storeName || "LightSquare POS"}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Email delivery failed" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-receipt-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

function peso(n: number) {
  return "₱" + (n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function buildReceiptHtml(txn: any, storeName: string, birInfo: any): string {
  const shortId = "#" + txn.id.split("-")[0].substring(0, 5).toUpperCase();
  const dateStr = new Date(txn.date || new Date()).toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = new Date(txn.created_at || new Date()).toLocaleTimeString("en-PH", {
    hour: "2-digit", minute: "2-digit",
  });
  const vatAmt = txn.tax || 0;
  const vatableSales = txn.total - vatAmt;

  const itemRows = (txn.items || []).map((item: any) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">
        <strong>${item.name}</strong> × ${item.qty}
        ${item.note ? `<div style="font-size:11px;color:#999;font-style:italic;margin-top:2px;">${item.note}</div>` : ""}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:700;color:#1a1a1a;white-space:nowrap;">
        ${peso(item.price * item.qty)}
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:440px;margin:32px auto 32px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">

    <!-- Header -->
    <div style="background:#0D0D0F;padding:28px 24px;text-align:center;">
      <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        ${birInfo?.businessName || storeName || "LightSquare POS"}
      </div>
      ${birInfo?.ownerName ? `<div style="font-size:12px;color:rgba(255,255,255,.55);margin-top:3px;">${birInfo.ownerName}</div>` : ""}
      ${birInfo?.address ? `<div style="font-size:12px;color:rgba(255,255,255,.55);margin-top:2px;">${birInfo.address}</div>` : ""}
      ${birInfo?.tin ? `<div style="font-size:12px;color:rgba(255,255,255,.45);margin-top:2px;">TIN: ${birInfo.tin}</div>` : ""}
    </div>

    <div style="padding:24px;">
      <!-- OR title row -->
      <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #ebebeb;margin-bottom:16px;">
        <div style="font-size:16px;font-weight:800;color:#1a1a1a;">🧾 Official Receipt</div>
        <div style="font-size:12px;color:#aaa;margin-top:4px;">${shortId} · ${dateStr} · ${timeStr}</div>
        <div style="font-size:12px;color:#ccc;margin-top:2px;">Cashier: ${txn.cashier || "Unknown"}</div>
      </div>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;">
        ${itemRows}
      </table>

      <!-- Totals -->
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #ebebeb;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#666;">
          <tr><td style="padding:4px 0;">Subtotal</td><td style="text-align:right;padding:4px 0;">${peso(txn.subtotal)}</td></tr>
          ${txn.discount > 0 ? `<tr><td style="padding:4px 0;color:#22c55e;">Discount</td><td style="text-align:right;padding:4px 0;color:#22c55e;">−${peso(txn.discount)}</td></tr>` : ""}
          <tr><td style="padding:4px 0;">VAT 12%</td><td style="text-align:right;padding:4px 0;">${peso(vatAmt)}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;border-top:2px solid #1a1a1a;padding-top:10px;">
          <tr>
            <td style="padding:10px 0 0;font-size:18px;font-weight:800;color:#1a1a1a;">TOTAL DUE</td>
            <td style="padding:10px 0 0;text-align:right;font-size:18px;font-weight:800;color:#1a1a1a;">${peso(txn.total)}</td>
          </tr>
        </table>
        <div style="margin-top:12px;background:#f8f8f8;border-radius:8px;padding:10px 14px;font-size:13px;color:#555;">
          ${txn.method === "Cash" ? "💵" : "📱"} Paid via ${txn.method}
        </div>
      </div>

      <!-- VAT Breakdown -->
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #ebebeb;">
        <table style="width:100%;border-collapse:collapse;font-size:11px;color:#999;text-align:center;">
          <tr>
            <td style="padding:4px;"><div style="font-weight:700;margin-bottom:2px;">Vatable Sales</div><div>${peso(vatableSales)}</div></td>
            <td style="padding:4px;"><div style="font-weight:700;margin-bottom:2px;">VAT Amount</div><div>${peso(vatAmt)}</div></td>
            <td style="padding:4px;"><div style="font-weight:700;margin-bottom:2px;">VAT Exempt</div><div>₱0.00</div></td>
          </tr>
        </table>
      </div>

      ${birInfo?.footer ? `<div style="text-align:center;font-size:12px;color:#bbb;margin-top:16px;padding-top:16px;border-top:1px solid #ebebeb;">${birInfo.footer}</div>` : ""}
      ${birInfo?.vatReg ? `<div style="text-align:center;font-size:10px;color:#ccc;margin-top:4px;">${birInfo.vatReg}${birInfo.accreditationNo ? ` · Accred. No: ${birInfo.accreditationNo}` : ""}</div>` : ""}
    </div>

    <!-- Footer -->
    <div style="background:#f8f8f8;padding:14px 24px;text-align:center;border-top:1px solid #ebebeb;">
      <div style="font-size:11px;color:#bbb;">Sent by LightSquare POS · app.lightsquarepos.com</div>
    </div>
  </div>
</body>
</html>`;
}
