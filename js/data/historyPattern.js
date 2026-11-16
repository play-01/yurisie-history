// 역사의 끝 (11구간) — 타임라인 및 위치 싱크 정밀 데이터
export const HISTORY_STAGES = [
  {
    stepTitle: '1. [역사 개막] 암흑 일식 기 모으기 연출(0~4s) → 사선 워닝 4연타 순차 폭발(①→②→③→④)',
    message: '3:35 기준 개막! 보스가 공중에서 암흑 일식 기를 모은 뒤(0~4s), 사선 워닝 ①→②→③→④가 순차적으로 4연속 폭발합니다. 교차 선 사이의 빈 공간(9시 방향)으로 피하세요!',
    duration: 9.6,
    worldState: false,
    introCutIn: {
      title: '역사의 끝',
      quote: '"이제, 또렷이 보이는가. 네 역사의 끝을 목도하라"',
      duration: 4.0,
      eclipse: true
    },
    startPos: [480, 390],
    attacks: [
      { type: 'safeSpot', point: [228, 324], r: 80, warn: 4.0, fire: 8.8, label: '교차 사선 회피(9시 방향)' },
      { type: 'slash', x: 480, y: 340, angle: -0.52, width: 56, warn: 4.0, fire: 5.6, seq: 1, label: '① 1차 대각선' },
      { type: 'slash', x: 480, y: 340, angle: 0.52, width: 56, warn: 5.2, fire: 6.7, seq: 2, label: '② 2차 X교차 대각선' },
      { type: 'slash', x: 480, y: 340, angle: -0.98, width: 54, warn: 6.2, fire: 7.7, seq: 3, label: '③ 3차 급각 사선' },
      { type: 'slash', x: 480, y: 340, angle: 0.98, width: 54, warn: 7.1, fire: 8.6, seq: 4, label: '④ 4차 교차 사선' },
      { type: 'slash', x: 480, y: 340, angle: Math.PI / 2, width: 52, warn: 7.4, fire: 8.6 }
    ]
  },
  {
    stepTitle: '2. [역사 개막] 9시→6시 이동 + 양끝 세로 면 공격 & 6시 백스텝(↓+C)/점프(C)',
    message: '9시에서 6시로 이동! 양끝 면 공격과 상단 장판 후 6시 땅울림+선 공격을 백스텝(↓+C) 또는 점프(C)로 피하세요.',
    duration: 4.6,
    worldState: false,
    startPos: [228, 324],
    attacks: [
      { type: 'safeSpot', point: [480, 455], r: 84, warn: 0.1, fire: 2.1, label: '6시 이동 후 백스텝(↓+C)!' },
      { type: 'rect', x1: 70, y1: 195, x2: 890, y2: 335, warn: 0.2, fire: 2.1, label: '상단 광역 장판' },
      { type: 'pillar', x1: 70, x2: 220, y1: 195, y2: 495, warn: 0.3, fire: 2.1, seq: 1, label: '① 좌측 세로 면 공격' },
      { type: 'pillar', x1: 740, x2: 890, y1: 195, y2: 495, warn: 0.6, fire: 2.4, seq: 2, label: '② 우측 세로 면 공격' },
      { type: 'slash', x: 640, y: 260, angle: -0.62, width: 145, warn: 2.1, fire: 3.9, label: '1시 광역 선 공격' },
      { type: 'quake', warn: 2.2, fire: 3.9, label: '6시 백스텝(↓+C) 또는 점프(C)!' }
    ]
  },
  {
    stepTitle: '3. [역사 초반] 연속 세로 면 공격(①~⑤) 회피 → 좌상단 사슬 절단 & 푸른 꽃',
    message: '달려서 연속 세로 면 공격(①~⑤)과 외곽 링 장판을 피한 뒤, 좌상단 사슬을 끊고 [푸른 꽃]을 획득하세요.',
    duration: 6.2,
    worldState: false,
    startPos: [480, 455],
    envelope: { type: 'donut', from: [480, 340], to: [480, 340], r: 225, shrinkTo: 160, startT: 0, endT: 3.6, widenOnCut: true },
    attacks: [
      { type: 'pillar', x1: 70, x2: 225, y1: 195, y2: 495, warn: 0.1, fire: 1.4, seq: 1, label: '① 세로 면 공격' },
      { type: 'pillar', x1: 735, x2: 890, y1: 195, y2: 495, warn: 0.4, fire: 1.7, seq: 2, label: '② 세로 면 공격' },
      { type: 'pillar', x1: 575, x2: 735, y1: 195, y2: 495, warn: 0.8, fire: 2.2, seq: 3, label: '③ 세로 면 공격' },
      { type: 'pillar', x1: 420, x2: 575, y1: 195, y2: 495, warn: 1.2, fire: 2.7, seq: 4, label: '④ 중앙 면 공격' },
      { type: 'ring', x: 480, y: 340, innerR: 155, outerR: 480, warn: 1.5, fire: 3.2, label: '외곽 링 장판' },
      { type: 'pillar', x1: 225, x2: 390, y1: 195, y2: 495, warn: 2.6, fire: 4.3, seq: 5, label: '⑤ 좌측 후속 면 공격' }
    ],
    chain: {
      anchor: [315, 425],
      safeTarget: [315, 280],
      slash: { axis: 'y', at: 355, width: 50 },
      warn: 1.4,
      fire: 3.5,
      flower: [375, 265],
      flowerColor: 'blue'
    }
  },
  {
    stepTitle: '4. [죽음의 세계] 중앙 대기(외곽 보랏빛 폭발) → 우측 사슬 절단 → 중앙 복귀',
    message: '중앙 원형 장판에서 외곽 보랏빛 폭발을 피한 뒤, 오른쪽으로 나가 사슬을 끊고 다시 중앙으로 복귀하세요.',
    duration: 5.4,
    worldState: true,
    startPos: [375, 265],
    envelope: { type: 'donut', from: [480, 340], to: [480, 340], r: 205, widenOnCut: true },
    attacks: [
      { type: 'purpleVoid', x: 480, y: 350, r: 128, warn: 0.2, fire: 1.8, label: '① 중앙 대기 (외곽 보랏빛 폭발!)' },
      { type: 'floorPad', x: 480, y: 350, r: 128, warn: 1.9, fire: 3.7, label: '② 중앙 원형 장판 폭발 (우측으로!)' },
      { type: 'purpleVoid', x: 480, y: 350, r: 135, warn: 3.8, fire: 5.1, label: '③ 다시 중앙으로 복귀!' }
    ],
    chain: {
      anchor: [480, 350],
      safeTarget: [645, 350],
      slash: { axis: 'x', at: 560, width: 50 },
      warn: 1.9,
      fire: 3.7
    }
  },
  {
    stepTitle: '5. [죽음의 세계] 3시 반시계 6연속 선 공격 + 땅울림 점프(C) & 붉은 꽃 습득',
    message: '3시에서 반시계로 돌며 6연속 선 공격을 피하고, 붉은 땅울림을 C 점프로 넘긴 뒤 [붉은 꽃]을 먹고 오른쪽으로 이동하세요.',
    duration: 6.5,
    worldState: true,
    startPos: [560, 340],
    envelope: { type: 'donut', from: [480, 340], to: [480, 340], r: 195 },
    attacks: [
      ...Array.from({ length: 6 }, (_, i) => ({
        type: 'slash',
        x: 480,
        y: 340,
        angle: -0.78 - i * (Math.PI / 6),
        width: 44,
        warn: 0.2 + i * 0.34,
        fire: 1.35 + i * 0.34
      })),
      { type: 'floorPad', x: 480, y: 340, r: 185, warn: 2.1, fire: 3.9, label: '바닥 전체 붉은 파동 장판' },
      { type: 'quake', warn: 2.3, fire: 3.9, label: '중앙 아래에서 C 점프!' },
      { type: 'purpleVoid', x: 480, y: 365, r: 125, warn: 2.5, fire: 4.1, label: '외곽 보랏빛 장판 폭발' }
    ],
    standaloneFlower: { point: [480, 370], appearAt: 4.0, color: 'red' }
  },
  {
    stepTitle: '6. [생명의 세계] 위로 이동하며 연속 세로 면 공격(①~④) 회피 & 우측 장판 진입',
    message: '오른쪽 위로 올라가며 순서대로 떨어지는 세로 면 공격(①→④)과 중앙 장판을 피해 우측 아래 안전 장판으로 이동하세요.',
    duration: 5.2,
    worldState: false,
    startPos: [560, 360],
    envelope: { type: 'donut', from: [610, 330], to: [650, 315], r: 180, startT: 0, endT: 3.0 },
    attacks: [
      { type: 'pillar', x1: 90, x2: 230, y1: 195, y2: 495, warn: 0.1, fire: 1.4, seq: 1, label: '① 세로 면 공격' },
      { type: 'pillar', x1: 230, x2: 370, y1: 195, y2: 495, warn: 0.4, fire: 1.8, seq: 2, label: '② 세로 면 공격' },
      { type: 'pillar', x1: 370, x2: 520, y1: 195, y2: 495, warn: 0.8, fire: 2.2, seq: 3, label: '③ 세로 면 공격' },
      { type: 'floorPad', x: 430, y: 360, r: 110, warn: 0.6, fire: 2.2, label: '중앙 바닥 장판' },
      { type: 'pillar', x1: 520, x2: 650, y1: 195, y2: 495, warn: 1.3, fire: 2.7, seq: 4, label: '④ 우중간 면 공격' },
      { type: 'safeSpot', point: [715, 395], r: 84, warn: 2.0, fire: 4.4, label: '우측 아래 장판으로 이동!' }
    ]
  },
  {
    stepTitle: '7. [생명의 세계] 좌하단 질주(면 공격 ①~⑥ 회피) → 우측 사슬 절단 & 푸른 꽃',
    message: '우측부터 떨어지는 6연속 면 공격(①~⑥)을 피해 왼쪽 아래로 달리다가, 끝나면 오른쪽으로 이동해 사슬을 끊고 [푸른 꽃]을 획득하세요.',
    duration: 6.6,
    worldState: false,
    startPos: [715, 395],
    envelope: { type: 'donut', from: [715, 395], to: [280, 395], r: 180, startT: 0, endT: 2.8, widenOnCut: true },
    attacks: [
      { type: 'pillar', x1: 750, x2: 890, y1: 195, y2: 495, warn: 0.1, fire: 1.3, seq: 1, label: '① 우측 끝 면 공격' },
      { type: 'pillar', x1: 620, x2: 750, y1: 195, y2: 495, warn: 0.4, fire: 1.6, seq: 2, label: '② 우중간 면 공격' },
      { type: 'floorPad', x: 640, y: 360, r: 95, warn: 0.3, fire: 1.7, label: '우측 바닥 장판' },
      { type: 'pillar', x1: 490, x2: 620, y1: 195, y2: 495, warn: 0.8, fire: 2.0, seq: 3, label: '③ 중앙 면 공격' },
      { type: 'pillar', x1: 360, x2: 490, y1: 195, y2: 495, warn: 1.2, fire: 2.4, seq: 4, label: '④ 좌중간 면 공격' },
      { type: 'floorPad', x: 450, y: 390, r: 95, warn: 1.1, fire: 2.5, label: '중앙 바닥 장판' },
      { type: 'pillar', x1: 70, x2: 220, y1: 195, y2: 495, warn: 1.8, fire: 3.2, seq: 5, label: '⑤ 좌측 끝 면 공격 (오른쪽으로!)' },
      { type: 'pillar', x1: 220, x2: 350, y1: 195, y2: 495, warn: 2.2, fire: 3.6, seq: 6, label: '⑥ 좌측 면 공격 (오른쪽으로!)' }
    ],
    chain: {
      anchor: [250, 395],
      safeTarget: [440, 395],
      slash: { axis: 'x', at: 345, width: 52 },
      warn: 2.1,
      fire: 4.2,
      flower: [485, 395],
      flowerColor: 'blue'
    }
  },
  {
    stepTitle: '8. [죽음의 세계] 꽃 획득 후 안전지대 대기 → 거대 붉은 바닥 장판 회피',
    message: '보랏빛 폭발을 안전지대 안에서 피한 뒤, 좌·중앙에 깔리는 거대 붉은 장판 밖(아래쪽 안전지대)으로 빠지세요.',
    duration: 5.0,
    worldState: true,
    startPos: [485, 395],
    envelope: { type: 'donut', from: [485, 395], to: [485, 395], r: 195 },
    attacks: [
      { type: 'purpleVoid', x: 520, y: 395, r: 130, warn: 0.2, fire: 1.9, label: '① 안전지대 장판 이동!' },
      { type: 'floorPad', x: 370, y: 325, r: 175, warn: 2.0, fire: 4.2, label: '② 거대 붉은 바닥 장판 (아래로!)' },
      { type: 'safeSpot', point: [545, 445], r: 82, warn: 2.0, fire: 4.2, label: '아래 안전지대 이동' }
    ]
  },
  {
    stepTitle: '9. [죽음의 세계] 11시 대각선 이동 사슬 절단 + 우측 장판 회피 & 붉은 꽃',
    message: '왼쪽 위(11시)로 이동해 사슬을 끊고, 우측 장판과 세로 면 공격을 피해 [붉은 꽃]을 획득하세요.',
    duration: 5.4,
    worldState: true,
    startPos: [545, 445],
    envelope: { type: 'donut', from: [460, 320], to: [460, 320], r: 185, widenOnCut: true },
    attacks: [
      { type: 'floorPad', x: 620, y: 370, r: 110, warn: 0.3, fire: 2.4, label: '우하단 바닥 장판' },
      { type: 'pillar', x1: 600, x2: 780, y1: 195, y2: 495, warn: 0.5, fire: 2.5, seq: 1, label: '우측 세로 면 공격' }
    ],
    chain: {
      anchor: [470, 395],
      safeTarget: [350, 245],
      slash: { axis: 'y', at: 325, width: 52 },
      warn: 0.2,
      fire: 2.6,
      flower: [450, 310],
      flowerColor: 'red'
    }
  },
  {
    stepTitle: '10. [역사 후반] 12시→1시 이동 후 아래로 내려와 양옆 면·중앙 폭발 뒤 꽃 획득',
    message: '세로 면 공격(①~③)을 피해 위쪽 끝(12시→1시)으로 이동했다가, 아래로 내려와 중앙 폭발이 끝난 직후 [붉은 꽃]을 획득하세요.',
    duration: 6.8,
    worldState: true,
    startPos: [450, 310],
    envelope: { type: 'donut', from: [480, 240], to: [545, 420], r: 170, startT: 1.8, endT: 4.5 },
    attacks: [
      { type: 'pillar', x1: 80, x2: 240, y1: 195, y2: 495, warn: 0.1, fire: 1.5, seq: 1, label: '① 좌측 면 공격' },
      { type: 'pillar', x1: 240, x2: 390, y1: 195, y2: 495, warn: 0.4, fire: 1.8, seq: 2, label: '② 좌중간 면 공격' },
      { type: 'pillar', x1: 610, x2: 760, y1: 195, y2: 495, warn: 0.7, fire: 2.1, seq: 3, label: '③ 우측 면 공격' },
      { type: 'safeSpot', point: [520, 225], r: 82, warn: 0.2, fire: 2.1, label: '12시 → 1시 조금씩 이동!' },
      { type: 'pillar', x1: 120, x2: 360, y1: 195, y2: 495, warn: 2.3, fire: 4.3, seq: 4, label: '④ 좌측 면 공격 (아래로!)' },
      { type: 'pillar', x1: 640, x2: 860, y1: 195, y2: 495, warn: 2.5, fire: 4.3, seq: 5, label: '⑤ 우측 면 공격' },
      { type: 'floorPad', x: 480, y: 315, r: 120, warn: 2.3, fire: 4.3, label: '중앙 장판 폭발 (끝나면 꽃 획득!)' },
      { type: 'safeSpot', point: [545, 445], r: 84, warn: 2.3, fire: 4.3, label: '아래로 내려와 대기!' }
    ],
    standaloneFlower: { point: [480, 340], appearAt: 4.3, color: 'red' }
  },
  {
    stepTitle: '11. [역사 마무리] 마지막 연속 면 공격(①~④) 회피 후 5시 카운터(X)',
    message: '마지막 세로 면 공격(①~④)과 바닥 장판을 피해 5시 안전지대로 이동한 뒤, 금색 안광 타이밍에 X키로 카운터를 넣으세요!',
    duration: 5.8,
    worldState: false,
    startPos: [480, 340],
    attacks: [
      { type: 'pillar', x1: 70, x2: 220, y1: 195, y2: 495, warn: 0.1, fire: 1.6, seq: 1, label: '① 세로 면 공격' },
      { type: 'pillar', x1: 220, x2: 370, y1: 195, y2: 495, warn: 0.4, fire: 1.9, seq: 2, label: '② 세로 면 공격' },
      { type: 'pillar', x1: 370, x2: 520, y1: 195, y2: 495, warn: 0.7, fire: 2.2, seq: 3, label: '③ 세로 면 공격' },
      { type: 'pillar', x1: 520, x2: 650, y1: 195, y2: 495, warn: 1.0, fire: 2.4, seq: 4, label: '④ 세로 면 공격' },
      { type: 'floorPad', x: 440, y: 350, r: 135, warn: 0.3, fire: 2.2, label: '중앙 바닥 장판' },
      { type: 'safeSpot', point: [755, 375], r: 85, warn: 0.3, fire: 2.4, label: '5시 카운터 위치' }
    ],
    counter: { point: [755, 375], appearAt: 2.4, readyAt: 3.0, fire: 5.8 }
  }
];
