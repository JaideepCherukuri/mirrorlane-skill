const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export class MirrorlaneApiError extends Error {
  constructor(message, { body = null, status = 0 } = {}) {
    super(message);
    this.name = "MirrorlaneApiError";
    this.body = body;
    this.status = status;
  }
}

export async function requestJson({
  apiKey = process.env.MIRRORLANE_API_KEY,
  apiUrl,
  body,
  method = "GET",
  path,
}) {
  const response = await requestWithRetry({
    apiKey,
    apiUrl,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? {} : { "content-type": "application/json" },
    method,
    path,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new MirrorlaneApiError(
      payload?.error?.message ?? payload?.error ?? `Mirrorlane API returned ${response.status}.`,
      { body: payload, status: response.status },
    );
  }

  return payload;
}

export async function downloadFile({
  apiKey = process.env.MIRRORLANE_API_KEY,
  apiUrl,
  destination,
  fs,
  path,
}) {
  const response = await requestWithRetry({
    apiKey,
    apiUrl,
    method: "GET",
    path,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new MirrorlaneApiError(
      payload?.error?.message ?? `Mirrorlane API returned ${response.status}.`,
      { body: payload, status: response.status },
    );
  }

  const body = Buffer.from(await response.arrayBuffer());

  if (body.length === 0) {
    throw new Error("Downloaded artifact was empty.");
  }

  await fs.writeFile(destination, body);
  return {
    bytes: body.length,
    path: destination,
  };
}

async function requestWithRetry({
  apiKey,
  apiUrl,
  body,
  headers = {},
  method,
  path,
}) {
  if (!apiKey) {
    throw new Error("MIRRORLANE_API_KEY is required.");
  }

  const url = new URL(path, normalizeApiUrl(apiUrl));
  let attempt = 0;
  let lastResponse = null;

  while (attempt < 4) {
    attempt += 1;
    const response = await fetch(url, {
      body,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "user-agent": "mirrorlane-cli/0.1.0",
        ...headers,
      },
      method,
      redirect: "follow",
    });

    if (!TRANSIENT_STATUS_CODES.has(response.status) || attempt >= 4) {
      return response;
    }

    lastResponse = response;
    await sleep(Math.min(8000, 500 * 2 ** (attempt - 1)));
  }

  return lastResponse;
}

function normalizeApiUrl(apiUrl) {
  const url = new URL(apiUrl);
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url;
}

function sleep(timeoutMs) {
  return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}
