/* Mini Maze: Ascension — Wall-Perfect + Chambers + Chests + Workbench Crafting + Fit Screen
   Controls:
   - Move: WASD / Arrow Keys (grid step, wall-perfect)
   - Attack: Space (hits adjacent)
   - Open chest: E (when standing on a chest)
   - Craft: C (ONLY when standing on 🛠 workbench inside a chamber)
   - Restart: R
*/

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const keys = new Set();
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys.add(k);
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const nowMs = () => performance.now();

const CFG = {
  // Auto-fit camera
  baseTilePx: 46,                 // will be scaled by zoom to fit nicely
  minTilePx: 26,
  maxTilePx: 64,

  levelStartSize: 15,
  rotateEveryMs: 5 * 60 * 1000,
  rotateWarnMs: 5000,

  stepCooldownMs: 85,
  turnBufferMs: 150,

  weakDamage: 10,
  weakHitCooldownMs: 520,

  attackCooldownMs: 240,
  attackRange: 1,

  waveStartLevel: 11,
  waveIntervalMinMs: 35000,
  waveIntervalMaxMs: 52000,
  bossLevelEvery: 5,

  playerEmoji: "🧍‍♂️",
  weakEmoji: "🧟",
  bossEmoji: "🧌",
  chestEmoji: "🧰",
  benchEmoji: "🛠",
};

const COLORS = {
  bg: "#0f1115",
  wall: "rgba(0,240,255,0.70)",
  wallRoom: "rgba(0,240,255,0.92)",
  roomFill: "rgba(255,255,255,0.07)",
  uiBg: "rgba(0,0,0,0.60)",
  uiStroke: "rgba(255,255,255,0.12)",
  text: "rgba(255,255,255,0.92)",
  warn: "rgba(255,170,0,0.95)",
  danger: "rgba(255,60,60,0.95)",
  exitLocked: "rgba(60,255,94,0.22)",
  exitOpen: "rgba(60,255,94,0.95)",
};

// ---------- Maze ----------
function makeMaze(w, h, roomCount) {
  const cells = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ n: true, e: true, s: true, w: true, room: false }))
  );
  const vis = Array.from({ length: h }, () => Array(w).fill(false));

  const knock = (ax, ay, bx, by, dir) => {
    if (dir === "n") { cells[ay][ax].n = false; cells[by][bx].s = false; }
    if (dir === "e") { cells[ay][ax].e = false; cells[by][bx].w = false; }
    if (dir === "s") { cells[ay][ax].s = false; cells[by][bx].n = false; }
    if (dir === "w") { cells[ay][ax].w = false; cells[by][bx].e = false; }
  };

  const neigh = (x, y) => {
    const out = [];
    if (y > 0 && !vis[y - 1][x]) out.push([x, y - 1, "n"]);
    if (x < w - 1 && !vis[y][x + 1]) out.push([x + 1, y, "e"]);
    if (y < h - 1 && !vis[y + 1][x]) out.push([x, y + 1, "s"]);
    if (x > 0 && !vis[y][x - 1]) out.push([x - 1, y, "w"]);
    return out;
  };

  // DFS carve
  const sx = randInt(0, w - 1), sy = randInt(0, h - 1);
  const st = [[sx, sy]];
  vis[sy][sx] = true;

  while (st.length) {
    const [cx, cy] = st[st.length - 1];
    const ns = neigh(cx, cy);
    if (!ns.length) { st.pop(); continue; }
    const [nx, ny, dir] = ns[randInt(0, ns.length - 1)];
    knock(cx, cy, nx, ny, dir);
    vis[ny][nx] = true;
    st.push([nx, ny]);
  }

  // Chambers (rooms)
  const rooms = [];
  for (let i = 0; i < roomCount; i++) {
    const rw = randInt(3, Math.min(8, w - 2));
    const rh = randInt(3, Math.min(8, h - 2));
    const rx = randInt(1, w - rw - 1);
    const ry = randInt(1, h - rh - 1);
    rooms.push({ x: rx, y: ry, w: rw, h: rh });

    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        cells[y][x].room = true;
        if (x > rx) { cells[y][x].w = false; cells[y][x - 1].e = false; }
        if (y > ry) { cells[y][x].n = false; cells[y - 1][x].s = false; }
      }
    }

    // doorway
    const side = randInt(0, 3);
    let dx, dy, dir;
    if (side === 0) { dx = randInt(rx, rx + rw - 1); dy = ry; dir = "n"; }
    if (side === 1) { dx = rx + rw - 1; dy = randInt(ry, ry + rh - 1); dir = "e"; }
    if (side === 2) { dx = randInt(rx, rx + rw - 1); dy = ry + rh - 1; dir = "s"; }
    if (side === 3) { dx = rx; dy = randInt(ry, ry + rh - 1); dir = "w"; }

    let bx = dx, by = dy;
    if (dir === "n") by--;
    if (dir === "e") bx++;
    if (dir === "s") by++;
    if (dir === "w") bx--;
    if (bx >= 0 && bx < w && by >= 0 && by < h) knock(dx, dy, bx, by, dir);
  }

  return { w, h, cells, rooms };
}

