# GIQO Skill

<p align="right">
  <a href="README.en.md"><strong>Read in English</strong></a>
</p>

**GIQO**는 **Garbage In, Quality Out**의 줄임말입니다. 정리되지 않은 요구사항, 이미지, 레퍼런스, 기존 프로젝트 파일을 바탕으로 실제 구현에 쓸 수 있는 설계 문서와 작업 계획을 만드는 스킬입니다.

사용자는 자료를 완벽하게 정리할 필요가 없습니다. 폴더에 대강 올려둔 문서, 스크린샷, 메모, 기존 코드, 리뷰 코멘트를 GIQO가 읽고 분류한 뒤, 필요한 질문만 하고, 사용자가 스킵하면 합리적인 가정을 기록하며, 프로젝트에 필요한 문서만 생성합니다.

## GIQO가 만드는 것

GIQO는 가능한 모든 문서를 무조건 만들지 않습니다. 입력 자료와 프로젝트 성격을 보고 필요한 산출물만 선택합니다.

- `00_INDEX.md` - 생성된 설계 패키지의 길잡이 문서
- `01_REQUIREMENTS.md` - 요구사항, 제약, 수용 기준 정리
- `02_ASSUMPTIONS.md` - 자료가 부족할 때 세운 가정 기록
- `03_PRODUCT_SPEC.md` - 사용자 목표, 범위, 워크플로우, 비목표
- `04_ARCHITECTURE.md` - 시스템 구조, 모듈, 데이터 흐름, 연동 지점
- `05_IMPLEMENTATION_PLAN.md` - 구현 에이전트가 바로 따라갈 작업 계획
- `06_UI_UX_SPEC.md` - UI 구조, 상태, 접근성, 와이어프레임/목업 메모
- `07_DATA_MODEL.md` - 엔티티, 관계, ERD, 저장소 관련 메모
- `08_API_SPEC.md` - API, 명령, 외부 계약, 오류 모델
- `09_RISK_AND_DECISIONS.md` - 리스크, 결정 사항, 미해결 이슈

필요할 때는 Mermaid 다이어그램도 생성합니다.

- ERD
- Flowchart
- Sequence Diagram
- Gantt Chart

## Visual Review Mode

UI가 중요한 프로젝트에서는 브라우저에서 열 수 있는 리뷰 화면을 생성할 수 있습니다.

```text
ui-review/
├── wireframe.html
├── mockup.html
├── review.css
├── review.js
├── comments.schema.json
└── review-export.md
```

생성된 HTML은 안정적인 `data-gqo-id`를 사용합니다. 사용자는 화면 요소를 클릭하거나 Target 목록에서 선택해 코멘트나 수정 요청을 남길 수 있습니다. 로컬 런처로 열면 피드백은 `.giqo/ui-review/<screen>/`에 자동 저장되고, 이후 GIQO는 저장된 피드백을 읽어 `06_UI_UX_SPEC.md`, `05_IMPLEMENTATION_PLAN.md`, 미해결 리스크 문서를 갱신합니다.

리뷰 화면 실행:

```bash
node scripts/open-visual-review.mjs templates/visual-review/mockup.html
```

수정 요청 모드로 열고 실제 앱 화면을 연결:

```bash
node scripts/open-visual-review.mjs ./ui-review/mockup.html --mode edit --actual http://localhost:3000
```

기타 예시:

```bash
node scripts/open-visual-review.mjs templates/visual-review/wireframe.html
node scripts/open-visual-review.mjs ./ui-review/mockup.html --port 9000
node scripts/open-visual-review.mjs --no-open
```

브라우저에서 저장한 수정 요청은 GIQO가 다음 단계에서 읽을 수 있는 작업 항목으로 `.giqo/ui-review/<screen>/change-requests.json`에 보관됩니다. 동시에 현재 보이는 reviewable 요소 목록은 `targets.json`에 저장되어 다음 실행 때 초기 UI 매핑 시간을 줄입니다. 숨겨진 요소나 화면 밖 상태는 처음부터 전부 파악하지 않고, 사용자가 해당 상태를 열거나 요청할 때 lazy mapping합니다. 상태는 사용자가 직접 바꾸는 선택지가 아니라 agent가 작업 진행에 따라 `saved`, `running`, `applied`, `failed`로 갱신하는 값입니다. 브라우저 화면 자체는 실제 소스 코드를 직접 수정하지 않으며, 실제 반영은 `/giqo-apply` 또는 자연어로 “저장된 UI 수정 요청 진행해줘”라고 요청했을 때 수행합니다.

`--actual`로 연결한 실제 화면은 v1에서 비교용 링크입니다. 실제 실행 중인 앱 위에 직접 코멘트를 다는 모드는 앱의 `data-gqo-id` 노출과 브라우저 보안 제약을 해결하는 별도 bridge가 필요합니다.

## 기존 프로젝트와 명령

기존 레포에 적용할 때는 `.giqo/` 작업 공간을 사용합니다. 입력 자료, 실행 기록, UI 리뷰 산출물을 애플리케이션 소스와 분리해 보관하고, 명시적인 apply 단계 전에는 소스 파일을 건드리지 않는 것을 기본값으로 합니다.

명령 명세는 `commands/`에 있습니다. 플랫폼마다 실제 등록 방식은 다를 수 있지만, GIQO가 제공하는 표준 동작 단위는 아래와 같습니다.

