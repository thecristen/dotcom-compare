#!/usr/bin/env node
import fs from "fs-extra";
import { exec } from "child_process";
import { validateURLs } from "./lib/helpers.js";
import compare from "./lib/compare.js";
import generateHTML from "./lib/template.js";
import allPaths from "./lib/pathnames.js";
import { chromium } from "playwright";

fs.emptyDirSync("diffs");
validateURLs();
global.browser = await chromium.launch();

console.log(`🆗 Comparing ${process.env.BASE_URL} and ${process.env.TEST_URL}`);
console.time("visual comparison");
// const allPaths = ["/"];
const results = await Promise.all(allPaths.flatMap(path => {
  return [
    compare({ path, viewport: "full", baseUrl: process.env.BASE_URL, testUrl: process.env.TEST_URL }),
    compare({ path, viewport: "mobile", baseUrl: process.env.BASE_URL, testUrl: process.env.TEST_URL })
  ];
}));
global.browser.close();
console.timeEnd("visual comparison");
// console.log("results", results);
console.time("report generation");
await generateHTML(results.filter(r => !!r)); // remove null results first
console.timeEnd("report generation");
exec("open report.html");
