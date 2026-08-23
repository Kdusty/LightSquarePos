import { useState } from "react";

const STEPS = [
  {
    tag: "Sell",
    title: "Browse & build your order",
    desc: "Filter products by category — Drinks, Food, Desserts and more. Tap any item to add it to the cart. The total updates instantly.",
    img: "/Interactive Guides SS/step1.png",
  },
  {
    tag: "Payment",
    title: "Auto change calculation",
    desc: "Tap a quick-amount button (₱100, ₱200, ₱500…) and the exact change is calculated before you touch the till. No mental math needed.",
    img: "/Interactive Guides SS/step2.png",
  },
  {
    tag: "Receipt",
    title: "BIR-compliant official receipt",
    desc: "Every sale generates an Official Receipt with VAT breakdown, TIN, and accreditation number. Print it or move straight to the next order.",
    img: "/Interactive Guides SS/step3.png",
  },
  {
    tag: "Order Display",
    title: "Kitchen sees every order",
    desc: "Confirmed orders appear on the kitchen screen in real time. Colour-coded timers track wait time so nothing gets missed or goes cold.",
    img: "/Interactive Guides SS/step4.png",
  },
  {
    tag: "Analytics",
    title: "Sales performance at a glance",
    desc: "Gross revenue, net profit, best sellers, peak hours, and payment method split — all in one dashboard. Filter by Today, 7 Days, or a custom range.",
    img: "/Interactive Guides SS/step5.png",
  },
  {
    tag: "Transactions",
    title: "Every sale in one searchable list",
    desc: "See all completed orders with totals, payment method, and cashier. View any past receipt, void today's orders, or issue a refund — all from here.",
    img: "/Interactive Guides SS/step6.png",
  },
  {
    tag: "Transactions",
    title: "Pull up any past receipt",
    desc: "Tap View on any transaction to open the full official receipt. Reprint it on your thermal printer anytime — useful for disputes or record-keeping.",
    img: "/Interactive Guides SS/step7.png",
  },
  {
    tag: "Transactions",
    title: "Void a transaction",
    desc: "Made a mistake? Void any of today's orders with a reason — stock is automatically restored to inventory. Older orders use the Refund flow instead.",
    img: "/Interactive Guides SS/step8.png",
  },
  {
    tag: "Transactions",
    title: "Full or partial refunds",
    desc: "Process a full or partial refund on any past order. Choose whether to restore stock back to inventory. A reason is required for every refund.",
    img: "/Interactive Guides SS/step9.png",
  },
  {
    tag: "Reports",
    title: "End of Day report",
    desc: "Close the day with a full revenue summary, cash vs GCash breakdown, drawer reconciliation, and top-selling items — BIR-ready in one tap.",
    img: "/Interactive Guides SS/step10.png",
  },
  {
    tag: "Inventory",
    title: "Track stock across all products",
    desc: "See every product with its category, price, and stock count. Low-stock badges alert you before you run out so you never miss a sale.",
    img: "/Interactive Guides SS/step11.png",
  },
  {
    tag: "Inventory",
    title: "Add products with variants",
    desc: "Set the product name, price, icon, category, and stock. Add size or customisation variants with individual price add-ons — all in one form.",
    img: "/Interactive Guides SS/step12.png",
  },
];

export default function OnboardingGuide({ onDone }) {
  const [cur, setCur] = useState(0);
  const step = STEPS[cur];
  const isLast = cur === STEPS.length - 1;

  function go(dir) {
    const next = cur + dir;
    if (next < 0 || next >= STEPS.length) return;
    setCur(next);
  }

  const s = {
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "16px",
    },
    card: {
      background: "#111113", border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "20px", width: "100%", maxWidth: "480px",
      overflow: "hidden", display: "flex", flexDirection: "column",
    },
    head: {
      padding: "18px 22px 0", display: "flex",
      alignItems: "center", justifyContent: "space-between",
    },
    lbl: {
      fontSize: "10px", fontWeight: 700, letterSpacing: "1px",
      color: "#444", textTransform: "uppercase", fontFamily: "inherit",
    },
    xbtn: {
      background: "rgba(255,255,255,0.07)", border: "none",
      color: "#888", cursor: "pointer", width: "28px", height: "28px",
      borderRadius: "7px", fontSize: "13px", display: "flex",
      alignItems: "center", justifyContent: "center",
    },
    imgBox: {
      margin: "14px 20px", borderRadius: "12px", height: "240px",
      overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)",
      background: "#1a1a1c", position: "relative",
    },
    img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    body: { padding: "0 22px 16px" },
    tag: {
      display: "inline-block", fontSize: "10px", fontWeight: 700,
      letterSpacing: ".3px", color: "#555", border: "1px solid #252525",
      borderRadius: "99px", padding: "2px 9px", marginBottom: "8px",
    },
    title: {
      fontSize: "21px", fontWeight: 700, color: "#fff",
      letterSpacing: "-.4px", lineHeight: 1.2, marginBottom: "6px",
    },
    desc: { fontSize: "13px", color: "#666", lineHeight: 1.6 },
    foot: {
      padding: "12px 22px 20px", display: "flex",
      alignItems: "center", justifyContent: "space-between",
      borderTop: "1px solid rgba(255,255,255,0.05)",
    },
    dots: { display: "flex", gap: "5px", alignItems: "center" },
    dot: (active) => ({
      width: active ? "20px" : "6px", height: "6px",
      borderRadius: "99px", background: active ? "#fff" : "#222",
      transition: "all .25s cubic-bezier(.4,0,.2,1)",
    }),
    nav: { display: "flex", gap: "8px" },
    back: {
      background: "none", border: "1px solid #222", color: "#555",
      borderRadius: "9px", padding: "8px 16px", fontSize: "12px",
      fontWeight: 600, cursor: "pointer",
    },
    next: {
      background: "#fff", color: "#0D0D0F", border: "none",
      borderRadius: "9px", padding: "8px 22px", fontSize: "12px",
      fontWeight: 700, cursor: "pointer",
    },
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.head}>
          <span style={s.lbl}>Step {cur + 1} of {STEPS.length}</span>
          <button style={s.xbtn} onClick={onDone} aria-label="Skip tour">✕</button>
        </div>

        <div style={s.imgBox}>
          <img src={step.img} alt={step.title} style={s.img} />
        </div>

        <div style={s.body}>
          <div style={s.tag}>{step.tag}</div>
          <div style={s.title}>{step.title}</div>
          <div style={s.desc}>{step.desc}</div>
        </div>

        <div style={s.foot}>
          <div style={s.dots}>
            {STEPS.map((_, i) => (
              <div key={i} style={s.dot(i === cur)} />
            ))}
          </div>
          <div style={s.nav}>
            <button
              style={{ ...s.back, visibility: cur === 0 ? "hidden" : "visible" }}
              onClick={() => go(-1)}
            >
              Back
            </button>
            <button style={s.next} onClick={isLast ? onDone : () => go(1)}>
              {isLast ? "Get started ✓" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
