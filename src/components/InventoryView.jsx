import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { fmt } from "../data/initialData.js";

export default function InventoryView({ 
  products, search, setSearch, can, lowStock, 
  openAddProd, openEditProd, deleteProduct, setView 
}) {
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-left">
          <h1>Inventory</h1>
          <p>{products.length} products · {lowStock.length} need restocking</p>
        </div>
        {can("inventory_edit") && (
          <button className="btn btn-primary" onClick={openAddProd}>
            <Plus size={15}/>Add Product
          </button>
        )}
      </div>
      <div className="page-body">
        <div className="table-card">
          <div className="table-toolbar">
            <div className="search-wrap" style={{ maxWidth: 260 }}>
              <span className="search-icon"><Search size={14}/></span>
              <input 
                className="search-input" 
                placeholder="Search inventory…" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {!can("inventory_edit") && (
              <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: "auto" }}>
                👁 View only — contact your owner to make changes
              </span>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th>
                {can("inventory_edit") && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="tbl-prod">
                      <div className="tbl-thumb">{p.image ? <img src={p.image} alt=""/> : p.icon}</div>
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.cat === "Drinks" ? "bg-purple" : p.cat === "Food" ? "bg-green" : p.cat === "Desserts" ? "bg-red" : p.cat === "Retail" ? "bg-blue" : "bg-amber"}`}>
                      {p.cat}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{fmt(p.price)}</td>
                  <td style={{ fontFamily: "var(--mono)" }}>{p.stock}</td>
                  <td>
                    <span className={`badge ${p.stock === 0 ? "bg-red" : p.stock <= 5 ? "bg-amber" : "bg-green"}`}>
                      {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? "Low stock" : "In stock"}
                    </span>
                  </td>
                  {can("inventory_edit") && (
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditProd(p)}>
                        <Pencil size={12}/>Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>
                        <Trash2 size={12}/>Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
