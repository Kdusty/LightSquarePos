import { useState, useEffect, useRef } from "react";
import { Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { buildCSS } from "./styles/buildCSS.js";
import { supabase } from "./lib/supabase.js";
import { uploadProductImage, deleteProductImage, isStorageUrl } from "./lib/storage.js";
import { useAuth } from "./hooks/useAuth.jsx";
import { useStoreSettings } from "./hooks/useStoreSettings.js";
import { useStaff } from "./hooks/useStaff.js";
import { useProducts } from "./hooks/useProducts.js";
import { useTransactions } from "./hooks/useTransactions.js";
import { useSubscription } from "./hooks/useSubscription.js";
import { useNetwork } from "./hooks/useNetwork.js";
import { useKitchen } from "./hooks/useKitchen";
// INJECT THESE TWO LINES:
import { usePrinter } from "./hooks/usePrinter.js";
import { buildReceiptPayload } from "./lib/escpos.js";
import { todayStr, fmt } from "./data/initialData.js";
import SuperAdminView from "./components/SuperAdminView.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// --- COMPONENTS ---
import LoginScreen from "./components/LoginScreen.jsx";
import LockScreen from "./components/LockScreen.jsx";
import Sidebar from "./components/Sidebar.jsx";
import POSView from "./components/POSView.jsx";
import KitchenView from "./components/KitchenView.jsx";
import InventoryView from "./components/InventoryView.jsx";
import TransactionsView from "./components/TransactionsView.jsx";
import AnalyticsView from "./components/AnalyticsView.jsx";
import SettingsView from "./components/SettingsView.jsx";
import PaymentModals from "./components/PaymentModals.jsx";
import EODReport from "./components/EODReport.jsx";
import MiscModals from "./components/MiscModals.jsx";

// ==========================================
// 1. THE AUTH WRAPPER (The Gatekeeper)
// ==========================================
export default function App() {
  const { user, loading: authLoading, recoveryMode } = useAuth();

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--surface)', color: 'var(--text)', fontSize: '16px', fontWeight: 600 }}>
        Authenticating Session...
      </div>
    );
  }

  if (!user || recoveryMode) return <LoginScreen />;
  return <MainApp authUser={user} />;
}

