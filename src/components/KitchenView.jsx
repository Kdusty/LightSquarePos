import { useState, useEffect } from "react";

export default function KitchenView({
  kitchenQueue, kitchenDone, kitchenView, setKitchenView, 
  kitchenCheckItem, kitchenDoneTicket, kitchenRecallTicket, kitchenElapsed
}) {
  
  // ── THE HEARTBEAT ENGINE ──
  // Forces the component to re-render every second so the timers actually tick.
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    
    // Cleanup function destroys the interval when you leave the view.
    return () => clearInterval(timer);
  }, []);

  const pendingCount = kitchenQueue.length;
  const urgentCount  = kitchenQueue.filter(t => kitchenElapsed(t.firedAt).mins >= 5).length;
  const avgWait = pendingCount
    ? Math.round(kitchenQueue.reduce((s, t) => s + kitchenElapsed(t.firedAt).mins, 0) / pendingCount)
    : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-left">
          <h1>👨‍🍳 Order Display</h1>
          <p>{pendingCount} order{pendingCount !== 1 ? "s" : ""} in queue{urgentCount > 0 ? ` · ⚠️ ${urgentCount} waiting long` : ""}</p>
        </div>
      </div>
      <div className="page-body">

        {/* Header row: tabs + stats */}
        <div className="kds-header">
          <div className="kds-tabs">
            <button className={`kds-tab${kitchenView === "queue" ? " active" : ""}`} onClick={() => setKitchenView("queue")}>
              🔥 Queue
              {pendingCount > 0 && <span className="kds-tab-badge">{pendingCount}</span>}
            </button>
            <button className={`kds-tab done-tab${kitchenView === "done" ? " active" : ""}`} onClick={() => setKitchenView("done")}>
              ✓ Done Today
              {kitchenDone.length > 0 && <span className="kds-tab-badge">{kitchenDone.length}</span>}
            </button>
          </div>
          <div className="kds-stats">
            <div className="kds-stat">Pending: <strong>{pendingCount}</strong></div>
            <div className="kds-stat">Completed: <strong>{kitchenDone.length}</strong></div>
            {pendingCount > 0 && <div className="kds-stat">Avg wait: <strong>{avgWait}m</strong></div>}
            {urgentCount > 0 && <div className="kds-stat" style={{ color: "var(--amber-text)", borderColor: "rgba(245,158,11,.3)" }}>⚠️ Overdue: <strong>{urgentCount}</strong></div>}
          </div>
        </div>

        {/* ── Queue View ── */}
        {kitchenView === "queue" && (
          pendingCount === 0
          ? <div className="kds-empty">
              <div className="ke-icon">✅</div>
              <h3>All caught up!</h3>
              <p>No orders in the queue right now.<br/>New orders will appear here automatically when payment is confirmed.</p>
            </div>
          : <div className="kds-grid">
              {kitchenQueue.map(ticket => {
                const { label: timeLabel, mins } = kitchenElapsed(ticket.firedAt);
                const urgency = mins >= 10 ? "critical" : mins >= 5 ? "urgent" : "";
                const timerClass = mins >= 10 ? "hot" : mins >= 5 ? "warm" : "fresh";
                const checkedCount = ticket.items.filter(i => i.checkedOff).length;
                const totalItems   = ticket.items.length;
                
                // Parse the massive UUID into a readable short ticket number
                const shortId = ticket.id ? ticket.id.split("-")[0].substring(0, 5).toUpperCase() : "ERROR";

                return (
                  <div key={ticket.id} className={`kds-ticket${urgency ? " " + urgency : ""}`}>
                    <div className="kt-head">
                      <div className="kt-num" title={ticket.id}>#{shortId}</div>
                      <div className="kt-info">
                        <div className="kt-name">{ticket.orderName}</div>
                        <div className="kt-meta">{ticket.method} · {ticket.cashier} · {new Date(ticket.firedAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                      <div className={`kt-timer ${timerClass}`}>{timeLabel}</div>
                    </div>

                    <div className="kt-items">
                      {ticket.items.map(item => (
                        <div key={item.cartKey} className={`kt-item${item.checkedOff ? " checked" : ""}`} onClick={() => kitchenCheckItem(ticket.id, item.cartKey)}>
                          <div className="kt-check">{item.checkedOff ? "✓" : ""}</div>
                          <div className="kt-item-body">
                            <div className="kt-item-name">
                              <span className="kt-item-qty">{item.qty}</span>
                              {item.name}
                            </div>
                            {item.selectedVariants?.length > 0 && (
                              <div className="kt-item-variants">
                                {item.selectedVariants.map((v, i) => (
                                  <span key={i} className="kt-variant-tag">{v.optionName}</span>
                                ))}
                              </div>
                            )}
                            {item.note && (
                              <div className="kt-item-note">📝 {item.note}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="kt-foot">
                      <div className="kt-progress">
                        <div className="kt-progress-bar" style={{ width: `${totalItems ? checkedCount / totalItems * 100 : 0}%` }}/>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8, whiteSpace: "nowrap" }}>{checkedCount}/{totalItems}</span>
                      <button className="kt-done-btn" onClick={() => kitchenDoneTicket(ticket.id)}>✓ Done</button>
                    </div>
                  </div>
                );
              })}
            </div>
        )}

        {/* ── Done View ── */}
        {kitchenView === "done" && (
          kitchenDone.length === 0
          ? <div className="kds-empty">
              <div className="ke-icon">🧺</div>
              <h3>Nothing completed yet</h3>
              <p>Completed orders will appear here after they're marked done in the queue.</p>
            </div>
          : <div className="kds-grid">
              {kitchenDone.map(ticket => {
                const firedAt  = new Date(ticket.firedAt);
                const doneAt   = new Date(ticket.doneAt);
                const waitMins = Math.round((doneAt - firedAt) / 60000);
                const doneTime = doneAt.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

                const shortId = ticket.id ? ticket.id.split("-")[0].substring(0, 5).toUpperCase() : "ERROR";

                return (
                  <div key={ticket.id} className="kds-ticket done-ticket">
                    <div className="kt-head">
                      <div className="kt-num" title={ticket.id}>#{shortId}</div>
                      <div className="kt-info">
                        <div className="kt-name">{ticket.orderName}</div>
                        <div className="kt-meta">{ticket.method} · {ticket.cashier}</div>
                      </div>
                      <div className="kt-timer done">✓ {waitMins}m</div>
                    </div>
                    <div className="kt-items">
                      {ticket.items.map(item => (
                        <div key={item.cartKey} className="kt-item checked" style={{ cursor: "default" }}>
                          <div className="kt-check" style={{ pointerEvents: "none" }}>✓</div>
                          <div className="kt-item-body">
                            <div className="kt-item-name">
                              <span className="kt-item-qty">{item.qty}</span>
                              {item.name}
                            </div>
                            {item.selectedVariants?.length > 0 && (
                              <div className="kt-item-variants">
                                {item.selectedVariants.map((v, i) => (
                                  <span key={i} className="kt-variant-tag">{v.optionName}</span>
                                ))}
                              </div>
                            )}
                            {item.note && <div className="kt-item-note">📝 {item.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="kt-foot">
                      <div className="kt-done-stamp">✓ Completed at {doneTime} · {waitMins}m wait</div>
                      <button className="kt-recall-btn" onClick={() => kitchenRecallTicket(ticket.id)}>↩ Recall</button>
                    </div>
                  </div>
                );
              })}
            </div>
        )}

      </div>
    </div>
  );
}
