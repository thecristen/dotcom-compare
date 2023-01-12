/** Get all path names */
import { readFile } from "fs";
const FILES = ["paths/content.txt", "paths/routes.txt", "paths/stops.txt"];

const promises = FILES.map(filepath => new Promise((resolve, reject) => {
  readFile(filepath, "utf8", (err, data) => { 
    let paths = [];
    try {
      const lines = data.split(/\r\n|\n|\r/);
      lines.forEach((line) => {
        if (filepath === "paths/routes.txt") {
          paths = paths.concat(addPaths(line));
        } else {
          paths = paths.concat(line);
        }
      });
  
      resolve(paths);
    } catch {
      reject({ reason: "bad" });
    }
  });
}));

const allPaths = await Promise.all(promises);

export default {
  paths: allPaths.flatMap(p => p)
};

function addPaths(line) {
  const tabs = line.startsWith("/schedules/CR-") || line.startsWith("/schedules/Boat-") ? ["timetable", "line", "alerts"] : ["line", "alerts"];
  return tabs.map(t => `${line}/${t}`);
}
