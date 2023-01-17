import Jimp from "jimp";

const VIEWPORTS = {
  mobile: { width: 300, height: 1200 },
  full: { width: 1280, height: 720 }
};

export default async function compare({ viewport, path, baseUrl, testUrl }) {
  const [image1Buffer, image2Buffer] = await Promise.all([
    getImage(viewport, path, baseUrl),
    getImage(viewport, path, testUrl)
  ]);
  if (!image1Buffer || !image2Buffer) { return; }

  console.log("🧮\t", `comparing ${path} ${viewport === "mobile" ? "📱" : "🖥️"}`);
  let equal = image1Buffer === image2Buffer;
  let name;
  if (!equal) {
    name = `${path.replace(/[//]/g, "_")}-${viewport}`;
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
async function getImage(viewport, path, baseURL) {
  const pageURL = `${baseURL}${path}`;
  
  const result = global.browser.newPage({ ...newPageOptions(viewport), baseURL })
    .then(async page => {
      console.log(`➡️ ${viewport === "mobile" ? "📱\t" : "🖥️\t"} ${pageURL}`);
      await page.goto(path, {
        timeout: 90000,
        waitUntil: "networkidle"
      });
      await page.addStyleTag({
        content: "img[src*='/sites/default/files'], .c-banner__image, .m-whats-happening__image, .m-homepage__events-container .m-event, .user-guides img, .m-tnm-sidebar__schedules, .m-timetable__header-cell > * { visibility: hidden; } .m-homepage__news-item, .m-schedule-diagram__predictions, .m-schedule-diagram__vehicle, .m-menu__language { display: none; }"
      });
      return page;
    })
    .then(page => {
      console.log(`📸 ${viewport === "mobile" ? "📱\t" : "🖥️\t"} ${pageURL}`);
      return page.screenshot({
        caret: "hide",
        fullPage: true,
        omitBackground: false,
        scale: "device",
        timeout: 90000, // default 30000
        type: "png", // default png
      });
    })
    .catch((error) => {
      console.error(`\n🔥 ${pageURL} (${viewport} size)`);
      console.error(error);
    });
  
  return result;
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
