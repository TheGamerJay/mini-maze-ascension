import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;

const DINOS = [
  { id: 'trex', name: 'T-REX', emoji: '🦖', color: '#00ff00', power: 20, speed: 3, size: 1.2, desc: 'King of destruction!' },
  { id: 'raptor', name: 'RAPTOR', emoji: '🦎', color: '#ff8800', power: 12, speed: 5, size: 0.8, desc: 'Fast & agile!' },
  { id: 'trike', name: 'TRICERATOPS', emoji: '🦏', color: '#00ffff', power: 25, speed: 2, size: 1.3, desc: 'Tank mode!' },
  { id: 'ptero', name: 'PTERODACTYL', emoji: '🦅', color: '#ff00ff', power: 10, speed: 4, size: 0.7, desc: 'Can fly!' },
  { id: 'stego', name: 'STEGOSAURUS', emoji: '🐊', color: '#ffff00', power: 18, speed: 2.5, size: 1.1, desc: 'Tail whip!' },
];

const Wrecker = ({ onScore, highScore }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('select'); // select, playing, won, dead
  const [selectedDino, setSelectedDino] = useState(DINOS[0]);
  const [dino, setDino] = useState({ x: 50, y: 200, vy: 0, punching: false, punchFrame: 0, flying: false });
  const [buildings, setBuildings] = useState([]);
  const [cars, setCars] = useState([]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [rage, setRage] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const keysRef = useRef({});

  // Generate level
  const generateLevel = useCallback((lvl) => {
    // Buildings
    const newBuildings = [];
    let x = 100;
    for (let i = 0; i < 4 + lvl; i++) {
      const height = 60 + Math.random() * 80;
      const width = 40 + Math.random() * 25;
      newBuildings.push({
        x,
        y: CANVAS_HEIGHT - 20 - height,
        width,
        height,
        health: 80 + lvl * 15,
        maxHealth: 80 + lvl * 15,
        type: ['office', 'apartment', 'shop'][Math.floor(Math.random() * 3)],
      });
      x += width + 25 + Math.random() * 15;
    }

    // Cars
    const newCars = [];
    for (let i = 0; i < 3 + lvl * 2; i++) {
      newCars.push({
        id: i,
        x: 50 + Math.random() * (CANVAS_WIDTH - 100),
        y: CANVAS_HEIGHT - 35,
        width: 30,
        height: 15,
        speed: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()),
        color: ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ff00ff', '#ffffff'][Math.floor(Math.random() * 6)],
        health: 30,
        maxHealth: 30,
      });
    }

    return { buildings: newBuildings, cars: newCars };
  }, []);

  // Initialize game
  const initGame = useCallback((lvl = 1) => {
    const { buildings, cars } = generateLevel(lvl);
    setDino({ x: 30, y: 200, vy: 0, punching: false, punchFrame: 0, flying: false });
    setBuildings(buildings);
    setCars(cars);
    setScore(0);
    setHealth(100);
    setRage(0);
    setEnemies([]);
    setParticles([]);
    setLevel(lvl);
    setCombo(0);
    setComboTimer(0);
    setGameState('playing');
  }, [generateLevel]);

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
      const dinoSpeed = selectedDino.speed;
      const dinoSize = selectedDino.size;
      const dinoPower = selectedDino.power + (rage > 50 ? 10 : 0);

      // Dino movement
      setDino(prev => {
        let { x, y, vy, punching, punchFrame, flying } = prev;
        const onGround = y >= CANVAS_HEIGHT - 60 * dinoSize;
        
        // Pterodactyl can fly
        if (selectedDino.id === 'ptero') {
          if (keys.ArrowUp || keys.w) {
            flying = true;
            vy = -3;
          } else if (keys.ArrowDown || keys.s) {
            vy = 3;
          } else {
            vy *= 0.95;
          }
          y = Math.max(20, Math.min(CANVAS_HEIGHT - 40, y + vy));
        } else {
          // Normal gravity
          if ((keys.ArrowUp || keys.w || keys[' ']) && onGround) {
            vy = -10 - dinoSpeed;
          }
          vy += 0.6;
          y += vy;
          if (y > CANVAS_HEIGHT - 60 * dinoSize) {
            y = CANVAS_HEIGHT - 60 * dinoSize;
            vy = 0;
          }
        }

        // Horizontal movement
        if (keys.ArrowLeft || keys.a) x = Math.max(0, x - dinoSpeed);
        if (keys.ArrowRight || keys.d) x = Math.min(CANVAS_WIDTH - 40 * dinoSize, x + dinoSpeed);

        // Punching/Attack
        if ((keys.z || keys.x || keys.Enter) && !punching) {
          punching = true;
          punchFrame = 0;
        }
        if (punching) {
          punchFrame++;
          if (punchFrame > 12) {
            punching = false;
            punchFrame = 0;
          }
        }

        return { x, y, vy, punching, punchFrame, flying };
      });

      // Combo timer
      if (comboTimer > 0) {
        setComboTimer(t => t - 1);
        if (comboTimer === 1) setCombo(0);
      }

      // Check dino attack on buildings
      if (dino.punching && dino.punchFrame === 5) {
        setBuildings(prevBuildings => {
          let totalDamage = 0;
          const updated = prevBuildings.map(building => {
            const dinoRight = dino.x + 50 * selectedDino.size;
            const dinoBottom = dino.y + 60 * selectedDino.size;
            
            const hitting = dinoRight > building.x && 
                           dino.x < building.x + building.width &&
                           dinoBottom > building.y &&
                           dino.y < building.y + building.height;
            
            if (hitting) {
              const damage = dinoPower;
              const newHealth = Math.max(0, building.health - damage);
              totalDamage += damage;
              
              // Particles
              setParticles(prev => [...prev, ...Array(8).fill(null).map(() => ({
                x: building.x + Math.random() * building.width,
                y: dino.y + 30,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 8,
                life: 40,
                color: ['#888', '#666', '#aaa', '#555'][Math.floor(Math.random() * 4)],
                size: 2 + Math.random() * 4,
              }))]);

              return { ...building, health: newHealth };
            }
            return building;
          });

          if (totalDamage > 0) {
            setCombo(c => c + 1);
            setComboTimer(60);
            const points = totalDamage * (1 + combo * 0.5);
            setScore(s => s + Math.floor(points));
            setRage(r => Math.min(100, r + 8));
          }

          return updated.filter(b => b.health > 0);
        });

        // Check dino attack on cars
        setCars(prevCars => {
          return prevCars.map(car => {
            const dinoRight = dino.x + 50 * selectedDino.size;
            const dinoBottom = dino.y + 60 * selectedDino.size;
            
            const hitting = dinoRight > car.x && 
                           dino.x < car.x + car.width &&
                           dinoBottom > car.y - 10;
            
            if (hitting && car.health > 0) {
              const damage = dinoPower;
              const newHealth = Math.max(0, car.health - damage);
              
              if (newHealth <= 0) {
                // Car destroyed - explosion!
                setParticles(prev => [...prev, ...Array(12).fill(null).map(() => ({
                  x: car.x + car.width / 2,
                  y: car.y,
                  vx: (Math.random() - 0.5) * 12,
                  vy: -Math.random() * 10 - 3,
                  life: 50,
                  color: ['#ff0000', '#ff8800', '#ffff00'][Math.floor(Math.random() * 3)],
                  size: 3 + Math.random() * 5,
                }))]);
                setScore(s => s + 50 * (1 + combo * 0.5));
                setCombo(c => c + 1);
                setComboTimer(60);
              }

              return { ...car, health: newHealth };
            }
            return car;
          }).filter(c => c.health > 0);
        });
      }

      // Move cars
      setCars(prev => prev.map(car => {
        let newX = car.x + car.speed;
        if (newX < -30) newX = CANVAS_WIDTH;
        if (newX > CANVAS_WIDTH) newX = -30;
        return { ...car, x: newX };
      }));

      // Spawn enemies occasionally
      if (Math.random() > 0.995 && enemies.length < 3 + level) {
        setEnemies(prev => [...prev, {
          type: Math.random() > 0.6 ? 'helicopter' : 'tank',
          x: Math.random() > 0.5 ? -30 : CANVAS_WIDTH + 30,
          y: Math.random() > 0.6 ? 30 + Math.random() * 50 : CANVAS_HEIGHT - 50,
          shootTimer: 0,
          health: 50,
        }]);
      }

      // Update enemies
      setEnemies(prev => {
        return prev.map(enemy => {
          let { x, y, type, shootTimer, health } = enemy;
          
          // Move towards dino
          const targetX = dino.x;
          if (type === 'helicopter') {
            if (x < targetX) x += 1.5;
            else x -= 1.5;
            y = 40 + Math.sin(Date.now() / 400) * 20;
          } else {
            // Tank
            if (x < targetX - 50) x += 1;
            else if (x > targetX + 50) x -= 1;
          }

          // Shooting
          shootTimer++;
          if (shootTimer > 80) {
            const dist = Math.abs(x - dino.x);
            if (dist < 200) {
              setHealth(h => Math.max(0, h - 8));
              setParticles(p => [...p, {
                x: dino.x + 20,
                y: dino.y + 30,
                vx: 0, vy: 0,
                life: 15,
                color: '#ff0000',
                size: 8,
              }]);
            }
            shootTimer = 0;
          }

          // Check if dino is attacking enemy
          if (dino.punching && dino.punchFrame === 5) {
            const dinoRight = dino.x + 60 * selectedDino.size;
            const hitting = Math.abs(x - dino.x) < 60 && Math.abs(y - dino.y) < 60;
            if (hitting) {
              health -= dinoPower * 2;
              setScore(s => s + 100);
            }
          }

          return { ...enemy, x, y, shootTimer, health };
        }).filter(e => e.health > 0 && e.x > -50 && e.x < CANVAS_WIDTH + 50);
      });

      // Update particles
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.4,
          life: p.life - 1,
        })).filter(p => p.life > 0)
      );

      // Decay rage
      setRage(r => Math.max(0, r - 0.15));

      // Check win/lose
      if (health <= 0) {
        setGameState('dead');
        onScore(score);
      }
      if (buildings.length === 0 && cars.length === 0) {
        setGameState('won');
      }

    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, dino, buildings, cars, health, rage, score, combo, comboTimer, enemies, selectedDino, level, onScore]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;
    const ctx = canvas.getContext('2d');

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.7, '#2a1a4e');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
    // Road lines
    ctx.strokeStyle = '#ffff00';
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 10);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Buildings
    buildings.forEach(building => {
      const healthPercent = building.health / building.maxHealth;
      
      // Building shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(building.x + 5, building.y + 5, building.width, building.height);
      
      // Building body
      ctx.fillStyle = `hsl(${healthPercent * 30 + 200}, 40%, ${25 + healthPercent * 15}%)`;
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Windows
      const rows = Math.floor(building.height / 20);
      const cols = Math.floor(building.width / 15);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = building.x + c * 15 + 3;
          const wy = building.y + r * 20 + 5;
          const lit = Math.random() > 0.3;
          ctx.fillStyle = lit ? '#ffff00' : '#333';
          ctx.fillRect(wx, wy, 10, 12);
        }
      }

      // Health bar
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(building.x, building.y - 6, building.width, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(building.x, building.y - 6, building.width * healthPercent, 4);
    });

    // Cars
    cars.forEach(car => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(car.x + 2, car.y + 2, car.width, car.height);
      
      // Body
      ctx.fillStyle = car.color;
      ctx.fillRect(car.x, car.y, car.width, car.height);
      
      // Roof
      ctx.fillStyle = car.color;
      ctx.fillRect(car.x + 5, car.y - 8, car.width - 10, 10);
      
      // Wheels
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(car.x + 7, car.y + car.height, 4, 0, Math.PI * 2);
      ctx.arc(car.x + car.width - 7, car.y + car.height, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Windows
      ctx.fillStyle = '#88ccff';
      ctx.fillRect(car.x + 7, car.y - 6, car.width - 14, 6);
    });

    // Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemies
    enemies.forEach(enemy => {
      if (enemy.type === 'helicopter') {
        ctx.fillStyle = '#228822';
        ctx.fillRect(enemy.x, enemy.y, 35, 18);
        ctx.fillRect(enemy.x + 30, enemy.y + 5, 15, 8);
        // Rotor
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x + 5, enemy.y - 3);
        ctx.lineTo(enemy.x + 30, enemy.y - 3);
        ctx.stroke();
      } else {
        // Tank
        ctx.fillStyle = '#446644';
        ctx.fillRect(enemy.x, enemy.y, 40, 20);
        ctx.fillRect(enemy.x + 30, enemy.y + 5, 20, 8);
        // Wheels
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x, enemy.y + 18, 40, 8);
      }
    });

    // Draw Dino
    const d = dino;
    const size = selectedDino.size;
    ctx.fillStyle = rage > 50 ? '#ff4400' : selectedDino.color;
    
    // Body
    ctx.fillRect(d.x + 8 * size, d.y + 15 * size, 25 * size, 35 * size);
    
    // Head
    ctx.beginPath();
    ctx.ellipse(d.x + 20 * size, d.y + 10 * size, 18 * size, 12 * size, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth/Jaw
    ctx.fillStyle = d.punching ? '#ff0000' : selectedDino.color;
    ctx.beginPath();
    ctx.moveTo(d.x + 35 * size, d.y + 5 * size);
    ctx.lineTo(d.x + 50 * size, d.y + 10 * size);
    ctx.lineTo(d.x + 35 * size, d.y + 15 * size);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = rage > 50 ? '#ffff00' : '#ff0000';
    ctx.beginPath();
    ctx.arc(d.x + 28 * size, d.y + 6 * size, 3 * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(d.x + 29 * size, d.y + 6 * size, 1.5 * size, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.fillStyle = rage > 50 ? '#ff4400' : selectedDino.color;
    if (d.punching) {
      ctx.fillRect(d.x + 30 * size, d.y + 20 * size, 30 * size, 8 * size);
    } else {
      ctx.fillRect(d.x + 30 * size, d.y + 22 * size, 12 * size, 6 * size);
    }
    ctx.fillRect(d.x, d.y + 22 * size, 10 * size, 6 * size);
    
    // Legs
    ctx.fillRect(d.x + 10 * size, d.y + 48 * size, 10 * size, 15 * size);
    ctx.fillRect(d.x + 22 * size, d.y + 48 * size, 10 * size, 15 * size);
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(d.x + 5 * size, d.y + 35 * size);
    ctx.lineTo(d.x - 20 * size, d.y + 45 * size);
    ctx.lineTo(d.x + 5 * size, d.y + 45 * size);
    ctx.fill();

    // Combo text
    if (combo > 1) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${combo}x COMBO!`, d.x, d.y - 10);
    }

  }, [dino, buildings, cars, enemies, particles, rage, selectedDino, combo, gameState]);

  // Dino selection screen
  if (gameState === 'select') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="wrecker-game">
        <h2 className="text-2xl text-[#ff0000] neon-text">WRECKER</h2>
        <p className="text-[#888] text-sm">Choose your dinosaur!</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md">
          {DINOS.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDino(d)}
              className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedDino.id === d.id 
                  ? 'border-[#ffff00] bg-[#ffff00]/20 scale-105' 
                  : 'border-[#333] bg-black/30'
              }`}
            >
              <span className="text-4xl">{d.emoji}</span>
              <p className="text-sm font-bold mt-1" style={{ color: d.color }}>{d.name}</p>
              <p className="text-[8px] text-[#888]">{d.desc}</p>
              <div className="flex justify-between text-[8px] mt-2 text-[#666]">
                <span>PWR: {d.power}</span>
                <span>SPD: {d.speed}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-4">
          <p className="text-[#ffff00] text-sm mb-2">Selected: {selectedDino.emoji} {selectedDino.name}</p>
          <p className="text-[#888] text-[10px]">BEST SCORE: {highScore}</p>
        </div>

        <button 
          onClick={() => initGame(1)} 
          className="retro-btn text-[#ff0000] px-8 py-3 text-lg"
        >
          START RAMPAGE!
        </button>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="wrecker-game">
        <h2 className="text-2xl text-[#00ff00] neon-text">CITY DESTROYED!</h2>
        <span className="text-6xl">{selectedDino.emoji}</span>
        <p className="text-[#ffff00] text-xl">{score} POINTS</p>
        <p className="text-[#888]">Level {level} complete!</p>
        <button onClick={() => initGame(level + 1)} className="retro-btn text-[#00ff00]">
          NEXT CITY
        </button>
        <button onClick={() => setGameState('select')} className="retro-btn text-[#888] text-xs">
          CHANGE DINO
        </button>
      </div>
    );
  }

  if (gameState === 'dead') {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="wrecker-game">
        <h2 className="text-2xl text-[#ff0000] neon-text">DEFEATED!</h2>
        <span className="text-6xl">💀</span>
        <p className="text-[#888]">The military stopped {selectedDino.name}!</p>
        <p className="text-[#ffff00] text-xl">{score} POINTS</p>
        <button onClick={() => initGame(1)} className="retro-btn text-[#00ff00]">
          TRY AGAIN
        </button>
        <button onClick={() => setGameState('select')} className="retro-btn text-[#888] text-xs">
          CHANGE DINO
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2" data-testid="wrecker-game">
      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#00ffff]">LVL: {level}</span>
        <span style={{ color: selectedDino.color }}>{selectedDino.emoji} {selectedDino.name}</span>
        <span className="text-[#00ff00]">SCORE: {score}</span>
      </div>

      <div className="flex justify-between w-full max-w-sm text-xs">
        <span className="text-[#ff0000]">HP: {health}%</span>
        {combo > 1 && <span className="text-[#ffff00] animate-pulse">{combo}x COMBO!</span>}
        <span className="text-[#888]">🏢 {buildings.length} 🚗 {cars.length}</span>
      </div>

      {/* Rage bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-[#ff8800]">RAGE</span>
          {rage > 50 && <span className="text-[#ff0000] animate-pulse">RAGE MODE!</span>}
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

      <p className="text-[8px] text-[#888]">ARROWS: MOVE • Z/X/ENTER: ATTACK</p>

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
          className="w-20 h-20 rounded-full text-white font-bold text-sm active:scale-95 transition-transform"
          style={{ backgroundColor: selectedDino.color }}
        >
          ATTACK!
        </button>
      </div>
    </div>
  );
};

export default Wrecker;
