// ============================================================================
// 각인된 악몽 2페이즈 - 유리지에 : "역사의 끝 (역사 칼날 패턴)"
// 레퍼런스 영상 (https://youtu.be/zNIaDY_8Ksc, 1158x720 60fps) 1:1 패턴·보스 연출 렌더러
// ============================================================================
(() => {
'use strict';
window.Yurisie = window.Yurisie || {};

const CONFIG = {
  WIDTH: 1158,
  HEIGHT: 720,
  CENTER: [579, 465],
  BOSS_ANCHOR: [579, 228],
  BOUNDS: {
    left: -210,
    right: 1330,
    top: 295,
    bottom: 650
  },
  CAMERA_MAX_OFFSET: 420,
  CAMERA_LERP: 9.0,
  TAU: Math.PI * 2
};

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const ASSETS = {
  stageBg: loadImage('assets/arena_life.png'),
  arenaLife: loadImage('assets/arena_life.png'),
  arenaDeath: loadImage('assets/arena_death.png'),
  bossIllust: loadImage('assets/boss_illust.webp'),
  bossSheet: loadImage('assets/boss_sheet.png'),
  iconYurisie: loadImage('assets/icon_2740.png'),
  iconLargo: loadImage('assets/icon_2344.png'),
  iconDisaster: loadImage('assets/icon_2739.png'),
  iconFlowerBlue: loadImage('assets/icon_2570.png'),
  iconFlowerRed: loadImage('assets/icon_2571.png'),
  playerSheet: loadImage('assets/player_sheet.png'),
  yurisCloneSheet: loadImage('assets/yuris_clone_sheet.png'),
  largoSheet: loadImage('assets/largo_sheet.png'),
  largoCutinSheet: loadImage('assets/largo_cutin_sheet.png'),
  flowerBlue: loadImage('assets/obj_flower_blue.png'),
  flowerRed: loadImage('assets/obj_flower_red.png'),
  vortex: loadImage('assets/obj_vortex.png'),
  meteor: loadImage('assets/obj_meteor.png'),
  blade: loadImage('assets/obj_blade.png'),
  chain: loadImage('assets/obj_chain.png'),
  shackle: loadImage('assets/obj_shackle.png'),
  motions: {
    idleWings: loadImage('assets/yurisie_motions/motion_idle_sword.png'),
    roarBurst: loadImage('assets/yurisie_motions/motion_tail_release.png'),
    spreadClaws: loadImage('assets/yurisie_motions/motion_spread_claws.png'),
    introClaws: loadImage('assets/yurisie_motions/motion_intro_claws.png'),
    twinCast: loadImage('assets/yurisie_motions/motion_dive_slash.png'),
    crossGuard: loadImage('assets/yurisie_motions/motion_spin_slash.png'),
    coilOrb: loadImage('assets/yurisie_motions/motion_coil_orb.png'),
    lowDash: loadImage('assets/yurisie_motions/motion_low_dash.png'),
    swordStance: loadImage('assets/yurisie_motions/motion_sword_stance.png')
  }
};

function isReady(img) {
  return Boolean(img && img.complete && img.naturalWidth > 0);
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);

function getEnvelopeCenter(env, elapsed) {
  if (!env) return [...CONFIG.CENTER];
  const ratio = env.moveEndTime ? clamp(elapsed / env.moveEndTime, 0, 1) : 1;
  return [lerp(env.from[0], env.to[0], ratio), lerp(env.from[1], env.to[1], ratio)];
}

function getEnvelopeRadius(env, elapsed) {
  if (!env) return 235;
  if (
    env.constrictStartTime !== undefined &&
    env.constrictEndTime !== undefined &&
    elapsed >= env.constrictStartTime
  ) {
    const u = clamp(
      (elapsed - env.constrictStartTime) /
        Math.max(0.05, env.constrictEndTime - env.constrictStartTime),
      0,
      1
    );
    return lerp(env.radius, env.constrictTargetRadius ?? 42, u);
  }
  return env.radius;
}

function getSwordWheelPos(wheel, elapsed) {
  if (!wheel || !wheel.keyframes || !wheel.keyframes.length) return null;
  const kf = wheel.keyframes;
  if (elapsed <= kf[0].t) return [...kf[0].pos];
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i];
    const b = kf[i + 1];
    if (elapsed >= a.t && elapsed <= b.t) {
      const u = (elapsed - a.t) / Math.max(0.001, b.t - a.t);
      return [lerp(a.pos[0], b.pos[0], u), lerp(a.pos[1], b.pos[1], u)];
    }
  }
  return [...kf[kf.length - 1].pos];
}

function getActiveBossMotionState(stage, elapsed) {
  let motion = (stage && stage.bossMotion) || 'spreadClaws';
  let stepStartTime = 0;
  let burst = false;
  if (stage && Array.isArray(stage.bossTimeline)) {
    for (const item of stage.bossTimeline) {
      if (elapsed >= item.t) {
        motion = item.motion;
        stepStartTime = item.t;
        burst = Boolean(item.burst);
      }
    }
  }
  return {
    motion,
    sinceSwitch: Math.max(0, elapsed - stepStartTime),
    burst
  };
}