function rotateMaze90(maze) {
  const { w, h, cells, rooms } = maze;
  const nw = h, nh = w;
  const nc = Array.from({ length: nh }, () =>
    Array.from({ length: nw }, () => ({ n: true, e: true, s: true, w: true, room: false }))
  );

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = h - 1 - y, ny = x;
      const c = cells[y][x];
      nc[ny][nx] = { n: c.w, e: c.n, s: c.e, w: c.s, room: c.room };
    }
  }

  const nr = rooms.map(r => {
    const newX = h - (r.y + r.h);
    const newY = r.x;
    return { x: newX, y: newY, w: r.h, h: r.w };
  });

  return { w: nw, h: nh, cells: nc, rooms: nr };
}

// ---------- Game ----------
let game = null;

function isBossLevel(L) { return (L % CFG.bossLevelEvery) === 0; }
function sizeForLevel(L) { return CFG.levelStartSize + 2 * (L - 1); }
function roomCountForLevel(L) { return L <= 4 ? 1 : L <= 9 ? 2 : L <= 14 ? 3 : 4; }

function randomFarCell(maze, fx, fy, minD) {
  for (let i = 0; i < 700; i++) {
    const x = randInt(0, maze.w - 1), y = randInt(0, maze.h - 1);
    if (dist(x, y, fx, fy) >= minD) return { x, y };
  }
  return { x: maze.w - 1, y: maze.h - 1 };
}

function startRun() {
  game = {
    state: "PLAYING",
    level: 1,
    score: 0,

    hp: 100, maxHP: 100,
    xp: 0, plvl: 1, sp: 0,
    dmgPts: 0, spdPts: 0, hpPts: 0,

    inventory: { scrap: 0, wood: 0, crystal: 0, gear: 0, bone: 0, weapon: 0, armor: 0 },

    maze: null,
    player: { x: 0, y: 0, face: 1 },

    weak: [],
    bosses: [],
    exit: { x: 0, y: 0, unlocked: false },

    chests: [],      // {x,y,opened,loot}
    benches: [],     // {x,y} one per chamber

    lastWeakHitAt: 0,
    lastAttackAt: 0,

    lastStepAt: 0,
    wantDir: null,
    wantDirAt: 0,

    rotateAt: nowMs() + CFG.rotateEveryMs,
    warnAt: 0,

    totalWeak: 0, spawnedWeak: 0, nextWaveAt: 0,

    msg: "",
  };

  loadLevel(1);
}

function xpToNext(pl) { return Math.floor(60 + (pl - 1) * 35 + (pl - 1) * (pl - 1) * 6); }

function effDamage() {
  const weaponBonus = game.inventory.weapon ? 1.25 : 1.0;
  return 18 * (1 + game.dmgPts * 0.05) * weaponBonus;
}
function effWeakDamage() { return CFG.weakDamage * (game.inventory.armor ? 0.75 : 1.0); }

function addXP(a) {
  game.xp += a;
  while (game.xp >= xpToNext(game.plvl)) {
    game.xp -= xpToNext(game.plvl);
    game.plvl++;
    game.sp++;
    game.hp = Math.min(game.maxHP, game.hp + 12);
    game.score += 250;
  }
}

