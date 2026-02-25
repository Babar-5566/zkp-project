import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScannerPage = ({ onScanSuccess }) => {
  
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const handleSuccess = (decodedText) => {
      scanner.clear().then(() => {
        // Send the data back up to App.jsx
        onScanSuccess(decodedText);
      }).catch(err => {
        console.error("Failed to clear scanner: ", err);
      });
    };

    scanner.render(handleSuccess, () => {});

    return () => {
      scanner.clear().catch(error => console.error("Cleanup error", error));
    };
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Scan QR Code</h2>
      <div id="reader" className="w-full max-w-[400px] bg-white text-black rounded-lg overflow-hidden border-2 border-cyan-500/50"></div>
    </div>
  );
};

export default ScannerPage;