// ----------------------------------------------------------------------------
// 천본앵 암홍색 대검 (Ornate Dark-Crimson Sword) 1:1 렌더러 (isGray=true 시 회색 무력화 칼날)
// ----------------------------------------------------------------------------
function drawOrnateCrimsonSword(
  ctx,
  x,
  y,
  angle,
  length = 220,
  alpha = 0.96,
  withRibbon = true,
  isGray = false
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);

  const bladeLen = length * 0.74;
  const guardX = -bladeLen;
  const pommelX = -length;

  if (withRibbon) {
    const ribGrad = ctx.createLinearGradient(0, 0, -length * 1.15, 0);
    if (isGray) {
      ribGrad.addColorStop(0, 'rgba(203, 213, 225, 0.14)');
      ribGrad.addColorStop(0.55, 'rgba(148, 163, 184, 0.36)');
      ribGrad.addColorStop(1, 'rgba(100, 116, 139, 0)');
    } else {
      ribGrad.addColorStop(0, 'rgba(216, 180, 254, 0.12)');
      ribGrad.addColorStop(0.55, 'rgba(192, 132, 252, 0.42)');
      ribGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
    }
    ctx.fillStyle = ribGrad;
    ctx.fillRect(-length * 1.12, -13, length * 0.95, 5);
    ctx.fillRect(-length * 1.12, 8, length * 0.95, 5);
  }

  ctx.fillStyle = isGray ? '#94a3b8' : '#ff1744';
  ctx.shadowColor = isGray ? '#64748b' : '#ff1744';
  ctx.shadowBlur = isGray ? 4 : 10;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(-24, -8.5);
  ctx.lineTo(guardX, -7.5);
  ctx.lineTo(guardX, 7.5);
  ctx.lineTo(-24, 8.5);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = isGray ? '#334155' : '#0d0612';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-24, -5.5);
  ctx.lineTo(guardX + 2, -5.0);
  ctx.lineTo(guardX + 2, 5.0);
  ctx.lineTo(-24, 5.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = isGray ? 'rgba(203, 213, 225, 0.65)' : 'rgba(255, 42, 95, 0.78)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(guardX + 8, 0);
  ctx.stroke();

  ctx.fillStyle = isGray ? '#475569' : '#1f0d29';
  ctx.strokeStyle = isGray ? '#cbd5e1' : '#ff2a75';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(guardX + 6, -21);
  ctx.lineTo(guardX - 4, -8);
  ctx.lineTo(guardX - 8, 0);
  ctx.lineTo(guardX - 4, 8);
  ctx.lineTo(guardX + 6, 21);
  ctx.lineTo(guardX - 10, 14);
  ctx.lineTo(guardX - 10, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isGray ? '#cbd5e1' : '#f472b6';
  const gems = [
    [guardX + 2, -16],
    [guardX - 8, -12],
    [guardX + 2, 16],
    [guardX - 8, 12]
  ];
  for (const [gx, gy] of gems) {
    ctx.beginPath();
    ctx.arc(gx, gy, 2.6, 0, CONFIG.TAU);
    ctx.fill();
  }

  ctx.fillStyle = isGray ? '#334155' : '#180920';
  ctx.strokeStyle = isGray ? '#94a3b8' : '#e11d48';
  ctx.lineWidth = 1.4;
  ctx.fillRect(pommelX + 8, -3.5, Math.max(8, guardX - pommelX - 12), 7);
  ctx.strokeRect(pommelX + 8, -3.5, Math.max(8, guardX - pommelX - 12), 7);

  ctx.fillStyle = isGray ? '#94a3b8' : '#ff1744';
  ctx.beginPath();
  ctx.moveTo(pommelX, 0);
  ctx.lineTo(pommelX + 8, -5.5);
  ctx.lineTo(pommelX + 12, 0);
  ctx.lineTo(pommelX + 8, 5.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawScrollingArena(ctx, sim) {
  const W = CONFIG.WIDTH;
  const H = CONFIG.HEIGHT;
  const camX = sim.cameraX;

  const bgImg = sim.worldDeath
    ? isReady(ASSETS.arenaDeath)
      ? ASSETS.arenaDeath
      : ASSETS.stageBg
    : isReady(ASSETS.arenaLife)
    ? ASSETS.arenaLife
    : ASSETS.stageBg;

  if (isReady(bgImg)) {
    const skyOffset = -camX * 0.32;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, 225);
    ctx.clip();
    ctx.drawImage(bgImg, skyOffset - 220, 0, W + 440, H);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 210, W, H - 210);
    ctx.clip();
    const tileW = 1280;
    const baseScreenX = -camX - 60;
    ctx.drawImage(bgImg, baseScreenX, 0, tileW, H);

    ctx.save();
    ctx.translate(baseScreenX, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(bgImg, 0, 0, tileW, H);
    ctx.restore();

    ctx.save();
    ctx.translate(baseScreenX + tileW * 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(bgImg, 0, 0, tileW, H);
    ctx.restore();
    ctx.restore();
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1e1b24');
    grad.addColorStop(0.32, '#5c5468');
    grad.addColorStop(1, '#2a2232');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  if (sim.worldDeath) {
    const deathOverlay = ctx.createLinearGradient(0, 160, 0, H);
    deathOverlay.addColorStop(0, 'rgba(72, 16, 98, 0.25)');
    deathOverlay.addColorStop(0.45, 'rgba(104, 24, 135, 0.44)');
    deathOverlay.addColorStop(1, 'rgba(48, 10, 68, 0.58)');
    ctx.fillStyle = deathOverlay;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.save();
  ctx.translate(-camX, 0);
  const leftWallGrad = ctx.createLinearGradient(-420, 0, -210, 0);
  leftWallGrad.addColorStop(0, 'rgba(12, 6, 18, 0.55)');
  leftWallGrad.addColorStop(1, 'rgba(12, 6, 18, 0)');
  ctx.fillStyle = leftWallGrad;
  ctx.fillRect(-420, 0, 210, H);

  const rightWallGrad = ctx.createLinearGradient(1330, 0, 1540, 0);
  rightWallGrad.addColorStop(0, 'rgba(12, 6, 18, 0)');
  rightWallGrad.addColorStop(1, 'rgba(12, 6, 18, 0.55)');
  ctx.fillStyle = rightWallGrad;
  ctx.fillRect(1330, 0, 210, H);
  ctx.restore();

  const vigTop = ctx.createLinearGradient(0, 0, 0, 42);
  vigTop.addColorStop(0, 'rgba(28, 4, 18, 0.88)');
  vigTop.addColorStop(1, 'rgba(28, 4, 18, 0)');
  ctx.fillStyle = vigTop;
  ctx.fillRect(0, 0, W, 42);

  const vigBot = ctx.createLinearGradient(0, H - 38, 0, H);
  vigBot.addColorStop(0, 'rgba(28, 4, 18, 0)');
  vigBot.addColorStop(1, 'rgba(28, 4, 18, 0.88)');
  ctx.fillStyle = vigBot;
  ctx.fillRect(0, H - 38, W, 38);
}

function drawIntroBannerText(ctx, text, alpha) {
  const W = CONFIG.WIDTH;
  const y = 398;
  ctx.save();
  ctx.globalAlpha = alpha;
  const barGrad = ctx.createLinearGradient(W * 0.2, y - 24, W * 0.8, y - 24);
  barGrad.addColorStop(0, 'rgba(10, 4, 18, 0)');
  barGrad.addColorStop(0.25, 'rgba(18, 6, 28, 0.86)');
  barGrad.addColorStop(0.75, 'rgba(18, 6, 28, 0.86)');
  barGrad.addColorStop(1, 'rgba(10, 4, 18, 0)');
  ctx.fillStyle = barGrad;
  ctx.fillRect(W * 0.18, y - 28, W * 0.64, 48);

  ctx.strokeStyle = 'rgba(244, 114, 182, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.25, y - 28);
  ctx.lineTo(W * 0.75, y - 28);
  ctx.moveTo(W * 0.25, y + 20);
  ctx.lineTo(W * 0.75, y + 20);
  ctx.stroke();

  ctx.fillStyle = '#fdf2f8';
  ctx.shadowColor = '#e11d48';
  ctx.shadowBlur = 12;
  ctx.font = '700 22px "Malgun Gothic", "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, y + 3);
  ctx.restore();
}

function drawFullIntroSequence(ctx, sim) {
  const W = CONFIG.WIDTH;
  const H = CONFIG.HEIGHT;
  const t = sim.elapsed;
  const cx = CONFIG.CENTER[0] - sim.cameraX;
  const cy = 355;
  const META = window.Yurisie.HISTORY_META;

  ctx.save();
  if (t < 1.45) {
    // 0.00s ~ 1.45s: 양팔을 크게 벌린 유리지에 강림 + 고속 회전 보라 충격파 링 ("이제, 또렷이 보이는가")
    ctx.fillStyle = 'rgba(12, 4, 20, 0.54)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) {
      const r = 135 + i * 58 + Math.sin(t * 9 + i) * 12;
      ctx.save();
      ctx.translate(cx, cy + 30);
      ctx.scale(1.42, 0.68);
      ctx.rotate(t * (i % 2 === 0 ? 3.4 : -2.8) + i);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(217, 70, 239, 0.82)' : 'rgba(20, 6, 32, 0.94)';
      ctx.lineWidth = 26 - i * 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 1.65);
      ctx.stroke();
      ctx.restore();
    }
    const introSprite = isReady(ASSETS.motions.spreadClaws)
      ? ASSETS.motions.spreadClaws
      : ASSETS.motions.coilOrb;
    if (isReady(introSprite)) {
      ctx.drawImage(introSprite, cx - 375, 70, 750, 430);
    }
    drawIntroBannerText(ctx, META.quoteIntro1, clamp(t / 0.22, 0, 1));
  } else {
    // 1.45s ~ 3.10s: 붉은 일식 달 + 양팔 벌린 유리지에 + 좌우 6자루 천본앵 검 고속 발사 ("네 역사의 끝을 목도하라")
    const subT = t - 1.45;
    ctx.fillStyle = 'rgba(18, 4, 24, 0.58)';
    ctx.fillRect(0, 0, W, H);

    const moonY = 120;
    const moonGrad = ctx.createRadialGradient(cx, moonY, 15, cx, moonY, 115);
    moonGrad.addColorStop(0, 'rgba(35, 5, 18, 0.98)');
    moonGrad.addColorStop(0.55, 'rgba(225, 22, 75, 0.88)');
    moonGrad.addColorStop(1, 'rgba(225, 22, 75, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, moonY, 115, 0, CONFIG.TAU);
    ctx.fill();

    if (isReady(ASSETS.motions.spreadClaws)) {
      ctx.drawImage(ASSETS.motions.spreadClaws, cx - 380, 52, 760, 440);
    }

    const launchOffset = subT > 0.65 ? Math.pow((subT - 0.65) * 42, 2) : 0;
    const swordOffsets = [
      { dx: -260, dy: 10, ang: -0.55 },
      { dx: -185, dy: 55, ang: -0.52 },
      { dx: -110, dy: 95, ang: -0.48 },
      { dx: 110, dy: 95, ang: 0.48 },
      { dx: 185, dy: 55, ang: 0.52 },
      { dx: 260, dy: 10, ang: 0.55 }
    ];
    for (const s of swordOffsets) {
      const sx = cx + s.dx + Math.sin(s.ang) * launchOffset;
      const sy = 240 + s.dy - Math.cos(s.ang) * launchOffset;
      drawOrnateCrimsonSword(ctx, sx, sy, s.ang - Math.PI / 2, 195, 0.96, true);
    }

    drawIntroBannerText(ctx, META.quoteIntro2, clamp(subT / 0.22, 0, 1));
  }
  ctx.restore();
}

function drawGrayCircleZone(ctx, sim, zone) {
  if (sim.elapsed < zone.startTime || sim.elapsed > zone.endTime) return;
  const [cx, cy] = zone.center;
  const r = zone.radius;

  ctx.save();
  ctx.fillStyle = 'rgba(92, 18, 128, 0.38)';
  ctx.beginPath();
  ctx.rect(-900, 210, 3200, 510);
  ctx.arc(cx, cy, r, 0, CONFIG.TAU, true);
  ctx.fill();

  const innerGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, r);
  innerGrad.addColorStop(0, 'rgba(130, 136, 148, 0.44)');
  innerGrad.addColorStop(0.78, 'rgba(72, 78, 92, 0.54)');
  innerGrad.addColorStop(1, 'rgba(35, 38, 48, 0.68)');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, CONFIG.TAU);
  ctx.fill();

  ctx.strokeStyle = '#ff1e78';
  ctx.shadowColor = '#ff1e78';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, CONFIG.TAU);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 180, 220, 0.65)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 6, 0, CONFIG.TAU);
  ctx.stroke();
  ctx.restore();
}

