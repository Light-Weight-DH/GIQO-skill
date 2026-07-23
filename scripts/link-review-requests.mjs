#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { slugify } from "./plan-state-core.mjs";

const LINKABLE_STATUSES = new Set(["saved", "running"]);
const EMPTY_EVIDENCE = { changedFiles: [], verification: [], manualQa: [], notes: [] };

export class ReviewLinkError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReviewLinkError";
  }
}

export async function linkReviewRequests(options) {
  const root = resolve(options.root);
  const phaseId = normalizeId("phase", options.phaseId);
  const planDir = join(root, ".giqo", "plans", options.planId);
  const reviewPath = join(root, ".giqo", "ui-review", options.screen, "change-requests.json");
  const tasksPath = join(planDir, "tasks.json");
  const tasksState = await readJson(tasksPath);
  const reviewState = normalizeReviewState(await readJson(reviewPath));
  const phase = tasksState.phases.find((candidate) => candidate.id === phaseId);
  if (!phase) {
    throw new ReviewLinkError(`Phase ${phaseId} was not found in ${tasksPath}.`);
  }

  const now = (options.now ?? new Date()).toISOString();
  const linked = linkRequestsToTasks(tasksState.tasks, reviewState.requests, phaseId, options.screen, now);
  const nextTasksState = { ...tasksState, updatedAt: now, tasks: linked.tasks };
  const nextReviewState = { ...reviewState, requests: linked.requests };

  await writeJson(tasksPath, nextTasksState);
  await writeJson(reviewPath, nextReviewState);

  return {
    planId: options.planId,
    screen: options.screen,
    phaseId,
    linkedCount: linked.linkedCount,
    tasksPath,
    reviewPath,
  };
}

function linkRequestsToTasks(currentTasks, currentRequests, phaseId, screen, now) {
  const tasks = [...currentTasks];
  let linkedCount = 0;
  const requests = currentRequests.map((request) => {
    if (!isLinkableRequest(request)) {
      return request;
    }
    const taskId = request.linkedTask || createTaskId(screen, request);
    const taskIndex = tasks.findIndex((task) => task.id === taskId || task.sourceReviewRequests?.includes(request.id));
    const nextRequest = { ...request, linkedTask: taskId };
    if (taskIndex >= 0) {
      tasks[taskIndex] = mergeLinkedTask(tasks[taskIndex], request.id, request.targetId, now);
    } else {
      tasks.push(createTask(taskId, phaseId, request, now));
    }
    linkedCount += 1;
    return nextRequest;
  });
  return { tasks, requests, linkedCount };
}

function isLinkableRequest(request) {
  return typeof request.id === "string" && request.id.trim() !== "" && LINKABLE_STATUSES.has(request.status ?? "saved");
}

function createTask(taskId, phaseId, request, now) {
  return {
    id: taskId,
    phaseId,
    title: taskTitle(request),
    summary: taskSummary(request),
    status: "saved",
    sourceDocs: ["06_UI_UX_SPEC.md", "05_IMPLEMENTATION_PLAN.md"],
    sourceReviewRequests: [request.id],
    targetFiles: targetFiles(request.targetId),
    evidence: EMPTY_EVIDENCE,
    createdAt: now,
    updatedAt: now,
  };
}

function mergeLinkedTask(task, requestId, targetId, now) {
  return {
    ...task,
    sourceReviewRequests: uniqueStrings([...(task.sourceReviewRequests ?? []), requestId]),
    targetFiles: uniqueStrings([...(task.targetFiles ?? []), ...targetFiles(targetId)]),
    evidence: task.evidence ?? EMPTY_EVIDENCE,
    updatedAt: now,
  };
}

function taskTitle(request) {
  return firstText([request.requestedChange, request.comment, request.title]) ?? `Review request ${request.id}`;
}

function taskSummary(request) {
  const parts = [request.targetId ? `Target: ${request.targetId}` : "", firstText([request.acceptanceSignal]) ? `Acceptance: ${request.acceptanceSignal}` : ""].filter(Boolean);
  return parts.join(" · ");
}

function targetFiles(targetId) {
  return typeof targetId === "string" && targetId.trim() !== "" ? [`UI target: ${targetId.trim()}`] : [];
}

function createTaskId(screen, request) {
  const target = request.targetId ?? `${screen}-global`;
  return normalizeId("task", `${target}-${request.id}`);
}

function normalizeId(prefix, value) {
  const slug = slugify(value);
  return slug.startsWith(`${prefix}-`) ? slug : `${prefix}-${slug}`;
}

function firstText(values) {
  return values.find((value) => typeof value === "string" && value.trim() !== "")?.trim();
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim() !== "").map((value) => value.trim()))];
}

function normalizeReviewState(value) {
  if (Array.isArray(value)) {
    return { requests: value };
  }
  if (value && Array.isArray(value.requests)) {
    return value;
  }
  throw new ReviewLinkError("change-requests.json must be an array or an object with requests[].");
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new ReviewLinkError(`Missing linkage input: ${path}`);
    }
    throw error;
  }
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function printHelp() {
  console.log(`GIQO Visual Review request linker

Usage:
  node scripts/link-review-requests.mjs --plan-id plan-id --screen screen --phase-id phase-id [--root .]

Reads:
  .giqo/plans/<plan-id>/tasks.json
  .giqo/ui-review/<screen>/change-requests.json

Writes:
  .giqo/plans/<plan-id>/tasks.json
  .giqo/ui-review/<screen>/change-requests.json
`);
}

function parseArgs(argv) {
  const options = { root: ".", planId: "", screen: "", phaseId: "" };
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
    if (arg === "--screen") {
      options.screen = argv[index + 1] ?? options.screen;
      index += 1;
      continue;
    }
    if (arg === "--phase-id") {
      options.phaseId = argv[index + 1] ?? options.phaseId;
      index += 1;
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
  if (!parsed.options.planId || !parsed.options.screen || !parsed.options.phaseId) {
    throw new ReviewLinkError("--plan-id, --screen, and --phase-id are required.");
  }
  const result = await linkReviewRequests(parsed.options);
  console.log(`Linked Visual Review requests: ${result.linkedCount}`);
  console.log(`- ${result.tasksPath}`);
  console.log(`- ${result.reviewPath}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    if (error instanceof ReviewLinkError || error instanceof SyntaxError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  });
}
