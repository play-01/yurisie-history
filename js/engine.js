(() => {
'use strict';
const { SyncAudioEngine, HISTORY_STAGES, BOUNDS, CENTER, getEnvelopeState, renderFrame } = window.Yurisie;

const $ = (sel) => document.querySelector(sel);
const canvas = $('#gameCanvas');
const ctx = canvas.getContext('2d');

const audio = new SyncAudioEngine();
audio.attachSubtitleEl($('#voiceSub'));

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);
const dist = (p, pt) => Math.hypot(p.x - pt[0], p.y - pt[1]);

const keys = new Set();
const movementKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
const lastTapTime = { ArrowLeft: 0, ArrowRight: 0, ArrowUp: 0, ArrowDown: 0 };

const state = {
  active: false,
  paused: false,
  godMode: false,
  speedScale: 1.0,
  step: 0,
  completedSteps: new Set(),
  stage: null,
  elapsed: 0,
  animTime: 0,
  totalHits: 0,
  maxHits: 1,
  deathFlash: 0,
  bladeCooldown: 0,
  screenShake: 0,
  feedbackText: '',
  feedbackTimer: 0,
  lastTickGroupTime: -1,
  dustPuffs: [],
  afterimages: [],
  p: {
    x: CENTER[0],
    y: CENTER[1],
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    facing: 1,
    running: false,
    backstep: 0,
    invuln: 0,
    attack: 0,
    animTimer: 0
  }
};

function cloneStage(raw) {
  return {
    ...raw,
    attacks: raw.attacks.map((a) => ({ ...a, fired: false, ticked: false })),
    chain: raw.chain ? { ...raw.chain, fired: false, cut: false, flowerCollected: false } : null,
    standaloneFlower: raw.standaloneFlower ? { ...raw.standaloneFlower, collected: false } : null,
    counter: raw.counter ? { ...raw.counter, hit: false } : null
  };
}

function showOverlay(quote, title, desc, btnText) {
  $('#overlayQuote').textContent = quote;
  $('#overlayTitle').textContent = title;
  $('#overlayDesc').textContent = desc;
  $('#startBtn').textContent = btnText;
  $('#overlay').classList.remove('hidden');
}

function hideOverlay() {
  $('#overlay').classList.add('hidden');
}

function setFeedback(text, duration = 1.4) {
  state.feedbackText = text;
  state.feedbackTimer = duration;
}

function spawnDust(x, y, dir, count = 4) {
  for (let i = 0; i < count; i++) {
    state.dustPuffs.push({
      x: x - dir * (6 + Math.random() * 10),
      y: y + (Math.random() - 0.5) * 8,
      vx: -dir * (30 + Math.random() * 45),
      vy: (Math.random() - 0.5) * 20,
      r: 4 + Math.random() * 4,
      life: 0.25 + Math.random() * 0.12,
      maxLife: 0.37
    });
  }
}

function renderTimelineMarkers(stage) {
  const track = $('#timelineTrack');
  track.querySelectorAll('.timeline-marker').forEach((el) => el.remove());

  const dur = Math.max(0.1, stage.duration);
  const addMarker = (t, cls) => {
    const el = document.createElement('div');
    el.className = `timeline-marker ${cls}`;
    el.style.left = `${clamp((t / dur) * 100, 1, 99)}%`;
    track.appendChild(el);
  };

  for (const a of stage.attacks) {
    if (a.type !== 'safeSpot') addMarker(a.fire, '');
  }
  if (stage.chain) {
    addMarker(stage.chain.fire, 'chain');
    if (stage.chain.flower) addMarker(stage.chain.fire + 0.4, 'flower');
  }
  if (stage.standaloneFlower) {
    addMarker(stage.standaloneFlower.appearAt, 'flower');
  }
  if (stage.counter) {
    addMarker(stage.counter.readyAt, 'counter');
  }
}

function renderStepList() {
  const list = $('#stepList');
  list.innerHTML = '';
  HISTORY_STAGES.forEach((s, idx) => {
    const btn = document.createElement('button');
    btn.className = 'step-item';
    if (idx === state.step) btn.classList.add('active');
    if (state.completedSteps.has(idx)) btn.classList.add('done');
    btn.innerHTML = `
      <div class="step-num">${idx + 1} / ${HISTORY_STAGES.length} 구간 (${s.duration.toFixed(1)}s)</div>
      <div class="step-title">${s.stepTitle}</div>
    `;
    btn.addEventListener('click', () => {
      state.active = true;
      state.paused = false;
      hideOverlay();
      loadStage(idx, true);
    });
    list.appendChild(btn);
  });
}

function syncHud() {
  const s = state.stage;
  if (!s) return;
  $('#stageLabel').textContent = `${state.step + 1} / ${HISTORY_STAGES.length} 구간`;
  $('#progressFill').style.width = `${((state.step + 1) / HISTORY_STAGES.length) * 100}%`;
  $('#hitCount').textContent = state.maxHits > 0 ? `${state.totalHits} / ${state.maxHits}` : `${state.totalHits} / ∞`;
  $('#speedLabel').textContent = `${state.speedScale}x`;
  $('#cueText').innerHTML = `<strong>가이드:</strong> ${s.message}`;

  const pill = $('#worldPill');
  pill.textContent = s.worldState ? '죽음의 세계' : '생명의 세계';
  pill.classList.toggle('death', Boolean(s.worldState));
}

function loadStage(stepIdx, resetPos = false) {
  state.step = clamp(stepIdx, 0, HISTORY_STAGES.length - 1);
  const raw = HISTORY_STAGES[state.step];
  state.stage = cloneStage(raw);
  state.elapsed = 0;
  state.lastTickGroupTime = -1;

  if (resetPos && raw.startPos) {
    state.p.x = raw.startPos[0];
    state.p.y = raw.startPos[1];
    state.p.vx = 0;
    state.p.vy = 0;
    state.p.z = 0;
    state.p.vz = 0;
  }

  renderTimelineMarkers(state.stage);
  renderStepList();
  syncHud();
  if (resetPos) {
    const offset = HISTORY_STAGES.slice(0, state.step).reduce((sum, st) => sum + st.duration, 0);
    audio.seekBgm(offset);
  }
  audio.triggerStageVoice(state.step);
  audio.syncPlayback(state.active, state.paused);
}

function startRun(stepIdx = 0) {
  state.active = true;
  state.paused = false;
  state.totalHits = 0;
  state.completedSteps.clear();
  hideOverlay();
  loadStage(stepIdx, true);
}

function finishRun() {
  state.active = false;
  audio.syncPlayback(false, true);
  audio.playVoice('defeat');
  showOverlay(
    '"그래, 만족하는가? 긴 악연의 끝을, 나의 죽음을... 생명의 저편에서 기다리겠다."',
    '역사의 끝 파훼 완료!',
    `총 ${HISTORY_STAGES.length}개 구간을 완주했습니다. (총 피격 ${state.totalHits}회)`,
    '처음부터 다시 연습'
  );
}

function advanceStage() {
  state.completedSteps.add(state.step);
  if (state.step + 1 < HISTORY_STAGES.length) {
    loadStage(state.step + 1, false);
  } else {
    finishRun();
  }
}

function onHit(reason) {
  if (state.godMode || state.p.invuln > 0) return;
  state.totalHits += 1;
  state.p.invuln = 0.85;
  state.screenShake = 0.28;
  audio.playTone('hit');
  setFeedback(`피격! (${reason})`, 1.4);
  syncHud();

  if (state.maxHits > 0 && state.totalHits >= state.maxHits) {
    state.active = false;
    state.deathFlash = 0.9;
    state.screenShake = 0.45;
    audio.syncPlayback(false, true);
    audio.playVoice('atk_4', { allowInterrupt: true });
    setTimeout(() => {
      if (!state.active) {
        showOverlay(
          '"그 무력함에 끝없이 절망하라. 네 역사의 끝을 목도하라!"',
          '사망 — 역사의 끝 파훼 실패',
          `${reason}으로 치명상을 입었습니다. 1구간부터 다시 도전합니다.`,
          '처음부터 다시 (Enter / 클릭)'
        );
      }
    }, 520);
  }
}

function checkAttackHit(a) {
  if (a.type === 'safeSpot') return false;
  const p = state.p;
  if (p.invuln > 0) return false;

  if (a.type === 'quake') {
    return p.z < 18;
  }
  if (a.type === 'floorPad') {
    const dx = (p.x - a.x) / a.r;
    const dy = (p.y - a.y) / (a.r * 0.68);
    return dx * dx + dy * dy <= 1;
  }
  if (a.type === 'purpleVoid') {
    const dx = (p.x - a.x) / a.r;
    const dy = (p.y - a.y) / (a.r * 0.68);
    return dx * dx + dy * dy > 1;
  }
  if (a.type === 'pillar' || a.type === 'rect') {
    return p.x >= a.x1 && p.x <= a.x2 && p.y >= a.y1 && p.y <= a.y2;
  }
  if (a.type === 'ring') {
    const d = Math.hypot(p.x - a.x, (p.y - a.y) / 0.72);
    return d >= a.innerR && d <= a.outerR;
  }
  if (a.type === 'slash') {
    const ang = a.angle || 0;
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    const perp = Math.abs(-Math.sin(ang) * dx + Math.cos(ang) * dy);
    return perp <= a.width * 0.5;
  }
  return false;
}

function doAttack() {
  if (!state.active || state.paused || state.p.attack > 0) return;
  state.p.attack = 0.26;
  audio.playTone('slash');

  const s = state.stage;
  if (s?.counter && state.elapsed >= s.counter.readyAt && !s.counter.hit) {
    if (dist(state.p, s.counter.point) < 115) {
      s.counter.hit = true;
      state.screenShake = 0.25;
      audio.playTone('counter');
      audio.playVoice('counter_1');
      setFeedback('카운터 성공!!', 1.6);
      setTimeout(() => {
        if (state.active && state.step === HISTORY_STAGES.length - 1) {
          advanceStage();
        }
      }, 650);
    }
  }
}

function doJumpOrBackstep() {
  if (!state.active || state.paused || state.p.z > 0) return;
  if (keys.has('ArrowDown')) {
    state.p.backstep = 0.24;
    state.p.invuln = Math.max(state.p.invuln, 0.26);
    state.p.vx = -state.p.facing * 420;
    state.p.vz = 190;
    state.p.z = 2;
    audio.playTone('dash');
  } else {
    state.p.vz = 420;
    state.p.z = 2;
    audio.playTone('jump');
  }
}

function update(rawDt) {
  state.animTime += rawDt;
  state.feedbackTimer = Math.max(0, state.feedbackTimer - rawDt);
  state.screenShake = Math.max(0, state.screenShake - rawDt);
  state.deathFlash = Math.max(0, state.deathFlash - rawDt);

  if (!state.active || state.paused) return;

  const p = state.p;
  p.invuln = Math.max(0, p.invuln - rawDt);
  p.attack = Math.max(0, p.attack - rawDt);

  const dx = Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft'));
  const dy = Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp'));
  const hasInput = dx !== 0 || dy !== 0;

  if (!hasInput && p.backstep <= 0) {
    p.running = false;
  } else if (hasInput && (keys.has('ShiftLeft') || keys.has('ShiftRight')) && !p.running) {
    p.running = true;
    spawnDust(p.x, p.y, p.facing, 4);
    audio.playTone('dash');
  }

  if (p.backstep > 0) {
    p.backstep = Math.max(0, p.backstep - rawDt);
    p.vx *= Math.pow(0.06, rawDt);
    p.vy *= Math.pow(0.06, rawDt);
    if (Math.random() < 0.5) {
      state.afterimages.push({ x: p.x, y: p.y, z: p.z, facing: p.facing, frame: 18, alpha: 0.48 });
    }
  } else {
    const maxVx = p.running ? 430 : 255;
    const maxVy = p.running ? 330 : 210;
    const norm = Math.hypot(dx, dy) || 1;
    const targetVx = (dx / norm) * maxVx;
    const targetVy = (dy / norm) * maxVy;
    const accel = hasInput ? (p.running ? 28 : 34) : 42;
    p.vx = lerp(p.vx, targetVx, Math.min(1, accel * rawDt));
    p.vy = lerp(p.vy, targetVy, Math.min(1, accel * rawDt));
    if (!hasInput && Math.hypot(p.vx, p.vy) < 12) {
      p.vx = 0;
      p.vy = 0;
    }

    if (dx !== 0) p.facing = dx;
    if (hasInput) {
      p.animTimer += rawDt * (p.running ? 14.5 : 9.2);
      if (p.running && Math.random() < rawDt * 16) {
        const frame = 10 + (Math.floor(p.animTimer) % 6);
        state.afterimages.push({ x: p.x, y: p.y, z: p.z, facing: p.facing, frame, alpha: 0.3 });
      }
    } else {
      p.animTimer += rawDt * 5.0;
    }
  }

  p.x = clamp(p.x + p.vx * rawDt, BOUNDS.left, BOUNDS.right);
  p.y = clamp(p.y + p.vy * rawDt, BOUNDS.top, BOUNDS.bottom);

  if (p.z > 0 || p.vz !== 0) {
    const prevZ = p.z;
    p.z = Math.max(0, p.z + p.vz * rawDt);
    p.vz = p.z > 0 ? p.vz - (p.backstep > 0 ? 1280 : 960) * rawDt : 0;
    if (prevZ > 0 && p.z === 0) spawnDust(p.x, p.y, 0, 4);
  }

  for (let i = state.dustPuffs.length - 1; i >= 0; i--) {
    const d = state.dustPuffs[i];
    d.x += d.vx * rawDt;
    d.y += d.vy * rawDt;
    d.r += rawDt * 14;
    d.life -= rawDt;
    if (d.life <= 0) state.dustPuffs.splice(i, 1);
  }
  for (let i = state.afterimages.length - 1; i >= 0; i--) {
    state.afterimages[i].alpha -= rawDt * 2.6;
    if (state.afterimages[i].alpha <= 0) state.afterimages.splice(i, 1);
  }

  const dt = rawDt * state.speedScale;
  state.elapsed += dt;
  state.bladeCooldown = Math.max(0, state.bladeCooldown - rawDt);

  const s = state.stage;
  if (!s) return;

  // Timeline cursor & time readout
  const pct = clamp((state.elapsed / s.duration) * 100, 0, 100);
  $('#timelineCursor').style.left = `${pct}%`;
  $('#timeText').textContent = `${state.elapsed.toFixed(2)}s / ${s.duration.toFixed(2)}s`;

  // Envelope blade check
  const envState = getEnvelopeState(s.envelope, state.elapsed, s.chain?.cut);
  if (envState && state.bladeCooldown <= 0) {
    const dxEnv = (p.x - envState.x) / envState.r;
    const dyEnv = (p.y - envState.y) / (envState.r * 0.74);
    if (dxEnv * dxEnv + dyEnv * dyEnv > 1) {
      state.bladeCooldown = 0.85;
      onHit('칼날 안전지대 이탈');
    }
  }

  // Attack telegraph tick + exact fire frame sync
  for (const a of s.attacks) {
    if (a.type === 'safeSpot') continue;
    if (!a.ticked && state.elapsed >= a.fire - 0.16 && state.elapsed < a.fire) {
      a.ticked = true;
      if (Math.abs(a.fire - state.lastTickGroupTime) > 0.08) {
        state.lastTickGroupTime = a.fire;
        audio.playTone('tick');
      }
    }
    if (!a.fired && state.elapsed >= a.fire) {
      a.fired = true;
      audio.playTone(a.type === 'quake' ? 'quake' : 'slash');
      if (checkAttackHit(a)) {
        onHit(a.label || '패턴 피격');
      }
    }
  }

  // Chain cut check
  if (s.chain) {
    const ch = s.chain;
    if (!ch.fired && state.elapsed >= ch.fire) {
      ch.fired = true;
      const coord = ch.slash.axis === 'x' ? p.x : p.y;
      const anchorCoord = ch.slash.axis === 'x' ? ch.anchor[0] : ch.anchor[1];
      const hitSlash = Math.abs(coord - ch.slash.at) < ch.slash.width * 0.5 - 4;
      const crossed = (coord - ch.slash.at) * (anchorCoord - ch.slash.at) < 0;
      const inSafe = dist(p, ch.safeTarget) < 96;
      if ((crossed || inSafe) && !hitSlash) {
        ch.cut = true;
        audio.playTone('chain');
        setFeedback('사슬 절단 성공!', 1.2);
      } else {
        onHit('사슬 절단 실패');
      }
    }
    if (ch.cut && ch.flower && !ch.flowerCollected && dist(p, ch.flower) < 38 && p.z < 18) {
      ch.flowerCollected = true;
      audio.playTone('flower');
      setFeedback(ch.flowerColor === 'blue' ? '푸른 꽃 습득!' : '붉은 꽃 습득!', 1.0);
    }
  }

  // Standalone flower
  if (s.standaloneFlower && state.elapsed >= s.standaloneFlower.appearAt && !s.standaloneFlower.collected) {
    if (dist(p, s.standaloneFlower.point) < 38 && p.z < 18) {
      s.standaloneFlower.collected = true;
      audio.playTone('flower');
      setFeedback(s.standaloneFlower.color === 'blue' ? '푸른 꽃 습득!' : '붉은 꽃 습득!', 1.0);
    }
  }

  // Stage end
  if (state.elapsed >= s.duration) {
    if (!state.godMode) {
      if (s.chain?.flower && !s.chain.flowerCollected) {
        onHit('꽃 미습득');
        loadStage(state.step, true);
        return;
      }
      if (s.standaloneFlower && !s.standaloneFlower.collected) {
        onHit('꽃 미습득');
        loadStage(state.step, true);
        return;
      }
      if (s.counter && !s.counter.hit) {
        onHit('카운터 실패 (X키)');
        loadStage(state.step, true);
        return;
      }
    }
    advanceStage();
  }
}

// Input bindings
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  if (!keys.has(e.code) && movementKeys.includes(e.code)) {
    const now = performance.now();
    if (now - lastTapTime[e.code] < 240) {
      state.p.running = true;
      spawnDust(state.p.x, state.p.y, state.p.facing, 4);
      audio.playTone('dash');
    }
    lastTapTime[e.code] = now;
  }
  keys.add(e.code);

  if (e.code === 'Enter' && !state.active) startRun(0);
  if (e.code === 'Space' && state.active) togglePause();
  if (e.code === 'KeyC') doJumpOrBackstep();
  if (e.code === 'KeyX') doAttack();
  if (e.code === 'BracketLeft' && state.active) loadStage(state.step - 1, true);
  if (e.code === 'BracketRight' && state.active) loadStage(state.step + 1, true);
  if (e.code === 'KeyR' && state.active) loadStage(state.step, true);
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
});

