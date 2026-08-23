import { X } from "lucide-react";
import { fmt, todayStr } from "../data/initialData.js";

export default function EODReport({
  eodOpen, setEodOpen, currentUser, transactions, kitchenDone, kitchenQueue,
  taxRate, openingFloat, setOpeningFloat, actualCash, setActualCash,
  lowStock, eodClosed, eodClosedAt, setEodClosed, setEodClosedAt
}) {
  if (!eodOpen) return null;

  // --- Calculations moved inside ---
  const todayTxns = transactions.filter(t => t.date === todayStr());
  const eodCompleted = todayTxns.filter(t => t.status === "Completed");
  const eodVoided = todayTxns.filter(t => t.status === "Voided");
  const eodRefunded = todayTxns.filter(t => t.status === "Refunded");
  const eodGross = eodCompleted.reduce((s, t) => s + t.subtotal, 0);
  const eodDiscounts = eodCompleted.reduce((s, t) => s + t.discount, 0);
  const eodTax = eodCompleted.reduce((s, t) => s + t.tax, 0);
  const eodNet = eodCompleted.reduce((s, t) => s + t.total, 0);
  const eodCash = eodCompleted.filter(t => t.method === "Cash").reduce((s, t) => s + t.total, 0);
  const eodGCash = eodCompleted.filter(t => t.method === "GCash").reduce((s, t) => s + t.total, 0);
  const eodCashCount = eodCompleted.filter(t => t.method === "Cash").length;
  const eodGCashCount = eodCompleted.filter(t => t.method === "GCash").length;
  const eodVoidAmt = eodVoided.reduce((s, t) => s + t.total, 0);
  const eodRefundAmt = eodRefunded.reduce((s, t) => s + (t.refundAmount || t.total), 0);
  const eodAOV = eodCompleted.length ? eodNet / eodCompleted.length : 0;
  const eodExpected = (parseFloat(openingFloat) || 0) + eodCash;
  const eodActual = parseFloat(actualCash) || 0;
  const eodVariance = eodActual - eodExpected;

  const eodItemMap = {};
  eodCompleted.forEach(t => t.items.forEach(i => {
    eodItemMap[i.id] = eodItemMap[i.id] || { id: i.id, name: i.name, icon: i.icon, qty: 0, revenue: 0 };
    eodItemMap[i.id].qty += i.qty;
    eodItemMap[i.id].revenue += i.price * i.qty;
  }));
  const eodTopItems = Object.values(eodItemMap).sort((a, b) => b.qty - a.qty).slice(0, 6);

  const eodKitchenDone = kitchenDone.length;
  const eodKitchenPending = kitchenQueue.length;
  const eodAvgWait = eodKitchenDone > 0
    ? Math.round(kitchenDone.reduce((s, t) => s + (new Date(t.doneAt) - new Date(t.firedAt)) / 60000, 0) / eodKitchenDone)
    : 0;

  return (
    <div className="eod-overlay" onClick={e => e.target === e.currentTarget && setEodOpen(false)}>
      <div className="eod-modal">
        <div className="eod-topbar">
          <div className="eod-topbar-left">
            <h2>📋 End of Day Report</h2>
            <p>Generated {new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })} · {currentUser?.name || "Unknown"}</p>
          </div>
          <div className="eod-topbar-right">
            <div className="eod-date">{new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</div>
            <div className="eod-time">{new Date().toLocaleDateString("en-PH", { weekday: "long" })}</div>
          </div>
          <button className="eod-close-x" style={{ marginLeft: 16, alignSelf: "flex-start" }} onClick={() => setEodOpen(false)}><X size={14} /></button>
        </div>

        <div className="eod-body">
          <div className="eod-section">
            <div className="eod-section-title">💰 Revenue Summary</div>
            <div className="eod-kpi-row">
              <div className="eod-kpi accent">
                <div className="eod-kpi-label">Net Revenue</div>
                <div className="eod-kpi-val">{fmt(eodNet)}</div>
                <div className="eod-kpi-sub">{eodCompleted.length} completed order{eodCompleted.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="eod-kpi">
                <div className="eod-kpi-label">Gross Sales</div>
                <div className="eod-kpi-val">{fmt(eodGross)}</div>
                <div className="eod-kpi-sub">before discounts</div>
              </div>
              <div className="eod-kpi">
                <div className="eod-kpi-label">Discounts Given</div>
                <div className="eod-kpi-val" style={{ color: "var(--green-text)" }}>−{fmt(eodDiscounts)}</div>
                <div className="eod-kpi-sub">customer savings</div>
              </div>
              <div className="eod-kpi">
                <div className="eod-kpi-label">VAT Collected</div>
                <div className="eod-kpi-val">{fmt(eodTax)}</div>
                <div className="eod-kpi-sub">{taxRate}% VAT</div>
              </div>
              <div className="eod-kpi">
                <div className="eod-kpi-label">Avg. Order</div>
                <div className="eod-kpi-val">{fmt(eodAOV)}</div>
                <div className="eod-kpi-sub">per transaction</div>
              </div>
              {(eodVoided.length > 0 || eodRefunded.length > 0) && (
                <div className="eod-kpi amber">
                  <div className="eod-kpi-label">Adjustments</div>
                  <div className="eod-kpi-val">−{fmt(eodVoidAmt + eodRefundAmt)}</div>
                  <div className="eod-kpi-sub">{eodVoided.length}v + {eodRefunded.length}r</div>
                </div>
              )}
            </div>
          </div>

          <div className="eod-section">
            <div className="eod-section-title">💳 Payment Breakdown</div>
            <div className="eod-split-bar">
              <div className="eod-split-labels">
                <span className="eod-split-label" style={{ color: "var(--green-text)" }}>
                  💵 Cash &nbsp;<span style={{ color: "var(--text3)", fontWeight: 400 }}>{eodCashCount} orders</span>
                </span>
                <span className="eod-split-label" style={{ color: "var(--blue)" }}>
                  📱 GCash &nbsp;<span style={{ color: "var(--text3)", fontWeight: 400 }}>{eodGCashCount} orders</span>
                </span>
              </div>
              <div className="eod-split-track">
                <div className="eod-split-fill" style={{ width: `${eodNet > 0 ? eodCash / eodNet * 100 : 50}%` }} />
              </div>
              <div className="eod-split-amounts">
                <span className="eod-split-amt" style={{ color: "var(--green-text)" }}>{fmt(eodCash)}</span>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>{eodNet > 0 ? Math.round(eodCash / eodNet * 100) : 0}% cash · {eodNet > 0 ? Math.round(eodGCash / eodNet * 100) : 0}% GCash</span>
                <span className="eod-split-amt" style={{ color: "var(--blue)" }}>{fmt(eodGCash)}</span>
              </div>
            </div>
          </div>

          <div className="eod-section">
            <div className="eod-section-title">🗃️ Cash Drawer Reconciliation</div>
            <div className="eod-drawer">
              <div className="eod-drawer-row">
                <div>
                  <div className="eod-drawer-label">Opening Float</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Cash in drawer at shift start</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 700 }}>₱</span>
                  <input className="eod-drawer-input" type="number" min="0" placeholder="0.00" value={openingFloat} onChange={e => setOpeningFloat(e.target.value)} />
                </div>
              </div>
              <div className="eod-drawer-row">
                <div>
                  <div className="eod-drawer-label">Cash Sales Today</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{eodCashCount} cash transaction{eodCashCount !== 1 ? "s" : ""}</div>
                </div>
                <div className="eod-drawer-val" style={{ color: "var(--green-text)" }}>+{fmt(eodCash)}</div>
              </div>
              <div className="eod-drawer-row" style={{ background: "var(--surface2)" }}>
                <div>
                  <div className="eod-drawer-label" style={{ fontWeight: 800 }}>Expected in Drawer</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Float + cash sales</div>
                </div>
                <div className="eod-drawer-val">{fmt(eodExpected)}</div>
              </div>
              <div className="eod-drawer-row">
                <div>
                  <div className="eod-drawer-label">Actual Cash Counted</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Count your drawer now</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 700 }}>₱</span>
                  <input className="eod-drawer-input" type="number" min="0" placeholder="0.00" value={actualCash} onChange={e => setActualCash(e.target.value)} />
                </div>
              </div>
              {actualCash && (
                <div className={`eod-variance-row ${eodVariance >= 0 ? "eod-variance-good" : "eod-variance-bad"}`}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{eodVariance === 0 ? "✓ Perfect match" : eodVariance > 0 ? "⬆ Cash over" : "⬇ Cash short"}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 900 }}>{eodVariance >= 0 ? "+" : ""}{fmt(eodVariance)}</div>
                </div>
              )}
            </div>
          </div>

          {eodTopItems.length > 0 && (
            <div className="eod-section">
              <div className="eod-section-title">🏆 Top Items Today</div>
              <div className="eod-items-list">
                {eodTopItems.map((item, i) => (
                  <div key={item.id} className="eod-item-row">
                    <div className={`eod-item-rank${i === 0 ? " gold" : i === 1 ? " silver" : i === 2 ? " bronze" : ""}`}>{i + 1}</div>
                    <div className="eod-item-icon">{item.icon}</div>
                    <div className="eod-item-name">{item.name}</div>
                    <div className="eod-item-qty">{item.qty} sold</div>
                    <div className="eod-item-rev">{fmt(item.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(eodKitchenDone > 0 || eodKitchenPending > 0) && (
            <div className="eod-section">
              <div className="eod-section-title">🧾 Order Performance</div>
              <div className="eod-kpi-row">
                <div className={`eod-kpi ${eodKitchenDone > 0 ? "green" : ""}`}>
                  <div className="eod-kpi-label">Orders Completed</div>
                  <div className="eod-kpi-val">{eodKitchenDone}</div>
                  <div className="eod-kpi-sub">tickets closed</div>
                </div>
                {eodKitchenPending > 0 && (
                  <div className="eod-kpi amber">
                    <div className="eod-kpi-label">Still Pending</div>
                    <div className="eod-kpi-val">{eodKitchenPending}</div>
                    <div className="eod-kpi-sub">in queue</div>
                  </div>
                )}
                {eodKitchenDone > 0 && (
                  <div className="eod-kpi">
                    <div className="eod-kpi-label">Avg. Wait Time</div>
                    <div className="eod-kpi-val">{eodAvgWait}m</div>
                    <div className="eod-kpi-sub">fire to done</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(eodVoided.length > 0 || eodRefunded.length > 0) && (
            <div className="eod-section">
              <div className="eod-section-title">⚠️ Voids & Refunds</div>
              <div className="eod-kpi-row">
                {eodVoided.length > 0 && (
                  <div className="eod-kpi red">
                    <div className="eod-kpi-label">Voided</div>
                    <div className="eod-kpi-val">{eodVoided.length}</div>
                    <div className="eod-kpi-sub">−{fmt(eodVoidAmt)}</div>
                  </div>
                )}
                {eodRefunded.length > 0 && (
                  <div className="eod-kpi amber">
                    <div className="eod-kpi-label">Refunded</div>
                    <div className="eod-kpi-val">{eodRefunded.length}</div>
                    <div className="eod-kpi-sub">−{fmt(eodRefundAmt)}</div>
                  </div>
                )}
                <div className="eod-kpi">
                  <div className="eod-kpi-label">Total Adjustments</div>
                  <div className="eod-kpi-val">−{fmt(eodVoidAmt + eodRefundAmt)}</div>
                  <div className="eod-kpi-sub">excluded from revenue</div>
                </div>
              </div>
            </div>
          )}

          {lowStock.length > 0 && (
            <div className="eod-section">
              <div className="eod-section-title">📦 Restock Tonight ({lowStock.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {lowStock.map(p => (
                  <div key={p.id} className="eod-item-row">
                    <div className="eod-item-icon">{p.icon}</div>
                    <div className="eod-item-name">{p.name}</div>
                    <span className={`badge ${p.stock === 0 ? "bg-red" : "bg-amber"}`}>{p.stock === 0 ? "OUT OF STOCK" : p.stock + " units left"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="eod-footer">
          {eodClosed
            ? <div className="eod-closed-stamp">✓ Day closed at {eodClosedAt}</div>
            : <div style={{ fontSize: 12, color: "var(--text3)" }}>Close the day to stamp this report with a timestamp. This doesn't lock the system.</div>
          }
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEodOpen(false)}>Close</button>
            {!eodClosed && (
              <button className="eod-close-day-btn" onClick={() => {
                const t = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
                setEodClosed(true); setEodClosedAt(t);
              }}>
                ✓ Close Day
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
