#!/usr/bin/env node
import { mkdir } from "fs";
import { validateURLs } from "./lib/helpers.js";
import compare from "./lib/compare.js";
import generateHTML from "./lib/template.js";
import allPaths from "./lib/pathnames.js";

mkdir("diffs", { recursive: true }, function (err) {
  if (err) throw err;
});
validateURLs();

console.log(`🆗 Comparing ${process.env.BASE_URL} and ${process.env.TEST_URL}`);

console.time("visual comparison");
const results = await Promise.all(allPaths.flatMap(path => [
  compare({ path, viewport: "full", baseUrl: process.env.BASE_URL, testUrl: process.env.TEST_URL }),
  compare({ path, viewport: "mobile", baseUrl: process.env.BASE_URL, testUrl: process.env.TEST_URL })
]));
console.timeEnd("visual comparison");

console.time("report generation");
generateHTML(results);
console.timeEnd("report generation");
