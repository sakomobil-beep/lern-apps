// Menü, Einstellungen, Fenster (Rechentor, Ziel, Pause) und Touch-Knöpfe.
(() => {
const { GW, GH, Save, Sfx, Touch, GameScene } = window.RDG;
const $ = s => document.querySelector(s);
window.RDG_isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: GW, height: GH, backgroundColor: '#081430',
  physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
});
game.scene.add('game', GameScene, false);
window.RDG_game = game;

let INDEX = null, order = [], current = null;
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const STAR = on => `<svg class="st ${on ? 'on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"/></svg>`;

// ---------- Adventskalender ----------
// Dezember: Türchen n geht am n. Dezember auf. Im November ist nur die Einführung spielbar.
// Januar bis Oktober: alles offen. Verpasste Türchen bleiben offen.
function doorOpen(n) {
  if (Save.data.papa) return true;
  const d = new Date(), m = d.getMonth();
  if (m === 11) return d.getDate() >= n;
  if (m === 10) return false;
  return true;
}
function doorOf(id) { return INDEX ? INDEX.calendar.indexOf(id) + 1 : 0; }
function unlocked(i) {
  // Ohne Adventskalender: jedes Level geht auf, wenn das vorherige geschafft ist.
  const id = order[i], rec = Save.data.levels[id], done = x => !!(Save.data.levels[x] && Save.data.levels[x].done);
  if (Save.data.papa || id === 'i-1' || (rec && rec.done)) return true;
  const BONUS = { 'b-1': 'w1-3', 'b-2': 'w2-4', 'b-3': 'w3-4', 'b-4': 'w5-4' };
  if (BONUS[id]) return done(BONUS[id]);
  const main = order.filter(x => !BONUS[x]), k = main.indexOf(id);
  return k > 0 && done(main[k - 1]);
}
const DOOR_POS = [7, 15, 2, 20, 11, 23, 4, 17, 9, 1, 13, 22, 6, 19, 3, 12, 24, 8, 16, 5, 21, 10, 18, 14];
const DOOR_COL = ['red', 'green', 'blue', 'gold'];
function renderCalendar() {
  const today = new Date(), dec = today.getMonth() === 11;
  $('#cal').innerHTML = DOOR_POS.map((n, k) => {
    const id = INDEX.calendar[n - 1], open = doorOpen(n), rec = id && Save.data.levels[id];
    const seen = (Save.data.doors || {})[n];
    const isToday = dec && today.getDate() === n;
    let cls = `door c-${DOOR_COL[k % 4]}`, inner = '';
    if (!open) cls += ' locked';
    else if (!id) { cls += ' empty'; inner = '<small>kommt bald</small>'; }
    else {
      cls += seen ? ' seen' : ' fresh';
      inner = rec && rec.done ? `<span class="dstars">${rec.stars.map(STAR).join('')}</span>` : '<small>Spielen!</small>';
    }
    if (isToday) cls += ' today';
    return `<button class="${cls}" data-n="${n}" aria-label="Türchen ${n}"><span class="dn">${n}</span>${inner}</button>`;
  }).join('');
}
function openDoor(n) {
  const id = INDEX.calendar[n - 1];
  if (!doorOpen(n)) { UI.toast(`Türchen ${n} geht am ${n}. Dezember auf`); return; }
  if (!id) { UI.toast(n === 24 ? 'Der Endkampf kommt noch!' : 'Dieses Level baue ich noch'); return; }
  Sfx.init(); if (!Sfx.mg && Save.data.settings.music) Sfx.startMusic();
  Save.data.doors = Save.data.doors || {};
  const first = !Save.data.doors[n]; Save.data.doors[n] = true; Save.write();
  const w = INDEX.worlds.find(w => w.levels.some(l => l.id === id)), lv = w.levels.find(l => l.id === id), rec = Save.data.levels[id];
  if (first) Sfx.gold();
  modal(`<div class="doornum">${n}</div><h2>${lv.name}</h2><p>${w.id === 6 ? 'Bonus' : 'Welt ' + w.id} · ${w.name}</p>
    ${rec && rec.done ? `<div class="bigstars">${rec.stars.map(STAR).join('')}</div><p class="time">Rekord ${fmt(rec.best)}</p>` : ''}
    <div class="row"><button class="btn" data-a="go">Los geht's!</button><button class="btn ghost" data-a="back">Zurück</button></div>`);
  bind({ go: () => startLevel(id), back: () => { closeModal(); renderMenu(); } });
}

