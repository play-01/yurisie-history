// High-Polish DNF-Style Synchronized Canvas Renderer
(() => {
'use strict';
window.Yurisie = window.Yurisie || {};

const W = 960;
const H = 540;
const CENTER = [480, 340];
const BOUNDS = { left: 24, right: 936, top: 175, bottom: 520 };
const TAU = Math.PI * 2;

const loadImg = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

const ASSETS = {
  bossSheet: loadImg('assets/boss_sheet.png'),
  bossIllust: loadImg('assets/boss_illust.webp'),
  arenaLife: loadImg('assets/arena_life.png'),
  arenaDeath: loadImg('assets/arena_death.png'),
  playerSheet: loadImg('assets/player_sheet.png'),
  playerFallback: loadImg('assets/obj_player.png'),
  flowerBlue: loadImg('assets/obj_flower_blue.png'),
  flowerRed: loadImg('assets/obj_flower_red.png'),
  blade: loadImg('assets/obj_blade.png'),
  chain: loadImg('assets/obj_chain.png'),
  shackle: loadImg('assets/obj_shackle.png'),
  vortex: loadImg('assets/obj_vortex.png'),
  introGif: loadImg('assets/img10.gif'),
  iconBoss: loadImg('assets/icon_2740.png'),
  mIdleSword: loadImg('assets/yurisie_motions/motion_idle_sword.png'),
  mDiveSlash: loadImg('assets/yurisie_motions/motion_dive_slash.png'),
  mSpinSlash: loadImg('assets/yurisie_motions/motion_spin_slash.png'),
  mCoilOrb: loadImg('assets/yurisie_motions/motion_coil_orb.png'),
  mTailRelease: loadImg('assets/yurisie_motions/motion_tail_release.png'),
  mSwordStance: loadImg('assets/yurisie_motions/motion_sword_stance.png'),
  mLowDash: loadImg('assets/yurisie_motions/motion_low_dash.png')
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);

// Ambient drifting embers / petals
const ambientParticles = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 137) % W,
  y: (i * 89) % H,
  vx: -12 - (i % 5) * 6,
  vy: 14 + (i % 4) * 5,
  size: 2 + (i % 3) * 1.4,
  phase: i * 0.7
}));

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
  ctx.strokeStyle = 'rgba(6, 2, 12, 0.92)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function getEnvelopeState(env, elapsed, chainCut) {
  if (!env) return null;
  let x = env.from[0];
  let y = env.from[1];
  if (env.to && env.endT > env.startT) {
    const t = clamp((elapsed - (env.startT || 0)) / (env.endT - (env.startT || 0)), 0, 1);
    x = lerp(env.from[0], env.to[0], t);
    y = lerp(env.from[1], env.to[1], t);
  }
  let r = env.r;
  if (env.shrinkTo && env.endT > env.startT) {
    const t = clamp((elapsed - (env.startT || 0)) / (env.endT - (env.startT || 0)), 0, 1);
    r = lerp(env.r, env.shrinkTo, t);
  }
  if (env.widenOnCut && chainCut) r += 65;
  return { x, y, r };
}

function drawEnvelope(ctx, envState, animTime) {
  if (!envState) return;
  const { x, y, r } = envState;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.ellipse(x, y, r, r * 0.74, 0, 0, TAU, true);
  ctx.fillStyle = 'rgba(120, 14, 68, 0.34)';
  ctx.fill();

  ctx.shadowColor = '#ff4d94';
  ctx.shadowBlur = 14;
  oval(ctx, x, y, r, r * 0.74, null, '#ff77b5', 2.5);
  ctx.shadowBlur = 0;

  const count = 16;
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * TAU + animTime * 1.25;
    const bx = x + Math.cos(ang) * r;
    const by = y + Math.sin(ang) * r * 0.74;
    if (ASSETS.blade.complete && ASSETS.blade.naturalWidth > 0) {
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(ang);
      ctx.drawImage(ASSETS.blade, -54, -14, 108, 28);
      ctx.restore();
    } else {
      oval(ctx, bx, by, 7, 7, '#ff77b5', '#fff', 1);
    }
  }
  ctx.restore();
}

