import React, { useState, useEffect, useCallback, useRef } from 'react';

const ClickerGame = ({ onScore, highScore }) => {
  const [clicks, setClicks] = useState(0);
  const [cps, setCps] = useState(0);
  const [autoClickers, setAutoClickers] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [particles, setParticles] = useState([]);
  const buttonRef = useRef(null);

  const upgrades = [
    { name: 'Auto Clicker', cost: 50, effect: 'auto', icon: '🤖' },
    { name: '2x Multiplier', cost: 100, effect: 'multi', icon: '✨' },
    { name: 'Mega Click', cost: 500, effect: 'mega', icon: '💥' },
  ];

  useEffect(() => {
    if (autoClickers === 0) return;
    
    const interval = setInterval(() => {
      setClicks(c => c + autoClickers * multiplier);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoClickers, multiplier]);

  useEffect(() => {
    onScore(clicks);
  }, [clicks, onScore]);

  const handleClick = useCallback((e) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newParticle = {
        id: Date.now() + Math.random(),
        x, y,
        value: multiplier,
      };
      
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 500);
    }
    
    setClicks(c => c + multiplier);
  }, [multiplier]);

  const buyUpgrade = (upgrade) => {
    if (clicks < upgrade.cost) return;
    
    setClicks(c => c - upgrade.cost);
    
    if (upgrade.effect === 'auto') {
      setAutoClickers(a => a + 1);
    } else if (upgrade.effect === 'multi') {
      setMultiplier(m => m * 2);
    } else if (upgrade.effect === 'mega') {
      setClicks(c => c + 1000);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <div className="flex flex-col items-center gap-4" data-testid="clicker-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">AUTO: {autoClickers}/s</span>
        <span className="text-[#ff00ff]">x{multiplier}</span>
        <span className="text-[#ffff00]">BEST: {formatNumber(highScore)}</span>
      </div>

      <div className="text-center">
        <p className="text-[#00ff00] text-4xl neon-text mb-2">{formatNumber(clicks)}</p>
        <p className="text-[#888] text-xs">CLICKS</p>
      </div>

      {/* Main Click Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleClick}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-[#ff00ff] to-[#00ffff] 
            border-4 border-white shadow-[0_0_30px_#ff00ff] 
            hover:scale-110 active:scale-95 transition-transform duration-100
            flex items-center justify-center text-6xl"
        >
          👆
        </button>
        
        {/* Particles */}
        {particles.map(p => (
          <span
            key={p.id}
            className="absolute text-[#00ff00] font-bold pointer-events-none animate-float-up"
            style={{
              left: p.x,
              top: p.y,
              animation: 'floatUp 0.5s ease-out forwards',
            }}
          >
            +{p.value}
          </span>
        ))}
      </div>

      {/* Upgrades */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-[#ffff00] text-xs text-center">UPGRADES</p>
        {upgrades.map((upgrade, i) => (
          <button
            key={i}
            onClick={() => buyUpgrade(upgrade)}
            disabled={clicks < upgrade.cost}
            className={`w-full p-3 rounded-lg border-2 flex items-center justify-between transition-all
              ${clicks >= upgrade.cost 
                ? 'border-[#00ff00] bg-[#00ff00]/10 hover:bg-[#00ff00]/20' 
                : 'border-[#333] bg-black/50 opacity-50'}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{upgrade.icon}</span>
              <span className="text-sm text-[#00ffff]">{upgrade.name}</span>
            </span>
            <span className="text-[#ffff00] text-sm">{upgrade.cost}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-50px); }
        }
      `}</style>
    </div>
  );
};

export default ClickerGame;
