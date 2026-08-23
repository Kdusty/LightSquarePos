import { ShoppingCart, LayoutDashboard, Package, Receipt, Settings, Zap } from "lucide-react";
import NavItem from "./NavItem.jsx";
import { ROLE_LABELS } from "../data/initialData.js";

export default function Sidebar({
  storeName, sidebarOpen, setSidebar, view, setView,
  heldOrdersCount, kitchenQueueCount, lowStockCount,
  can, currentUser, handleLock, setEodOpen,
  authUser, onOpenHelp
}) {
  
  // The mathematical lock:
  const isGodMode = authUser?.id === "e2f7ca54-3572-4085-b665-96113c8b30da";

  return (
    <aside className={`sidebar${sidebarOpen ? "" : " collapsed"}`}>
      <div className="sb-inner">
        <div className="sb-brand">
          <div className="brand-logo">
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <div className="brand-name">{storeName}</div>
            <div className="brand-tagline">Point of Sale</div>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">
            <div className="sb-section-label">Sell</div>
            <NavItem icon={<ShoppingCart size={16} />} label="Point of Sale" id="pos" active={view} onClick={setView} badge={heldOrdersCount} collapsed={!sidebarOpen} />
            <NavItem icon={<span style={{ fontSize: 15 }}>🧾</span>} label="Order Display" id="kitchen" active={view} onClick={setView} badge={kitchenQueueCount} collapsed={!sidebarOpen} />
          </div>
          {(can("analytics") || can("transactions")) && (
            <div className="sb-section">
              <div className="sb-section-label">Reports</div>
              {can("analytics") && <NavItem icon={<LayoutDashboard size={16} />} label="Analytics" id="analytics" active={view} onClick={setView} collapsed={!sidebarOpen} />}
              {can("transactions") && <NavItem icon={<Receipt size={16} />} label="Transactions" id="transactions" active={view} onClick={setView} collapsed={!sidebarOpen} />}
              {can("analytics") && <NavItem icon={<span style={{ fontSize: 15 }}>📋</span>} label="End of Day" id="eod" active={view} onClick={() => { setEodOpen(true); }} collapsed={!sidebarOpen} />}
            </div>
          )}
          <div className="sb-section">
            <div className="sb-section-label">Store</div>
            {can("inventory") && <NavItem icon={<Package size={16} />} label="Inventory" id="inventory" active={view} onClick={setView} badge={lowStockCount} collapsed={!sidebarOpen} />}
            {can("settings") && <NavItem icon={<Settings size={16} />} label="Settings" id="settings" active={view} onClick={setView} collapsed={!sidebarOpen} />}
          </div>

          {/* THE VAULT DOOR */}
          {isGodMode && (
            <div className="sb-section" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed rgba(239,68,68,.3)" }}>
              <div className="sb-section-label" style={{ color: "var(--red-text)" }}>System Admin</div>
              <NavItem 
                icon={<span style={{ fontSize: 15 }}>🛡️</span>} 
                label="God Mode" 
                id="superadmin" 
                active={view} 
                onClick={setView} 
                collapsed={!sidebarOpen} 
              />
            </div>
          )}
        </nav>

        <div className="sb-bottom">
          <button
            onClick={onOpenHelp}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              width: "100%", padding: "8px 10px", marginBottom: "8px",
              background: "none", border: "1px solid var(--border2)",
              borderRadius: "8px", color: "var(--text-muted, #888)",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
              transition: "border-color .12s, color .12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--focus-border)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text-muted, #888)"; }}
          >
            <span style={{ fontSize: "14px" }}>❓</span>
            {sidebarOpen && <span>Help</span>}
          </button>
          <div className="user-card">
            <div className={`user-av ${currentUser?.role || "cashier"}`} style={{ background: currentUser?.role === "owner" ? "var(--text)" : currentUser?.role === "manager" ? "#22c55e" : "#3b82f6", color: currentUser?.role === "owner" ? "var(--bg)" : "white" }}>
              {currentUser?.avatar || "?"}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser?.name || "Not signed in"}</div>
              <div className="user-role">{currentUser ? `${ROLE_LABELS[currentUser.role]} · Active` : "—"}</div>
            </div>
          </div>
          <button className="lock-btn" onClick={handleLock}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span>Lock / Switch User</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
