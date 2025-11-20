import { useState, useEffect } from "react";

const BREAKPOINT_MOBILE = 480; // Mobile
const BREAKPOINT_TABLET = 768; // tablett


// Hook so that it keeps track if person is on mobile or not
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT_TABLET);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINT_MOBILE);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}