function togglePause() {
  state.paused = !state.paused;
  $('#btnPause').textContent = state.paused ? '재개 Space' : '일시정지 Space';
  audio.syncPlayback(state.active, state.paused);
}

function setSpeed(scale, btnEl) {
  state.speedScale = scale;
  audio.setSpeed(scale);
  [$('#btnSpeedSlow'), $('#btnSpeedNorm'), $('#btnSpeedFast')].forEach((b) => b.classList.remove('active'));
  btnEl.classList.add('active');
  syncHud();
}

$('#startBtn').addEventListener('click', () => startRun(0));
$('#btnPrev').addEventListener('click', () => state.active && loadStage(state.step - 1, true));
$('#btnNext').addEventListener('click', () => state.active && loadStage(state.step + 1, true));
$('#btnPause').addEventListener('click', () => state.active && togglePause());
$('#btnRestart').addEventListener('click', () => (state.active ? loadStage(state.step, true) : startRun(0)));

$('#btnSpeedSlow').addEventListener('click', (e) => setSpeed(0.75, e.currentTarget));
$('#btnSpeedNorm').addEventListener('click', (e) => setSpeed(1.0, e.currentTarget));
$('#btnSpeedFast').addEventListener('click', (e) => setSpeed(1.25, e.currentTarget));

$('#btnGodMode').addEventListener('click', (e) => {
  state.godMode = !state.godMode;
  e.currentTarget.classList.toggle('active', state.godMode);
  e.currentTarget.textContent = `무적 연습: ${state.godMode ? 'ON' : 'OFF'}`;
});

$('#maxHitsSelect').addEventListener('change', (e) => {
  state.maxHits = Number(e.target.value);
  syncHud();
});

$('#btnAudio').addEventListener('click', (e) => {
  const next = !audio.enabled;
  audio.setEnabled(next);
  audio.syncPlayback(state.active, state.paused);
  e.currentTarget.classList.toggle('active', next);
  e.currentTarget.textContent = `사운드: ${next ? 'ON' : 'OFF'}`;
});

// Initialize first view
loadStage(0, true);

let lastTime = performance.now();
function loop(now) {
  const rawDt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(rawDt);
  renderFrame(ctx, state);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
