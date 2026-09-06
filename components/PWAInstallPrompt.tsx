'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Monitor,
} from 'lucide-react';
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
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Check standalone mode and capture install prompt
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

    // Pick up pre-captured prompt from early layout inline script
    const preCaptured = (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent })
      .__deferredPWAInstallPrompt;
    if (preCaptured) {
      setDeferredPrompt(preCaptured);
    }

    // Handlers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt = promptEvent;
    };

    const handleCanInstall = () => {
      const p = (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt;
      if (p) setDeferredPrompt(p);
    };

    // Listen for manual trigger from Settings, Profile or Navbar
    const handleManualOpen = () => {
      setIsManualOpen(true);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('umbra:pwa-can-install', handleCanInstall);
    window.addEventListener('umbra:open-pwa-install', handleManualOpen);

    // Check if user dismissed prompt recently (last 12 hours)
    const dismissed = localStorage.getItem('umbra_pwa_dismissed');
    const isRecentDismiss =
      dismissed && Date.now() - parseInt(dismissed, 10) < 1000 * 60 * 60 * 12;

    // Show automatic prompt after 2.5s if not installed and not recently dismissed
    const timer = setTimeout(() => {
      if (!isApp && !isRecentDismiss) {
        setShowPrompt(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('umbra:pwa-can-install', handleCanInstall);
      window.removeEventListener('umbra:open-pwa-install', handleManualOpen);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    // Check if we have the prompt ready
    const prompt =
      deferredPrompt ||
      (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent })
        .__deferredPWAInstallPrompt;

    if (prompt) {
      try {
        await prompt.prompt();
        const choiceResult = await prompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setShowPrompt(false);
          setIsStandalone(true);
        }
      } catch (err) {
        console.warn('Install prompt failed:', err);
      } finally {
        setDeferredPrompt(null);
        (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt = undefined;
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsManualOpen(false);
    localStorage.setItem('umbra_pwa_dismissed', Date.now().toString());
  };

  if (!showPrompt || (isStandalone && !isManualOpen)) return null;

  return (
    <aside
      aria-label="Instalación de la aplicación"
      className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-accent/40 p-4 sm:p-5 rounded-3xl shadow-2xl shadow-accent/15 text-white relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Cerrar aviso de instalación"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-accent-secondary text-zinc-950 flex items-center justify-center shrink-0 shadow-lg shadow-accent/25">
            <BatIcon className="w-6 h-6" />
          </div>

          <div className="pr-4 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-accent px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> PWA Oficial
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-white mt-1">
              Instalar Umbra Fortis
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Acceso instantáneo desde tu pantalla de inicio, pantalla completa sin barra de navegación y funciona sin conexión.
            </p>

            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="mt-3 text-xs bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-accent text-xs">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Instrucciones para iPhone / iPad:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-300">
                  1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-300 flex items-center gap-1.5">
                  <PlusSquare className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>2. Selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.</span>
                </p>
              </div>
            ) : deferredPrompt ? (
              /* Native 1-Click Install Button (Android / Chrome / Edge) */
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-zinc-950 font-black text-xs shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Instalar Aplicación</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Ahora no
                </button>
              </div>
            ) : (
              /* Desktop / Android without prompt yet */
              <div className="mt-3 text-xs bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 text-zinc-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-accent text-xs">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>En Chrome o Edge:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-300">
                  Haz clic en el icono de instalación <strong>⊕</strong> o en el menú <strong>⋮ &gt; &quot;Instalar Umbra Fortis&quot;</strong> en la barra superior del navegador.
                </p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer text-center block"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
