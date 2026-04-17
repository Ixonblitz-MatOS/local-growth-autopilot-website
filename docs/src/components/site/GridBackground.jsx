import React, { useEffect, useRef } from 'react';

export default function GridBackground() {
  const gridRef = useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gridRef.current) return;
      const x = (e.clientX / window.innerWidth) * 10;
      const y = (e.clientY / window.innerHeight) * 10;
      gridRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div ref={gridRef} className="fixed inset-0 grid-bg pointer-events-none transition-transform duration-700 ease-out" style={{ zIndex: 0 }} />
  );
}
