'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Friend, Exercise, WorkoutLog } from '@/types/gym';
import { calculate1RM, formatDate } from '@/lib/utils';
import { BatIcon } from '@/components/BatIcon';
import { FriendAvatar } from '@/components/FriendAvatar';
import {
  X,
  Download,
  Share2,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  Flame,
  Smartphone,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';

export type PRCardAspectRatio = '9:16' | '9:13' | '3:4';

export interface PRShareData {
  friend: Friend;
  exercise: Exercise;
  weight: number;
  reps: number;
  date: string;
  notes?: string;
}

interface PRShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prData: PRShareData | null;
}

export function PRShareStoryModal({ isOpen, onClose, prData }: PRShareStoryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<PRCardAspectRatio>('9:16');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !prData) return null;

  const { friend, exercise, weight, reps, date } = prData;
  const est1RM = calculate1RM(weight, reps);

  // Helper to draw Batman Bat path on canvas
  const drawBatPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, color: string) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;

    // Standard Bat path centered around (50, 30)
    ctx.translate(-50, -30);
    const p = new Path2D('M 50,14 L 53,4 L 56,14 C 64,12 74,10 88,17 C 96,21 100,28 100,31 C 89,29 80,32 75,42 C 68,32 58,35 50,52 C 42,35 32,32 25,42 C 20,32 11,29 0,31 C 0,28 4,21 12,17 C 26,10 36,12 44,14 L 47,4 Z');
    ctx.fill(p);
    ctx.restore();
  };

  // Render high-res canvas with selectable aspect ratio (9:16, 9:13, 3:4)
  const generateCanvas = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = 1080;
    let height = 1920; // 9:16 default

    if (aspectRatio === '9:13') {
      height = 1560; // 9:13 (1080 * 13 / 9)
    } else if (aspectRatio === '3:4') {
      height = 1440; // 3:4 (1080 * 4 / 3)
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const H = height;

    // 1. Deep Obsidian Textured Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, H);
    bgGrad.addColorStop(0, '#060608');
    bgGrad.addColorStop(0.5, '#0c0c10');
    bgGrad.addColorStop(1, '#050505');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, H);

    // 2. Ambient Radial Glows (Top and Center)
    const topGlow = ctx.createRadialGradient(540, H * 0.15, 50, 540, H * 0.15, 600);
    topGlow.addColorStop(0, 'rgba(250, 204, 21, 0.18)');
    topGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, H * 0.4);

    const centerGlow = ctx.createRadialGradient(540, H * 0.52, 100, 540, H * 0.52, 700);
    centerGlow.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
    centerGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, H * 0.25, width, H * 0.55);

    // 3. Subtle Batman Watermark in Background
    drawBatPath(ctx, 540, H * 0.5, aspectRatio === '3:4' ? 7.5 : 8.8, 'rgba(250, 204, 21, 0.035)');

    // 4. Decorative Outer Border Frame
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, width - 100, H - 100);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(66, 66, width - 132, H - 132);

    // 5. Header: Gold Batman Icon & App Name
    const batY = H * (aspectRatio === '3:4' ? 0.09 : 0.11);
    drawBatPath(ctx, 540, batY, 1.7, '#facc15');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 40px sans-serif';
    ctx.fillText('UMBRA FORTIS', 540, batY + 80);

    ctx.font = '800 22px sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.letterSpacing = '5px';
    ctx.fillText('— GYM DE CASA —', 540, batY + 115);

    // 6. Pill Badge: NUEVO RÉCORD PERSONAL
    const pillW = 500;
    const pillH = 58;
    const pillX = 540 - pillW / 2;
    const pillY = batY + 160;
    ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 29);
    ctx.fill();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 24px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('⚡ NUEVO RÉCORD PERSONAL ⚡', 540, pillY + 38);

    // 7. Centerpiece: Exercise Name & Category
    const exY = pillY + 95;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 24px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(`[ ${exercise.category.toUpperCase()} • ${exercise.equipment.toUpperCase()} ]`, 540, exY);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 60px sans-serif';
    ctx.letterSpacing = '1px';
    const words = exercise.name.split(' ');
    if (words.length > 3 && aspectRatio !== '3:4') {
      const line1 = words.slice(0, 2).join(' ');
      const line2 = words.slice(2).join(' ');
      ctx.fillText(line1, 540, exY + 70);
      ctx.fillText(line2, 540, exY + 138);
    } else {
      ctx.fillText(exercise.name, 540, exY + 75);
    }

    // 8. Massive Hero Weight & Reps Showcase
    const heroBoxY = exY + (words.length > 3 && aspectRatio !== '3:4' ? 175 : 120);
    const heroBoxH = aspectRatio === '3:4' ? 290 : aspectRatio === '9:13' ? 320 : 360;
    const heroBoxW = 860;
    const heroBoxX = 540 - heroBoxW / 2;

    const heroGrad = ctx.createLinearGradient(0, heroBoxY, 0, heroBoxY + heroBoxH);
    heroGrad.addColorStop(0, 'rgba(24, 24, 27, 0.9)');
    heroGrad.addColorStop(1, 'rgba(9, 9, 11, 0.95)');
    ctx.fillStyle = heroGrad;
    ctx.beginPath();
    ctx.roundRect(heroBoxX, heroBoxY, heroBoxW, heroBoxH, 44);
    ctx.fill();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Weight
    ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
    ctx.shadowBlur = 35;
    ctx.fillStyle = '#facc15';
    ctx.font = `900 ${aspectRatio === '3:4' ? '130px' : '150px'} sans-serif`;
    ctx.letterSpacing = '-2px';
    ctx.fillText(`${weight} KG`, 540, heroBoxY + (aspectRatio === '3:4' ? 140 : 160));
    ctx.shadowBlur = 0; // reset

    // Reps
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(`× ${reps} ${reps === 1 ? 'REPETICIÓN' : 'REPETICIONES'}`, 540, heroBoxY + (aspectRatio === '3:4' ? 210 : 240));

    // 9. 1RM Estimado Badge
    const rmBoxW = 420;
    const rmBoxH = 50;
    const rmBoxX = 540 - rmBoxW / 2;
    const rmBoxY = heroBoxY + heroBoxH + 24;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.roundRect(rmBoxX, rmBoxY, rmBoxW, rmBoxH, 25);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 22px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(`🔥 1RM ESTIMADO: ${est1RM} KG`, 540, rmBoxY + 34);

    // 10. Athlete Card
    const athY = H - (aspectRatio === '3:4' ? 240 : aspectRatio === '9:13' ? 270 : 310);
    const athW = 860;
    const athH = 150;
    const athX = 540 - athW / 2;

    ctx.fillStyle = 'rgba(18, 18, 22, 0.85)';
    ctx.beginPath();
    ctx.roundRect(athX, athY, athW, athH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Athlete Avatar Circle
    const avX = athX + 90;
    const avY = athY + 75;
    ctx.fillStyle = friend.color || '#facc15';
    ctx.beginPath();
    ctx.arc(avX, avY, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#050505';
    ctx.font = '900 32px sans-serif';
    ctx.fillText(friend.avatar || friend.name.substring(0, 2).toUpperCase(), avX, avY + 11);

    // Athlete Info Text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(friend.name.toUpperCase(), avX + 70, avY - 2);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(`Atleta de Umbra Fortis • ${formatDate(date)}`, avX + 70, avY + 34);

    // 11. Footer Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '700 20px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('FUERZA EN LA SOMBRA • @UMBRAFORTIS', 540, H - 40);

    return canvas;
  }, [friend, exercise, weight, reps, date, est1RM, aspectRatio]);

  // Generate and download PNG image
  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = generateCanvas();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `PR_${friend.name}_${exercise.name.replace(/\s+/g, '_')}_${weight}kg_${aspectRatio.replace(':', 'x')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating PR image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Web Share API (native sheet for mobile / Instagram Stories / WhatsApp)
  const handleNativeShare = async () => {
    setIsGenerating(true);
    try {
      const canvas = generateCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `PR_${exercise.name}_${weight}kg_${aspectRatio.replace(':', 'x')}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `¡Nuevo Récord de ${friend.name}!`,
            text: `¡Nuevo PR en Umbra Fortis! 💪🦇 ${exercise.name}: ${weight} kg × ${reps} reps (1RM: ${est1RM} kg).`,
          });
        } else if (navigator.share) {
          await navigator.share({
            title: `¡Nuevo Récord de ${friend.name}!`,
            text: `¡Nuevo PR en Umbra Fortis! 💪🦇 ${exercise.name}: ${weight} kg × ${reps} reps (1RM: ${est1RM} kg).`,
          });
        } else {
          // Fallback to image download
          handleDownloadImage();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const text = `¡Nuevo Récord Personal en Umbra Fortis! 🦇💪\n\n🏋️‍♂️ *${exercise.name}*\n⚡ *${weight} kg* × ${reps} reps\n🔥 *1RM Estimado:* ${est1RM} kg\n👤 *Atleta:* ${friend.name}\n📅 *Fecha:* ${formatDate(date)}\n\n_Fuerza en la sombra._`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    const text = `¡Nuevo Récord Personal en Umbra Fortis! 🦇💪\n${exercise.name}: ${weight} kg × ${reps} reps (1RM: ${est1RM} kg) - ${friend.name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic aspect ratio class for interactive preview
  const previewAspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-w-[260px] sm:max-w-[280px]'
      : aspectRatio === '9:13'
      ? 'aspect-[9/13] max-w-[280px] sm:max-w-[300px]'
      : 'aspect-[3/4] max-w-[310px] sm:max-w-[330px]';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        
        {/* Modal Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 sm:py-3.5 border-b border-zinc-800/90 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">Compartir Récord Personal</h3>
              <p className="text-[11px] text-zinc-400">Elige el formato y comparte en tus redes</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Selector Bar */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <div className="flex items-center justify-center gap-2 bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-accent text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Story</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('9:13')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                aspectRatio === '9:13'
                  ? 'bg-accent text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>9:13 Postal</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('3:4')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                aspectRatio === '3:4'
                  ? 'bg-accent text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>3:4 Retrato</span>
            </button>
          </div>
        </div>

        {/* Scrollable Center Body with Live Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-none flex-1">
          {/* Interactive Card Preview */}
          <div
            className={`relative mx-auto w-full ${previewAspectClass} rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-2 border-accent/40 shadow-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden group transition-all duration-200`}
          >
            {/* Ambient Glow */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            
            {/* Batman Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <BatIcon className="w-64 h-64 text-accent" />
            </div>

            {/* Header */}
            <div className="relative z-10 text-center space-y-1 pt-0.5">
              <div className="w-8 h-8 mx-auto rounded-2xl bg-accent text-zinc-950 flex items-center justify-center shadow-lg shadow-accent/25">
                <BatIcon className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-[10px] font-black tracking-widest text-white uppercase">UMBRA FORTIS</h4>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[9px] font-black uppercase tracking-wider">
                <Flame className="w-2.5 h-2.5 fill-accent" />
                <span>NUEVO RÉCORD PERSONAL</span>
              </div>
            </div>

            {/* Centerpiece Hero */}
            <div className="relative z-10 text-center space-y-2 my-auto">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">
                  [{exercise.category} • {exercise.equipment}]
                </span>
                <h2 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5">
                  {exercise.name}
                </h2>
              </div>

              {/* Massive Number */}
              <div className="bg-zinc-900/90 border border-accent/30 rounded-2xl p-3 shadow-xl">
                <div className="text-4xl sm:text-5xl font-black text-accent tracking-tight drop-shadow-[0_0_20px_rgba(250,204,21,0.35)]">
                  {weight} <span className="text-xl font-bold">KG</span>
                </div>
                <div className="text-xs font-black text-zinc-200 mt-0.5 uppercase tracking-wider">
                  × {reps} {reps === 1 ? 'Repetición' : 'Repeticiones'}
                </div>
                <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[9px] font-black">
                  ⚡ 1RM ESTIMADO: {est1RM} KG
                </div>
              </div>
            </div>

            {/* Athlete Bottom Tag */}
            <div className="relative z-10 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-2.5 flex items-center gap-2.5">
              <FriendAvatar friend={friend} size="sm" />
              <div className="min-w-0 text-left">
                <span className="text-xs font-black text-white truncate block">{friend.name}</span>
                <span className="text-[9px] text-zinc-400 font-mono block">{formatDate(date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer with Dedicated Cancel Button */}
        <div className="p-4 sm:px-6 sm:pb-5 pt-3 border-t border-zinc-800/90 bg-zinc-950 shrink-0 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Download High-Res PNG Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-zinc-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isGenerating ? 'Generando...' : `Descargar (${aspectRatio})`}</span>
            </button>

            {/* Native Share Sheet Button */}
            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs border border-zinc-700 active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-accent" />
              <span>Compartir en Redes</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-800 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>

          {/* Dedicated Full Width Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs border border-zinc-800 transition-colors cursor-pointer"
          >
            Cancelar / Volver
          </button>
        </div>

      </div>
    </div>
  );
}
