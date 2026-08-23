import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { deleteProductImage } from "../lib/storage.js";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function load() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) { setLoading(false); return; }

        // Initial Fetch
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .eq("owner_id", user.id)
          .order("id");
          
        if (error) throw error;
        
        setProducts(data);
        localStorage.setItem("lightsquare_cached_products", JSON.stringify(data));

        // Inject Realtime Subscription
        channel = supabase.channel('products-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products', filter: `owner_id=eq.${user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT' && payload.new.active) {
                setProducts((prev) => {
                  if (prev.some(p => p.id === payload.new.id)) return prev; // Prevent duplicate glitch
                  return [...prev, payload.new];
                });
              } else if (payload.eventType === 'UPDATE') {
                setProducts((prev) => {
                  // If it was soft-deleted, purge it from the UI immediately
                  if (!payload.new.active) return prev.filter(p => p.id !== payload.new.id);
                  
                  const exists = prev.some(p => p.id === payload.new.id);
                  if (exists) {
                     return prev.map((p) => (p.id === payload.new.id ? payload.new : p));
                  } else {
                     return [...prev, payload.new];
                  }
                });
              } else if (payload.eventType === 'DELETE') {
                setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to offline product cache.");
        const cached = localStorage.getItem("lightsquare_cached_products");
        if (cached) setProducts(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    }
    
    load();

    // Cleanup function to kill the WebSocket connection if the component unmounts
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Note: We keep local optimistic updates for immediate UI feedback.
  // The WebSocket payload will arrive ~50ms later but the duplicate check will ignore it.
  async function addProduct(p) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("products")
      .insert([{ ...p, variants: p.variants ?? [], owner_id: user.id }])
      .select()
      .single();
    if (!error) setProducts((prev) => {
        if (prev.some(existing => existing.id === data.id)) return prev;
        return [...prev, data];
    });
  }

  async function updateProduct(id, changes) {
    const { data, error } = await supabase
      .from("products")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (!error) setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
  }

  async function deleteProduct(id) {
    const product = products.find((p) => p.id === id);
    if (product?.image) deleteProductImage(product.image);
    await supabase.from("products").update({ active: false }).eq("id", id);
    // Realtime will catch this update, but doing it optimistically makes the app feel faster
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function refreshProducts() {
    // Left intact for manual override
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("owner_id", user.id)
        .order("id");
      if (error) throw error;
      setProducts(data);
    } catch (err) {}
  }

  return { products, setProducts, loading, addProduct, updateProduct, deleteProduct, refreshProducts };
}
