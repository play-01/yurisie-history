// High-Clarity Synchronized Canvas Renderer
export const W = 960;
export const H = 540;
export const CENTER = [480, 340];
export const BOUNDS = { left: 70, right: 890, top: 195, bottom: 495 };
const TAU = Math.PI * 2;

const loadImg = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

export const ASSETS = {
  bossSheet: loadImg('assets/boss_sheet.png'),
  bossIllust: loadImg('assets/boss_illust.webp'),
  arenaLife: loadImg('assets/arena_life.png'),
  arenaDeath: loadImg('assets/arena_death.png'),
  playerSheet: loadImg('assets/player_sheet.png'),
  playerFallback: loadImg('assets/obj_player.png'),
  flowerBlue: loadImg('assets/obj_flower_blue.png'),
  flowerRed: loadImg('assets/obj_flower_red.png'),
  blade: loadImg('assets/obj_blade.png'),
  chain: loadImg('assets/obj_chain.png')
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);

function oval(ctx, x, y, rx, ry, fill, stroke, width = 1) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function label(ctx, text, x, y, color = '#fff', size = 14) {
  ctx.save();
  ctx.font = `800 ${size}px "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(6, 2, 12, 0.9)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function getEnvelopeState(env, elapsed, chainCut) {
  if (!env) return null;
  let x = env.from[0];
  let y = env.from[1];
  if (env.to && env.endT > env.startT) {
    const t = clamp((elapsed - (env.startT || 0)) / (env.endT - (env.startT || 0)), 0, 1);
    x = env.from[0] + (env.to[0] - env.from[0]) * t;
    y = env.from[1] + (env.to[1] - env.from[1]) * t;
  }
  let r = env.r;
  if (env.shrinkTo && env.endT > env.startT) {
    const t = clamp((elapsed - (env.startT || 0)) / (env.endT - (env.startT || 0)), 0, 1);
    r = env.r + (env.shrinkTo - env.r) * t;
  }
  if (env.widenOnCut && chainCut) {
    r += 65;
  }
  return { x, y, r };
}

function drawEnvelope(ctx, envState, animTime) {
  if (!envState) return;
  const { x, y, r } = envState;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.ellipse(x, y, r, r * 0.74, 0, 0, TAU, true);
  ctx.fillStyle = 'rgba(145, 22, 82, 0.24)';
  ctx.fill();

  oval(ctx, x, y, r, r * 0.74, null, '#ff77b5', 2.5);

  const count = 14;
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * TAU + animTime * 1.1;
    const bx = x + Math.cos(ang) * r;
    const by = y + Math.sin(ang) * r * 0.74;
    if (ASSETS.blade.complete && ASSETS.blade.naturalWidth > 0) {
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(ang + Math.PI / 2);
      ctx.drawImage(ASSETS.blade, -15, -15, 30, 30);
      ctx.restore();
    } else {
      oval(ctx, bx, by, 7, 7, '#ff77b5', '#fff', 1);
    }
  }
  ctx.restore();
}

function drawAttacks(ctx, stage, elapsed, animTime) {
  for (const a of stage.attacks) {
    if (elapsed < a.warn) continue;
    const postFire = elapsed - a.fire;
    if (postFire > 0.32) continue;

    const progress = clamp((elapsed - a.warn) / Math.max(0.05, a.fire - a.warn), 0, 1);
    const firing = elapsed >= a.fire;
    const nearFire = !firing && a.fire - elapsed <= 0.16;

    if (a.type === 'safeSpot') {
      const [sx, sy] = a.point;
      oval(
        ctx,
        sx,
        sy,
        a.r,
        a.r * 0.65,
        'rgba(82, 232, 255, 0.13)',
        nearFire ? '#ffffff' : '#52e8ff',
        2.5
      );
      if (a.label) label(ctx, a.label, sx, sy - a.r * 0.72, '#8ef3ff', 13);
      continue;
    }

    if (a.type === 'floorPad') {
      const alpha = firing ? 0.65 * (1 - postFire / 0.32) : 0.22 + progress * 0.28;
      oval(ctx, a.x, a.y, a.r, a.r * 0.68, `rgba(255, 50, 95, ${alpha * 0.45})`, nearFire ? '#fff' : '#ff5588', 2);
      oval(ctx, a.x, a.y, a.r * progress, a.r * 0.68 * progress, `rgba(255, 65, 110, ${alpha})`, null);
      if (a.label && !firing) label(ctx, a.label, a.x, a.y - a.r * 0.72, '#ff9ec0', 12);
    } else if (a.type === 'purpleVoid') {
      // Safe inside r, lethal outside r
      ctx.save();
      ctx.beginPath();
      ctx.rect(BOUNDS.left, BOUNDS.top, BOUNDS.right - BOUNDS.left, BOUNDS.bottom - BOUNDS.top);
      ctx.ellipse(a.x, a.y, a.r, a.r * 0.68, 0, 0, TAU, true);
      const alpha = firing ? 0.7 * (1 - postFire / 0.32) : 0.18 + progress * 0.34;
      ctx.fillStyle = `rgba(175, 60, 255, ${alpha})`;
      ctx.fill();
      oval(ctx, a.x, a.y, a.r, a.r * 0.68, 'rgba(90, 240, 210, 0.12)', nearFire ? '#fff' : '#7efcd2', 2.5);
      if (a.label && !firing) label(ctx, a.label, a.x, a.y - a.r * 0.72, '#a7f3d0', 12);
      ctx.restore();
    } else if (a.type === 'pillar') {
      const w = a.x2 - a.x1;
      const h = a.y2 - a.y1;
      const alpha = firing ? 0.72 * (1 - postFire / 0.32) : 0.18 + progress * 0.28;
      ctx.save();
      ctx.fillStyle = `rgba(180, 70, 255, ${alpha * 0.45})`;
      ctx.fillRect(a.x1, a.y1, w, h);
      const fillH = h * progress;
      ctx.fillStyle = `rgba(210, 95, 255, ${alpha})`;
      ctx.fillRect(a.x1, a.y2 - fillH, w, fillH);
      ctx.strokeStyle = nearFire ? '#ffffff' : '#d68fff';
      ctx.lineWidth = nearFire ? 3 : 1.8;
      ctx.strokeRect(a.x1, a.y1, w, h);
      if (a.seq && !firing) {
        label(ctx, `${a.seq}`, (a.x1 + a.x2) / 2, a.y1 + 22, '#f5d89a', 15);
      }
      ctx.restore();
    } else if (a.type === 'rect') {
      const w = a.x2 - a.x1;
      const h = a.y2 - a.y1;
      const alpha = firing ? 0.68 * (1 - postFire / 0.32) : 0.2 + progress * 0.3;
      ctx.save();
      ctx.fillStyle = `rgba(255, 55, 95, ${alpha * 0.4})`;
      ctx.fillRect(a.x1, a.y1, w, h);
      ctx.fillStyle = `rgba(255, 65, 110, ${alpha})`;
      ctx.fillRect(a.x1, a.y1, w * progress, h);
      ctx.strokeStyle = nearFire ? '#fff' : '#ff6b98';
      ctx.lineWidth = 2;
      ctx.strokeRect(a.x1, a.y1, w, h);
      if (a.label && !firing) label(ctx, a.label, (a.x1 + a.x2) / 2, a.y1 + 22, '#ffb3c9', 13);
      ctx.restore();
    } else if (a.type === 'ring') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, a.outerR, a.outerR * 0.72, 0, 0, TAU);
      ctx.ellipse(a.x, a.y, a.innerR, a.innerR * 0.72, 0, 0, TAU, true);
      const alpha = firing ? 0.68 * (1 - postFire / 0.32) : 0.16 + progress * 0.3;
      ctx.fillStyle = `rgba(255, 70, 120, ${alpha})`;
      ctx.fill();
      oval(ctx, a.x, a.y, a.innerR, a.innerR * 0.72, null, nearFire ? '#fff' : '#ff7aa8', 2);
      ctx.restore();
    } else if (a.type === 'slash') {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle || 0);
      const len = 1100;
      const alpha = firing ? 0.85 * (1 - postFire / 0.32) : 0.18 + progress * 0.34;
      ctx.fillStyle = `rgba(255, 45, 95, ${alpha * 0.45})`;
      ctx.fillRect(-len / 2, -a.width / 2, len, a.width);
      ctx.fillStyle = firing ? '#ffffff' : `rgba(255, 95, 145, ${alpha})`;
      ctx.fillRect(-len / 2, -(a.width * progress) / 2, len, a.width * progress);
      ctx.strokeStyle = nearFire ? '#ffffff' : '#ff85b3';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-len / 2, -a.width / 2, len, a.width);
      ctx.restore();
      if (a.seq && !firing) {
        const offset = (a.seq - 2.5) * 44;
        label(ctx, `①②③④`[a.seq - 1] || `${a.seq}`, a.x + Math.cos(a.angle || 0) * offset, a.y + Math.sin(a.angle || 0) * offset, '#ffe699', 16);
      }
    } else if (a.type === 'quake') {
      const r = 420 * progress;
      oval(
        ctx,
        CENTER[0],
        CENTER[1],
        r,
        r * 0.62,
        null,
        firing ? '#ffffff' : nearFire ? '#ffe49e' : '#ff5588',
        firing ? 6 : 3
      );
      if (!firing) {
        label(ctx, a.label || '점프(C) 또는 백스텝(↓+C)!', CENTER[0], 172 + Math.sin(animTime * 14) * 3, '#ffe49e', 16);
      }
    }
  }
}

function drawChainAndFlower(ctx, stage, elapsed, animTime) {
  const ch = stage.chain;
  if (ch && elapsed >= ch.warn - 0.3) {
    if (!ch.cut) {
      const [ax, ay] = ch.anchor;
      const [tx, ty] = ch.safeTarget;
      ctx.save();
      ctx.strokeStyle = '#69f0ae';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();

      oval(ctx, tx, ty, 38, 25, 'rgba(105, 240, 174, 0.16)', '#69f0ae', 2.5);
      label(ctx, '사슬 반대편으로 이동!', tx, ty - 34, '#69f0ae', 12);

      // Slash guide line
      const prog = clamp((elapsed - ch.warn) / Math.max(0.1, ch.fire - ch.warn), 0, 1);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 110, 170, ${0.35 + prog * 0.65})`;
      ctx.lineWidth = ch.slash.width * Math.max(0.15, prog);
      ctx.beginPath();
      if (ch.slash.axis === 'x') {
        ctx.moveTo(ch.slash.at, BOUNDS.top);
        ctx.lineTo(ch.slash.at, BOUNDS.bottom);
      } else {
        ctx.moveTo(BOUNDS.left, ch.slash.at);
        ctx.lineTo(BOUNDS.right, ch.slash.at);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (ch.cut && ch.flower && !ch.flowerCollected) {
      drawFlower(ctx, ch.flower, ch.flowerColor, animTime);
    }
  }

  if (stage.standaloneFlower && elapsed >= stage.standaloneFlower.appearAt && !stage.standaloneFlower.collected) {
    drawFlower(ctx, stage.standaloneFlower.point, stage.standaloneFlower.color, animTime);
  }
}

