// ============================================================================
// 각인된 악몽 2페이즈 - 유리지에 : "역사의 끝 (역사 칼날 패턴)"
// 레퍼런스 영상 1: https://youtu.be/zNIaDY_8Ksc (남런처 노피격 파훼 영상, 1158x720 60fps)
// 레퍼런스 영상 2: https://youtu.be/qIGrxCMfhok?t=1193 (공략 & 파훼 예시 영상, 19:53~21:57)
// 두 영상 교차 검증 1:1 프레임·스케일·속도감 정밀 데이터
// ============================================================================
(() => {
'use strict';
window.Yurisie = window.Yurisie || {};

const HISTORY_META = {
  bossName: 'Lv145 보스-죽음을 딛고 선 자',
  patternName: '역사의 끝 (역사 칼날 패턴)',
  quoteIntro1: '이제, 또렷이 보이는가',
  quoteIntro2: '네 역사의 끝을 목도하라',
  videoUrl: 'https://youtu.be/zNIaDY_8Ksc',
  guideUrl: 'https://www.youtube.com/watch?v=qIGrxCMfhok&t=1193s',
  totalDuration: 60.0
};

const HISTORY_STAGES = [
  // --------------------------------------------------------------------------
  // 1구간: 고속 인트로(0~3.0s) + 초대형 4연 대각 붉은 장판 + 8방향(*) 검은 검선 + 파멸 점프/백스텝(6.05s)
  // (10시 삼각 포켓 [zNIaDY_8Ksc] 및 6시~7시 삼각 포켓 [qIGrxCMfhok] 양쪽 모두 완벽 지원!)
  // --------------------------------------------------------------------------
  {
    id: 1,
    stepTitle: '1구간 · 초대형 4연 대각 붉은 장판 + 8방향(*) 검은 검선 + [파멸] 점프/백스텝',
    duration: 7.15,
    videoRange: '00:03.3 ~ 00:10.4',
    worldState: false,
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.00, motion: 'spreadClaws', burst: true },
      { t: 3.10, motion: 'spreadClaws', burst: true },
      { t: 4.70, motion: 'spreadClaws', burst: true },
      { t: 6.05, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [585, 505],
    guideWaypoints: [
      [585, 505],
      [465, 412] // 10시 안전 포켓 (또는 6시~7시 [505, 575] 포켓도 동일하게 안전!)
    ],
    safeSpot: [465, 412],
    altSafeSpot: [505, 575],
    actionCue: '10시(또는 6시) 안전 포켓으로 이동 후 [파멸] 캐스팅 완료(6.05초) 시 점프(C) 또는 백스텝(↓+C)!',
    castBar: {
      title: '파멸',
      startTime: 3.20,
      endTime: 6.05,
      color: '#d92b4b',
      icon: 'disaster'
    },
    introCutscene: {
      endTime: 3.10
    },
    ambientSwords: false,
    envelope: null,
    attacks: [
      // 원작 seg1_00 (7.0s~8.6s) 1:1 수학적 고증:
      // 중심 (579, 470)을 기준으로 좌하단(\)+우상단(\)이 빈틈없이 맞닿고, 우하단(/)+좌상단(/)이 빈틈없이 맞닿는 폭 360px 장판 4개!
      // 4개가 모두 깔리면 중앙 안전구역 없이 바닥 전체(100%)가 붉게 덮이며, 1차->2차->3차 순차 폭발로 열릴 때 그 자리로 들어가야 함!
      {
        kind: 'red_band',
        point: [499, 631],
        angle: 0.46, // +26.4 deg (\) 좌하단 반평면
        width: 360,
        length: 2600,
        spawnTime: 3.40,
        fireTime: 5.20,
        label: '1차 좌하단 초대형 붉은 장판'
      },
      {
        kind: 'red_band',
        point: [659, 631],
        angle: -0.46, // -26.4 deg (/) 우하단 반평면
        width: 360,
        length: 2600,
        spawnTime: 3.75,
        fireTime: 5.50,
        label: '2차 우하단 초대형 붉은 장판'
      },
      {
        kind: 'red_band',
        point: [499, 309],
        angle: -0.46, // -26.4 deg (/) 좌상단 반평면 (2차 장판과 경계선이 정확히 맞닿아 중앙 빈틈 0px!)
        width: 360,
        length: 2600,
        spawnTime: 4.08,
        fireTime: 5.80,
        label: '3차 좌상단 초대형 붉은 장판'
      },
      {
        kind: 'red_band',
        point: [659, 309],
        angle: +0.46, // +26.4 deg (\) 우상단 반평면 (1차 장판과 경계선이 정확히 맞닿아 중앙 빈틈 0px!)
        width: 360,
        length: 2600,
        spawnTime: 4.38,
        fireTime: 6.22,
        label: '4차 우상단 초대형 붉은 장판'
      },

      // 교차 중심 (675, 490), 두께 76px의 8방향(*) 검은 코어 검선 4개 (고속 순차 전개 & 연속 참격 폭발)
      {
        kind: 'black_slash',
        point: [675, 490],
        angle: 0,
        width: 76,
        length: 2500,
        spawnTime: 4.75,
        fireTime: 6.45,
        label: '가로 검은 코어 검선'
      },
      {
        kind: 'black_slash',
        point: [675, 490],
        angle: -Math.PI / 4,
        width: 76,
        length: 2500,
        spawnTime: 4.92,
        fireTime: 6.65,
        label: '우상향(/) 검은 코어 검선'
      },
      {
        kind: 'black_slash',
        point: [675, 490],
        angle: Math.PI / 2,
        width: 76,
        length: 2500,
        spawnTime: 5.08,
        fireTime: 6.85,
        label: '세로 검은 코어 검선'
      },
      {
        kind: 'black_slash',
        point: [675, 490],
        angle: Math.PI / 4,
        width: 76,
        length: 2500,
        spawnTime: 5.12,
        fireTime: 7.02,
        label: '우하향(\\) 검은 코어 검선'
      },

      // 6.05초(영상 9.45초) [파멸] 대지 파쇄 점프 판정
      {
        kind: 'ground_quake',
        point: [579, 465],
        radius: 1600,
        spawnTime: 3.20,
        fireTime: 6.05,
        jumpRequired: true,
        label: '파멸 땅울림 (점프 C / 백스텝 ↓+C)'
      }
    ],
    message:
      '화면 전체를 덮는 초대형 4연 대각 붉은 장판과 8방향(*) 검은 검선이 빠르게 전개됩니다. 10시(x=465, y=412) 또는 6시(x=505, y=575) 안전 포켓으로 이동해 [파멸] 캐스팅 완료 시 점프(C) 또는 백스텝(↓+C)으로 회피하세요!'
  },

  // --------------------------------------------------------------------------
  // 2구간 (10.45s ~ 14.80s): 좌->우 연쇄 추격 보라 기둥 + 36검 포위 고리 고속 진입 + 1차 사슬 절단 + ◇ 마름모 보라 빔
  // --------------------------------------------------------------------------
  {
    id: 2,
    stepTitle: '2구간 · 연쇄 보라 기둥 질주 회피 & 36검 포위망 진입 + 1차 좌측 사슬 절단 + [◇ 마름모] 빔',
    duration: 4.35,
    videoRange: '00:10.4 ~ 00:14.8',
    worldState: false,
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.0, motion: 'spreadClaws', burst: true },
      { t: 0.75, motion: 'spreadClaws', burst: true },
      { t: 2.15, motion: 'spreadClaws', burst: true },
      { t: 4.00, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [465, 412],
    guideWaypoints: [
      [465, 412],
      [605, 465],
      [579, 465]
    ],
    safeSpot: [605, 465],
    actionCue: '달려서 좌측 연쇄 보라 기둥을 피하고 세로 검은 검선(x=525) 오른쪽(x=605)에서 1차 사슬 절단!',
    ambientSwords: true,
    envelope: {
      kind: 'ring36',
      from: [280, 465],
      to: [579, 465],
      moveEndTime: 1.35,
      radius: 235
    },
    grayCircleZone: {
      center: [579, 465],
      radius: 215,
      startTime: 2.15,
      endTime: 4.35
    },
    chain: {
      anchor: [80, 465],
      spawnTime: 0.15,
      cutTime: 2.15
    },
    attacks: [
      // 좌측에서 중앙으로 도미노처럼 빠르게 좁혀 들어오는 수직 보라 기둥 ("바로 달려서 면공격 피하고")
      { kind: 'purple_pillar', x: 95, width: 175, spawnTime: 0.00, fireTime: 0.85, label: '1열 추격 보라 기둥' },
      { kind: 'purple_pillar', x: 275, width: 175, spawnTime: 0.16, fireTime: 1.05, label: '2열 추격 보라 기둥' },
      { kind: 'purple_pillar', x: 900, width: 175, spawnTime: 0.00, fireTime: 0.95, label: '우내측 보라 기둥' },
      { kind: 'purple_pillar', x: 1080, width: 175, spawnTime: 0.16, fireTime: 1.10, label: '우외곽 보라 기둥' },

      {
        kind: 'black_slash',
        point: [525, 465],
        angle: Math.PI / 2,
        width: 72,
        length: 1600,
        spawnTime: 0.70,
        fireTime: 2.15,
        cutsChain: true,
        label: '1차 사슬 절단 수직 검선'
      },

      { kind: 'purple_beam', point: [420, 355], angle: -0.62, width: 155, length: 1800, spawnTime: 2.75, fireTime: 3.95, label: '◇ 마름모 좌상단 보라 빔' },
      { kind: 'purple_beam', point: [738, 355], angle: 0.62, width: 155, length: 1800, spawnTime: 2.75, fireTime: 3.95, label: '◇ 마름모 우상단 보라 빔' },
      { kind: 'purple_beam', point: [420, 575], angle: 0.62, width: 155, length: 1800, spawnTime: 2.75, fireTime: 3.95, label: '◇ 마름모 좌하단 보라 빔' },
      { kind: 'purple_beam', point: [738, 575], angle: -0.62, width: 155, length: 1800, spawnTime: 2.75, fireTime: 3.95, label: '◇ 마름모 우하단 보라 빔' }
    ],
    message:
      '바로 오른쪽으로 달려서 좌측 연쇄 보라 기둥을 피하고, 세로 검은 검선(x=525)의 오른쪽(x=605)에 서서 1차 좌측 사슬을 끊은 뒤 중앙 원 안에서 ◇ 마름모 보라 빔을 피하세요!'
  },

  // --------------------------------------------------------------------------
  // 3구간 (14.80s ~ 16.80s): 좌측 사선 보라 격자 + 2차 우측 사슬 절단
  // --------------------------------------------------------------------------
  {
    id: 3,
    stepTitle: '3구간 · 좌측 사선 검기 고속 폭발 후 좌측 이동으로 2차 우측 사슬 절단',
    duration: 2.00,
    videoRange: '00:14.8 ~ 00:16.8',
    worldState: false,
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.0, motion: 'spreadClaws', burst: true },
      { t: 0.80, motion: 'spreadClaws', burst: true },
      { t: 1.80, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [605, 465],
    guideWaypoints: [
      [605, 465],
      [512, 465]
    ],
    safeSpot: [512, 465],
    actionCue: '중앙에서 대기하다 0.8초 좌측 사선 검기 폭발 직후 왼쪽(x=512)으로 이동해 우측 사슬 절단!',
    ambientSwords: true,
    envelope: {
      kind: 'ring36',
      from: [579, 465],
      to: [579, 465],
      moveEndTime: 0.1,
      radius: 235
    },
    grayCircleZone: {
      center: [579, 465],
      radius: 215,
      startTime: 0.0,
      endTime: 2.0
    },
    chain: {
      anchor: [1080, 465],
      spawnTime: 0.05,
      cutTime: 1.80
    },
    attacks: [
      { kind: 'purple_beam', point: [365, 410], angle: -0.78, width: 100, length: 1600, spawnTime: 0.0, fireTime: 0.80, label: '좌측 사선 보라 검기' },
      { kind: 'purple_beam', point: [455, 445], angle: -0.78, width: 100, length: 1600, spawnTime: 0.0, fireTime: 0.80, label: '좌측 사선 보라 검기' },
      { kind: 'purple_beam', point: [275, 375], angle: -0.78, width: 100, length: 1600, spawnTime: 0.0, fireTime: 0.80, label: '좌측 사선 보라 검기' },

      {
        kind: 'black_slash',
        point: [579, 465],
        angle: Math.PI / 2,
        width: 72,
        length: 1600,
        spawnTime: 0.30,
        fireTime: 1.80,
        cutsChain: true,
        label: '2차 사슬 절단 중앙 수직 검선'
      }
    ],
    message:
      '우측에서 2차 사슬이 걸리고 좌측에 사선 보라 검기가 먼저 터집니다. 중앙(x=605)에서 기다렸다가 사선 검기가 터진 직후(0.8초) 세로 검은 검선 왼쪽(x=512)으로 이동해 우측 사슬을 끊으세요!'
  },

  // --------------------------------------------------------------------------
  // 4구간 (16.80s ~ 23.80s): 반시계 6연 회전 검선 + 3차 하단 사슬 절단(12시) + 파멸 점프 + 외곽 보라 폭발 + 중앙 푸른 꽃(36검 회색 무력화!)
  // --------------------------------------------------------------------------
  {
    id: 4,
    stepTitle: '4구간 · 반시계 6연 회전 검선 & 12시 [파멸] 점프 + 하단 사슬 절단 → 중앙 [생명의 꽃]으로 조여오는 36검 회색 무력화',
    duration: 7.00,
    videoRange: '00:16.8 ~ 00:23.8',
    worldState: false,
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.0, motion: 'spreadClaws', burst: true },
      { t: 1.1, motion: 'spreadClaws', burst: true },
      { t: 2.5, motion: 'spreadClaws', burst: true },
      { t: 3.45, motion: 'spreadClaws', burst: true },
      { t: 5.15, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [512, 465],
    guideWaypoints: [
      [635, 515],
      [675, 455],
      [645, 375],
      [579, 345],
      [579, 465]
    ],
    safeSpot: [579, 345],
    actionCue: '반시계 회전 → 12시 [파멸] 점프(C) & 사슬 절단 → 중앙 진입 후 [생명의 꽃]을 먹어 조여오는 36검을 회색(판정 소멸)으로 바꾸세요!',
    castBar: {
      title: '파멸',
      startTime: 0.0,
      endTime: 3.45,
      color: '#d92b4b',
      icon: 'disaster'
    },
    largoCastBar: {
      title: '생명의 꽃',
      startTime: 4.10,
      endTime: 6.80,
      color: '#3b82f6',
      icon: 'flower_blue'
    },
    ambientSwords: true,
    swordScrollSpeed: -145, // 상단 부유 칼날들이 끊임없이 좌우로 이동
    // 5.15초 외곽 보라 폭발 직후 36검이 중앙(235px -> 38px)으로 급격히 조여옴!
    // 플레이어가 중앙 푸른 꽃을 먹어 죽음의 세계(worldDeath=true)로 넘어가면 즉시 회색으로 변하며 피격 판정이 사라짐!
    envelope: {
      kind: 'ring36',
      from: [579, 465],
      to: [579, 465],
      moveEndTime: 0.1,
      radius: 235,
      constrictStartTime: 4.95,
      constrictEndTime: 6.90,
      constrictTargetRadius: 38,
      belongsToLifeWorld: true
    },
    grayCircleZone: {
      center: [579, 465],
      radius: 215,
      startTime: 0.0,
      endTime: 5.40
    },
    chain: {
      anchor: [579, 710],
      spawnTime: 2.20,
      cutTime: 4.00
    },
    standaloneFlower: {
      point: [579, 465],
      color: 'blue',
      spawnTime: 4.85,
      expireTime: 6.75,
      switchesToDeathWorld: true
    },
    attacks: [
      { kind: 'black_slash', point: [579, 465], angle: Math.PI / 2, width: 66, length: 1600, spawnTime: 0.00, fireTime: 0.95, label: '1차 회전 검은 검선' },
      { kind: 'black_slash', point: [579, 465], angle: Math.PI / 3, width: 66, length: 1600, spawnTime: 0.20, fireTime: 1.15, label: '2차 회전 검은 검선' },
      { kind: 'black_slash', point: [579, 465], angle: Math.PI / 6, width: 66, length: 1600, spawnTime: 0.40, fireTime: 1.35, label: '3차 회전 검은 검선' },
      { kind: 'black_slash', point: [579, 465], angle: 0, width: 66, length: 1600, spawnTime: 0.60, fireTime: 1.55, label: '4차 회전 검은 검선' },
      { kind: 'black_slash', point: [579, 465], angle: -Math.PI / 6, width: 66, length: 1600, spawnTime: 0.80, fireTime: 1.75, label: '5차 회전 검은 검선' },
      { kind: 'black_slash', point: [579, 465], angle: -Math.PI / 3, width: 66, length: 1600, spawnTime: 1.00, fireTime: 1.95, label: '6차 회전 검은 검선' },

      {
        kind: 'black_slash',
        point: [579, 465],
        angle: 0.06,
        width: 72,
        length: 1800,
        spawnTime: 2.45,
        fireTime: 4.00,
        cutsChain: true,
        label: '3차 사슬 절단 가로 검선'
      },

      {
        kind: 'ground_quake',
        point: [579, 465],
        radius: 1600,
        spawnTime: 1.80,
        fireTime: 3.45,
        jumpRequired: true,
        label: '파멸 땅울림 (점프 C)'
      },

      {
        kind: 'outer_purple_explosion',
        center: [579, 465],
        safeRadius: 215,
        spawnTime: 4.10,
        fireTime: 5.15,
        label: '외곽 보라 장판 대폭발'
      }
    ],
    message:
      '3시에서 반시계 회전하며 6연 검선을 피하고, 12시에서 [파멸] 점프(C) & 사슬 절단 후 즉시 중앙 원으로 들어오세요! 외곽 폭발 직후 36검이 중앙으로 조여오므로, 중앙의 [생명의 꽃(푸른 꽃)]을 먹어 칼날들을 회색(판정 소멸)으로 만들고 빠져나가세요!'
  },

  // --------------------------------------------------------------------------
  // 5구간 (23.80s ~ 29.10s): 회색으로 변한 중앙 36검 관통해 우측 질주 + 상하단 이동 칼날 & 3연 이동 보라 기둥 회피
  // --------------------------------------------------------------------------
  {
    id: 5,
    stepTitle: '5구간 · 회색 무력화 36검 관통 우측 질주 → 좌우 이동하는 상단 칼날 & 3연 이동 보라 기둥 회피',
    duration: 5.30,
    videoRange: '00:23.8 ~ 00:29.1',
    worldState: true, // 이미 꽃을 먹어 죽음의 세계 진입 상태 (5구간 단독 연습 시에도 회색 36검 잔상 연출!)
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.0, motion: 'spreadClaws', burst: true },
      { t: 1.8, motion: 'spreadClaws', burst: true },
      { t: 4.9, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [610, 465],
    guideWaypoints: [
      [610, 465],
      [1195, 475]
    ],
    safeSpot: [1195, 475],
    actionCue: '회색으로 변한 중앙 칼날들을 그냥 통과해 우측 끝(x=1195)까지 달려서 이동하는 보라 기둥을 피하세요!',
    ambientSwords: true,
    corridorBorderSwords: true,
    swordScrollSpeed: 165, // 상단/하단 수직 칼날들이 좌우로 계속 이동!
    // 회색으로 변해 피격 판정이 완전히 사라진 중앙 수축 36검 잔상 (0.0s ~ 1.6s 동안 회전 후 소멸)
    envelope: {
      kind: 'ring36',
      from: [579, 465],
      to: [579, 465],
      moveEndTime: 0.1,
      radius: 52,
      constrictStartTime: 0.0,
      constrictEndTime: 1.50,
      constrictTargetRadius: 28,
      fadeOutAfter: 1.50,
      belongsToLifeWorld: true // 현재 worldState=true(죽음의 세계)이므로 자동으로 회색 비활성 & 피격 판정 없음!
    },
    grayCircleZone: {
      center: [1195, 485],
      radius: 175,
      startTime: 1.80,
      endTime: 5.30
    },
    attacks: [
      // 상단 칼날들의 좌우 이동에 맞춰 함께 옆으로 미끄러지며 압박해 오는 3연 수직 보라 기둥!
      { kind: 'purple_pillar', fromX: 430, x: 560, width: 190, spawnTime: 1.80, fireTime: 4.85, label: '1열 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 655, x: 785, width: 190, spawnTime: 1.95, fireTime: 4.95, label: '2열 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 880, x: 1010, width: 190, spawnTime: 2.10, fireTime: 5.05, label: '3열 이동 보라 기둥' }
    ],
    message:
      '꽃을 먹어 회색으로 변한 중앙 36검은 더 이상 피격 판정이 없습니다! 회색 칼날을 관통해 우측 끝 안전지대(x=1195)까지 달려서, 상단 칼날과 함께 좌→우로 이동하며 덮쳐오는 3연 보라 기둥을 피하세요!'
  },

  // --------------------------------------------------------------------------
  // 6구간 (29.10s ~ 34.40s): 우측 끝(x=1195) -> 좌측 끝(x=-165) 도미노 추격 기둥 대질주 + 4차 좌측 사슬 절단 & 죽음의 꽃
  // --------------------------------------------------------------------------
  {
    id: 6,
    stepTitle: '6구간 · 우→좌 5연 추격 기둥 맵 횡단 대질주 → 우측 스텝으로 4차 사슬 절단 & [죽음의 꽃]',
    duration: 5.30,
    videoRange: '00:29.1 ~ 00:34.4',
    worldState: true,
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.0, motion: 'spreadClaws', burst: true },
      { t: 0.70, motion: 'spreadClaws', burst: true },
      { t: 3.45, motion: 'spreadClaws', burst: true },
      { t: 4.10, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [1195, 475],
    guideWaypoints: [
      [1195, 475],
      [-165, 505],
      [65, 505],
      [165, 520]
    ],
    safeSpot: [-165, 505],
    actionCue: '왼쪽으로 쭉 달려(←←) 5연 추격 기둥을 피한 직후, 오른쪽(x=65)으로 넘어와 사슬 절단 & 붉은 꽃 습득!',
    castBar: {
      title: '죽음의 꽃',
      startTime: 0.45,
      endTime: 5.25,
      color: '#ef4444',
      icon: 'flower_red'
    },
    ambientSwords: true,
    corridorBorderSwords: true,
    swordScrollSpeed: -185, // 상단/하단 칼날들이 우→좌로 끊임없이 이동!
    grayCircleZone: {
      center: [115, 500],
      radius: 215,
      startTime: 0.40,
      endTime: 5.30
    },
    chain: {
      anchor: [-255, 520],
      spawnTime: 1.85,
      cutTime: 4.10,
      flower: [165, 520],
      flowerColor: 'red',
      switchesToLifeWorld: true
    },
    attacks: [
      // 상단 칼날들의 우→좌 이동과 함께 옆으로 이동하며 플레이어 뒤를 바짝 추격해 터지는 5연 수직 보라 기둥!
      { kind: 'purple_pillar', fromX: 960, x: 820, width: 180, spawnTime: 0.40, fireTime: 3.15, label: '1열 추격 보라 기둥' },
      { kind: 'purple_pillar', fromX: 760, x: 620, width: 180, spawnTime: 0.55, fireTime: 3.25, label: '2열 추격 보라 기둥' },
      { kind: 'purple_pillar', fromX: 560, x: 420, width: 180, spawnTime: 0.70, fireTime: 3.35, label: '3열 추격 보라 기둥' },
      { kind: 'purple_pillar', fromX: 360, x: 220, width: 180, spawnTime: 0.85, fireTime: 3.45, label: '4열 추격 보라 기둥' },
      { kind: 'purple_pillar', fromX: 160, x: 20,  width: 180, spawnTime: 1.00, fireTime: 3.55, label: '5열 추격 보라 기둥' },

      {
        kind: 'black_slash',
        point: [-75, 500],
        angle: Math.PI / 2,
        width: 72,
        length: 1600,
        spawnTime: 1.85,
        fireTime: 4.10,
        cutsChain: true,
        label: '4차 좌측 사슬 절단 수직 검선'
      }
    ],
    message:
      '우측에서 좌측으로 도미노처럼 추격해 오는 5연 보라 기둥을 피해 좌측 끝(x=-165)까지 전력 질주(←←)하세요! 5번째 기둥이 터진 직후(3.55초) 검은 세로 검선 오른쪽(x=65)으로 넘어와 사슬을 끊고 [죽음의 꽃]을 습득하세요!'
  },

  // --------------------------------------------------------------------------
  // 7구간 (34.40s ~ 42.00s): 12검 수레바퀴(3시->12시 고속 회전 이동) + 우측 거대 붉은 폭발/도넛 링 + 대각선 5차 사슬 절단 + 생명의 꽃
  // --------------------------------------------------------------------------
  {
    id: 7,
    stepTitle: '7구간 · 12검 회전 수레바퀴(3시→12시) + 거대 붉은 원 폭발 + 대각선 5차 사슬 절단 & [생명의 꽃]',
    duration: 7.60,
    videoRange: '00:34.4 ~ 00:42.0',
    worldState: false,
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.0, motion: 'spreadClaws', burst: true },
      { t: 0.80, motion: 'spreadClaws', burst: true },
      { t: 2.50, motion: 'spreadClaws', burst: true },
      { t: 5.55, motion: 'spreadClaws', burst: true },
      { t: 6.60, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [220, 485],
    guideWaypoints: [
      [395, 455],
      [355, 455],
      [605, 475]
    ],
    safeSpot: [355, 455],
    actionCue: '11시 대각선 검은 검선 왼쪽 위(x=355)로 이동해 5차 사슬을 끊고 바로 보스 아래 푸른 꽃 습득!',
    castBar: {
      title: '생명의 꽃',
      startTime: 4.40,
      endTime: 7.55,
      color: '#3b82f6',
      icon: 'flower_blue'
    },
    ambientSwords: true,
    swordScrollSpeed: 135,
    envelope: {
      kind: 'ring36',
      from: [460, 455],
      to: [460, 455],
      moveEndTime: 0.1,
      radius: 370,
      belongsToLifeWorld: true
    },
    swordWheel12: {
      keyframes: [
        { t: 0.0, pos: [835, 495] },
        { t: 1.6, pos: [800, 435] },
        { t: 3.4, pos: [705, 315] },
        { t: 5.2, pos: [520, 165] },
        { t: 7.0, pos: [470, 145] }
      ],
      spokeLength: 215,
      killRadius: 155,
      belongsToLifeWorld: true
    },
    chain: {
      anchor: [935, 575],
      spawnTime: 4.55,
      cutTime: 6.60,
      flower: [605, 475],
      flowerColor: 'blue',
      switchesToDeathWorld: true
    },
    attacks: [
      {
        kind: 'red_giant_circle',
        point: [790, 475],
        radius: 355,
        donutSafeInner: 355,
        donutSafeOuter: 455,
        spawnTime: 2.40,
        fireTime: 5.55,
        label: '우측 거대 붉은 원형 암흑 폭발'
      },
      {
        kind: 'black_slash',
        point: [455, 455],
        angle: -1.16,
        width: 74,
        length: 1700,
        spawnTime: 4.85,
        fireTime: 6.60,
        cutsChain: true,
        label: '5차 사슬 절단 대각선 검선'
      }
    ],
    message:
      '우측(3시)에서 12검 수레바퀴가 고속 회전하며 12시로 올라가고 거대 붉은 원이 팽창합니다. 사슬이 생기면 왼쪽 위 대각선(x=355)에 서서 우하단 사슬을 끊은 뒤, 보스 아래 [생명의 꽃(푸른 꽃)]을 밟으세요!'
  },

  // --------------------------------------------------------------------------
  // 8구간 (42.00s ~ 50.80s): 사선 낙하 검 & 수직 기둥 2연 회피 + 흑태양 암흑 폭풍 점프(45.6s) + 중앙 죽음의 꽃(47.6s) + 최후의 기둥 회피
  // --------------------------------------------------------------------------
  {
    id: 8,
    stepTitle: '8구간 · 사선 검 & 수직 기둥 2연 회피 → 흑태양 폭풍 점프(C) → 중앙 [죽음의 꽃] → 우측 기둥 회피',
    duration: 8.80,
    videoRange: '00:42.0 ~ 00:50.8',
    worldState: true,
    bossMotion: 'spreadClaws',
    bossTimeline: [
      { t: 0.0, motion: 'spreadClaws', burst: true },
      { t: 1.20, motion: 'spreadClaws', burst: true },
      { t: 3.10, motion: 'spreadClaws', burst: true },
      { t: 3.65, motion: 'spreadClaws', burst: true },
      { t: 5.60, motion: 'spreadClaws', burst: true },
      { t: 7.65, motion: 'spreadClaws', burst: true }
    ],
    bossPos: [579, 228],
    startPos: [605, 475],
    guideWaypoints: [
      [590, 470],
      [490, 465],
      [535, 465],
      [575, 475],
      [735, 465]
    ],
    safeSpot: [575, 475],
    actionCue: '기둥 2연 회피 → 3.65초 흑태양 암흑 폭풍 점프(C) → 중앙 붉은 꽃 습득 → 오른쪽(x=735) 회피!',
    castBar: {
      title: '죽음의 꽃',
      startTime: 3.15,
      endTime: 6.75,
      color: '#ef4444',
      icon: 'flower_red'
    },
    ambientSwords: true,
    swordScrollSpeed: 155,
    grayCircleZone: {
      center: [455, 465],
      radius: 210,
      startTime: 1.40,
      endTime: 5.60
    },
    standaloneFlower: {
      point: [575, 475],
      color: 'red',
      spawnTime: 4.25,
      expireTime: 6.20,
      switchesToLifeWorld: true
    },
    attacks: [
      { kind: 'purple_pillar', fromX: 165, x: 235, width: 175, swordAngle: 0.95, spawnTime: 0.0, fireTime: 1.20, label: '1차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 350, x: 420, width: 175, swordAngle: 0.95, spawnTime: 0.0, fireTime: 1.20, label: '1차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 690, x: 760, width: 175, swordAngle: 0.95, spawnTime: 0.0, fireTime: 1.20, label: '1차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 875, x: 945, width: 175, swordAngle: 0.95, spawnTime: 0.0, fireTime: 1.20, label: '1차 이동 보라 기둥' },

      { kind: 'purple_pillar', fromX: 230, x: 150, width: 175, swordAngle: 2.15, spawnTime: 1.55, fireTime: 3.10, label: '2차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 415, x: 335, width: 175, swordAngle: 2.15, spawnTime: 1.55, fireTime: 3.10, label: '2차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 725, x: 645, width: 175, swordAngle: 2.15, spawnTime: 1.55, fireTime: 3.10, label: '2차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 910, x: 830, width: 175, swordAngle: 2.15, spawnTime: 1.55, fireTime: 3.10, label: '2차 이동 보라 기둥' },

      {
        kind: 'ground_quake',
        point: [579, 465],
        radius: 1600,
        spawnTime: 3.15,
        fireTime: 3.65,
        jumpRequired: true,
        darkHurricane: true,
        label: '흑태양 암흑 폭풍 (점프 C)'
      },

      { kind: 'purple_pillar', fromX: 150, x: 220, width: 175, swordAngle: 0.45, spawnTime: 4.15, fireTime: 5.60, label: '3차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 335, x: 405, width: 175, swordAngle: 0.45, spawnTime: 4.15, fireTime: 5.60, label: '3차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 675, x: 745, width: 175, swordAngle: 0.45, spawnTime: 4.15, fireTime: 5.60, label: '3차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 860, x: 930, width: 175, swordAngle: 0.45, spawnTime: 4.15, fireTime: 5.60, label: '3차 이동 보라 기둥' },

      { kind: 'purple_pillar', fromX: 195, x: 115, width: 175, spawnTime: 6.35, fireTime: 7.65, label: '4차 이동 보라 기둥' },
      { kind: 'purple_pillar', fromX: 645, x: 565, width: 175, spawnTime: 6.35, fireTime: 7.65, label: '4차 중앙 보라 기둥' },
      { kind: 'purple_pillar', fromX: 1105, x: 1025, width: 175, spawnTime: 6.35, fireTime: 7.65, label: '4차 이동 보라 기둥' }
    ],
    message:
      '1차 기둥(중앙) → 2차 기둥(좌측 x=490) 회피 직후, 보스가 흑태양 암흑 회오리를 일으킬 때(3.65초) 점프(C)하세요! 착지 후 중앙 통로의 [죽음의 꽃(붉은 꽃)]을 밟아 생명의 세계로 돌아온 뒤, 우측 통로(x=735)로 마지막 기둥을 피하세요!'
  },

  // --------------------------------------------------------------------------
  // 9구간 (50.80s ~ 63.50s): 최종 흑백 카운터 [생명의 끝] (54.0s~54.5s) & 해방된 라르고 합동 격돌 [지금이다, 모험가]
  // --------------------------------------------------------------------------
  {
    id: 9,
    stepTitle: '9구간 · 최종 흑백 카운터 [생명의 끝] (X키) & 해방된 라르고 합동 격돌 [지금이다, 모험가]',
    duration: 12.70,
    videoRange: '00:50.8 ~ 01:03.5',
    worldState: false,
    bossMotion: 'swordStance',
    bossTimeline: [
      { t: 0.0, motion: 'swordStance', burst: false },
      { t: 1.40, motion: 'spreadClaws', burst: true },
      { t: 3.65, motion: 'swordStance', burst: true }
    ],
    bossPos: [515, 415],
    startPos: [685, 455],
    guideWaypoints: [
      [665, 455]
    ],
    safeSpot: [665, 455],
    actionCue: '3.2초(영상 54.0초) 화면이 흑백(Monochrome)으로 변하고 흰 별이 번쩍일 때 기본 공격(X)!',
    castBar: {
      title: '생명의 끝',
      startTime: 1.30,
      endTime: 3.55,
      color: '#d92b4b',
      icon: 'disaster'
    },
    largoCastBar: {
      title: '지금이다, 모험가',
      startTime: 3.65,
      endTime: 10.70,
      color: '#22c55e',
      icon: 'largo'
    },
    counter: {
      point: [515, 415],
      windupStart: 1.40,
      grayscaleStart: 3.15,
      windowStart: 3.05,
      windowEnd: 3.75,
      range: 270
    },
    attacks: [],
    message:
      '유리지에가 양팔을 벌려 [생명의 끝]을 시전하며 보라색 폭풍을 빨아들입니다. 3.15초(영상 54.0초)에 화면 전체가 흑백(Monochrome)으로 변하고 유리지에 머리 위에 하얀 별빛이 번쩍일 때 공격(X)하여 카운터를 넣으세요!'
  }
];

window.Yurisie.HISTORY_META = HISTORY_META;
window.Yurisie.HISTORY_STAGES = HISTORY_STAGES;
})();