function drawAmbientBackgroundSwords(ctx, sim, denseCorridor) {
  const startX = -320;
  const endX = 1480;
  const stepX = denseCorridor ? 195 : 235;
  const speed = (sim.stage && sim.stage.swordScrollSpeed) || 145;
  const scrollX = (((sim.animTime * speed) % stepX) + stepX) % stepX;
  // 생명의 세계로 복귀한 경우(죽음의 세계 소속 상단 칼날들) 회색 잔상으로 비활성화!
  const isGray = denseCorridor && !sim.worldDeath;

  for (let baseX = startX; baseX <= endX; baseX += stepX) {
    const x = baseX + scrollX;
    const bob = Math.sin(sim.animTime * 2.5 + baseX * 0.01) * 7;
    drawOrnateCrimsonSword(
      ctx,
      x,
      405 + bob,
      Math.PI / 2,
      220,
      isGray ? 0.42 : denseCorridor ? 0.88 : 0.56,
      true,
      isGray
    );

    if (denseCorridor) {
      const botX = baseX + (stepX - scrollX);
      drawOrnateCrimsonSword(
        ctx,
        botX + 95,
        645 - bob * 0.5,
        -Math.PI / 2,
        130,
        isGray ? 0.38 : 0.78,
        false,
        isGray
      );
    }
  }
}

// ----------------------------------------------------------------------------
// 보스 유리지에 본체 및 역동적 스킬 시전 모션·검기 방출 연출
// ----------------------------------------------------------------------------
function drawYurisieBoss(ctx, sim) {
  const [bx, by] = sim.bossPos;
  const { motion: motionKey, sinceSwitch, burst } = getActiveBossMotionState(
    sim.stage,
    sim.elapsed
  );

  // 모션 전환 직후 역동적인 스케일 펀치 및 호흡 바운스
  const punch = burst && sinceSwitch < 0.45 ? Math.sin((sinceSwitch / 0.45) * Math.PI) * 0.09 : 0;
  const bob = Math.sin(sim.animTime * 3.1) * 8;
  const swayX = Math.cos(sim.animTime * 1.9) * 5;

  ctx.save();

  // 8구간 흑태양(Black Sun) 연출 (45.15s ~ 47.0s)
  if (sim.stage && sim.stage.id === 8 && sim.elapsed >= 3.1 && sim.elapsed <= 5.4) {
    const sunY = by - 95;
    const sunGrad = ctx.createRadialGradient(bx, sunY, 18, bx, sunY, 92);
    sunGrad.addColorStop(0, '#07020c');
    sunGrad.addColorStop(0.65, '#190526');
    sunGrad.addColorStop(0.85, 'rgba(225, 29, 72, 0.88)');
    sunGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(bx, sunY, 92, 0, CONFIG.TAU);
    ctx.fill();
  }

  // 1. 보스 등 뒤에서 끊임없이 꿈틀대는 암흑-진홍 마력 촉수/날개 파동
  const auraR = 290 * (1 + punch);
  const aura = ctx.createRadialGradient(bx, by + 10, 20, bx, by + 10, auraR);
  aura.addColorStop(0, 'rgba(235, 25, 75, 0.55)');
  aura.addColorStop(0.45, 'rgba(155, 35, 225, 0.32)');
  aura.addColorStop(1, 'rgba(88, 28, 135, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(bx, by + 10, auraR, 0, CONFIG.TAU);
  ctx.fill();

  // 2. 보스 모션 전환(검기 시전/방출) 시 뻗어나가는 방사형 분홍-진홍 검기 파동 (원작 9.2s, 12.6s, 35.2s, 48.0s 연출)
  if (burst && sinceSwitch < 0.55) {
    const u = sinceSwitch / 0.55;
    const fade = 1 - u;
    ctx.save();
    ctx.translate(bx, by + 15);
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * CONFIG.TAU + u * 0.4;
      const r1 = 45 + u * 90;
      const r2 = 160 + u * 340;
      ctx.strokeStyle = i % 2 === 0
        ? `rgba(255, 75, 165, ${0.72 * fade})`
        : `rgba(255, 210, 240, ${0.55 * fade})`;
      ctx.lineWidth = i % 2 === 0 ? 7 * fade : 3.5 * fade;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1 * 0.75);
      ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2 * 0.75);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. 현재 시전 동작에 따른 메인 보스(양팔 벌린 유리지에 본체) 렌더링 + 시전 시 확장 잔상
  const sprite = ASSETS.motions[motionKey] || ASSETS.motions.spreadClaws;
  if (isReady(sprite)) {
    ctx.save();
    ctx.translate(bx + swayX, by + bob);

    if (motionKey === 'swordStance') {
      ctx.scale(1 + punch, 1 + punch);
      const w = 450;
      const h = 365;
      ctx.drawImage(sprite, -w * 0.45, -h * 0.58, w, h);
    } else {
      // 양팔을 좌우로 크게 벌린 유리지에 본체 (760 x 445px)
      const w = 760;
      const h = 445;
      if (burst && sinceSwitch < 0.42) {
        const ghostScale = 1.04 + (sinceSwitch / 0.42) * 0.16;
        ctx.save();
        ctx.globalAlpha = (1 - sinceSwitch / 0.42) * 0.45;
        ctx.scale(ghostScale, ghostScale);
        ctx.drawImage(sprite, -w * 0.47, -h * 0.42, w, h);
        ctx.restore();
      }
      if (sim.bossHitFlash > 0) {
        ctx.filter = 'brightness(1.65) contrast(1.2)';
      }
      ctx.scale(1 + punch, 1 + punch);
      ctx.drawImage(sprite, -w * 0.47, -h * 0.42, w, h);
    }
    ctx.restore();
  }

  ctx.restore();
}

function draw36SwordRing(ctx, sim, env) {
  if (env.fadeOutAfter && sim.elapsed > env.fadeOutAfter + 0.5) return;
  const [cx, cy] = getEnvelopeCenter(env, sim.elapsed);
  const innerR = getEnvelopeRadius(env, sim.elapsed);
  const swordCount = 36;
  const rotBase = sim.animTime * 0.38;

  // 생명의 꽃(푸른 꽃)을 먹어 죽음의 세계(worldDeath=true)로 넘어간 순간,
  // 중앙으로 조여오던 36검이 즉시 회색(isGray=true)으로 변하며 피격 판정이 완전히 사라짐! (seg2_05 23.2s~24.8s 고증)
  const isGray = Boolean(env.belongsToLifeWorld && sim.worldDeath);
  let alpha = isGray ? 0.62 : 0.94;
  if (env.fadeOutAfter && sim.elapsed > env.fadeOutAfter) {
    alpha *= clamp(1 - (sim.elapsed - env.fadeOutAfter) / 0.5, 0, 1);
  }

  ctx.save();
  if (isGray && innerR < 95) {
    // 중앙으로 수축된 회색 칼날 중심부 어두운 잔상 코어 (seg2_05 23.6s~24.4s 1:1 재현)
    const coreGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, innerR + 95);
    coreGrad.addColorStop(0, `rgba(12, 14, 22, ${0.82 * alpha})`);
    coreGrad.addColorStop(0.5, `rgba(100, 116, 139, ${0.38 * alpha})`);
    coreGrad.addColorStop(1, 'rgba(100, 116, 139, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR + 95, 0, CONFIG.TAU);
    ctx.fill();
  } else if (!isGray) {
    ctx.strokeStyle = 'rgba(255, 35, 105, 0.55)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, CONFIG.TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (let i = 0; i < swordCount; i++) {
    const theta = rotBase + (i / swordCount) * CONFIG.TAU;
    const tipX = cx + Math.cos(theta) * innerR;
    const tipY = cy + Math.sin(theta) * innerR;
    drawOrnateCrimsonSword(ctx, tipX, tipY, theta + Math.PI, 210, alpha, true, isGray);
  }
  ctx.restore();
}