function spawnWeak(count) {
  for (let i = 0; i < count; i++) {
    const p = randomFarCell(game.maze, game.player.x, game.player.y, Math.floor(game.maze.w * 0.35));
    game.weak.push({ x: p.x, y: p.y, hp: 22 + Math.floor(game.level * 2.2) });
  }
}

function spawnWave() {
  const remaining = game.totalWeak - game.spawnedWeak;
  if (remaining <= 0) return;
  const waveSize = Math.min(5 + Math.floor(game.level / 7), 12);
  const n = Math.min(waveSize, remaining);
  spawnWeak(n);
  game.spawnedWeak += n;
  game.nextWaveAt = nowMs() + randInt(CFG.waveIntervalMinMs, CFG.waveIntervalMaxMs);
}

function placeChestsAndBenches() {
  game.chests = [];
  game.benches = [];

  for (const r of game.maze.rooms) {
    // Workbench placed near center-ish
    const bx = clamp(r.x + Math.floor(r.w / 2), r.x + 1, r.x + r.w - 2);
    const by = clamp(r.y + Math.floor(r.h / 2), r.y + 1, r.y + r.h - 2);
    game.benches.push({ x: bx, y: by });

    // 1 chest per chamber (sometimes 2 later)
    const chestCount = (game.level >= 8 && Math.random() < 0.35) ? 2 : 1;
    for (let i = 0; i < chestCount; i++) {
      let x = randInt(r.x + 1, r.x + r.w - 2);
      let y = randInt(r.y + 1, r.y + r.h - 2);

      if ((x === game.player.x && y === game.player.y) || (x === game.exit.x && y === game.exit.y)) { i--; continue; }
      if (x === bx && y === by) { i--; continue; } // don't overlap bench
      if (game.chests.some(c => c.x === x && c.y === y)) { i--; continue; }

      const loot = {
        scrap: randInt(1, 2 + Math.floor(game.level / 6)),
        wood: Math.random() < 0.60 ? randInt(0, 1) : 0,
        crystal: Math.random() < 0.25 ? 1 : 0,
        gear: Math.random() < 0.20 ? 1 : 0,
        bone: Math.random() < 0.35 ? randInt(0, 1) : 0
      };

      game.chests.push({ x, y, opened: false, loot });
    }
  }
}

function loadLevel(L) {
  game.level = L;
  const size = sizeForLevel(L);
  game.maze = makeMaze(size, size, roomCountForLevel(L));

  game.player.x = 0; game.player.y = 0; game.player.face = 1;

  game.exit.x = game.maze.w - 1;
  game.exit.y = game.maze.h - 1;
  game.exit.unlocked = false;

  // bosses
  game.bosses = [];
  const bossCount = isBossLevel(L) ? 2 : 1;
  for (let i = 0; i < bossCount; i++) {
    const p = randomFarCell(game.maze, game.player.x, game.player.y, Math.floor(size * 0.6));
    game.bosses.push({
      x: p.x, y: p.y,
      hp: Math.floor((160 + L * 16) * (bossCount === 2 ? 0.75 : 1)),
      role: (i === 1 ? "WARDEN" : "HUNTER")
    });
  }

  // weak
  game.weak = [];
  game.totalWeak = L + 1;
  game.spawnedWeak = 0;
  if (L <= 10) { spawnWeak(game.totalWeak); game.spawnedWeak = game.totalWeak; }
  else { spawnWave(); game.nextWaveAt = nowMs() + randInt(CFG.waveIntervalMinMs, CFG.waveIntervalMaxMs); }

  // chambers loot & benches
  placeChestsAndBenches();

  game.rotateAt = nowMs() + CFG.rotateEveryMs;
  game.warnAt = game.rotateAt - CFG.rotateWarnMs;
  game.msg = `Level ${L} — find 🧰 in chambers (E). Craft only at 🛠 (C).`;
}

