## 0. 서비스 개요

- 이름: **Polaroid Studio**
- 목적: 사용자가 웹캠으로 사진을 찍고, 폴라로이드 스타일로 꾸민 뒤, 화면 위에 자유롭게 배치·저장할 수 있는 작은 플레이 그라운드.
- 특성: **완전 프론트엔드 기반, 로컬 상태 중심(MVP)**
    - 사진은 브라우저 메모리/LocalStorage에만 저장 (로그인·서버 업로드 없음).
    - “사이트 링크 복사”는 개별 사진 링크가 아닌, 현재 서비스 URL 복사로 정의.

---

## 1. 화면 구조

### 1.1 레이아웃

- **좌측 영역 (카메라 존)**
    - 폴라로이드 카메라 일러스트
        - 렌즈 원형 안에 실시간 웹캠 프리뷰가 마스킹되어 보임.
        - 카메라 버튼(원형 셔터 버튼): 마우스 클릭 시 촬영.
        - 플래시 영역, 작은 뷰파인더 등은 데코 요소.
- **우측 영역 (캔버스 존)**
    - 초기에는 빈 회색 도트 패턴 배경.
    - 촬영된 폴라로이드 카드들이 드래그앤드롭으로 배치되는 영역.
- **상단 우측**
    - **Settings 아이콘 (톱니바퀴)**
        - Default: 아이콘만 보여줌.
        - Hover 시 Tooltip: `'Settings'` 텍스트 노출.
        - 클릭 시 오른쪽 상단에 작은 패널(모달 또는 드로어) 오픈.
- **하단 중앙**
    - 안내 문구: `"Press the spacebar to take a picture."`
        - 살짝 투명, 숨쉬기 애니메이션(천천히 페이드 인/아웃).
        - 웹캠 권한 미허용/에러 시에는 안내 문구를 에러 메시지로 교체.

---

## 2. 주요 상태 정의

브라우저 단 상태(예시):

```tsx
type PolaroidPhoto = {
  id: string;              // uuid
  dataUrl: string;         // 캡쳐된 이미지 (canvas -> dataURL)
  x: number;               // 캔버스 내 위치
  y: number;
  rotation: number;        // 약간의 랜덤 각도
  caption: string;         // 프레임 하단 문구
  createdAt: string;       // ISO date
  bgColor: string;         // 사진 프레임 배경색 (Settings 값 복제)
};

type Settings = {
  polaroidBgColor: string; // default: #ffffff
};

type AppState = {
  photos: PolaroidPhoto[];
  settings: Settings;
  isCameraReady: boolean;  // 웹캠 스트림 연결 여부
  isTakingPhoto: boolean;  // 셔터 애니메이션/렌더링 중
};

```

---

## 3. 기능/정책 정의

### #1 기본 UI / 안내 문구

- 페이지 로드 시:
    - 웹캠 권한 요청.
    - `isCameraReady === true`가 되면 렌즈 안에서 프리뷰 시작.
- 하단 안내 문구:
    - 상태별 텍스트:
        - 정상: `Press the spacebar to take a picture.`
        - 카메라 준비 중: `Initializing camera...`
        - 권한 거부: `Camera access denied. Please allow camera permission in your browser settings.`
        - 에러: `Unable to access your camera. Please check your device.`
- 모바일 환경:
    - spacebar 안내 문구 아래에 작은 텍스트로 `On mobile, tap the camera button.` 추가 고려.

---

### #2 렌즈 안에 웹캠 프리뷰

- 렌즈 영역은 **고정 원형 마스크**.
- 웹캠 비디오 element는 실제로는 직사각형이지만 CSS clip-path 또는 SVG 마스크로 원형으로 잘라서 렌즈 안에 표시.
- 프리뷰 동작:
    - 권한 승인 후 즉시 재생.
    - 권한이 없거나 에러 시, 렌즈 안에는 기본 “No Camera” 일러스트 또는 아이콘 노출.

---

### #3 촬영 행동 (마우스 클릭 / Spacebar)

**트리거 조건**

- 사용자가 아래 중 하나를 수행:
    1. 카메라 버튼 클릭
    2. 키보드 `Spacebar` 입력 (문서 focus 상태, 입력 폼에 focus 되어 있지 않을 때만)

**촬영 시나리오**

1. `isCameraReady === true`이고 `isTakingPhoto === false`인 경우만 촬영 가능.
2. 촬영 입력이 들어오면:
    - `isTakingPhoto = true` 설정.
    - 카메라 셔터 애니메이션:
        - 렌즈 부분이 잠깐 흰색 플래시.
        - 카메라 전체가 살짝 흔들리는 효과(optional).
        - 셔터 소리 효과음 재생(optional, mute toggle 고려).
    - 동시에 현재 비디오 프레임을 `canvas`로 그려 `dataURL` 생성.
3. 새 폴라로이드 객체 생성:
    - `dataUrl` = 캔버스에서 추출한 이미지.
    - `caption` = 기본값: `""` 또는 날짜 텍스트(`YYYY.MM.DD`).
    - `bgColor` = 현재 Settings의 `polaroidBgColor`.
    - `x, y` = 카메라 상단 근처(“인화되는 위치”)로 초기 지정.
    - `rotation` = -5° ~ +5° 랜덤.
4. 인화 애니메이션:
    - 카메라 상단 Slot에서 새 폴라로이드 카드가 `translateY`로 위로 올라오는 애니메이션 (0.8~1.2s 정도).
    - 이 동안 드래그 불가.
    - 애니메이션 종료 후, 카드가 우측 캔버스로 “툭” 떨어지는 모션 또는 그 자리에서 그대로 드래그 가능 상태 전환.
    - 마지막에 `isTakingPhoto = false`.

