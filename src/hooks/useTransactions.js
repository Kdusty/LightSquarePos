import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("owner_id", user.id)
        .order("date", { ascending: false });
        
      if (!error) setTransactions(data);
      setLoading(false);

      // Inject Realtime Subscription
      channel = supabase.channel('transactions-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `owner_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTransactions((prev) => {
                if (prev.some(t => t.id === payload.new.id)) return prev;
                // Prepend and force sort so the newest is always top
                return [payload.new, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
              });
            } else if (payload.eventType === 'UPDATE') {
              setTransactions((prev) =>
                prev.map((t) => (t.id === payload.new.id ? payload.new : t))
              );
            } else if (payload.eventType === 'DELETE') {
              setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }
    
    load();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function saveTransaction(txn) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated" } };
  
  // We keep the ID. If it exists, Postgres uses it. If undefined, Postgres generates it.
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ ...txn, owner_id: user.id }])
    .select()
    .single();
      
    if (!error && data) {
      setTransactions((prev) => {
        if (prev.some(t => t.id === data.id)) return prev;
        return [data, ...prev];
      });
    }
    
    return { data, error }; 
  }

  async function voidTransaction(id) {
    const { data, error } = await supabase
      .from("transactions")
      .update({ status: "Voided" })
      .eq("id", id)
      .select()
      .single();
    if (!error) setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
  }

  async function refundTransaction(id) {
    const { data, error } = await supabase
      .from("transactions")
      .update({ status: "Refunded" })
      .eq("id", id)
      .select()
      .single();
    if (!error) setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
  }

  return { transactions, loading, saveTransaction, voidTransaction, refundTransaction };
}