// ---------- Grid movement (no phasing) ----------
function cellAt(x, y) {
  if (x < 0 || y < 0 || x >= game.maze.w || y >= game.maze.h) return null;
  return game.maze.cells[y][x];
}
function canStep(x, y, dir) {
  const c = cellAt(x, y);
  if (!c) return false;
  if (dir === 0) return !c.n;
  if (dir === 1) return !c.e;
  if (dir === 2) return !c.s;
  if (dir === 3) return !c.w;
  return false;
}
function tryStep(dir) {
  const p = game.player;
  if (!canStep(p.x, p.y, dir)) return false;
  if (dir === 0) p.y--;
  if (dir === 1) p.x++;
  if (dir === 2) p.y++;
  if (dir === 3) p.x--;
  p.face = dir;
  return true;
}
function readWantedDir() {
  let dir = null;
  if (keys.has("w") || keys.has("arrowup")) dir = 0;
  if (keys.has("d") || keys.has("arrowright")) dir = 1;
  if (keys.has("s") || keys.has("arrowdown")) dir = 2;
  if (keys.has("a") || keys.has("arrowleft")) dir = 3;

  if (dir !== null) {
    game.wantDir = dir;
    game.wantDirAt = nowMs();
  }
  if (game.wantDir !== null && (nowMs() - game.wantDirAt) <= CFG.turnBufferMs) return game.wantDir;
  return null;
}

// ---------- AI ----------
function stepToward(ent, tx, ty) {
  const dirs = [0, 1, 2, 3];
  let best = null, bestD = 1e9;
  for (const d of dirs) {
    if (!canStep(ent.x, ent.y, d)) continue;
    let nx = ent.x, ny = ent.y;
    if (d === 0) ny--;
    if (d === 1) nx++;
    if (d === 2) ny++;
    if (d === 3) nx--;
    const dd = dist(nx, ny, tx, ty);
    if (dd < bestD) { bestD = dd; best = d; }
  }
  if (best !== null) {
    if (best === 0) ent.y--;
    if (best === 1) ent.x++;
    if (best === 2) ent.y++;
    if (best === 3) ent.x--;
  }
}
function updateEnemies() {
  const p = game.player;

  const zStepMs = clamp(260 - game.level * 6, 120, 260);
  game._zLast ??= 0;
  if (nowMs() - game._zLast >= zStepMs) {
    game._zLast = nowMs();
    for (const z of game.weak) stepToward(z, p.x, p.y);
  }

  const bStepMs = clamp(220 - game.level * 4, 90, 220);
  game._bLast ??= 0;
  if (nowMs() - game._bLast >= bStepMs) {
    game._bLast = nowMs();
    for (const b of game.bosses) {
      if (b.role === "WARDEN") {
        const dToExit = dist(p.x, p.y, game.exit.x, game.exit.y);
        if (dToExit < 6) stepToward(b, p.x, p.y);
        else stepToward(b, game.exit.x, game.exit.y);
      } else stepToward(b, p.x, p.y);
    }
  }

  if (game.level >= CFG.waveStartLevel && nowMs() >= game.nextWaveAt) {
    spawnWave();
    game.score += 150;
    game.msg = "Wave incoming… survive.";
  }
}

// ---------- Interactions ----------
function chestHere() {
  return game.chests.find(c => c.x === game.player.x && c.y === game.player.y) || null;
}
function benchHere() {
  return game.benches.find(b => b.x === game.player.x && b.y === game.player.y) || null;
}
function openChest() {
  const chest = chestHere();
  if (!chest) { game.msg = "No chest here."; return; }
  if (chest.opened) { game.msg = "Chest already opened."; return; }

  chest.opened = true;
  for (const k of Object.keys(chest.loot)) {
    game.inventory[k] = (game.inventory[k] || 0) + chest.loot[k];
  }

  addXP(12 + Math.floor(game.level / 3));
  game.score += 200;

  const lootText = Object.entries(chest.loot).filter(([_, v]) => v > 0).map(([k, v]) => `${k}+${v}`).join(", ");
  game.msg = `Opened chest: ${lootText || "nothing"} (XP +)`;
}