**예외 정책**

- `isCameraReady === false`인 상태에서 촬영 시도:
    - 셔터 애니메이션 없음.
    - 하단 안내 문구를 잠시 빨간색으로: `Camera is not ready yet.` (3초 후 원복).
- 촬영 중 연타 방지:
    - `isTakingPhoto === true` 동안 추가 클릭/Spacebar 입력 무시.

---

### #4 인화된 사진 드래그 & 배치

- 각 폴라로이드는 우측 캔버스 영역 위에 **absolute positioning**.
- Drag 정책:
    - 마우스 다운 후 이동: `x, y` 지속 업데이트.
    - 드랍 시 위치 고정.
- Z-index 정책:
    - 사진을 클릭/드래그 시작할 때, 해당 사진이 항상 가장 위로 오도록 `zIndex`를 재정렬.
- 경계 정책:
    - 캔버스 밖으로 나가는 것은 허용하되, 완전히 사라지지 않을 정도까지만 허용
        
        (예: 20px 정도 여백까지만).
        
- 상태 저장:
    - 드래그 종료 시 `photos` 상태 업데이트.
    - 선택적으로 LocalStorage에 `photos`를 저장하여 F5 후에도 복원 가능하게 할 수 있음(MVP에선 옵션).

---

### #5 사진 더블클릭 → 문구 기입

- 더블클릭 대상: 폴라로이드 카드 전체 영역.
- 행동:
    1. 더블클릭 시 작은 인풋 UI 등장.
        - 방식 A: 카드 하단 캡션 영역을 인라인 텍스트 입력 필드로 전환.
        - 방식 B: 중앙에 작은 모달을 띄워 입력.
    2. 입력 후 엔터 또는 “Done” 버튼 클릭 시 저장.
    3. ESC 누르면 변경 취소.
- 정책:
    - 최대 글자 수: 예) 30~40자.
    - 여러 줄 허용 여부:
        - 폴라로이드 느낌을 살리려면 **한 줄**만 권장.
    - 기본값:
        - 촬영 시간 기준 날짜 문구 제공 가능.
        - 예: `May I meet you`와 같이 프리셋 없이, 사용자가 자유롭게 쓰도록 하거나,
            
            최초에는 빈 문자열로 두고 더블클릭 유도.
            

---

### #6 사진 우클릭 메뉴 (컨텍스트 메뉴)

- 기본 브라우저 우클릭 메뉴를 **커스텀 컨텍스트 메뉴**로 대체.

**우클릭 메뉴 항목**

1. `Copy image to clipboard`
    - 폴라로이드 전체(프레임 + 캡션 포함)를 canvas로 다시 렌더링 후, `Clipboard API`로 이미지 복사 시도.
    - 지원하지 않는 브라우저에서는 회색 disabled 표시 또는 안내 토스트: `Copy is not supported in this browser.`
2. `Download as image...`
    - 동일하게 캔버스로 합성한 이미지를 `a[download]` 링크로 트리거.
    - 기본 파일명 포맷: `polaroid-YYYYMMDD-HHMMSS.png`.
3. `Copy site link`
    - 현재 페이지 URL을 클립보드로 복사.
    - 토스트: `Link copied to clipboard.`
- 보조 정책:
    - 메뉴 바깥 클릭 또는 ESC 키 → 컨텍스트 메뉴 닫힘.
    - 다른 사진을 우클릭하면, 기존 메뉴 닫고 새 메뉴 위치에 오픈.

---

### #7 Settings – 폴라로이드 배경 색 변경

- Settings 패널 내용:
    1. **Color picker**
        - Label: `Polaroid background color`
        - HTML `<input type="color">` + hex 코드 텍스트 표시.
    2. **Preset 컬러칩** (선택)
        - 화이트, 아이보리, 베이비핑크, 민트, 스카이블루 등 몇 개.
        - 칩 클릭 시 color picker 값도 같이 변경.
- 적용 정책:
    - Settings에서 색을 변경하면:
        - 이후 새로 촬영되는 사진들의 `bgColor`에 **새 값**이 저장.
        - 기존에 촬영되어 있던 사진들에 대해:
            - **MVP 정책 제안**: 이미 촬영된 사진은 그대로 유지 (사진마다 다른 색 써볼 수 있음).
            - 향후 옵션:
                - “Apply to existing photos” 토글을 추가하여 일괄 변경도 가능.
- 상태 유지:
    - `settings.polaroidBgColor`는 LocalStorage에 저장해서 재방문 시에도 유지.

---

## 4. 기타 정책 & 엣지 케이스

1. **웹캠 권한 거부**
    - 첫 진입 시 권한 거부 → 화면 중앙에 안내 모달:
        - `We need your camera to take a picture.`
            
            `Please allow camera access in your browser settings and refresh the page.`
            
    - 이 상태에서도 UI는 보이되, 촬영 버튼/spacebar는 비활성화.
2. **웹캠 미지원 환경(데스크탑 일부, iOS 브라우저 이슈 등)**
    - 렌즈 안에 “Camera not supported on this device.” 메시지.
    - 촬영 기능 완전 비활성화.
3. **사진 개수 제한**
    - 기본 최대 20장 정도로 제한.
    - 초과 촬영 시:
        - 토스트: `You can only have up to 20 photos. Please delete some before taking new ones.`
    - (추가 정책) 우클릭 메뉴에 `Delete photo` 항목을 넣을 수도 있음.
4. **반응형**
    - 모바일/태블릿에서는 카메라를 상단에, 캔버스를 하단에 배치하는 세로 레이아웃 고려.
    - 드래그는 터치 드래그 지원.