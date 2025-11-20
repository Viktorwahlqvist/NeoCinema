import { useState, useEffect } from "react";
import QRCode from "qrcode";

// Custom hook to generate a QR code from a text string
export function useQRCode(text: string | null) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string| null>(null);

  useEffect(() => {
    if (!text){
      setQrDataUrl(null);
      setError(null);
      return;
    }

    const generateQR = async () => {
    setIsLoading(true);
    setError(null);

    try {
       const data = await QRCode.toDataURL(text, { errorCorrectionLevel: "L", margin: 2, scale: 6 });
      setQrDataUrl(data);
    } catch (err: any) {
      console.error("Error generating QR code:", err);
      setError(err?.message || "Unknown error generating QR code");
      setQrDataUrl(null); 
      } finally {
      setIsLoading(false);
    };

  };

  generateQR();


  }, [text]);

  return { qrDataUrl, isLoading, error };
}
