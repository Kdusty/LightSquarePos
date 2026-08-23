import { useState, useCallback } from 'react';

export function usePrinter() {
  const [printerPort, setPrinterPort] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // 1. Manually request a connection (Requires user click)
  const connectPrinter = async () => {
    if (!('serial' in navigator)) {
      throw new Error("Hardware Bridge Error: Web Serial API is not supported. Use Chrome or Edge on Windows/Android.");
    }
    
    try {
      // This triggers the browser's native USB permission popup
      const port = await navigator.serial.requestPort();
      
      // 9600 is the industry standard for 80mm ESC/POS thermal printers
      await port.open({ baudRate: 9600 }); 
      setPrinterPort(port);
      return port;
    } catch (err) {
      console.error("Printer connection refused:", err);
      throw new Error("Connection failed or user cancelled.");
    }
  };

  // 2. Silently reconnect to already-approved printers on page reload
  const autoConnectPrinter = useCallback(async () => {
    if (!('serial' in navigator)) return;
    try {
      const ports = await navigator.serial.getPorts();
      if (ports.length > 0) {
        // Grab the first previously authorized port
        const port = ports[0]; 
        await port.open({ baudRate: 9600 });
        setPrinterPort(port);
      }
    } catch (err) {
      console.warn("Auto-reconnect failed. User may need to manually connect.", err);
    }
  }, []);

  // 3. Shove the hex payload down the wire
  const printReceipt = async (payload) => {
    if (!printerPort) throw new Error("No printer connected.");
    if (!printerPort.writable) throw new Error("Printer port is locked or unresponsive.");

    setIsPrinting(true);
    let writer;

    try {
      writer = printerPort.writable.getWriter();
      await writer.write(payload);
    } catch (err) {
      console.error("Hardware write failure:", err);
      throw new Error("Failed to send data to the printer.");
    } finally {
      if (writer) {
        writer.releaseLock();
      }
      setIsPrinting(false);
    }
  };

  // 4. Disconnect and release the hardware lock
  const disconnectPrinter = async () => {
    if (printerPort) {
      try {
        await printerPort.close();
      } catch (err) {
        console.error("Failed to close port gracefully", err);
      }
      setPrinterPort(null);
    }
  };

  return { 
    printerPort, 
    isPrinting, 
    connectPrinter, 
    autoConnectPrinter, 
    printReceipt, 
    disconnectPrinter 
  };
}
