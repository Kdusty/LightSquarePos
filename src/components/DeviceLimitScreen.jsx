import { useState } from "react";
import { TIER_LIMITS } from "../hooks/useSubscription.js";

export default function DeviceLimitScreen({
  tier, activeCount, deviceLimit, storeName,
  requestUpgrade, forceUseThisDevice,
}) {
  const [forcing, setForcing]         = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [gcashRef, setGcashRef]       = useState("");
  const [orderCode, setOrderCode]     = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const [busy, setBusy]               = useState(false);

  async function handleForce() {
    setForcing(true);
    await forceUseThisDevice();
    setForcing(false);
  }

  async function handleSubmit() {
    if (gcashRef.trim().length < 6 || busy) return;
    setBusy(true);
    try {
      const code = await requestUpgrade(upgradeTarget, gcashRef.trim(), storeName);
      setOrderCode(code);
      setSubmitted(true);
    } catch { /* logged in hook */ }
    setBusy(false);
  }

  const canUpgradeForDevices = tier !== "growth";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg)", overflowY: "auto",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 16px",
    }}>
      <div style={{ maxWidth: 560, width: "100%" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>
            Device limit reached
          </h1>
          <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.6 }}>
            Your <strong style={{ color: "var(--text)" }}>{TIER_LIMITS[tier]?.label || tier}</strong> plan
            allows <strong style={{ color: "var(--text)" }}>{deviceLimit} device{deviceLimit !== 1 ? "s" : ""}</strong>.
            {" "}We're seeing <strong style={{ color: "var(--text)" }}>{activeCount} active</strong> right now.
          </p>
        </div>

        {/* Option 1: use this device only */}
        {!submitted && (
          <div style={{
            border: "1px solid var(--border)", borderRadius: "var(--r)",
            padding: 20, background: "var(--surface2)", marginBottom: 12,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>
              Use this device
            </div>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 14, lineHeight: 1.5 }}>
              Sign out all other sessions and use only this device.
              The other device(s) will lose access within a minute.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={forcing}
              onClick={handleForce}
            >
              {forcing ? "Switching…" : "Use this device only"}
            </button>
          </div>
        )}

        {/* Option 2: upgrade to Growth */}
        {canUpgradeForDevices && !submitted && (
          <div style={{
            border: "1px solid var(--border)", borderRadius: "var(--r)",
            padding: 20, background: "var(--surface2)", marginBottom: 12,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>
              Upgrade to Growth — 3 devices
            </div>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 14, lineHeight: 1.5 }}>
              ₱599/mo · multi-user roles · kitchen display · up to 3 devices simultaneously.
            </p>
            {!upgradeTarget ? (
              <button
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => { setUpgradeTarget("growth"); setGcashRef(""); }}
              >
                Upgrade to Growth →
              </button>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <img
                      src="/gcash-qr.jpg" alt="GCash QR"
                      style={{ width: 130, height: 130, objectFit: "contain", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "white", padding: 6 }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Scan with GCash</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 10, lineHeight: 1.6 }}>
                      1. Send <strong>₱599</strong> to the QR<br />
                      2. Copy your GCash reference number<br />
                      3. Paste it below
                    </div>
                    <input
                      className="search-input"
                      style={{ width: "100%", marginBottom: 8, fontFamily: "var(--mono)" }}
                      placeholder="GCash ref number"
                      value={gcashRef}
                      onChange={e => setGcashRef(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      disabled={gcashRef.trim().length < 6 || busy}
                      onClick={handleSubmit}
                    >
                      {busy ? "Submitting…" : "Submit Payment"}
                    </button>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setUpgradeTarget(null)}>← Back</button>
              </div>
            )}
          </div>
        )}

        {/* Success after upgrade submission */}
        {submitted && (
          <div style={{
            border: "1px solid rgba(34,197,94,.3)", borderRadius: "var(--r)",
            padding: 24, background: "var(--green-bg)", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--green-text)", marginBottom: 8 }}>
              Payment submitted!
            </div>
            {orderCode && (
              <div style={{
                display: "inline-block", background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)", padding: "8px 20px", margin: "0 auto 12px",
              }}>
                <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Order Code</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 900, color: "var(--text)", letterSpacing: 2 }}>{orderCode}</div>
              </div>
            )}
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
              We'll activate Growth within 24 hours — you'll get 3 device slots.<br />
              While waiting, use the <strong>"Use this device only"</strong> option below to continue.
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 12 }}
              disabled={forcing}
              onClick={handleForce}
            >
              {forcing ? "Switching…" : "Use this device for now"}
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginTop: 20 }}>
          Questions? info@lightsquarepos.com
        </p>
      </div>
    </div>
  );
}
