import { useEffect, useRef } from 'react';

/**
 * Songkran Background — realistic wet glass + floating flower petals
 * Optimized: single canvas for water, DOM for petals (CSS animation, low cost)
 */
const SparkleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ─── Water streak running down glass ───
    interface Streak {
      x: number;
      y: number;
      speed: number;
      w: number;       // width
      len: number;      // length
      alpha: number;
      wobble: number;
      phase: number;
    }

    // ─── Static droplet sitting on glass ───
    interface Droplet {
      x: number;
      y: number;
      r: number;
      alpha: number;
      fade: number;     // fade per frame (slowly dries)
    }

    const streaks: Streak[] = [];
    const droplets: Droplet[] = [];
    const MAX_STREAKS = 18;
    const MAX_DROPLETS = 40;

    const addStreak = () => {
      if (streaks.length >= MAX_STREAKS) return;
      streaks.push({
        x: Math.random() * W,
        y: -30 - Math.random() * 60,
        speed: 1.0 + Math.random() * 2.0,
        w: 2 + Math.random() * 4,
        len: 80 + Math.random() * 180,
        alpha: 0.25 + Math.random() * 0.30,
        wobble: 0.5 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
      });
    };

    const addDroplet = () => {
      if (droplets.length >= MAX_DROPLETS) return;
      droplets.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 4 + Math.random() * 10,
        alpha: 0.25 + Math.random() * 0.30,
        fade: 0.0001 + Math.random() * 0.0002,
      });
    };

    // Pre-fill a few
    for (let i = 0; i < 20; i++) addDroplet();
    for (let i = 0; i < 8; i++) addStreak();

    let frame: number;
    let tick = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      tick++;

      // Spawn frequently for wet look
      if (tick % 40 === 0) addStreak();
      if (tick % 60 === 0) addDroplet();

      // ── Draw streaks (water running down glass) ──
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.y += s.speed;
        s.phase += 0.025;
        const wx = s.x + Math.sin(s.phase) * s.wobble;

        // Streak line with gradient
        const g = ctx.createLinearGradient(wx, s.y, wx, s.y + s.len);
        g.addColorStop(0, `rgba(190,235,255,0)`);
        g.addColorStop(0.15, `rgba(190,235,255,${s.alpha})`);
        g.addColorStop(0.85, `rgba(160,220,245,${s.alpha * 0.7})`);
        g.addColorStop(1, `rgba(190,235,255,0)`);
        ctx.beginPath();
        ctx.moveTo(wx, s.y);
        ctx.lineTo(wx, s.y + s.len);
        ctx.strokeStyle = g;
        ctx.lineWidth = s.w;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Thin white refraction line
        ctx.beginPath();
        ctx.moveTo(wx - s.w * 0.3, s.y + s.len * 0.25);
        ctx.lineTo(wx - s.w * 0.3, s.y + s.len * 0.6);
        ctx.strokeStyle = `rgba(255,255,255,${s.alpha * 0.4})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Bulge drop at bottom
        const br = s.w * 2.2;
        ctx.beginPath();
        ctx.arc(wx, s.y + s.len, br, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(170,225,248,${s.alpha * 0.7})`;
        ctx.fill();
        // White highlight dot
        ctx.beginPath();
        ctx.arc(wx - br * 0.3, s.y + s.len - br * 0.3, br * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * 0.7})`;
        ctx.fill();

        if (s.y > H + 30) streaks.splice(i, 1);
      }

      // ── Draw droplets (sitting on glass, slowly fade) ──
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.alpha -= d.fade;
        if (d.alpha <= 0) { droplets.splice(i, 1); continue; }

        // Outer drop body
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(170,225,248,${d.alpha * 0.6})`;
        ctx.fill();

        // Edge ring (refraction)
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 0.88, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(210,245,255,${d.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bright spot
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.25, d.y - d.r * 0.25, d.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.alpha * 0.7})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ─── Flower petals (CSS-animated DOM — very cheap) ───
  useEffect(() => {
    const container = petalRef.current;
    if (!container) return;

    const petals: HTMLDivElement[] = [];
    const flowers = ['🌸', '🌺', '🪷', '💮', '🌼'];

    const createPetal = () => {
      const el = document.createElement('div');
      const size = 12 + Math.random() * 16;
      const x = Math.random() * 100;
      const dur = 7 + Math.random() * 6;
      const delay = Math.random() * 2;
      const drift = 20 + Math.random() * 40;
      const flower = flowers[Math.floor(Math.random() * flowers.length)];

      el.textContent = flower;
      el.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: -5%;
        font-size: ${size}px;
        pointer-events: none;
        opacity: 0;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
        animation: petal-drift ${dur}s ${delay}s ease-in-out forwards;
        --drift: ${Math.random() > 0.5 ? drift : -drift}px;
      `;

      container.appendChild(el);
      petals.push(el);

      setTimeout(() => {
        el.remove();
        const idx = petals.indexOf(el);
        if (idx > -1) petals.splice(idx, 1);
      }, (dur + delay) * 1000);
    };

    // Pre-spawn a few so it doesn't start empty
    for (let i = 0; i < 5; i++) createPetal();

    const interval = setInterval(createPetal, 800);

    return () => {
      clearInterval(interval);
      petals.forEach(p => p.remove());
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes petal-drift {
          0%   { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          8%   { opacity: 0.75; }
          50%  { transform: translateY(50vh) rotate(200deg) translateX(var(--drift)); opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(400deg) translateX(calc(var(--drift) * -0.5)); opacity: 0; }
        }
      `}</style>
      {/* Background image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(1.5px)',
          transform: 'scale(1.01)',
        }}
      />
      {/* Single canvas — wet glass overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[1] pointer-events-none"
      />
      {/* Flower petals layer */}
      <div
        ref={petalRef}
        className="fixed inset-0 z-[2] pointer-events-none overflow-hidden"
      />
    </>
  );
};

export default SparkleBackground;
