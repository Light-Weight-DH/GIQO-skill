#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PlanStateError, upsertPlanState } from "./plan-state-core.mjs";

function printHelp() {
  console.log(`GIQO Plan State updater

Usage:
  node scripts/update-plan-state.mjs --input plan-state.json [--root .] [--plan-id plan-custom]

Input JSON shape:
  {
    "plan": { "title": "Plan title", "summary": "Optional", "parentPlanId": null },
    "phases": [{ "id": "phase-one", "title": "Phase one", "order": 0 }],
    "tasks": [{ "id": "task-one", "phaseId": "phase-one", "title": "Task one", "status": "saved" }]
  }

Writes:
  .giqo/plans/<plan-id>/plan.json
  .giqo/plans/<plan-id>/tasks.json
`);
}

function parseArgs(argv) {
  const options = { root: ".", input: "", planId: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      return { kind: "help" };
    }
    if (arg === "--root") {
      options.root = argv[index + 1] ?? options.root;
      index += 1;
      continue;
    }
    if (arg === "--input") {
      options.input = argv[index + 1] ?? options.input;
      index += 1;
      continue;
    }
    if (arg === "--plan-id") {
      options.planId = argv[index + 1] ?? options.planId;
      index += 1;
      continue;
    }
  }
  return { kind: "run", options };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.kind === "help") {
    printHelp();
    return;
  }
  if (!parsed.options.input) {
    throw new PlanStateError("--input is required.");
  }

  const inputPath = resolve(parsed.options.input);
  const input = JSON.parse(await readFile(inputPath, "utf8"));
  const result = await upsertPlanState({
    root: resolve(parsed.options.root),
    input,
    planId: parsed.options.planId || undefined,
  });
  console.log(`Plan state updated: ${result.planId}`);
  console.log(`- ${result.planPath}`);
  console.log(`- ${result.tasksPath}`);
  console.log(`Phases: ${result.phaseCount}, Tasks: ${result.taskCount}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    if (error instanceof PlanStateError || error instanceof SyntaxError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  });
}
