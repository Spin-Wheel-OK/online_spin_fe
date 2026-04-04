import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { playTick } from '../audio';
const okvipLogo = '/OKVIP-LOGO.png';

interface Segment {
  number: number;
  label: string;
  color: string;
}

interface SpinResult {
  number: number;
  winner: string | null;
}

interface LuckyWheelProps {
  participants: string[];
  participantIds: string[];
  wheelSegments?: { id: string; name: string }[] | null;
  onSpinEnd: (result?: SpinResult) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

interface PointerState {
  angle: number;
  vel: number;
}

interface Dimensions {
  width: number;
  height: number;
}

const LuckyWheel = forwardRef<{ spin: () => void; spinToResult: (spinResult: number, participantCount: number) => void }, LuckyWheelProps>(({ participants, participantIds, wheelSegments, onSpinEnd, isSpinning, setIsSpinning }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [pointerAngle, setPointerAngle] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 500, height: 500 });
  const pointerRef = useRef<PointerState>({ angle: 0, vel: 0 });
  const [hubPressed, setHubPressed] = useState(false);

  const segments = useMemo((): Segment[] => {
    // Songkran color pairs: deep ocean / light water
    const colorA = '#1C1C1C'; // Dark/black
    const colorB = '#F5F0E1'; // Cream/off-white

    // During spin: use the server-provided wheel segments as-is.
    if (wheelSegments && wheelSegments.length > 0) {
      return wheelSegments.map((s, i) => ({
        number: i + 1,
        label: s.id,
        color: i % 2 === 0 ? colorA : colorB,
      }));
    }

    // Default: show all participants on the wheel.
    const count = participants.length || 8;
    return Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      label: participantIds[i] || String(i + 1),
      color: i % 2 === 0 ? colorA : colorB,
    }));
  }, [participants, participantIds, wheelSegments]);

  const segmentAngle = 360 / segments.length;

  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = window.innerWidth - 320;
      const maxHeight = window.innerHeight - 120;
      const size = Math.min(maxWidth, maxHeight, 900);
      setDimensions({ width: Math.max(size, 300), height: Math.max(size, 300) });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useImperativeHandle(ref, () => ({
    spin: () => {
      if (isSpinning) return;

      // Hub press effect
      setHubPressed(true);
      setTimeout(() => setHubPressed(false), 200);

      setIsSpinning(true);
      const spinDuration = 20000 + Math.random() * 10000;
      const totalRotation = 360 * (15 + Math.random() * 10) + Math.random() * 360;
      const startRotation = rotation;
      const startTime = Date.now();

      // reset pointer
      pointerRef.current = { angle: 0, vel: 0 };
      let prevRotation = startRotation;

      const finishSpin = (finalRot: number) => {
        // settle pointer
        const settle = () => {
          const pr2 = pointerRef.current;
          pr2.vel += -pr2.angle * 0.22;
          pr2.vel *= 0.70;
          pr2.angle += pr2.vel;
          setPointerAngle(pr2.angle);
          if (Math.abs(pr2.angle) > 0.2 || Math.abs(pr2.vel) > 0.1) {
            animationRef.current = requestAnimationFrame(settle);
          } else {
            pr2.angle = 0;
            pr2.vel = 0;
            setPointerAngle(0);
          }
        };
        setIsSpinning(false);
        animationRef.current = requestAnimationFrame(settle);

        setTimeout(() => {
          const normalizedRotation = ((finalRot % 360) + 360) % 360;
          const winningIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) % segments.length;
          const winningNumber = segments[winningIndex].number;
          const winner = participants[winningNumber - 1] || null;
          onSpinEnd({ number: winningNumber, winner });
        }, 1000);
      };

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);

        // single smooth easing — velocity decays continuously, never jerks
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentRotation = startRotation + totalRotation * easeOut;

        // ตรวจ tick crossing — ใช้ floor index ให้แม่นยำ
        const sa = segmentAngle;
        const prevTick = Math.floor(prevRotation / sa);
        const curTick = Math.floor(currentRotation / sa);
        const tickCrossed = curTick !== prevTick;
        prevRotation = currentRotation;

        const vel = (totalRotation / spinDuration) * Math.exp(-5 * (progress / (progress < 0.75 ? 0.75 : 1)));

        // pointer physics — wheel หมุนตามเข็ม → tick ชนจากขวา → pointer เงี่ยนไปทางขวา (บวก)
        const pr = pointerRef.current;
        if (tickCrossed) {
          playTick();
          pr.vel += Math.min(vel * 600, 35);
        }
        pr.vel += -pr.angle * 0.22;
        pr.vel *= 0.70;
        pr.angle += pr.vel;
        pr.angle = Math.max(-38, Math.min(38, pr.angle));

        setRotation(currentRotation);
        setPointerAngle(pr.angle);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // ช่วงท้าย: เช็คว่าหยุดใกล้ tick ไหม → ดีดกลับเล็กน้อย
          const sa2 = segmentAngle;
          const stopOff = ((currentRotation % sa2) + sa2) % sa2;
          // ถ้าหยุดห่างจาก tick ถัดไปน้อยกว่า 20% ของ segment → ดีดกลับ
          const distToNext = sa2 - stopOff;
          const needBounce = distToNext < sa2 * 0.2;
          const bounceAmount = needBounce ? distToNext + sa2 * 0.08 : 0;

          let finalRotation = currentRotation;

          if (needBounce && bounceAmount > 0) {
            // animate bounce กลับเล็กน้อย
            const bounceStart = Date.now();
            const bounceDuration = 600;

            const bounceAnimate = () => {
              const bElapsed = Date.now() - bounceStart;
              const bProgress = Math.min(bElapsed / bounceDuration, 1);
              // damped settle: ease out bounce
              const bEase = 1 - Math.pow(1 - bProgress, 2);
              finalRotation = currentRotation - bounceAmount * bEase;

              // pointer reacts
              const pr3 = pointerRef.current;
              if (bProgress < 0.1) pr3.vel += 8;
              pr3.vel += -pr3.angle * 0.22;
              pr3.vel *= 0.70;
              pr3.angle += pr3.vel;
              pr3.angle = Math.max(-38, Math.min(38, pr3.angle));

              setRotation(finalRotation);
              setPointerAngle(pr3.angle);

              if (bProgress < 1) {
                animationRef.current = requestAnimationFrame(bounceAnimate);
              } else {
                finishSpin(finalRotation);
              }
            };
            animationRef.current = requestAnimationFrame(bounceAnimate);
          } else {
            finishSpin(currentRotation);
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },

    // Spin to a server-determined result angle (0-360)
    // spinResult = the exact final rotation (mod 360) the wheel should stop at
    // participantCount = the actual segment count on the wheel (avoids stale closure)
    spinToResult: (spinResult: number, participantCount: number) => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      // Use passed participantCount — NOT closure segmentAngle (which may be stale)
      const animSegAngle = 360 / participantCount;

      // Hub press effect
      setHubPressed(true);
      setTimeout(() => setHubPressed(false), 200);

      setIsSpinning(true);
      const spinDuration = 20000 + Math.random() * 5000;
      const startRotation = rotation;
      const fullRotations = 360 * (15 + Math.floor(Math.random() * 5));
      const currentMod = ((startRotation % 360) + 360) % 360;
      const targetMod = ((spinResult % 360) + 360) % 360;
      const extraDeg = ((targetMod - currentMod) % 360 + 360) % 360;
      const totalRotation = fullRotations + extraDeg;
      const startTime = Date.now();

      pointerRef.current = { angle: 0, vel: 0 };
      let prevRotation = startRotation;

      const finishSpin2 = (finalRot: number) => {
        const settle = () => {
          const pr2 = pointerRef.current;
          pr2.vel += -pr2.angle * 0.22;
          pr2.vel *= 0.70;
          pr2.angle += pr2.vel;
          setPointerAngle(pr2.angle);
          if (Math.abs(pr2.angle) > 0.2 || Math.abs(pr2.vel) > 0.1) {
            animationRef.current = requestAnimationFrame(settle);
          } else {
            pr2.angle = 0;
            pr2.vel = 0;
            setPointerAngle(0);
          }
        };
        setIsSpinning(false);
        animationRef.current = requestAnimationFrame(settle);
        setRotation(finalRot);
        setTimeout(() => {
          onSpinEnd();
        }, 800);
      };

      const animate2 = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + totalRotation * easeOut;

        // ตรวจ tick crossing — ใช้ floor index
        const sa = animSegAngle;
        const prevTick = Math.floor(prevRotation / sa);
        const curTick = Math.floor(currentRotation / sa);
        const tickCrossed = curTick !== prevTick;
        prevRotation = currentRotation;

        const vel = (totalRotation / spinDuration) * Math.exp(-5 * (progress / (progress < 0.75 ? 0.75 : 1)));
        const pr = pointerRef.current;
        if (tickCrossed) {
          playTick();
          pr.vel += Math.min(vel * 600, 35);
        }
        pr.vel += -pr.angle * 0.22;
        pr.vel *= 0.70;
        pr.angle += pr.vel;
        pr.angle = Math.max(-38, Math.min(38, pr.angle));

        setRotation(currentRotation);
        setPointerAngle(pr.angle);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate2);
        } else {
          finishSpin2(currentRotation);
        }
      };

      animationRef.current = requestAnimationFrame(animate2);
    },
  }));

  // Layout
  const hubR = dimensions.width / 9;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = dimensions.width;
    const cx = W / 2;
    const cy = W / 2;
    const rimThick = W * 0.03;
    const radius = cx - rimThick - 8;

    ctx.clearRect(0, 0, W, W);

    const N = segments.length;
    const segRad = (2 * Math.PI) / N;
    const arcLen = segRad * radius;
    const fontSize = Math.max(Math.min(arcLen * 0.5, W / 28), 3);

    // 1) Segments
    segments.forEach((seg, i) => {
      const a0 = i * segRad + (rotation * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, a0, a0 + segRad);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a0 + segRad / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.color === '#1C1C1C' ? 'rgba(210,185,130,0.55)' : 'rgba(50,50,50,0.4)';
      ctx.font = `bold ${fontSize}px Orbitron, sans-serif`;
      ctx.fillText(seg.label, radius - 20, fontSize / 3);
      ctx.restore();
    });

    // 2) Gold rim — simple solid gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + rimThick / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = rimThick;
    ctx.stroke();
    // Bright inner edge
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#D4A017';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Dark outer edge
    ctx.beginPath();
    ctx.arc(cx, cy, radius + rimThick, 0, 2 * Math.PI);
    ctx.strokeStyle = '#6B5310';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3) Tick pins
    const pinR = Math.max(Math.min(segRad * radius * 0.06, 5), 2.5);
    for (let i = 0; i < N; i++) {
      const a = i * segRad + (rotation * Math.PI) / 180;
      const pr = radius + rimThick / 2;
      const px = cx + Math.cos(a) * pr;
      const py = cy + Math.sin(a) * pr;
      ctx.beginPath();
      ctx.arc(px, py, pinR, 0, 2 * Math.PI);
      ctx.fillStyle = '#F0E8D8';
      ctx.fill();
      ctx.strokeStyle = '#A09070';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // 4) Center hub — gold ring + dark circle
    const hr = hubR;
    const hubBorder = 5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((pointerAngle * Math.PI) / 180);

    // Pointer triangle — sharp tip, flat bottom (no rounded corners)
    const ptrH = hr * 0.6;
    const ptrW = hr * 0.22;
    ctx.beginPath();
    ctx.moveTo(0, -hr - hubBorder - ptrH); // tip
    ctx.lineTo(ptrW, -hr - hubBorder + 2);  // bottom-right
    ctx.lineTo(-ptrW, -hr - hubBorder + 2); // bottom-left
    ctx.closePath();
    ctx.lineJoin = 'miter';
    ctx.fillStyle = '#D4A017';
    ctx.fill();

    // Gold ring
    ctx.beginPath();
    ctx.arc(0, 0, hr + hubBorder, 0, 2 * Math.PI);
    ctx.fillStyle = '#B8860B';
    ctx.fill();
    // Bright highlight (top-left)
    ctx.beginPath();
    ctx.arc(0, 0, hr + hubBorder, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.strokeStyle = '#D4A017';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dark center
    ctx.beginPath();
    ctx.arc(0, 0, hr, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();

    ctx.restore();
  }, [rotation, segments, dimensions, hubR, pointerAngle]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="relative z-10 select-none"
        onDragStart={e => e.preventDefault()}
      />

      {/* OKVIP logo — click/press animation on spin start */}
      <div
        className="absolute top-1/2 left-1/2 z-20 select-none rounded-full flex items-center justify-center"
        style={{
          width: hubR * 1.8,
          height: hubR * 1.8,
          transform: `translate(-50%, -50%) scale(${hubPressed ? 0.85 : 1})`,
          transition: hubPressed ? 'transform 0.1s ease-in' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: hubPressed ? 'brightness(1.3)' : 'brightness(1)',
        }}
      >
        <img src={okvipLogo} alt="OKVIP Logo" className="w-full h-full object-contain pointer-events-none" draggable={false} />
      </div>
    </div>
  );
});

LuckyWheel.displayName = 'LuckyWheel';

export default LuckyWheel;
