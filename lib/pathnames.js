/** Get all path names */
import { readFile } from "fs";
const FILES = ["paths/content.txt", "paths/routes.txt", "paths/stops.txt"];

const promises = FILES.map(filepath => new Promise((resolve, reject) => {
  readFile(filepath, "utf8", (err, data) => { 
    let paths = [];
    try {
      const lines = data.split(/\r\n|\n|\r/);
      lines.forEach((line, index) => {
        if (filepath === "paths/routes.txt") {
          if (index % 10 == 0) {
            paths = paths.concat(addPaths(line));
          }
        } else if (filepath === "paths/stops.txt") {
          // we don't have time for all these stops...
          if (index % 50 == 0) {
            paths = paths.concat(line);
          }
        } else {
          if (index % 10 == 0) {
            paths = paths.concat(line);
          }
        }
      });
  
      resolve(paths);
    } catch {
      reject({ reason: "bad" });
    }
  });
}));

const paths = await Promise.all(promises);
const allPaths = paths.flatMap(p => p);
console.log("today's paths:", allPaths);
export default allPaths;

function addPaths(line) {
  const tabs = line.startsWith("/schedules/CR-") || line.startsWith("/schedules/Boat-") ? ["timetable", "line", "alerts"] : ["line", "alerts"];
  return tabs.map(t => `${line}/${t}`);
}