function craftAtBench() {
  if (!benchHere()) { game.msg = "You must stand on 🛠 workbench to craft."; return; }

  const inv = game.inventory;

  // Recipes (expand later)
  if (!inv.weapon && inv.scrap >= 6 && inv.crystal >= 1 && inv.gear >= 1) {
    inv.scrap -= 6; inv.crystal -= 1; inv.gear -= 1;
    inv.weapon = 1;
    addXP(60);
    game.score += 800;
    game.msg = "Crafted: SWORD ✅ (damage boosted)";
    return;
  }

  if (!inv.armor && inv.scrap >= 8 && inv.bone >= 2 && inv.gear >= 1) {
    inv.scrap -= 8; inv.bone -= 2; inv.gear -= 1;
    inv.armor = 1;
    addXP(70);
    game.score += 900;
    game.msg = "Crafted: ARMOR ✅ (damage taken reduced)";
    return;
  }

  if (!inv.weapon && inv.scrap >= 5 && inv.wood >= 2) {
    inv.scrap -= 5; inv.wood -= 2;
    inv.weapon = 1;
    addXP(45);
    game.score += 650;
    game.msg = "Crafted: PICKAXE ✅ (damage boosted)";
    return;
  }

  game.msg = "No recipe matched. Loot more 🧰 in chambers.";
}

// ---------- Combat ----------
function attack() {
  const t = nowMs();
  if (t - game.lastAttackAt < CFG.attackCooldownMs) return;
  game.lastAttackAt = t;

  const p = game.player;
  const dmg = effDamage();

  for (const z of game.weak) {
    if (dist(p.x, p.y, z.x, z.y) <= CFG.attackRange) {
      z.hp -= dmg;
      game.score += 20;
    }
  }

  const beforeW = game.weak.length;
  game.weak = game.weak.filter(z => z.hp > 0);
  const killedW = beforeW - game.weak.length;
  if (killedW > 0) {
    addXP(15 + Math.floor(game.level / 2));
    if (Math.random() < 0.25) game.inventory.bone += 1;
    game.score += 120 * killedW;
    game.msg = `Defeated ${killedW} 🧟 (XP +)`;
  }

  for (const b of game.bosses) {
    if (dist(p.x, p.y, b.x, b.y) <= CFG.attackRange) {
      b.hp -= dmg * clamp(game.plvl / (game.level * 0.9), 0.25, 1.2);
      game.score += 50;
    }
  }

  const beforeB = game.bosses.length;
  game.bosses = game.bosses.filter(b => b.hp > 0);
  const killedB = beforeB - game.bosses.length;
  if (killedB > 0) {
    addXP(140 + game.level * 12);
    game.score += 2000 * killedB;
    if (game.bosses.length === 0) {
      game.exit.unlocked = true;
      game.msg = "Boss defeated ✅ EXIT UNLOCKED";
    }
  }
}

function hurt(a) {
  game.hp -= a;
  if (game.hp <= 0) {
    game.hp = 0;
    game.state = "GAME_OVER";
  }
}

// ---------- Rotation ----------
function rotateEverything() {
  const old = game.maze;
  const oldH = old.h;

  game.maze = rotateMaze90(old);

  const rot = (ent) => {
    const nx = oldH - 1 - ent.y;
    const ny = ent.x;
    ent.x = nx; ent.y = ny;
  };

  rot(game.player);
  for (const z of game.weak) rot(z);
  for (const b of game.bosses) rot(b);

  const ex = game.exit.x, ey = game.exit.y;
  game.exit.x = oldH - 1 - ey;
  game.exit.y = ex;

  for (const c of game.chests) rot(c);
  for (const b of game.benches) rot(b);

  game.player.face = (game.player.face + 1) % 4;

  game.rotateAt = nowMs() + CFG.rotateEveryMs;
  game.warnAt = game.rotateAt - CFG.rotateWarnMs;
  game.msg = "⚠ Maze rotated. Re-orient and survive.";
}

// ---------- Camera Fit ----------
function computeTilePx() {
  // We want a stable view area around the player that fills the screen without tiny maze.
  // Make tile size based on screen, clamped.
  const targetCols = Math.max(13, Math.min(21, Math.floor(canvas.width / 62)));  // dynamic
  const targetRows = Math.max(9, Math.min(17, Math.floor(canvas.height / 70)));

  const tileX = Math.floor(canvas.width / targetCols);
  const tileY = Math.floor(canvas.height / targetRows);
  const tile = Math.floor(Math.min(tileX, tileY));

  return clamp(tile, CFG.minTilePx, CFG.maxTilePx);
}