function drawFlower(ctx, pt, color, animTime) {
  const [fx, fy] = pt;
  const bob = Math.sin(animTime * 5) * 4;
  const ringR = 32 + Math.sin(animTime * 8) * 3;
  const stroke = color === 'blue' ? '#52e8ff' : '#ff4d84';
  oval(ctx, fx, fy, ringR, ringR * 0.6, 'rgba(255,255,255,0.08)', stroke, 2);
  const img = color === 'blue' ? ASSETS.flowerBlue : ASSETS.flowerRed;
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, fx - 24, fy - 42 + bob, 48, 48);
  }
  label(ctx, color === 'blue' ? '푸른 꽃 습득' : '붉은 꽃 습득', fx, fy - 52 + bob, stroke, 12);
}

function drawBoss(ctx, x, y, counterReady, animTime) {
  const bob = Math.sin(animTime * 3.2) * 4;
  ctx.save();
  oval(ctx, x, y, 76, 20, 'rgba(10, 4, 18, 0.72)', counterReady ? '#ffd984' : '#c8287866', 2);

  if (ASSETS.bossSheet.complete && ASSETS.bossSheet.naturalWidth > 0) {
    const fw = 571;
    const fh = 391;
    const frameIdx = Math.floor(animTime * 10) % 8;
    const scale = 0.56;
    const dw = fw * scale;
    const dh = fh * scale;
    ctx.save();
    ctx.translate(x, y + bob);
    if (x < 400) ctx.scale(-1, 1);
    ctx.shadowBlur = counterReady ? 28 : 16;
    ctx.shadowColor = counterReady ? '#ffda75' : '#ff1e78';
    ctx.drawImage(ASSETS.bossSheet, frameIdx * fw, 0, fw, fh, -dw * 0.56, -dh * 0.9, dw, dh);
    ctx.restore();
  }

  if (counterReady) {
    const pulseR = 88 + Math.sin(animTime * 16) * 8;
    oval(ctx, x, y, pulseR, pulseR * 0.46, 'rgba(255, 208, 100, 0.22)', '#ffe49e', 3);
    label(ctx, '지금 평타 카운터! (X)', x, y - 160, '#ffe699', 18);
  }
  ctx.restore();
}

