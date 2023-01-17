# dotcom-compare

This is a standalone CLI tool that runs a Node.js script that can report on visual differences for a usbset of pages between two instances of MBTA.com. The default setting compares `https://www.mbta.com` with `http://localhost:4001`.

Recommended install using the latest NodeJS LTS (18.13.0):
```
npm install -g github:thecristen/dotcom-compare
```

This will expose the `dotcom-compare` CLI. 

## Usage
Supply base and test URLs via `BASE_URL` and `TEST_URL` variables, e.g.

```
BASE_URL=https://dev.mbtace.com TEST_URL=https://dev-blue.mbtace.com dotcom-compare
```
Omitting either variable will cause the command to fall back to the default values (`BASE_URL=https://www.mbta.com` and `TEST_URL=http://localhost:4001`).

{% warning %}
**Warning:** The script is unoptimized and slow right now - taking about 2 minutes as of this writing.

It's also slightly buggy, sometimes timing out on navigation or screenshot. 
{% endwarning %}

## Outputs

Running the command will output a folder of diff images in a `diffs/` directory, and open a `report.html` file that displays those diffs. The diffs directory is erased between runs. 