// ---------- Draw ----------
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHUD(tile) {
  // top-left compact panel
  const pad = 12;
  const x = pad, y = pad;
  const w = Math.min(560, canvas.width - pad * 2);
  const h = 150;

  ctx.fillStyle = COLORS.uiBg;
  ctx.strokeStyle = COLORS.uiStroke;
  ctx.lineWidth = 1;
  roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "left";
  ctx.font = "900 18px system-ui";
  ctx.fillText("MINI MAZE: ASCENSION", x + 14, y + 28);

  ctx.font = "14px system-ui";
  ctx.fillText(`Level: ${game.level}   Player Lv: ${game.plvl}   XP: ${game.xp}/${xpToNext(game.plvl)}`, x + 14, y + 52);
  ctx.fillText(`HP: ${game.hp}/${game.maxHP}   Score: ${game.score}`, x + 14, y + 72);

  const lockTxt = game.exit.unlocked ? "EXIT: UNLOCKED ✅" : `EXIT: LOCKED — Kill 🧌 (${game.bosses.length} left)`;
  ctx.fillText(lockTxt, x + 14, y + 92);

  const mode = game.level >= CFG.waveStartLevel ? "WAVES" : "BATCH";
  ctx.fillText(`🧟 on-map: ${game.weak.length}   Spawn: ${mode}`, x + 14, y + 112);

  const sec = Math.floor(Math.max(0, game.rotateAt - nowMs()) / 1000);
  ctx.fillText(`Rotation in: ${sec}s`, x + 14, y + 132);

  const inv = game.inventory;
  ctx.fillText(
    `Inv: scrap(${inv.scrap}) wood(${inv.wood}) crystal(${inv.crystal}) gear(${inv.gear}) bone(${inv.bone}) | 🗡(${inv.weapon?"YES":"no"}) 🛡(${inv.armor?"YES":"no"})`,
    x + 14, y + 152
  );

  if (game.msg) {
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.fillText(`Tip: ${game.msg}`, x + 14, y + 172);
  }

  // small legend bottom-left of HUD
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(`E=open 🧰  C=craft at 🛠  Space=attack`, x + 14, y + 192);
}

