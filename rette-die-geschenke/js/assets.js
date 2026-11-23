// Alle Grafiken werden hier gezeichnet (keine Bilddateien nötig).
// Für Godot/Unity können sie später als PNG exportiert werden.
window.makeTextures = function (s) {
  if (s.textures.exists('santa')) return;
  const tex = (key, w, h, fn) => {
    const g = s.make.graphics({ x: 0, y: 0, add: false });
    fn(g, w, h); g.generateTexture(key, w, h); g.destroy();
  };
  const RED = 0xd7192a, GOLD = 0xf3c03a, WHITE = 0xffffff, SKIN = 0xf6c6a0;

  // ---------- Weihnachtsmann ----------
  const santa = (g, leg, jump) => {
    g.fillStyle(0x1b1b1b);
    if (jump) { g.fillRect(9, 41, 9, 8); g.fillRect(22, 39, 9, 8); }
    else if (leg) { g.fillRect(7, 43, 10, 9); g.fillRect(23, 41, 10, 9); }
    else { g.fillRect(10, 43, 9, 9); g.fillRect(21, 43, 9, 9); }
    g.fillStyle(0xa80f1c); g.fillRect(11, 36, 8, 8); g.fillRect(21, 36, 8, 8);
    g.fillStyle(RED);
    if (jump) { g.fillRoundedRect(1, 12, 7, 14, 3); g.fillRoundedRect(32, 12, 7, 14, 3); }
    else { g.fillRoundedRect(2, 22, 7, 13, 3); g.fillRoundedRect(31, 22, 7, 13, 3); }
    g.fillRoundedRect(6, 20, 28, 20, 8);
    g.fillStyle(WHITE); g.fillRoundedRect(6, 36, 28, 5, 2); g.fillRect(18, 21, 4, 16);
    g.fillStyle(0x222222); g.fillRect(6, 29, 28, 4);
    g.fillStyle(GOLD); g.fillRect(17, 28, 6, 6); g.fillStyle(0x222222); g.fillRect(19, 30, 2, 2);
    g.fillStyle(0x2b2b2b);
    if (jump) { g.fillCircle(4.5, 12, 3.5); g.fillCircle(35.5, 12, 3.5); }
    else { g.fillCircle(5.5, 35, 3.5); g.fillCircle(34.5, 35, 3.5); }
    g.fillStyle(SKIN); g.fillCircle(20, 15, 8);
    g.fillStyle(WHITE); g.fillCircle(20, 22, 8); g.fillCircle(14, 19, 4.5); g.fillCircle(26, 19, 4.5);
    g.fillCircle(17, 17.5, 3); g.fillCircle(23, 17.5, 3);
    g.fillStyle(0xea8b7f); g.fillCircle(20, 15.5, 2.3);
    g.fillStyle(0x222222); g.fillCircle(16.5, 12.5, 1.4); g.fillCircle(23.5, 12.5, 1.4);
    g.fillStyle(RED); g.fillTriangle(11, 9, 30, 9, 4, 1);
    g.fillStyle(WHITE); g.fillRoundedRect(10, 6, 21, 5, 2); g.fillCircle(4, 2.5, 3.5);
  };
  tex('santa', 40, 52, g => santa(g, 0, 0));
  tex('santa2', 40, 52, g => santa(g, 1, 0));
  tex('santa_jump', 40, 52, g => santa(g, 0, 1));

  // ---------- Boden ----------
  tex('dirt', 48, 48, g => {
    g.fillStyle(0x34456a); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x2a3858); [[8, 10, 5], [30, 22, 6], [16, 36, 4], [40, 40, 3]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.fillStyle(0x41557f); [[22, 8, 3], [38, 10, 2], [6, 28, 2]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
  });
  tex('snowtop', 48, 48, g => {
    g.fillStyle(0x34456a); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x2a3858); g.fillCircle(30, 30, 6); g.fillCircle(10, 40, 4);
    g.fillStyle(0xcfe0f5); g.fillRect(0, 0, 48, 16);
    [4, 14, 24, 34, 44].forEach(x => g.fillCircle(x, 16, 5));
    g.fillStyle(0xf6faff); g.fillRect(0, 0, 48, 12);
    [6, 18, 30, 42].forEach(x => g.fillCircle(x, 12, 4));
  });
  tex('ledge', 48, 20, g => {
    g.fillStyle(0x6e4527); g.fillRoundedRect(0, 6, 48, 14, 6);
    g.lineStyle(1.5, 0x55341c); g.lineBetween(6, 13, 20, 13); g.lineBetween(26, 16, 42, 16);
    g.fillStyle(0xf6faff); g.fillRoundedRect(0, 0, 48, 9, 4); g.fillCircle(10, 9, 3); g.fillCircle(34, 9, 2.5);
  });

  // ---------- Sammelsachen ----------
  const gift = (box, rib) => (g) => {
    g.fillStyle(0x000000, .18); g.fillRoundedRect(4, 10, 24, 20, 3);
    g.fillStyle(box); g.fillRoundedRect(3, 8, 24, 20, 3);
    g.fillStyle(rib); g.fillRect(13, 8, 4, 20); g.fillRect(3, 16, 24, 4);
    g.lineStyle(3, rib); g.strokeCircle(11, 5, 3.5); g.strokeCircle(19, 5, 3.5);
    g.fillStyle(0xffffff, .35); g.fillRect(5, 10, 6, 3);
  };
  tex('gift', 30, 30, gift(RED, GOLD));
  tex('gift2', 30, 30, gift(0x2e9e5b, 0xffffff));
  tex('gift3', 30, 30, gift(0x2b63d6, GOLD));
  tex('giftgold', 30, 30, g => {
    gift(0xf5c542, RED)(g);
    g.fillStyle(WHITE); g.fillTriangle(25, 0, 27, 4, 29, 0); g.fillTriangle(27, -2, 25, 2, 29, 2);
  });
  tex('lebkuchen', 30, 28, g => {
    g.fillStyle(0x9a5a26); g.fillCircle(9, 10, 8); g.fillCircle(21, 10, 8); g.fillTriangle(1.5, 13, 28.5, 13, 15, 27);
    g.lineStyle(2, WHITE);
    g.beginPath(); g.moveTo(6, 9); g.lineTo(10, 13); g.lineTo(14, 9); g.lineTo(18, 13); g.lineTo(22, 9); g.lineTo(25, 12); g.strokePath();
    g.fillStyle(RED); g.fillCircle(15, 18, 2.5);
  });
  tex('bell', 30, 32, g => {
    g.fillStyle(0xc8961e); g.fillCircle(15, 27, 3.5);
    g.fillStyle(GOLD); g.fillRoundedRect(7, 6, 16, 18, { tl: 8, tr: 8, bl: 0, br: 0 }); g.fillRoundedRect(4, 20, 22, 6, 3);
    g.fillStyle(0xffffff, .5); g.fillRect(10, 9, 3, 10);
    g.fillStyle(RED); g.fillCircle(11, 4, 3.5); g.fillCircle(19, 4, 3.5); g.fillCircle(15, 5, 2.5);
  });
  tex('snowpow', 32, 32, g => {
    g.fillStyle(0x9fd8ff, .3); g.fillCircle(16, 16, 15);
    g.fillStyle(0xbcd6f2); g.fillCircle(17, 17, 9); g.fillStyle(WHITE); g.fillCircle(15.5, 15.5, 8);
  });
  tex('snowball', 16, 16, g => { g.fillStyle(0xbcd6f2); g.fillCircle(8.5, 8.5, 6.5); g.fillStyle(WHITE); g.fillCircle(7.5, 7.5, 5.5); });

  // ---------- Gegner ----------
  const wichtel = (g, leg) => {
    g.fillStyle(0x5a3a22);
    if (leg) { g.fillRect(7, 33, 9, 6); g.fillRect(21, 33, 9, 6); } else { g.fillRect(9, 33, 8, 6); g.fillRect(19, 33, 8, 6); }
    g.fillStyle(0x2a8f5e); g.fillRoundedRect(7, 19, 22, 16, 6);
    g.fillStyle(0x1b1b1b); g.fillRect(7, 27, 22, 3);
    g.fillStyle(SKIN); g.fillCircle(11, 17, 2.5); g.fillCircle(25, 17, 2.5); g.fillCircle(18, 17, 7);
    g.fillStyle(0xf28f8f); g.fillCircle(13.5, 19.5, 1.8); g.fillCircle(22.5, 19.5, 1.8);
    g.fillStyle(WHITE); g.fillCircle(15.5, 15.5, 2.3); g.fillCircle(20.5, 15.5, 2.3);
    g.fillStyle(0x222222); g.fillCircle(16.2, 16, 1.1); g.fillCircle(21.2, 16, 1.1);
    g.lineStyle(1.6, 0x3a2a1a); g.lineBetween(13, 12.5, 17, 13.8); g.lineBetween(23, 12.5, 19, 13.8);
    g.lineStyle(1.5, 0x7a2a2a); g.beginPath(); g.arc(18, 18.5, 3.2, 0.3, Math.PI - 0.3); g.strokePath();
    g.fillStyle(0x2b63d6); g.fillTriangle(8, 12, 28, 12, 27, 0);
    g.fillStyle(WHITE); g.fillRoundedRect(8, 9.5, 20, 4, 2); g.fillCircle(27, 2, 3);
  };
  tex('wichtel', 36, 40, g => wichtel(g, 0));
  tex('wichtel2', 36, 40, g => wichtel(g, 1));
  tex('schneemann', 48, 64, g => {
    g.lineStyle(3, 0x6b4423); g.lineBetween(10, 38, 1, 27); g.lineBetween(38, 38, 47, 27);
    g.fillStyle(0xcfdff5); g.fillCircle(24, 47, 16); g.fillStyle(WHITE); g.fillCircle(22.5, 45.5, 14.5);
    g.fillStyle(0xcfdff5); g.fillCircle(24, 23, 11); g.fillStyle(WHITE); g.fillCircle(22.8, 21.8, 10);
    g.fillStyle(RED); g.fillRoundedRect(13, 30, 22, 5, 2); g.fillRect(27, 32, 5, 11);
    g.fillStyle(0x222222); g.fillCircle(20, 19, 1.7); g.fillCircle(27, 19, 1.7);
    [40, 46, 52].forEach(y => g.fillCircle(24, y, 1.7));
    g.fillCircle(19, 26, 1); g.fillCircle(22, 27, 1); g.fillCircle(25, 27, 1);
    g.fillStyle(0xf08a24); g.fillTriangle(23, 21, 23, 24.5, 33, 23);
    g.fillStyle(0x1b1b1b); g.fillRect(12, 10, 24, 3); g.fillRect(16, 0, 16, 11);
    g.fillStyle(RED); g.fillRect(16, 7, 16, 2);
  });
  tex('icicle', 20, 40, g => {
    g.fillStyle(0xa9dcff); g.fillTriangle(0, 0, 20, 0, 10, 40);
    g.fillStyle(WHITE, .8); g.fillTriangle(4, 0, 9, 0, 9, 26);
  });

  // ---------- Level-Objekte ----------
  tex('gate', 48, 96, g => {
    g.fillStyle(0x6b4423); g.fillRect(0, 0, 8, 96); g.fillRect(40, 0, 8, 96);
    g.fillStyle(0x9a6a3e); for (let i = 0; i < 5; i++) g.fillRect(8, 6 + i * 18, 32, 14);
    g.lineStyle(4, 0x6b4423); g.lineBetween(8, 8, 40, 90);
    g.fillStyle(0xf6faff); g.fillRoundedRect(0, 0, 48, 7, 3);
    g.fillStyle(WHITE); g.fillRoundedRect(8, 26, 32, 32, 7);
    g.lineStyle(3, RED); g.strokeRoundedRect(8, 26, 32, 32, 7);
  });
  tex('cane', 28, 80, g => {
    g.lineStyle(6, WHITE); g.lineBetween(8, 14, 8, 80);
    g.beginPath(); g.arc(15, 14, 7, Math.PI, 0, false); g.strokePath(); g.lineBetween(22, 14, 22, 21);
    g.fillStyle(RED); for (let y = 18; y < 80; y += 10) g.fillRect(5, y, 6, 4);
  });
  tex('star', 18, 18, g => {
    const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.8 : 9, a = -Math.PI / 2 + i * Math.PI / 5; pts.push({ x: 9 + r * Math.cos(a), y: 9 + r * Math.sin(a) }); }
    g.fillStyle(GOLD); g.fillPoints(pts, true);
  });
  tex('sleigh', 130, 84, g => {
    g.fillStyle(0x2e9e5b); g.fillRect(44, 8, 18, 18); g.fillStyle(GOLD); g.fillRect(51, 8, 4, 18);
    g.fillStyle(0x2b63d6); g.fillRect(64, 2, 20, 20); g.fillStyle(WHITE); g.fillRect(72, 2, 4, 20);
    g.fillStyle(0x8a5a33); g.fillCircle(62, 34, 20);
    g.lineStyle(5, GOLD); g.lineBetween(8, 79, 108, 79); g.lineBetween(30, 79, 30, 66); g.lineBetween(88, 79, 88, 66);
    g.beginPath(); g.arc(108, 67, 12, Math.PI / 2, -Math.PI / 2, true); g.strokePath();
    g.fillStyle(0xc8102e); g.fillRoundedRect(10, 26, 26, 42, 10); g.fillRoundedRect(14, 42, 96, 26, 13); g.fillCircle(110, 44, 9);
    g.lineStyle(3, GOLD); g.strokeRoundedRect(14, 42, 96, 26, 13);
  });
  tex('tree', 96, 150, g => {
    g.fillStyle(0x4a3020); g.fillRect(42, 128, 12, 22);
    const tiers = [[0, 60, 38], [28, 100, 44], [62, 136, 48]];
    tiers.forEach(([top, bot, hw]) => { g.fillStyle(0x1d5a40); g.fillTriangle(48, top, 48 - hw, bot, 48 + hw, bot); });
    tiers.forEach(([top, bot, hw]) => {
      g.fillStyle(0xf4f8ff); for (let x = 48 - hw + 6; x < 48 + hw; x += 11) g.fillCircle(x, bot - 2, 4.5);
    });
    g.fillStyle(0xf4f8ff); g.fillTriangle(48, 0, 39, 18, 57, 18);
  });
  // ---------- Welt 2: Eisberge ----------
  tex('santa_sled', 40, 52, g => {
    g.lineStyle(3, GOLD); g.lineBetween(2, 50, 33, 50); g.beginPath(); g.arc(33, 45, 5, Math.PI / 2, -Math.PI / 2, true); g.strokePath();
    g.lineBetween(9, 50, 9, 46); g.lineBetween(27, 50, 27, 46);
    g.fillStyle(0xa80f1c); g.fillRoundedRect(3, 39, 32, 8, 3);
    g.fillStyle(RED); g.fillRoundedRect(22, 34, 12, 7, 3); g.fillStyle(0x1b1b1b); g.fillRect(32, 31, 6, 9);
    g.fillStyle(RED); g.fillRoundedRect(8, 22, 22, 18, 8);
    g.fillStyle(WHITE); g.fillRect(17, 23, 4, 15); g.fillStyle(0x222222); g.fillRect(8, 31, 22, 3);
    g.fillStyle(RED); g.fillRoundedRect(22, 25, 11, 6, 3); g.fillStyle(0x2b2b2b); g.fillCircle(34, 28, 3.2);
    g.fillStyle(SKIN); g.fillCircle(19, 14, 7.5);
    g.fillStyle(WHITE); g.fillCircle(19, 20, 7.5); g.fillCircle(14, 17.5, 4); g.fillCircle(24, 17.5, 4);
    g.fillStyle(0xea8b7f); g.fillCircle(20, 14.5, 2.2);
    g.fillStyle(0x222222); g.fillCircle(16, 11.5, 1.3); g.fillCircle(22.5, 11.5, 1.3);
    g.fillStyle(RED); g.fillTriangle(10, 8, 28, 8, 1, 3);
    g.fillStyle(WHITE); g.fillRoundedRect(9, 5, 20, 5, 2); g.fillCircle(2, 3, 3.5);
  });
  tex('ice', 48, 48, g => {
    g.fillStyle(0x6fb6e8); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x8fd0f7); g.fillRect(0, 0, 48, 10);
    g.fillStyle(0xe6f7ff, .9); g.fillRect(0, 0, 48, 4);
    g.lineStyle(2, 0xffffff, .55); g.lineBetween(8, 18, 18, 8); g.lineBetween(28, 30, 40, 18); g.lineBetween(12, 40, 18, 34);
    g.fillStyle(0x4b8fc4); g.fillRect(0, 44, 48, 4);
  });
  tex('slide', 48, 48, g => {
    g.fillStyle(0x34456a); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x9fd8ff); g.fillRect(0, 0, 48, 14);
    g.fillStyle(0xe6f7ff); g.fillRect(0, 0, 48, 5);
    g.lineStyle(3, 0x2b63d6); g.beginPath(); g.moveTo(14, 6); g.lineTo(22, 10); g.lineTo(14, 14); g.strokePath();
    g.beginPath(); g.moveTo(28, 6); g.lineTo(36, 10); g.lineTo(28, 14); g.strokePath();
  });
  tex('water_top', 48, 48, g => {
    g.fillStyle(0x1d4f8c); g.fillRect(0, 10, 48, 38);
    g.fillStyle(0x3d7fc4); for (let x = 0; x < 48; x += 12) g.fillEllipse(x + 6, 11, 14, 6);
    g.fillStyle(0xbfe6ff, .7); g.fillRect(4, 14, 10, 2); g.fillRect(28, 18, 12, 2);
  });
  tex('water', 48, 48, g => { g.fillStyle(0x163f73); g.fillRect(0, 0, 48, 48); g.fillStyle(0x2a5f9f, .6); g.fillRect(10, 20, 14, 2); });
  tex('floe', 96, 24, g => {
    g.fillStyle(0x7cc0ea); g.fillRoundedRect(2, 6, 92, 16, 8);
    g.fillStyle(0xf2fbff); g.fillRoundedRect(0, 0, 96, 12, 6);
    g.fillStyle(WHITE); g.fillRect(10, 2, 30, 3);
  });
  const penguin = (g, f) => {
    g.fillStyle(0x16202e); g.fillEllipse(20, 20, 36, 18);
    g.fillStyle(WHITE); g.fillEllipse(20, 25, 28, 8);
    g.fillStyle(0x16202e); g.fillCircle(35, 14, 8.5);
    g.fillStyle(WHITE); g.fillCircle(37, 14, 5);
    g.fillStyle(0x222222); g.fillCircle(38.5, 13, 1.6);
    g.fillStyle(0xf39a1e); g.fillTriangle(42, 14, 42, 18, 47, 16);
    g.fillStyle(0x0d141e); g.fillTriangle(16, 16, 26, 16, 18 + f * 4, 8 - f * 2);
    g.fillStyle(0xf39a1e); g.fillEllipse(3, 20, 7, 4); g.fillEllipse(4, 24, 7, 4);
    g.lineStyle(2, 0xffffff, .7); g.lineBetween(30, 6, 34, 4);
  };
  tex('pinguin', 48, 32, g => penguin(g, 0));
  tex('pinguin2', 48, 32, g => penguin(g, 1));
  tex('crystal', 70, 110, g => {
    g.fillStyle(0x8fd0f7, .9); g.fillTriangle(35, 0, 22, 110, 48, 110);
    g.fillStyle(0x6fb6e8, .9); g.fillTriangle(16, 40, 4, 110, 28, 110); g.fillTriangle(54, 30, 42, 110, 66, 110);
    g.fillStyle(0xffffff, .7); g.fillTriangle(35, 0, 30, 60, 36, 60);
  });
  tex('icebergs', 512, 240, g => {
    g.fillStyle(0x6c93c8);
    [[30, 120, 70], [140, 80, 90], [260, 130, 60], [360, 70, 100], [470, 120, 50]].forEach(([x, h, w]) => {
      g.fillTriangle(x, 214 - h, x - w, 214, x + w * .8, 214);
    });
    g.fillStyle(0xbcd9f5);
    [[30, 120, 70], [140, 80, 90], [260, 130, 60], [360, 70, 100], [470, 120, 50]].forEach(([x, h, w]) => {
      g.fillTriangle(x, 214 - h, x - w * .35, 214 - h * .6, x + w * .2, 214 - h * .55);
    });
    g.fillStyle(0x2a5f9f); g.fillRect(0, 214, 512, 26);
    g.fillStyle(0x6fa8dc, .6); for (let x = 0; x < 512; x += 32) g.fillRect(x + 4, 220, 14, 2);
  });

  // ---------- Welt 3: Dächer der Stadt ----------
  tex('roof', 48, 48, g => {
    g.fillStyle(0x7a2630); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x93303b); for (let y = 12; y < 48; y += 10) for (let x = (y / 10 % 2) * 8; x < 48; x += 16) g.fillRoundedRect(x, y, 14, 8, 4);
    g.fillStyle(0xcfe0f5); g.fillRect(0, 0, 48, 13); [5, 17, 29, 41].forEach(x => g.fillCircle(x, 13, 5));
    g.fillStyle(0xf6faff); g.fillRect(0, 0, 48, 9);
  });
  const wall = win => g => {
    g.fillStyle(0x5b2b2b); g.fillRect(0, 0, 48, 48);
    g.lineStyle(1, 0x452020);
    for (let y = 0; y < 48; y += 8) { g.lineBetween(0, y, 48, y); for (let x = (y / 8 % 2) * 12; x < 48; x += 24) g.lineBetween(x, y, x, y + 8); }
    if (win) {
      g.fillStyle(0x2b1a12); g.fillRect(12, 10, 24, 28);
      g.fillStyle(0xffd27a); g.fillRect(14, 12, 20, 24);
      g.fillStyle(0x2b1a12); g.fillRect(23, 12, 2, 24); g.fillRect(14, 23, 20, 2);
      g.fillStyle(0xf6faff); g.fillRect(10, 37, 28, 4);
    }
  };
  tex('wall', 48, 48, wall(false));
  tex('wall2', 48, 48, wall(true));
  tex('chimney', 48, 48, g => {
    g.fillStyle(0x8a3b2e); g.fillRect(8, 8, 32, 40);
    g.lineStyle(1, 0x6b2a20); for (let y = 16; y < 48; y += 8) g.lineBetween(8, y, 40, y);
    g.fillStyle(0x4a4a52); g.fillRect(4, 2, 40, 9);
    g.fillStyle(0xf6faff); g.fillRoundedRect(4, 0, 40, 5, 2);
  });
  const cat = awake => g => {
    const c = 0x8a8f99, d = 0x5d626c;
    if (!awake) {
      g.fillStyle(c); g.fillEllipse(22, 18, 34, 16);
      g.fillStyle(d); g.fillRect(14, 12, 3, 8); g.fillRect(22, 11, 3, 9);
      g.fillStyle(c); g.fillCircle(34, 16, 8);
      g.fillTriangle(29, 10, 33, 3, 35, 10); g.fillTriangle(35, 10, 40, 4, 41, 12);
      g.lineStyle(1.5, 0x222222); g.lineBetween(31, 16, 34, 16); g.lineBetween(36, 16, 39, 16);
      g.lineStyle(5, c); g.beginPath(); g.arc(10, 20, 8, Math.PI * .5, Math.PI * 1.4); g.strokePath();
      g.fillStyle(0xffffff); g.fillRect(2, 0, 7, 2); g.fillRect(6, 2, 2, 2); g.fillRect(3, 4, 7, 2);
    } else {
      g.fillStyle(c); g.fillRoundedRect(8, 8, 26, 14, 7); g.fillRect(10, 18, 4, 8); g.fillRect(28, 18, 4, 8);
      g.fillCircle(36, 10, 8); g.fillTriangle(31, 5, 33, -2, 37, 4); g.fillTriangle(37, 4, 42, -1, 42, 7);
      g.lineStyle(4, c); g.lineBetween(9, 12, 2, 1);
      g.fillStyle(0xf3e04a); g.fillCircle(34, 9, 2.2); g.fillCircle(39, 9, 2.2);
      g.fillStyle(0x111111); g.fillRect(33.5, 7.5, 1, 3); g.fillRect(38.5, 7.5, 1, 3);
      g.fillStyle(0xf28f8f); g.fillTriangle(35, 13, 38, 13, 36.5, 15);
    }
  };
  tex('cat', 44, 26, cat(false));
  tex('cat_awake', 44, 26, cat(true));
  tex('rudolph', 64, 48, g => {
    g.lineStyle(3, 0x6b4423);
    g.lineBetween(50, 12, 46, 0); g.lineBetween(48, 6, 42, 3); g.lineBetween(54, 12, 58, 0); g.lineBetween(56, 6, 62, 3);
    g.fillStyle(0x8a5a33);
    g.fillRect(14, 28, 5, 16); g.fillRect(24, 30, 5, 14); g.fillRect(36, 30, 5, 14); g.fillRect(44, 28, 5, 16);
    g.fillEllipse(30, 26, 40, 20); g.fillRect(42, 14, 9, 16);
    g.fillEllipse(53, 16, 18, 13);
    g.fillStyle(0xe8d2b0); g.fillEllipse(30, 31, 26, 8);
    g.fillStyle(0x222222); g.fillCircle(54, 13, 1.8);
    g.fillStyle(0xff2a2a); g.fillCircle(62, 18, 4.5); g.fillStyle(0xffffff, .7); g.fillCircle(61, 16.5, 1.3);
    g.fillStyle(0x8a5a33); g.fillTriangle(10, 20, 4, 14, 12, 26);
    g.fillStyle(GOLD); g.fillRect(38, 20, 10, 4); g.fillCircle(43, 26, 2.5);
  });
  tex('xtree', 96, 150, g => {
    g.fillStyle(0x4a3020); g.fillRect(42, 128, 12, 22);
    [[0, 60, 38], [28, 100, 44], [62, 136, 48]].forEach(([t, b, w]) => { g.fillStyle(0x1d5a40); g.fillTriangle(48, t, 48 - w, b, 48 + w, b); });
    const cols = [0xff4b4b, 0xffd23f, 0x4bc0ff, 0xff8be0];
    [[40, 40], [58, 52], [30, 80], [52, 74], [68, 92], [24, 118], [44, 110], [64, 122], [80, 130]].forEach(([x, y], i) => { g.fillStyle(cols[i % 4]); g.fillCircle(x, y, 4); });
    const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 10, a = -Math.PI / 2 + i * Math.PI / 5; pts.push({ x: 48 + r * Math.cos(a), y: 8 + r * Math.sin(a) }); }
    g.fillStyle(GOLD); g.fillPoints(pts, true);
  });
  tex('town', 512, 240, g => {
    let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const houses = [[0, 70, 110], [70, 60, 150], [130, 80, 95], [210, 50, 170], [260, 90, 120], [350, 70, 140], [420, 92, 105]];
    houses.forEach(([x, w, h]) => {
      g.fillStyle(0x1b2c4f); g.fillRect(x, 240 - h, w, h);
      g.fillTriangle(x - 4, 240 - h, x + w / 2, 240 - h - 34, x + w + 4, 240 - h);
      g.fillStyle(0xdbe8ff, .8); g.fillTriangle(x + w / 2 - 14, 240 - h - 24, x + w / 2, 240 - h - 34, x + w / 2 + 14, 240 - h - 24);
      for (let wy = 240 - h + 14; wy < 225; wy += 26) for (let wx = x + 10; wx < x + w - 14; wx += 20) {
        g.fillStyle(rnd() < .55 ? 0xffd27a : 0x2c4270); g.fillRect(wx, wy, 9, 12);
      }
    });
    g.fillStyle(0x3b4d78); g.fillRect(452, 60, 8, 180); g.fillTriangle(440, 60, 456, 10, 472, 60);
  });

  // ---------- Welt 4: Wichtelwerkstatt ----------
  tex('plank', 48, 48, g => {
    g.fillStyle(0x6b4a2e); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x8a6240); g.fillRect(0, 0, 48, 10);
    g.lineStyle(2, 0x4e341f); g.lineBetween(0, 10, 48, 10); g.lineBetween(0, 26, 48, 26); g.lineBetween(0, 42, 48, 42);
    g.lineBetween(20, 10, 20, 26); g.lineBetween(36, 26, 36, 42);
    g.fillStyle(0xc9a26a); g.fillCircle(4, 5, 1.5); g.fillCircle(44, 5, 1.5);
  });
  tex('plank2', 48, 48, g => {
    g.fillStyle(0x5a3d25); g.fillRect(0, 0, 48, 48);
    g.lineStyle(2, 0x45301c); g.lineBetween(0, 16, 48, 16); g.lineBetween(0, 32, 48, 32); g.lineBetween(14, 0, 14, 16); g.lineBetween(34, 16, 34, 32); g.lineBetween(22, 32, 22, 48);
  });
  const beltTex = off => g => {
    g.fillStyle(0x4a4f5c); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x2a2d35); g.fillRect(0, 0, 48, 16);
    g.fillStyle(0xf3c03a); for (let x = -12 + off; x < 48; x += 16) g.fillTriangle(x, 3, x + 6, 8, x, 13);
    g.fillStyle(0x7a808e); [8, 24, 40].forEach(x => g.fillCircle(x, 26, 6)); g.fillStyle(0x3a3e48); [8, 24, 40].forEach(x => g.fillCircle(x, 26, 2.5));
    g.fillStyle(0x6b707c); g.fillRect(0, 38, 48, 10);
  };
  tex('belt1', 48, 48, beltTex(0)); tex('belt2', 48, 48, beltTex(8));
  [[0xd7192a, GOLD], [0x2e9e5b, 0xffffff], [0x2b63d6, GOLD]].forEach(([c, r], i) => tex('box' + (i + 1), 48, 48, g => {
    g.fillStyle(c); g.fillRect(0, 0, 48, 48);
    g.fillStyle(0x000000, .15); g.fillRect(0, 40, 48, 8); g.fillRect(40, 0, 8, 48);
    g.fillStyle(r); g.fillRect(20, 0, 8, 48); g.fillRect(0, 20, 48, 8);
    g.fillStyle(0xffffff, .25); g.fillRect(4, 4, 12, 4);
    g.lineStyle(2, 0x000000, .2); g.strokeRect(1, 1, 46, 46);
  }));
  const robot = f => g => {
    g.fillStyle(0x3a3e48); g.fillCircle(11, 39, 5); g.fillCircle(29, 39, 5);
    g.fillStyle(0xb9c2cf); g.fillRoundedRect(6, 18, 28, 18, 4);
    g.fillStyle(0xd7192a); g.fillRect(14, 24, 12, 6);
    g.fillStyle(0xf3c03a); g.fillCircle(17, 27, 1.5); g.fillCircle(23, 27, 1.5);
    g.fillStyle(0x9aa4b3); g.fillRect(1, 20 + f * 3, 6, 10); g.fillRect(33, 23 - f * 3, 6, 10);
    g.fillStyle(0xcfd7e3); g.fillRoundedRect(9, 4, 22, 15, 4);
    g.fillStyle(0x1b2c4f); g.fillRect(12, 8, 16, 7);
    g.fillStyle(0x5ff0ff); g.fillRect(14, 10, 4, 3); g.fillRect(22, 10, 4, 3);
    g.lineStyle(2, 0x5d6573); g.lineBetween(20, 4, 20, 0);
    g.fillStyle(f ? 0xff3b3b : 0xffb3b3); g.fillCircle(20, 1.5, 2.5);
  };
  tex('robot', 40, 44, robot(0)); tex('robot2', 40, 44, robot(1));
  tex('shelves', 512, 240, g => {
    g.fillStyle(0x3b271b); g.fillRect(0, 0, 512, 240);
    g.fillStyle(0x2c1d14); for (let x = 0; x < 512; x += 64) g.fillRect(x, 0, 4, 240);
    const cols = [0xd7192a, 0x2e9e5b, 0x2b63d6, 0xf3c03a, 0x9b59b6];
    let k = 0;
    [40, 110, 180].forEach(y => {
      g.fillStyle(0x6b4a2e); g.fillRect(0, y, 512, 8);
      for (let x = 10; x < 500; x += 34 + (k % 3) * 6) {
        const h = 18 + (k * 7) % 16, w = 20 + (k * 5) % 10; g.fillStyle(cols[k % 5], .75); g.fillRect(x, y - h, w, h);
        g.fillStyle(0xffffff, .35); g.fillRect(x + w / 2 - 1.5, y - h, 3, h); k++;
      }
    });
    g.fillStyle(0xffd27a, .25); [80, 260, 430].forEach(x => g.fillCircle(x, 14, 22));
    g.fillStyle(0xffd27a); [80, 260, 430].forEach(x => g.fillCircle(x, 14, 6));
  });

  // ---------- Welt 5: Wichtelburg ----------
  tex('stone', 48, 48, g => {
    g.fillStyle(0x5d6f96); g.fillRect(0, 0, 48, 48);
    g.lineStyle(2, 0x45557a); g.strokeRect(1, 1, 22, 22); g.strokeRect(25, 1, 22, 22); g.strokeRect(-11, 25, 22, 22); g.strokeRect(13, 25, 22, 22); g.strokeRect(37, 25, 22, 22);
    g.fillStyle(0xcfe0f5); g.fillRect(0, 0, 48, 11); [5, 17, 29, 41].forEach(x => g.fillCircle(x, 11, 4.5));
    g.fillStyle(0xf6faff); g.fillRect(0, 0, 48, 7);
  });
  tex('stone2', 48, 48, g => {
    g.fillStyle(0x4d5d82); g.fillRect(0, 0, 48, 48);
    g.lineStyle(2, 0x3b4868); g.strokeRect(1, 1, 22, 22); g.strokeRect(25, 1, 22, 22); g.strokeRect(-11, 25, 22, 22); g.strokeRect(13, 25, 22, 22); g.strokeRect(37, 25, 22, 22);
  });
  tex('crumble', 48, 20, g => {
    g.fillStyle(0x8fd0f7); g.fillRoundedRect(0, 2, 48, 18, 5);
    g.fillStyle(0xe6f7ff); g.fillRoundedRect(0, 0, 48, 8, 4);
    g.lineStyle(1.5, 0x4b8fc4); g.lineBetween(14, 4, 18, 18); g.lineBetween(18, 10, 26, 12); g.lineBetween(34, 3, 30, 16);
  });
  tex('castle', 512, 260, g => {
    g.fillStyle(0x2a3f6e);
    const tower = (x, w, h) => { g.fillRect(x, 260 - h, w, h); for (let i = 0; i < w; i += 12) g.fillRect(x + i, 260 - h - 10, 7, 10); };
    tower(30, 60, 170); tower(120, 160, 120); tower(300, 50, 210); tower(380, 110, 140);
    g.fillTriangle(296, 50, 325, -10, 354, 50); g.fillTriangle(26, 90, 60, 40, 94, 90);
    g.fillStyle(0xffd27a); [[50, 120], [65, 160], [180, 170], [220, 190], [318, 90], [330, 140], [410, 150], [450, 170]].forEach(([x, y]) => g.fillRoundedRect(x, y, 10, 16, { tl: 5, tr: 5, bl: 0, br: 0 }));
    g.fillStyle(0xd7192a); g.fillTriangle(325, -10, 325, 12, 345, 2);
  });
  tex('crown', 56, 34, g => {
    g.fillStyle(GOLD); g.fillPoints([{ x: 2, y: 34 }, { x: 2, y: 8 }, { x: 15, y: 20 }, { x: 28, y: 0 }, { x: 41, y: 20 }, { x: 54, y: 8 }, { x: 54, y: 34 }], true);
    g.fillStyle(0xd7192a); g.fillCircle(28, 24, 4); g.fillStyle(0x2b63d6); g.fillCircle(14, 27, 3); g.fillCircle(42, 27, 3);
    g.fillStyle(0xffffff); [2, 28, 54].forEach((x, i) => g.fillCircle(x, i === 1 ? 2 : 8, 3));
  });

  tex('flake', 8, 8, g => { g.fillStyle(WHITE); g.fillCircle(4, 4, 3); });
  tex('puff', 24, 24, g => { g.fillStyle(WHITE, .95); g.fillCircle(12, 12, 10); });
  tex('spark', 10, 10, g => { g.fillStyle(0xfff3b0); g.fillTriangle(5, 0, 10, 5, 5, 10); g.fillTriangle(5, 0, 0, 5, 5, 10); });

  // ---------- Hintergrund ----------
  tex('sky', 8, 624, g => { g.fillGradientStyle(0x081430, 0x081430, 0x31578e, 0x31578e, 1); g.fillRect(0, 0, 8, 624); });
  tex('stars', 1040, 380, g => {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 140; i++) { g.fillStyle(WHITE, .3 + rnd() * .7); g.fillCircle(rnd() * 1040, rnd() * 380, .5 + rnd() * 1.3); }
    g.fillStyle(0xfff6d8, .25); g.fillCircle(860, 90, 46); g.fillStyle(0xfff6d8); g.fillCircle(860, 90, 34);
    g.fillStyle(0xe8dfc0); g.fillCircle(848, 82, 6); g.fillCircle(872, 102, 4);
  });
  tex('aurora', 1040, 260, g => {
    for (let x = 0; x < 1040; x += 4) {
      const y = 125 + Math.sin(x / 130) * 34 + Math.sin(x / 47) * 10;
      g.fillStyle(0x4cf0b0, .16); g.fillRect(x, y - 70, 4, 100);
      g.fillStyle(0x4cf0b0, .14); g.fillRect(x, y - 20, 4, 30);
      const y2 = 165 + Math.sin(x / 90 + 2) * 26;
      g.fillStyle(0x9b7cff, .10); g.fillRect(x, y2 - 50, 4, 70);
    }
  });
  tex('mountains', 512, 260, g => {
    const ridge = (col, base, a, b, ph) => {
      g.fillStyle(col); g.beginPath(); g.moveTo(0, 260);
      for (let x = 0; x <= 512; x += 8) g.lineTo(x, base + a * Math.sin(x / 512 * 2 * Math.PI + ph) + b * Math.sin(x / 512 * 6 * Math.PI + 1 + ph) + 10 * Math.sin(x / 512 * 14 * Math.PI));
      g.lineTo(512, 260); g.closePath(); g.fillPath();
    };
    ridge(0x3a5c94, 100, 40, 26, 0); ridge(0x2a4675, 150, 24, 18, 2);
  });
  tex('forest', 512, 240, g => {
    g.fillStyle(0x1a3152);
    for (let i = 0; i < 12; i++) {
      const x = 22 + i * 42 + (i % 3) * 5, h = 80 + (i * 37) % 60, w = 26;
      g.fillTriangle(x, 240 - h - 40, x - w, 200, x + w, 200);
      g.fillTriangle(x, 240 - h - 10, x - w - 6, 220, x + w + 6, 220);
    }
    g.fillStyle(0x7d9cc8); g.beginPath(); g.moveTo(0, 240);
    for (let x = 0; x <= 512; x += 8) g.lineTo(x, 214 + 8 * Math.sin(x / 512 * 4 * Math.PI));
    g.lineTo(512, 240); g.closePath(); g.fillPath();
  });
};
