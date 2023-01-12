import { webkit } from "playwright";
import looksSame, { createDiff } from "looks-same";

const VIEWPORTS = {
  mobile: { width: 300, height: 1200 },
  full: { width: 1280, height: 720 }
};

export default async function compare({ viewport, path, baseUrl, testUrl }) {
  const browser = await webkit.launch();
  const [image1Buffer, image2Buffer] = await Promise.all([
    getImage(browser, viewport, path, baseUrl),
    getImage(browser, viewport, path, testUrl)
  ]);

  const { equal } = await looksSame(image1Buffer, image2Buffer, {
    ignoreCaret: true,
    ignoreAntialiasing: true
  });

  // save diff if different
  let name;
  if (!equal) { 
    name = `${path.replace(/[//]/g, "_")}-${viewport}`;
    await createDiff({
      reference: image1Buffer,
      current: image2Buffer,
      diff: `diffs/${name}.png`,
      highlightColor: "#ff00ff", // color to highlight the differences
    });
  }

  browser.close();

  return {
    path,
    viewport,
    equal,
    img: name
  };
}

/** Visit a URL and generate a screenshot.
 * 
 * @param {"mobile" | "full"} viewport
 * @param {string} path "/about", "/schedules", any other path name
 * @param {string} baseURL e.g. "https://www.mbta.com", "http://localhost:4001", etc
 * 
 * @returns {Buffer} The screenshot image Buffer
 */
function getImage(browser, viewport, path, baseURL) {
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
