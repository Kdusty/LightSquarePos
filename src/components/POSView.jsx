import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { fmt } from "../data/initialData.js";
import ProductGrid from "./ProductGrid.jsx";
import Cart from "./Cart.jsx";

export default function POSView({
  // ProductGrid Props
  products, search, setSearch, cat, setCat, cartQtyMap, addItem,

  // Cart Props
  orderName, setOrderName, cart, setCart, heldOrders, holdOrder, restoreHold, removeHold,
  discount, setDiscount, setDiscChoice, setModal, updateQty, setNote, noteOpen, setNoteOpen,
  subtotal, discAmt, taxRate, tax, total, payMethod, setPayMethod,

  // Variant Modal
  setVariantModal
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Auto-close sheet when cart empties (after checkout completes)
  useEffect(() => {
    if (cart.length === 0) setSheetOpen(false);
  }, [cart.length]);

  return (
    <div className="pos-layout">
      <ProductGrid
        products={products}
        search={search}
        setSearch={setSearch}
        cat={cat}
        setCat={setCat}
        cartQtyMap={cartQtyMap}
        addItem={addItem}
        setVariantModal={setVariantModal}
      />

      {/* Backdrop — only visible on mobile when sheet is open */}
      {sheetOpen && <div className="mcs-backdrop" onClick={() => setSheetOpen(false)} />}

      {/* Cart: normal sidebar on desktop, slide-up sheet on mobile via CSS */}
      <div className={`mcs-outer${sheetOpen ? " open" : ""}`}>
        <Cart
          orderName={orderName}
          setOrderName={setOrderName}
          cart={cart}
          setCart={setCart}
          heldOrders={heldOrders}
          holdOrder={holdOrder}
          restoreHold={restoreHold}
          removeHold={removeHold}
          discount={discount}
          setDiscount={setDiscount}
          setDiscChoice={setDiscChoice}
          setModal={setModal}
          updateQty={updateQty}
          setNote={setNote}
          noteOpen={noteOpen}
          setNoteOpen={setNoteOpen}
          subtotal={subtotal}
          discAmt={discAmt}
          taxRate={taxRate}
          tax={tax}
          total={total}
          payMethod={payMethod}
          setPayMethod={setPayMethod}
        />
      </div>

      {/* Mobile FAB — hidden on desktop via CSS; shows when cart has items */}
      {cartCount > 0 && (
        <button className="mobile-cart-fab" onClick={() => setSheetOpen(true)}>
          <span className="mcf-badge">{cartCount}</span>
          <span className="mcf-label">View Order</span>
          <span className="mcf-total">{fmt(total)}</span>
        </button>
      )}
    </div>
  );
}
