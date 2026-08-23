import { X, Printer, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";
import { fmt } from "../data/initialData.js";

export default function PaymentModals({
  modal, setModal, total, cashAmt, setCashAmt, confirmPayment,
  gcashQR, lastTxn, viewTxn, setViewTxn, birInfo, storeName, currentUser, taxRate, showToast
}) {
  // If we are viewing a historical transaction from the Transactions Tab, 
  // we force the receipt modal to render using the viewTxn data.
  const isHistoricalView = !!viewTxn;
  const targetTxn = isHistoricalView ? viewTxn : lastTxn;
  const isReceiptVisible = modal === "receipt" || isHistoricalView;

  if (!modal && !isHistoricalView) return null;

  const safeTaxRate = parseFloat(taxRate) || 12;
  const cashN = parseFloat(cashAmt) || 0;
  const change = cashN - total;

  return (
    <div className="overlay" onClick={e => {
      if (e.target === e.currentTarget) {
        setModal(null);
        if (setViewTxn) setViewTxn(null);
      }
    }}>
      <div className={`modal ${isReceiptVisible ? "or-modal" : ""}`} id={isReceiptVisible ? "receipt-payment" : undefined}>
        
        {modal === "cash" && !isHistoricalView && (
          <>
            <div className="modal-head"><h2>Cash Payment</h2><button className="modal-x" onClick={() => setModal(null)}><X size={15}/></button></div>
            <div className="amt-due"><span className="lbl">Amount Due</span><span className="val">{fmt(total)}</span></div>
            <div className="quick-amts">
              {[100, 200, 500, 1000, 2000].map(a => <button key={a} className="qa-btn" onClick={() => setCashAmt(String(a))}>₱{a}</button>)}
              <button className="qa-btn" onClick={() => setCashAmt(String(Math.ceil(total / 50) * 50))}>Round</button>
            </div>
            <div className="cash-wrap">
              <span className="cash-pfx">₱</span>
              <input className="cash-input" type="number" placeholder="0.00" value={cashAmt} onChange={e => setCashAmt(e.target.value)} autoFocus />
            </div>
            {cashN > 0 && cashN < total && <div className="insuf"><AlertTriangle size={15}/>Still needs {fmt(total - cashN)}</div>}
            {cashN >= total && <div className="change-box"><span className="lbl">Change</span><span className="val">{fmt(change)}</span></div>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={cashN < total} onClick={confirmPayment}>Confirm Payment</button>
            </div>
          </>
        )}

        {modal === "gcash" && !isHistoricalView && (
          <>
            <div className="modal-head"><h2>GCash Payment</h2><button className="modal-x" onClick={() => setModal(null)}><X size={15}/></button></div>
            <div className="gcash-header"><h3>Scan to Pay</h3><div className="gamt">{fmt(total)}</div></div>
            <div className="gcash-qr-area">
              {gcashQR ? <img src={gcashQR} alt="GCash QR"/> : <div className="no-qr"><CreditCard size={36} strokeWidth={1}/><span>No QR uploaded</span></div>}
            </div>
            <div className="steps">
              {["Open GCash app", "Tap 'Scan QR Code'", "Enter exact amount & confirm"].map((s, i) => (
                <div key={i} className="step"><span className="step-n">{i + 1}</span>{s}</div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmPayment}><CheckCircle size={15}/>Payment Received</button>
            </div>
          </>
        )}

        {isReceiptVisible && targetTxn && (() => {
          const vatAmt = targetTxn.tax || 0;
          const vatableSales = targetTxn.total - vatAmt; 
          const vatExempt = 0;
          
          // Use the historical date from the DB, or fallback to current date
          const dateFormatted = new Date(targetTxn.date || new Date()).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"});
          const timeFormatted = new Date(targetTxn.created_at || new Date()).toLocaleTimeString("en-PH",{hour:"2-digit",minute:"2-digit"});
          
          // Generate a Short ID from the massive UUID (e.g. #a74b)
          const shortId = "#" + targetTxn.id.split("-")[0].substring(0, 5).toUpperCase();

          return (
            <>
              <div className="or-success-bar" style={{ background: isHistoricalView ? "var(--surface2)" : undefined }}>
                {isHistoricalView ? <span className="s-icon">🧾</span> : <span className="s-icon">✅</span>}
                <div>
                  <h2 style={{ color: isHistoricalView ? "var(--text)" : undefined }}>
                    {isHistoricalView ? "Transaction Record" : "Payment Successful!"}
                  </h2>
                  <p>{isHistoricalView ? `Historical receipt view · ${targetTxn.status}` : `Official receipt generated · ${targetTxn.method}`}</p>
                </div>
                {isHistoricalView && (
                  <button className="modal-x" onClick={() => setViewTxn(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text2)" }}><X size={18}/></button>
                )}
              </div>
              <div className="or-paper">
                <div className="or-header">
                  <div className="or-biz-name">{birInfo.businessName || storeName}</div>
                  <div className="or-owner">{birInfo.ownerName}</div>
                  <div className="or-address">{birInfo.address}</div>
                  <div className="or-contact">{birInfo.contact ? `📞 ${birInfo.contact}` : ""}</div>
                  <div className="or-tin-row">{birInfo.tin ? `TIN: ${birInfo.tin}` : ""}</div>
                </div>
                <div className="or-title-row">
                  <div className="or-title">🧾 Official Receipt</div>
                  <div className="or-ref" title={targetTxn.id}>{shortId}</div>
                </div>
                <div className="or-meta">
                  <span><strong>{dateFormatted}</strong></span>
                  <span>{timeFormatted}</span>
                  <span>Cashier: <strong>{targetTxn.cashier || currentUser?.name || "Unknown"}</strong></span>
                </div>
                <div className="or-items">
                  {targetTxn.items.map((item, i) => (
                    <div key={i} className="or-item-row">
                      <div className="or-item-left">
                        <div className="or-item-name">{item.icon} {item.name}</div>
                        {item.selectedVariants?.length > 0 && (
                          <div style={{display:"flex",flexWrap:"wrap",gap:3,margin:"2px 0"}}>
                            {item.selectedVariants.map((v,vi)=>(
                              <span key={vi} style={{fontSize:10,background:"var(--surface3)",border:"1px solid var(--border2)",borderRadius:99,padding:"1px 6px",color:"var(--text2)",fontWeight:600}}>{v.optionName}</span>
                            ))}
                          </div>
                        )}
                        <div className="or-item-sub">{fmt(item.price)} × {item.qty}{item.note && ` · ${item.note}`}</div>
                      </div>
                      <div className="or-item-right">
                        <div className="or-item-total">{fmt(item.price * item.qty)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="or-totals">
                  <div className="or-t-row"><span>Subtotal</span><span className="v">{fmt(targetTxn.subtotal)}</span></div>
                  {targetTxn.discount > 0 && <div className="or-t-row disc"><span>Discount</span><span className="v">−{fmt(targetTxn.discount)}</span></div>}
                  <div className="or-t-row"><span>VAT {safeTaxRate}%</span><span className="v">{fmt(vatAmt)}</span></div>
                  <div className="or-t-row grand"><span>TOTAL DUE</span><span className="v">{fmt(targetTxn.total)}</span></div>
                  <div className="or-payment-badge">{targetTxn.method==="Cash"?"💵":"📱"} Paid via {targetTxn.method} — {fmt(targetTxn.total)}</div>
                </div>
                <div className="or-vat-breakdown">
                  <div className="or-vat-col"><div className="lbl">Vatable Sales</div><div className="val">{fmt(vatableSales)}</div></div>
                  <div className="or-vat-col"><div className="lbl">VAT Amount</div><div className="val">{fmt(vatAmt)}</div></div>
                  <div className="or-vat-col"><div className="lbl">VAT Exempt</div><div className="val">{fmt(vatExempt)}</div></div>
                </div>
                <div className="or-footer">
                  <p>{birInfo.footer}</p>
                  <div className="or-accred">{birInfo.vatReg ? `${birInfo.vatReg} · Accred. No: ${birInfo.accreditationNo}` : ""}</div>
                </div>
              </div>
              <div className="receipt-actions print-hide">
                <button className="print-btn" onClick={() => { document.getElementById("receipt-payment").classList.add("print-receipt-root"); window.print(); setTimeout(()=>document.getElementById("receipt-payment").classList.remove("print-receipt-root"),500); }}>
                  <Printer size={15} style={{marginRight: 6}} /> Print Receipt
                </button>
                {isHistoricalView ? (
                   <button className="charge-btn" style={{ flex: 1, margin: 0, background: "var(--surface3)", color: "var(--text)" }} onClick={() => setViewTxn(null)}>Close Viewer</button>
                ) : (
                   <button className="charge-btn" style={{ flex: 1, margin: 0 }} onClick={() => setModal(null)}>New Order →</button>
                )}
              </div>
            </>
          );
        })()}

      </div>
    </div>
  );
}
