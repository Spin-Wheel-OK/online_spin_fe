import { useEffect, useRef } from 'react';
import { WinnerDisplay } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface WinnerModalProps {
  isOpen: boolean;
  winner: WinnerDisplay | null;
  onClose: () => void;
  showContinue?: boolean;
}

/** Songkran สาดน้ำ — 6 waves แรงๆ เยอะๆ จากทุกทิศ */
const WaterSplashOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    interface Drop {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      alpha: number;
      life: number; maxLife: number;
    }

    let drops: Drop[] = [];
    let wave = 0;
    const totalWaves = 6;
    let frame: number;
    let timer: ReturnType<typeof setTimeout>;

    const spawnWave = () => {
      if (wave >= totalWaves) return;
      wave++;

      // สาดจากทุกทิศ — ซ้าย ขวา บน ซ้าย ขวา ล่าง
      const dirs = [
        { ox: -20, oy: H * 0.3, dx: 1, dy: 0.3 },
        { ox: W + 20, oy: H * 0.5, dx: -1, dy: -0.2 },
        { ox: W * 0.4, oy: -20, dx: 0.2, dy: 1 },
        { ox: -20, oy: H * 0.6, dx: 1, dy: -0.3 },
        { ox: W + 20, oy: H * 0.2, dx: -1, dy: 0.4 },
        { ox: W * 0.6, oy: H + 20, dx: -0.1, dy: -1 },
      ];
      const d = dirs[(wave - 1) % dirs.length];

      // 70 drops per wave — สาดแรงๆ เยอะๆ
      const count = 60 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const speed = 6 + Math.random() * 14;
        const spread = (Math.random() - 0.5) * 4;
        const life = 35 + Math.floor(Math.random() * 40);
        drops.push({
          x: d.ox + (Math.random() - 0.5) * 50,
          y: d.oy + (Math.random() - 0.5) * 50,
          vx: d.dx * speed + spread,
          vy: d.dy * speed + spread + (Math.random() - 0.5) * 3,
          r: 2 + Math.random() * 8,
          alpha: 0.5 + Math.random() * 0.5,
          life, maxLife: life,
        });
      }

      // ยิงถี่ๆ 200-400ms
      if (wave < totalWaves) {
        timer = setTimeout(spawnWave, 200 + Math.random() * 200);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      drops = drops.filter(dd => dd.life > 0);

      for (const dd of drops) {
        dd.x += dd.vx;
        dd.y += dd.vy;
        dd.vy += 0.18; // gravity
        dd.vx *= 0.985;
        dd.life--;

        const p = dd.life / dd.maxLife;
        const a = dd.alpha * p;
        const sz = dd.r * (0.4 + p * 0.6);

        // Water body
        ctx.beginPath();
        ctx.arc(dd.x, dd.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,215,245,${a})`;
        ctx.fill();

        // White highlight
        if (sz > 2) {
          ctx.beginPath();
          ctx.arc(dd.x - sz * 0.25, dd.y - sz * 0.25, sz * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${a * 0.6})`;
          ctx.fill();
        }
      }

      if (drops.length > 0 || wave < totalWaves) {
        frame = requestAnimationFrame(animate);
      }
    };

    spawnWave();
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={550}
      className="absolute inset-0 w-full h-full z-20 pointer-events-none"
    />
  );
};

const WinnerModal = ({ isOpen, winner, onClose, showContinue = false }: WinnerModalProps) => {
  const { t } = useTranslation();

  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-sky-950/80 backdrop-blur-sm" />

      {/* Modal wrapper */}
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Songkran splash on modal */}
        <WaterSplashOverlay />

        {/* Card */}
        <div className="relative z-10 bg-gradient-to-b from-sky-800/90 via-cyan-900/90 to-sky-950/95 border border-cyan-400/50 rounded-2xl p-8 text-center shadow-2xl"
             style={{ boxShadow: '0 0 40px rgba(34,211,238,0.2), 0 0 80px rgba(34,211,238,0.1)' }}>
          <div className="text-6xl mb-4">💦🎉</div>

          <h2 className="font-prompt text-3xl font-bold text-amber-400 leading-relaxed mb-2" style={{ textShadow: '0 0 20px rgba(247,148,29,0.5)' }}>
            {t('weHaveAWinner')}
          </h2>

          <div className="bg-sky-950/60 rounded-xl p-4 mb-6 space-y-2 text-left border border-cyan-500/20">
            <div className="flex justify-between">
              <span className="text-cyan-300/60 text-sm">{t('round')}</span>
              <span className="text-cyan-300 font-orbitron font-bold">#{winner.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-300/60 text-sm">{t('participant')}</span>
              <span className="text-white font-orbitron font-bold">{winner.participantId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-300/60 text-sm">{t('name')}</span>
              <span className="text-white font-bold text-lg">{winner.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-300/60 text-sm">{t('prize')}</span>
              <span className="text-yellow-300 font-orbitron font-bold">{winner.prize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-300/60 text-sm">{t('amount')}</span>
              <span className="text-emerald-400 font-orbitron font-bold">{winner.reward}</span>
            </div>
          </div>

          {showContinue && (
            <button
              onClick={onClose}
              className="w-full py-3 px-8 rounded-xl font-prompt text-lg font-bold bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white transition-all duration-300 shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(34,211,238,0.3)' }}
            >
              {t('continue')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;
