import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

export function useStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at");
      if (!error) setStaff(data);
      setLoading(false);
    }
    load();
  }, []);

  async function addStaff(member) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("staff")
      .insert([{ ...member, owner_id: user.id }])
      .select()
      .single();
    if (!error) setStaff((prev) => [...prev, data]);
  }

  async function updateStaff(id, changes) {
    const { data, error } = await supabase
      .from("staff")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (!error) setStaff((prev) => prev.map((s) => (s.id === id ? data : s)));
  }

  async function toggleStaffActive(id, active) {
    await updateStaff(id, { active });
  }

  return { staff, loading, addStaff, updateStaff, toggleStaffActive };
}
