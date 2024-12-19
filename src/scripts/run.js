#!/usr/bin/env node

import * as d3 from "d3";
import path from "path";
import sharp from "sharp";
import { writeFile } from "fs/promises";
import { JSDOM } from "jsdom";
import { createBasinPie } from "../charts/basinpie.js";
// import { basinProjects, level_ids, timeseries_ids, labels } from "../config.js";
import loadConfig from "../utils/config.js";

import dayjs from "dayjs";
import { fetchLevelData, fetchTimeseriesData } from "../utils/getBasinData.js";
import process, { exit } from "process";
import { Command } from "commander"; // Import commander.js for argument parsing
import { initializeAPIs } from "../utils/api.js";

const { CDA_DATE_FORMAT } = "../utils/api.js";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Initialize Commander.js
const program = new Command();
program
  .option("--width <number>", "Set width of the chart", 480)
  .option("--height <number>", "Set height of the chart", 480)
  .option("--basin <name>", "Specify basin", "all")
  .option("--pool <name>", "Specify pool", "cons_pool")
  .option("--viewBoxWidth <number>", "Set the SVG viewBox width", 600)
  .option("--viewBoxHeight <number>", "Set the SVG viewBox height", 600)
  .option("--outputFile <path>", "Output file name", "./basin.svg")
  .option("--outputDir <path>", "Directory to save the output", ".")
  .option(
    "--fontSize <size>",
    "Font size for the labels (Any CSS font size)",
    "1em"
  )
  .option("--strokeWidth <number>", "Set stroke width of pie chart", 1)
  .option(
    "--host <url>",
    "Set the CDA host URL. Default to national.",
    "https://cwms-data.usace.army.mil/cwms-data"
  )
  .option(
    "--config <path>",
    "Path to configuration file. Example in: test/swf.config.js"
  )
  .option(
    "--office <office>",
    "3 Letter Office Code. Overrides config value. (Default: null/config)"
  )
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

const options = program.opts();

var OFFICE,
  basinProjects,
  level_ids,
  timeseries_ids,
  BASIN_COLORS,
  labels,
  basinMap,
  poolDisplay,
  lookBackHours,
  CDA_HOST,
  CDA_RETRY_COUNT,
  CDA_RETRY_DELAY_MS;
if (options.config) {
  // Load user-specified config file
  var {
    OFFICE,
    basinProjects,
    level_ids,
    timeseries_ids,
    BASIN_COLORS,
    labels,
    basinMap,
    poolDisplay,
    lookBackHours,
    CDA_HOST,
    CDA_RETRY_COUNT,
    CDA_RETRY_DELAY_MS,
  } = await loadConfig(options.config);
} else {
  // Fall back to default config if no config file is provided
  var {
    OFFICE,
    basinProjects,
    level_ids,
    timeseries_ids,
    BASIN_COLORS,
    labels,
    basinMap,
    poolDisplay,
    lookBackHours,
    CDA_HOST,
    CDA_RETRY_COUNT,
    CDA_RETRY_DELAY_MS,
  } = await import("../../test/swf.config.js");
}

if (options.office) OFFICE = options.office.toUpperCase();
if (options?.host) CDA_HOST = options.host;

let width = parseInt(options.width);
let height = parseInt(options.height);
let basin = options.basin;
let pool = options.pool;
let strokeWidth = parseInt(options.strokeWidth);
let viewBoxWidth = parseInt(options.viewBoxWidth);
let viewBoxHeight = parseInt(options.viewBoxHeight);
let cx = viewBoxWidth / 2;
let cy = viewBoxHeight / 2 + 20;
let fontSize = options.fontSize;
let outputFile = options.outputFile || `${basin}.${pool}.webp`;
let outputDir = options.outputDir;

if (!pool)
  throw new Error(
    "--pool=<pool_name_from_config> is required. Options are: cons_pool, flood_pool"
  );

// Create a mock DOM
const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
const document = window.document;

const svg = d3
  .select(document.body)
  .append("svg")
  .attr("xmlns", "http://www.w3.org/2000/svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("aria-hidden", true)
  .attr("style", "margin: 0px; padding: 0px;");

const saveSvgAsWebP = async (_svg, _filePath) => {
  try {
    const svgString = _svg.node().outerHTML;
    const webpBuffer = await sharp(Buffer.from(svgString))
      .flatten({ background: "#ffffff" })
      .webp()
      .toBuffer();

    await writeFile(
      path.join(
        outputDir,
        _filePath.endsWith(".webp") ? _filePath : _filePath + ".webp"
      ),
      webpBuffer
    );
    console.log(`WebP image saved: ${_filePath}`);
  } catch (error) {
    console.error("Error converting SVG to WebP:", error);
  }
};

const radius = Math.min(width, height) / 2;
cx = cx || radius + (radius * 1) / 7;
cy = cy || radius + (radius * 1) / 7;
const TODAY = dayjs().format(CDA_DATE_FORMAT);
const BEGIN_DATE = dayjs().subtract(3, "hour").format(CDA_DATE_FORMAT);

async function run(_basin, _pool, _outputFile) {
  console.log(`Generating for ${_basin}.${_pool}`);

  const { ts_api, level_api, cata_api, locations_api } =
    initializeAPIs(CDA_HOST);

  const levelData = await fetchLevelData(
    _basin,
    basinProjects,
    level_ids,
    {
      office: OFFICE,
      begin: TODAY,
      end: TODAY,
    },
    level_api
  );
  const timeseriesData = await fetchTimeseriesData(
    _basin,
    basinProjects,
    timeseries_ids,
    {
      office: OFFICE,
      begin: BEGIN_DATE,
    },
    ts_api
  );
  console.log(levelData, timeseriesData);
  if (levelData?.status == 404) {
    console.log("No level data found for basin: " + _basin);
    console.warn("API returned status code 404");
    exit(1);
  }
  if (timeseriesData?.status == 404) {
    console.log("No timeseries data found for basin: " + _basin);
    console.warn("API returned status code 404");
    exit(1);
  }
  Object.keys(timeseriesData).forEach((key) => {
    const value = timeseriesData[key];
    if (!value) console.log(key + "\n\thas no data for " + BEGIN_DATE);
  });

  createBasinPie({
    svg,
    basinProjects,
    basin: _basin,
    pool,
    levelData,
    timeseriesData,
    options: {
      radius,
      width,
      height,
      viewBoxWidth,
      viewBoxHeight,
      labels,
      cx,
      cy,
      fontSize,
      strokeWidth,
    },
    config: { level_ids, timeseries_ids, BASIN_COLORS, poolDisplay },
  });

  await saveSvgAsWebP(svg, _outputFile);
}

if (basin.toLowerCase() === "all") {
  const basins = Object.keys(basinProjects);
  for (const bsn of basins) {
    const outputFileName = `${bsn}.${pool}.webp`.toLowerCase();
    await run(bsn, pool, outputFileName);
  }
} else {
  await run(basin, pool, outputFile);
}
