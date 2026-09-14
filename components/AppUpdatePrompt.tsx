'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, Sparkles, X, ArrowUpCircle } from 'lucide-react';

interface VersionResponse {
  version: string;
  buildDate?: string;
  timestamp?: number;
}

export function AppUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newVersionTag, setNewVersionTag] = useState<string | null>(null);

  const initialVersionRef = useRef<string | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  // Check version from API endpoint
  const checkServerVersion = useCallback(async () => {
    try {
      const res = await fetch(`/api/version?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!res.ok) return;
      const data: VersionResponse = await res.json();

      if (!initialVersionRef.current) {
        initialVersionRef.current = data.version;
      } else if (data.version && data.version !== initialVersionRef.current) {
        setNewVersionTag(data.version);
        setShowPrompt(true);
      }
    } catch {
      // Offline or network error; ignore
    }
  }, []);

  // Check Service Worker registration updates
  const checkServiceWorkerUpdate = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      // If there is already a worker waiting to activate
      if (reg.waiting) {
        waitingWorkerRef.current = reg.waiting;
        setShowPrompt(true);
        return;
      }

      // Check for an update right now
      await reg.update().catch(() => {});

      if (reg.waiting) {
        waitingWorkerRef.current = reg.waiting;
        setShowPrompt(true);
        return;
      }

      // Listen for when a new worker starts installing
      reg.addEventListener('updatefound', () => {
        const installingWorker = reg.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            waitingWorkerRef.current = installingWorker;
            setShowPrompt(true);
          }
        });
      });
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    // Initial checks
    checkServerVersion();
    checkServiceWorkerUpdate();

    // Check periodically every 2.5 minutes
    const interval = setInterval(() => {
      checkServerVersion();
      checkServiceWorkerUpdate();
    }, 150000);

    // Check on window focus and visibility change
    const handleFocus = () => {
      checkServerVersion();
      checkServiceWorkerUpdate();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    // Custom event to trigger manual update checks (e.g. from Settings tab)
    const handleManualCheck = () => {
      checkServerVersion();
      checkServiceWorkerUpdate();
    };
    window.addEventListener('umbra:check-for-update', handleManualCheck);

    // Custom event to test or force open the update notification
    const handleForceUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.version) {
        setNewVersionTag(detail.version);
      }
      setShowPrompt(true);
    };
    window.addEventListener('umbra:simulate-update', handleForceUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('umbra:check-for-update', handleManualCheck);
      window.removeEventListener('umbra:simulate-update', handleForceUpdate);
    };
  }, [checkServerVersion, checkServiceWorkerUpdate]);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // If we have a waiting Service Worker, tell it to take control immediately
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
    }

    // Small timeout to allow worker to activate, then hard reload
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de actualización disponible"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950/95 border border-accent/40 p-4 sm:p-5 shadow-2xl backdrop-blur-xl ring-1 ring-accent/20">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3 relative z-10">
          {/* Icon Badge */}
          <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 shadow-lg shadow-accent/10">
            <Sparkles className="w-5 h-5 animate-pulse stroke-[2.2]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                ¡Actualización Disponible!
              </h3>
              {newVersionTag && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                  v{newVersionTag}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-300/90 leading-relaxed mt-1">
              La página se actualizó con nuevos cambios y mejoras. Refresca para aplicar la última versión.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3.5">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-zinc-950 font-black text-xs shadow-lg shadow-accent/25 active:scale-95 transition-all cursor-pointer disabled:opacity-75"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 stroke-[2.5] ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>{isRefreshing ? 'Refrescando...' : 'Refrescar ahora'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Más tarde
              </button>
            </div>
          </div>

          {/* Close X button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar aviso de actualización"
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
