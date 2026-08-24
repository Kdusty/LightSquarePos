import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

// Accurately mapped to your SettingsView.jsx and handover document
export const TIER_LIMITS = {
  trial:   { products: 14,       devices: 1, label: "14-Day Trial", price: 0 },
  starter: { products: Infinity, devices: 1, label: "Starter",      price: 299 },
  growth:  { products: Infinity, devices: 3, label: "Growth",       price: 599 },
  annual:  { products: Infinity, devices: 1, label: "Annual",       price: 2988 },
};

export function useSubscription() {
  const [tier,      setTier]      = useState("trial");
  const [daysLeft,  setDaysLeft]  = useState(null);
  const [status,    setStatus]    = useState("active");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("owner_id", user.id)
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setTier(data.tier     || "trial");
        setStatus(data.status || "active");
        if (data.expires_at) {
          const diff = new Date(data.expires_at) - new Date();
          setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function requestUpgrade(targetTier, gcashRef, storeName) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const orderCode = "LS-" + Math.random().toString(36).substr(2, 6).toUpperCase();

    const { error } = await supabase
      .from("subscriptions")
      .update({
        tier:       targetTier,
        status:     "pending",
        gcash_ref:  gcashRef,
        order_code: orderCode,
        updated_at: new Date().toISOString(),
      })
      .eq("owner_id", user.id);

    if (error) {
      console.error("Subscription upgrade error:", error);
      throw error;
    }

    // Optimistically unblock the paywall so the user gets provisional access immediately
    setStatus("pending");

    // Fire email notification — non-blocking, ignore errors
    supabase.functions.invoke("notify-payment", {
      body: {
        storeName,
        plan: targetTier,
        amount: TIER_LIMITS[targetTier]?.price,
        gcashRef,
        orderCode,
      },
    }).then(() => {});

    return orderCode;
  }

  // We now export the exact limits for the current tier so App.jsx can read them
  const activeLimits = TIER_LIMITS[tier] || TIER_LIMITS.trial;

  return { tier, daysLeft, status, loading, requestUpgrade, limits: activeLimits };
}
