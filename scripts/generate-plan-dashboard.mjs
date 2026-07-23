#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { PlanDashboardError, generatePlanDashboard } from "./plan-dashboard-generator.mjs";

function printHelp() {
  console.log(`GIQO Plan Dashboard generator

Usage:
  node scripts/generate-plan-dashboard.mjs --plan-id plan-id [--root .] [--output-dir path]
  node scripts/generate-plan-dashboard.mjs --all [--root .] [--output-dir path]

Reads:
  .giqo/plans/<plan-id>/plan.json
  .giqo/plans/<plan-id>/tasks.json

Writes:
  dashboard.html
  dashboard.css
  dashboard.js
`);
}

function parseArgs(argv) {
  const options = { root: ".", planId: "", outputDir: "", allPlans: false };
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
    if (arg === "--plan-id") {
      options.planId = argv[index + 1] ?? options.planId;
      index += 1;
      continue;
    }
    if (arg === "--output-dir") {
      options.outputDir = argv[index + 1] ?? options.outputDir;
      index += 1;
      continue;
    }
    if (arg === "--all") {
      options.allPlans = true;
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
  const result = await generatePlanDashboard({
    root: parsed.options.root,
    planId: parsed.options.planId || undefined,
    outputDir: parsed.options.outputDir || undefined,
    allPlans: parsed.options.allPlans,
  });
  console.log(`Plan Dashboard generated: ${result.dashboardPath}`);
  console.log(`Plans: ${result.planCount}, Phases: ${result.phaseCount}, Tasks: ${result.taskCount}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    if (error instanceof PlanDashboardError || error instanceof SyntaxError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  });
}
