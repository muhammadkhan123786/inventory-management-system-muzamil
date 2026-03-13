import { useEffect, useRef, useState } from "react";

export default function useGoogleMapLoad() {
  const [loadGoogleMap, setLoadGoogleMap] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard
    if (loadedRef.current) return; // already loaded

    const existingScript = document.getElementById("google-maps");
    if (existingScript) {
      loadedRef.current = true;
      // async setState to avoid warning
      setTimeout(() => setLoadGoogleMap(true), 0);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      loadedRef.current = true;
      setLoadGoogleMap(true);
    };

    document.body.appendChild(script);

    
    return () => {
      
    };
  }, []); // ✅ run effect only once

  return loadGoogleMap;
}
