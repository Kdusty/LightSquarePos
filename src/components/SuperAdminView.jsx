import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { CheckCircle, XCircle, RefreshCw, ShieldAlert } from "lucide-react";

export default function SuperAdminView({ showToast }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    // Because of our RLS God Mode policy, this will fetch everyone's data, not just yours.
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "pending")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("God Mode Fetch Error:", error);
      showToast("Failed to fetch pending requests. Check console.", "error");
    } else {
      setPending(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approvePlan = async (sub) => {
    if (!window.confirm(`Approve ${sub.tier.toUpperCase()} plan for GCash Ref: ${sub.gcash_ref}?`)) return;

    // Calculate expiry: 365 days for annual, 30 days for everything else
    const days = sub.tier === "annual" ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", sub.id);

    if (error) {
      showToast("Approval failed: " + error.message, "error");
    } else {
      showToast(`${sub.tier.toUpperCase()} Plan activated successfully!`);
      fetchPending();
    }
  };

  const rejectPlan = async (sub) => {
    if (!window.confirm(`Reject this request? They will be locked out if their trial is expired.`)) return;
    
    const { error } = await supabase
      .from("subscriptions")
      .update({ 
        status: "rejected",
        updated_at: new Date().toISOString()
      })
      .eq("id", sub.id);

    if (error) {
      showToast("Rejection failed: " + error.message, "error");
    } else {
      showToast("Plan rejected.", "error");
      fetchPending();
    }
  };

  return (
    <div className="page">
      <div className="page-head" style={{ borderBottomColor: "rgba(239,68,68,.2)" }}>
        <div className="page-head-left">
          <h1 style={{ color: "var(--red-text)", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldAlert size={24} /> Super Admin Vault
          </h1>
          <p>Pending GCash Upgrades</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchPending} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      
      <div className="page-body">
        {loading ? (
          <div style={{ padding: 20, color: "var(--text3)" }}>Scanning database...</div>
        ) : pending.length === 0 ? (
          <div className="kds-empty" style={{ borderColor: "var(--border)" }}>
            <div className="ke-icon">✅</div>
            <h3>Inbox Zero</h3>
            <p>There are no pending subscription upgrades to review.</p>
          </div>
        ) : (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Date Requested</th>
                  <th>Tenant (Owner ID)</th>
                  <th>Requested Tier</th>
                  <th>GCash Reference</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(sub => (
                  <tr key={sub.id}>
                    <td style={{ fontSize: 12, color: "var(--text3)" }}>
                      {new Date(sub.updated_at).toLocaleString("en-PH")}
                    </td>
                    <td>
                      <code style={{ fontSize: 11, color: "var(--text2)", background: "var(--surface3)", padding: "2px 6px", borderRadius: 4 }}>
                        {sub.owner_id}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${sub.tier === 'growth' ? 'bg-purple' : sub.tier === 'annual' ? 'bg-amber' : 'bg-green'}`}>
                        {sub.tier.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: 14, fontWeight: 800, color: "var(--accent-text)" }}>
                        {sub.gcash_ref}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn-secondary btn-sm" style={{ color: "var(--red-text)" }} onClick={() => rejectPlan(sub)}>
                          <XCircle size={14} /> Reject
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => approvePlan(sub)}>
                          <CheckCircle size={14} /> Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
