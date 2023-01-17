import { webkit } from "playwright";
import Jimp from "jimp";

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
  browser.close();
  if (!image1Buffer || !image2Buffer) { return; }
  let equal = image1Buffer === image2Buffer;
  let name;
  if (!equal) {
    console.log(`diffing ${path} (${viewport} size)`);
    const base = await Jimp.read(image1Buffer);
    const test = await Jimp.read(image2Buffer);
    const sizeMatch = base.bitmap.height == test.bitmap.height;
    const distance = Jimp.distance(base, test); // perceived distance
    const diff = Jimp.diff(base, test, .1); // pixel difference
    // console.log(distance, diff.percent);
    if (sizeMatch && (distance < 0.155 || diff.percent < 0.155)) {
      equal = true;
    } else {
      equal = false;
      name = `${path.replace(/[//]/g, "_")}-${viewport}`;
      diff.image.writeAsync(`diffs/${name}.png`);
    }
  }

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
      console.log(`[${baseURL}] go to ${path} (${viewport} size)`);
      await page.goto(path, {
        timeout: 60000,
        waitUntil: "networkidle"
      });
      await page.addStyleTag({
        content: "img[src^='https://cdn.mbta.com'], .c-banner__image, .m-whats-happening__image, .user-guides img, .m-tnm-sidebar__schedules, .m-timetable__header-cell > * { visibility: hidden; } .m-homepage__news-item, .m-schedule-diagram__predictions, .m-schedule-diagram__vehicle { display: none; }"
      });
      return page;
    })
    .then(page => {
      console.log(`screenshot: ${path} (${viewport} size)`);
      return page.screenshot({
        caret: "hide",
        fullPage: true,
        omitBackground: false,
        scale: "device",
        timeout: 60000, // default 30000
        type: "png", // default png
      });
    })
    .catch((error) => {
      console.log("error", `${path} (${viewport} size)`);
      console.error(error);
    });
}

/** 
 * @param {"mobile" | "full"} viewport
 * 
 * @returns {object} An object with parameters compatible with Playwright's Browser.newPage method.
 */
function newPageOptions(viewport) {
  return ({
    deviceScaleFactor: 2,
    isMobile: viewport === "mobile",
    javaScriptEnabled: true,
    offline: false,
    viewport: VIEWPORTS[viewport]
  });
}
