import assert from "node:assert/strict";
import test from "node:test";
import { renderPlanStatus } from "./show-plan-status-core.mjs";

const entry = {
  plan: { title: "UI 컴포넌트화 테스트 계획" },
  taskState: {
    phases: [
      { id: "boundary", title: "UI 경계 조사", order: 0 },
      { id: "layout", title: "정적 레이아웃 컴포넌트 분리", order: 1 },
    ],
    tasks: [
      { id: "map", phaseId: "boundary", title: "현재 보드 상태 매핑", status: "applied" },
      { id: "contract", phaseId: "boundary", title: "컴포넌트 계약 정의", status: "running" },
      { id: "layout", phaseId: "layout", title: "레이아웃 분리", status: "saved" },
    ],
  },
};

test("Given Plan state When rendering compact Then phase tasks are listed with status icons", () => {
  const output = renderPlanStatus(entry, { format: "compact" });

  assert.match(output, /Plan: UI 컴포넌트화 테스트 계획/);
  assert.match(output, /Progress: 1\/3 applied/);
  assert.match(output, /Health: running/);
  assert.match(output, /✓ 현재 보드 상태 매핑/);
  assert.match(output, /▶ 컴포넌트 계약 정의/);
});

test("Given Plan state When rendering standard Then phase progress table is printed", () => {
  const output = renderPlanStatus(entry, { format: "standard" });

  assert.match(output, /1 \/ 3 applied · running 1 · saved 1/);
  assert.match(output, /Phase\s+Progress/);
  assert.match(output, /UI 경계 조사\s+1 \/ 2/);
  assert.match(output, /정적 레이아웃 컴포넌트 분리\s+0 \/ 1/);
});

test("Given Plan state When rendering rich Then progress bar and health are printed", () => {
  const output = renderPlanStatus(entry, { format: "rich", color: false });

  assert.match(output, /┌ UI 컴포넌트화 테스트 계획/);
  assert.match(output, /│ Progress\s+█+░+\s+1 \/ 3/);
  assert.match(output, /│ Running 1 · Saved 1 · Failed 0/);
  assert.match(output, /└ Health running/);
});

test("Given applied and saved tasks only When rendering compact Then health is complete", () => {
  const output = renderPlanStatus({
    plan: { title: "부분 완료 Plan" },
    taskState: {
      phases: [{ id: "phase", title: "Phase", order: 0 }],
      tasks: [
        { id: "done", phaseId: "phase", title: "완료된 작업", status: "applied" },
        { id: "saved", phaseId: "phase", title: "대기 중 작업", status: "saved" },
      ],
    },
  }, { format: "compact" });

  assert.match(output, /Health: complete/);
});

test("Given saved tasks only When rendering compact Then health is not-started", () => {
  const output = renderPlanStatus({
    plan: { title: "시작 전 Plan" },
    taskState: {
      phases: [{ id: "phase", title: "Phase", order: 0 }],
      tasks: [
        { id: "saved-1", phaseId: "phase", title: "대기 중 작업 1", status: "saved" },
        { id: "saved-2", phaseId: "phase", title: "대기 중 작업 2", status: "saved" },
      ],
    },
  }, { format: "compact" });

  assert.match(output, /Health: not-started/);
});
