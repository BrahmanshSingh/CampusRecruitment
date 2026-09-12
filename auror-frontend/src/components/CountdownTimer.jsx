import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export function CountdownTimer({ initialSeconds = 900, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) {
      if (secondsLeft === 0 && onExpire) {
        onExpire();
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isCritical = secondsLeft < 120;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`px-4 py-2 border rounded-sm font-mono flex items-center gap-3 transition-colors ${
        isCritical
          ? 'bg-[#220B10] border-[#FF334B] text-[#FF334B] glow-red animate-pulse'
          : 'bg-[#101420] border-[#1E273C] text-slate-200'
      }`}
    >
      <Clock className={`w-4 h-4 ${isCritical ? 'text-[#FF334B] animate-spin' : 'text-[#FCE205]'}`} />
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest text-slate-400">
          {isCritical ? 'CRITICAL TIME WINDOW' : 'REMAINING TIME'}
        </span>
        <span className={`text-lg font-black tracking-wider ${isCritical ? 'text-glow-red' : 'text-white'}`}>
          {formattedTime}
        </span>
      </div>
      {isCritical && (
        <AlertTriangle className="w-4 h-4 text-[#FF334B]" />
      )}
    </div>
  );
}