function draw12SpokeSwordWheel(ctx, sim, wheel) {
  const pos = getSwordWheelPos(wheel, sim.elapsed);
  if (!pos) return;
  const [wx, wy] = pos;
  const spokeLen = wheel.spokeLength || 215;
  const hubR = 34;
  const rot = -sim.animTime * 2.35;
  const isGray = Boolean(wheel.belongsToLifeWorld && sim.worldDeath);

  ctx.save();
  const hubGrad = ctx.createRadialGradient(wx, wy, 6, wx, wy, hubR * 2.4);
  if (isGray) {
    hubGrad.addColorStop(0, 'rgba(30, 41, 59, 0.75)');
    hubGrad.addColorStop(0.45, 'rgba(148, 163, 184, 0.45)');
    hubGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
  } else {
    hubGrad.addColorStop(0, 'rgba(20, 4, 28, 0.96)');
    hubGrad.addColorStop(0.45, 'rgba(225, 29, 72, 0.72)');
    hubGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
  }
  ctx.fillStyle = hubGrad;
  ctx.beginPath();
  ctx.arc(wx, wy, hubR * 2.4, 0, CONFIG.TAU);
  ctx.fill();

  const numSpokes = 12;
  for (let i = 0; i < numSpokes; i++) {
    const ang = rot + (i / numSpokes) * CONFIG.TAU;
    const tipX = wx + Math.cos(ang) * (hubR + spokeLen);
    const tipY = wy + Math.sin(ang) * (hubR + spokeLen);
    drawOrnateCrimsonSword(
      ctx,
      tipX,
      tipY,
      ang,
      spokeLen,
      isGray ? 0.55 : 0.96,
      true,
      isGray
    );
  }
  ctx.restore();
}

