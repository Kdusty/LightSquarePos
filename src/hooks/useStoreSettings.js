import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

export function useStoreSettings() {
  const [storeName, setStoreName]           = useState("My Store");
  const [taxRate, setTaxRate]               = useState(12);
  const [stockThreshold, setStockThreshold] = useState(5);
  const [gcashQR, setGcashQR]               = useState(null);
  const [birInfo, setBirInfo]               = useState({
    businessName: "", ownerName: "", address: "",
    contact: "", tin: "", vatReg: "", accreditationNo: "",
    footer: "Thank you for your business!", serial: ""
  });
  const [loading, setLoading] = useState(true);

  // ── Load settings on mount (with Offline Fallback) ───────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) { setLoading(false); return; }

        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("owner_id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setStoreName(data.store_name   || "My Store");
          setTaxRate(data.tax_rate       ?? 12);
          setStockThreshold(data.stock_threshold ?? 5);
          setGcashQR(data.gcash_qr       || null);
          setBirInfo(data.bir_info       || {
            businessName: "", ownerName: "", address: "",
            contact: "", tin: "", vatReg: "", accreditationNo: "",
            footer: "Thank you for your business!", serial: ""
          });
          
          // Cache the golden state
          localStorage.setItem("lightsquare_cached_settings", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Supabase settings fetch failed. Engaging offline settings cache.");
        const cached = localStorage.getItem("lightsquare_cached_settings");
        if (cached) {
          const data = JSON.parse(cached);
          setStoreName(data.store_name   || "My Store");
          setTaxRate(data.tax_rate       ?? 12);
          setStockThreshold(data.stock_threshold ?? 5);
          setGcashQR(data.gcash_qr       || null);
          setBirInfo(data.bir_info       || birInfo);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Explicit save (Using proper UPDATE logic) ────────────────────────
  async function saveSettings(updates) {
    if (!navigator.onLine) {
      alert("You cannot modify store settings while offline.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("store_settings")
      .update(updates)
      .eq("owner_id", user.id);

    if (error) {
      console.error("saveSettings error:", error);
      alert("Database Error: " + error.message); 
    }
  }

  function updBir(field, value) {
    setBirInfo((prev) => {
      const updated = { ...prev, [field]: value };
      saveSettings({ bir_info: updated });
      return updated;
    });
  }

  return {
    storeName,   setStoreName,
    taxRate,     setTaxRate,
    stockThreshold, setStockThreshold,
    gcashQR,     setGcashQR,
    birInfo,     updBir,
    saveSettings,
    loading,
  };
}
