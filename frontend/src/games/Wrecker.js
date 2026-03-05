import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;

const Wrecker = ({ onScore, highScore }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [monster, setMonster] = useState({ x: 50, y: 200, vy: 0, climbing: false, punching: false, punchFrame: 0 });
  const [buildings, setBuildings] = useState([]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [rage, setRage] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const [level, setLevel] = useState(1);
  const keysRef = useRef({});

  // Generate buildings
  const generateBuildings = useCallback((lvl) => {
    const newBuildings = [];
    let x = 100;
    for (let i = 0; i < 5 + lvl; i++) {
      const height = 80 + Math.random() * 100;
      const width = 50 + Math.random() * 30;
      newBuildings.push({
        x,
        y: CANVAS_HEIGHT - height,
        width,
        height,
        health: 100 + lvl * 20,
        maxHealth: 100 + lvl * 20,
        windows: Array(Math.floor(height / 25)).fill(null).map((_, row) =>
          Array(Math.floor(width / 20)).fill(null).map(() => ({
            broken: false,
            hasEnemy: Math.random() > 0.7,
          }))
        ),
      });
      x += width + 30 + Math.random() * 20;
    }
    return newBuildings;
  }, []);

  // Initialize game
  const initGame = useCallback((lvl = 1) => {
    setMonster({ x: 50, y: 200, vy: 0, climbing: false, punching: false, punchFrame: 0 });
    setBuildings(generateBuildings(lvl));
    setScore(0);
    setHealth(100);
    setRage(0);
    setEnemies([]);
    setParticles([]);
    setLevel(lvl);
    setGameState('playing');
  }, [generateBuildings]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      const keys = keysRef.current;

      // Monster movement
      setMonster(prev => {
        let { x, y, vy, climbing, punching, punchFrame } = prev;
        const onGround = y >= CANVAS_HEIGHT - 60;
        
        // Find if near building
        const nearBuilding = buildings.find(b => 
          x + 40 > b.x && x < b.x + b.width && y + 60 > b.y
        );

        // Horizontal movement
        if (keys.ArrowLeft || keys.a) x = Math.max(0, x - 4);
        if (keys.ArrowRight || keys.d) x = Math.min(CANVAS_WIDTH - 40, x + 4);

        // Climbing
        if (nearBuilding && (keys.ArrowUp || keys.w)) {
          climbing = true;
          y = Math.max(nearBuilding.y - 50, y - 3);
          vy = 0;
        } else if (keys.ArrowDown || keys.s) {
          climbing = false;
        }

        // Jumping
        if ((keys.ArrowUp || keys.w || keys[' ']) && onGround && !climbing) {
          vy = -12;
        }

        // Gravity
        if (!climbing) {
          vy += 0.5;
          y += vy;
          if (y > CANVAS_HEIGHT - 60) {
            y = CANVAS_HEIGHT - 60;
            vy = 0;
          }
        }

        // Punching
        if ((keys.z || keys.x || keys.Enter) && !punching) {
          punching = true;
          punchFrame = 0;
        }
        if (punching) {
          punchFrame++;
          if (punchFrame > 15) {
            punching = false;
            punchFrame = 0;
          }
        }

        return { x, y, vy, climbing, punching, punchFrame };
      });

      // Check punch damage to buildings
      if (monster.punching && monster.punchFrame === 5) {
        setBuildings(prevBuildings => {
          let newScore = 0;
          const updated = prevBuildings.map(building => {
            // Check if monster is hitting this building
            const hitting = monster.x + 50 > building.x && 
                           monster.x < building.x + building.width &&
                           monster.y + 60 > building.y;
            
            if (hitting) {
              const damage = 15 + (rage > 50 ? 15 : 0);
              const newHealth = Math.max(0, building.health - damage);
              newScore += damage;
              
              // Create particles
              setParticles(prev => [...prev, ...Array(5).fill(null).map(() => ({
                x: building.x + Math.random() * building.width,
                y: monster.y + 30,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 5,
                life: 30,
                color: ['#888', '#666', '#999'][Math.floor(Math.random() * 3)],
              }))]);

              // Break windows
              const newWindows = building.windows.map(row =>
                row.map(w => {
                  if (!w.broken && Math.random() > 0.7) {
                    return { ...w, broken: true };
                  }
                  return w;
                })
              );

              return { ...building, health: newHealth, windows: newWindows };
            }
            return building;
          });

          if (newScore > 0) {
            setScore(s => s + newScore);
            setRage(r => Math.min(100, r + 5));
          }

          return updated.filter(b => b.health > 0);
        });
      }

      // Spawn enemies from windows
      setBuildings(prevBuildings => {
        prevBuildings.forEach(building => {
          building.windows.forEach((row, rowIdx) => {
            row.forEach((window, colIdx) => {
              if (window.hasEnemy && !window.broken && Math.random() > 0.995) {
                setEnemies(prev => [...prev, {
                  x: building.x + colIdx * 20 + 5,
                  y: building.y + rowIdx * 25 + 5,
                  type: Math.random() > 0.7 ? 'helicopter' : 'soldier',
                  shootTimer: 0,
                }]);
                window.hasEnemy = false;
              }
            });
          });
        });
        return prevBuildings;
      });

      // Update enemies
      setEnemies(prev => {
        return prev.map(enemy => {
          let { x, y, type, shootTimer } = enemy;
          
          if (type === 'helicopter') {
            // Move towards monster
            if (x < monster.x) x += 1;
            else x -= 1;
            y = 50 + Math.sin(Date.now() / 500) * 20;
          }

          shootTimer++;
          if (shootTimer > 60) {
            // Shoot at monster
            const dx = monster.x - x;
            const dy = monster.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              setHealth(h => Math.max(0, h - 5));
              setParticles(p => [...p, {
                x: monster.x + 20,
                y: monster.y + 30,
                vx: 0,
                vy: 0,
                life: 10,
                color: '#ff0000',
              }]);
            }
            shootTimer = 0;
          }

          return { ...enemy, x, y, shootTimer };
        }).filter(e => e.x > -50 && e.x < CANVAS_WIDTH + 50);
      });

      // Update particles
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3,
          life: p.life - 1,
        })).filter(p => p.life > 0)
      );

      // Decay rage
      setRage(r => Math.max(0, r - 0.2));

      // Check win/lose
      if (health <= 0) {
        setGameState('dead');
        onScore(score);
      }
      if (buildings.length === 0) {
        setGameState('won');
      }

    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, monster, buildings, health, rage, score, onScore]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Buildings
    buildings.forEach(building => {
      // Building body
      const healthPercent = building.health / building.maxHealth;
      ctx.fillStyle = `hsl(${healthPercent * 30}, 50%, ${30 + healthPercent * 20}%)`;
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Windows
      building.windows.forEach((row, rowIdx) => {
        row.forEach((window, colIdx) => {
          const wx = building.x + colIdx * 20 + 5;
          const wy = building.y + rowIdx * 25 + 5;
          ctx.fillStyle = window.broken ? '#222' : '#ffff00';
          ctx.fillRect(wx, wy, 12, 18);
        });
      });

      // Health bar
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(building.x, building.y - 8, building.width, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(building.x, building.y - 8, building.width * healthPercent, 4);
    });

    // Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });

    // Enemies
    enemies.forEach(enemy => {
      if (enemy.type === 'helicopter') {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y, 30, 15);
        ctx.fillRect(enemy.x + 10, enemy.y - 5, 10, 5);
      } else {
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(enemy.x, enemy.y, 8, 15);
      }
    });

    // Monster
    const m = monster;
    ctx.fillStyle = rage > 50 ? '#ff0000' : '#00ff00';
    
    // Body
    ctx.fillRect(m.x + 10, m.y + 20, 20, 30);
    
    // Head
    ctx.beginPath();
    ctx.arc(m.x + 20, m.y + 15, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(m.x + 15, m.y + 12, 3, 0, Math.PI * 2);
    ctx.arc(m.x + 25, m.y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.fillStyle = rage > 50 ? '#ff0000' : '#00ff00';
    if (m.punching) {
      // Punching arm
      ctx.fillRect(m.x + 30, m.y + 25, 25, 8);
    } else {
      ctx.fillRect(m.x + 30, m.y + 25, 10, 8);
    }
    ctx.fillRect(m.x, m.y + 25, 10, 8);
    
    // Legs
    ctx.fillRect(m.x + 10, m.y + 50, 8, 15);
    ctx.fillRect(m.x + 22, m.y + 50, 8, 15);

  }, [monster, buildings, enemies, particles, rage]);

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="wrecker-game">
        <h2 className="text-2xl text-[#ff0000] neon-text">WRECKER</h2>
        <div className="text-6xl mb-4">🦖</div>
        <p className="text-[#888] text-sm text-center max-w-xs">
          SMASH buildings! Destroy the city as a giant monster!
        </p>
        <div className="text-[10px] text-[#888] space-y-1 text-center">
          <p>← → : Move | ↑ : Jump/Climb</p>
          <p>Z/X/Enter : PUNCH!</p>
        </div>
        <p className="text-[#ffff00] text-xs">BEST: {highScore}</p>
        <button onClick={() => initGame(1)} className="retro-btn text-[#ff0000]">
          START RAMPAGE
        </button>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="wrecker-game">
        <h2 className="text-2xl text-[#00ff00] neon-text">CITY DESTROYED!</h2>
        <p className="text-[#ffff00] text-xl">{score} POINTS</p>
        <p className="text-[#888]">Level {level} complete!</p>
        <button onClick={() => initGame(level + 1)} className="retro-btn text-[#00ff00]">
          NEXT CITY
        </button>
      </div>
    );
  }

  if (gameState === 'dead') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="wrecker-game">
        <h2 className="text-2xl text-[#ff0000] neon-text">DEFEATED!</h2>
        <p className="text-[#888]">The military stopped you!</p>
        <p className="text-[#ffff00] text-xl">{score} POINTS</p>
        <button onClick={() => initGame(1)} className="retro-btn text-[#00ff00]">
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2" data-testid="wrecker-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">LVL: {level}</span>
        <span className="text-[#ff0000]">HP: {health}%</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
      </div>

      {/* Rage bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-[#ff8800]">RAGE</span>
          {rage > 50 && <span className="text-[#ff0000] animate-pulse">2X DAMAGE!</span>}
        </div>
        <div className="h-2 bg-[#333] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#ff8800] to-[#ff0000] transition-all"
            style={{ width: `${rage}%` }}
          />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-[#ff0000] rounded"
      />

      <p className="text-[8px] text-[#888]">ARROWS/WASD: MOVE • Z/X/ENTER: PUNCH</p>

      {/* Mobile controls */}
      <div className="flex gap-4 mt-2">
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button 
            onTouchStart={() => { keysRef.current.ArrowUp = true; }}
            onTouchEnd={() => { keysRef.current.ArrowUp = false; }}
            className="w-10 h-10 bg-[#333] rounded text-white active:bg-[#555]"
          >↑</button>
          <div />
          <button 
            onTouchStart={() => { keysRef.current.ArrowLeft = true; }}
            onTouchEnd={() => { keysRef.current.ArrowLeft = false; }}
            className="w-10 h-10 bg-[#333] rounded text-white active:bg-[#555]"
          >←</button>
          <button 
            onTouchStart={() => { keysRef.current.ArrowDown = true; }}
            onTouchEnd={() => { keysRef.current.ArrowDown = false; }}
            className="w-10 h-10 bg-[#333] rounded text-white active:bg-[#555]"
          >↓</button>
          <button 
            onTouchStart={() => { keysRef.current.ArrowRight = true; }}
            onTouchEnd={() => { keysRef.current.ArrowRight = false; }}
            className="w-10 h-10 bg-[#333] rounded text-white active:bg-[#555]"
          >→</button>
        </div>
        <button 
          onTouchStart={() => { keysRef.current.z = true; }}
          onTouchEnd={() => { keysRef.current.z = false; }}
          className="w-20 h-20 bg-[#ff0000] rounded-full text-white font-bold text-lg active:bg-[#cc0000]"
        >
          PUNCH
        </button>
      </div>
    </div>
  );
};

export default Wrecker;