// ==========================================
// 2. THE MAIN APPLICATION (Protected)
// ==========================================
function MainApp({ authUser }) {
  const { 
    storeName, setStoreName, taxRate, setTaxRate, stockThreshold, setStockThreshold, 
    gcashQR, setGcashQR, birInfo, updBir, saveSettings 
  } = useStoreSettings();
  
  const { staff, addStaff, updateStaff, toggleStaffActive, loading: staffLoading } = useStaff();
  const { products, setProducts, addProduct, updateProduct, deleteProduct, refreshProducts, loading: productsLoading } = useProducts();
  const { transactions, saveTransaction, voidTransaction, refundTransaction, loading: transactionsLoading } = useTransactions();
  const { tier, daysLeft, status, requestUpgrade, limits } = useSubscription();

  // --- TOAST STATE (Defensive Implementation) ---
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    console.log('LightSquare POS Data Layer Mounted:', {
      authUser: authUser?.email,
      staffCount: staff?.length,
      productsCount: products?.length,
      transactionsCount: transactions?.length,
      tier,
      productLimit: limits?.products
    });
  }, [authUser, staff, products, transactions, tier, limits]);

  // ── OFFLINE CACHE & SYNC ENGINE ──
  const isOnline = useNetwork();
  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem("lightsquare_offline_queue");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (isOnline && products?.length > 0) {
      localStorage.setItem("lightsquare_cached_products", JSON.stringify(products));
    }
  }, [products, isOnline]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      processOfflineQueue();
    }
  }, [isOnline]);

  const processOfflineQueue = async () => {
    showToast(`Synchronising ${offlineQueue.length} offline transactions...`, "success");
    
    let failedQueue = [];
    
    for (const txn of offlineQueue) {
      try {
        const cartItems = txn.items.map(item => ({ product_id: item.id, qty: item.qty }));
        const { error: rpcError } = await supabase.rpc("checkout_cart", { items: cartItems });
        
        if (rpcError) {
          console.error("Offline sync RPC failed for txn:", txn.id, rpcError);
        }

        await saveTransaction(txn.payload);
      } catch (err) {
        console.error("Failed to sync offline transaction:", err);
        failedQueue.push(txn);
      }
    }

    setOfflineQueue(failedQueue);
    localStorage.setItem("lightsquare_offline_queue", JSON.stringify(failedQueue));
    
    if (failedQueue.length === 0) {
      showToast("Offline sync complete. Database reconciled.");
    } else {
      showToast(`Sync partially failed. ${failedQueue.length} pending.`, "error");
    }
    
    refreshProducts(); 
  };

  // --- GLOBAL UI STATE ---
  const [dark, setDark] = useState(true);
  const [lockScreen, setLockScreen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebar] = useState(true);
  const [view, setView] = useState("pos");

  // --- POS & CART STATE ---
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [orderName, setOrderName] = useState("");
  const [cart, setCart] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [discount, setDiscount] = useState(null);
  const [modal, setModal] = useState(null);
  const [noteOpen, setNoteOpen] = useState(null);
  const [payMethod, setPayMethod] = useState("Cash");
  const [cashAmt, setCashAmt] = useState("");
  const [lastTxn, setLastTxn] = useState(null);
  const [discChoice, setDiscChoice] = useState(false);

  // --- PRODUCT FORM STATE ---
  const [prodForm, setPF] = useState({name:"",price:"",cogs:"",cat:"Drinks",stock:"",icon:"☕",image:null,variants:[]});
  const [editProd, setEditProd] = useState(null);
  const [mediaMode, setMediaMode] = useState("icon");
  const [iconCat, setIconCat] = useState("Food & Drinks");
  const imgUpRef = useRef();
  const [pendingImgFile, setPendingImgFile] = useState(null);

  // --- STAFF MODAL STATE ---
  const [staffModal, setStaffModal] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({name:"",pin:"",role:"cashier",active:true});

  // --- VARIANT PICKER STATE ---
  const [variantModal, setVariantModal] = useState(null);
  const [variantPicks, setVariantPicks] = useState({});

  // --- VOID/REFUND STATE ---
  const [voidModal, setVoidModal] = useState(null);
  const [refundModal, setRefundModal] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundType, setRefundType] = useState("full");
  const [refundItems, setRefundItems] = useState({});
  const [restoreStock, setRestoreStock] = useState(true);

  // --- KITCHEN STATE ---
  const { kitchenQueue, addTicket, updateTicket } = useKitchen();
  const [kitchenDone, setKitchenDone] = useState([]);
  const [kitchenView, setKitchenView] = useState("queue");

  // INJECT THIS HARDWARE BLOCK:
  // --- HARDWARE STATE ---
  const { printerPort, connectPrinter, autoConnectPrinter, printReceipt, disconnectPrinter } = usePrinter();
  
  useEffect(() => {
    autoConnectPrinter(); // Silently grabs the USB port if previously authorised
  }, [autoConnectPrinter]);

  // --- TRANSACTIONS STATE ---
  const [txnSearch, setTxnSearch] = useState("");
  const [txnMethod, setTxnMethod] = useState("all");
  const [txnDateRange, setTxnDateRange] = useState("today");
  const [txnCustStart, setTxnCustStart] = useState("");
  const [txnCustEnd, setTxnCustEnd] = useState("");
  const [txnCalOpen, setTxnCalOpen] = useState(false);
  const txnCalRef = useRef();
  const [viewTxn, setViewTxn] = useState(null);

  // --- SETTINGS STATE ---
  const [settingsTab, setSettingsTab] = useState("store");
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [gcashRef, setGcashRef] = useState("");
  const [upgradeSubmitted, setUpgradeSubmitted] = useState(false);

  // --- ANALYTICS STATE ---
  const [aRange, setARange] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef();
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // --- EOD STATE ---
  const [eodOpen, setEodOpen] = useState(false);
  const [openingFloat, setOpeningFloat] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [eodClosed, setEodClosed] = useState(false);
  const [eodClosedAt, setEodClosedAt] = useState(null);

  // --- COMPUTED MATHS ---
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discPct = discount?.pct || 0;
  const discAmt = Math.round(subtotal * discPct / 100);
  const total = subtotal - discAmt; 

  // INJECT THESE TWO LINES:
  const total_cogs = cart.reduce((s, i) => s + (i.cogs || 0) * i.qty, 0);
  const net_profit = total - total_cogs;

  const safeTaxRate = parseFloat(taxRate) || 0; 
  const vatableSales = total / (1 + (safeTaxRate / 100));
  const tax = Math.round((total - vatableSales) * 100) / 100;
  
  const cartQtyMap = cart.reduce((m, i) => ({ ...m, [i.id]: (m[i.id] || 0) + i.qty }), {});
  const lowStock = products.filter(p => p.stock <= stockThreshold);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });

  const can = (action) => {
    const role = currentUser?.role;
    if (!role) return false;
    if (role === "owner") return true; 
    if (role === "manager") {
      return ["pos", "kitchen", "inventory", "transactions", "analytics", "eod", "refund", "void"].includes(action);
    }
    return ["pos", "kitchen"].includes(action);
  };
  
  const handleLock = () => {
    setLockScreen(true);
    setCurrentUser(null);
    setView("pos");
  };

  const addItem = (prod) => {
    if (prod.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === prod.id);
      if (existing) {
        if (existing.qty >= prod.stock) return prev;
        return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...prod, cartKey: Date.now().toString(), qty: 1, note: "" }];
    });
  };

  const updateQty = (key, delta) => {
    setCart(prev => prev.map(i => {
      if (i.cartKey !== key) return i;
      const n = i.qty + delta;
      if (n > i.stock) return i;
      return n > 0 ? { ...i, qty: n } : null;
    }).filter(Boolean));
  };

  const setNote = (key, text) => {
    setCart(prev => prev.map(i => i.cartKey === key ? { ...i, note: text } : i));
  };

  const holdOrder = () => {
    if (!cart.length) return;
    setHeldOrders(p => [...p, { id: Date.now().toString(), name: orderName || `Order ${p.length + 1}`, items: [...cart], total, time: new Date() }]);
    setCart([]);
    setOrderName("");
    setDiscount(null);
  };

  const restoreHold = (h) => {
    setCart(h.items);
    setOrderName(h.name);
    removeHold(h.id);
  };

  const removeHold = (id) => {
    setHeldOrders(p => p.filter(h => h.id !== id));
  };

  const confirmPayment = async () => {
    const validCart = cart.filter(i => i.id !== undefined && i.id !== null);
    if (validCart.length === 0) {
      showToast("Error: Cannot process items with missing database IDs.", "error");
      return;
    }

    // --- REUSABLE OFFLINE ENGINE ---
    const executeOfflineCheckout = async () => {
      const fakeTxnId = "offline-" + Date.now();
      const txnPayload = {
        id: fakeTxnId, 
        date: todayStr(),
        items: validCart,
        subtotal,
        discount: discAmt,
        tax,
        total,
        total_cogs,
        net_profit,
        method: payMethod,
        status: "Completed (Offline)",
        cashier: currentUser?.name || "Unknown",
      };

      const queuePayload = { id: fakeTxnId, items: validCart, payload: txnPayload };
      const newQueue = [...offlineQueue, queuePayload];
      setOfflineQueue(newQueue);
      localStorage.setItem("lightsquare_offline_queue", JSON.stringify(newQueue));

      setProducts(prev => prev.map(p => {
        const cartItem = validCart.find(ci => ci.id === p.id);
        return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
      }));

      const ticket = {
        id: fakeTxnId, 
        orderName: orderName || "Offline Order",
        items: validCart.map(i => ({
          cartKey: i.cartKey,
          icon: i.icon,
          name: i.name,
          qty: i.qty,
          note: i.note,
          selectedVariants: i.selectedVariants || [],
          checkedOff: false,
        })),
        firedAt: new Date().toISOString(),
        cashier: currentUser?.name || "Unknown",
        method: payMethod,
      };
      
      await addTicket(ticket);
      setLastTxn(txnPayload); 

      // --- HARDWARE BRIDGE EXECUTION ---
      if (printerPort) {
        try {
          const payloadBytes = buildReceiptPayload(txnPayload, storeName, cashAmt);
          await printReceipt(payloadBytes);
        } catch (err) {
          console.error("Hardware printing failed:", err);
        }
      }

      setCart([]);
      setDiscount(null);
      setCashAmt("");
      setOrderName("");
      setModal("receipt");
      showToast(`Offline Mode: Payment (${payMethod}) saved locally.`);
    };

    // ── STRICT OFFLINE BRANCH ──
    if (!isOnline) {
      await executeOfflineCheckout();
      return;
    }

    // ── ONLINE BRANCH (With Defensive Fallback) ──
    const cartItems = validCart.map(item => ({ product_id: item.id, qty: item.qty }));

    try {
      const { error } = await supabase.rpc("checkout_cart", { items: cartItems });

      if (error) {
        if (error.message?.includes("Failed to fetch") || error.message?.includes("Network")) {
          console.warn("Browser reported online, but fetch failed. Forcing offline checkout.");
          await executeOfflineCheckout();
          return;
        }

        if (error.message?.includes("insufficient_stock")) {
          showToast("One or more items just sold out. Please review your cart.", "error");
        } else {
          showToast("Payment failed: " + error.message, "error");
        }
        const { data: refreshed } = await supabase.from("products").select("*").eq("active", true).order("id");
        if (refreshed) setProducts(refreshed);
        return;
      }
    } catch (err) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("Network")) {
        console.warn("Fetch threw network error. Forcing offline checkout.");
        await executeOfflineCheckout();
        return;
      }
      showToast("Network error during payment. Please check your connection.", "error");
      return;
    }

    const txnPayload = {
      date: todayStr(),
      items: validCart,
      subtotal,
      discount: discAmt,
      tax,
      total,
      total_cogs,
      net_profit,
      method: payMethod,
      status: "Completed",
      cashier: currentUser?.name || "Unknown",
    };

    const { data: savedTxn, error: saveErr } = await saveTransaction(txnPayload);

    if (saveErr || !savedTxn) {
       showToast("Inventory updated, but receipt failed to save.", "error");
       return;
    }

    const ticket = {
      id: savedTxn.id, 
      orderName: orderName || "Order",
      items: validCart.map(i => ({
        cartKey: i.cartKey,
        icon: i.icon,
        name: i.name,
        qty: i.qty,
        note: i.note,
        selectedVariants: i.selectedVariants || [],
        checkedOff: false,
      })),
      firedAt: new Date().toISOString(),
      cashier: currentUser?.name || "Unknown",
      method: payMethod,
    };
    
    await addTicket(ticket);
    setLastTxn(savedTxn); 

    // --- HARDWARE BRIDGE EXECUTION ---
    if (printerPort) {
      try {
        const payloadBytes = buildReceiptPayload(savedTxn, storeName, cashAmt);
        await printReceipt(payloadBytes);
      } catch (err) {
        console.error("Hardware printing failed:", err);
      }
    }

    setCart([]);
    setDiscount(null);
    setCashAmt("");
    setOrderName("");
    setModal("receipt");
    showToast("Payment successful!");
  };

  const kitchenCheckItem = async (ticketId, cartKey) => {
    // Find the ticket locally, mutate the specific item, and push to Postgres
    const ticket = kitchenQueue.find(t => t.id === ticketId);
    if (!ticket) return;
    const newItems = ticket.items.map(i =>
      i.cartKey === cartKey ? { ...i, checkedOff: !i.checkedOff } : i
    );
    await updateTicket(ticketId, { items: newItems });
  };

  const kitchenDoneTicket = async (ticketId) => {
    const ticket = kitchenQueue.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Stamp it with a completion time in the database. 
    // The WebSocket will automatically remove it from the 'active' queue if we filter properly, 
    // or we can just rely on the local state to move it to the "Done" tab for the current session.
    await updateTicket(ticketId, { doneAt: new Date().toISOString() });
    
    setKitchenDone(prev => [{ ...ticket, doneAt: new Date().toISOString() }, ...prev]);
  };

  const kitchenRecallTicket = async (ticketId) => {
    const ticket = kitchenDone.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Remove from local done queue
    setKitchenDone(prev => prev.filter(t => t.id !== ticketId));
    
    // Reset the items and wipe the doneAt timestamp in Postgres so it pops back on screen
    const resetItems = ticket.items.map(i => ({ ...i, checkedOff: false }));
    await updateTicket(ticketId, { doneAt: null, items: resetItems });
  };

  const kitchenElapsed = (firedAt) => {
    const secs = Math.floor((Date.now() - new Date(firedAt).getTime()) / 1000);
    if (secs < 60) return { label: `${secs}s`, mins: secs / 60 };
    const m = Math.floor(secs / 60), s = secs % 60;
    return { label: `${m}m ${s}s`, mins: m + s / 60 };
  };

  const exportCSV = (data, filename) => {
    const header = ["ID", "Date", "Total", "Method", "Status"];
    const rows = data.map(t => [t.id, t.date, t.total, t.method, t.status]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    showToast("CSV Exported successfully!");
  };

  const saveProd = async () => {
    if (!prodForm.name || !prodForm.price) return;

    if (!editProd && limits && products.length >= limits.products) {
      showToast(`Limit Reached: Your plan restricts you to ${limits.products} products.`, "error");
      return;
    }

    let imageUrl = prodForm.image;

    if (pendingImgFile) {
      try {
        imageUrl = await uploadProductImage(pendingImgFile);
      } catch (err) {
        console.error("Storage upload failed:", err);
        showToast("Image upload failed.", "error");
        return;
      }
      if (editProd?.image && isStorageUrl(editProd.image)) deleteProductImage(editProd.image);
      if (prodForm.image?.startsWith("blob:")) URL.revokeObjectURL(prodForm.image);
    }

    const productData = { ...prodForm, image: imageUrl, price: +prodForm.price, cogs: +prodForm.cogs || 0, stock: +prodForm.stock };
    if (editProd) {
        await updateProduct(editProd.id, productData);
        showToast("Product updated successfully!");
    } else {
        await addProduct(productData);
        showToast("Product added successfully!");
    }

    setPendingImgFile(null);
    setModal(null);
    setEditProd(null);
  };

  const openAddProd = () => {
    if (prodForm.image?.startsWith("blob:")) URL.revokeObjectURL(prodForm.image);
    setPendingImgFile(null);
    setPF({ name: "", price: "", cogs: "", cat: "Drinks", stock: "", icon: "☕", image: null, variants: [] });
    setEditProd(null);
    setMediaMode("icon");
    setModal("product");
  };

  const openEditProd = (p) => {
    if (prodForm.image?.startsWith("blob:")) URL.revokeObjectURL(prodForm.image);
    setPendingImgFile(null);
    setPF({ name: p.name, price: p.price, cogs: p.cogs || "", cat: p.cat, stock: p.stock, icon: p.icon, image: p.image, variants: p.variants || [] });
    setEditProd(p);
    setMediaMode(p.image ? "upload" : "icon");
    setModal("product");
  };

  const addVGroup = () => setPF(f => ({ ...f, variants: [...f.variants, { id: "vg" + Date.now(), name: "", required: true, options: [] }] }));
  const updVGroup = (gid, key, val) => setPF(f => ({ ...f, variants: f.variants.map(g => g.id === gid ? { ...g, [key]: val } : g) }));
  const delVGroup = (gid) => setPF(f => ({ ...f, variants: f.variants.filter(g => g.id !== gid) }));
  const addVOption = (gid) => setPF(f => ({ ...f, variants: f.variants.map(g => g.id === gid ? { ...g, options: [...g.options, { id: "vo" + Date.now(), name: "", price: 0 }] } : g) }));
  const updVOption = (gid, oid, key, val) => setPF(f => ({ ...f, variants: f.variants.map(g => g.id === gid ? { ...g, options: g.options.map(o => o.id === oid ? { ...o, [key]: val } : o) } : g) }));
  const delVOption = (gid, oid) => setPF(f => ({ ...f, variants: f.variants.map(g => g.id === gid ? { ...g, options: g.options.filter(o => o.id !== oid) } : g) }));

  const handleImgUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      showToast("Image must be 5MB or smaller.", "error");
      e.target.value = "";
      return;
    }
    if (prodForm.image?.startsWith("blob:")) URL.revokeObjectURL(prodForm.image);
    setPendingImgFile(f);
    setPF(p => ({ ...p, image: URL.createObjectURL(f) }));
  };

  const saveStaff = async () => {
    if (!staffForm.name.trim() || staffForm.pin.length !== 4) return;
    const avatar = staffForm.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    
    if (editStaff) {
        await updateStaff(editStaff.id, { ...staffForm });
        showToast("Staff updated!");
    } else {
        await addStaff({ ...staffForm, avatar, created_at: new Date().toISOString().slice(0, 10) });
        showToast("Staff added!");
    }
    
    setStaffModal(null);
    setEditStaff(null);
  };

  const openAddStaff = () => {
    setStaffForm({ name: "", pin: "", role: "cashier", active: true });
    setEditStaff(null);
    setStaffModal("staff");
  };

  const openEditStaff = (s) => {
    setStaffForm({ name: s.name, pin: s.pin, role: s.role, active: s.active });
    setEditStaff(s);
    setStaffModal("staff");
  };

  const addToCartWithVariants = () => {
    const p = variantModal;
    const selected = [];
    let extraPrice = 0;
    
    p.variants.forEach(g => {
      const picks = variantPicks[g.id] || [];
      picks.forEach(optId => {
        const opt = g.options.find(o => o.id === optId);
        if (opt) {
          selected.push({ groupId: g.id, groupName: g.name, optionId: opt.id, optionName: opt.name, price: opt.price });
          extraPrice += opt.price;
        }
      });
    });

    const missingRequired = p.variants.filter(g => g.required && !(variantPicks[g.id]?.length));
    if (missingRequired.length) {
      showToast(`Please select: ${missingRequired.map(g => g.name).join(", ")}`, "error");
      return;
    }

    const cartKey = p.id + "__" + (selected.map(s => s.optionId).join("_") || "base");
    const finalPrice = p.price + extraPrice;

    setCart(prev => {
      const ex = prev.find(i => i.cartKey === cartKey);
      if (ex) return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, cartKey, price: finalPrice, selectedVariants: selected, qty: 1, note: "" }];
    });

    setVariantModal(null);
    setVariantPicks({});
  };

  const openVoid = (t) => {
    setVoidModal(t);
    setVoidReason("");
  };

  const confirmVoid = async () => {
    if (!voidReason.trim()) return;
    const t = voidModal;
    await voidTransaction(t.id);

    for (const item of t.items) {
      const p = products.find(p => p.id === item.id);
      if (p) await updateProduct(p.id, { stock: p.stock + item.qty });
    }

    setVoidModal(null);
    setVoidReason("");
    showToast("Transaction voided successfully.");
  };

  const openRefund = (t) => {
    const defaults = {};
    t.items.forEach(i => { defaults[i.cartKey || i.id + "__base"] = i.qty; });
    setRefundItems(defaults);
    setRefundType("full");
    setRefundReason("");
    setRestoreStock(true);
    setRefundModal(t);
  };

  const calcRefundAmount = () => {
    if (!refundModal) return 0;
    if (refundType === "full") return refundModal.total;

    const t = refundModal;
    const selectedSubtotal = t.items.reduce((sum, item) => {
      const key = item.cartKey || item.id + "__base";
      const qty = refundItems[key] || 0;
      return sum + item.price * qty;
    }, 0);

    const ratio = t.subtotal > 0 ? selectedSubtotal / t.subtotal : 0;
    return Math.round((selectedSubtotal - t.discount * ratio + t.tax * ratio) * 100) / 100;
  };

  const confirmRefund = async () => {
    if (!refundReason.trim()) return;
    const t = refundModal;

    const refundedItemsList = refundType === "full"
      ? t.items
      : t.items.filter(i => {
        const k = i.cartKey || i.id + "__base";
        return (refundItems[k] || 0) > 0;
      }).map(i => ({ ...i, qty: refundItems[i.cartKey || i.id + "__base"] || 0 }));

    await refundTransaction(t.id);

    if (restoreStock) {
      for (const item of refundedItemsList) {
        const p = products.find(p => p.id === item.id);
        if (p) await updateProduct(p.id, { stock: p.stock + item.qty });
      }
    }

    setRefundModal(null);
    setRefundReason("");
    setRefundItems({});
    showToast("Refund processed successfully.");
  };

  const migrateImagesToStorage = async () => {
    if (!window.confirm("This will upload all base64 product images to Supabase Storage and update the database. Proceed?")) return;

    const base64Products = products.filter(p => p.image?.startsWith("data:"));
    if (base64Products.length === 0) {
      setMigrationStatus({ running: false, done: 0, total: 0, message: "No base64 images found — already clean!" });
      showToast("No base64 images found to migrate.");
      return;
    }

    setMigrationStatus({ running: true, done: 0, total: base64Products.length, errors: [] });

    let done = 0;
    const errors = [];
    for (const product of base64Products) {
      try {
        const res = await fetch(product.image);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        const file = new File([blob], `migrated-${product.id}.${ext}`, { type: blob.type });
        const url = await uploadProductImage(file);
        await updateProduct(product.id, { image: url });
        done++;
        setMigrationStatus(s => ({ ...s, done }));
      } catch (err) {
        console.error(`Migration failed for product ${product.id}:`, err);
        errors.push(product.name);
        done++;
        setMigrationStatus(s => ({ ...s, done, errors: [...s.errors, product.name] }));
      }
    }

    setMigrationStatus(s => ({
      ...s,
      running: false,
      message: errors.length === 0
        ? `Done! ${base64Products.length} image(s) moved to Storage.`
        : `Finished with ${errors.length} error(s). Check console for details.`
    }));
    showToast(errors.length === 0 ? "Optimization Complete!" : "Optimization finished with errors.", errors.length === 0 ? "success" : "error");
  };

  if (staffLoading || productsLoading || transactionsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--surface)', color: 'var(--text)', fontSize: '16px', fontWeight: 600 }}>
        Loading LightSquare Data...
      </div>
    );
  }

  return (
    <>
      <style>{buildCSS(dark)}</style>
      
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        {lockScreen ? (
          <LockScreen 
            storeName={storeName} staff={staff} setCurrentUser={setCurrentUser} 
            setLockScreen={setLockScreen} setView={setView} 
          />
        ) : (
        <>
          <div className="app">
            <Sidebar 
              storeName={storeName} sidebarOpen={sidebarOpen} setSidebar={setSidebar} 
              view={view} setView={setView} heldOrdersCount={heldOrders.length} 
              kitchenQueueCount={kitchenQueue.length} lowStockCount={lowStock.length} 
              can={can} currentUser={currentUser} handleLock={handleLock} 
              setEodOpen={setEodOpen}
              authUser={authUser}
            />

            <div className="main">
              <header className="topbar">
                <button className="sb-toggle" onClick={() => setSidebar(v => !v)} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                  {sidebarOpen ? <ChevronLeft size={15} strokeWidth={2.5} /> : <ChevronRight size={15} strokeWidth={2.5} />}
                </button>
                <div className="topbar-title">
                  {{ pos: "Point of Sale", analytics: "Analytics", transactions: "Transactions", inventory: "Inventory", settings: "Settings" }[view]}
                  {view === "superadmin" && authUser?.id === "e2f7ca54-3572-4085-b665-96113c8b30da" && (
                <SuperAdminView showToast={showToast} />
              )}
                </div>
                <div className="topbar-date">{dateStr} · {timeStr}</div>
                <button className="theme-btn" onClick={() => setDark(d => !d)}>
                  {dark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </header>

              <ErrorBoundary>
                {view === "pos" && (
                  <POSView 
                    products={products} search={search} setSearch={setSearch} cat={cat} setCat={setCat}
                    cartQtyMap={cartQtyMap} addItem={addItem} orderName={orderName} setOrderName={setOrderName}
                    cart={cart} setCart={setCart} heldOrders={heldOrders} holdOrder={holdOrder}
                    restoreHold={restoreHold} removeHold={removeHold} discount={discount} setDiscount={setDiscount}
                    setDiscChoice={setDiscChoice} setModal={setModal} updateQty={updateQty} setNote={setNote}
                    noteOpen={noteOpen} setNoteOpen={setNoteOpen} subtotal={subtotal} discAmt={discAmt}
                    taxRate={taxRate} tax={tax} total={total} payMethod={payMethod} setPayMethod={setPayMethod}
                    setVariantModal={setVariantModal} showToast={showToast}
                  />
                )}

                {view === "kitchen" && (
                  <KitchenView 
                    kitchenQueue={kitchenQueue} kitchenDone={kitchenDone} kitchenView={kitchenView}
                    setKitchenView={setKitchenView} kitchenCheckItem={kitchenCheckItem}
                    kitchenDoneTicket={kitchenDoneTicket} kitchenRecallTicket={kitchenRecallTicket}
                    kitchenElapsed={kitchenElapsed} showToast={showToast}
                  />
                )}

                {view === "inventory" && can("inventory") && (
                  <InventoryView 
                    products={products} search={search} setSearch={setSearch} can={can} lowStock={lowStock}
                    openAddProd={openAddProd} openEditProd={openEditProd} deleteProduct={deleteProduct} setView={setView}
                    showToast={showToast}
                  />
                )}

                {view === "transactions" && can("transactions") && (
                  <TransactionsView 
                    transactions={transactions} txnSearch={txnSearch} setTxnSearch={setTxnSearch}
                    txnMethod={txnMethod} setTxnMethod={setTxnMethod} txnDateRange={txnDateRange}
                    setTxnDateRange={setTxnDateRange} txnCustStart={txnCustStart} setTxnCustStart={setTxnCustStart}
                    txnCustEnd={txnCustEnd} setTxnCustEnd={setTxnCustEnd} txnCalOpen={txnCalOpen}
                    setTxnCalOpen={setTxnCalOpen} txnCalRef={txnCalRef} exportCSV={exportCSV}
                    setViewTxn={setViewTxn} can={can} openVoid={openVoid} openRefund={openRefund}
                    showToast={showToast}
                  />
                )}

                {view === "analytics" && can("analytics") && (
                  <AnalyticsView 
                    transactions={transactions} products={products} stockThreshold={stockThreshold}
                    aRange={aRange} setARange={setARange} calRef={calRef} calOpen={calOpen} setCalOpen={setCalOpen}
                    customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd}
                    setEodOpen={setEodOpen} can={can} setView={setView} hoveredBar={hoveredBar}
                    setHoveredBar={setHoveredBar} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos}
                    showToast={showToast}
                  />
                )}

                {view === "settings" && can("settings") && (
                  <SettingsView
                    settingsTab={settingsTab} setSettingsTab={setSettingsTab} can={can} storeName={storeName}
                    setStoreName={setStoreName} stockThreshold={stockThreshold} setStockThreshold={setStockThreshold}
                    lowStock={lowStock} gcashQR={gcashQR} setGcashQR={setGcashQR} taxRate={taxRate} setTaxRate={setTaxRate}
                    birInfo={birInfo} updBir={updBir} staff={staff} currentUser={currentUser} openAddStaff={openAddStaff}
                    openEditStaff={openEditStaff} toggleStaffActive={toggleStaffActive} tier={tier} daysLeft={daysLeft}
                    status={status} upgradeTarget={upgradeTarget} setUpgradeTarget={setUpgradeTarget} gcashRef={gcashRef}
                    setGcashRef={setGcashRef} upgradeSubmitted={upgradeSubmitted} setUpgradeSubmitted={setUpgradeSubmitted}
                    requestUpgrade={requestUpgrade}
                    migrateImagesToStorage={migrateImagesToStorage} migrationStatus={migrationStatus}
                    showToast={showToast} saveSettings={saveSettings}
                    printerPort={printerPort} connectPrinter={connectPrinter} disconnectPrinter={disconnectPrinter}
                  />
                )}
              </ErrorBoundary>
            </div>
          </div>

          <PaymentModals 
            modal={modal} setModal={setModal} total={total} cashAmt={cashAmt} setCashAmt={setCashAmt}
            confirmPayment={confirmPayment} gcashQR={gcashQR} lastTxn={lastTxn} 
            viewTxn={viewTxn} setViewTxn={setViewTxn}
            birInfo={birInfo} storeName={storeName} currentUser={currentUser} taxRate={taxRate} showToast={showToast}
          />
          
          <EODReport 
            eodOpen={eodOpen} setEodOpen={setEodOpen} currentUser={currentUser} transactions={transactions}
            kitchenDone={kitchenDone} kitchenQueue={kitchenQueue} taxRate={taxRate} openingFloat={openingFloat}
            setOpeningFloat={setOpeningFloat} actualCash={actualCash} setActualCash={setActualCash}
            lowStock={lowStock} eodClosed={eodClosed} eodClosedAt={eodClosedAt} setEodClosed={setEodClosed}
            setEodClosedAt={setEodClosedAt} showToast={showToast}
          />

          {discChoice && (
            <div className="overlay" onClick={e => e.target === e.currentTarget && setDiscChoice(false)}>
              <div className="modal" style={{ maxWidth: 320 }}>
                <div className="modal-head"><h2>Apply Discount</h2></div>
                <div className="modal-body">
                  <div style={{ display: "grid", gap: 8 }}>
                    {[
                      { id: "senior", label: "Senior Citizen", pct: 20 },
                      { id: "pwd", label: "PWD", pct: 20 },
                      { id: "staff", label: "Staff Discount", pct: 15 },
                      { id: "custom10", label: "10% Off", pct: 10 }
                    ].map(d => (
                      <button key={d.id} className="btn btn-secondary" onClick={() => { setDiscount(d); setDiscChoice(false); showToast(`${d.label} applied.`); }}>
                        {d.label} ({d.pct}%)
                      </button>
                    ))}
                    <button className="btn btn-danger" onClick={() => { setDiscount(null); setDiscChoice(false); showToast("Discount removed."); }}>Remove Discount</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBoundary>
            <MiscModals
              products={products}
              modal={modal} setModal={setModal} prodForm={prodForm} setPF={setPF}
              editProd={editProd} setEditProd={setEditProd} mediaMode={mediaMode}
              setMediaMode={setMediaMode} iconCat={iconCat} setIconCat={setIconCat}
              imgUpRef={imgUpRef} handleImgUpload={handleImgUpload} saveProd={saveProd}
              addVGroup={addVGroup} updVGroup={updVGroup} delVGroup={delVGroup}
              addVOption={addVOption} updVOption={updVOption} delVOption={delVOption}
              clearPendingImg={() => {
                if (prodForm.image?.startsWith("blob:")) URL.revokeObjectURL(prodForm.image);
                setPendingImgFile(null);
              }}
              staffModal={staffModal} setStaffModal={setStaffModal} staffForm={staffForm}
              setStaffForm={setStaffForm} editStaff={editStaff} setEditStaff={setEditStaff}
              saveStaff={saveStaff} voidModal={voidModal} setVoidModal={setVoidModal}
              voidReason={voidReason} setVoidReason={setVoidReason} confirmVoid={confirmVoid}
              refundModal={refundModal} setRefundModal={setRefundModal} refundType={refundType}
              setRefundType={setRefundType} refundItems={refundItems} setRefundItems={setRefundItems}
              refundReason={refundReason} setRefundReason={setRefundReason} restoreStock={restoreStock}
              setRestoreStock={setRestoreStock} confirmRefund={confirmRefund}
              calcRefundAmount={calcRefundAmount} variantModal={variantModal}
              setVariantModal={setVariantModal} variantPicks={variantPicks}
              setVariantPicks={setVariantPicks} addToCartWithVariants={addToCartWithVariants}
              showToast={showToast}
            />
          </ErrorBoundary>

          {toast && (
            <div style={{
              position: "fixed", bottom: 20, right: 20, zIndex: 9999,
              background: toast.type === "error" ? "var(--red-bg)" : "var(--green-bg)",
              color: toast.type === "error" ? "var(--red-text)" : "var(--green-text)",
              border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.3)"}`,
              padding: "12px 20px", borderRadius: "var(--r-sm)", fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              animation: "slideUp 0.3s ease-out"
            }}>
              {toast.type === "error" ? "⚠️ " : "✅ "}{toast.message}
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
}
