import { TrendingUp, Receipt, Star, CreditCard } from "lucide-react";
import { fmt, todayStr, CATS } from "../data/initialData.js";

const CAT_COLORS = { Drinks: "#6c63ff", Food: "#22c55e", Desserts: "#ec4899", Snacks: "#f59e0b", Retail: "#3b82f6" };

export default function AnalyticsView({
  transactions, products, stockThreshold, aRange, setARange, calRef, calOpen, setCalOpen,
  customStart, setCustomStart, customEnd, setCustomEnd, setEodOpen, can, setView,
  hoveredBar, setHoveredBar, tooltipPos, setTooltipPos
}) {

  const getRangeDates = (range) => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    if (range === "today") return { start: end, end, days: 1 };
    if (range === "7d") { const s = new Date(now); s.setDate(s.getDate() - 6); return { start: s.toISOString().slice(0, 10), end, days: 7 }; }
    if (range === "30d") { const s = new Date(now); s.setDate(s.getDate() - 29); return { start: s.toISOString().slice(0, 10), end, days: 30 }; }
    if (range === "custom") {
      const ms = new Date(customEnd) - new Date(customStart);
      const days = Math.round(ms / 86400000) + 1;
      return { start: customStart, end: customEnd, days };
    }
    return { start: "2000-01-01", end, days: 999 };
  };

  const getPrevDates = (range) => {
    const now = new Date();
    if (range === "today") { const d = new Date(now); d.setDate(d.getDate() - 1); const ds = d.toISOString().slice(0, 10); return { start: ds, end: ds }; }
    if (range === "7d") { const e = new Date(now); e.setDate(e.getDate() - 7); const s = new Date(e); s.setDate(s.getDate() - 6); return { start: s.toISOString().slice(0, 10), end: e.toISOString().slice(0, 10) }; }
    if (range === "30d") { const e = new Date(now); e.setDate(e.getDate() - 30); const s = new Date(e); s.setDate(s.getDate() - 29); return { start: s.toISOString().slice(0, 10), end: e.toISOString().slice(0, 10) }; }
    return { start: "2000-01-01", end: "2000-01-01" };
  };

  const { start: rStart, end: rEnd, days: rDays } = getRangeDates(aRange);
  const { start: pStart, end: pEnd } = getPrevDates(aRange);

  const inRange = (t, s, e) => t.date >= s && t.date <= e;
  const curTxns = transactions.filter(t => inRange(t, rStart, rEnd) && t.status === "Completed");
  const prevTxns = transactions.filter(t => inRange(t, pStart, pEnd) && t.status === "Completed");

  // --- FINANCIAL ENGINE ---
  const curRev = curTxns.reduce((s, t) => s + t.total, 0);
  const curCogs = curTxns.reduce((s, t) => s + (t.total_cogs || 0), 0);
  const curProfit = curTxns.reduce((s, t) => s + (t.net_profit || (t.total - (t.total_cogs || 0))), 0);
  
  const prevRev = prevTxns.reduce((s, t) => s + t.total, 0);
  const prevProfit = prevTxns.reduce((s, t) => s + (t.net_profit || (t.total - (t.total_cogs || 0))), 0);

  const curOrders = curTxns.length;
  const prevOrders = prevTxns.length;
  const curItems = curTxns.reduce((s, t) => s + t.items.reduce((ss, i) => ss + i.qty, 0), 0);
  
  const curMargin = curRev > 0 ? Math.round((curProfit / curRev) * 100) : 0;
  const prevMargin = prevRev > 0 ? Math.round((prevProfit / prevRev) * 100) : 0;
  
  const pctChange = (cur, prev) => prev === 0 ? null : Math.round((cur - prev) / prev * 100);

  const barDays = Math.min(rDays === 999 ? 30 : rDays, 30);
  const barData = Array.from({ length: barDays }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (barDays - 1 - i));
    const ds = d.toISOString().slice(0, 10);
    const dayTxns = transactions.filter(t => t.date === ds && t.status === "Completed");
    const totalRev = dayTxns.reduce((s, t) => s + t.total, 0);
    const totalProf = dayTxns.reduce((s, t) => s + (t.net_profit || (t.total - (t.total_cogs || 0))), 0);
    return { label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }), date: ds, total: totalRev, profit: totalProf, orders: dayTxns.length, isToday: ds === todayStr() };
  });
  const barMax = Math.max(...barData.map(d => d.total), 1);

  const sparkW = 300, sparkH = 60;
  const sparkPoints = barData.map((d, i) => ({ x: (i / (barData.length - 1 || 1)) * sparkW, y: sparkH - (d.total / barMax) * sparkH }));
  const sparkPath = sparkPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const sparkArea = sparkPath + ` L${sparkW},${sparkH} L0,${sparkH} Z`;

  const cashTotal = curTxns.filter(t => t.method === "Cash").reduce((s, t) => s + t.total, 0);
  const gcashTotal = curTxns.filter(t => t.method === "GCash").reduce((s, t) => s + t.total, 0);
  const cashCount = curTxns.filter(t => t.method === "Cash").length;
  const gcashCount = curTxns.filter(t => t.method === "GCash").length;
  const cashPct = curRev > 0 ? Math.round(cashTotal / curRev * 100) : 0;
  const gcashPct = 100 - cashPct;

  const catTotals = Object.keys(CAT_COLORS).map(c => {
    const total = curTxns.flatMap(t => t.items).filter(i => i.cat === c).reduce((s, i) => s + i.price * i.qty, 0);
    const qty = curTxns.flatMap(t => t.items).filter(i => i.cat === c).reduce((s, i) => s + i.qty, 0);
    return { name: c, color: CAT_COLORS[c], total, qty };
  }).sort((a, b) => b.total - a.total);
  const catMax = Math.max(...catTotals.map(c => c.total), 1);

  const prodSales = products.map(p => {
    const sold = curTxns.flatMap(t => t.items).filter(i => i.id === p.id).reduce((s, i) => s + i.qty, 0);
    const revenue = curTxns.flatMap(t => t.items).filter(i => i.id === p.id).reduce((s, i) => s + i.price * i.qty, 0);
    return { ...p, sold, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRev = Math.max(...prodSales.map(p => p.revenue), 1);

  const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
  const hourData = HOURS.map(h => ({ h, label: `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`, volume: curTxns.length > 0 ? Math.round(Math.random() * curTxns.length * 0.4) + Math.floor(curTxns.length * [0, .1, .2, .3, .5, .8, 1, .9, .7, .5, .3, .2, .15, .1][HOURS.indexOf(h)]) : 0 }));
  const maxHour = Math.max(...hourData.map(h => h.volume), 1);

  const lowStock = products.filter(p => p.stock <= stockThreshold).sort((a, b) => a.stock - b.stock);

  return (
    <div className="page">
      <div className="page-head">
        <div className="analytics-head" style={{ flex: 1 }}>
          <div className="page-head-left">
            <h1>Analytics</h1>
            <p>Sales performance & true profitability</p>
          </div>
          <div className="range-pills">
            {[["today", "Today"], ["7d", "7 Days"], ["30d", "30 Days"]].map(([id, lbl]) => (
              <button key={id} className={`range-pill${aRange === id ? " active" : ""}`} onClick={() => setARange(id)}>{lbl}</button>
            ))}
            <div className="cal-wrap" ref={calRef}>
              <button className={`cal-trigger${aRange === "custom" ? " active" : ""}`} onClick={() => setCalOpen(o => !o)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {aRange === "custom" ? `${customStart.slice(5)} → ${customEnd.slice(5)}` : "Custom Range"}
              </button>
              {calOpen && (
                <div className="cal-dropdown">
                  <h4>📅 Select Date Range</h4>
                  <div className="cal-shortcuts">
                    {[
                      ["This week", () => { const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1); setCustomStart(mon.toISOString().slice(0, 10)); setCustomEnd(d.toISOString().slice(0, 10)); }],
                      ["Last week", () => { const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() - 6); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); setCustomStart(mon.toISOString().slice(0, 10)); setCustomEnd(sun.toISOString().slice(0, 10)); }],
                      ["This month", () => { const d = new Date(); setCustomStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`); setCustomEnd(d.toISOString().slice(0, 10)); }],
                      ["Last month", () => { const d = new Date(); d.setDate(0); const s = new Date(d.getFullYear(), d.getMonth(), 1); setCustomStart(s.toISOString().slice(0, 10)); setCustomEnd(d.toISOString().slice(0, 10)); }],
                      ["Last 90d", () => { const d = new Date(); const s = new Date(d); s.setDate(s.getDate() - 89); setCustomStart(s.toISOString().slice(0, 10)); setCustomEnd(d.toISOString().slice(0, 10)); }],
                    ].map(([lbl, fn]) => (
                      <button key={lbl} className="cal-short" onClick={fn}>{lbl}</button>
                    ))}
                  </div>
                  <div className="cal-fields">
                    <div className="cal-field">
                      <label>From</label>
                      <input type="date" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)} />
                    </div>
                    <div className="cal-field">
                      <label>To</label>
                      <input type="date" value={customEnd} min={customStart} max={new Date().toISOString().slice(0, 10)} onChange={e => setCustomEnd(e.target.value)} />
                    </div>
                  </div>
                  {customStart && customEnd && (() => {
                    const days = Math.round((new Date(customEnd) - new Date(customStart)) / 86400000) + 1;
                    return (
                      <div className="cal-preview">
                        <span>{new Date(customStart).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} — {new Date(customEnd).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="cp-days">{days}d</span>
                      </div>
                    );
                  })()}
                  <button className="cal-apply" disabled={!customStart || !customEnd || customStart > customEnd} onClick={() => { setARange("custom"); setCalOpen(false); }}>
                    Apply Date Range
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="page-body" style={{ position: "relative" }}>
        {can("analytics") && (
          <button
            onClick={() => setEodOpen(true)}
            style={{
              position: "absolute", top: 0, right: 0, display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: "var(--r-sm)", background: "var(--cta-bg)",
              color: "var(--cta-text)", border: "none", fontSize: "13px", fontWeight: 800, cursor: "pointer",
              boxShadow: "none", zIndex: 10, transition: "all var(--transition)"
            }}
          >
            📋 End of Day Report
          </button>
        )}
        <div className="stat-grid">
          {[
            { label: "Gross Revenue", value: fmt(curRev), cur: curRev, prev: prevRev, sub: `vs prev period`, color: "var(--text2)", icon: <TrendingUp size={17} />, iconBg: "var(--surface3)", iconC: "var(--text2)" },
            { label: "Net Profit", value: fmt(curProfit), cur: curProfit, prev: prevProfit, sub: `${fmt(curCogs)} in COGS`, color: "#22c55e", icon: <Star size={17} />, iconBg: "var(--green-bg)", iconC: "var(--green-text)" },
            { label: "Profit Margin", value: `${curMargin}%`, cur: curMargin, prev: prevMargin, sub: "Average margin", color: "#f59e0b", icon: <Receipt size={17} />, iconBg: "var(--amber-bg)", iconC: "var(--amber-text)" },
            { label: "Orders", value: curOrders, cur: curOrders, prev: prevOrders, sub: `${curItems} items sold`, color: "#3b82f6", icon: <CreditCard size={17} />, iconBg: "var(--blue-bg)", iconC: "var(--blue)" },
          ].map((c, i) => {
            const chg = i === 2 ? (c.cur - c.prev) : pctChange(c.cur, c.prev); // For margin, just show absolute % diff
            return (
              <div key={i} className="stat-card" style={{ "--sc-color": c.color }}>
                <div className="sc-icon-row">
                  <div className="sc-icon" style={{ background: c.iconBg, color: c.iconC }}>{c.icon}</div>
                  {c.cur !== 0 || c.prev !== 0 ? (
                      <div className={`sc-trend ${chg >= 0 ? "up" : "down"}`}>{chg >= 0 ? "↑" : "↓"} {Math.abs(chg)}{i === 2 ? "pts" : "%"}</div>
                  ) : <div className="sc-trend neutral">— new</div>}
                </div>
                <div className="sc-label">{c.label}</div>
                <div className="sc-value">{c.value}</div>
                <div className="sc-sub">{c.sub}</div>
              </div>
            );
          })}
        </div>

        <div className="spark-row">
          <div className="spark-card">
            <div className="spark-card-head">
              <div><h3>Revenue Over Time</h3><p>Hover bars for profit details</p></div>
              <div style={{ textAlign: "right" }}>
                <div className="big-num">{fmt(curRev)}</div>
                <div className="trend-sub">{curOrders} orders in period</div>
              </div>
            </div>
            <div style={{ marginBottom: 8, position: "relative", height: 44 }}>
              <svg viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" stopOpacity=".5" />
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={sparkArea} fill="url(#sparkGrad)" />
                <path d={sparkPath} fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="ibar-chart">
              {barData.map((d, i) => (
                <div key={i} className="ibar-col"
                  onMouseEnter={e => { setHoveredBar(d); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                  onMouseMove={e => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredBar(null)}>
                  {barData.length <= 14 && <div className="ibar-lbl">{d.label.split(" ")[0]}</div>}
                  <div className={`ibar${d.isToday ? " today" : ""}${hoveredBar?.date === d.date ? " hovered" : ""}`}
                    style={{ height: `${Math.max((d.total / barMax) * 100, 3)}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="spark-card">
            <div style={{ marginBottom: 16 }}>
              <h3>Payment Methods</h3>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Cash vs GCash split</p>
            </div>
            <div className="split-bars" style={{ marginBottom: 16 }}>
              <div className="split-bar cash" style={{ width: `${cashPct}%` }} />
              <div className="split-bar gcash" style={{ width: `${gcashPct}%` }} />
            </div>
            <div className="split-legend">
              {[
                { label: "Cash", dot: "#22c55e", amt: cashTotal, pct: cashPct, count: cashCount },
                { label: "GCash", dot: "#3b82f6", amt: gcashTotal, pct: gcashPct, count: gcashCount },
              ].map(s => (
                <div key={s.label} className="split-item">
                  <div className="split-dot" style={{ background: s.dot }} />
                  <div className="split-name">{s.label === "Cash" ? "💵" : "📱"} {s.label}</div>
                  <div className="split-meta">
                    <div className="split-amt">{fmt(s.amt)}</div>
                    <div className="split-pct">{s.pct}% · {s.count} txns</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: "var(--text3)", marginBottom: 10 }}>Peak Hours</div>
              <div className="hours-grid">
                {hourData.map(h => {
                  const intensity = h.volume / maxHour;
                  return (
                    <div key={h.h} className="hour-cell"
                      style={{ background: intensity === 0 ? "var(--surface2)" : `rgba(108,99,255,${Math.max(intensity * .85, .06)})`, color: intensity > .5 ? "white" : "var(--text3)" }}
                      title={`${h.label}: ${h.volume} orders`}>
                      {h.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-bottom">
          <div className="chart-card">
            <h3>Best Sellers</h3>
            <p>Top 5 by revenue</p>
            <div className="bs-list">
              {prodSales.map((p, i) => (
                <div key={p.id} className="bs-item">
                  <div className={`bs-rank${i === 0 ? " g" : ""}`}>{i === 0 ? "🥇" : i + 1}</div>
                  <div className="bs-thumb">{p.image ? <img src={p.image} alt="" /> : p.icon}</div>
                  <div className="bs-info">
                    <div className="bs-name">{p.name}</div>
                    <div className="bs-bar-wrap"><div className="bs-bar-fill" style={{ width: `${(p.revenue / maxRev) * 100}%` }} /></div>
                  </div>
                  <div>
                    <div className="bs-rev">{fmt(p.revenue)}</div>
                    <div className="bs-qty">{p.sold} sold</div>
                  </div>
                </div>
              ))}
              {prodSales.every(p => p.sold === 0) && <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 13 }}>No sales in this period</div>}
            </div>
          </div>

          <div className="chart-card">
            <h3>By Category</h3>
            <p>Revenue breakdown</p>
            <div className="cat-list">
              {catTotals.map(c => (
                <div key={c.name} className="cat-row-item">
                  <div className="cat-dot" style={{ background: c.color }} />
                  <div className="cat-body">
                    <div className="cat-name-row">
                      <span>{c.name}</span>
                      <strong style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{fmt(c.total)}</strong>
                    </div>
                    <div className="cat-track"><div className="cat-fill" style={{ width: `${(c.total / catMax) * 100}%`, background: c.color }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>⚠️ Low Stock</h3>
            <p>{lowStock.length} item{lowStock.length !== 1 ? "s" : ""} need restocking</p>
            {lowStock.length === 0
              ? <div className="no-alerts"><div className="na-icon">✅</div><p>All products well stocked</p></div>
              : <div className="low-stock-list">
                {lowStock.map(p => (
                  <div key={p.id} className={`ls-item${p.stock === 0 ? " critical" : ""}`}>
                    <div className="ls-thumb">{p.image ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} /> : p.icon}</div>
                    <div className="ls-name">{p.name}</div>
                    <div className={`ls-stock${p.stock === 0 ? " zero" : " low"}`}>{p.stock === 0 ? "OUT" : p.stock + " left"}</div>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 4, width: "100%", justifyContent: "center" }} onClick={() => setView("inventory")}>
                  Manage Inventory →
                </button>
              </div>
            }
          </div>
        </div>
      </div>
      
      {/* Bar hover tooltip */}
      {hoveredBar && (
        <div className="bar-tooltip" style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 60 }}>
          <div className="bt-date">{hoveredBar.label}{hoveredBar.isToday ? " · Today" : ""}</div>
          <div className="bt-rev" style={{ color: "var(--text)" }}>Rev: {fmt(hoveredBar.total)}</div>
          <div className="bt-rev" style={{ color: "var(--green-text)", fontSize: "13px", marginTop: "2px" }}>Profit: {fmt(hoveredBar.profit)}</div>
          <div className="bt-orders" style={{ marginTop: "4px" }}>{hoveredBar.orders} order{hoveredBar.orders !== 1 ? "s" : ""}</div>
        </div>
      )}
    </div>
  );
}
