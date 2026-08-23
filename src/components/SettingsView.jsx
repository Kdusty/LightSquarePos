import { useRef } from "react";
import { Upload, Plus, Pencil } from "lucide-react";
import { ROLE_LABELS, ROLE_BG, ROLE_COLORS } from "../data/initialData.js";
import { TIER_LIMITS } from "../hooks/useSubscription.js";

export default function SettingsView({
  settingsTab, setSettingsTab, can, storeName, setStoreName,
  stockThreshold, setStockThreshold, lowStock, gcashQR, setGcashQR,
  taxRate, setTaxRate, birInfo, updBir, staff, currentUser,
  openAddStaff, openEditStaff, toggleStaffActive,
  tier, daysLeft, status, upgradeTarget, setUpgradeTarget,
  gcashRef, setGcashRef, upgradeSubmitted, setUpgradeSubmitted, requestUpgrade,
  migrateImagesToStorage, migrationStatus, saveSettings, showToast,
  
  // NEW HARDWARE PROPS
  printerPort, connectPrinter, disconnectPrinter
}) {
  const qrRef = useRef();

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-left">
          <h1>Settings</h1>
          <p>Customize your POS system</p>
        </div>
      </div>
      <div className="page-body">
        <div className="settings-wrap">
          <div className="settings-nav-list">
            {[
              ["store", "🏪", "Store Info"], 
              ["payments", "💳", "Payments"], 
              ["tax", "🧾", "Tax & Fees"], 
              ["bir", "📋", "Receipt & BIR"], 
              ["hardware", "🖨️", "Hardware"], // <-- NEW HARDWARE TAB
              ["subscription", "⭐", "Subscription"]
            ].map(([id, ico, lbl]) => (
              <button key={id} className={`s-nav-item${settingsTab === id ? " active" : ""}`} onClick={() => setSettingsTab(id)}>{ico} {lbl}</button>
            ))}
            {can("staff") && <button className={`s-nav-item${settingsTab === "staff" ? " active" : ""}`} onClick={() => setSettingsTab("staff")}>👥 Staff & Roles</button>}
          </div>
          <div className="settings-cards">
            
            {/* --- HARDWARE TAB --- */}
            {settingsTab === "hardware" && <>
              <div className="settings-card">
                <h3>🖨️ Receipt Printer & Cash Drawer</h3>
                <p className="desc">Connect a USB/Bluetooth thermal printer via Web Serial API (ESC/POS compatible)</p>

                <div style={{ padding: "16px", background: "var(--surface2)", borderRadius: "var(--r)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: printerPort ? "var(--green-text)" : "var(--text)" }}>
                      {printerPort ? "✅ Printer Connected" : "❌ No Printer Connected"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                      {printerPort ? "Ready to print physical receipts & open cash drawer." : "Click below to pair your 80mm ESC/POS printer."}
                    </div>
                  </div>
                  {printerPort ? (
                    <button className="btn btn-secondary" onClick={async () => {
                      await disconnectPrinter();
                      showToast("Printer disconnected.");
                    }}>Disconnect</button>
                  ) : (
                    <button className="btn btn-primary" onClick={async () => {
                      try {
                        await connectPrinter();
                        showToast("Printer connected successfully!", "success");
                      } catch (err) {
                        showToast(err.message, "error");
                      }
                    }}>Connect Printer</button>
                  )}
                </div>

                <div style={{ padding: "12px 14px", background: "var(--amber-bg)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--r-sm)", fontSize: 12.5, color: "var(--amber-text)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                  <span><strong>Hardware Restrictions:</strong> This bridge uses open web standards. It requires a Chromium-based browser (Chrome, Edge, Opera) on Windows, ChromeOS, macOS, or Android. <strong>It will not work on iPads or iPhones</strong> as Apple blocks physical hardware APIs.</span>
                </div>
              </div>
            </>}

            {settingsTab === "store" && <>
              <div className="settings-card">
                <h3>Store Information</h3>
                <p className="desc">Your business identity on receipts and reports</p>
                <div className="field-grid">
                  <div className="field full"><label>Store Name</label><input value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
                  <div className="field"><label>Currency</label><select><option>Philippine Peso (₱)</option></select></div>
                  <div className="field"><label>Time Zone</label><select><option>Asia/Manila (PHT)</option></select></div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={async () => {
                  await saveSettings({ store_name: storeName, stock_threshold: stockThreshold });
                  showToast("Store settings saved!");
                }}>Save Changes</button>
              </div>

              <div className="settings-card">
                <h3>⚠️ Low Stock Alert Threshold</h3>
                <p className="desc">Get notified automatically when a product's stock reaches this level</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0" }}>
                  <div style={{ flex: 1 }}>
                    <input type="range" min="1" max="20" value={stockThreshold} onChange={e => setStockThreshold(+e.target.value)} style={{ width: "100%", accentColor: "var(--text)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                      <span>1 (very tight)</span><span>20 (early warning)</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 64 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--mono)", color: "var(--amber-text)", lineHeight: 1 }}>{stockThreshold}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>units</div>
                  </div>
                </div>
                <div style={{ padding: "10px 14px", background: "var(--amber-bg)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--r-sm)", fontSize: 12.5, color: "var(--amber-text)", display: "flex", gap: 8, alignItems: "center" }}>
                  ⚠️ A toast alert will pop up and the Inventory badge will show when any product hits <strong>&nbsp;{stockThreshold} units or below</strong>.
                </div>
                {lowStock.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: .5 }}>Currently at or below threshold ({lowStock.length})</div>
                    {lowStock.map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--surface2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 20 }}>{p.icon}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                        <span className={`badge ${p.stock === 0 ? "bg-red" : "bg-amber"}`}>{p.stock === 0 ? "OUT" : p.stock + " left"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="settings-card">
                <h3>🗃️ Database Optimization</h3>
                <p className="desc">Moves product images from the database into secure Storage to drastically improve load speeds and reclaim database space.</p>
                {migrationStatus && (
                  <div style={{ padding: "10px 14px", background: migrationStatus.errors?.length ? "var(--amber-bg)" : "var(--green-bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", fontSize: 13, marginBottom: 12 }}>
                    {migrationStatus.running
                      ? `Optimizing… ${migrationStatus.done} / ${migrationStatus.total} done`
                      : migrationStatus.message}
                    {migrationStatus.errors?.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12, color: "var(--amber-text)" }}>Failed: {migrationStatus.errors.join(", ")}</div>
                    )}
                  </div>
                )}
                <button className="btn btn-secondary" disabled={migrationStatus?.running} onClick={migrateImagesToStorage}>
                  {migrationStatus?.running ? "Optimizing Database…" : "Optimize Product Images"}
                </button>
              </div>
            </>}
            {settingsTab === "payments" && <>
              <div className="settings-card">
                <h3>GCash QR Code</h3>
                <p className="desc">Upload your GCash QR so customers can scan and pay instantly</p>
                <input ref={qrRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { 
                  const f = e.target.files[0]; 
                  if (!f) return; 
                  const r = new FileReader(); 
                  r.onload = async (ev) => {
                    const base64 = ev.target.result;
                    setGcashQR(base64);
                    await saveSettings({ gcash_qr: base64 });
                    showToast("GCash QR saved to database!");
                  }; 
                  r.readAsDataURL(f); 
                }} />
                <div className="qr-upload" onClick={() => qrRef.current.click()}>
                  {gcashQR ? <><img src={gcashQR} className="qr-img" alt="QR" /><p style={{ color: "var(--green-text)", fontWeight: 700, marginTop: 10 }}>✓ QR uploaded — click to replace</p></>
                    : <><Upload size={32} style={{ opacity: .4 }} /><p>Click to upload GCash QR Code<br /><span style={{ fontSize: 11 }}>PNG or JPG</span></p></>}
                </div>
              </div>
            </>}
            {settingsTab === "tax" && <>
              <div className="settings-card">
                <h3>Tax Configuration</h3>
                <p className="desc">Rates applied at checkout</p>
                <div className="field-grid">
                  <div className="field"><label>VAT Rate (%)</label><input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} /></div>
                  <div className="field"><label>Service Charge (%)</label><input type="number" defaultValue="0" /></div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={async () => {
                  await saveSettings({ tax_rate: taxRate });
                  showToast("Tax rates saved!");
                }}>Save Changes</button>
              </div>
            </>}
            {settingsTab === "bir" && <>
              <div className="settings-card">
                <h3>Official Receipt (OR) Details</h3>
                <p className="desc">These details will appear on every printed receipt as required by BIR regulations</p>
                <div className="field-grid">
                  <div className="field full"><label>Registered Business Name</label><input value={birInfo.businessName} onChange={e => updBir("businessName", e.target.value)} placeholder="As registered with BIR" /></div>
                  <div className="field full"><label>Owner / Proprietor Name</label><input value={birInfo.ownerName} onChange={e => updBir("ownerName", e.target.value)} placeholder="Full legal name" /></div>
                  <div className="field"><label>TIN (Tax Identification No.)</label><input value={birInfo.tin} onChange={e => updBir("tin", e.target.value)} placeholder="000-000-000-000" /></div>
                  <div className="field"><label>VAT Registration</label><input value={birInfo.vatReg} onChange={e => updBir("vatReg", e.target.value)} placeholder="000-000-000-000 VAT" /></div>
                  <div className="field full"><label>Business Address</label><input value={birInfo.address} onChange={e => updBir("address", e.target.value)} placeholder="Street, Barangay, City, Province" /></div>
                  <div className="field"><label>Contact Number</label><input value={birInfo.contact} onChange={e => updBir("contact", e.target.value)} placeholder="+63 9XX XXX XXXX" /></div>
                  <div className="field"><label>Accreditation No.</label><input value={birInfo.accreditationNo} onChange={e => updBir("accreditationNo", e.target.value)} placeholder="ACC-XXXX-XXX" /></div>
                  <div className="field full"><label>Receipt Footer Message</label><input value={birInfo.footer} onChange={e => updBir("footer", e.target.value)} placeholder="Thank you message or return policy" /></div>
                </div>
                <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--amber-bg)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--r-sm)", fontSize: 12.5, color: "var(--amber-text)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                  <span>Ensure your TIN and business name match your BIR Certificate of Registration (COR). Incorrect details may result in penalties.</span>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => showToast("BIR receipt details saved!")}>Save Receipt Details</button>
              </div>
            </>}
            {settingsTab === "staff" && can("staff") && <>
              <div className="settings-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h3>Staff & Roles</h3>
                    <p className="desc">Manage who can access this POS and what they can do</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={openAddStaff}><Plus size={13} />Add Staff</button>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <div key={role} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 99, background: ROLE_BG[role], border: "1px solid var(--border)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: ROLE_COLORS[role] }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: ROLE_COLORS[role] }}>{label}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>
                        {role === "owner" ? "Full access" : role === "manager" ? "Analytics + Transactions + Inventory view" : "POS only"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="staff-list">
                  {staff.map(s => (
                    <div key={s.id} className={`staff-card${s.active ? "" : " inactive"}`}>
                      <div className={`staff-av-lg ${s.role}`}>{s.avatar}</div>
                      <div className="staff-info">
                        <div className="staff-info-name">{s.name} {s.id === currentUser?.id && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green-text)" }}>● You</span>}</div>
                        <div className="staff-info-sub">PIN: {s.pin.split("").map(() => "●").join(" ")} · Joined {s.createdAt}</div>
                      </div>
                      <span className="staff-role-badge badge" style={{ background: ROLE_BG[s.role], color: ROLE_COLORS[s.role], borderColor: "transparent" }}>
                        {ROLE_LABELS[s.role]}
                      </span>
                      <div className="staff-actions">
                        <span className={`badge ${s.active ? "bg-green" : "bg-gray"}`}>{s.active ? "Active" : "Inactive"}</span>
                        {s.id !== currentUser?.id && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditStaff(s)}><Pencil size={11} /></button>
                            <button className="btn btn-secondary btn-sm" onClick={() => toggleStaffActive(s.id)} style={{ fontSize: 11 }}>
                              {s.active ? "Disable" : "Enable"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>}
            {settingsTab === "subscription" && <>
              <div className="settings-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h3>⭐ Subscription</h3>
                    <p className="desc">Manage your LightSquare plan</p>
                  </div>
                  // AFTER
                    <div style={{ textAlign: "right" }}>
                      <div className={`badge ${tier === "trial" ? "bg-amber" : tier === "growth" ? "bg-purple" : "bg-green"}`} style={{ fontSize: 13, padding: "5px 12px" }}>
                        {TIER_LIMITS[tier]?.label || "Plan"}
                      </div>
                      {daysLeft !== null && (
                        <div style={{ fontSize: 11, color: daysLeft <= 3 ? "var(--red-text)" : "var(--amber-text)", marginTop: 4, fontWeight: 700 }}>
                      {daysLeft > 0 ? `${daysLeft} days left` : `⚠️ ${tier === "trial" ? "Trial" : "Plan"} expired`}
                      </div>
                        )}
                  </div>
                </div>
                {tier === "trial" && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>
                      <span>Trial progress</span><span>{14 - daysLeft}/14 days used</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface3)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(((14 - daysLeft) / 14) * 100, 100)}%`, background: daysLeft <= 3 ? "var(--red-text)" : "var(--text)", borderRadius: 99, transition: "width .3s" }} />
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 24 }}>
                  {[
                    { id: "starter", label: "Starter", price: "₱299", period: "/mo", color: "var(--green-text)", bg: "var(--green-bg)", features: ["Unlimited products", "Full analytics", "1 device", "Priority support"] },
                    { id: "growth", label: "Growth", price: "₱599", period: "/mo", color: "var(--text)", bg: "var(--surface3)", features: ["Everything in Starter", "Up to 3 devices", "Multi-user roles", "Kitchen display"], badge: "Popular" },
                    { id: "annual", label: "Annual", price: "₱2,988", period: "/yr", color: "var(--amber-text)", bg: "var(--amber-bg)", features: ["Starter features", "Save ₱600/year", "1 device", "Email support"] },
                  ].map(plan => {
                    const isCurrent = tier === plan.id;
                    const isPending = status === "pending" && tier === plan.id;
                    return (
                      <div key={plan.id} style={{ border: `2px solid ${isCurrent ? "var(--focus-border)" : "var(--border)"}`, borderRadius: "var(--r)", padding: 16, background: isCurrent ? plan.bg : "var(--surface2)", position: "relative", transition: "all var(--transition)" }}>
                        {plan.badge && <div style={{ position: "absolute", top: -10, right: 12, background: "var(--text)", color: "var(--bg)", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>{plan.badge}</div>}
                        <div style={{ fontWeight: 800, fontSize: 14, color: plan.color, marginBottom: 4 }}>{plan.label}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{plan.price}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--text3)" }}>{plan.period}</span></div>
                        <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 5 }}>
                          {plan.features.map(f => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
                              <span style={{ color: "var(--green-text)", fontSize: 13 }}>✓</span>{f}
                            </div>
                          ))}
                        </div>
                        {isCurrent
                          ? <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: plan.color, padding: "6px 0" }}>✓ Current Plan</div>
                          : isPending
                            ? <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--amber-text)", padding: "6px 0" }}>⏳ Pending approval</div>
                            : <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={() => { setUpgradeTarget(plan.id); setGcashRef(""); setUpgradeSubmitted(false); }}>
                              Upgrade →
                            </button>
                        }
                      </div>
                    );
                  })}
                </div>
                {upgradeTarget && !upgradeSubmitted && (
                  <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 20, background: "var(--surface2)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>Upgrade to {TIER_LIMITS[upgradeTarget]?.label}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Pay via GCash · ₱{TIER_LIMITS[upgradeTarget]?.price?.toLocaleString()}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => setUpgradeTarget(null)}>✕ Cancel</button>
                    </div>
                    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <img src="/gcash-qr.jpg" alt="GCash QR" style={{ width: 160, height: 160, objectFit: "contain", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "white", padding: 6 }} />
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>Scan with GCash or InstaPay</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 12, lineHeight: 1.6 }}>
                          <strong>How to pay:</strong><br />
                          1. Open GCash → Send Money or Scan QR<br />
                          2. Send <strong>₱{TIER_LIMITS[upgradeTarget]?.price?.toLocaleString()}</strong> to the QR above<br />
                          3. Copy your <strong>GCash reference number</strong><br />
                          4. Paste it below and submit
                        </div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", display: "block", marginBottom: 6 }}>GCash Reference Number</label>
                        <input className="search-input" style={{ width: "100%", marginBottom: 10, fontFamily: "var(--mono)" }} placeholder="e.g. 1234567890" value={gcashRef} onChange={e => setGcashRef(e.target.value)} />
                        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={gcashRef.trim().length < 6} onClick={async () => { await requestUpgrade(upgradeTarget, gcashRef.trim()); setUpgradeSubmitted(true); }}>
                          Submit Payment Confirmation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {upgradeSubmitted && (
                  <div style={{ border: "1px solid rgba(34,197,94,.3)", borderRadius: "var(--r)", padding: 20, background: "var(--green-bg)", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--green-text)", marginBottom: 6 }}>Payment submitted!</div>
                    <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                      Your upgrade request has been received.<br />
                      We'll verify your payment and activate your plan within <strong>24 hours</strong>.<br />
                      Reference: <code style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{gcashRef}</code>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setUpgradeTarget(null); setUpgradeSubmitted(false); }}>Done</button>
                  </div>
                )}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text3)", lineHeight: 1.8 }}>
                  <strong style={{ color: "var(--text2)" }}>All plans include:</strong> POS, Kitchen Display, Inventory, BIR-compliant receipts, GCash payments, CSV export, Void & Refund
                </div>
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}
