# Feature: Hardware Bridge (Thermal Printer + Cash Drawer)

## What it does
Connects directly to a USB/Bluetooth 80mm thermal receipt printer via the browser's Web Serial API. Prints formatted receipts and fires a 24V pulse to kick open the cash drawer on cash transactions.

## Files

| File | Role |
|---|---|
| `src/hooks/usePrinter.js` | Web Serial API: connect, auto-reconnect, print, disconnect |
| `src/lib/escpos.js` | ESC/POS byte command builder: `buildReceiptPayload()` |
| `src/App.jsx` | Hardware bridge execution inside `confirmPayment` |
| `src/components/SettingsView.jsx` | "Connect Printer" / "Disconnect" controls |

## Browser Requirements

Web Serial API is only available in:
- Chrome 89+ on Windows, macOS, Linux, Android
- Edge 89+

**Not available in:** Safari, Firefox, any iOS browser. Do not advertise hardware printing to iOS/Safari users.

## Connection Flow

```
Page load → autoConnectPrinter()
  → navigator.serial.getPorts() → returns previously-authorized ports
  → If port found: port.open({ baudRate: 9600 }) → printerPort state set

User clicks "Connect Printer" in Settings
  → connectPrinter()
  → navigator.serial.requestPort() → browser shows USB device picker
  → User selects printer → port.open({ baudRate: 9600 })
  → printerPort state set → "Printer connected" toast
```

## Print on Checkout

```
confirmPayment() → on success (online or offline):
  if (printerPort) {
    payloadBytes = buildReceiptPayload(txn, storeName, cashAmt)
    printReceipt(payloadBytes)
  }
```

`buildReceiptPayload` constructs a `Uint8Array` of ESC/POS commands covering:
- Store name header (double-height, centered)
- Order ID, date, cashier
- Item lines: `2x Café Latte    ₱290.00`
- Variant sub-lines: `   + Large, Iced`
- Financial summary (subtotal, discount, total)
- Payment method, cash tendered, change
- Thank-you footer
- Paper feed + full cut
- Cash drawer kick pulse (cash payments only): `[0x1B, 0x70, 0x00, 0x19, 0xFA]`

## ESC/POS Commands Reference

| Constant | Bytes | Effect |
|---|---|---|
| `INIT` | `[0x1B, 0x40]` | Reset printer state |
| `ALIGN_CENTER` | `[0x1B, 0x61, 0x01]` | Center alignment |
| `ALIGN_LEFT` | `[0x1B, 0x61, 0x00]` | Left alignment |
| `TXT_BOLD` | `[0x1B, 0x21, 0x08]` | Bold text |
| `TXT_TITLE` | `[0x1B, 0x21, 0x30]` | Double-size bold |
| `TXT_NORMAL` | `[0x1B, 0x21, 0x00]` | Reset to normal |
| `FEED` | `[0x1B, 0x64, 0x03]` | Feed 3 lines |
| `CUT` | `[0x1D, 0x56, 0x41, 0x00]` | Full paper cut |
| `KICK_DRAWER` | `[0x1B, 0x70, 0x00, 0x19, 0xFA]` | Pulse pin 2 (cash drawer) |

## BREAK RISK

| If you do this | This breaks |
|---|---|
| Change `txn.method` check from `"Cash"` to anything else | Cash drawer never kicks (or always kicks on GCash) |
| Remove hardware bridge block from `confirmPayment` | Printer connected but never used after payment |
| Call `autoConnectPrinter` inside a non-user-gesture context | Browser may block `port.open()` — must be triggered by user interaction or page load event |
| Change `baudRate` from `9600` | Most 80mm printers expect 9600; different rate causes garbage output |

## Dependencies

- `usePrinter` → `printerPort` state determines if hardware bridge executes
- `escpos.js` → `buildReceiptPayload` needs the full `txn` object, `storeName` string, and `cashAmt` number
- `useStoreSettings` → `storeName` used in receipt header
