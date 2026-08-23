import { Search, Receipt } from "lucide-react";
import { fmt, todayStr } from "../data/initialData.js";

export default function TransactionsView({
  transactions, txnSearch, setTxnSearch, txnMethod, setTxnMethod,
  txnDateRange, setTxnDateRange, txnCustStart, setTxnCustStart,
  txnCustEnd, setTxnCustEnd, txnCalOpen, setTxnCalOpen, txnCalRef,
  exportCSV, setViewTxn, can, openVoid, openRefund
}) {
  const now2 = new Date();
  const txnStartDate = txnDateRange === "today" ? todayStr()
    : txnDateRange === "week" ? (() => { const d = new Date(now2); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); })()
    : txnDateRange === "month" ? `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, "0")}-01`
    : txnDateRange === "custom" ? txnCustStart : null;
  const txnEndDate = txnDateRange === "custom" ? txnCustEnd : todayStr();

  const filtered2 = transactions.filter(t => {
    if (txnMethod !== "all" && t.method !== txnMethod) return false;
    if (txnStartDate && (t.date < txnStartDate || t.date > txnEndDate)) return false;
    const q = txnSearch.toLowerCase();
    if (q && !t.id.toLowerCase().includes(q) && !t.items.some(i => i.name.toLowerCase().includes(q))) return false;
    return true;
  });

  const activeTxns = filtered2.filter(t => t.status === "Completed");
  const filtRev = activeTxns.reduce((s, t) => s + t.total, 0);
  const filtOrders = activeTxns.length;
  const filtAOV = filtOrders ? filtRev / filtOrders : 0;
  const voidedCount = filtered2.filter(t => t.status === "Voided").length;
  const refundedCount = filtered2.filter(t => t.status === "Refunded").length;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-left">
          <h1>Transactions</h1>
          <p>{filtered2.length} of {transactions.length} records</p>
        </div>
      </div>
      <div className="page-body">
        <div className="txn-stats">
          <div className="txn-stat">
            <div className="txn-stat-label">Active Revenue</div>
            <div className="txn-stat-value">{fmt(filtRev)}</div>
            <div className="txn-stat-sub">{filtOrders} completed order{filtOrders !== 1 ? "s" : ""}</div>
          </div>
          <div className="txn-stat">
            <div className="txn-stat-label">Avg. Order Value</div>
            <div className="txn-stat-value">{fmt(filtAOV)}</div>
            <div className="txn-stat-sub">per completed transaction</div>
          </div>
          <div className="txn-stat">
            <div className="txn-stat-label">Adjustments</div>
            <div className="txn-stat-value" style={{ fontSize: 15, display: "flex", gap: 14, alignItems: "center", marginTop: 4 }}>
              <span style={{ color: "var(--red-text)" }}>🚫 {voidedCount} void{voidedCount !== 1 ? "s" : ""}</span>
              <span style={{ color: "var(--amber-text)" }}>↩ {refundedCount} refund{refundedCount !== 1 ? "s" : ""}</span>
            </div>
            <div className="txn-stat-sub">excluded from revenue</div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <div className="search-wrap" style={{ maxWidth: 220 }}>
              <span className="search-icon"><Search size={14} /></span>
              <input className="search-input" placeholder="Order ID or item…" value={txnSearch} onChange={e => setTxnSearch(e.target.value)} />
            </div>
            <div style={{ flex: 1 }} />
            <div className="txn-method-btns">
              <button className={`txn-method-btn${txnMethod === "all" ? " active" : ""}`} onClick={() => setTxnMethod("all")}>All</button>
              <button className={`txn-method-btn cash${txnMethod === "Cash" ? " active" : ""}`} onClick={() => setTxnMethod("Cash")}>💵 Cash</button>
              <button className={`txn-method-btn gcash${txnMethod === "GCash" ? " active" : ""}`} onClick={() => setTxnMethod("GCash")}>📱 GCash</button>
            </div>
            <div className="txn-date-btns">
              {[["all", "All"], ["today", "Today"], ["week", "This Week"], ["month", "This Month"]].map(([id, lbl]) => (
                <button key={id} className={`txn-date-btn${txnDateRange === id ? " active" : ""}`} onClick={() => setTxnDateRange(id)}>{lbl}</button>
              ))}
              <div style={{ position: "relative" }} ref={txnCalRef}>
                <button className={`txn-date-btn${txnDateRange === "custom" ? " active" : ""}`} onClick={() => setTxnCalOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {txnDateRange === "custom" && txnCustStart ? `${txnCustStart.slice(5)} → ${txnCustEnd.slice(5)}` : "Custom"}
                </button>
                {txnCalOpen && (
                  <div className="cal-dropdown" style={{ right: 0, left: "auto", minWidth: 260 }}>
                    <h4>📅 Custom Date Range</h4>
                    <div className="cal-fields">
                      <div className="cal-field">
                        <label>From</label>
                        <input type="date" value={txnCustStart} max={txnCustEnd || todayStr()} onChange={e => setTxnCustStart(e.target.value)} />
                      </div>
                      <div className="cal-field">
                        <label>To</label>
                        <input type="date" value={txnCustEnd} min={txnCustStart} max={todayStr()} onChange={e => setTxnCustEnd(e.target.value)} />
                      </div>
                    </div>
                    {txnCustStart && txnCustEnd && (
                      <div className="cal-preview">
                        <span style={{ fontSize: 11 }}>{txnCustStart} → {txnCustEnd}</span>
                        <span className="cp-days">{Math.round((new Date(txnCustEnd) - new Date(txnCustStart)) / 86400000) + 1}d</span>
                      </div>
                    )}
                    <button className="cal-apply" disabled={!txnCustStart || !txnCustEnd || txnCustStart > txnCustEnd} onClick={() => { setTxnDateRange("custom"); setTxnCalOpen(false); }}>
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ padding: "9px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface2)" }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>{filtered2.length} record{filtered2.length !== 1 ? "s" : ""} matching current filters</span>
            <button className="print-btn" style={{ flex: "none", padding: "6px 14px", fontSize: 12 }} onClick={() => {
              const date = new Date().toISOString().slice(0, 10);
              exportCSV(filtered2, `lightsquare-transactions-${date}.csv`);
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export CSV
            </button>
          </div>

          {filtered2.length === 0 ? (
            <div className="txn-empty">
              <div className="e-icon">🔍</div>
              <p>No transactions match your filters.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Method</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered2.map(t => {
                  const isToday = t.date === todayStr();
                  const isActive = t.status === "Completed";
                  const isVoided = t.status === "Voided";
                  const isRefunded = t.status === "Refunded";
                  return (
                    <tr key={t.id} className={isVoided ? "voided" : ""} onClick={() => setViewTxn(t)} style={{ cursor: "pointer" }}>
                      <td>
                        <code style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 800, color: isVoided ? "var(--text3)" : isRefunded ? "var(--amber-text)" : "var(--accent-text)" }} title={t.id}>
                          #{t.id.split("-")[0].substring(0, 5).toUpperCase()}
                        </code>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>{t.date}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {t.items.slice(0, 2).map((it, i) => (
                            <span key={i} style={{ fontSize: 12, color: "var(--text2)" }}>{it.icon} {it.name} ×{it.qty}</span>
                          ))}
                          {t.items.length > 2 && <span style={{ fontSize: 11, color: "var(--text3)" }}>+{t.items.length - 2} more</span>}
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 800 }}>{fmt(t.total)}</td>
                      <td>
                        <span className={`badge ${t.method === "Cash" ? "bg-gray" : "bg-blue"}`}>
                          {t.method === "Cash" ? "💵 Cash" : "📱 GCash"}
                        </span>
                      </td>
                      <td>
                        {isActive && <span className="badge bg-green">✓ Completed</span>}
                        {isVoided && <span className="badge bg-voided">🚫 Voided</span>}
                        {isRefunded && <span className="badge bg-refunded">↩ Refunded</span>}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="action-cell">
                          <button className="view-receipt-btn" onClick={() => setViewTxn(t)}><Receipt size={12} /> View</button>
                          {isActive && isToday && can("void") && <button className="void-btn" onClick={() => openVoid(t)}>🚫 Void</button>}
                          {isActive && can("refund") && <button className="refund-btn" onClick={() => openRefund(t)}>↩ Refund</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {filtered2.length > 0 && (
            <div style={{ padding: "11px 18px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text3)", display: "flex", justifyContent: "space-between" }}>
              <span>Showing {filtered2.length} transaction{filtered2.length !== 1 ? "s" : ""}</span>
              <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--text)" }}>Total: {fmt(filtRev)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
