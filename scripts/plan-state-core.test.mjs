import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { upsertPlanState } from "./plan-state-core.mjs";

test("Given structured plan input When upserting plan state Then plan and task files are written", async () => {
  const root = await mkdtemp(join(tmpdir(), "giqo-plan-state-"));
  const now = new Date("2026-07-23T00:00:00.000Z");

  const result = await upsertPlanState({
    root,
    now,
    input: {
      plan: { title: "Plan Task Dashboard", summary: "Track work." },
      phases: [{ id: "model", title: "Model", order: 0 }],
      tasks: [{ id: "write-policy", phaseId: "model", title: "Write policy", status: "saved", sourceDocs: ["05_IMPLEMENTATION_PLAN.md"] }],
    },
  });

  const plan = JSON.parse(await readFile(result.planPath, "utf8"));
  const tasks = JSON.parse(await readFile(result.tasksPath, "utf8"));
  assert.equal(result.planId, "plan-20260723-plan-task-dashboard");
  assert.equal(plan.docsPath, ".giqo/plans/plan-20260723-plan-task-dashboard/docs");
  assert.equal(tasks.phases[0].id, "phase-model");
  assert.equal(tasks.tasks[0].id, "task-write-policy");
  assert.equal(tasks.tasks[0].status, "saved");
});

test("Given existing task evidence When updating the same task Then evidence is preserved unless replaced", async () => {
  const root = await mkdtemp(join(tmpdir(), "giqo-plan-state-"));
  const now = new Date("2026-07-23T00:00:00.000Z");
  const input = {
    plan: { title: "Evidence Plan" },
    phases: [{ id: "apply", title: "Apply" }],
    tasks: [{ id: "code", phaseId: "apply", title: "Code", status: "running", evidence: { changedFiles: ["README.md"] } }],
  };

  await upsertPlanState({ root, now, input });
  const result = await upsertPlanState({
    root,
    now: new Date("2026-07-23T00:01:00.000Z"),
    input: { ...input, tasks: [{ id: "code", phaseId: "apply", title: "Code", status: "applied" }] },
  });

  const tasks = JSON.parse(await readFile(result.tasksPath, "utf8"));
  assert.equal(tasks.tasks[0].status, "applied");
  assert.deepEqual(tasks.tasks[0].evidence.changedFiles, ["README.md"]);
});
