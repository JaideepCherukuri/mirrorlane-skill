import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

import { requestJson } from "./api.mjs";
import { DEFAULT_API_URL } from "./args.mjs";

const CONFIG_PATH = path.join(os.homedir(), ".mirrorlane", "config.json");

export async function resolveAuthContext(options = {}) {
  const stored = await readStoredAuthConfig();
  const apiUrl =
    options.apiUrl ||
    process.env.MIRRORLANE_API_URL ||
    stored.apiUrl ||
    DEFAULT_API_URL;

  if (options.apiKey) {
    return {
      apiKey: options.apiKey,
      apiUrl,
      configPath: CONFIG_PATH,
      source: "command",
    };
  }

  if (process.env.MIRRORLANE_API_KEY) {
    return {
      apiKey: process.env.MIRRORLANE_API_KEY,
      apiUrl,
      configPath: CONFIG_PATH,
      source: "environment",
    };
  }

  if (stored.apiKey) {
    return {
      apiKey: stored.apiKey,
      apiUrl,
      configPath: CONFIG_PATH,
      source: "config",
    };
  }

  return {
    apiKey: null,
    apiUrl,
    configPath: CONFIG_PATH,
    source: "none",
  };
}

export async function ensureAuthContext(options, { allowPrompt = true } = {}) {
  const context = await resolveAuthContext(options);

  if (context.apiKey) {
    return context;
  }

  if (allowPrompt && isInteractive() && !options.json) {
    await promptForLogin(options);
    return resolveAuthContext(options);
  }

  throw new Error(
    "Mirrorlane authentication is required. Run `mirrorlane login`, set MIRRORLANE_API_KEY, or pass --api-key.",
  );
}

export async function runInteractiveLogin(options = {}) {
  if (options.apiKey) {
    return saveApiKeyLogin({
      apiKey: options.apiKey,
      apiUrl: (await resolveAuthContext(options)).apiUrl,
      json: options.json,
    });
  }

  if (options.browser) {
    return runBrowserLogin(options);
  }

  if (!isInteractive()) {
    throw new Error(
      "Interactive login requires a TTY. Use `mirrorlane login --api-key <key>` or set MIRRORLANE_API_KEY.",
    );
  }

  return promptForLogin(options);
}

export async function runBrowserLogin(options = {}) {
  const context = await resolveAuthContext(options);
  const start = await requestJson({
    apiUrl: context.apiUrl,
    authRequired: false,
    body: { clientName: "mirrorlane-cli" },
    method: "POST",
    path: "/api/cli/auth/browser/start",
  });
  const session = start.session;

  if (!session?.browserUrl || !session.deviceCode) {
    throw new Error("Mirrorlane did not return a browser login session.");
  }

  if (!options.json) {
    printLoginHeader();
    console.log("Opening browser for Mirrorlane login...");
    console.log("");
    console.log(session.browserUrl);
    console.log("");
  }

  openBrowser(session.browserUrl);

  const result = await pollBrowserLogin({
    apiUrl: context.apiUrl,
    deviceCode: session.deviceCode,
    expiresAt: session.expiresAt,
    json: options.json,
    pollIntervalSeconds: session.pollIntervalSeconds ?? 3,
  });

  await writeStoredAuthConfig({
    apiKey: result.apiKey,
    apiUrl: context.apiUrl,
  });

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          authenticated: true,
          configPath: CONFIG_PATH,
          key: result.key,
          ok: true,
          source: "browser",
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("");
  console.log(`Authenticated with Mirrorlane (${maskApiKey(result.apiKey)}).`);
  console.log(`Credentials saved to ${CONFIG_PATH}`);
}

