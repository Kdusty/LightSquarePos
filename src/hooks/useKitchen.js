import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

export function useKitchen() {
  const [kitchenQueue, setKitchenQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch the active queue from PostgreSQL (ignoring done tickets)
      const { data, error } = await supabase
        .from("kitchen_tickets")
        .select("*")
        .eq("owner_id", user.id)
        .is("doneAt", null)
        .order("firedAt", { ascending: true }); // Oldest tickets must print first

      if (!error && data) setKitchenQueue(data);
      setLoading(false);

      // Inject Realtime Subscription
      channel = supabase.channel('kitchen-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'kitchen_tickets', filter: `owner_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setKitchenQueue((prev) => {
                if (prev.some(t => t.id === payload.new.id)) return prev;
                return [...prev, payload.new].sort((a, b) => new Date(a.firedAt) - new Date(b.firedAt));
              });
            } else if (payload.eventType === 'UPDATE') {
              // If it was marked as done by another terminal, instantly purge it from the local active queue
              if (payload.new.doneAt) {
                 setKitchenQueue((prev) => prev.filter(t => t.id !== payload.new.id));
              } else {
                 setKitchenQueue((prev) => prev.map(t => t.id === payload.new.id ? payload.new : t));
              }
            } else if (payload.eventType === 'DELETE') {
              setKitchenQueue((prev) => prev.filter(t => t.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }
    
    load();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  async function addTicket(ticket) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from("kitchen_tickets")
      .insert([{ ...ticket, owner_id: user.id }])
      .select()
      .single();
      
    if (!error && data) {
      setKitchenQueue(prev => {
        if (prev.some(t => t.id === data.id)) return prev;
        return [...prev, data];
      });
    } else {
      console.error("Failed to fire kitchen ticket to database:", error);
    }
  }

  async function updateTicket(id, changes) {
    const { data, error } = await supabase
      .from("kitchen_tickets")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setKitchenQueue(prev => prev.map(t => t.id === id ? data : t));
    }
  }

  return { kitchenQueue, loading, addTicket, updateTicket };
}
