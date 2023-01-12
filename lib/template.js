/** Generate HTML from test results */
import { readFile, writeFile } from "fs";
import Mustache from "mustache";

async function generateHTML(results) {
  const html = Mustache.render(rowTemplate, { results });

  readFile("template.mustache", "utf-8", function(err, template) {
    if (err) throw err;
  
    var rendered = Mustache.render(template, { report: html });
  
    // eslint-disable-next-line no-unused-vars
    writeFile("report.html", rendered, "utf-8", function(err, _data) {
      if (err) throw err;
      // console.log("Generated HTML report.");
    });
  });
}

export default generateHTML;

const rowTemplate = `{{#results}}
  {{^equal}}
  <tr>
    <td class="border border-red-300">
      <a href="diffs/{{ img }}.png">
        <div class="h-64 overflow-hidden" style="background-image: url('diffs/{{ img }}.png'); background-size: contain; background-repeat: no-repeat;"></div>
      </a>
    </td>
    <td class="border border-red-300 text-lg">
      {{ path }} ({{ viewport }} size)
    </td>
  </tr>
  {{/equal}}
{{/results}}`;
