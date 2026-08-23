'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { BatIcon } from './BatIcon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isApp);

    if (isApp) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user dismissed prompt recently (in the last 3 days)
    const dismissed = localStorage.getItem('umbra_pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 1000 * 60 * 60 * 24 * 3) {
      return;
    }

    // Android / Desktop beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS, show after 3 seconds if not installed and not dismissed
    let iosTimer: NodeJS.Timeout;
    if (isIosDevice && !isApp && !dismissed) {
      iosTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('umbra_pwa_dismissed', Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <aside
      aria-label="Instalación de la aplicación"
      className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-zinc-900/95 backdrop-blur-md border border-accent/30 p-4 rounded-2xl shadow-2xl shadow-accent/10 text-white relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-secondary text-zinc-950 flex items-center justify-center shrink-0 shadow-md">
            <BatIcon className="w-6 h-6" />
          </div>
          <div className="pr-4 min-w-0">
            <h4 className="text-sm font-bold text-white">Instalar Umbra Fortis App</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Accede rápido desde tu pantalla de inicio, sin barras de navegación y con carga instantánea.
            </p>

            {isIOS ? (
              <div className="mt-3 text-xs bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-zinc-300">
                <span className="flex items-center gap-1.5 font-bold text-accent">
                  <Share className="w-3.5 h-3.5" /> En iPhone / Safari:
                </span>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Toca el botón <strong>Compartir</strong> en la barra inferior y luego selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.
                </p>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-accent hover:bg-accent/90 text-zinc-950 font-bold text-xs shadow-md shadow-accent/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Instalar en el Móvil</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