function drawWarning() {
  const t = nowMs();
  if (game.warnAt === 0) game.warnAt = game.rotateAt - CFG.rotateWarnMs;
  if (t < game.warnAt || t >= game.rotateAt) return;

  const left = Math.ceil((game.rotateAt - t) / 1000);
  ctx.font = "900 34px system-ui";
  ctx.textAlign = "center";
  ctx.fillStyle = left <= 2 ? COLORS.danger : COLORS.warn;
  ctx.fillText(`⚠ MAZE ROTATES IN ${left} ⚠`, canvas.width / 2, 78);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const m = game.maze;
  const tile = computeTilePx();

  // Camera follow
  const viewW = Math.floor(canvas.width / tile);
  const viewH = Math.floor(canvas.height / tile);

  let camX = game.player.x - Math.floor(viewW / 2) + 2;
  let camY = game.player.y - Math.floor(viewH / 2) + 2;
  camX = clamp(camX, 0, Math.max(0, m.w - viewW));
  camY = clamp(camY, 0, Math.max(0, m.h - viewH));

  const offX = Math.floor((canvas.width - viewW * tile) / 2);
  const offY = Math.floor((canvas.height - viewH * tile) / 2);

  const x0 = camX, x1 = Math.min(m.w, camX + viewW + 1);
  const y0 = camY, y1 = Math.min(m.h, camY + viewH + 1);

  // chamber fill
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (m.cells[y][x].room) {
        ctx.fillStyle = COLORS.roomFill;
        ctx.fillRect(offX + (x - camX) * tile, offY + (y - camY) * tile, tile, tile);
      }
    }
  }

  // walls
  ctx.lineWidth = Math.max(2, Math.floor(tile * 0.07));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const c = m.cells[y][x];
      const px = offX + (x - camX) * tile;
      const py = offY + (y - camY) * tile;
      const x2 = px + tile, y2 = py + tile;
      ctx.strokeStyle = c.room ? COLORS.wallRoom : COLORS.wall;
      if (c.n) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, py); ctx.stroke(); }
      if (c.e) { ctx.beginPath(); ctx.moveTo(x2, py); ctx.lineTo(x2, y2); ctx.stroke(); }
      if (c.s) { ctx.beginPath(); ctx.moveTo(px, y2); ctx.lineTo(x2, y2); ctx.stroke(); }
      if (c.w) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, y2); ctx.stroke(); }
    }
  }

  // exit
  const ex = game.exit.x, ey = game.exit.y;
  if (ex >= x0 && ex < x1 && ey >= y0 && ey < y1) {
    const px = offX + (ex - camX) * tile;
    const py = offY + (ey - camY) * tile;
    ctx.fillStyle = game.exit.unlocked ? COLORS.exitOpen : COLORS.exitLocked;
    ctx.fillRect(px + tile * 0.18, py + tile * 0.18, tile * 0.64, tile * 0.64);
  }

  const drawEmoji = (emoji, x, y, sizeMul = 1) => {
    if (x < x0 || x >= x1 || y < y0 || y >= y1) return;
    const px = offX + (x - camX) * tile + tile * 0.5;
    const py = offY + (y - camY) * tile + tile * 0.58;
    ctx.font = `${Math.floor(tile * 0.92 * sizeMul)}px Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, px, py);
  };

  // benches
  for (const b of game.benches) drawEmoji(CFG.benchEmoji, b.x, b.y, 1.05);
  // chests (only unopened)
  for (const c of game.chests) if (!c.opened) drawEmoji(CFG.chestEmoji, c.x, c.y, 1.05);

  // enemies
  for (const z of game.weak) drawEmoji(CFG.weakEmoji, z.x, z.y, 1.0);
  for (const b of game.bosses) drawEmoji(CFG.bossEmoji, b.x, b.y, 1.25);
  // player
  drawEmoji(CFG.playerEmoji, game.player.x, game.player.y, 1.05);

  drawHUD(tile);
  drawWarning();

  if (game.state === "GAME_OVER") {
    ctx.fillStyle = "rgba(0,0,0,0.70)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "900 56px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "18px system-ui";
    ctx.fillText(`Reached Level ${game.level} | Score ${game.score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 40);
  }
}

// ---------- Loop ----------
function update() {
  if (!game) startRun();

  if (game.state === "GAME_OVER") {
    if (keys.has("r")) startRun();
    draw();
    requestAnimationFrame(update);
    return;
  }

  // rotate
  if (nowMs() >= game.rotateAt) rotateEverything();

  // movement
  const dir = readWantedDir();
  if (dir !== null) {
    const t = nowMs();
    if (t - game.lastStepAt >= CFG.stepCooldownMs) {
      if (tryStep(dir)) game.lastStepAt = t;
      else game.player.face = dir;
    }
  }

  // interactions (edge-trigger)
  if (keys.has("e")) {
    if (!game._eDown) openChest();
    game._eDown = true;
  } else game._eDown = false;

  if (keys.has("c")) {
    if (!game._cDown) craftAtBench();
    game._cDown = true;
  } else game._cDown = false;

  if (keys.has(" ")) {
    if (!game._spaceDown) attack();
    game._spaceDown = true;
  } else game._spaceDown = false;

  // enemies
  updateEnemies();

  // damage collisions
  const p = game.player;

  for (const z of game.weak) {
    if (dist(p.x, p.y, z.x, z.y) < 0.7) {
      if (nowMs() - game.lastWeakHitAt >= CFG.weakHitCooldownMs) {
        game.lastWeakHitAt = nowMs();
        hurt(effWeakDamage());
      }
    }
  }

  for (const b of game.bosses) {
    if (dist(p.x, p.y, b.x, b.y) < 0.8) {
      game.hp = 0;
      game.state = "GAME_OVER";
      game.msg = "Boss caught you. Game over.";
    }
  }

  // exit
  if (game.exit.unlocked && dist(p.x, p.y, game.exit.x, game.exit.y) < 0.7) {
    loadLevel(game.level + 1);
    game.hp = Math.min(game.maxHP, game.hp + 15);
    addXP(20);
  }

  draw();
  requestAnimationFrame(update);
}

startRun();
requestAnimationFrame(update);