function getPlayerFrameIndex(p) {
  if (p.attack > 0) return p.attack > 0.16 ? 20 : 21;
  if (p.backstep > 0) return p.backstep > 0.13 ? 18 : 19;
  if (p.z > 4) return p.vz >= 0 ? 16 : 17;
  const speedSq = p.vx * p.vx + p.vy * p.vy;
  if (speedSq > 900) {
    return (p.running ? 10 : 4) + (Math.floor(p.animTimer) % 6);
  }
  return Math.floor(p.animTimer) % 4;
}

function drawPlayer(ctx, state) {
  const { p, dustPuffs, afterimages } = state;

  for (const d of dustPuffs) {
    const a = clamp(d.life / d.maxLife, 0, 1) * 0.5;
    oval(ctx, d.x, d.y, d.r, d.r * 0.52, `rgba(220, 210, 236, ${a})`, null);
  }

  const scale = 0.72;
  const dw = 160 * scale;
  const dh = 150 * scale;

  if (ASSETS.playerSheet.complete && ASSETS.playerSheet.naturalWidth > 0) {
    for (const ghost of afterimages) {
      ctx.save();
      ctx.globalAlpha = ghost.alpha;
      ctx.translate(ghost.x, ghost.y - ghost.z);
      ctx.scale(ghost.facing, 1);
      ctx.drawImage(ASSETS.playerSheet, ghost.frame * 160, 0, 160, 150, -66 * scale, -114 * scale, dw, dh);
      ctx.restore();
    }
  }

  const shadowColor = p.backstep > 0 ? '#7efcd2' : p.running ? '#38bdf8' : '#52e8ff66';
  oval(ctx, p.x, p.y, p.running ? 27 : 23, 9, 'rgba(10, 5, 16, 0.75)', shadowColor, p.running || p.backstep > 0 ? 2 : 1.5);

  ctx.save();
  ctx.translate(p.x, p.y - p.z);
  ctx.scale(p.facing, 1);

  if (p.invuln > 0) {
    ctx.shadowColor = '#7efcd2';
    ctx.shadowBlur = 18;
  }

  const frameIdx = getPlayerFrameIndex(p);
  if (ASSETS.playerSheet.complete && ASSETS.playerSheet.naturalWidth > 0) {
    ctx.drawImage(ASSETS.playerSheet, frameIdx * 160, 0, 160, 150, -66 * scale, -114 * scale, dw, dh);
  } else if (ASSETS.playerFallback.complete && ASSETS.playerFallback.naturalWidth > 0) {
    ctx.drawImage(ASSETS.playerFallback, -66 * scale, -114 * scale, dw, dh);
  }

  if (p.attack > 0) {
    ctx.beginPath();
    ctx.arc(14, -26, 62, 4.6, 7.6);
    ctx.strokeStyle = `rgba(130, 240, 255, ${p.attack / 0.28})`;
    ctx.lineWidth = 12;
    ctx.stroke();
  }
  ctx.restore();
}

