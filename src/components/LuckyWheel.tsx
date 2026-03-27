import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import okvipLogo from '../assets/OKVIP-LOGO.png';

interface Segment {
  number: number;
  color: string;
}

interface SpinResult {
  number: number;
  winner: string | null;
}

interface LuckyWheelProps {
  participants: string[];
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

const LuckyWheel = forwardRef<{ spin: () => void; spinToResult: (spinResult: number, participantCount: number) => void }, LuckyWheelProps>(({ participants, onSpinEnd, isSpinning, setIsSpinning }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [pointerAngle, setPointerAngle] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 500, height: 500 });
  const pointerRef = useRef<PointerState>({ angle: 0, vel: 0 });

  const segments = useMemo((): Segment[] => {
    const count = participants.length || 8;
    return Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      color: i % 2 === 0 ? '#2B1B17' : '#F5E6C8',
    }));
  }, [participants]);

  const segmentAngle = 360 / segments.length;

  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = window.innerWidth - 350;
      const maxHeight = window.innerHeight - 200;
      const size = Math.min(maxWidth, maxHeight, 800);
      setDimensions({ width: Math.max(size, 300), height: Math.max(size, 300) });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useImperativeHandle(ref, () => ({
    spin: () => {
      if (isSpinning) return;

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

        // ตรวจ tick crossing
        const sa = segmentAngle;
        const prevOff = ((prevRotation % sa) + sa) % sa;
        const curOff = ((currentRotation % sa) + sa) % sa;
        const tickCrossed = prevOff > sa * 0.7 && curOff < sa * 0.3;
        prevRotation = currentRotation;

        // velocity ปัจจุบัน (deg/ms โดยประมาณ)
        const vel = (totalRotation / spinDuration) * Math.exp(-5 * (progress / (progress < 0.75 ? 0.75 : 1)));

        // pointer physics — tick ชนจากซ้าย → pointer เงี่ยนไปทางขวา (ลบ)
        const pr = pointerRef.current;
        if (tickCrossed) {
          pr.vel -= Math.min(vel * 600, 35);
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
    spinToResult: (spinResult: number, _participantCount: number) => {
      if (isSpinning) return;

      setIsSpinning(true);
      const spinDuration = 20000 + Math.random() * 5000;
      const startRotation = rotation;
      // Spin enough full rotations so the wheel lands on spinResult degrees
      const fullRotations = 360 * (15 + Math.floor(Math.random() * 5));
      const totalRotation = fullRotations + spinResult;
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

        const sa = segmentAngle;
        const prevOff = ((prevRotation % sa) + sa) % sa;
        const curOff = ((currentRotation % sa) + sa) % sa;
        const tickCrossed = prevOff > sa * 0.7 && curOff < sa * 0.3;
        prevRotation = currentRotation;

        const vel = (totalRotation / spinDuration) * Math.exp(-5 * (progress / (progress < 0.75 ? 0.75 : 1)));
        const pr = pointerRef.current;
        if (tickCrossed) {
          pr.vel -= Math.min(vel * 600, 35);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const segmentAngleRad = (2 * Math.PI) / segments.length;

    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngleRad + (rotation * Math.PI) / 180;
      const endAngle = startAngle + segmentAngleRad;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngleRad / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = segment.color === '#2B1B17' ? '#F5E6C8' : '#2B1B17';
      const baseFontSize = dimensions.width / 25;
      const fontSize = segments.length > 20 ? baseFontSize * 0.7 : segments.length > 12 ? baseFontSize * 0.85 : baseFontSize;
      ctx.font = `bold ${fontSize}px Orbitron, sans-serif`;
      ctx.fillText(segment.number.toString(), radius - 15, 5);
      ctx.restore();
    });

    // Outer gold rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Tick bumps — ปุ่มเล็กๆ ที่ขอบ ตรง segment boundary
    const tickR = dimensions.width / 70;
    segments.forEach((_, index) => {
      const tickAngle = index * segmentAngleRad + (rotation * Math.PI) / 180;
      const tx = centerX + Math.cos(tickAngle) * (radius + 2);
      const ty = centerY + Math.sin(tickAngle) * (radius + 2);

      ctx.beginPath();
      ctx.arc(tx, ty, tickR, 0, 2 * Math.PI);
      ctx.fillStyle = '#C49B30';
      ctx.fill();
      ctx.strokeStyle = '#A07C20';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    const innerRadius = dimensions.width / 12;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#D4AF37';
    ctx.fill();
    ctx.strokeStyle = '#F5E6C8';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [rotation, segments, dimensions]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 blur-2xl scale-110"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="relative z-10"
      />

      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-300 overflow-hidden"
        style={{ width: dimensions.width / 6, height: dimensions.width / 6 }}
      >
        <img src={okvipLogo} alt="OKVIP Logo" className="w-full h-full object-contain p-1" />
      </div>

      {/* Pointer */}
      <div
        className="absolute z-30"
        style={{
          top: 0,
          left: '50%',
          width: `${dimensions.width / 25 * 2}px`,
          height: `${dimensions.width / 12}px`,
          transform: `translateX(-50%) translateY(-${dimensions.width / 12 * 0.50}px) rotate(${pointerAngle}deg)`,
          transformOrigin: '50% 0%',
          transition: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 0,
            height: 0,
            borderLeft: `${dimensions.width / 25}px solid transparent`,
            borderRight: `${dimensions.width / 25}px solid transparent`,
            borderTop: `${dimensions.width / 12}px solid #FACC15`,
            filter: 'drop-shadow(0 2px 8px rgba(250,204,21, 0.9))',
          }}
        />
      </div>
    </div>
  );
});

LuckyWheel.displayName = 'LuckyWheel';

export default LuckyWheel;