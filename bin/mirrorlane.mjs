#!/usr/bin/env node
import { main } from "../lib/cli/main.mjs";

main(process.argv.slice(2)).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`mirrorlane: ${message}`);
  process.exitCode = 1;
});
