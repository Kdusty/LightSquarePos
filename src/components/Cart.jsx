import { Trash2, PauseCircle, Plus, Minus, ShoppingCart, Banknote, CreditCard, Tag, X } from "lucide-react";
import { fmt } from "../data/initialData.js";

export default function Cart({
  orderName, setOrderName, cart, setCart, heldOrders, holdOrder, restoreHold, removeHold,
  discount, setDiscount, setDiscChoice, setModal, updateQty, setNote, noteOpen, setNoteOpen,
  subtotal, discAmt, taxRate, tax, total, payMethod, setPayMethod
}) {
  const safeTaxRate = parseFloat(taxRate) || 12;
  
  const Thumb = ({ p, size = 34, fontSize = 18 }) => (
    <div className="ci-thumb" style={{ width: size, height: size }}>
      {p.image ? <img src={p.image} alt="" /> : <span style={{ fontSize }}>{p.icon}</span>}
    </div>
  );

  return (
    <div className="cart-panel">
      <div className="cart-top">
        <span className="cart-top-title">Order</span>
        <input className="order-input" placeholder="Order Name" value={orderName} onChange={e => setOrderName(e.target.value)} />
        <button className="icon-btn accent" title="Hold order" onClick={holdOrder}><PauseCircle size={15} /></button>
        {cart.length > 0 && <button className="icon-btn danger" title="Clear cart" onClick={() => { setCart([]); setDiscount(null); setOrderName(""); }}><Trash2 size={15} /></button>}
      </div>

      <div className="cart-body">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon"><ShoppingCart size={44} strokeWidth={1} /></div>
            <div className="cart-empty-text">No items added yet.<br />Tap any product to add it.</div>
          </div>
        ) : cart.map(item => (
          <div key={item.cartKey} className="cart-item">
            <Thumb p={item} />
            <div className="ci-body">
              <div className="ci-name">{item.name}</div>
              {item.selectedVariants?.length > 0 && (
                <div className="ci-variant-tags">
                  {item.selectedVariants.map((v, i) => (
                    <span key={i} className="ci-vtag">{v.optionName}{v.price > 0 && ` +₱${v.price}`}</span>
                  ))}
                </div>
              )}
              <div className="ci-sub">
                <span>{fmt(item.price)} ea.</span>
                {item.note && !noteOpen?.[item.cartKey] && <span className="ci-note-text">📝 {item.note}</span>}
              </div>
              {noteOpen?.[item.cartKey] && (
                <input className="note-input" placeholder="Add note (e.g. no sugar)…" value={item.note}
                  onChange={e => setNote(item.cartKey, e.target.value)}
                  onBlur={() => setNoteOpen(n => ({ ...n, [item.cartKey]: false }))}
                  autoFocus />
              )}
              <div className="ci-controls">
                <button className="qty-btn" onClick={() => updateQty(item.cartKey, -1)}><Minus size={11} /></button>
                <span className="qty-num">{item.qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.cartKey, +1)}><Plus size={11} /></button>
                <button className="note-btn" onClick={() => setNoteOpen(n => ({ ...n, [item.cartKey]: !n?.[item.cartKey] }))}>
                  {item.note ? "📝 edit" : "+ note"}
                </button>
              </div>
            </div>
            <div className="ci-total">{fmt(item.price * item.qty)}</div>
          </div>
        ))}

        {cart.length > 0 && (
          <div className="disc-row">
            <Tag size={13} style={{ color: "var(--text3)" }} />
            <span className="disc-row-label">Discount</span>
            <button className={`disc-pill${discount ? " applied" : ""}`} onClick={() => setDiscChoice(discount || true)}>
              {discount ? `${discount.name || discount.label} · ${discount.pct}%` : "Add discount"}
            </button>
            {discount && <span className="disc-amount">−{fmt(discAmt)}</span>}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="totals">
            <div className="total-row"><span className="lbl">Subtotal</span><span className="val">{fmt(subtotal)}</span></div>
            {discAmt > 0 && <div className="total-row"><span className="lbl">Discount</span><span className="val green">−{fmt(discAmt)}</span></div>}
            <div className="total-row"><span className="lbl">VAT {safeTaxRate}%</span><span className="val">{fmt(tax)}</span></div>
            <div className="tot-divider" />
            <div className="total-row grand"><span className="lbl">Total</span><span className="val">{fmt(total)}</span></div>
          </div>
          <div className="pay-row">
            <button className={`pay-btn${payMethod === "Cash" ? " active" : ""}`} onClick={() => setPayMethod("Cash")}><Banknote size={15} />Cash</button>
            <button className={`pay-btn gcash${payMethod === "GCash" ? " active" : ""}`} onClick={() => setPayMethod("GCash")}><CreditCard size={15} />GCash</button>
          </div>
          <button className="charge-btn" onClick={() => setModal(payMethod === "Cash" ? "cash" : "gcash")}>
            Charge {fmt(total)}
          </button>
        </div>
      )}

      {heldOrders.length > 0 && (
        <div className="hold-bar">
          {heldOrders.map((h, i) => (
            <div key={i} className="hold-chip" onClick={() => restoreHold(h)}>
              <PauseCircle size={12} />{h.name}
              <span style={{ color: "var(--text3)", fontSize: 11 }}>({h.items?.length || 0})</span>
              <button className="hold-chip-x" onClick={e => { e.stopPropagation(); removeHold(h.id); }}><X size={11} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