function drawIntroCutIn(ctx, cutIn, elapsed, animTime) {
  if (!cutIn || elapsed > cutIn.duration) return;
  const t = elapsed / cutIn.duration;
  const alpha = t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1;

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);

  if (cutIn.eclipse) {
    // Darken arena during 3:35 ~ 3:39 energy gather
    ctx.fillStyle = `rgba(8, 2, 18, ${0.56 * clamp(alpha, 0, 1)})`;
    ctx.fillRect(0, 0, W, H);

    // Dark-purple eclipse / moon orb behind boss
    const orbR = 78 + Math.sin(animTime * 6) * 4;
    const orbGrad = ctx.createRadialGradient(480, 235, 14, 480, 235, orbR * 1.4);
    orbGrad.addColorStop(0, 'rgba(14, 4, 28, 0.95)');
    orbGrad.addColorStop(0.58, 'rgba(138, 32, 196, 0.72)');
    orbGrad.addColorStop(0.82, 'rgba(255, 62, 136, 0.42)');
    orbGrad.addColorStop(1, 'rgba(138, 32, 196, 0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(480, 235, orbR * 1.4, 0, TAU);
    ctx.fill();

    // Swirling inward purple mist arcs
    for (let i = 0; i < 4; i++) {
      const ang = animTime * 2.4 + (i * Math.PI) / 2;
      ctx.strokeStyle = 'rgba(205, 110, 255, 0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(480, 235, orbR * (0.7 + (i % 2) * 0.25), ang, ang + 1.4);
      ctx.stroke();
    }
  }

  // Top cinematic band
  const grad = ctx.createLinearGradient(0, 32, 0, 134);
  grad.addColorStop(0, 'rgba(20, 6, 34, 0)');
  grad.addColorStop(0.25, 'rgba(38, 10, 62, 0.9)');
  grad.addColorStop(0.75, 'rgba(85, 16, 70, 0.88)');
  grad.addColorStop(1, 'rgba(20, 6, 34, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 32, W, 102);

  if (ASSETS.bossIllust.complete && ASSETS.bossIllust.naturalWidth > 0) {
    const slideX = lerp(W - 220, W - 265, t);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 34, W, 98);
    ctx.clip();
    ctx.globalAlpha = clamp(alpha * 0.78, 0, 1);
    ctx.drawImage(ASSETS.bossIllust, slideX, 18, 240, 140);
    ctx.restore();
  }

  label(ctx, `패턴 개막 · ${cutIn.title}`, W / 2, 68, '#f5d89a', 22);
  label(ctx, cutIn.quote, W / 2, 102, '#ffd4e8', 14);
  ctx.restore();
}

