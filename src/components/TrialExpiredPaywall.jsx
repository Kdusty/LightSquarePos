import { useState } from "react";
import { TIER_LIMITS } from "../hooks/useSubscription.js";

const PLANS = [
  {
    id: "starter", label: "Starter", price: "₱299", period: "/mo",
    color: "var(--green-text)", bg: "var(--green-bg)",
    features: ["Unlimited products", "Full analytics", "1 device", "Priority support"],
  },
  {
    id: "growth", label: "Growth", price: "₱599", period: "/mo",
    color: "var(--text)", bg: "var(--surface3)",
    features: ["Everything in Starter", "Up to 3 devices", "Multi-user roles", "Kitchen display"],
    badge: "Popular",
  },
  {
    id: "annual", label: "Annual", price: "₱2,988", period: "/yr",
    color: "var(--amber-text)", bg: "var(--amber-bg)",
    features: ["Starter features", "Save ₱600/year", "1 device", "Email support"],
  },
];

export default function TrialExpiredPaywall({ storeName, requestUpgrade }) {
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [gcashRef, setGcashRef] = useState("");
  const [orderCode, setOrderCode] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (gcashRef.trim().length < 6 || busy) return;
    setBusy(true);
    try {
      const code = await requestUpgrade(upgradeTarget, gcashRef.trim(), storeName);
      setOrderCode(code);
      setSubmitted(true);
    } catch {
      // requestUpgrade logs the error
    }
    setBusy(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg)", overflowY: "auto",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 16px",
    }}>
      <div style={{ maxWidth: 680, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>
            Your free trial has ended
          </h1>
          <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.6 }}>
            {storeName ? `${storeName} — ` : ""}choose a plan below to keep selling.
          </p>
        </div>

        {/* Plan cards */}
        {!upgradeTarget && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 24 }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{
                border: "1px solid var(--border)", borderRadius: "var(--r)",
                padding: 18, background: "var(--surface2)", position: "relative",
              }}>
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: -10, right: 12,
                    background: "var(--text)", color: "var(--bg)",
                    fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                  }}>{plan.badge}</div>
                )}
                <div style={{ fontWeight: 800, fontSize: 13, color: plan.color, marginBottom: 4 }}>{plan.label}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>
                  {plan.price}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--text3)" }}>{plan.period}</span>
                </div>
                <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 5 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
                      <span style={{ color: "var(--green-text)", fontSize: 13 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  onClick={() => { setUpgradeTarget(plan.id); setGcashRef(""); }}
                >
                  Choose {plan.label}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Payment form */}
        {upgradeTarget && !submitted && (
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 24, background: "var(--surface2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
                  Upgrade to {TIER_LIMITS[upgradeTarget]?.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                  Pay via GCash · ₱{TIER_LIMITS[upgradeTarget]?.price?.toLocaleString()}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setUpgradeTarget(null)}>← Back</button>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <img
                  src="/gcash-qr.jpg" alt="GCash QR"
                  style={{ width: 150, height: 150, objectFit: "contain", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "white", padding: 6 }}
                />
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>Scan with GCash or InstaPay</div>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14, lineHeight: 1.7 }}>
                  <strong>How to pay:</strong><br />
                  1. Open GCash → Send Money or Scan QR<br />
                  2. Send <strong>₱{TIER_LIMITS[upgradeTarget]?.price?.toLocaleString()}</strong> to the QR<br />
                  3. Copy your <strong>GCash reference number</strong><br />
                  4. Paste it below — you'll get an Order Code for tracking
                </div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", display: "block", marginBottom: 6 }}>
                  GCash Reference Number
                </label>
                <input
                  className="search-input"
                  style={{ width: "100%", marginBottom: 10, fontFamily: "var(--mono)" }}
                  placeholder="e.g. 1234567890"
                  value={gcashRef}
                  onChange={e => setGcashRef(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={gcashRef.trim().length < 6 || busy}
                  onClick={handleSubmit}
                >
                  {busy ? "Submitting…" : "Submit Payment Confirmation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {submitted && (
          <div style={{
            border: "1px solid rgba(34,197,94,.3)", borderRadius: "var(--r)",
            padding: 28, background: "var(--green-bg)", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--green-text)", marginBottom: 10 }}>
              Payment submitted!
            </div>
            {orderCode && (
              <div style={{
                display: "inline-block", background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
                padding: "10px 24px", margin: "0 auto 14px",
              }}>
                <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Your Order Code</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: 2 }}>{orderCode}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>Quote this if you need support</div>
              </div>
            )}
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
              We'll verify your GCash payment and activate your plan within <strong>24 hours</strong>.<br />
              You now have provisional access while we process your payment.<br />
              GCash ref: <code style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{gcashRef}</code>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginTop: 24 }}>
          Questions? Email us at info@lightsquarepos.com
        </p>
      </div>
    </div>
  );
}