function renderMenu() {
  if (!INDEX) return;
  const R = Save.data.resume;
  $('#resume').innerHTML = R ? `<button class="resbtn" id="resBtn"><b>Weiterspielen</b><span>${RDG.lvLabel(R.id)} · ${R.name} – da, wo du aufgehört hast</span></button>` : '';
  if (R) $('#resBtn').onclick = () => startLevel(R.id, true);
  $('#worlds').innerHTML = worldCards(INDEX.worlds.filter(w => w.id !== 0));
  $('#intro').innerHTML = worldCards(INDEX.worlds.filter(w => w.id === 0));
  $('#musicBtn').textContent = Save.data.settings.music ? 'Musik: an' : 'Musik: aus';
}
function worldCards(list) {
  return list.map(w => {
    if (!w.levels.length) return `<div class="world soon"><span class="wn">Welt ${w.id}</span><b>${w.name}</b><small>kommt bald</small></div>`;
    return `<div class="world"><span class="wn">${w.id === 6 ? 'Bonus' : w.id === 0 ? 'Vor dem 1. Dezember' : 'Welt ' + w.id}</span><b>${w.name}</b><div class="lv">${w.levels.map(l => {
      const i = order.indexOf(l.id), rec = Save.data.levels[l.id], open = unlocked(i);
      const stars = (rec ? rec.stars : [0, 0, 0]).map(STAR).join('');
      return `<button class="lvbtn" data-id="${l.id}" ${open ? '' : 'disabled'}>
        <span class="num">${RDG.lvLabel(l.id)}</span><span class="nm">${l.name}</span>
        <span class="stars">${open ? stars : 'erst das Level davor'}</span>${rec && rec.best !== null ? `<span class="best">Rekord ${fmt(rec.best)}</span>` : ''}</button>`;
    }).join('')}</div></div>`;
  }).join('');
}

function showMenu() {
  game.scene.stop('game'); closeModal();
  $('#menu').hidden = false; $('#pauseBtn').hidden = true; $('#touch').hidden = true;
  renderMenu();
}

function startLevel(id, resume) {
  Sfx.init(); if (!Sfx.mg && Save.data.settings.music) Sfx.startMusic();
  current = id; closeModal();
  $('#menu').hidden = true; $('#settings').hidden = true;
  $('#pauseBtn').hidden = false; $('#touch').hidden = !window.RDG_isTouch; setThrow(false); UI.setFly(false);
  game.scene.stop('game'); game.scene.start('game', { id, resume: !!resume });
}

// ---------- Fenster ----------
function modal(html) { $('#modalCard').innerHTML = html; $('#modal').hidden = false; }
function closeModal() { $('#modal').hidden = true; }

const STORY = {
  intro: ['Die Nacht vor dem Advent',
    'Am Nordpol ist alles ruhig. In der Werkstatt stapeln sich die fertigen Geschenke für alle Kinder der Welt.',
    'Doch plötzlich klirrt es! Die frechen Schneewichtel brechen ein und wollen alle Geschenke stehlen. Der Weihnachtsmann springt aus dem Sessel. Schnell hinterher!',
    'Los geht\'s!'],
  outro: ['Zu spät …',
    'Der Weihnachtsmann hat sich durch die Werkstatt gekämpft, aber die Wichtel sind mit den Geschenken durch das Hintertor entwischt. Sie verstecken sie im ganzen Nordland!',
    'Jetzt beginnt die große Jagd durch Wald, Eisberge, Stadt und Werkstatt bis zur Wichtelburg. Und ganz am Ende wartet der Wichtelkönig …',
    'Auf zu Welt 1!']
};
function story(k, then) {
  const [h, a, b, btn] = STORY[k];
  if (k === 'intro') { Save.data.storySeen = true; Save.write(); }
  modal(`<div class="story"><svg viewBox="0 0 200 80" aria-hidden="true"><rect width="200" height="80" rx="12" fill="#0f2350"/><circle cx="165" cy="20" r="10" fill="#fff6d8"/><path d="M0 70 Q50 50 100 66 T200 60 V80 H0z" fill="#e8f1ff"/><rect x="60" y="34" width="60" height="34" fill="#7a2630"/><path d="M54 36 90 14 126 36z" fill="#5b2b2b"/><rect x="82" y="46" width="16" height="22" fill="#ffd27a"/><circle cx="140" cy="64" r="6" fill="#2a8f5e"/><path d="M134 60 140 46 146 60z" fill="#2b63d6"/><circle cx="152" cy="66" r="5" fill="#2a8f5e"/><path d="M147 63 152 52 157 63z" fill="#2b63d6"/><rect x="156" y="58" width="10" height="10" fill="#d7192a"/></svg>
    <h2>${h}</h2><p>${a}</p><p>${b}</p><div class="row"><button class="btn" data-a="go">${btn}</button></div></div>`);
  bind({ go: then });
}

