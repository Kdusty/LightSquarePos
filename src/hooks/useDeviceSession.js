import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";

const HEARTBEAT_MS = 60_000; // 1 minute
const TTL_MS = 3 * 60_000;   // session considered active within 3 minutes

function getOrCreateDeviceId() {
  let id = localStorage.getItem("ls_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ls_device_id", id);
  }
  return id;
}

export function useDeviceSession(deviceLimit, enabled) {
  const [allowed, setAllowed]       = useState(true);  // optimistic — never block before we know
  const [activeCount, setActiveCount] = useState(1);
  const [loading, setLoading]       = useState(false);
  const deviceId = useRef(getOrCreateDeviceId());

  // Exposed so DeviceLimitScreen can kick other devices
  async function forceUseThisDevice() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("device_sessions")
      .delete()
      .eq("owner_id", user.id)
      .neq("device_id", deviceId.current);

    await supabase
      .from("device_sessions")
      .upsert(
        { owner_id: user.id, device_id: deviceId.current, last_seen: new Date().toISOString() },
        { onConflict: "owner_id,device_id" }
      );

    setAllowed(true);
    setActiveCount(1);
  }

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    let timer;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setLoading(false); return; }

      // Register / refresh this device
      await supabase
        .from("device_sessions")
        .upsert(
          { owner_id: user.id, device_id: deviceId.current, last_seen: new Date().toISOString() },
          { onConflict: "owner_id,device_id" }
        );

      // Count active sessions (including this one)
      const cutoff = new Date(Date.now() - TTL_MS).toISOString();
      const { count } = await supabase
        .from("device_sessions")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .gte("last_seen", cutoff);

      if (!cancelled) {
        const n = count ?? 1;
        setActiveCount(n);
        setAllowed(n <= (deviceLimit ?? 1));
        setLoading(false);
      }

      // Heartbeat: keep last_seen fresh and re-evaluate the count
      timer = setInterval(async () => {
        if (cancelled) return;
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) return;

        await supabase
          .from("device_sessions")
          .update({ last_seen: new Date().toISOString() })
          .eq("owner_id", u.id)
          .eq("device_id", deviceId.current);

        const cutoffNow = new Date(Date.now() - TTL_MS).toISOString();
        const { count: c } = await supabase
          .from("device_sessions")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", u.id)
          .gte("last_seen", cutoffNow);

        if (!cancelled) {
          const n = c ?? 1;
          setActiveCount(n);
          setAllowed(n <= (deviceLimit ?? 1));
        }
      }, HEARTBEAT_MS);
    }

    init();
    return () => { cancelled = true; clearInterval(timer); };
  }, [enabled, deviceLimit]);

  return { allowed, activeCount, loading, forceUseThisDevice };
}
