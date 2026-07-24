#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { loadPlanStatus, PlanStatusError, renderPlanStatus } from "./show-plan-status-core.mjs";

function printHelp() {
  console.log(`GIQO Plan status

Usage:
  node scripts/show-plan-status.mjs --plan-id plan-id [--root .] [--format compact|standard|rich] [--color]

Examples:
  node scripts/show-plan-status.mjs --plan-id plan-ui --format compact
  node scripts/show-plan-status.mjs --plan-id plan-ui --format standard
  node scripts/show-plan-status.mjs --plan-id plan-ui --format rich --color
`);
}

function parseArgs(argv) {
  const options = { root: ".", planId: "", format: "standard", color: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { kind: "help" };
    if (arg === "--root") { options.root = argv[index + 1] ?? options.root; index += 1; continue; }
    if (arg === "--plan-id") { options.planId = argv[index + 1] ?? options.planId; index += 1; continue; }
    if (arg === "--format") { options.format = argv[index + 1] ?? options.format; index += 1; continue; }
    if (arg === "--color") options.color = true;
  }
  if (!["compact", "standard", "rich"].includes(options.format)) throw new PlanStatusError("--format must be compact, standard, or rich.");
  return { kind: "run", options };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.kind === "help") { printHelp(); return; }
  const entry = await loadPlanStatus({ root: parsed.options.root, planId: parsed.options.planId });
  console.log(renderPlanStatus(entry, { format: parsed.options.format, color: parsed.options.color }));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    if (error instanceof PlanStatusError || error instanceof SyntaxError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  });
}