const UI = {
  toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); },
  setThrow(on) { setThrow(on); },
  setFly(on) { $('#tDown').hidden = !on; if (!on) Touch.down = false; },
  quiz(task, done) {
    modal(`<div class="gatehead"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="6" width="32" height="30" rx="4" fill="#9a6a3e"/><rect x="11" y="12" width="18" height="18" rx="4" fill="#fff" stroke="#d7192a" stroke-width="2.5"/><text x="20" y="27" text-anchor="middle" font-size="15" font-weight="700" fill="#d7192a">?</text></svg>
      <div><h2>Wichteltor!</h2><p>Das Tor geht nur mit der richtigen Antwort auf.</p></div></div>
      <div class="task">${task.q} = ?</div>
      <div class="answers">${task.opts.map(o => `<button class="ans" data-v="${o}">${o}</button>`).join('')}</div>
      <p class="hint" id="hint" aria-live="polite"></p>`);
    $('#modalCard').querySelectorAll('.ans').forEach(b => b.onclick = () => {
      if (+b.dataset.v === task.a) {
        b.classList.add('ok'); $('#hint').textContent = 'Richtig! Das Tor springt auf.';
        $('#modalCard').querySelectorAll('.ans').forEach(x => x.disabled = true);
        setTimeout(() => { closeModal(); done(); }, 700);
      } else { b.classList.add('no'); b.disabled = true; Sfx.wrong(); $('#hint').textContent = task.hint; }
    });
  },
  finish(r) {
    if (r.id === 'i-4') { story('outro', showMenu); return; }
    const labels = [`Alle Geschenke (${r.gifts}/${r.total})`, 'Kein Treffer', `Schneller als ${fmt(r.par)}`];
    const nextOpen = r.next && order.includes(r.next);
    modal(`<h2>Level geschafft!</h2>
      <div class="bigstars">${r.stars.map(STAR).join('')}</div>
      <ul class="res">${labels.map((l, i) => `<li class="${r.stars[i] ? 'on' : ''}">${STAR(r.stars[i])}${l}</li>`).join('')}</ul>
      <p class="time">Zeit ${fmt(r.secs)} · Rekord ${fmt(r.best)} · Goldene Geschenke ${r.gold}/3</p>
      <div class="row"><button class="btn ghost" data-a="again">Nochmal</button>
      ${nextOpen ? '<button class="btn" data-a="next">Weiter</button>' : '<button class="btn" data-a="menu">Zur Karte</button>'}</div>
      ${nextOpen ? '<button class="link" data-a="menu">Zur Karte</button>' : ''}`);
    bind({ again: () => startLevel(r.id), next: () => startLevel(r.next), menu: showMenu });
  },
  ending() {
    closeModal(); $('#pauseBtn').hidden = true; $('#touch').hidden = true;
    const e = $('#ending'); e.hidden = false; e.classList.remove('play'); void e.offsetWidth; e.classList.add('play');
    Sfx.win();
  },
  gameOver(id) {
    modal(`<h2>Oh nein!</h2><p>Die Lebkuchen sind alle. Der Weihnachtsmann versucht es gleich nochmal.</p>
      <div class="row"><button class="btn" data-a="again">Nochmal</button><button class="btn ghost" data-a="menu">Zur Karte</button></div>`);
    bind({ again: () => startLevel(id), menu: showMenu });
  }
};
window.UI = UI;
function bind(map) { $('#modalCard').querySelectorAll('[data-a]').forEach(b => b.onclick = () => map[b.dataset.a]()); }
function setThrow(on) { $('#tThrow').hidden = !on; }

