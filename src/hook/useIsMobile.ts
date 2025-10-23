import { useState, useEffect } from "react";

// Vilken skärmstorlem
const BREAKPOINT_MOBILE = 480; // Mobil
const BREAKPOINT_TABLET = 768; // tablett


//Hook för att hålla koll ifall personen är på mobil
export function useIsMobile() {
  //True=Mobil, False=dator/tablett
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT_TABLET);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINT_MOBILE);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}