| Command | 역할 | 주로 쓰는 상황 |
|---|---|---|
| `/giqo-init` | `.giqo/` 작업 공간을 만들거나 갱신 | 새 프로젝트 또는 기존 레포에 GIQO를 붙일 때 |
| `/giqo-plan` | 입력 자료를 분석하고 필요한 설계 문서만 생성 | 요구사항/이미지/레퍼런스로 계획을 만들 때 |
| `/giqo-ui` | UI 문서와 리뷰 가능한 화면을 생성/갱신 | 와이어프레임, 목업, UI 코멘트 화면이 필요할 때 |
| `/giqo-apply` | 승인된 문서/리뷰 산출물/허용된 변경을 반영 | 저장된 UI 수정 요청이나 승인된 계획을 실제 작업으로 진행할 때 |
| `/giqo-ingest` | 새 코멘트, 수정 요청, 추가 자료를 읽어 기존 계획에 반영 | 리뷰 이후 피드백을 다시 설계에 합칠 때 |

명령을 정확히 입력하지 않아도 됩니다. 예를 들어 “UI 수정 모드 열어줘”, “이 코멘트 반영해서 계획 업데이트해줘”처럼 자연어로 요청해도 GIQO가 가장 가까운 command 흐름을 선택하도록 설계되어 있습니다.

요청에 필요한 문서나 저장된 작업이 없으면 억지로 진행하지 않고 현재 상태를 알려줍니다. 예를 들어 “UI 수정 진행해줘”라고 했는데 저장된 수정 요청이 없다면 “현재 따로 저장된 UI 수정 요청이 없습니다”처럼 답합니다.

## 지원 플랫폼

- Claude / Claude Code
- Codex
- OpenCode
- `SKILL.md`와 `references/`를 읽을 수 있는 에이전트 환경

## 설치와 사용 준비

GIQO는 별도 빌드가 필요한 패키지가 아니라, 에이전트가 읽는 **스킬 폴더**입니다. 설치의 핵심은 이 저장소를 에이전트가 접근할 수 있는 위치에 두고 `SKILL.md`, `commands/`, `references/`, `templates/`를 함께 읽게 하는 것입니다.

### 1. 저장소 받기

```bash
git clone <repo-url> GIQO-skill
cd GIQO-skill
```

### 2. 에이전트에 연결하기

사용 중인 환경에 맞게 아래 중 하나로 연결합니다.

| 환경 | 권장 방식 |
|---|---|
| Claude / Claude Code | 스킬 디렉터리로 `GIQO-skill/`을 등록하거나, 작업 세션에서 이 폴더의 `SKILL.md`를 참조하게 합니다. |
| Codex | 작업 레포 옆이나 공용 skills 폴더에 두고, 요청 시 `GIQO-skill/SKILL.md`를 기준 지침으로 읽게 합니다. |
| OpenCode | skills 경로에 이 폴더를 두거나, 세션에서 이 저장소를 열고 GIQO 요청을 실행합니다. |
| 기타 에이전트 | `SKILL.md`를 시작 지침으로 읽고 `references/`, `commands/`, `templates/`를 같은 상대 경로로 접근하게 합니다. |

### 3. 프로젝트에서 사용하기

새 프로젝트나 기존 레포에서 다음처럼 요청하면 됩니다.

```text
GIQO로 이 프로젝트 입력 자료를 분석해서 구현에 필요한 설계 문서만 만들어줘.
```

기존 프로젝트라면 GIQO는 기본적으로 `.giqo/` 작업 공간에 자료와 실행 결과를 정리합니다. 애플리케이션 소스 파일은 명시적인 apply 단계 전에는 수정하지 않습니다.

### 4. UI 리뷰 실행 준비

Visual Review 화면을 직접 열려면 Node.js가 필요합니다. 별도 패키지 설치 없이 저장소의 스크립트를 실행합니다.

```bash
node scripts/open-visual-review.mjs templates/visual-review/mockup.html
```

저장된 UI 수정 요청을 실제 작업으로 반영하고 싶으면 자연어로 요청하면 됩니다.

```text
저장된 UI 수정 요청 있으면 확인하고 적용 가능한 작업을 진행해줘.
```

저장된 요청이나 필요한 문서가 없으면 GIQO는 현재 상태를 알려주고 멈춥니다.

## 사용 예시

아래 문장은 고정된 명령어가 아니라 예시입니다. 같은 의도라면 자연어로 말해도 됩니다.

```text
./input을 GIQO로 분석해서 구현에 필요한 설계 문서만 만들어줘.
불명확한 건 최소한만 질문하고, 내가 스킵하면 합리적으로 가정해서 기록해줘.
```

UI 리뷰 피드백 반영 예시:

```text
.giqo에 저장된 UI 리뷰 피드백을 읽고 UI/UX 명세와 구현 계획을 업데이트해줘.
```

같은 의미의 자연어 예시:

```text
방금 리뷰 코멘트 반영해서 UI 문서랑 구현 계획 정리해줘.
```

수정 요청 반영 예시:

```text
저장된 UI 수정 요청 확인하고 적용 가능한 작업을 진행해줘.
```

같은 의미의 자연어 예시:

```text
아까 저장한 UI 수정사항 있으면 반영해줘.
```

## 저장소 구조

```text
GIQO-skill/
├── SKILL.md
├── README.md
├── README.en.md
├── commands/
├── scripts/
├── references/
├── templates/
│   ├── docs/
│   ├── mermaid/
│   └── visual-review/
└── examples/
```

## 핵심 원칙

목표는 문서를 많이 만드는 것이 아닙니다. 구현자가 무엇을 만들고, 무엇을 제외하고, 어디서 시작해야 하는지 바로 알 수 있는 설계 패키지를 만드는 것입니다.
