export const DEFAULT_API_URL = "https://mirrorlane.jaideepch.com";

export function parseCommand(argv) {
  const tokens = [...argv];
  const command = tokens[0]?.startsWith("--")
    ? "welcome"
    : tokens.shift() ?? "welcome";
  const options = {
    apiKey: undefined,
    apiUrl: undefined,
    browser: false,
    json: false,
  };
  const positional = [];

  while (tokens.length > 0) {
    const token = tokens.shift();

    if (token === "--json") {
      options.json = true;
      continue;
    }

    if (token === "--api-url") {
      options.apiUrl = requireOptionValue(token, tokens.shift());
      continue;
    }

    if (token === "--api-key") {
      options.apiKey = requireOptionValue(token, tokens.shift());
      continue;
    }

    if (token === "--browser") {
      options.browser = true;
      continue;
    }

    if (token === "--wait") {
      options.wait = true;
      continue;
    }

    if (token === "--timeout") {
      options.timeoutSeconds = parsePositiveInteger(
        requireOptionValue(token, tokens.shift()),
        token,
      );
      continue;
    }

    if (token === "--poll-interval") {
      options.pollIntervalSeconds = parsePositiveInteger(
        requireOptionValue(token, tokens.shift()),
        token,
      );
      continue;
    }

    if (token === "--format") {
      options.format = requireOptionValue(token, tokens.shift());
      continue;
    }

    if (token === "--out") {
      options.out = requireOptionValue(token, tokens.shift());
      continue;
    }

    if (token === "--no-clean-zip") {
      options.cleanZip = false;
      continue;
    }

    if (token === "--help" || token === "-h") {
      options.help = true;
      continue;
    }

    if (token?.startsWith("--")) {
      throw new Error(`Unknown option: ${token}`);
    }

    positional.push(token);
  }

  return {
    command,
    options,
    positional,
  };
}

export function usage() {
  return `Mirrorlane CLI

Usage:
  mirrorlane
  mirrorlane login [--browser] [--api-key <key>] [--api-url <url>]
  mirrorlane auth [--json] [--api-key <key>] [--api-url <url>]
  mirrorlane logout
  mirrorlane capture <url> [--wait] [--timeout <seconds>] [--poll-interval <seconds>] [--api-key <key>] [--json]
  mirrorlane status <job-id> [--api-key <key>] [--json]
  mirrorlane download <job-id> --format clean|raw|deployable --out <file> [--api-key <key>] [--json]
  mirrorlane reference <job-id> --out <directory> [--no-clean-zip] [--api-key <key>] [--json]

Environment:
  MIRRORLANE_API_KEY   Optional API key; overrides stored login
  MIRRORLANE_API_URL   Optional API base URL; defaults to ${DEFAULT_API_URL}

Authentication:
  mirrorlane                         Prompt for browser or manual login
  mirrorlane login                   Start interactive login
  mirrorlane login --browser         Login with browser approval
  mirrorlane login --api-key ml_...  Save an API key locally
  mirrorlane capture URL --api-key ml_...  Use a key for one command
`;
}

function requireOptionValue(option, value) {
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value.`);
  }

  return value;
}

function parsePositiveInteger(value, option) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${option} must be a positive integer.`);
  }

  return parsed;
}
