import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface FallingMoneyProps {
  triggerCount: number;
  amount?: number;
}

export const FallingMoney: React.FC<FallingMoneyProps> = ({ triggerCount, amount = 20 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger high-octane confetti bursts on new spray
  useEffect(() => {
    if (triggerCount === 0) return;

    // 1. Confetti cannon from left and right
    const count = Math.min(180, 50 + amount * 2);
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#FCD34D', '#10B981', '#34D399', '#FFFBEB', '#D97706'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // 2. Generate floating physical currency bills in DOM
    if (containerRef.current) {
      const billCount = Math.min(24, Math.max(8, Math.floor(amount / 2)));
      for (let i = 0; i < billCount; i++) {
        createFloatingBill(containerRef.current, i * 80);
      }
    }
  }, [triggerCount, amount]);

  const createFloatingBill = (container: HTMLDivElement, delayMs: number) => {
    setTimeout(() => {
      const bill = document.createElement('div');
      const startX = Math.random() * (window.innerWidth - 120);
      const isNaira = Math.random() > 0.4;
      const rotation = Math.random() * 360;
      const duration = 2.5 + Math.random() * 1.5;

      bill.className = 'absolute z-50 pointer-events-none rounded shadow-2xl select-none flex items-center justify-between px-3 py-1 text-xs font-black tracking-wider transition-all border';
      
      if (isNaira) {
        // Crisp 1000 Naira style (deep indigo & gold)
        bill.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)';
        bill.style.borderColor = '#fbbf24';
        bill.style.color = '#fef08a';
        bill.innerHTML = `
          <span class="text-[10px] opacity-75">CBN</span>
          <span class="text-sm font-extrabold font-mono">₦1000</span>
          <span class="text-[9px] uppercase tracking-tighter opacity-80">OWAMBE</span>
        `;
      } else {
        // Crisp 100 Dollar style (rich emerald & gold)
        bill.style.background = 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #064e3b 100%)';
        bill.style.borderColor = '#34d399';
        bill.style.color = '#a7f3d0';
        bill.innerHTML = `
          <span class="text-[10px] opacity-75">USDC</span>
          <span class="text-sm font-extrabold font-mono">$100</span>
          <span class="text-[9px] uppercase tracking-tighter opacity-80">P-ZEH</span>
        `;
      }

      bill.style.width = '130px';
      bill.style.height = '62px';
      bill.style.left = `${startX}px`;
      bill.style.top = '-70px';
      bill.style.transform = `rotate(${rotation}deg) scale(0.9)`;
      bill.style.opacity = '1';
      bill.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 158, 11, 0.3)';

      container.appendChild(bill);

      // Animate falling down with flutter
      const startTime = performance.now();
      const endY = window.innerHeight + 80;
      const driftX = (Math.random() - 0.5) * 200;

      function step(now: number) {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        const currentY = -70 + progress * (endY + 70);
        const currentX = startX + Math.sin(progress * Math.PI * 4) * 45 + driftX * progress;
        const currentRotate = rotation + progress * 360;

        bill.style.transform = `translate3d(${currentX - startX}px, ${currentY + 70}px, 0) rotate(${currentRotate}deg)`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          bill.remove();
        }
      }

      requestAnimationFrame(step);
    }, delayMs);
  };

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />;
};

