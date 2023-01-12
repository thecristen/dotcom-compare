import path from "path";
import { URL } from "url";

export function validateURLs() {
  validateURL("BASE_URL", "https://www.mbta.com");
  validateURL("TEST_URL", "http://localhost:4001");
}

export const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));

function validateURL(envKey, defaultValue) {
  if (process.env[envKey]) {
    // throws if invalid URL
    new URL(process.env[envKey]);
  } else {
    // if it was just blank, use default
    process.env[envKey] = defaultValue;
  }
}
