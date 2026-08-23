// ESC/POS Hexadecimal Commands
const ESC = 0x1B;
const GS = 0x1D;

export const PRINTER_COMMANDS = {
  INIT: new Uint8Array([ESC, 0x40]), // Initialize printer
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  TXT_NORMAL: new Uint8Array([ESC, 0x21, 0x00]),
  TXT_BOLD: new Uint8Array([ESC, 0x21, 0x08]),
  TXT_TITLE: new Uint8Array([ESC, 0x21, 0x30]), // Double width & height + Bold
  FEED: new Uint8Array([ESC, 0x64, 0x03]), // Feed 3 lines
  CUT: new Uint8Array([GS, 0x56, 0x41, 0x00]), // Full cut
  KICK_DRAWER: new Uint8Array([ESC, 0x70, 0x00, 0x19, 0xFA]), // Pulse pin 2 (Cash Drawer)
};

// Helper to convert plain string to byte array
function textToBytes(text) {
  const encoder = new TextEncoder();
  return encoder.encode(text + '\n');
}

// Helper to pad strings for a standard 80mm thermal receipt (approx 42 characters wide)
function formatLine(left, right, width = 42) {
  const spaces = width - left.length - right.length;
  if (spaces <= 0) return left.substring(0, width - right.length - 1) + " " + right;
  return left + " ".repeat(spaces) + right;
}

export function buildReceiptPayload(txn, storeName, cashAmt = 0) {
  const payload = [];

  const add = (cmd) => payload.push(...cmd);
  const addText = (txt) => payload.push(...textToBytes(txt));

  // 1. Initialize & Header
  add(PRINTER_COMMANDS.INIT);
  add(PRINTER_COMMANDS.ALIGN_CENTER);
  add(PRINTER_COMMANDS.TXT_TITLE);
  addText(storeName || "LightSquare POS");
  add(PRINTER_COMMANDS.TXT_NORMAL);
  addText("------------------------------------------");
  
  // 2. Transaction Meta
  add(PRINTER_COMMANDS.ALIGN_LEFT);
  addText(`Order #: ${txn.id || 'N/A'}`);
  addText(`Date   : ${txn.date} ${new Date().toLocaleTimeString('en-PH', {hour: '2-digit', minute:'2-digit'})}`);
  addText(`Cashier: ${txn.cashier || 'Staff'}`);
  addText("------------------------------------------");

  // 3. Items
  txn.items.forEach(item => {
    // Main item line
    const itemLine = formatLine(`${item.qty}x ${item.name}`, `P${(item.price * item.qty).toFixed(2)}`);
    addText(itemLine);
    
    // Variants sub-line
    if (item.selectedVariants && item.selectedVariants.length > 0) {
      const vars = item.selectedVariants.map(v => v.optionName).join(", ");
      addText(`   + ${vars}`);
    }
  });

  addText("------------------------------------------");

  // 4. Financials
  addText(formatLine("Subtotal:", `P${txn.subtotal.toFixed(2)}`));
  if (txn.discount > 0) {
    addText(formatLine("Discount:", `-P${txn.discount.toFixed(2)}`));
  }
  
  add(PRINTER_COMMANDS.TXT_BOLD);
  addText(formatLine("TOTAL:", `P${txn.total.toFixed(2)}`));
  add(PRINTER_COMMANDS.TXT_NORMAL);
  
  addText("------------------------------------------");
  addText(formatLine("Paid via:", txn.method));
  if (txn.method === "Cash" && cashAmt > 0) {
    addText(formatLine("Cash Tendered:", `P${parseFloat(cashAmt).toFixed(2)}`));
    addText(formatLine("Change:", `P${(parseFloat(cashAmt) - txn.total).toFixed(2)}`));
  }

  // 5. Footer & Execution
  add(PRINTER_COMMANDS.ALIGN_CENTER);
  addText(" ");
  addText("Thank you for your business!");
  addText("Powered by LightSquare");
  
  add(PRINTER_COMMANDS.FEED);
  add(PRINTER_COMMANDS.CUT);

  // If cash, violently kick the drawer open
  if (txn.method === "Cash") {
    add(PRINTER_COMMANDS.KICK_DRAWER);
  }

  return new Uint8Array(payload);
}
