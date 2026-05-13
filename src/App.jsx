/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });

  useEffect(() => {
    let raf = null;
    const onMove = (event) => {
      const { clientX, clientY } = event;
      setCursor({ x: clientX, y: clientY });
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setRing((prev) => ({
        x: prev.x + (clientX - prev.x) * 0.2,
        y: prev.y + (clientY - prev.y) * 0.2,
      })));
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <AppRoutes />
      <div className="cursor-dot hidden md:block" style={{ left: cursor.x, top: cursor.y }} />
      <div className="cursor-ring hidden md:block" style={{ left: ring.x, top: ring.y }} />
    </>
  );
}

export default App;

