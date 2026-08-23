import { Search } from "lucide-react";
import { fmt } from "../data/initialData.js";

export default function ProductGrid({ 
  products, search, setSearch, cat, setCat, cartQtyMap, addItem, setVariantModal 
}) {
  
  // ── TARGET 3: DYNAMIC & SANITISED CATEGORIES ──
  const sanitiseCat = (c) => {
    if (!c) return null;
    const trimmed = c.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // Derive unique tabs dynamically from the database records
  const dynamicCats = ["All", ...new Set(products.map(p => sanitiseCat(p.cat)).filter(Boolean))];

  // We compute the filter HERE, not in the global state, to save CPU cycles.
  const filtered = products.filter(p => {
    const productCat = sanitiseCat(p.cat);
    const matchCat = cat === "All" || productCat === cat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="products-area">
      <div className="products-controls">
        <div className="search-wrap">
          <span className="search-icon"><Search size={14}/></span>
          <input 
            className="search-input" 
            placeholder="Search products…" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="cat-pills">
          {dynamicCats.map(c => (
            <button 
              key={c} 
              className={`cat-pill${cat === c ? " active" : ""}`} 
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filtered.map(p => (
          <div 
            key={p.id} 
            className={`product-card${p.stock === 0 ? " oos" : ""}${cartQtyMap[p.id] ? " incart" : ""}`} 
            onClick={() => {
              if (p.stock === 0) return; // Prevent clicking out of stock items
              if (p.variants && p.variants.length > 0) {
                setVariantModal(p);
              } else {
                addItem(p);
              }
            }}
          >
            {p.stock > 0 && p.stock <= 5 && !cartQtyMap[p.id] && <span className="card-badge low">Low</span>}
            {cartQtyMap[p.id] && <span className="card-badge qty">{cartQtyMap[p.id]}</span>}
            
            <div className="prod-img-wrap">
              {p.image ? <img src={p.image} alt={p.name}/> : <span className="prod-emoji-display">{p.icon}</span>}
            </div>
            
            <div className="prod-info">
              <div className="prod-name">{p.name}</div>
              <div className="prod-price">
                {fmt(p.price)}{p.variants?.length > 0 && <span className="prod-from"> from</span>}
              </div>
              {p.variants?.length > 0
                ? <div className="prod-variants-hint">✦ Customizable</div>
                : <div className="prod-stock">{p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}</div>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
