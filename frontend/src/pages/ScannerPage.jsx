import React, { useEffect, useRef, useId } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScannerPage = ({ onScanSuccess }) => {
  // Protyek bar notun unique ID toiri hobe, tai clash korar kono chance nei
  const uniqueId = "qr-reader-" + useId().replace(/:/g, ""); 
  const scannerRef = useRef(null);

  useEffect(() => {
    const handleSuccess = (decodedText) => {
      // Scan success hole aage scanner ta clear korbo
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      onScanSuccess(decodedText);
    };

    // Timeout dewa hoche jate div ta properly DOM e load hoye jay
    const timer = setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        uniqueId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerRef.current.render(handleSuccess, () => {});
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Cleanup error:", error));
      }
    };
  }, [uniqueId, onScanSuccess]);

  return (
    <div className="flex flex-col items-center p-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Scan QR Code</h2>
      {/* Hardcoded 'reader' er bodole dynamic uniqueId */}
      <div id={uniqueId} className="w-full max-w-[400px] bg-white text-black rounded-lg overflow-hidden border-2 border-cyan-500/50"></div>
    </div>
  );
};

export default ScannerPage;
