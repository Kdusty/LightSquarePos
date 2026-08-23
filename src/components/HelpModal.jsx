import { useState } from "react";

const TOPICS = [
  {
    id: "pos",
    icon: "🛒",
    label: "Point of Sale",
    intro: "Your main selling screen. Use it to take orders, build a cart, and process payments.",
    steps: [
      "Browse products using the category tabs at the top (All, Drinks, Food, Desserts…).",
      "Tap any product card to add it to the cart on the right.",
      "Adjust quantity in the cart using the − and + buttons next to each item.",
      "Tap '+ note' on a cart item to add a special instruction (e.g. no ice, extra sauce).",
      "Tap 'Add discount' to apply a fixed or percentage discount to the order.",
      "Name the order using the 'Order Name' field at the top of the cart — useful for table numbers or customer names.",
      "Select Cash or GCash as the payment method at the bottom of the cart.",
      "Tap 'Charge ₱X.XX' to open the payment screen and complete the transaction.",
    ],
  },
  {
    id: "order-display",
    icon: "🍽️",
    label: "Order Display",
    intro: "The kitchen-facing screen. Every confirmed order appears here in real time so your team can prepare and track it.",
    steps: [
      "Each order card shows its order number, cashier, time placed, and list of items.",
      "Tick individual items as they are prepared — the progress bar fills as items are checked off.",
      "Tap 'Done' when all items in an order are ready to serve.",
      "The order timer turns red when a ticket has been waiting too long — act on overdue orders first.",
      "Use the 'Done Today' tab to review all orders completed during the current shift.",
      "The summary bar at the top shows Pending, Completed, Avg. Wait, and Overdue counts at a glance.",
    ],
  },
  {
    id: "analytics",
    icon: "📊",
    label: "Analytics",
    intro: "Sales performance and profitability dashboard. Filter by time range to see trends across any period.",
    steps: [
      "Use the Today / 7 Days / 30 Days / Custom Range buttons in the top right to change the reporting period.",
      "Gross Revenue shows total sales collected; Net Profit deducts your cost of goods (set COGS per product in Inventory).",
      "Profit Margin and Orders give you a quick health-check for the period.",
      "The Revenue Over Time chart shows your sales trend — hover bars to see per-day profit details.",
      "Payment Methods shows your Cash vs GCash split as a percentage and transaction count.",
      "Peak Hours highlights your busiest hours of the day so you can staff accordingly.",
      "Best Sellers lists your top 5 products by revenue — use this to plan restocks and promotions.",
      "By Category breaks down revenue across your product categories.",
      "Low Stock on the right shows items that have fallen below your restock threshold.",
    ],
  },
  {
    id: "transactions",
    icon: "🧾",
    label: "Transactions",
    intro: "A searchable record of every completed sale. Use it to look up receipts, void mistakes, and process refunds.",
    steps: [
      "Every completed order appears here with its Order ID, date, items, total, payment method, and status.",
      "Filter by payment method (Cash / GCash) using the buttons in the toolbar.",
      "Filter by time period using Today, This Week, This Month, or Custom.",
      "Search by Order ID or item name using the search bar on the left.",
      "Tap 'View' to open the full official receipt for any past transaction — you can reprint it from there.",
      "Tap 'Void' to cancel a transaction from today — stock is automatically restored to inventory. A reason is required.",
      "Tap 'Refund' on any transaction to issue a full or partial refund. You can choose whether to restore stock. A reason is required.",
      "Tap 'Export CSV' to download the current filtered list as a spreadsheet.",
    ],
  },
  {
    id: "eod",
    icon: "📋",
    label: "End of Day",
    intro: "Closes the trading day with a full revenue summary, cash reconciliation, and BIR-compliant VAT breakdown.",
    steps: [
      "Open End of Day from the sidebar. Only Owners and Managers can run it.",
      "Enter your Opening Float — the cash in the drawer at the start of the shift.",
      "Review the Revenue Summary: gross sales, discounts given, VAT collected, and average order value.",
      "The Payment Breakdown shows your Cash vs GCash totals and transaction counts side by side.",
      "Count your cash drawer and enter the actual amount in 'Actual Cash Counted' — the system shows any discrepancy.",
      "Top Items Today ranks your best-selling products for the day by revenue.",
      "Tap 'Close Day' to generate the EOD report. Print it or keep it for your records.",
    ],
  },
  {
    id: "inventory",
    icon: "📦",
    label: "Inventory",
    intro: "Manage all your products — add new items, update prices, track stock, and set up variants.",
    steps: [
      "All products are listed with their category, selling price, stock count, and status.",
      "Products below your stock threshold show an orange 'Low stock' badge — set the threshold in Settings.",
      "Tap '+ Add Product' in the top right to create a new product.",
      "Set a product icon by choosing an emoji from the built-in icon picker, or upload a photo.",
      "Enter the Product Name, Selling Price (₱), Cost / COGS (for profit tracking), Stock count, and Category.",
      "Add variants using the Product Variants section — for example: Size with options Medium (+₱20) and Large (+₱30).",
      "Tap 'Edit' on any existing product to update any of its fields.",
      "Tap 'Delete' to remove a product permanently — this also removes it from the POS immediately.",
    ],
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "Settings",
    intro: "Configure your store details, tax rate, BIR info, staff, printer, and subscription.",
    steps: [
      "Store Details: update your store name, owner name, address, and contact number — these appear on every receipt.",
      "Tax Rate: set your VAT percentage. The default is 12% (Philippine BIR standard). Change only if your store is VAT-exempt.",
      "BIR Info: enter your TIN, VAT accreditation number, and the custom footer message printed on receipts.",
      "Low Stock Threshold: set the unit count at which products show the 'Low stock' badge in Inventory and Analytics.",
      "Staff Management: add new staff members with a name, role (Owner / Manager / Cashier), and 4-digit PIN. Edit or deactivate them anytime.",
      "Printer: connect a USB thermal receipt printer using the 'Connect Printer' button — the browser will prompt you to select your device via Web Serial.",
      "Subscription: view your current plan, days remaining, and upgrade by submitting a GCash reference number.",
    ],
  },
];

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9998, padding: "16px",
  },
  modal: {
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: "16px", width: "100%", maxWidth: "900px",
    height: "min(88vh, 680px)", display: "flex", overflow: "hidden",
  },
  sidebar: {
    width: "220px", flexShrink: 0, borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column", padding: "20px 12px",
    gap: "2px", overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "11px", fontWeight: 700, letterSpacing: ".6px",
    textTransform: "uppercase", color: "var(--text-muted, #888)",
    padding: "0 8px", marginBottom: "8px",
  },
  topicBtn: (active) => ({
    display: "flex", alignItems: "center", gap: "9px",
    padding: "8px 10px", borderRadius: "8px", border: "none",
    background: active ? "var(--surface2)" : "none",
    color: active ? "var(--text)" : "var(--text-muted, #777)",
    fontWeight: active ? 600 : 400, fontSize: "13px",
    cursor: "pointer", textAlign: "left", width: "100%",
    transition: "background .12s, color .12s",
  }),
  topicIcon: { fontSize: "15px", flexShrink: 0 },
  content: {
    flex: 1, overflowY: "auto", padding: "28px 32px",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: "20px",
  },
  titleRow: { display: "flex", alignItems: "center", gap: "10px" },
  icon: {
    width: "36px", height: "36px", borderRadius: "9px",
    background: "var(--surface2)", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0,
  },
  title: { fontSize: "20px", fontWeight: 700, color: "var(--text)", letterSpacing: "-.3px" },
  intro: {
    fontSize: "13.5px", color: "var(--text-muted, #888)",
    lineHeight: 1.55, marginBottom: "24px",
  },
  divider: { borderBottom: "1px solid var(--border)", marginBottom: "20px" },
  stepsLabel: {
    fontSize: "11px", fontWeight: 700, letterSpacing: ".6px",
    textTransform: "uppercase", color: "var(--text-muted, #888)", marginBottom: "14px",
  },
  steps: { display: "flex", flexDirection: "column", gap: "12px" },
  step: { display: "flex", gap: "12px", alignItems: "flex-start" },
  stepNum: {
    width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
    background: "var(--surface2)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "11px", fontWeight: 700, color: "var(--text)",
  },
  stepText: { fontSize: "13.5px", color: "var(--text)", lineHeight: 1.6, paddingTop: "1px" },
  closeBtn: {
    background: "none", border: "1px solid var(--border)", color: "var(--text-muted, #888)",
    borderRadius: "7px", width: "28px", height: "28px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0,
  },
};

export default function HelpModal({ onClose }) {
  const [active, setActive] = useState("pos");
  const topic = TOPICS.find(t => t.id === active);

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.sidebar}>
          <div style={s.sidebarTitle}>Help Topics</div>
          {TOPICS.map(t => (
            <button key={t.id} style={s.topicBtn(active === t.id)} onClick={() => setActive(t.id)}>
              <span style={s.topicIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div style={s.content}>
          <div style={s.header}>
            <div style={s.titleRow}>
              <div style={s.icon}>{topic.icon}</div>
              <div style={s.title}>{topic.label}</div>
            </div>
            <button style={s.closeBtn} onClick={onClose} aria-label="Close help">✕</button>
          </div>

          <p style={s.intro}>{topic.intro}</p>
          <div style={s.divider} />
          <div style={s.stepsLabel}>How to use it</div>
          <div style={s.steps}>
            {topic.steps.map((step, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepNum}>{i + 1}</div>
                <div style={s.stepText}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
