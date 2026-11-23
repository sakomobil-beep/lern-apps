// Spiellogik: Speicher, Töne, Rechenaufgaben und die Level-Szene.
(() => {
const T = 48, GW = 1040, GH = 624;

// ---------- Speicherstand ----------
const KEY = 'rette_geschenke_v1';
const Save = {
  data: null,
  load() {
    let d = {}; try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    this.data = { levels: d.levels || {}, settings: Object.assign({ math: '20', music: true, sound: true }, d.settings || {}), papa: !!d.papa, doors: d.doors || {}, storySeen: !!d.storySeen };
  },
  write() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {} },
  resetProgress() { this.data.levels = {}; this.data.papa = false; this.data.doors = {}; this.write(); }
};
Save.load();

// ---------- Töne (selbst erzeugt) ----------
const NOTE = { C3: 48, D3: 50, F3: 53, G3: 55, C4: 60, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79 };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const MEL = [['E5',1],['E5',1],['E5',2],['E5',1],['E5',1],['E5',2],['E5',1],['G5',1],['C5',1.5],['D5',.5],['E5',4],
  ['F5',1],['F5',1],['F5',1.5],['F5',.5],['F5',1],['E5',1],['E5',1],['E5',.5],['E5',.5],['E5',1],['D5',1],['D5',1],['E5',1],['D5',2],['G5',2]];
const BASS = [['C3','G3'],['C3','G3'],['C3','G3'],['C3','G3'],['F3','C4'],['C3','G3'],['G3','D3'],['G3','D3']];
const Sfx = {
  ctx: null, mg: null, timer: null,
  init() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  tone(f, d, type, vol, when, slide, dest) {
    const c = this.ctx; if (!c) return;
    if (!dest && !Save.data.settings.sound) return;
    const t = c.currentTime + (when || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol || .08, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(dest || c.destination); o.start(t); o.stop(t + d + .05);
  },
  seq(fs, step, type, vol) { fs.forEach((f, i) => this.tone(f, step * 1.4, type, vol, i * step)); },
  jump() { this.tone(330, .16, 'square', .045, 0, 700); },
  gift() { this.seq([880, 1320], .07, 'triangle', .1); },
  gold() { this.seq([880, 1109, 1319, 1760], .07, 'triangle', .1); },
  stomp() { this.tone(520, .14, 'sine', .14, 0, 110); },
  hurt() { this.tone(300, .35, 'sawtooth', .07, 0, 90); },
  throw() { this.tone(700, .1, 'sine', .07, 0, 280); },
  gate() { this.seq([523, 659, 784, 1047], .09, 'triangle', .1); },
  wrong() { this.tone(240, .25, 'triangle', .08); },
  life() { this.seq([660, 880, 990], .08, 'square', .06); },
  bell() { this.seq([1568, 2093, 1568, 2093], .12, 'sine', .08); },
  ting() { this.tone(2093, .18, 'sine', .035); },
  win() { this.seq([523, 659, 784, 1047, 784, 1047], .12, 'triangle', .1); },
  startMusic() {
    this.stopMusic();
    if (!this.ctx || !Save.data.settings.music) return;
    const mg = this.ctx.createGain(); mg.gain.value = 1; mg.connect(this.ctx.destination); this.mg = mg;
    const beat = .3;
    const loop = () => {
      if (this.mg !== mg) return;
      let t = 0;
      MEL.forEach(([n, b]) => { this.tone(hz(NOTE[n]), b * beat * .9, 'triangle', .045, t + .05, 0, mg); t += b * beat; });
      for (let i = 0; i < t / beat; i++) { const ch = BASS[Math.floor(i / 4) % BASS.length]; this.tone(hz(NOTE[ch[i % 2]]), beat * .8, 'sine', .07, i * beat + .05, 0, mg); }
      this.timer = setTimeout(loop, t * 1000);
    };
    loop();
  },
  stopMusic() { clearTimeout(this.timer); if (this.mg) { try { this.mg.disconnect(); } catch (e) {} } this.mg = null; }
};

// ---------- Rechentore ----------
function makeTask(mode) {
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  let q, a, hint;
  if (mode === 'mal') {
    const x = r(1, 10), y = r(2, 10); q = `${x} × ${y}`; a = x * y;
    hint = `Tipp: Zähle in ${y}er-Schritten: ${y}, ${2 * y}, ${3 * y} … und das ${x}-mal.`;
  } else {
    const max = mode === '100' ? 100 : 20;
    if (Math.random() < .5) {
      const x = r(1, max - 1), y = r(1, max - x); q = `${x} + ${y}`; a = x + y;
      if (max === 20 && x < 10 && a > 10) hint = `Tipp: ${x} + ${10 - x} = 10, dann noch ${y - (10 - x)} dazu.`;
      else if (max === 100 && y >= 10) hint = `Tipp: Erst die Zehner: ${x} + ${y - y % 10} = ${x + y - y % 10}, dann noch ${y % 10} dazu.`;
      else hint = `Tipp: Fang bei ${x} an und zähle ${y} weiter.`;
    } else {
      const x = r(2, max), y = r(1, x - 1); q = `${x} − ${y}`; a = x - y;
      if (max === 20 && x > 10 && a < 10) hint = `Tipp: ${x} − ${x - 10} = 10, dann noch ${y - (x - 10)} weg.`;
      else if (max === 100 && y >= 10) hint = `Tipp: Erst die Zehner: ${x} − ${y - y % 10} = ${x - (y - y % 10)}, dann noch ${y % 10} weg.`;
      else hint = `Tipp: Fang bei ${x} an und zähle ${y} zurück.`;
    }
  }
  const opts = new Set([a]);
  while (opts.size < 4) { const d = a + r(-5, 5); if (d >= 0 && d !== a) opts.add(d); }
  return { q, a, hint, opts: [...opts].sort((m, n) => m - n) };
}

// ---------- Eingabe vom Touch-Bildschirm ----------
const Touch = { left: false, right: false, jump: false, throw: false };

// ---------- Die Level-Szene ----------
class GameScene extends Phaser.Scene {
  constructor() { super('game'); }
  init(d) { this.levelId = d.id; }
  preload() {
    if (!this.cache.json.exists(this.levelId)) this.load.json(this.levelId, `levels/${this.levelId}.json`);
    // Gezeichnete Sprite-Sheets (doppelte Auflösung, werden mit Faktor 0,5 angezeigt)
    const SH = { santa: [90, 105], wichtel: [72, 84], pinguin: [96, 112], robot: [72, 84], schnee: [102, 119], items: [80, 80] };
    for (const [k, [w, h]] of Object.entries(SH)) if (!this.textures.exists('S_' + k)) this.load.spritesheet('S_' + k, `assets/sprites/${k}.png`, { frameWidth: w, frameHeight: h });
  }

  create() {
    makeTextures(this);
    const A = this.anims, mk = (key, tex, frames, rate, rep = -1) => { if (!A.exists(key)) A.create({ key, frames: A.generateFrameNumbers(tex, { frames }), frameRate: rate, repeat: rep }); };
    mk('s-run', 'S_santa', [1, 2, 3, 4, 5, 6], 13); mk('w-walk', 'S_wichtel', [0, 1, 2, 3], 8);
    mk('p-slide', 'S_pinguin', [0, 1], 6); mk('r-walk', 'S_robot', [0, 1], 4); mk('m-throw', 'S_schnee', [0, 1, 2, 0], 8, 0);
    const L = this.cache.json.get(this.levelId); this.L = L;
    const map = L.map; this.map = map; this.cols = map[0].length;
    const WW = this.cols * T;
    this.physics.world.setBounds(0, 0, WW, GH + 300);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.cameras.main.setBounds(0, 0, WW, GH);

    // Hintergrund
    this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDisplaySize(GW, GH).setDepth(-20);
    this.add.image(0, 0, 'stars').setOrigin(0).setScrollFactor(0).setDepth(-19);
    const aur = this.add.image(GW / 2, 110, 'aurora').setScrollFactor(0).setDepth(-18).setAlpha(.5).setScale(1.12);
    this.tweens.add({ targets: aur, alpha: .95, x: GW / 2 + 20, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.mount = this.add.tileSprite(0, GH - 360, GW, 260, 'mountains').setOrigin(0).setScrollFactor(0).setDepth(-17);
    this.theme = L.theme || 'forest';
    const bgKey = ({ ice: 'icebergs', city: 'town', castle: 'castle', workshop: 'shelves' })[this.theme] || 'forest';
    this.forest = this.theme === 'workshop'
      ? this.add.tileSprite(0, 0, GW, GH, bgKey).setOrigin(0).setScrollFactor(0).setDepth(-16)
      : this.add.tileSprite(0, GH - 300, GW, 240, bgKey).setOrigin(0).setScrollFactor(0).setDepth(-16);
    if (this.theme === 'workshop') { aur.setVisible(false); this.mount.setVisible(false); }

    // Gruppen
    this.solids = this.physics.add.staticGroup();
    this.ledges = this.physics.add.staticGroup();
    this.items = this.physics.add.staticGroup();
    this.gates = this.physics.add.staticGroup();
    this.marks = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.icicles = this.physics.add.group({ allowGravity: false });
    this.eballs = this.physics.add.group();
    this.pballs = this.physics.add.group();
    this.floes = this.physics.add.group({ allowGravity: false, immovable: true });
    const ice = this.theme === 'ice', city = this.theme === 'city';
    this.cats = this.physics.add.staticGroup(); this.chimneys = []; this.belts = []; this.crumbles = this.physics.add.staticGroup();

    this.totalGifts = 0; this.gifts = 0; this.gold = 0;
    let start = { x: 2 * T, y: 10 * T };
    const mathOn = Save.data.settings.math !== 'aus';

    for (let y = 0; y < map.length; y++) for (let x = 0; x < this.cols; x++) {
      const ch = map[y][x], cx = x * T + T / 2, cy = y * T + T / 2, bottom = (y + 1) * T;
      switch (ch) {
        case '#': {
          const inner = y > 0 && '#~>'.includes(map[y - 1][x]);
          const th = this.theme;
          const key = city ? (inner ? ((x * 3 + y) % 4 === 0 ? 'wall2' : 'wall') : 'roof')
            : th === 'workshop' ? (inner ? 'plank2' : 'plank') : th === 'castle' ? (inner ? 'stone2' : 'stone') : (inner ? 'dirt' : 'snowtop');
          const t = this.solids.create(cx, cy, key); if (ice) t.setTint(0xd2e6ff); break; }
        case 'K': {
          this.solids.create(cx, cy, 'chimney');
          const em = this.add.particles(cx, y * T + 2, 'puff', { speedY: { min: -260, max: -180 }, speedX: { min: -18, max: 18 }, lifespan: 900,
            scale: { start: .5, end: 1.6 }, alpha: { start: .75, end: 0 }, tint: 0xa9b2c4, frequency: 45, emitting: false }).setDepth(4);
          const wisp = this.add.particles(cx, y * T + 2, 'puff', { speedY: { min: -40, max: -25 }, lifespan: 1400, scale: { start: .2, end: .6 }, alpha: { start: .4, end: 0 }, tint: 0xa9b2c4, frequency: 260 }).setDepth(4);
          this.chimneys.push({ x: cx, top: y * T, phase: (x * 977) % 2800, em, on: false, wisp });
          break; }
        case ')': case '(': { const b = this.solids.create(cx, cy, 'belt1'); b.setFlipX(ch === '('); this.belts.push(b); break; }
        case 'X': this.solids.create(cx, cy, 'box' + (1 + (x + y) % 3)); break;
        case 'r': { const e = this.enemies.create(cx, bottom - 22, 'S_robot', 0).setScale(.5); e.setData('k', 'r'); e.dir = -1; e.body.setSize(54, 66).setOffset(9, 14); e.setDepth(3); e.play('r-walk'); break; }
        case 'b': { const c = this.crumbles.create(cx, y * T + 10, 'crumble'); c.body.checkCollision.down = false; c.body.checkCollision.left = false; c.body.checkCollision.right = false; c.setDepth(7); break; }
        case 'Q': this.makeKing(cx, bottom); break;
        case 'k': { const c = this.cats.create(cx, bottom - 13, 'cat'); c.setDepth(2); c.body.setSize(40, 22).setOffset(2, 4); break; }
        case 'D': this.addItem(cx, cy, 'rudolph', 'fly').setScale(.8); break;
        case '~': this.solids.create(cx, cy, 'ice'); break;
        case '>': this.solids.create(cx, cy, 'slide'); break;
        case 'W': case 'o': {
          const topW = y === 0 || !'Wo'.includes(map[y - 1][x]);
          this.add.image(cx, cy, topW ? 'water_top' : 'water').setDepth(6).setAlpha(.92);
          if (ch === 'o') {
            let a = x, b = x; while (a > 0 && 'Wo'.includes(map[y][a - 1])) a--; while (b < this.cols - 1 && 'Wo'.includes(map[y][b + 1])) b++;
            const f = this.floes.create(x * T + T, y * T + 8, 'floe'); f.setDepth(2);
            f.body.setSize(96, 14).setOffset(0, 0); f.minX = a * T + T; f.maxX = (b + 1) * T - T; f.setVelocityX(55);
            this.tweens.add({ targets: f, angle: { from: -1.5, to: 1.5 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          }
          break; }
        case 'p': { const e = this.enemies.create(cx, bottom - 26, 'S_pinguin', 0).setScale(.5); e.setData('k', 'p'); e.dir = -1; e.body.setSize(72, 40).setOffset(12, 62); e.setDepth(3); e.play('p-slide'); break; }
        case '=': { const p = this.ledges.create(cx, y * T + 10, 'ledge'); p.body.checkCollision.down = false; p.body.checkCollision.left = false; p.body.checkCollision.right = false; break; }
        case 'g': this.addItem(cx, cy, Phaser.Utils.Array.GetRandom(['gift', 'gift2', 'gift3']), 'gift'); this.totalGifts++; break;
        case 'G': this.addItem(cx, cy, 'giftgold', 'gold'); this.totalGifts++; break;
        case 'L': this.addItem(cx, cy, 'lebkuchen', 'life'); break;
        case 'B': this.addItem(cx, cy, 'bell', 'bell'); break;
        case 'S': this.addItem(cx, cy, 'snowpow', 'snow'); break;
        case 'w': { const e = this.enemies.create(cx, bottom - 20, 'S_wichtel', 0).setScale(.5); e.setData('k', 'w'); e.dir = -1; e.body.setSize(52, 60).setOffset(10, 17); e.setDepth(3); e.play({ key: 'w-walk', startFrame: x % 4 }); break; }
        case 'm': { const e = this.enemies.create(cx, bottom - 30, 'S_schnee', 0).setScale(.5); e.setData('k', 's'); e.nextThrow = 0; e.body.setSize(60, 96).setOffset(21, 20); e.setDepth(3); break; }
        case 'i': { const ic = this.icicles.create(cx, y * T + 20, 'icicle'); ic.state = 'hang'; ic.body.setSize(14, 34).setOffset(3, 2); ic.setDepth(2); break; }
        case 'P': start = { x: cx, y: bottom - 26 }; break;
        case 'C': { const c = this.marks.create(cx, bottom - 40, 'cane'); c.setData('k', 'check'); c.setTint(0x8a9ab8); c.setDepth(1); break; }
        case 'F': { const f = this.marks.create(cx + 30, bottom - 42, 'sleigh'); f.setData('k', 'goal'); f.body.setSize(90, 60).setOffset(20, 20); f.setDepth(1); this.sleigh = f; break; }
        case 'R': if (mathOn) { const g = this.gates.create(cx, bottom - 48, 'gate'); g.setDepth(2); g.label = this.add.text(cx, bottom - 54, '?', { fontFamily: 'Fredoka, sans-serif', fontSize: '28px', color: '#d7192a', fontStyle: '700' }).setOrigin(.5).setDepth(2); } break;
        case 'T': this.add.image(cx, bottom + 2, ice ? 'crystal' : city ? 'xtree' : 'tree').setOrigin(.5, 1).setDepth(-1).setScale(.85 + ((x * 7) % 5) / 10); break;
      }
    }

    // Hinweis-Schilder
    const touch = window.RDG_isTouch;
    (L.hints || []).forEach(h => this.add.text(h.x * T, h.y * T, touch ? h.t : h.k, {
      fontFamily: 'Fredoka, sans-serif', fontSize: '20px', color: '#ffffff', align: 'center',
      backgroundColor: 'rgba(8,20,48,0.72)', padding: { x: 12, y: 8 }
    }).setOrigin(.5).setDepth(1));

    // Spielfigur
    const p = this.physics.add.sprite(start.x, start.y, 'S_santa', 0).setScale(.5).setDepth(5);
    p.body.setSize(48, 88).setOffset(21, 8);
    p.setCollideWorldBounds(true); p.setMaxVelocity(240, 950);
    this.player = p; this.respawn = { ...start };

    // Zusammenstöße
    const ph = this.physics;
    ph.add.collider(p, this.solids); ph.add.collider(p, this.ledges); ph.add.collider(p, this.floes);
    ph.add.collider(p, this.cats, (pl, c) => this.wakeCat(c)); ph.add.collider(this.enemies, this.cats);
    ph.add.collider(p, this.crumbles, (pl, c) => this.crumble(c)); ph.add.collider(this.enemies, this.crumbles);
    if (this.king) {
      ph.add.collider(this.king, this.solids); ph.add.overlap(p, this.king, () => this.touchKing());
      ph.add.overlap(this.pballs, this.king, b => { this.sparkle(b.x, b.y); b.destroy(); });
    }
    ph.add.collider(this.enemies, this.solids); ph.add.collider(this.enemies, this.ledges);
    ph.add.collider(p, this.gates, (pl, g) => this.hitGate(g));
    ph.add.overlap(p, this.items, (pl, it) => this.collect(it));
    ph.add.overlap(p, this.marks, (pl, m) => this.touchMark(m));
    ph.add.overlap(p, this.enemies, (pl, e) => this.touchEnemy(e));
    ph.add.overlap(p, this.eballs, (pl, b) => { b.destroy(); this.hurt(); });
    ph.add.overlap(p, this.icicles, (pl, ic) => { if (ic.state === 'fall') { this.shatter(ic); this.hurt(); } });
    ph.add.collider(this.icicles, this.solids, ic => this.shatter(ic), ic => ic.state === 'fall');
    ph.add.collider(this.pballs, this.solids, b => this.poof(b.x, b.y, 4) || b.destroy());
    ph.add.collider(this.eballs, this.solids, b => b.destroy());
    ph.add.overlap(this.pballs, this.enemies, (b, e) => { b.destroy(); this.kill(e); });

    // Kamera, Schnee, Eingabe
    this.cameras.main.startFollow(p, true, .12, .12).setFollowOffset(-80, 40);
    if (this.theme !== 'workshop') this.add.particles(0, 0, 'flake', {
      x: { min: 0, max: GW }, y: -10, lifespan: 9000, speedY: { min: 30, max: 80 }, speedX: { min: -25, max: 15 },
      scale: { min: .3, max: 1 }, alpha: { min: .5, max: 1 }, frequency: 70, advance: 8000
    }).setScrollFactor(0).setDepth(50);
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,X,SHIFT,A,D,W,S');
    this.prev = {};

    // Zustand
    this.lives = L.lives || 3; this.sliding = false; this.flyUntil = 0; this.flying = false; this.nextBoost = 0; this.hitTaken = false; this.hasSnow = false; this.done = false; this.quizOpen = false;
    this.elapsed = 0; this.invulnUntil = 0; this.bellUntil = 0; this.nextTing = 0; this.nextThrow = 0;
    this.jumpBuf = -1e9; this.lastGround = -1e9;
    this.makeHud();

    const banner = this.add.text(GW / 2, GH / 2 - 60, `${lvLabel(L.id)}  ${L.name}`, {
      fontFamily: 'Fredoka, sans-serif', fontSize: '44px', color: '#ffffff', fontStyle: '700', stroke: '#0b1d3a', strokeThickness: 8
    }).setOrigin(.5).setScrollFactor(0).setDepth(120);
    this.tweens.add({ targets: banner, alpha: 0, delay: 1600, duration: 700, onComplete: () => banner.destroy() });
  }

  addItem(x, y, key, type) {
    const IF = { gift: 0, gift2: 1, gift3: 2, giftgold: 3, lebkuchen: 4, bell: 5, snowpow: 6 };
    const it = key in IF ? this.items.create(x, y, 'S_items', IF[key]).setScale(.5).refreshBody() : this.items.create(x, y, key); it.setData('t', type); it.setDepth(2);
    this.tweens.add({ targets: it, y: y - 5, duration: 700 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return it;
  }

  makeHud() {
    const st = { fontFamily: 'Fredoka, sans-serif', fontSize: '24px', color: '#ffffff', fontStyle: '600' };
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    const bg = this.add.graphics(); bg.fillStyle(0x081430, .6); bg.fillRoundedRect(12, 12, 500, 48, 16);
    c.add(bg);
    c.add(this.add.image(38, 36, 'S_items', 0).setScale(.5));
    this.tGifts = this.add.text(56, 21, '', st); c.add(this.tGifts);
    this.goldIcons = [0, 1, 2].map(i => { const im = this.add.image(170 + i * 30, 36, 'S_items', 3).setScale(.42).setAlpha(.25); c.add(im); return im; });
    c.add(this.add.image(278, 37, 'S_items', 4).setScale(.45));
    this.tLives = this.add.text(296, 21, '', st); c.add(this.tLives);
    this.tTime = this.add.text(350, 21, '', st); c.add(this.tTime);
    this.snowIcon = this.add.image(480, 36, 'S_items', 6).setScale(.5).setVisible(false); c.add(this.snowIcon);
    this.updHud();
  }
  updHud() {
    this.tGifts.setText(`${this.gifts}/${this.totalGifts}`);
    this.tLives.setText(`×${this.lives}`);
    const s = Math.floor(this.elapsed / 1000); this.tTime.setText(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
  }

  solidAt(tx, ty) { const r = this.map[ty]; return !!r && r[tx] !== undefined && '#=~>)(Xb'.includes(r[tx]); }
  charAt(tx, ty) { const r = this.map[ty]; return r ? r[tx] : undefined; }

  ctrl() {
    const k = this.keys;
    const c = {
      left: k.LEFT.isDown || k.A.isDown || Touch.left,
      right: k.RIGHT.isDown || k.D.isDown || Touch.right,
      jump: k.UP.isDown || k.SPACE.isDown || k.W.isDown || Touch.jump,
      thr: k.X.isDown || k.SHIFT.isDown || Touch.throw,
      down: k.DOWN.isDown || k.S.isDown
    };
    c.jumpP = c.jump && !this.prev.jump; c.thrP = c.thr && !this.prev.thr;
    this.prev = c; return c;
  }

  update(time, delta) {
    const cam = this.cameras.main;
    this.mount.tilePositionX = cam.scrollX * .15;
    this.forest.tilePositionX = cam.scrollX * .4;
    if (this.done || this.quizOpen) return;
    this.elapsed += delta;
    if (Math.floor(this.elapsed / 1000) !== this._lastSec) { this._lastSec = Math.floor(this.elapsed / 1000); this.updHud(); }

    const p = this.player, c = this.ctrl();

    // Schornsteine
    for (const ch of this.chimneys) {
      const vis = Math.abs(ch.x - cam.scrollX - GW / 2) < GW;
      const on = ((time + ch.phase) % 2800) < 1200;
      if (on !== ch.on) { ch.on = on; if (on && vis) ch.em.start(); else ch.em.stop(); }
      if (on && !this.flying && Math.abs(p.x - ch.x) < 28 && p.body.bottom <= ch.top + 6 && p.body.bottom > ch.top - T * 4 && time > this.nextBoost) {
        p.setVelocityY(-830); this.nextBoost = time + 350; this.boostUntil = time + 700; this.jumpBuf = -1e9; Sfx.tone(260, .35, 'sine', .07, 0, 620);
      }
    }

    // Rudolph-Flug
    if (this.flying) {
      const tx = Math.floor(p.x / T);
      let ground = false; for (let ty = Math.floor(p.y / T); ty < 13; ty++) if (this.solidAt(tx, ty) || this.solidAt(tx + 1, ty)) { ground = true; break; }
      if ((time > this.flyUntil || (this.L.flyEnd && p.x > this.L.flyEnd * T)) && ground && (!this.L.flyEnd || p.x > this.L.flyEnd * T)) {
        this.flying = false; p.body.setAllowGravity(true); p.setMaxVelocity(240, 950);
        const r = this.rudolph; this.tweens.add({ targets: r, x: r.x + 500, y: r.y - 400, duration: 1200, onComplete: () => r.destroy() });
      } else {
        p.setAccelerationX(0); p.setVelocityX(290); p.flipX = false;
        let vy = c.jump ? (p.y < 70 ? 0 : -230) : c.down ? 230 : 15;
        if (!ground && p.y > 9 * T && vy > -120) vy = -120;
        p.setVelocityY(vy);
        p.anims.stop(); p.setFrame(7);
        this.rudolph.setPosition(p.x + 56, p.y - 6 + Math.sin(time / 120) * 3);
        if (time > this.nextTing) { this.nextTing = time + 380; Sfx.ting(); }
        this.afterMove(time, c, true);
        return;
      }
    }
    const onGround = p.body.blocked.down || p.body.touching.down;
    if (onGround) this.lastGround = time;
    if (c.jumpP) this.jumpBuf = time;

    const under = onGround ? this.charAt(Math.floor(p.x / T), Math.floor((p.body.bottom + 2) / T)) : null;
    if (under === '>') this.sliding = true;
    else if (onGround) this.sliding = false;
    const onIce = under === '~';
    if (this.sliding) {
      p.setMaxVelocity(440, 950); p.setAccelerationX(0); p.setDragX(0); p.flipX = false;
      if (under === '>') p.setVelocityX(Math.max(p.body.velocity.x, 430));
    } else {
      p.setMaxVelocity(240, 950);
      p.setDragX(onIce ? 90 : onGround ? 1500 : 250);
      const acc = onIce ? 500 : onGround ? 1500 : 1000;
      if (c.left && !c.right) { p.setAccelerationX(-acc); p.flipX = true; }
      else if (c.right && !c.left) { p.setAccelerationX(acc); p.flipX = false; }
      else p.setAccelerationX(0);
    }

    if (under === ')' || under === '(') p.x += (under === ')' ? 1 : -1) * delta * .11;
    if (this.belts.length && time > (this.nextBelt || 0)) {
      this.nextBelt = time + 110; this.beltF = !this.beltF;
      for (const b of this.belts) b.setTexture(this.beltF ? 'belt2' : 'belt1');
    }

    if (time - this.jumpBuf < 130 && time - this.lastGround < 110) {
      p.setVelocityY(-695); this.jumpBuf = -1e9; this.lastGround = -1e9; Sfx.jump();
    }
    if (!c.jump && p.body.velocity.y < -230 && !(this.boostUntil > time)) p.setVelocityY(-230);

    if (this.hasSnow && c.thrP && time > this.nextThrow) {
      this.nextThrow = time + 300;
      const dir = p.flipX ? -1 : 1;
      const b = this.pballs.create(p.x + dir * 20, p.y - 6, 'snowball');
      b.setVelocity(dir * 520, -140); b.body.setGravityY(-850); b.lifeEnd = time + 1400; b.setDepth(4);
      Sfx.throw();
    }

    // Aussehen
    const hurtPose = this.invulnUntil - time > 1300;
    if (onGround && !this.wasGround && this.airVy > 320) { this.dust(p.x, p.body.bottom, 6); this.landUntil = time + 110; }
    this.wasGround = onGround; this.airVy = onGround ? 0 : Math.max(this.airVy || 0, p.body.velocity.y);
    const fr = f => { p.anims.stop(); if (p.frame.name !== f) p.setFrame(f); };
    if (this.sliding) fr(11);
    else if (hurtPose) fr(10);
    else if (!onGround) fr(p.body.velocity.y < 0 ? 7 : 8);
    else if (this.landUntil > time) fr(9);
    else if (Math.abs(p.body.velocity.x) > 25) {
      if (!p.anims.isPlaying) p.play('s-run');
      if (time > (this.nextKick || 0)) { this.nextKick = time + 200; this.dust(p.x - (p.flipX ? -12 : 12), p.body.bottom, 2); }
    } else fr(0);
    const bell = this.bellUntil > time;
    if (bell) { p.setTint(Math.floor(time / 90) % 2 ? 0xfff3a0 : 0xffffff); if (time > this.nextTing) { this.nextTing = time + 450; Sfx.ting(); } }
    else p.clearTint();
    p.setAlpha(this.invulnUntil > time && !bell ? (Math.floor(time / 80) % 2 ? .35 : 1) : 1);

    this.afterMove(time, c, false);
  }

  afterMove(time, c, flying) {
    const p = this.player, cam = this.cameras.main;
    // Gegner
    const left = cam.scrollX - 150, right = cam.scrollX + GW + 150;
    this.enemies.children.iterate(e => {
      if (!e || !e.active) return;
      if (e.x < left || e.x > right) { e.setVelocityX(0); return; }
      const kind = e.getData('k');
      if (kind === 'w' || kind === 'p' || kind === 'r') {
        const sp = kind === 'p' ? 150 : kind === 'r' ? 85 : 70;
        if (e.body.blocked.left) e.dir = 1; else if (e.body.blocked.right) e.dir = -1;
        else if (e.body.blocked.down) {
          const ax = Math.floor((e.x + e.dir * 18) / T), by = Math.floor((e.body.bottom + 4) / T);
          if (!this.solidAt(ax, by)) e.dir *= -1;
        }
        e.setVelocityX(e.dir * sp); e.flipX = e.dir < 0;

      } else {
        e.setVelocityX(0);
        const dx = p.x - e.x; e.flipX = dx < 0;
        if (Math.abs(dx) < T * 9 && Math.abs(dx) > 30 && Math.abs(p.y - e.y) < T * 4 && time > e.nextThrow) {
          e.nextThrow = time + 2800;
          if (e.nextThrow - 2800 > 0 && e._armed) {
            e.play('m-throw');
            const s = Math.sign(dx), b = this.eballs.create(e.x + s * 22, e.y - 20, 'snowball');
            b.setVelocity(s * 240, -280); b.lifeEnd = time + 4000; b.setDepth(4);
          }
          e._armed = true;
        }
      }
    });

    if (this.king && !this.king.dead) this.updateKing(time);

    // Eisschollen
    this.floes.children.iterate(f => { if (!f) return; if (f.x <= f.minX) f.setVelocityX(55); else if (f.x >= f.maxX) f.setVelocityX(-55); });

    // Eiszapfen
    this.icicles.children.iterate(ic => {
      if (!ic || ic.state !== 'hang') return;
      if (Math.abs(p.x - ic.x) < T * .9 && p.y > ic.y && p.y - ic.y < T * 6) {
        ic.state = 'shake';
        this.tweens.add({ targets: ic, x: ic.x + 3, duration: 50, yoyo: true, repeat: 3, onComplete: () => { ic.state = 'fall'; ic.body.setAllowGravity(true); } });
      }
    });

    // Bälle aufräumen
    [this.pballs, this.eballs].forEach(gr => gr.getChildren().filter(b => time > b.lifeEnd).forEach(b => b.destroy()));

    // In die Tiefe gefallen
    if (p.y > GH + 60) this.fall();
    if (!this.splashed && p.y > GH - 80 && this.charAt(Math.floor(p.x / T), 11) && 'Wo'.includes(this.charAt(Math.floor(p.x / T), 11))) { this.splashed = true; this.poof(p.x, GH - 90, 10); }
  }

  collect(it) {
    if (it.taken) return; it.taken = true;
    const t = it.getData('t');
    if (t === 'gift') { this.gifts++; Sfx.gift(); }
    else if (t === 'gold') { this.gifts++; this.goldIcons[this.gold].setAlpha(1); this.gold++; Sfx.gold(); }
    else if (t === 'life') { this.lives++; Sfx.life(); UI.toast('Lebkuchen: ein Extra-Leben!'); }
    else if (t === 'bell') { this.bellUntil = this.time.now + 8000; Sfx.bell(); UI.toast('Glocke: 8 Sekunden unverwundbar!'); }
    else if (t === 'fly') {
      this.flying = true; this.flyUntil = this.time.now + (this.L.flyTime || 7000); this.sliding = false;
      this.player.body.setAllowGravity(false); this.player.setMaxVelocity(300, 950);
      this.rudolph = this.add.image(it.x, it.y, 'rudolph').setDepth(5);
      Sfx.bell(); UI.toast(window.RDG_isTouch ? 'Rudolph! Sprung-Knopf halten = hoch' : 'Rudolph! Leertaste halten = hoch');
    }
    else if (t === 'snow') { this.hasSnow = true; this.snowIcon.setVisible(true); Sfx.life(); UI.toast(window.RDG_isTouch ? 'Schneebälle! Tipp auf die Schneeflocke' : 'Schneebälle! Werfen mit X'); UI.setThrow(true); }
    this.sparkle(it.x, it.y);
    if (t === 'gift' || t === 'gold') {
      const cam = this.cameras.main, fly = this.add.image(it.x - cam.scrollX, it.y - cam.scrollY, it.texture.key, it.frame.name).setScale(.5).setScrollFactor(0).setDepth(110);
      const tx = t === 'gold' ? 170 + (this.gold - 1) * 30 : 38;
      this.tweens.add({ targets: fly, x: tx, y: 36, scale: .25, duration: 520, ease: 'Cubic.in', onComplete: () => { fly.destroy(); this.tweens.add({ targets: this.tGifts, scale: 1.25, duration: 90, yoyo: true }); } });
    }
    it.destroy(); this.updHud();
  }

  touchMark(m) {
    const k = m.getData('k');
    if (k === 'check' && !m.on) {
      m.on = true; m.clearTint(); this.respawn = { x: m.x, y: m.y };
      const s = this.add.image(m.x + 7, m.y - 50, 'star').setDepth(2);
      this.tweens.add({ targets: s, angle: 360, duration: 3000, repeat: -1 });
      this.sparkle(m.x, m.y - 30); Sfx.gift();
    } else if (k === 'goal' && !this.done) this.finish();
  }

  touchEnemy(e) {
    if (e.dead || this.done) return;
    const p = this.player;
    if (this.bellUntil > this.time.now || this.sliding || this.flying) { this.kill(e); return; }
    if (p.body.velocity.y > 0 && p.body.bottom < e.body.top + 18) {
      this.kill(e); p.setVelocityY(this.prev.jump ? -560 : -380); return;
    }
    this.hurt(e.x);
  }

  crumble(c) {
    if (c.falling || this.player.body.bottom > c.body.top + 6) return;
    c.falling = true; Sfx.tone(180, .3, 'sawtooth', .04, 0, 90);
    this.tweens.add({ targets: c, x: c.x + 2, duration: 45, yoyo: true, repeat: 5, onComplete: () => {
      c.body.enable = false; this.tweens.add({ targets: c, alpha: 0, angle: 12, duration: 250 });
      this.poof(c.x, c.y, 4);
      this.time.delayedCall(3000, () => { c.setAlpha(1).setAngle(0); c.body.enable = true; c.falling = false; });
    } });
  }

  makeKing(x, bottom) {
    const k = this.physics.add.sprite(x, bottom - 60, 'S_wichtel', 0).setScale(1.45).setDepth(4);
    k.body.setSize(52, 60).setOffset(10, 17); k.play('w-walk');
    k.hp = 3; k.dir = -1; k.nextThrow = 2500; k.inv = 0; k.dead = false;
    this.crown = this.add.image(x, 0, 'crown').setDepth(5).setScale(1.2);
    this.king = k;
    this.kingHud = this.add.text(GW / 2, 86, '', { fontFamily: 'Fredoka, sans-serif', fontSize: '26px', color: '#ffe27a', fontStyle: '700', stroke: '#0b1d3a', strokeThickness: 6 })
      .setOrigin(.5).setScrollFactor(0).setDepth(100);
    this.updKingHud();
  }
  updKingHud() { this.kingHud.setText('Wichtelkönig  ' + '♛ '.repeat(this.king.hp).trim() + '  ' + '· '.repeat(3 - this.king.hp).trim()); }
  updateKing(time) {
    const k = this.king, p = this.player, rage = 3 - k.hp;
    if (k.body.blocked.left) k.dir = 1; else if (k.body.blocked.right) k.dir = -1;
    if (time > k.inv) k.setVelocityX(k.dir * (70 + rage * 50));
    else k.setVelocityX(0);
    k.flipX = k.dir < 0;
    k.anims.timeScale = 1 + rage * .5;
    k.setAlpha(time < k.inv ? (Math.floor(time / 90) % 2 ? .4 : 1) : 1);
    if (rage > 0 && k.body.blocked.down && Math.random() < .006 + rage * .004) k.setVelocityY(-560);
    this.crown.setPosition(k.x + (k.flipX ? 4 : -4), k.body.top - 14);
    if (time > k.nextThrow && time > k.inv) {
      k.nextThrow = time + 2400 - rage * 550;
      const n = 1 + rage, s = Math.sign(p.x - k.x) || -1;
      for (let i = 0; i < n; i++) {
        const b = this.eballs.create(k.x + s * 30, k.body.top + 10, 'snowball').setScale(1.4).setDepth(4);
        b.setVelocity(s * (170 + i * 90), -360 - i * 60); b.lifeEnd = time + 4000;
      }
      Sfx.throw();
    }
  }
  touchKing() {
    const k = this.king, p = this.player, now = this.time.now;
    if (k.dead || this.done) return;
    if (p.body.velocity.y > 0 && p.body.bottom < k.body.top + 28) {
      p.setVelocityY(-660); this.boostUntil = now + 500;
      if (now < k.inv) return;
      k.hp--; k.inv = now + 1500; Sfx.stomp(); this.cameras.main.shake(200, .01); this.poof(k.x, k.body.top, 10); this.updKingHud();
      if (k.hp <= 0) this.defeatKing();
      else UI.toast(k.hp === 2 ? 'Treffer! Noch 2-mal!' : 'Super! Noch 1-mal!');
      return;
    }
    if (now < k.inv) return;
    this.hurt(k.x);
  }
  defeatKing() {
    const k = this.king; k.dead = true; k.body.enable = false;
    this.eballs.clear(true, true); Sfx.win();
    this.tweens.add({ targets: [k, this.crown], angle: 720, scale: 0, alpha: 0, duration: 1400, ease: 'Quad.in' });
    this.time.delayedCall(1200, () => this.poof(k.x, k.y, 30));
    for (let i = 0; i < 24; i++) {
      const g = this.add.image(Phaser.Math.Between(60, GW - 60), -40 - Math.random() * 300, 'S_items', Phaser.Math.Between(0, 3)).setScale(.5).setDepth(8).setScrollFactor(0);
      this.tweens.add({ targets: g, y: GH - 120 + Math.random() * 40, angle: Phaser.Math.Between(-30, 30), duration: 1600 + Math.random() * 900, ease: 'Bounce.out' });
    }
    UI.toast('Der Wichtelkönig ist besiegt!');
    this.time.delayedCall(900, () => this.finish());
  }

  wakeCat(c) {
    if (c.awake) return; c.awake = true; c.setTexture('cat_awake');
    Sfx.tone(700, .25, 'triangle', .07, 0, 420); Sfx.tone(900, .2, 'triangle', .05, .22, 600);
    this.time.delayedCall(1600, () => { if (c.active) { c.setTexture('cat'); c.awake = false; } });
  }
  kill(e) { if (e.dead) return; e.dead = true; this.poof(e.x, e.y, 12); Sfx.stomp(); e.destroy(); }
  poof(x, y, n) {
    const em = this.add.particles(x, y, 'puff', { speed: { min: 40, max: 140 }, lifespan: 500, scale: { start: .7, end: 0 }, alpha: { start: 1, end: 0 }, emitting: false }).setDepth(6);
    em.explode(n); this.time.delayedCall(700, () => em.destroy());
  }
  sparkle(x, y) {
    const em = this.add.particles(x, y, 'spark', { speed: { min: 60, max: 160 }, lifespan: 450, scale: { start: 1.2, end: 0 }, emitting: false }).setDepth(6);
    em.explode(10); this.time.delayedCall(600, () => em.destroy());
  }
  dust(x, y, n) {
    const em = this.add.particles(x, y - 4, 'puff', { speed: { min: 20, max: 70 }, angle: { min: 200, max: 340 }, lifespan: 380, scale: { start: .35, end: 0 }, alpha: { start: .8, end: 0 }, emitting: false }).setDepth(4);
    em.explode(n); this.time.delayedCall(500, () => em.destroy());
  }
  shatter(ic) { if (!ic.active) return; this.poof(ic.x, ic.y + 10, 6); ic.destroy(); }

  hurt(fromX) {
    const now = this.time.now;
    if (this.done || this.invulnUntil > now || this.bellUntil > now) return;
    this.lives--; this.hitTaken = true; this.invulnUntil = now + 1800; Sfx.hurt();
    const dir = fromX !== undefined ? Math.sign(this.player.x - fromX) || 1 : (this.player.flipX ? 1 : -1);
    this.player.setVelocity(dir * 240, -360);
    this.cameras.main.shake(150, .006);
    this.updHud();
    if (this.lives <= 0) this.gameOver();
  }
  fall() {
    this.lives--; this.hitTaken = true; Sfx.hurt(); this.updHud();
    if (this.lives <= 0) { this.gameOver(); return; }
    this.player.body.reset(this.respawn.x, this.respawn.y - 10); this.player.setAcceleration(0, 0); this.splashed = false; this.sliding = false;
    this.invulnUntil = this.time.now + 1800;
  }

  hitGate(g) {
    if (this.quizOpen || this.done) return;
    this.quizOpen = true; this.physics.pause();
    Object.keys(Touch).forEach(k => Touch[k] = false);
    UI.quiz(makeTask(Save.data.settings.math), () => {
      this.quizOpen = false; this.physics.resume(); this.input.keyboard.resetKeys();
      this.poof(g.x, g.y, 16); Sfx.gate(); g.label.destroy(); g.destroy();
    });
  }

  gameOver() {
    this.done = true; this.physics.pause();
    this.time.delayedCall(500, () => UI.gameOver(this.levelId));
  }

  finish() {
    this.done = true; const p = this.player, s = this.sleigh;
    if (!this.L.boss) { p.body.enable = false; p.anims.stop(); p.setFrame(7); } p.clearTint().setAlpha(1);
    Sfx.win();
    const secs = Math.round(this.elapsed / 1000), L = this.L;
    const stars = [this.gifts === this.totalGifts, !this.hitTaken, secs <= L.par];
    const rec = Save.data.levels[L.id] || { stars: [false, false, false], best: null, done: false };
    rec.stars = rec.stars.map((v, i) => v || stars[i]);
    rec.best = rec.best === null ? secs : Math.min(rec.best, secs);
    rec.gifts = Math.max(rec.gifts || 0, this.gifts); rec.done = true;
    Save.data.levels[L.id] = rec; Save.write();
    if (L.boss) { this.time.delayedCall(2600, () => UI.ending()); return; }
    this.tweens.add({ targets: p, x: s.x - 5, y: s.y - 30, duration: 500, ease: 'Quad.out', onComplete: () => {
      this.tweens.add({ targets: [p, s], x: '+=700', y: '-=420', duration: 1600, ease: 'Quad.in' });
      this.time.delayedCall(1300, () => UI.finish({ id: L.id, next: L.next, gifts: this.gifts, total: this.totalGifts, gold: this.gold, hit: this.hitTaken, secs, par: L.par, stars, best: rec.best }));
    } });
  }
}

const lvLabel = id => id === 'w5-boss' ? 'Finale' : id.startsWith('i-') ? 'Intro ' + id.slice(2) : id.startsWith('b-') ? 'Bonus ' + id.slice(2) : id.slice(1).replace('-', '–');
window.RDG = { T, GW, GH, Save, Sfx, Touch, GameScene, makeTask, lvLabel };
})();
