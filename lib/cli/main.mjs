import fs from "node:fs/promises";
import path from "node:path";

import { downloadFile, requestJson } from "./api.mjs";
import { parseCommand, usage } from "./args.mjs";
import {
  ensureAuthContext,
  maskApiKey,
  resolveAuthContext,
  runInteractiveLogin,
  runLogout,
} from "./auth.mjs";
import { writeReferencePackage } from "./reference.mjs";

export async function main(argv) {
  const parsed = parseCommand(argv);

  if (parsed.options.help || parsed.command === "help") {
    console.log(usage());
    return;
  }

  switch (parsed.command) {
    case "welcome":
      return runWelcome(parsed);
    case "auth":
      return runAuthStatus(parsed);
    case "login":
      return runInteractiveLogin(parsed.options);
    case "logout":
      return runLogout(parsed.options);
    case "capture":
      return runCapture(parsed);
    case "status":
      return runStatus(parsed);
    case "download":
      return runDownload(parsed);
    case "reference":
      return runReference(parsed);
    default:
      throw new Error(`Unknown command: ${parsed.command}\n\n${usage()}`);
  }
}

async function runWelcome({ options }) {
  const context = await resolveAuthContext(options);

  if (context.apiKey) {
    return runAuthStatus({ options });
  }

  if (options.json) {
    writeOutput(
      {
        authenticated: false,
        configPath: context.configPath,
        ok: true,
        service: "mirrorlane",
      },
      options,
    );
    return;
  }

  return runInteractiveLogin(options);
}

async function runAuthStatus({ options }) {
  const context = await resolveAuthContext(options);

  if (!context.apiKey) {
    if (options.json) {
      writeOutput(
        {
          authenticated: false,
          configPath: context.configPath,
          ok: true,
          service: "mirrorlane",
        },
        options,
      );
      return;
    }

    console.log("Not authenticated with Mirrorlane CLI.");
    console.log("Run `mirrorlane login`, set MIRRORLANE_API_KEY, or pass --api-key.");
    return;
  }

  const payload = await requestJson({
    apiKey: context.apiKey,
    apiUrl: context.apiUrl,
    path: "/api/cli/auth",
  });

  writeOutput(
    {
      ...payload,
      configPath: context.configPath,
      source: context.source,
    },
    options,
  );
}

async function runCapture({ options, positional }) {
  const context = await ensureAuthContext(options);
  const sourceUrl = positional[0];

  if (!sourceUrl) {
    throw new Error("capture requires a URL.");
  }

  const created = await requestJson({
    apiKey: context.apiKey,
    apiUrl: context.apiUrl,
    body: { sourceUrl },
    method: "POST",
    path: "/api/cli/captures",
  });
  let payload = created;

  if (options.wait) {
    payload = await waitForJob({
      apiKey: context.apiKey,
      apiUrl: context.apiUrl,
      jobId: created.job.id,
      pollIntervalSeconds: options.pollIntervalSeconds ?? 2,
      timeoutSeconds: options.timeoutSeconds ?? 900,
    });
  }

  writeOutput(payload, options);

  if (payload.job?.status === "failed") {
    process.exitCode = 1;
  }
}

async function runStatus({ options, positional }) {
  const context = await ensureAuthContext(options);
  const jobId = positional[0];

  if (!jobId) {
    throw new Error("status requires a job id.");
  }

  const payload = await requestJson({
    apiKey: context.apiKey,
    apiUrl: context.apiUrl,
    path: `/api/cli/captures/${encodeURIComponent(jobId)}`,
  });
  writeOutput(payload, options);
}

async function runDownload({ options, positional }) {
  const context = await ensureAuthContext(options);
  const jobId = positional[0];
  const format = normalizeFormat(options.format ?? "clean");

  if (!jobId) {
    throw new Error("download requires a job id.");
  }

  if (!options.out) {
    throw new Error("download requires --out <file>.");
  }

  await fs.mkdir(path.dirname(path.resolve(options.out)), { recursive: true });
  const downloaded = await downloadFile({
    apiKey: context.apiKey,
    apiUrl: context.apiUrl,
    destination: options.out,
    fs,
    path: `/api/cli/captures/${encodeURIComponent(jobId)}/download?format=${format}`,
  });
  writeOutput({ artifact: downloaded, format, jobId, ok: true }, options);
}

async function runReference({ options, positional }) {
  const context = await ensureAuthContext(options);
  const jobId = positional[0];

  if (!jobId) {
    throw new Error("reference requires a job id.");
  }

  const outputDirectory = options.out ?? "mirrorlane-reference";
  const payload = await requestJson({
    apiKey: context.apiKey,
    apiUrl: context.apiUrl,
    path: `/api/cli/captures/${encodeURIComponent(jobId)}/reference`,
  });
  const result = await writeReferencePackage({
    cleanZip: payload.reference.artifacts.cleanZip,
    downloadCleanZip: options.cleanZip !== false,
    fs,
    outputDirectory,
    reference: payload.reference,
    requestCleanZip: (destination) =>
      downloadFile({
        apiKey: context.apiKey,
        apiUrl: context.apiUrl,
        destination,
        fs,
        path: `/api/cli/captures/${encodeURIComponent(jobId)}/download?format=clean`,
      }),
  });

  writeOutput(
    {
      jobId,
      ok: true,
      outputDirectory,
      ...result,
    },
    options,
  );
}

async function waitForJob({
  apiKey,
  apiUrl,
  jobId,
  pollIntervalSeconds,
  timeoutSeconds,
}) {
  const startedAt = Date.now();
  let latest = null;

  while (Date.now() - startedAt < timeoutSeconds * 1000) {
    latest = await requestJson({
      apiKey,
      apiUrl,
      path: `/api/cli/captures/${encodeURIComponent(jobId)}`,
    });

    if (latest.job.status === "completed" || latest.job.status === "failed") {
      return latest;
    }

    await sleep(pollIntervalSeconds * 1000);
  }

  throw new Error(`Timed out waiting for capture ${jobId}.`);
}

function writeOutput(payload, options) {
  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (payload.job) {
    console.log(`${payload.job.id} ${payload.job.status} ${payload.job.sourceUrl}`);
    if (payload.job.progressMessage) {
      console.log(payload.job.progressMessage);
    }
    return;
  }

  if (payload.authenticated) {
    console.log(`Authenticated with Mirrorlane (${payload.key?.label ?? "API key"}).`);
    console.log(`Key: ${payload.key?.keyPrefix ? `ml_live_${payload.key.keyPrefix}_...` : maskApiKey(payload.apiKey)}`);
    if (payload.source) {
      console.log(`Source: ${payload.source}`);
    }
    return;
  }

  if (payload.referencePath) {
    console.log(`Reference package written to ${payload.referencePath}`);
    return;
  }

  if (payload.artifact?.path) {
    console.log(`Downloaded ${payload.format} ZIP to ${payload.artifact.path}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

function normalizeFormat(format) {
  if (format === "clean" || format === "raw" || format === "deployable") {
    return format;
  }

  throw new Error("--format must be clean, raw, or deployable.");
}

function sleep(timeoutMs) {
  return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}