export function renderFrame(ctx, state) {
  const { stage, elapsed, animTime, screenShake, feedbackText, feedbackTimer, godMode } = state;

  ctx.save();
  if (screenShake > 0) {
    const mag = screenShake * 18;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }

  // Arena background
  ctx.fillStyle = '#07030d';
  ctx.fillRect(0, 0, W, H);
  const bg = stage.worldState ? ASSETS.arenaDeath : ASSETS.arenaLife;
  if (bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, W, H);
  }

  // Playfield border
  ctx.strokeStyle = stage.worldState ? 'rgba(255, 77, 132, 0.35)' : 'rgba(82, 232, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(BOUNDS.left, BOUNDS.top, BOUNDS.right - BOUNDS.left, BOUNDS.bottom - BOUNDS.top);

  const envState = getEnvelopeState(stage.envelope, elapsed, stage.chain?.cut);
  drawEnvelope(ctx, envState, animTime);
  drawAttacks(ctx, stage, elapsed, animTime);
  drawChainAndFlower(ctx, stage, elapsed, animTime);

  drawIntroCutIn(ctx, stage.introCutIn, elapsed, animTime);
  const bossPos = stage.counter && elapsed >= stage.counter.appearAt
    ? stage.counter.point
    : stage.introCutIn?.eclipse && elapsed < stage.introCutIn.duration
      ? [480, 248]
      : [480, 290];
  const counterReady = Boolean(stage.counter && elapsed >= stage.counter.readyAt && !stage.counter.hit);
  drawBoss(ctx, bossPos[0], bossPos[1], counterReady, animTime);

  drawPlayer(ctx, state);

  if (godMode) {
    label(ctx, '무적 연습 모드', 86, 26, '#69f0ae', 13);
  }

  if (feedbackTimer > 0 && feedbackText) {
    label(ctx, feedbackText, W / 2, 74, '#ffe699', 18);
  }

  ctx.restore();
}
