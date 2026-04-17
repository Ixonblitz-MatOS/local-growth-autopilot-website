import React from 'react';

const WORDMARK = '/assets/logo-wordmark.png';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={WORDMARK} alt="Gavell Intelligence" className="h-6 invert" />
        </div>
        <div className="font-mono text-[10px] tracking-widest text-muted-foreground">
          {`(c) ${year} GAVELL INTELLIGENCE - ALL RIGHTS RESERVED`}
        </div>
      </div>
    </footer>
  );
}