function drawRuneRing(ctx, x, y, r, ratio, color, animTime, dir = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ratio);
  ctx.rotate(animTime * 0.9 * dir);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.86, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawAttacks(ctx, stage, elapsed, animTime) {
  for (const a of stage.attacks) {
    if (elapsed < a.warn) continue;
    const postFire = elapsed - a.fire;
    if (postFire > 0.36) continue;

    const progress = clamp((elapsed - a.warn) / Math.max(0.05, a.fire - a.warn), 0, 1);
    const firing = elapsed >= a.fire;
    const nearFire = !firing && a.fire - elapsed <= 0.16;

    if (a.type === 'safeSpot') {
      const [sx, sy] = a.point;
      ctx.save();
      ctx.shadowColor = '#52e8ff';
      ctx.shadowBlur = 12;
      oval(ctx, sx, sy, a.r, a.r * 0.65, 'rgba(82, 232, 255, 0.11)', nearFire ? '#ffffff' : '#52e8ff', 2.2);
      drawRuneRing(ctx, sx, sy, a.r, 0.65, 'rgba(130, 244, 255, 0.55)', animTime, 1);
      ctx.restore();
      if (a.label) label(ctx, a.label, sx, sy - a.r * 0.72, '#8ef3ff', 13);
      continue;
    }

    if (a.type === 'floorPad') {
      const fade = firing ? 1 - postFire / 0.36 : 1;
      const alpha = firing ? 0.75 * fade : 0.22 + progress * 0.32;
      ctx.save();
      oval(ctx, a.x, a.y, a.r, a.r * 0.68, `rgba(255, 40, 88, ${alpha * 0.4})`, nearFire ? '#fff' : '#ff4d84', 2);
      oval(ctx, a.x, a.y, a.r * progress, a.r * 0.68 * progress, `rgba(255, 58, 108, ${alpha})`, null);
      drawRuneRing(ctx, a.x, a.y, a.r, 0.68, `rgba(255, 165, 195, ${0.45 * fade})`, animTime, -1);
      if (firing) {
        const blastR = a.r * (1 + postFire * 0.8);
        oval(ctx, a.x, a.y, blastR, blastR * 0.68, null, `rgba(255, 220, 235, ${fade})`, 4);
      }
      ctx.restore();
      if (a.label && !firing) label(ctx, a.label, a.x, a.y - a.r * 0.72, '#ff9ec0', 12);
    } else if (a.type === 'purpleVoid') {
      const fade = firing ? 1 - postFire / 0.36 : 1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(BOUNDS.left, BOUNDS.top, BOUNDS.right - BOUNDS.left, BOUNDS.bottom - BOUNDS.top);
      ctx.ellipse(a.x, a.y, a.r, a.r * 0.68, 0, 0, TAU, true);
      const alpha = firing ? 0.76 * fade : 0.18 + progress * 0.36;
      ctx.fillStyle = `rgba(168, 48, 255, ${alpha})`;
      ctx.fill();
      oval(ctx, a.x, a.y, a.r, a.r * 0.68, 'rgba(90, 240, 210, 0.1)', nearFire ? '#fff' : '#7efcd2', 2.5);
      drawRuneRing(ctx, a.x, a.y, a.r, 0.68, 'rgba(126, 252, 210, 0.5)', animTime, 1);
      ctx.restore();
      if (a.label && !firing) label(ctx, a.label, a.x, a.y - a.r * 0.72, '#a7f3d0', 12);
    } else if (a.type === 'pillar') {
      const w = a.x2 - a.x1;
      const h = a.y2 - a.y1;
      const fade = firing ? 1 - postFire / 0.36 : 1;
      const alpha = firing ? 0.82 * fade : 0.16 + progress * 0.32;
      ctx.save();
      const grad = ctx.createLinearGradient(a.x1, 0, a.x2, 0);
      grad.addColorStop(0, `rgba(140, 35, 225, ${alpha * 0.35})`);
      grad.addColorStop(0.5, `rgba(215, 110, 255, ${alpha})`);
      grad.addColorStop(1, `rgba(140, 35, 225, ${alpha * 0.35})`);
      ctx.fillStyle = grad;
      ctx.fillRect(a.x1, a.y1, w, h);

      if (!firing) {
        const fillH = h * progress;
        ctx.fillStyle = `rgba(225, 130, 255, ${alpha * 0.85})`;
        ctx.fillRect(a.x1, a.y1, w, fillH);
      } else {
        // Core white/violet sword beam flash
        const beamW = w * 0.36 * fade;
        ctx.fillStyle = `rgba(255, 240, 255, ${0.9 * fade})`;
        ctx.fillRect((a.x1 + a.x2) / 2 - beamW / 2, a.y1, beamW, h);
      }

      ctx.strokeStyle = nearFire ? '#ffffff' : `rgba(216, 145, 255, ${fade})`;
      ctx.lineWidth = nearFire ? 3 : 1.6;
      ctx.strokeRect(a.x1, a.y1, w, h);
      if (a.seq && !firing) {
        label(ctx, `${a.seq}`, (a.x1 + a.x2) / 2, a.y1 + 22, '#f5d89a', 15);
      }
      ctx.restore();
    } else if (a.type === 'rect') {
      const w = a.x2 - a.x1;
      const h = a.y2 - a.y1;
      const fade = firing ? 1 - postFire / 0.36 : 1;
      const alpha = firing ? 0.72 * fade : 0.2 + progress * 0.3;
      ctx.save();
      ctx.fillStyle = `rgba(255, 45, 90, ${alpha * 0.45})`;
      ctx.fillRect(a.x1, a.y1, w, h);
      ctx.fillStyle = `rgba(255, 70, 115, ${alpha})`;
      ctx.fillRect(a.x1, a.y1, w * (firing ? 1 : progress), h);
      ctx.strokeStyle = nearFire ? '#fff' : `rgba(255, 110, 155, ${fade})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(a.x1, a.y1, w, h);
      if (a.label && !firing) label(ctx, a.label, (a.x1 + a.x2) / 2, a.y1 + 22, '#ffb3c9', 13);
      ctx.restore();
    } else if (a.type === 'ring') {
      const fade = firing ? 1 - postFire / 0.36 : 1;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, a.outerR, a.outerR * 0.72, 0, 0, TAU);
      ctx.ellipse(a.x, a.y, a.innerR, a.innerR * 0.72, 0, 0, TAU, true);
      const alpha = firing ? 0.74 * fade : 0.18 + progress * 0.32;
      ctx.fillStyle = `rgba(255, 65, 120, ${alpha})`;
      ctx.fill();
      oval(ctx, a.x, a.y, a.innerR, a.innerR * 0.72, null, nearFire ? '#fff' : '#ff7aa8', 2.2);
      ctx.restore();
    } else if (a.type === 'slash') {
      const fade = firing ? 1 - postFire / 0.36 : 1;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle || 0);
      const len = 1350;
      if (!firing) {
        const alpha = 0.36 + progress * 0.34;
        ctx.fillStyle = `rgba(210, 18, 36, ${alpha * 0.72})`;
        ctx.fillRect(-len / 2, -a.width / 2, len, a.width);
        ctx.fillStyle = `rgba(245, 36, 56, ${alpha * 0.6})`;
        ctx.fillRect(-len / 2, -(a.width * progress) / 2, len, a.width * progress);
        ctx.strokeStyle = nearFire ? '#ffffff' : 'rgba(255, 195, 205, 0.9)';
        ctx.lineWidth = nearFire ? 3 : 1.8;
        ctx.strokeRect(-len / 2, -a.width / 2, len, a.width);
      } else {
        // Exact Screenshot 2 black-core + neon purple/magenta beam
        ctx.shadowColor = '#d926ff';
        ctx.shadowBlur = 24 * fade;
        ctx.fillStyle = `rgba(220, 45, 255, ${0.85 * fade})`;
        ctx.fillRect(-len / 2, -(a.width * 0.52), len, a.width * 1.04);
        ctx.fillStyle = `rgba(10, 2, 18, ${0.96 * fade})`;
        ctx.fillRect(-len / 2, -(a.width * 0.34), len, a.width * 0.68);
        ctx.fillStyle = `rgba(255, 210, 255, ${0.92 * fade})`;
        ctx.fillRect(-len / 2, -4 * fade, len, 8 * fade);
      }
      ctx.restore();
      if (a.seq && !firing) {
        const offset = (a.seq - 2.5) * 44;
        label(ctx, `①②③④`[a.seq - 1] || `${a.seq}`, a.x + Math.cos(a.angle || 0) * offset, a.y + Math.sin(a.angle || 0) * offset, '#ffe699', 16);
      }
    } else if (a.type === 'quake') {
      const fade = firing ? 1 - postFire / 0.36 : 1;
      const r = firing ? 420 + postFire * 240 : 420 * progress;
      ctx.save();
      ctx.shadowColor = '#ff4d84';
      ctx.shadowBlur = 16;
      oval(
        ctx,
        CENTER[0],
        CENTER[1],
        r,
        r * 0.62,
        null,
        firing ? `rgba(255, 255, 255, ${fade})` : nearFire ? '#ffe49e' : '#ff5588',
        firing ? 6 * fade : 3
      );
      ctx.restore();

      // DNF authentic bottom-center cast bar ("파멸")
      if (!firing) {
        const bx = W / 2 - 95;
        const by = 452;
        const bw = 190;
        const bh = 24;
        ctx.save();
        ctx.fillStyle = 'rgba(14, 8, 22, 0.9)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = nearFire ? '#ffe49e' : '#8d628c';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(bx, by, bw, bh);
        if (ASSETS.iconBoss.complete && ASSETS.iconBoss.naturalWidth > 0) {
          ctx.drawImage(ASSETS.iconBoss, bx + 2, by + 2, 20, 20);
        }
        const barX = bx + 26;
        const barW = bw - 30;
        ctx.fillStyle = '#240b16';
        ctx.fillRect(barX, by + 14, barW, 7);
        ctx.fillStyle = nearFire ? '#ff99b8' : '#e02446';
        ctx.fillRect(barX, by + 14, barW * progress, 7);
        label(ctx, a.castName || '파멸', barX + barW / 2, by + 8, '#fff4f6', 11);
        ctx.restore();
      }
    }
  }
}

function drawTexturedChain(ctx, x1, y1, x2, y2) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  if (ASSETS.chain.complete && ASSETS.chain.naturalWidth > 0) {
    const step = 28;
    const count = Math.max(2, Math.floor(dist / step));
    ctx.save();
    ctx.shadowColor = '#69f0ae';
    ctx.shadowBlur = 10;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const cx = lerp(x1, x2, t);
      const cy = lerp(y1, y2, t);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.drawImage(ASSETS.chain, -15, -9, 30, 18);
      ctx.restore();
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.strokeStyle = '#69f0ae';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawChainAndFlower(ctx, stage, elapsed, animTime, p) {
  const ch = stage.chain;
  if (ch && elapsed >= ch.warn - 0.3) {
    if (!ch.cut) {
      const [ax, ay] = ch.anchor;
      const [tx, ty] = ch.safeTarget;
      // Chain physically tethers from anchor to the player's waist!
      drawTexturedChain(ctx, ax, ay, p.x, p.y - 24);

      if (ASSETS.shackle.complete && ASSETS.shackle.naturalWidth > 0) {
        ctx.drawImage(ASSETS.shackle, ax - 20, ay - 20, 40, 40);
        ctx.drawImage(ASSETS.shackle, p.x - 16, p.y - 40, 32, 32);
      }

      oval(ctx, tx, ty, 38, 25, 'rgba(105, 240, 174, 0.14)', '#69f0ae', 2.5);
      drawRuneRing(ctx, tx, ty, 38, 0.65, 'rgba(105, 240, 174, 0.55)', animTime, 1);
      label(ctx, '사슬 반대편으로 이동!', tx, ty - 34, '#69f0ae', 12);

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
  ctx.save();
  ctx.shadowColor = stroke;
  ctx.shadowBlur = 14;
  oval(ctx, fx, fy, ringR, ringR * 0.6, 'rgba(255,255,255,0.08)', stroke, 2);
  drawRuneRing(ctx, fx, fy, ringR, 0.6, stroke, animTime, -1);
  const img = color === 'blue' ? ASSETS.flowerBlue : ASSETS.flowerRed;
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, fx - 24, fy - 42 + bob, 48, 48);
  }
  ctx.restore();
  label(ctx, color === 'blue' ? '푸른 꽃 습득' : '붉은 꽃 습득', fx, fy - 54 + bob, stroke, 12);
}

function pickBossMotionSprite(stage, elapsed, counterReady) {
  if (stage.introCutIn?.eclipse && elapsed < stage.introCutIn.duration) {
    const t = elapsed / stage.introCutIn.duration;
    if (t < 0.35) return { img: ASSETS.mDiveSlash, targetH: 210 };
    return { img: ASSETS.mTailRelease, targetH: 225 };
  }
  if (counterReady) return { img: ASSETS.mLowDash, targetH: 185 };
  const activeAttack = stage.attacks.some((a) => (a.type === 'slash' || a.type === 'pillar') && elapsed >= a.warn && elapsed <= a.fire + 0.35);
  if (activeAttack) return { img: ASSETS.mTailRelease, targetH: 220 };
  if (stage.chain && !stage.chain.cut && elapsed >= stage.chain.warn) {
    return { img: ASSETS.mCoilOrb, targetH: 195 };
  }
  if (stage.worldState) return { img: ASSETS.mIdleSword, targetH: 205 };
  return null;
}

function drawBoss(ctx, x, y, counterReady, animTime, stage, elapsed) {
  const bob = Math.sin(animTime * 3.2) * 4;
  ctx.save();
  oval(ctx, x, y, 76, 20, 'rgba(10, 4, 18, 0.72)', counterReady ? '#ffd984' : '#c8287866', 2);

  const motion = pickBossMotionSprite(stage, elapsed, counterReady);
  if (motion && motion.img.complete && motion.img.naturalWidth > 0) {
    const scale = motion.targetH / motion.img.naturalHeight;
    const dw = motion.img.naturalWidth * scale;
    const dh = motion.targetH;
    ctx.save();
    ctx.translate(x, y + bob);
    if (x < 400) ctx.scale(-1, 1);
    ctx.shadowBlur = counterReady ? 30 : 20;
    ctx.shadowColor = counterReady ? '#ffda75' : '#ff1e78';
    ctx.drawImage(motion.img, -dw * 0.5, -dh * 0.88, dw, dh);
    ctx.restore();
  } else if (ASSETS.bossSheet.complete && ASSETS.bossSheet.naturalWidth > 0) {
    const fw = 571;
    const fh = 391;
    const frameIdx = Math.floor(animTime * 10) % 8;
    const scale = 0.56;
    const dw = fw * scale;
    const dh = fh * scale;
    ctx.save();
    ctx.translate(x, y + bob);
    if (x < 400) ctx.scale(-1, 1);
    ctx.shadowBlur = counterReady ? 30 : 18;
    ctx.shadowColor = counterReady ? '#ffda75' : '#ff1e78';
    ctx.drawImage(ASSETS.bossSheet, frameIdx * fw, 0, fw, fh, -dw * 0.56, -dh * 0.9, dw, dh);
    ctx.restore();
  }

  if (counterReady) {
    const pulseR = 88 + Math.sin(animTime * 16) * 8;
    oval(ctx, x, y, pulseR, pulseR * 0.46, 'rgba(255, 208, 100, 0.24)', '#ffe49e', 3);
    // Gold cross-glint
    ctx.save();
    ctx.translate(x, y - 122 + bob);
    ctx.shadowColor = '#ffe49e';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#fff5cc';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(40, 0);
    ctx.moveTo(0, -26);
    ctx.lineTo(0, 26);
    ctx.stroke();
    oval(ctx, 0, 0, 9, 9, '#ffffff', '#ffae00', 2);
    ctx.restore();
    label(ctx, '지금 평타 카운터! (X)', x, y - 166, '#ffe699', 18);
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

  const scale = 0.56;
  const dw = 160 * scale;
  const dh = 150 * scale;

  if (ASSETS.playerSheet.complete && ASSETS.playerSheet.naturalWidth > 0) {
    for (const ghost of afterimages) {
      ctx.save();
      ctx.globalAlpha = ghost.alpha;
      ctx.translate(ghost.x, ghost.y - ghost.z);
      ctx.scale(ghost.facing, 1);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.drawImage(ASSETS.playerSheet, ghost.frame * 160, 0, 160, 150, -66 * scale, -114 * scale, dw, dh);
      ctx.restore();
    }
  }

  const shadowColor = p.backstep > 0 ? '#7efcd2' : p.running ? '#38bdf8' : '#52e8ff66';
  oval(ctx, p.x, p.y, p.running ? 22 : 18, 7, 'rgba(10, 5, 16, 0.75)', shadowColor, p.running || p.backstep > 0 ? 2 : 1.5);

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
    ctx.shadowColor = '#52e8ff';
    ctx.shadowBlur = 16;
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
  const alpha = t < 0.08 ? t / 0.08 : t > 0.88 ? (1 - t) / 0.12 : 1;

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);

  if (cutIn.eclipse) {
    // Actual DNF 960x541 animated cutscene GIF backdrop if loaded
    if (ASSETS.introGif.complete && ASSETS.introGif.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(alpha * 0.55, 0, 1);
      ctx.drawImage(ASSETS.introGif, 0, 0, W, H);
      ctx.restore();
    }
    ctx.fillStyle = `rgba(6, 2, 14, ${0.44 * clamp(alpha, 0, 1)})`;
    ctx.fillRect(0, 0, W, H);

    // Boss drops straight down from top (t=0..0.35) with vertical crimson/black speed streaks
    const descentT = clamp(t / 0.35, 0, 1);
    const bossY = lerp(70, 260, 1 - Math.pow(1 - descentT, 3));

    if (t < 0.42) {
      const streakFade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.07;
      ctx.save();
      ctx.globalAlpha = clamp(streakFade * 0.85, 0, 1);
      for (let i = -5; i <= 5; i++) {
        const sx = 480 + i * 24;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(215, 22, 95, 0.7)' : 'rgba(18, 4, 28, 0.85)';
        ctx.fillRect(sx - 4, 0, 8, bossY + 25);
      }
      if (t >= 0.28) {
        const ringR = lerp(20, 190, (t - 0.28) / 0.14);
        oval(ctx, 480, bossY + 10, ringR, ringR * 0.42, 'rgba(255, 235, 255, 0.22)', 'rgba(255, 160, 220, 0.8)', 4);
      }
      ctx.restore();
    }

    // Pale moon / eclipse in upper-center behind Yurisie
    const moonGrad = ctx.createRadialGradient(480, 145, 18, 480, 145, 118);
    moonGrad.addColorStop(0, 'rgba(220, 212, 230, 0.55)');
    moonGrad.addColorStop(0.65, 'rgba(138, 32, 196, 0.42)');
    moonGrad.addColorStop(1, 'rgba(138, 32, 196, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(480, 145, 118, 0, TAU);
    ctx.fill();

    // Sudden wing/arm spread + swirling purple mist (t >= 0.32)
    if (t >= 0.32) {
      const spreadT = clamp((t - 0.32) / 0.28, 0, 1);
      const wingSpan = lerp(35, 230, 1 - Math.pow(1 - spreadT, 2));
      ctx.save();
      ctx.translate(480, bossY - 40);
      for (const dir of [-1, 1]) {
        const wg = ctx.createLinearGradient(0, 0, dir * wingSpan, -40);
        wg.addColorStop(0, 'rgba(195, 25, 130, 0.78)');
        wg.addColorStop(0.6, 'rgba(105, 16, 150, 0.52)');
        wg.addColorStop(1, 'rgba(30, 4, 60, 0)');
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(dir * wingSpan * 0.55, -80, dir * wingSpan, -20);
        ctx.quadraticCurveTo(dir * wingSpan * 0.65, 40, 0, 24);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if (ASSETS.vortex.complete && ASSETS.vortex.naturalWidth > 0) {
      ctx.save();
      ctx.translate(480, bossY - 14);
      ctx.rotate(animTime * 2.2);
      ctx.globalAlpha = clamp(alpha * 0.58, 0, 1);
      ctx.drawImage(ASSETS.vortex, -110, -110, 220, 220);
      ctx.restore();
    }

    // Symmetrical 6 blades rising/hovering cleanly Left (3) and Right (3) matching reference
    if (t >= 0.45 && ASSETS.blade.complete && ASSETS.blade.naturalWidth > 0) {
      const flyT = clamp((t - 0.45) / 0.45, 0, 1);
      const ease = 1 - Math.pow(1 - flyT, 2);
      const bladeSpecs = [
        // Left 3 (pointing down-left)
        { x0: 360, y0: 250, x1: 85, y1: 110, ang: 2.15 },
        { x0: 380, y0: 260, x1: 170, y1: 155, ang: 2.05 },
        { x0: 400, y0: 270, x1: 255, y1: 200, ang: 1.95 },
        // Right 3 (pointing down-right)
        { x0: 560, y0: 270, x1: 705, y1: 200, ang: 1.19 },
        { x0: 580, y0: 260, x1: 790, y1: 155, ang: 1.09 },
        { x0: 600, y0: 250, x1: 875, y1: 110, ang: 0.99 }
      ];
      for (const b of bladeSpecs) {
        const bx = lerp(b.x0, b.x1, ease);
        const by = lerp(b.y0, b.y1, ease);
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(b.ang);
        ctx.shadowColor = '#d938ff';
        ctx.shadowBlur = 18;
        ctx.drawImage(ASSETS.blade, -110, -29, 220, 58);
        ctx.restore();
      }
    }
  }

  // Centered glowing boss quote matching screenshots ("이제, 또렷이 보이는가" -> "네 역사의 끝을 목도하라")
  const activeQuote = t < 0.55 ? '이제, 또렷이 보이는가' : cutIn.quote;
  label(ctx, activeQuote, W / 2, 232, '#ffd6ea', 20);
  ctx.restore();
}

function drawAmbientParticles(ctx, animTime, isDeath) {
  ctx.save();
  for (const pt of ambientParticles) {
    const px = ((pt.x + animTime * pt.vx) % W + W) % W;
    const py = ((pt.y + animTime * pt.vy) % H + H) % H;
    const a = 0.25 + 0.2 * Math.sin(animTime * 3 + pt.phase);
    ctx.fillStyle = isDeath ? `rgba(255, 85, 155, ${a})` : `rgba(120, 230, 255, ${a})`;
    ctx.beginPath();
    ctx.arc(px, py, pt.size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function renderFrame(ctx, state) {
  const { stage, elapsed, animTime, screenShake, feedbackText, feedbackTimer, godMode } = state;

  ctx.save();
  if (state.deathFlash > 0 || (!state.active && state.maxHits > 0 && state.totalHits >= state.maxHits)) {
    ctx.filter = 'grayscale(85%) brightness(0.62)';
  }
  if (screenShake > 0) {
    const mag = screenShake * 18;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }

  // Camera zoom-in (gather) -> dramatic zoom-out (spread & blade eruption) during 3:35 intro
  if (stage.introCutIn?.eclipse && elapsed < stage.introCutIn.duration) {
    const t = elapsed / stage.introCutIn.duration;
    let zoom = 1.0;
    if (t < 0.45) {
      zoom = lerp(1.0, 1.24, Math.sin((t / 0.45) * (Math.PI / 2)));
    } else if (t < 0.78) {
      zoom = lerp(1.24, 0.94, (t - 0.45) / 0.33);
    } else {
      zoom = lerp(0.94, 1.0, (t - 0.78) / 0.22);
    }
    ctx.translate(480, 250);
    ctx.scale(zoom, zoom);
    ctx.translate(-480, -250);
  }

  ctx.fillStyle = '#07030d';
  ctx.fillRect(0, 0, W, H);
  const bg = stage.worldState ? ASSETS.arenaDeath : ASSETS.arenaLife;
  if (bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, W, H);
  }

  drawAmbientParticles(ctx, animTime, Boolean(stage.worldState));

  const envState = getEnvelopeState(stage.envelope, elapsed, stage.chain?.cut);
  drawEnvelope(ctx, envState, animTime);
  drawAttacks(ctx, stage, elapsed, animTime);
  drawChainAndFlower(ctx, stage, elapsed, animTime, state.p);
  drawIntroCutIn(ctx, stage.introCutIn, elapsed, animTime);

  const bossPos = stage.counter && elapsed >= stage.counter.appearAt
    ? stage.counter.point
    : stage.introCutIn?.eclipse && elapsed < stage.introCutIn.duration
      ? [480, lerp(115, 248, 1 - Math.pow(1 - clamp(elapsed / (stage.introCutIn.duration * 0.35), 0, 1), 3))]
      : [480, 290];
  const counterReady = Boolean(stage.counter && elapsed >= stage.counter.readyAt && !stage.counter.hit);
  drawBoss(ctx, bossPos[0], bossPos[1], counterReady, animTime, stage, elapsed);

  drawPlayer(ctx, state);

  if (godMode) {
    label(ctx, '무적 연습 모드', 86, 26, '#69f0ae', 13);
  }

  if (feedbackTimer > 0 && feedbackText) {
    label(ctx, feedbackText, W / 2, 74, '#ffe699', 18);
  }

  if (state.deathFlash > 0) {
    ctx.filter = 'none';
    ctx.fillStyle = `rgba(12, 4, 18, ${0.48 * state.deathFlash})`;
    ctx.fillRect(0, 0, W, H);
    label(ctx, '사망 (HP 0)', W / 2, H / 2 - 22, '#ff6b94', 28);
    label(ctx, '1구간부터 다시 시작합니다', W / 2, H / 2 + 12, '#f5d89a', 15);
  }

  ctx.restore();
}

window.Yurisie.BOUNDS = BOUNDS;
window.Yurisie.CENTER = CENTER;
window.Yurisie.getEnvelopeState = getEnvelopeState;
window.Yurisie.renderFrame = renderFrame;
})();