export async function saveApiKeyLogin({ apiKey, apiUrl, json = false }) {
  const payload = await requestJson({
    apiKey,
    apiUrl,
    path: "/api/cli/auth",
  });

  await writeStoredAuthConfig({ apiKey, apiUrl });

  if (json) {
    console.log(
      JSON.stringify(
        {
          ...payload,
          configPath: CONFIG_PATH,
          source: "api-key",
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Authenticated with Mirrorlane (${maskApiKey(apiKey)}).`);
  console.log(`Credentials saved to ${CONFIG_PATH}`);
}

export async function runLogout(options = {}) {
  await clearStoredAuthConfig();

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          configPath: CONFIG_PATH,
          ok: true,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("Signed out of Mirrorlane CLI.");
}

export async function readStoredAuthConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);

    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : null,
      apiUrl: typeof parsed.apiUrl === "string" ? parsed.apiUrl : null,
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {};
    }

    throw new Error(`Could not read Mirrorlane config: ${error.message}`);
  }
}

export function maskApiKey(apiKey) {
  if (!apiKey) {
    return "not set";
  }

  const parts = apiKey.split("_");

  if (parts.length >= 4) {
    return `${parts[0]}_${parts[1]}_${parts[2].slice(0, 4)}...${parts.at(-1).slice(-4)}`;
  }

  return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
}

function printLoginHeader() {
  console.log("");
  console.log("mirrorlane cli");
  console.log("Capture, mirror, and rebuild websites with AI agents");
  console.log("");
}

async function promptForLogin(options = {}) {
  printLoginHeader();
  console.log("Welcome! To get started, authenticate with your Mirrorlane account.");
  console.log("");
  console.log("  1. Login with browser (recommended)");
  console.log("  2. Enter API key manually");
  console.log("");
  console.log("Tip: You can also set MIRRORLANE_API_KEY environment variable");
  console.log("");

  const choice = await askLine("Enter choice [1/2]: ");

  if (choice.trim() === "2") {
    const apiKey = await askHiddenLine("Enter Mirrorlane API key: ");
    const context = await resolveAuthContext(options);
    return saveApiKeyLogin({
      apiKey: apiKey.trim(),
      apiUrl: context.apiUrl,
      json: options.json,
    });
  }

  if (choice.trim() && choice.trim() !== "1") {
    throw new Error("Please enter 1 or 2.");
  }

  return runBrowserLogin(options);
}

async function pollBrowserLogin({
  apiUrl,
  deviceCode,
  expiresAt,
  json,
  pollIntervalSeconds,
}) {
  const expiresAtMs = new Date(expiresAt).getTime();

  while (Date.now() < expiresAtMs) {
    const payload = await requestJson({
      apiUrl,
      authRequired: false,
      path: `/api/cli/auth/browser/poll?device_code=${encodeURIComponent(deviceCode)}`,
    });
    const result = payload.result;

    if (result?.status === "approved" && result.apiKey) {
      return result;
    }

    if (["consumed", "expired", "invalid"].includes(result?.status)) {
      throw new Error(`Browser login session is ${result.status}.`);
    }

    if (!json && process.stdout.isTTY) {
      process.stdout.write(".");
    }

    await sleep(Math.max(1, pollIntervalSeconds) * 1000);
  }

  throw new Error("Timed out waiting for browser login approval.");
}

async function writeStoredAuthConfig(config) {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(
    CONFIG_PATH,
    `${JSON.stringify(
      {
        apiKey: config.apiKey,
        apiUrl: config.apiUrl,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.chmod(CONFIG_PATH, 0o600).catch(() => undefined);
}

async function clearStoredAuthConfig() {
  const existing = await readStoredAuthConfig();

  if (!existing.apiKey && !existing.apiUrl) {
    return;
  }

  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(
    CONFIG_PATH,
    `${JSON.stringify(
      {
        apiUrl: existing.apiUrl ?? DEFAULT_API_URL,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function openBrowser(url) {
  const command =
    process.platform === "win32"
      ? "cmd"
      : process.platform === "darwin"
        ? "open"
        : "xdg-open";
  const args =
    process.platform === "win32"
      ? ["/c", "start", "", url]
      : [url];

  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
  } catch {
    // The login URL is already printed; users can open it manually.
  }
}

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function askLine(prompt) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return await rl.question(prompt);
  } finally {
    rl.close();
  }
}

function askHiddenLine(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return askLine(prompt);
  }

  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let value = "";

    function cleanup() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
    }

    function onData(chunk) {
      const input = chunk.toString("utf8");

      for (const char of input) {
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Login cancelled."));
          return;
        }

        if (char === "\r" || char === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }

        if (char === "\u0008" || char === "\u007f") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }

        value += char;
        stdout.write("*");
      }
    }

    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.on("data", onData);
  });
}

function sleep(timeoutMs) {
  return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}
