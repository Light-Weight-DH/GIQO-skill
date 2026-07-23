import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { linkReviewRequests } from "./link-review-requests.mjs";

test("Given saved Visual Review requests When linking to a phase Then tasks reference review request ids", async () => {
  const root = await mkdtemp(join(tmpdir(), "giqo-link-review-"));
  await writePlanState(root);
  await writeReviewState(root, [
    {
      id: "request-hero-copy",
      targetId: "home.hero.cta",
      requestedChange: "Rename CTA to Start trial",
      acceptanceSignal: "CTA text says Start trial",
      status: "saved",
    },
  ]);

  const result = await linkReviewRequests({ root, planId: "plan-ui", screen: "home", phaseId: "phase-ui-polish" });

  const tasks = await readJson(join(root, ".giqo", "plans", "plan-ui", "tasks.json"));
  const review = await readJson(join(root, ".giqo", "ui-review", "home", "change-requests.json"));
  assert.equal(result.linkedCount, 1);
  assert.equal(tasks.tasks[0].sourceReviewRequests[0], "request-hero-copy");
  assert.equal(tasks.tasks[0].targetFiles[0], "UI target: home.hero.cta");
  assert.equal(review.requests[0].linkedTask, tasks.tasks[0].id);
});

test("Given an existing linked task When linking again Then task status and evidence are preserved", async () => {
  const root = await mkdtemp(join(tmpdir(), "giqo-link-review-"));
  await writePlanState(root, [
    {
      id: "task-home-hero-cta-request-hero-copy",
      phaseId: "phase-ui-polish",
      title: "Rename CTA to Start trial",
      status: "running",
      sourceReviewRequests: ["request-hero-copy"],
      evidence: { changedFiles: ["src/page.tsx"], verification: [], manualQa: [], notes: [] },
      createdAt: "2026-07-23T00:00:00.000Z",
      updatedAt: "2026-07-23T00:00:00.000Z",
    },
  ]);
  await writeReviewState(root, [
    {
      id: "request-hero-copy",
      targetId: "home.hero.cta",
      requestedChange: "Rename CTA to Start trial",
      status: "saved",
    },
  ]);

  await linkReviewRequests({ root, planId: "plan-ui", screen: "home", phaseId: "phase-ui-polish" });

  const tasks = await readJson(join(root, ".giqo", "plans", "plan-ui", "tasks.json"));
  assert.equal(tasks.tasks.length, 1);
  assert.equal(tasks.tasks[0].status, "running");
  assert.deepEqual(tasks.tasks[0].evidence.changedFiles, ["src/page.tsx"]);
});

async function writePlanState(root, tasks = []) {
  const planDir = join(root, ".giqo", "plans", "plan-ui");
  await mkdir(planDir, { recursive: true });
  await writeJson(join(planDir, "plan.json"), {
    id: "plan-ui",
    title: "UI Plan",
    docsPath: ".giqo/plans/plan-ui/docs",
    createdAt: "2026-07-23T00:00:00.000Z",
    updatedAt: "2026-07-23T00:00:00.000Z",
  });
  await writeJson(join(planDir, "tasks.json"), {
    planId: "plan-ui",
    updatedAt: "2026-07-23T00:00:00.000Z",
    phases: [{ id: "phase-ui-polish", title: "UI polish", order: 0 }],
    tasks,
  });
}

async function writeReviewState(root, requests) {
  const reviewDir = join(root, ".giqo", "ui-review", "home");
  await mkdir(reviewDir, { recursive: true });
  await writeJson(join(reviewDir, "change-requests.json"), { requests });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
