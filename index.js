import { mkdir } from "fs";
import { webkit } from "playwright";
import looksSame from "looks-same";
// import generateHTML from "./util/template.js";
// import { paths } from "./util/pathnames";

console.time("visual comparison");
const VIEWPORTS = {
  mobile: { width: 300, height: 1200 },
  full: { width: 1280, height: 720 }
};
// TESTING
const paths = [
  "/alerts",
  "/fares/bus-fares",
  "/transit-police"
];

// single browser, whole time.
const BASE_URL = "https://dev.mbtace.com";
const TEST_URL = "https://dev-green.mbtace.com";

const browser = await webkit.launch();

// compare base against test
// TODO make test URL configurable
async function compare({ viewport, path }) {
  const [image1Buffer, image2Buffer] = await Promise.all([
    getImage(viewport, path, BASE_URL),
    getImage(viewport, path, TEST_URL)
  ]);

  const { equal } = await looksSame(image1Buffer, image2Buffer, {
    ignoreCaret: true,
    ignoreAntialiasing: true
  });

  // save diff if different
  let name;
  if (!equal) { 
    name = `${path.replace(/[//]/g, "_")}-${viewport}`;
    saveDiff(name, image1Buffer, image2Buffer);
  }

  return {
    path,
    viewport,
    equal,
    img: name
  };
}

const results = await Promise.all(paths.flatMap(path => [
  compare({ path, viewport: "full" }),
  compare({ path, viewport: "mobile" })
]));

browser.close();
console.log(results);
console.timeEnd("visual comparison");
// generateHTML(results);

/** Visit a URL and generate a screenshot.
 * 
 * @param {"mobile" | "full"} viewport
 * @param {string} path "/about", "/schedules", any other path name
 * @param {string} baseURL e.g. "https://www.mbta.com", "http://localhost:4001", etc
 * 
 * @returns {Buffer} The screenshot image Buffer
 */
function getImage(viewport, path, baseURL) {
  return browser.newPage({ ...newPageOptions(viewport), baseURL })
    .then(async page => {
      await page.goto(path, { waitUntil: "networkidle" });
      return page;
    })
    .then(page => page.screenshot({
      caret: "hide",
      fullPage: true,
      omitBackground: false,
      scale: "css",
      timeout: 30000, // default
      type: "png" // default
    }));
}

/** Generate a diff between two images and save to disk.
 * Saves file as `diffs/{name}.png`.
 * 
 * @param {string} name Name for saved file
 * @param {Buffer} imgA Reference image data
 * @param {Buffer} imgB Comparison image data
 */
function saveDiff(name, imgA, imgB) {
  mkdir("diffs", { recursive: true }, (err) => {
    if (err) throw err;
    looksSame.createDiff({
      reference: imgA,
      current: imgB,
      diff: `diffs/${name}.png`,
      highlightColor: "#ff00ff", // color to highlight the differences
    });
  });
}


/** 
 * @param {"mobile" | "full"} viewport
 * 
 * @returns {object} An object with parameters compatible with Playwright's Browser.newPage method.
 */
function newPageOptions(viewport) {
  return ({
    isMobile: viewport === "mobile",
    javaScriptEnabled: true,
    offline: false,
    viewport: VIEWPORTS[viewport]
  });
}
