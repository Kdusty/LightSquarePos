import { X, Plus, Upload, ShoppingCart, Trash2 } from "lucide-react";
import { fmt, ICON_LIBRARY, CATS } from "../data/initialData.js";

export default function MiscModals({
  products, 
  
  modal, setModal, prodForm, setPF, editProd, setEditProd, mediaMode, setMediaMode,
  iconCat, setIconCat, imgUpRef, handleImgUpload, saveProd, addVGroup, updVGroup,
  delVGroup, addVOption, updVOption, delVOption, clearPendingImg,

  staffModal, setStaffModal, staffForm, setStaffForm, editStaff, setEditStaff, saveStaff,
  
  voidModal, setVoidModal, voidReason, setVoidReason, confirmVoid,
  
  refundModal, setRefundModal, refundType, setRefundType, refundItems, setRefundItems,
  refundReason, setRefundReason, restoreStock, setRestoreStock, confirmRefund, calcRefundAmount,
  
  variantModal, setVariantModal, variantPicks, setVariantPicks, addToCartWithVariants
}) {

  const sanitiseCat = (c) => {
    if (!c) return null;
    const trimmed = c.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };
  
  const dbCats = products ? products.map(p => sanitiseCat(p.cat)).filter(Boolean) : [];
  const dropDownCats = [...new Set([...CATS.slice(1), ...dbCats])];
  
  return (
    <>
      {modal === "product" && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal xl">
            <div className="modal-head">
              <h2>{editProd ? "Edit Product" : "Add Product"}</h2>
              <button className="modal-x" onClick={() => setModal(null)}><X size={15} /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: .6, color: "var(--text3)", marginBottom: 10 }}>Product Visual</div>
              <div className="prod-media-row">
                <div className={`media-opt${mediaMode === "icon" ? " sel" : ""}`} onClick={() => setMediaMode("icon")}>
                  <div className="mo-icon">🎨</div>
                  <div className="mo-label">Choose Icon</div>
                </div>
                <div className={`media-opt${mediaMode === "upload" ? " sel" : ""}`} onClick={() => setMediaMode("upload")}>
                  <div className="mo-icon"><Upload size={22} /></div>
                  <div className="mo-label">Upload Image</div>
                </div>
              </div>

              {mediaMode === "icon" && (
                <div className="icon-picker-wrap">
                  <div className="icon-picker-tabs">
                    {Object.keys(ICON_LIBRARY).map(k => (
                      <button key={k} className={`ip-tab${iconCat === k ? " active" : ""}`} onClick={() => setIconCat(k)}>{k}</button>
                    ))}
                  </div>
                  <div style={{ background: "var(--surface2)", borderRadius: "var(--r-sm)", padding: 8, border: "1px solid var(--border)", boxShadow: "var(--sh-inset)" }}>
                    <div className="icon-grid">
                      {ICON_LIBRARY[iconCat].map((ico, i) => (
                        <div key={i} className={`icon-cell${prodForm.icon === ico ? " sel" : ""}`}
                          onClick={() => { clearPendingImg(); setPF(p => ({ ...p, icon: ico, image: null })); }}
                          title={ico}>{ico}</div>
                      ))}
                    </div>
                  </div>
                  {prodForm.icon && <div style={{ marginTop: 8, fontSize: 12, color: "var(--text3)" }}>Selected: <span style={{ fontSize: 20 }}>{prodForm.icon}</span></div>}
                </div>
              )}

              {mediaMode === "upload" && (
                <>
                  <input ref={imgUpRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImgUpload} />
                  <div className="upload-drop" onClick={() => imgUpRef.current.click()}>
                    {prodForm.image ? <><img src={prodForm.image} className="upload-preview" alt="" /><p style={{ color: "var(--accent-text)", fontWeight: 700 }}>✓ Uploaded — click to change</p></>
                      : <><Upload size={32} style={{ opacity: .4, margin: "0 auto", display: "block" }} /><p>Click to upload product photo<br /><span style={{ fontSize: 11 }}>JPG, PNG, WebP</span></p></>}
                  </div>
                </>
              )}
            </div>

            <div className="form-grid" style={{ marginBottom: 4 }}>
              <div className="form-field full"><label>Product Name</label><input placeholder="e.g. Caramel Macchiato" value={prodForm.name} onChange={e => setPF(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-field"><label>Selling Price (₱)</label><input type="number" placeholder="0.00" value={prodForm.price} onChange={e => setPF(p => ({ ...p, price: e.target.value }))} /></div>
              <div className="form-field"><label>Cost (COGS)</label><input type="number" placeholder="0.00" value={prodForm.cogs || ""} onChange={e => setPF(p => ({ ...p, cogs: e.target.value }))} /></div>
              <div className="form-field"><label>Stock</label><input type="number" placeholder="0" value={prodForm.stock} onChange={e => setPF(p => ({ ...p, stock: e.target.value }))} /></div>
              
              <div className="form-field full">
                <label>Category</label>
                <select 
                  value={dropDownCats.includes(prodForm.cat) ? prodForm.cat : "___CUSTOM___"} 
                  onChange={e => {
                    if (e.target.value !== "___CUSTOM___") {
                      setPF(p => ({ ...p, cat: e.target.value }));
                    } else {
                      setPF(p => ({ ...p, cat: "" }));
                    }
                  }}
                  style={{ marginBottom: (!dropDownCats.includes(prodForm.cat) || prodForm.cat === "") ? 8 : 0 }}
                >
                  {dropDownCats.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="___CUSTOM___">➕ Create New Category...</option>
                </select>
                {(!dropDownCats.includes(prodForm.cat) || prodForm.cat === "") && (
                  <input 
                    placeholder="Type new category name..." 
                    value={prodForm.cat} 
                    onChange={e => setPF(p => ({ ...p, cat: e.target.value }))} 
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="var-builder">
              <div className="var-builder-head">
                <h4>✦ Product Variants <span style={{ fontWeight: 400, color: "var(--text3)", fontSize: 12 }}>({prodForm.variants.length} group{prodForm.variants.length !== 1 ? "s" : ""})</span></h4>
                <button className="btn btn-secondary btn-sm" onClick={addVGroup}><Plus size={12} />Add Group</button>
              </div>
              {prodForm.variants.length === 0 && (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--text3)", fontSize: 13, background: "var(--surface2)", borderRadius: "var(--r-sm)", border: "1px dashed var(--border2)" }}>
                  No variants yet — add a group like "Size" or "Temperature"
                </div>
              )}
              {prodForm.variants.map(g => (
                <div key={g.id} className="var-group-card">
                  <div className="var-group-top">
                    <input className="name-in" placeholder="Group name (e.g. Size)" value={g.name} onChange={e => updVGroup(g.id, "name", e.target.value)} />
                    <label className="var-req-toggle">
                      <input type="checkbox" checked={g.required} onChange={e => updVGroup(g.id, "required", e.target.checked)} />
                      Required
                    </label>
                    <button className="var-del-btn" onClick={() => delVGroup(g.id)}><X size={11} /></button>
                  </div>
                  <div className="var-options-list">
                    {g.options.map(o => (
                      <div key={o.id} className="var-opt-row">
                        <input className="var-opt-row name-in" placeholder="Option name" value={o.name} onChange={e => updVOption(g.id, o.id, "name", e.target.value)} style={{ flex: 1, padding: "6px 9px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xs)", fontSize: "12.5px", color: "var(--text)", outline: "none" }} />
                        <span style={{ fontSize: 12, color: "var(--text3)", flexShrink: 0 }}>+₱</span>
                        <input className="var-opt-row price-in" type="number" placeholder="0" value={o.price} min="0" onChange={e => updVOption(g.id, o.id, "price", +e.target.value)} style={{ width: 72, padding: "6px 9px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xs)", fontSize: "12.5px", fontFamily: "var(--mono)", color: "var(--text)", outline: "none" }} />
                        <button className="var-del-btn" onClick={() => delVOption(g.id, o.id)}><X size={11} /></button>
                      </div>
                    ))}
                  </div>
                  <button className="var-add-opt-btn" onClick={() => addVOption(g.id)}>+ Add option</button>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProd}>{editProd ? "Save Changes" : "Add Product"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {staffModal === "staff" && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setStaffModal(null)}>
          <div className="modal" style={{ width: 420, maxWidth: "96vw" }}>
            <div className="modal-head">
              <h2>{editStaff ? "Edit Staff Member" : "Add Staff Member"}</h2>
              <button className="modal-x" onClick={() => setStaffModal(null)}><X size={15} /></button>
            </div>
            <div className="form-grid">
              <div className="form-field full">
                <label>Full Name</label>
                <input placeholder="e.g. Maria Santos" value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-field full">
                <label>Role</label>
                <select value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="cashier">Cashier — POS only</option>
                  <option value="manager">Manager — Analytics, Transactions, Inventory view</option>
                  <option value="owner">Owner — Full access</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: .6, color: "var(--text3)", display: "block", marginBottom: 10 }}>4-Digit PIN</label>
              <div className="pin-input-row">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i} className="pin-input-box" type="password" inputMode="numeric" maxLength={1}
                    value={staffForm.pin[i] || ""}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/, "");
                      if (!v && staffForm.pin[i]) {
                        setStaffForm(f => ({ ...f, pin: f.pin.slice(0, i) + f.pin.slice(i + 1) }));
                        return;
                      }
                      const arr = [...staffForm.pin.padEnd(4, " ").split("")];
                      arr[i] = v;
                      setStaffForm(f => ({ ...f, pin: arr.join("").replace(/ /g, "").slice(0, 4) }));
                      if (v) document.querySelectorAll(".pin-input-box")[i + 1]?.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !staffForm.pin[i]) document.querySelectorAll(".pin-input-box")[i - 1]?.focus();
                    }}
                  />
                ))}
              </div>
              {staffForm.pin.length === 4 && <div style={{ fontSize: 11, color: "var(--green-text)", textAlign: "center", fontWeight: 700, marginTop: 6 }}>✓ PIN set</div>}
              {staffForm.pin.length > 0 && staffForm.pin.length < 4 && <div style={{ fontSize: 11, color: "var(--amber-text)", textAlign: "center", marginTop: 6 }}>{4 - staffForm.pin.length} more digit{4 - staffForm.pin.length !== 1 ? "s" : ""} needed</div>}
            </div>
            <label className="restore-toggle" style={{ marginBottom: 16 }}>
              <input type="checkbox" checked={staffForm.active} onChange={e => setStaffForm(f => ({ ...f, active: e.target.checked }))} style={{ accentColor: "var(--accent)" }} />
              <div className="restore-toggle-text">
                <strong>Active account</strong>
                <span>Inactive staff cannot log in to the POS</span>
              </div>
            </label>
            <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text2)", marginBottom: 16, boxShadow: "var(--sh-inset)" }}>
              {staffForm.role === "owner" && "👑 Full access to all features including Settings, Staff management, and financial reports."}
              {staffForm.role === "manager" && "📊 Can use POS, view Analytics and Transactions, process voids & refunds, and view Inventory."}
              {staffForm.role === "cashier" && "🧾 Can only use the Point of Sale. No access to Analytics, Settings, or financial data."}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setStaffModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={!staffForm.name.trim() || staffForm.pin.length !== 4} onClick={saveStaff}>{editStaff ? "Save Changes" : "Add Staff Member"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setVoidModal(null)}>
          <div className="modal" style={{ width: 460, maxWidth: "96vw" }}>
            <div className="modal-head">
              <h2>🚫 Void Transaction</h2>
              <button className="modal-x" onClick={() => setVoidModal(null)}><X size={15} /></button>
            </div>
            <div className="void-warning">
              <span className="w-icon">⚠️</span>
              <div>
                <h4>This action cannot be undone</h4>
                <p>Voiding will cancel this transaction and restore all stock. Only today's orders can be voided. Use Refund for older transactions.</p>
              </div>
            </div>
            <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "13px 15px", marginBottom: 16, boxShadow: "var(--sh-inset)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <code style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 13, color: "var(--accent-text)" }}>{voidModal.id}</code>
                <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15 }}>{fmt(voidModal.total)}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>{voidModal.date} · {voidModal.method} · {voidModal.items.length} item{voidModal.items.length !== 1 ? "s" : ""}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {voidModal.items.map((it, i) => (
                  <span key={i} style={{ fontSize: 12, color: "var(--text2)" }}>{it.icon} {it.name} ×{it.qty} — {fmt(it.price * it.qty)}</span>
                ))}
              </div>
            </div>
            <div className="reason-field">
              <label>Reason for void *</label>
              <textarea placeholder="e.g. Duplicate order, wrong items entered…" value={voidReason} onChange={e => setVoidReason(e.target.value)} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setVoidModal(null)}>Cancel</button>
              <button className="btn" style={{ background: "var(--red-text)", color: "white", border: "none", opacity: voidReason.trim() ? 1 : .45, cursor: voidReason.trim() ? "pointer" : "not-allowed" }} onClick={confirmVoid}>🚫 Confirm Void</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (() => {
        const t = refundModal;
        const refundAmt = calcRefundAmount();
        return (
          <div className="overlay" onClick={e => e.target === e.currentTarget && setRefundModal(null)}>
            <div className="modal" style={{ width: 500, maxWidth: "96vw" }}>
              <div className="modal-head">
                <h2>↩ Refund Transaction</h2>
                <button className="modal-x" onClick={() => setRefundModal(null)}><X size={15} /></button>
              </div>
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "12px 15px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--sh-inset)" }}>
                <div>
                  <code style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 13, color: "var(--accent-text)" }}>{t.id}</code>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{t.date} · {t.method}</div>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 16 }}>{fmt(t.total)}</span>
              </div>
              <div className="refund-type-row">
                <div className={`rtype-btn${refundType === "full" ? " active" : ""}`} onClick={() => setRefundType("full")}>
                  <div className="rt-icon">💯</div>
                  <div className="rt-label">Full Refund</div>
                  <div className="rt-desc">Refund entire order: {fmt(t.total)}</div>
                </div>
                <div className={`rtype-btn${refundType === "partial" ? " active" : ""}`} onClick={() => setRefundType("partial")}>
                  <div className="rt-icon">✂️</div>
                  <div className="rt-label">Partial Refund</div>
                  <div className="rt-desc">Select which items to refund</div>
                </div>
              </div>
              {refundType === "partial" && (
                <div className="refund-items-list">
                  {t.items.map((item) => {
                    const key = item.cartKey || item.id + "__base";
                    const qty = refundItems[key] || 0;
                    return (
                      <div key={key} className="ri-row">
                        <div className="ri-thumb">{item.icon}</div>
                        <div className="ri-name">
                          {item.name}
                          {item.selectedVariants?.length > 0 && <div style={{ fontSize: 10.5, color: "var(--text3)", marginTop: 1 }}>{item.selectedVariants.map(v => v.optionName).join(" · ")}</div>}
                        </div>
                        <div className="ri-qty-ctrl">
                          <button className="ri-qty-btn" onClick={() => setRefundItems(r => ({ ...r, [key]: Math.max(0, qty - 1) }))} disabled={qty === 0}>−</button>
                          <span className="ri-qty-num">{qty}</span>
                          <button className="ri-qty-btn" onClick={() => setRefundItems(r => ({ ...r, [key]: Math.min(item.qty, qty + 1) }))} disabled={qty === item.qty}>+</button>
                        </div>
                        <span className="ri-max">/ {item.qty}</span>
                        <span className="ri-price">{fmt(item.price * qty)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="refund-summary">
                <span className="rs-label">↩ Refund Amount</span>
                <span className="rs-amount">{fmt(refundAmt)}</span>
              </div>
              <label className="restore-toggle">
                <input type="checkbox" checked={restoreStock} onChange={e => setRestoreStock(e.target.checked)} />
                <div className="restore-toggle-text">
                  <strong>Restore stock</strong>
                  <span>Add items back to inventory when refund is processed</span>
                </div>
              </label>
              <div className="reason-field">
                <label>Reason for refund *</label>
                <textarea placeholder="e.g. Wrong item delivered…" value={refundReason} onChange={e => setRefundReason(e.target.value)} />
              </div>
              {refundType === "partial" && refundAmt === 0 && (
                <div style={{ fontSize: 12, color: "var(--red-text)", marginBottom: 12, textAlign: "center", fontWeight: 700 }}>⚠️ Select at least one item to refund</div>
              )}
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setRefundModal(null)}>Cancel</button>
                <button className="btn" style={{ background: "var(--amber-text)", color: "white", border: "none", opacity: (refundReason.trim() && refundAmt > 0) ? 1 : .45, cursor: (refundReason.trim() && refundAmt > 0) ? "pointer" : "not-allowed" }} onClick={confirmRefund}>
                  ↩ Process Refund · {fmt(refundAmt)}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Variant Picker Modal */}
      {variantModal && (() => {
        const p = variantModal;
        let extraTotal = 0;
        p.variants.forEach(g => {
          (variantPicks[g.id] || []).forEach(oid => {
            const opt = g.options.find(o => o.id === oid);
            if (opt) extraTotal += opt.price;
          });
        });
        const grandTotal = p.price + extraTotal;
        return (
          <div className="overlay" onClick={e => e.target === e.currentTarget && setVariantModal(null)}>
            <div className="modal" style={{ width: 480, maxWidth: "96vw" }}>
              <div className="modal-head">
                <h2>Customize Order</h2>
                <button className="modal-x" onClick={() => setVariantModal(null)}><X size={15} /></button>
              </div>
              <div className="vp-product-header">
                <div className="vp-thumb">{p.image ? <img src={p.image} alt="" /> : p.icon}</div>
                <div>
                  <div className="vp-prod-name">{p.name}</div>
                  <div className="vp-base-price">Base price: {fmt(p.price)}</div>
                </div>
              </div>
              <div className="vp-groups">
                {p.variants.map(g => (
                  <div key={g.id} className="vp-group">
                    <div className="vp-group-label">
                      {g.name}
                      {g.required ? <span className="vp-required-chip">Required</span> : <span className="vp-optional-chip">Optional</span>}
                    </div>
                    <div className="vp-options">
                      {g.options.map(opt => {
                        const picks = variantPicks[g.id] || [];
                        const isSel = picks.includes(opt.id);
                        const isMultiSel = !g.required && isSel;
                        return (
                          <button
                            key={opt.id} className={`vp-opt${g.required && isSel ? " sel" : ""}${isMultiSel ? " sel-multi" : ""}`}
                            onClick={() => {
                              if (g.required) {
                                setVariantPicks(v => ({ ...v, [g.id]: [opt.id] }));
                              } else {
                                setVariantPicks(v => {
                                  const cur = v[g.id] || [];
                                  return { ...v, [g.id]: cur.includes(opt.id) ? cur.filter(x => x !== opt.id) : [...cur, opt.id] };
                                });
                              }
                            }}
                          >
                            {g.required && isSel && "✓ "}{opt.name}
                            {opt.price > 0 && <span className="vp-opt-price">+{fmt(opt.price)}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="vp-summary">
                <div className="vp-summary-row"><span>Base price</span><span style={{ fontFamily: "var(--mono)" }}>{fmt(p.price)}</span></div>
                {p.variants.map(g => (variantPicks[g.id] || []).map(oid => {
                  const opt = g.options.find(o => o.id === oid);
                  return opt && opt.price > 0 ? (
                    <div key={oid} className="vp-summary-row"><span>{g.name}: {opt.name}</span><span style={{ fontFamily: "var(--mono)", color: "var(--accent-text)" }}>+{fmt(opt.price)}</span></div>
                  ) : null;
                }))}
                <div className="vp-summary-row total"><span>Total per item</span><span>{fmt(grandTotal)}</span></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setVariantModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={addToCartWithVariants}><ShoppingCart size={15} /> Add to Order · {fmt(grandTotal)}</button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
