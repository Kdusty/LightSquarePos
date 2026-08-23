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
  
  // The live grenade. Confined to Vite development mode so you aren't sacked tomorrow.
  if (import.meta.env.DEV && Math.random() > 0.5) {
    throw new Error("Simulated POS Crash for Error Boundary Testing");
  }

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
  );
}
