import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISSED_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Dismissed recently
    const ts = localStorage.getItem(DISMISSED_KEY);
    if (ts && Date.now() - Number(ts) < DISMISSED_TTL) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => setShow(true), 4000);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 1001,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: '#1A1A1A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
          <polygon points="17,6 7,18 16,18 15,26 25,14 16,14" fill="white" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
          Install LightSquare POS
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
          {isIOS
            ? <>Tap <strong style={{ color: 'var(--text2)' }}>Share</strong> → <strong style={{ color: 'var(--text2)' }}>Add to Home Screen</strong> for one-tap access</>
            : 'One-tap access and a faster experience'}
        </div>
      </div>

      {!isIOS && (
        <button
          onClick={handleInstall}
          style={{
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '7px 14px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          Install
        </button>
      )}

      <button
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none',
          color: 'var(--text3)', cursor: 'pointer',
          fontSize: 16, padding: '4px 6px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </div>
  );
}
