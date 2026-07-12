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

생성된 HTML은 안정적인 `data-gqo-id`를 사용합니다. 사용자는 화면 요소를 클릭해서 코멘트나 수정 요청을 남길 수 있습니다. 이후 GIQO는 저장된 피드백을 읽어 `06_UI_UX_SPEC.md`, `05_IMPLEMENTATION_PLAN.md`, 미해결 리스크 문서를 갱신합니다.

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

브라우저에서 저장한 수정 요청은 GIQO가 다음 단계에서 읽을 수 있는 작업 항목으로 보관됩니다. 브라우저 화면 자체는 실제 소스 코드를 직접 수정하지 않으며, 실제 반영은 `/giqo-apply` 또는 자연어로 “저장된 UI 수정 요청 진행해줘”라고 요청했을 때 수행합니다.

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

## 사용 예시

아래 문장은 고정된 명령어가 아니라 예시입니다. 같은 의도라면 자연어로 말해도 됩니다.

```text
./input을 GIQO로 분석해서 구현에 필요한 설계 문서만 만들어줘.
불명확한 건 최소한만 질문하고, 내가 스킵하면 합리적으로 가정해서 기록해줘.
```

UI 리뷰 피드백 반영 예시:

```text
ui-review/comments.json을 읽고 UI/UX 명세와 구현 계획을 업데이트해줘.
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