$('#endBack').onclick = () => { $('#ending').hidden = true; showMenu(); };

// ---------- Pause ----------
$('#pauseBtn').onclick = () => {
  const sc = game.scene.getScene('game'); if (!sc || sc.done || sc.quizOpen) return;
  game.scene.pause('game');
  modal(`<h2>Pause</h2><div class="row col"><button class="btn" data-a="go">Weiterspielen</button><button class="btn ghost" data-a="again">Level neu starten</button><button class="btn ghost" data-a="menu">Zur Karte</button></div>`);
  bind({ go: () => { closeModal(); game.scene.resume('game'); }, again: () => startLevel(current), menu: showMenu });
};

// ---------- Menü ----------
const lvClick = e => {
  const b = e.target.closest('.lvbtn'); if (!b || b.disabled) return;
  const id = b.dataset.id;
  if (id === 'i-1' && !Save.data.storySeen) { story('intro', () => startLevel(id)); return; }
  startLevel(id);
};
$('#worlds').addEventListener('click', lvClick); $('#intro').addEventListener('click', lvClick);
$('#storyBtn').onclick = () => story('intro', () => { closeModal(); });
$('#musicBtn').onclick = () => {
  Sfx.init(); Save.data.settings.music = !Save.data.settings.music; Save.write();
  Save.data.settings.music ? Sfx.startMusic() : Sfx.stopMusic(); renderMenu();
};
let taps = 0, tapT = 0;
$('#title').addEventListener('click', () => {
  const now = Date.now(); taps = now - tapT < 800 ? taps + 1 : 1; tapT = now;
  if (taps >= 5) {
    taps = 0; Save.data.papa = !Save.data.papa; Save.write(); renderMenu();
    UI.toast(Save.data.papa ? 'Papa-Schalter an: alle Level frei' : 'Papa-Schalter aus');
  }
});

// ---------- Einstellungen ----------
$('#setBtn').onclick = () => { renderSettings(); $('#menu').hidden = true; $('#settings').hidden = false; };
$('#setBack').onclick = () => { $('#settings').hidden = true; $('#menu').hidden = false; renderMenu(); };
function renderSettings() {
  const s = Save.data.settings;
  document.querySelectorAll('input[name=math]').forEach(r => r.checked = r.value === s.math);
  $('#optMusic').checked = s.music; $('#optSound').checked = s.sound;
}
document.querySelectorAll('input[name=math]').forEach(r => r.onchange = () => { Save.data.settings.math = r.value; Save.write(); });
$('#optMusic').onchange = e => { Sfx.init(); Save.data.settings.music = e.target.checked; Save.write(); e.target.checked ? Sfx.startMusic() : Sfx.stopMusic(); };
$('#optSound').onchange = e => { Save.data.settings.sound = e.target.checked; Save.write(); };
$('#resetBtn').onclick = () => { $('#resetAsk').hidden = false; };
$('#resetNo').onclick = () => { $('#resetAsk').hidden = true; };
$('#resetYes').onclick = () => { Save.resetProgress(); $('#resetAsk').hidden = true; UI.toast('Spielstand gelöscht'); };

// ---------- Touch-Knöpfe ----------
document.querySelectorAll('#touch [data-k]').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); Touch[k] = true; Touch[k + 'Tap'] = true; Touch[k + 'Hold'] = performance.now() + 200; b.classList.add('down'); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
  const off = e => { e.preventDefault(); Touch[k] = false; b.classList.remove('down'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off);
  b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  b.addEventListener('contextmenu', e => e.preventDefault());
});

// ---------- Speichern beim Schließen ----------
const saveNow = () => { const sc = game.scene.getScene('game'); if (sc && game.scene.isActive('game') || (sc && game.scene.isPaused('game'))) sc.saveResume(); };
addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) {}

// ---------- Start ----------
fetch('levels/index.json').then(r => r.json()).then(d => {
  INDEX = d; order = d.worlds.flatMap(w => w.levels.map(l => l.id)); renderMenu();
}).catch(() => { $('#worlds').innerHTML = '<p class="err">Die Level konnten nicht geladen werden.</p>'; });
})();