function drawAttacks(ctx, sim, layer = 'all') {
  const floorKinds = new Set(['red_band', 'red_giant_circle', 'outer_purple_explosion', 'ground_quake']);
  for (const attack of sim.stage.attacks) {
    const isFloor = floorKinds.has(attack.kind);
    if (layer === 'floor' && !isFloor) continue;
    if (layer === 'air' && isFloor) continue;

    const spawnTime = attack.spawnTime ?? 0;
    if (sim.elapsed < spawnTime) continue;

    const postFire = sim.elapsed - attack.fireTime;
    if (postFire > 0.52) continue;

    const duration = Math.max(0.05, attack.fireTime - spawnTime);
    const ratio = clamp((sim.elapsed - spawnTime) / duration, 0, 1);

    if (attack.kind === 'red_band') {
      // 원작 seg1_00 (7.0s ~ 9.0s) & qIGrxCMfhok (20:01~20:03) 1:1 고증: 고속 슬라이드 전개 + 초대형 진홍색 장판
      const sweepIn = clamp((sim.elapsed - spawnTime) / 0.18, 0.15, 1);
      const len = (attack.length || 2500) * sweepIn;
      const w = attack.width || 275;
      ctx.save();
      ctx.translate(attack.point[0], attack.point[1]);
      ctx.rotate(attack.angle);

      if (postFire < 0) {
        const bandGrad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
        bandGrad.addColorStop(0, 'rgba(238, 26, 34, 0.78)');
        bandGrad.addColorStop(0.5, 'rgba(215, 18, 26, 0.70)');
        bandGrad.addColorStop(1, 'rgba(238, 26, 34, 0.78)');
        ctx.fillStyle = bandGrad;
        ctx.fillRect(-len / 2, -w / 2, len, w);

        ctx.fillStyle = `rgba(255, 55, 65, ${0.18 + ratio * 0.25})`;
        ctx.fillRect(-len / 2, -w * ratio * 0.5, len, w * ratio);

        ctx.strokeStyle = 'rgba(255, 215, 220, 0.94)';
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-len / 2, -w / 2);
        ctx.lineTo(len / 2, -w / 2);
        ctx.moveTo(-len / 2, w / 2);
        ctx.lineTo(len / 2, w / 2);
        ctx.stroke();
      } else {
        const fade = 1 - postFire / 0.52;
        ctx.fillStyle = `rgba(18, 3, 14, ${0.95 * fade})`;
        ctx.fillRect(-len / 2, -w * 0.36, len, w * 0.72);

        ctx.strokeStyle = `rgba(255, 35, 95, ${0.96 * fade})`;
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 6.5 * fade;
        ctx.beginPath();
        ctx.moveTo(-len / 2, -w * 0.36);
        ctx.lineTo(len / 2, -w * 0.36);
        ctx.moveTo(-len / 2, w * 0.36);
        ctx.lineTo(len / 2, w * 0.36);
        ctx.stroke();
      }
      ctx.restore();
    } else if (attack.kind === 'black_slash') {
      const snapOpen = clamp((sim.elapsed - spawnTime) / 0.15, 0.2, 1);
      const len = attack.length || 2300;
      const w = (attack.width || 72) * snapOpen;
      ctx.save();
      ctx.translate(attack.point[0], attack.point[1]);
      ctx.rotate(attack.angle);
      if (postFire < 0) {
        const outerGrad = ctx.createLinearGradient(0, -w * 0.85, 0, w * 0.85);
        outerGrad.addColorStop(0, 'rgba(255, 20, 80, 0)');
        outerGrad.addColorStop(0.2, 'rgba(255, 25, 85, 0.94)');
        outerGrad.addColorStop(0.5, 'rgba(12, 2, 10, 0.98)');
        outerGrad.addColorStop(0.8, 'rgba(255, 25, 85, 0.94)');
        outerGrad.addColorStop(1, 'rgba(255, 20, 80, 0)');
        ctx.fillStyle = outerGrad;
        ctx.fillRect(-len / 2, -w * 0.85, len, w * 1.7);

        ctx.fillStyle = '#0a0208';
        ctx.fillRect(-len / 2, -w * 0.44, len, w * 0.88);

        ctx.strokeStyle = 'rgba(195, 22, 65, 0.62)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([32, 18]);
        ctx.beginPath();
        ctx.moveTo(-len / 2, -w * 0.15);
        ctx.lineTo(len / 2, -w * 0.15);
        ctx.moveTo(-len / 2, w * 0.17);
        ctx.lineTo(len / 2, w * 0.17);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#fecdd3';
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(-len / 2, -w * 0.45);
        ctx.lineTo(len / 2, -w * 0.45);
        ctx.moveTo(-len / 2, w * 0.45);
        ctx.lineTo(len / 2, w * 0.45);
        ctx.stroke();
      } else {
        const fade = 1 - postFire / 0.52;
        ctx.fillStyle = `rgba(255, 30, 125, ${0.9 * fade})`;
        ctx.shadowColor = '#ff1e8a';
        ctx.shadowBlur = 24;
        ctx.fillRect(-len / 2, -w * 0.74, len, w * 1.48);
        ctx.fillStyle = `rgba(255, 245, 252, ${0.98 * fade})`;
        ctx.fillRect(-len / 2, -w * 0.3, len, w * 0.6);
      }
      ctx.restore();
    } else if (attack.kind === 'purple_pillar') {
      // 상단 칼날의 좌우 이동과 함께 기둥 예고가 fromX -> x로 미끄러지듯 이동한 뒤 고정·폭발!
      const moveU = attack.fromX !== undefined ? clamp(ratio / 0.82, 0, 1) : 1;
      const x = attack.fromX !== undefined ? lerp(attack.fromX, attack.x, moveU) : attack.x;
      const w = attack.width || 175;
      const H = CONFIG.HEIGHT;
      const dropU = clamp((sim.elapsed - spawnTime) / 0.22, 0, 1);
      const swordY = lerp(80, 425, dropU);
      const swordAng = attack.swordAngle || Math.PI / 2;
      ctx.save();
      if (postFire < 0) {
        const colGrad = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
        colGrad.addColorStop(0, 'rgba(236, 72, 153, 0.58)');
        colGrad.addColorStop(0.15, `rgba(147, 51, 234, ${0.26 + ratio * 0.24})`);
        colGrad.addColorStop(0.5, `rgba(126, 34, 206, ${0.20 + ratio * 0.22})`);
        colGrad.addColorStop(0.85, `rgba(147, 51, 234, ${0.26 + ratio * 0.24})`);
        colGrad.addColorStop(1, 'rgba(236, 72, 153, 0.58)');
        ctx.fillStyle = colGrad;
        ctx.fillRect(x - w / 2, 0, w, H);

        drawOrnateCrimsonSword(ctx, x, swordY, swordAng, 235, 0.94, true);

        ctx.strokeStyle = '#f9a8d4';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(x - w / 2, 0);
        ctx.lineTo(x - w / 2, H);
        ctx.moveTo(x + w / 2, 0);
        ctx.lineTo(x + w / 2, H);
        ctx.stroke();
      } else {
        const fade = 1 - postFire / 0.52;
        ctx.fillStyle = `rgba(168, 35, 245, ${0.86 * fade})`;
        ctx.fillRect(x - w / 2, 0, w, H);
        const streaks = [-0.36, -0.18, 0, 0.2, 0.38];
        for (let i = 0; i < streaks.length; i++) {
          const sx = x + streaks[i] * w;
          ctx.strokeStyle =
            i % 2 === 0
              ? `rgba(255, 240, 255, ${0.95 * fade})`
              : `rgba(18, 4, 28, ${0.92 * fade})`;
          ctx.lineWidth = i === 2 ? 16 : 9;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          for (let y = 60; y <= H; y += 60) {
            const jitter = Math.sin(y * 0.1 + sim.animTime * 35 + i) * 12;
            ctx.lineTo(sx + jitter, y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (attack.kind === 'purple_beam') {
      const len = attack.length || 1800;
      const w = attack.width || 110;
      ctx.save();
      ctx.translate(attack.point[0], attack.point[1]);
      ctx.rotate(attack.angle);
      if (postFire < 0) {
        ctx.fillStyle = `rgba(168, 85, 247, ${0.24 + ratio * 0.28})`;
        ctx.fillRect(-len / 2, -w / 2, len, w);
        ctx.strokeStyle = '#f0abfc';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(-len / 2, -w / 2, len, w);
      } else {
        const fade = 1 - postFire / 0.52;
        ctx.fillStyle = `rgba(192, 38, 233, ${0.84 * fade})`;
        ctx.fillRect(-len / 2, -w * 0.55, len, w * 1.1);
        ctx.fillStyle = `rgba(255, 240, 255, ${0.92 * fade})`;
        ctx.fillRect(-len / 2, -w * 0.2, len, w * 0.4);
      }
      ctx.restore();
    } else if (attack.kind === 'ground_quake') {
      const [qx, qy] = attack.point;
      ctx.save();
      if (postFire < 0) {
        if (attack.darkHurricane) {
          for (let i = 0; i < 3; i++) {
            const r = 140 + i * 95;
            ctx.strokeStyle = `rgba(38, 8, 56, ${0.55 + ratio * 0.35})`;
            ctx.lineWidth = 22;
            ctx.beginPath();
            ctx.arc(qx, qy - 40, r, sim.animTime * 5 + i, sim.animTime * 5 + i + 4.2);
            ctx.stroke();
          }
        } else if (ratio > 0.55) {
          const pulseR = 120 + ratio * 380;
          ctx.strokeStyle = `rgba(255, 45, 95, ${(ratio - 0.55) * 1.8})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(qx, qy, pulseR, 0, CONFIG.TAU);
          ctx.stroke();
        }
      } else {
        const fade = 1 - postFire / 0.52;
        ctx.fillStyle = attack.darkHurricane
          ? `rgba(88, 18, 135, ${0.46 * fade})`
          : `rgba(225, 29, 72, ${0.38 * fade})`;
        ctx.fillRect(-900, 230, 3200, 490);
        for (let i = 0; i < 16; i++) {
          const rx = qx - 560 + i * 75;
          const ry = qy + ((i * 53) % 140) - 60 - postFire * 210;
          ctx.fillStyle = `rgba(42, 34, 48, ${0.92 * fade})`;
          ctx.strokeStyle = `rgba(255, 65, 115, ${0.85 * fade})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.rect(rx, ry, 24, 18);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (attack.kind === 'outer_purple_explosion') {
      const [cx, cy] = attack.center;
      const r = attack.safeRadius;
      ctx.save();
      if (postFire < 0) {
        ctx.strokeStyle = `rgba(216, 180, 254, ${0.35 + ratio * 0.55})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, r + (1 - ratio) * 90, 0, CONFIG.TAU);
        ctx.stroke();
      } else {
        const fade = 1 - postFire / 0.52;
        ctx.fillStyle = `rgba(192, 38, 233, ${0.78 * fade})`;
        ctx.beginPath();
        ctx.rect(-900, 190, 3200, 530);
        ctx.arc(cx, cy, r, 0, CONFIG.TAU, true);
        ctx.fill();
      }
      ctx.restore();
    } else if (attack.kind === 'black_hole_gear') {
      const [cx, cy] = attack.point;
      const r = attack.radius;
      ctx.save();
      if (postFire < 0) {
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
        grad.addColorStop(0, 'rgba(8, 2, 14, 0.96)');
        grad.addColorStop(0.55, 'rgba(126, 22, 185, 0.68)');
        grad.addColorStop(1, 'rgba(225, 29, 72, 0.15)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, CONFIG.TAU);
        ctx.fill();
        for (let i = 0; i < 36; i++) {
          const ang = -sim.animTime * 5.2 + (i / 36) * CONFIG.TAU;
          const tipR = lerp(r, 25, ratio);
          drawOrnateCrimsonSword(
            ctx,
            cx + Math.cos(ang) * tipR,
            cy + Math.sin(ang) * tipR,
            ang + Math.PI,
            185,
            0.9,
            false
          );
        }
      } else {
        const fade = 1 - postFire / 0.52;
        ctx.fillStyle = `rgba(217, 70, 239, ${0.82 * fade})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.15, 0, CONFIG.TAU);
        ctx.fill();
      }
      ctx.restore();
    } else if (attack.kind === 'red_giant_circle') {
      const [cx, cy] = attack.point;
      const r = attack.radius;
      ctx.save();
      if (postFire < 0) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 65;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 42, 0, CONFIG.TAU);
        ctx.stroke();

        ctx.fillStyle = 'rgba(225, 28, 36, 0.52)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, CONFIG.TAU);
        ctx.fill();

        ctx.fillStyle = 'rgba(239, 48, 56, 0.68)';
        ctx.beginPath();
        ctx.arc(cx, cy, r * ratio, 0, CONFIG.TAU);
        ctx.fill();

        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, CONFIG.TAU);
        ctx.stroke();
      } else {
        const fade = 1 - postFire / 0.52;
        const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, r * 1.15);
        grad.addColorStop(0, `rgba(15, 3, 25, ${0.95 * fade})`);
        grad.addColorStop(0.6, `rgba(168, 28, 220, ${0.85 * fade})`);
        grad.addColorStop(1, 'rgba(225, 29, 72, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.15, 0, CONFIG.TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

function drawPlayerWaistChainHarness(ctx, px, py, time) {
  ctx.save();
  ctx.translate(px, py);
  const wings = [-0.32, 0.32];
  for (const tilt of wings) {
    ctx.save();
    ctx.rotate(tilt + Math.sin(time * 4) * 0.04);
    ctx.strokeStyle = '#818cf8';
    ctx.shadowColor = '#4f46e5';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 5.5;
    ctx.setLineDash([12, 6]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 68, 24, 0, 0, CONFIG.TAU);
    ctx.stroke();

    ctx.strokeStyle = '#e0e7ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 68, 24, 0, 0, CONFIG.TAU);
    ctx.stroke();
    ctx.restore();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawSpiderLilyFlower(ctx, point, color, labelText, time) {
  const [fx, fy] = point;
  const isBlue = color === 'blue';
  const pulse = 1 + Math.sin(time * 6) * 0.06;

  ctx.save();
  const poolGrad = ctx.createRadialGradient(fx, fy + 10, 6, fx, fy + 10, 64);
  poolGrad.addColorStop(
    0,
    isBlue ? 'rgba(56, 189, 248, 0.55)' : 'rgba(244, 63, 94, 0.55)'
  );
  poolGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(fx, fy + 10, 62, 24, 0, 0, CONFIG.TAU);
  ctx.fill();

  const img = isBlue ? ASSETS.flowerBlue : ASSETS.flowerRed;
  if (isReady(img)) {
    const w = 128 * pulse;
    const h = 144 * pulse;
    ctx.drawImage(img, fx - w / 2, fy - h + 22, w, h);
  }

  ctx.fillStyle = isBlue ? '#bae6fd' : '#fecdd3';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.font = '700 12px "Malgun Gothic", "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(labelText, fx, fy + 34);
  ctx.restore();
}

function drawChainAndFlowers(ctx, sim) {
  const chain = sim.stage.chain;

  if (chain && sim.elapsed >= (chain.spawnTime ?? 0)) {
    if (!chain.cut) {
      const px = sim.p.x;
      const py = sim.p.y - 36 - sim.p.z;
      const [ax, ay] = chain.anchor;

      ctx.save();
      ctx.strokeStyle = '#818cf8';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(ax, ay, 18, 0, CONFIG.TAU);
      ctx.stroke();

      const dx = px - ax;
      const dy = py - ay;
      const totalLen = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const linkStep = 18;
      const numLinks = Math.max(1, Math.floor(totalLen / linkStep));

      ctx.translate(ax, ay);
      ctx.rotate(angle);
      for (let i = 0; i <= numLinks; i++) {
        const lx = i * linkStep;
        ctx.strokeStyle = i % 2 === 0 ? '#a5b4fc' : '#6366f1';
        ctx.fillStyle = 'rgba(30, 27, 75, 0.75)';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.ellipse(lx, 0, 9, i % 2 === 0 ? 5.5 : 3.2, 0, 0, CONFIG.TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      drawPlayerWaistChainHarness(ctx, px, py, sim.animTime);
    } else if (chain.flower && !chain.flowerCollected) {
      drawSpiderLilyFlower(
        ctx,
        chain.flower,
        chain.flowerColor || 'red',
        chain.flowerColor === 'blue' ? '생명의 꽃' : '죽음의 꽃',
        sim.animTime
      );
    }
  }

  if (sim.chainSeverFlashTimer > 0) {
    const f = sim.chainSeverFlashTimer / 0.55;
    const px = sim.p.x;
    const py = sim.p.y - 36 - sim.p.z;
    ctx.save();
    ctx.translate(px, py);
    ctx.strokeStyle = `rgba(232, 121, 249, ${f})`;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 6 * f;
    const L = 125 * (1.2 - f * 0.4);
    ctx.beginPath();
    ctx.moveTo(-L, -L * 0.65);
    ctx.lineTo(L, L * 0.65);
    ctx.moveTo(L, -L * 0.65);
    ctx.lineTo(-L, L * 0.65);
    ctx.stroke();
    ctx.restore();
  }

  const fl = sim.stage.standaloneFlower;
  if (fl && !fl.collected && sim.elapsed >= (fl.spawnTime ?? 0)) {
    drawSpiderLilyFlower(
      ctx,
      fl.point,
      fl.color,
      fl.color === 'blue' ? '생명의 꽃' : '죽음의 꽃',
      sim.animTime
    );
  }
}

function drawCounterAndLargoClash(ctx, sim, counter) {
  const [bx, by] = counter.point;
  const t = sim.elapsed;

  ctx.save();
  if (!counter.hit && t >= counter.windupStart) {
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * CONFIG.TAU + sim.animTime * 2.5;
      const rOuter = 320 - ((sim.animTime * 260 + i * 35) % 260);
      const x1 = bx + Math.cos(ang) * rOuter;
      const y1 = by + Math.sin(ang) * rOuter * 0.65;
      const x2 = bx + Math.cos(ang) * Math.max(20, rOuter - 75);
      const y2 = by + Math.sin(ang) * Math.max(20, rOuter - 75) * 0.65;

      ctx.strokeStyle = 'rgba(216, 180, 254, 0.62)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  if (!counter.hit && t >= counter.grayscaleStart) {
    const starX = bx - 10;
    const starY = by - 135;
    const starScale = 1 + Math.sin(sim.animTime * 28) * 0.18;

    ctx.save();
    ctx.translate(starX, starY);
    ctx.scale(starScale, starScale);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 24;

    ctx.beginPath();
    ctx.moveTo(-75, 0);
    ctx.quadraticCurveTo(0, -10, 75, 0);
    ctx.quadraticCurveTo(0, 10, -75, 0);
    ctx.moveTo(0, -65);
    ctx.quadraticCurveTo(10, 0, 0, 65);
    ctx.quadraticCurveTo(-10, 0, 0, -65);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, CONFIG.TAU);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 18px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ 지금 공격 [X] 카운터! ★', bx, by - 195);
  }

  if (counter.largoClashActive) {
    const lx = bx + 135;
    const ly = by + 10;

    if (isReady(ASSETS.largoSheet)) {
      const fw = ASSETS.largoSheet.naturalWidth / 12;
      const fh = ASSETS.largoSheet.naturalHeight;
      const fIdx = Math.floor(sim.animTime * 14) % 12;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.scale(-1, 1);
      ctx.drawImage(ASSETS.largoSheet, fIdx * fw, 0, fw, fh, -165, -155, 330, 260);
      ctx.restore();
    }

    const clashX = bx + 55;
    const clashY = by - 15;
    ctx.save();
    ctx.translate(clashX, clashY);
    ctx.rotate(-0.62);

    const slashGrad = ctx.createLinearGradient(-320, 0, 320, 0);
    slashGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
    slashGrad.addColorStop(0.25, 'rgba(232, 121, 249, 0.92)');
    slashGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.98)');
    slashGrad.addColorStop(0.75, 'rgba(192, 38, 211, 0.92)');
    slashGrad.addColorStop(1, 'rgba(88, 28, 135, 0)');
    ctx.fillStyle = slashGrad;
    ctx.beginPath();
    ctx.moveTo(-320, 0);
    ctx.quadraticCurveTo(0, -28, 320, 0);
    ctx.quadraticCurveTo(0, 28, -320, 0);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(0, 0, 28 + Math.sin(sim.animTime * 40) * 6, 0, CONFIG.TAU);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * CONFIG.TAU + sim.animTime * 8;
      ctx.strokeStyle = i % 2 === 0 ? '#1e0b2e' : '#f472b6';
      ctx.lineWidth = i % 2 === 0 ? 4.5 : 2.2;
      ctx.beginPath();
      ctx.moveTo(clashX, clashY);
      ctx.lineTo(clashX + Math.cos(ang) * 95, clashY + Math.sin(ang) * 75);
      ctx.lineTo(clashX + Math.cos(ang + 0.25) * 165, clashY + Math.sin(ang + 0.25) * 135);
      ctx.stroke();
    }

    if (t >= 10.65 && t <= 11.65) {
      const u = (t - 10.65) / 1.0;
      const ringR = 60 + u * 520;
      ctx.strokeStyle = `rgba(250, 204, 21, ${(1 - u) * 0.95})`;
      ctx.lineWidth = 36 * (1 - u * 0.6);
      ctx.beginPath();
      ctx.arc(clashX, clashY, ringR, 0, CONFIG.TAU);
      ctx.stroke();

      ctx.strokeStyle = `rgba(244, 63, 94, ${(1 - u) * 0.85})`;
      ctx.lineWidth = 16 * (1 - u * 0.5);
      ctx.beginPath();
      ctx.arc(clashX, clashY, ringR * 0.82, 0, CONFIG.TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPracticeGuide(ctx, sim) {
  const stage = sim.stage;
  ctx.save();

  if (stage.guideWaypoints && stage.guideWaypoints.length > 1) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    stage.guideWaypoints.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    stage.guideWaypoints.forEach((pt, idx) => {
      ctx.fillStyle = idx === stage.guideWaypoints.length - 1 ? '#22c55e' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 11, 0, CONFIG.TAU);
      ctx.fill();
      ctx.fillStyle = '#07111e';
      ctx.font = '800 11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(idx + 1), pt[0], pt[1] + 4);
    });
  }

  if (stage.safeSpot) {
    const [sx, sy] = stage.safeSpot;
    const pulseR = 24 + Math.sin(sim.animTime * 6) * 4;
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.9)';
    ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(sx, sy, pulseR, 0, CONFIG.TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#bbf7d0';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.font = '700 12px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('추천 위치 (10시)', sx, sy - pulseR - 6);
  }
  if (stage.altSafeSpot) {
    const [ax, ay] = stage.altSafeSpot;
    const pulseR = 22 + Math.sin(sim.animTime * 6 + 1.5) * 4;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.88)';
    ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(ax, ay, pulseR, 0, CONFIG.TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#bae6fd';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.font = '700 12px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('보조 위치 (6시)', ax, ay - pulseR - 6);
  }
  ctx.restore();
}

function drawPlayerSpriteFrame(ctx, x, y, facing, frameIdx, isInvuln, isHitStun = false) {
  ctx.save();
  ctx.translate(x, y);
  // 2.5D 깊이감 스케일 (화면 위쪽 y=295에서는 0.92배, 아래쪽 y=650에서는 1.06배)
  const depthScale = 0.92 + clamp((y - 295) / 355, 0, 1) * 0.14;
  ctx.scale(-facing * depthScale, depthScale);

  if (isReady(ASSETS.playerSheet)) {
    const totalFrames = 22;
    const fw = ASSETS.playerSheet.naturalWidth / totalFrames;
    const fh = ASSETS.playerSheet.naturalHeight;
    const drawW = 132;
    const drawH = 148;
    const dx = -drawW / 2;
    const dy = -drawH + 22;

    ctx.shadowColor = isHitStun ? '#ff1744' : isInvuln ? '#38bdf8' : '#eab308';
    ctx.shadowBlur = isHitStun || isInvuln ? 16 : 5;
    if (isHitStun) {
      ctx.filter = 'brightness(1.35) sepia(0.6) hue-rotate(-35deg) saturate(3)';
    }
    ctx.drawImage(
      ASSETS.playerSheet,
      frameIdx * fw,
      0,
      fw,
      fh,
      dx,
      dy,
      drawW,
      drawH
    );
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -45, 24, 0, CONFIG.TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlayer(ctx, sim) {
  const p = sim.p;
  const drawY = p.y - p.z;

  // 대시/백스텝 순간 풍압 충격파 링
  if (sim.dashRings) {
    for (const dr of sim.dashRings) {
      const u = 1 - dr.life / dr.maxLife;
      const a = 1 - u;
      ctx.save();
      ctx.translate(dr.x - dr.facing * 12, dr.y);
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.75 * a})`;
      ctx.lineWidth = 3.5 * a;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12 + u * 18, 34 + u * 26, 0, 0, CONFIG.TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  for (const a of sim.afterimages) {
    const alpha = (a.life / a.maxLife) * 0.4;
    ctx.save();
    ctx.globalAlpha = alpha;
    drawPlayerSpriteFrame(ctx, a.x, a.y - a.z, a.facing, 12, false, false);
    ctx.restore();
  }

  const shadowScale = clamp(1 - p.z / 170, 0.35, 1);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 18, 28 * shadowScale, 10 * shadowScale, 0, 0, CONFIG.TAU);
  ctx.fill();

  if (p.attack > 0) {
    ctx.save();
    ctx.translate(p.x + p.facing * 45, drawY - 42);
    const muzzleGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 56);
    muzzleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    muzzleGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.85)');
    muzzleGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = muzzleGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, CONFIG.TAU);
    ctx.fill();
    ctx.restore();
  }

  // 플레이어 평타 발사체(검기/탄환) 렌더링
  if (sim.projectiles) {
    for (const proj of sim.projectiles) {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      const pGrad = ctx.createLinearGradient(-proj.facing * 85, 0, proj.facing * 25, 0);
      pGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      pGrad.addColorStop(0.6, 'rgba(125, 211, 252, 0.88)');
      pGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = pGrad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(0, 0, 46, 10, 0, 0, CONFIG.TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  let frameIdx = 0;
  if (p.attack > 0) {
    frameIdx = 18 + Math.min(3, Math.floor(((0.26 - p.attack) / 0.26) * 4));
  } else if (p.z > 0) {
    frameIdx = p.vz > 0 ? 16 : 17;
  } else if (sim.isMoving && p.running) {
    frameIdx = 10 + (Math.floor(p.animTimer) % 6);
  } else if (sim.isMoving) {
    frameIdx = 4 + (Math.floor(p.animTimer) % 6);
  } else {
    frameIdx = Math.floor(p.animTimer) % 4;
  }

  drawPlayerSpriteFrame(ctx, p.x, drawY, p.facing, frameIdx, p.invuln > 0, p.hitStun > 0);

  if (sim.showHitbox) {
    ctx.save();
    ctx.fillStyle = p.z > 12 ? '#38bdf8' : '#22c55e';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, CONFIG.TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles(ctx, sim) {
  for (const d of sim.dustPuffs) {
    const a = clamp(d.life / d.maxLife, 0, 1);
    ctx.fillStyle = `rgba(226, 232, 240, ${a * 0.5})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * (1.3 - a * 0.3), 0, CONFIG.TAU);
    ctx.fill();
  }
  for (const s of sim.particles) {
    const a = clamp(s.life / s.maxLife, 0, 1);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, CONFIG.TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // 원작 DNF 스타일 데미지 폰트 & 회피/카운터 플로팅 텍스트
  if (sim.floatingTexts) {
    for (const ft of sim.floatingTexts) {
      const a = clamp(ft.life / ft.maxLife, 0, 1);
      const popScale = ft.life > ft.maxLife * 0.78 ? 1.25 : 1.0;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(ft.x, ft.y);
      ctx.scale(popScale, popScale);
      ctx.textAlign = 'center';

      if (ft.subText) {
        ctx.font = '800 11px "Malgun Gothic", "Noto Sans KR", sans-serif';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#09030e';
        ctx.strokeText(ft.subText, 0, -ft.size - 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(ft.subText, 0, -ft.size - 2);
      }

      ctx.font = `italic 900 ${ft.size}px "Malgun Gothic", "Noto Sans KR", sans-serif`;
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = '#09030e';
      ctx.strokeText(ft.text, 0, 0);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
  }
}

function drawRainbowPrismShatter(ctx, sim) {
  const W = CONFIG.WIDTH;
  const H = CONFIG.HEIGHT;
  const u = 1 - sim.counterShatterTimer / 0.75;
  const fade = 1 - u;
  const cx = (sim.stage?.counter?.point[0] ?? 540) - sim.cameraX + 45;
  const cy = sim.stage?.counter?.point[1] ?? 415;

  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140 + u * 560);
  grad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * fade})`);
  grad.addColorStop(0.28, `rgba(253, 224, 71, ${0.75 * fade})`);
  grad.addColorStop(0.55, `rgba(244, 114, 182, ${0.68 * fade})`);
  grad.addColorStop(0.8, `rgba(56, 189, 248, ${0.52 * fade})`);
  grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = `rgba(125, 211, 252, ${0.88 * fade})`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 90 + u * 360, 0, CONFIG.TAU);
  ctx.stroke();
  ctx.restore();
}

function drawInGameDnfHud(ctx, sim) {
  const W = CONFIG.WIDTH;
  const META = window.Yurisie.HISTORY_META;
  const globalT = sim.globalVideoTime || 0;

  ctx.save();
  const hudX = 28;
  const hudY = 72;
  const barW = 395;
  const barH = 18;

  ctx.font = '700 12px "Malgun Gothic", "Noto Sans KR", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e2e8f0';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText(META.bossName, hudX + 4, hudY - 6);

  ctx.fillStyle = 'rgba(12, 10, 18, 0.92)';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hudX, hudY);
  ctx.lineTo(hudX + barW, hudY);
  ctx.lineTo(hudX + barW - 10, hudY + barH);
  ctx.lineTo(hudX, hudY + barH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const hpPct = globalT >= 50.2 ? 96.13 : 97.41;
  const hpLines = globalT >= 50.2 ? 'x 1256841' : 'x 1273630';
  const hpGrad = ctx.createLinearGradient(hudX, hudY, hudX + barW, hudY);
  hpGrad.addColorStop(0, '#4c1d95');
  hpGrad.addColorStop(0.65, '#6d28d9');
  hpGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = hpGrad;
  ctx.fillRect(hudX + 2, hudY + 2, (barW - 14) * (hpPct / 100), barH - 4);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 12px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${hpPct.toFixed(2)}%`, hudX + barW * 0.48, hudY + 13);
  ctx.textAlign = 'right';
  ctx.font = 'italic 800 12px "Malgun Gothic", sans-serif';
  ctx.fillText(hpLines, hudX + barW - 14, hudY + 13);

  const stagX = hudX + 225;
  const stagY = hudY + barH + 2;
  const stagW = 160;
  ctx.fillStyle = 'rgba(15, 10, 18, 0.92)';
  ctx.fillRect(stagX, stagY, stagW, 11);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(stagX + 2, stagY + 2, stagW - 42, 7);
  ctx.fillStyle = '#fb923c';
  ctx.font = '700 10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('100%', stagX + stagW - 4, stagY + 9);

  const infX = hudX + 4;
  const infY = hudY + 34;
  const infW = 156;
  ctx.fillStyle = 'rgba(15, 10, 22, 0.92)';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  ctx.fillRect(infX, infY, infW, 12);
  ctx.strokeRect(infX, infY, infW, 12);

  const largoRatio = clamp((sim.influence ?? 50) / 100, 0.1, 0.9);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(infX + 2, infY + 2, (infW - 22) * largoRatio, 8);
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(
    infX + 2 + (infW - 22) * largoRatio,
    infY + 2,
    (infW - 22) * (1 - largoRatio),
    8
  );

  // 하단 중앙 보스 캐스팅 바 ([파멸], [생명의 꽃], [죽음의 꽃], [생명의 끝], [지금이다, 모험가])
  if (sim.stage) {
    const activeCast =
      sim.stage.largoCastBar &&
      sim.elapsed >= sim.stage.largoCastBar.startTime &&
      sim.elapsed <= sim.stage.largoCastBar.endTime
        ? sim.stage.largoCastBar
        : sim.stage.castBar &&
          sim.elapsed >= sim.stage.castBar.startTime &&
          sim.elapsed <= sim.stage.castBar.endTime
        ? sim.stage.castBar
        : null;

    if (activeCast) {
      const castRatio = clamp(
        (sim.elapsed - activeCast.startTime) /
          Math.max(0.05, activeCast.endTime - activeCast.startTime),
        0,
        1
      );
      const cw = 166;
      const ch = 23;
      const cx = W / 2 - cw / 2;
      const cy = 602;

      ctx.fillStyle = 'rgba(15, 10, 16, 0.94)';
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1.6;
      ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeRect(cx, cy, cw, ch);

      ctx.fillStyle = '#292524';
      ctx.fillRect(cx + 2, cy + 2, 19, 19);
      const iconImg =
        activeCast.icon === 'largo'
          ? ASSETS.iconLargo
          : activeCast.icon === 'flower_blue'
          ? ASSETS.iconFlowerBlue
          : activeCast.icon === 'flower_red'
          ? ASSETS.iconFlowerRed
          : ASSETS.iconDisaster;
      if (isReady(iconImg)) {
        ctx.drawImage(iconImg, cx + 2, cy + 2, 19, 19);
      }

      ctx.fillStyle = activeCast.color || '#d92b4b';
      ctx.fillRect(cx + 23, cy + 13, (cw - 26) * castRatio, 7);

      ctx.fillStyle = '#fde047';
      ctx.font = '700 11px "Malgun Gothic", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeCast.title, cx + 21 + (cw - 21) / 2, cy + 10);
    }
  }

  // 하단 플레이어 HP/MP 바
  const pBarW = 182;
  const pBarH = 15;
  const pBarX = W / 2 - pBarW / 2;
  const pBarY = 668;

  ctx.fillStyle = 'rgba(14, 10, 18, 0.95)';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(pBarX, pBarY, pBarW, pBarH, 4);
  ctx.fill();
  ctx.stroke();

  if (sim.worldDeath) {
    const dGrad = ctx.createLinearGradient(pBarX, pBarY, pBarX + pBarW, pBarY);
    dGrad.addColorStop(0, '#581c87');
    dGrad.addColorStop(1, '#9333ea');
    ctx.fillStyle = dGrad;
    ctx.fillRect(pBarX + 2, pBarY + 2, pBarW - 4, pBarH - 4);
  } else {
    const lGrad = ctx.createLinearGradient(pBarX, pBarY, pBarX + pBarW, pBarY);
    lGrad.addColorStop(0, '#dc2626');
    lGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = lGrad;
    const hpRatio = clamp((sim.playerHpPct ?? 100) / 100, 0.05, 1);
    ctx.fillRect(pBarX + 2, pBarY + 2, (pBarW - 4) * hpRatio, pBarH - 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(hpRatio * 100)}%`, pBarX + pBarW / 2, pBarY + 11);
  }

  ctx.fillStyle = 'rgba(12, 16, 24, 0.9)';
  ctx.fillRect(pBarX + pBarW + 34, pBarY + 9, 110, 5);
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(pBarX + pBarW + 35, pBarY + 10, 108, 3);

  // 상단 중앙 행동 가이드 배너
  if (sim.stage && sim.stage.actionCue) {
    const cueW = 620;
    const cueX = W / 2 - cueW / 2;
    const cueY = 16;
    ctx.fillStyle = 'rgba(12, 8, 22, 0.84)';
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.48)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cueX, cueY, cueW, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fdf2f8';
    ctx.font = '700 13px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`▶ ${sim.stage.actionCue}`, W / 2, cueY + 19);
  }

  if (sim.feedbackTimer > 0 && sim.feedbackText) {
    ctx.fillStyle = 'rgba(15, 6, 26, 0.92)';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 220, 128, 440, 34, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 15px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sim.feedbackText, W / 2, 150);
  }

  ctx.restore();
}

function renderFrame(ctx, sim) {
  const W = CONFIG.WIDTH;
  const H = CONFIG.HEIGHT;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  const isGrayscaleMoment =
    sim.stage &&
    sim.stage.counter &&
    !sim.stage.counter.hit &&
    sim.elapsed >= sim.stage.counter.grayscaleStart &&
    sim.elapsed <= sim.stage.counter.windowEnd + 0.15;

  if (isGrayscaleMoment) {
    ctx.filter = 'grayscale(100%) contrast(1.16) brightness(0.94)';
  }

  if (sim.screenShake > 0) {
    const mag = sim.screenShake * 18;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }

  drawScrollingArena(ctx, sim);

  if (sim.stage && sim.stage.introCutscene && sim.elapsed < sim.stage.introCutscene.endTime) {
    drawFullIntroSequence(ctx, sim);
    ctx.filter = 'none';
    drawInGameDnfHud(ctx, sim);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(-sim.cameraX, 0);

  if (sim.stage && sim.stage.grayCircleZone) {
    drawGrayCircleZone(ctx, sim, sim.stage.grayCircleZone);
  }

  // 바닥 장판 레이어 (보스 본체 아래쪽 바닥에 깔리는 붉은 대각 장판, 거대 원형 장판, 땅울림 등)
  if (sim.stage) {
    drawAttacks(ctx, sim, 'floor');
  }

  if (sim.stage && (sim.stage.ambientSwords || sim.stage.corridorBorderSwords)) {
    drawAmbientBackgroundSwords(ctx, sim, Boolean(sim.stage.corridorBorderSwords));
  }

  drawYurisieBoss(ctx, sim);

  if (sim.stage && sim.stage.envelope) {
    draw36SwordRing(ctx, sim, sim.stage.envelope);
  }

  if (sim.stage && sim.stage.swordWheel12) {
    draw12SpokeSwordWheel(ctx, sim, sim.stage.swordWheel12);
  }

  // 공중/화면 전체 참격 레이어 (검은 코어 검선, 수직 보라 번개 기둥, 보라 빔, 톱니 블랙홀 등)
  if (sim.stage) {
    drawAttacks(ctx, sim, 'air');
    drawChainAndFlowers(ctx, sim);
  }

  if (sim.stage && sim.stage.counter) {
    drawCounterAndLargoClash(ctx, sim, sim.stage.counter);
  }

  if (sim.showGuide && sim.stage) {
    drawPracticeGuide(ctx, sim);
  }

  drawPlayer(ctx, sim);
  drawParticles(ctx, sim);

  ctx.restore();
  ctx.filter = 'none';

  if (sim.counterShatterTimer > 0) {
    drawRainbowPrismShatter(ctx, sim);
  }

  if (sim.worldTransition > 0) {
    const fade = sim.worldTransition / 0.55;
    ctx.fillStyle = sim.worldDeath
      ? `rgba(59, 130, 246, ${0.22 * fade})`
      : `rgba(244, 63, 94, ${0.22 * fade})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (sim.hitFlash > 0) {
    const hf = sim.hitFlash / 0.28;
    const hitGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.65);
    hitGrad.addColorStop(0, 'rgba(225, 29, 72, 0)');
    hitGrad.addColorStop(1, `rgba(225, 29, 72, ${0.46 * hf})`);
    ctx.fillStyle = hitGrad;
    ctx.fillRect(0, 0, W, H);
  }

  drawInGameDnfHud(ctx, sim);
  ctx.restore();
}

window.Yurisie.CONFIG = CONFIG;
window.Yurisie.BOUNDS = CONFIG.BOUNDS;
window.Yurisie.CENTER = CONFIG.CENTER;
window.Yurisie.getEnvelopeCenter = getEnvelopeCenter;
window.Yurisie.getEnvelopeRadius = getEnvelopeRadius;
window.Yurisie.getSwordWheelPos = getSwordWheelPos;
window.Yurisie.renderFrame = renderFrame;
})();
