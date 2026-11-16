# 인수인계 문서 (HANDOVER) — 역사의 끝 (유리지에) 시뮬레이터

- **최종 업데이트**: 2026-11-16
- **현재 캐시 버스팅 버전**: `?v=1.0.2` (`index.html` 및 `js/engine.js` 모듈 import)
- **참고 영상**: `https://youtu.be/EIZBq5Z6--0?t=215` (3:35 역사 개막 암흑 일식 연출 & 순차 4연타 사선 워닝 기준) / `https://youtu.be/iLjcQnN_wEk?t=590`
- **프로젝트 경로**: `yurisie-history/` (기존 `dnf-yurisie-simulator-main/`은 참고 및 원본 에셋 보관용으로 유지)

---

## 1. 구현 완료 현황
- **패턴 집중 모듈화**: 4대 패턴 중 **2패턴 『역사의 끝 (11구간)』**만 독립 프로젝트로 분리 구현 완료
- **싱크 개선 사항**:
  1. **오디오-타임라인 1:1 동기화** (`js/audio.js`): 일시정지(`Space`), 배속(`0.75x / 1.0x / 1.25x`) 변경 시 BGM 및 성우 보이스의 재생/일시정지/`playbackRate`가 게임 시간과 함께 동기화됨.
  2. **예고-발동 타이밍 일치** (`js/engine.js`, `js/renderer.js`): 모든 공격 발동 `0.16s` 전에 예고 테두리 강조 + `tick` 사운드 출력 후, 정확한 `fire` 프레임에 공격 판정 및 타격음 출력.
  3. **하단 실시간 타임라인 싱크 바**: 현재 구간 진행 시간(`elapsed / duration`)과 공격(빨강)·사슬(초록)·꽃(파랑)·카운터(금색) 발동 마커를 실시간 표시.
  4. **구간별 시작 위치(`startPos`) 지정** (`js/data/historyPattern.js`): `[`, `]` 키 또는 우측 목록 클릭으로 임의 구간 점프 시 해당 구간의 시작 좌표로 정확히 배치됨.
  5. **꽃 습득 시 강제 스킵 제거**: 꽃을 먹더라도 현재 구간의 남은 위험 요소/흐름이 끊기지 않도록 수정.
  6. **무적 연습 모드 (`무적 연습: ON/OFF`)**: 동선·타이밍 숙달용 무적 토글 추가.

---

## 2. 디렉터리 구조
- `index.html`: 메인 UI, 캐시 버스팅(`?v=1.0.0`), 타임라인 바, 11구간 사이드바
- `css/style.css`: 다크 테마 스타일시트
- `js/audio.js`: `SyncAudioEngine` (BGM, 보이스 더킹, `tick`/`slash`/`quake`/`chain`/`flower`/`counter` 효과음)
- `js/data/historyPattern.js`: `HISTORY_STAGES` (역사 1~11구간 타임라인 및 `startPos` 데이터)
- `js/renderer.js`: `renderFrame` (960×540 캔버스 렌더링, 예고 게이지, 스프라이트 애니메이션)
- `js/engine.js`: 게임 루프, 입력, 물리, 충돌 판정, UI 연동
- `assets/`: `dnf-yurisie-simulator-main/assets/`에서 복사된 이미지·오디오 에셋

---

## 3. 작업 재개 / GitHub 업로드 체크리스트
1. **수정 후 캐시 버스팅**: `index.html` 및 `js/engine.js`의 `?v=1.0.0` 번호를 올린 뒤 커밋/업로드하세요.
2. **로컬 실행 테스트**: `yurisie-history/` 폴더에서 로컬 웹 서버(예: `python -m http.server` 또는 VS Code Live Server)로 `index.html`을 열어 테스트합니다 (`type="module"` 사용으로 `file://` 직접 열기는 CORS 제한이 있을 수 있음).
3. **GitHub 업로드**: 현재 PC에 `git`이 미설치되어 있으므로, 새 GitHub 계정에 저장소를 만든 뒤 웹 업로드 또는 Git for Windows 설치 후 푸시하세요.
4. **다음 작업 후보**:
   - 역사 11구간 실제 플레이 후 세부 타이밍(`warn`/`fire`/`duration`) 미세 튜닝
   - 나머지 패턴(**생명 · 죽음 · 생사**)을 동일한 모듈 구조로 순차 추가
