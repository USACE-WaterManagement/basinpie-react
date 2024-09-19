import dayjs from "dayjs";
// these imports expand the format functionality of dayjs
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);
import advancedFormat from "dayjs/plugin/advancedFormat.js"; // ES 2015
// https://day.js.org/docs/en/plugin/advanced-format
dayjs.extend(advancedFormat);

const level_ids = {
  TOF: ".Stor.Inst.0.Top of Flood",
  TOC: ".Stor.Inst.0.Top of Conservation",
  TOI: ".Stor.Inst.0.Top of Inactive",
};

// How many hours in the past should we go back for current timeseries?
const lookBackHours = 4;

const timeseries_ids = {
  FCP: ".Stor-Flood Pool.Inst.1Hour.0.Decodes-Comp",
  Cons: ".Stor-Conservation Pool.Inst.1Hour.0.Decodes-Comp",
};

const BASIN_COLORS = [
  "rgb(197, 92, 230)",
  "rgb(244, 217, 102)",
  "rgb(38, 192, 163)",
  "rgb(77, 237, 69)",
  "rgb(66, 91, 214)",
  "rgb(11, 170, 227)",
  "rgb(255, 192, 0)",
  "rgb(29, 131, 151)",
  "rgb(38, 192, 163)",
  "rgb(77, 237, 69)",
  "rgb(66, 91, 214)",
  "rgb(11, 170, 227)",
  "rgb(29, 131, 151)",
  "rgb(38, 192, 163)",
  "rgb(38, 192, 163)",
  "rgb(77, 237, 69)",
];

let labels = [
  {
    attr: {
      x: "viewBoxWidth / 2 + 90",
      y: "25",
      "text-anchor": "middle",
      "font-size": "1.1em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    style: {
      "font-size": "2em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    text: `%pool Pool %percent_full%`,
  },
  {
    attr: {
      x: "viewBoxWidth / 2 + 90",
      y: "45",
      "text-anchor": "middle",
      "font-size": "1.1em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    style: {
      "font-size": "1.1em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    text: `${dayjs().format("ddd MMM DD HH:mm:ss z YYYY")}`,
  },
  {
    attr: {
      x: "viewBoxWidth / 2 + 90",
      y: "viewBoxHeight - 90",
      "text-anchor": "middle",
      "font-size": "1em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    style: {
      "font-size": "1.2em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    text: `%pool Usage: %total_stor / %total_incr `,
  },
];

const basinProjects = {
  brazos: [
    "WTYT2",
    "ALAT2",
    "ACTT2",
    "PCTT2",
    "BLNT2",
    "STIT2",
    "GGLT2",
    "GNGT2",
    "SOMT2",
  ],
  colorado: ["SAGT2", "HORT2", "MSDT2"],
  guadalupe: ["SMCT2"],
  neches: ["TBLT2", "JSPT2"],
  red: ["SCLT2", "TXKT2", "JFNT2"],
  trinity: [
    "BNBT2",
    "JPLT2",
    "RRLT2",
    "LEWT2",
    "GPVT2",
    "LVNT2",
    "DAWT2",
    "BDWT2",
  ],
};

// Keep the key the same, change the value to what you would like displayed for %pool
const poolDisplay = {
  cons_pool: "Conservation",
  flood_pool: "Flood",
};

// CDA Control Options
const CDA_HOST = "https://cwms-data.usace.army.mil/cwms-data";
const CDA_RETRY_DELAY_MS = 300; // time in milliseconds between failed retries
const CDA_RETRY_COUNT = 2; // Number of times to try and fetch data before failing/throwing an error

const basinMap = {
  brazos: [
    { name: "WTYT2", href: "/hourly/KEYS" },
    { name: "ALAT2", href: "/hourly/KAWL" },
    { name: "ACTT2", href: "/hourly/CHEN" },
    { name: "El Dorado", href: "/hourly/ELDR" },
    { name: "Great Salt Plains", href: "/hourly/GSAL" },
    { name: "Heyburn Lake", href: "/hourly/HEYB" },
  ],
  colorado: [
    { name: "Pensacola (Grand Lake)", href: "/hourly/PENS" },
    { name: "Oologah Lake", href: "/hourly/OOLO" },
    { name: "Keystone Lake", href: "/hourly/KEYS" },
    { name: "Lake Hudson", href: "/hourly/HUDS" },
    { name: "Ft. Gibson Lake", href: "/hourly/FGIB" },
    { name: "Eufaula Lake", href: "/hourly/EUFA" },
    { name: "Tenkiller Lake", href: "/hourly/TENK" },
    { name: "Wister Lake", href: "/hourly/WIST" },
    { name: "Kaw Lake", href: "/hourly/KAWL" },
  ],
  guadalupe: [
    { name: "Eufaula Lake", href: "/hourly/EUFA" },
    { name: "Arcadia Lake", href: "/hourly/ARCA" },
    { name: "Canton Lake", href: "/hourly/CANT" },
    { name: "Ft. Supply Lake", href: "/hourly/FSUP" },
    { name: "Lake Thunderbird", href: "/hourly/THUN" },
    { name: "Lake Meredith", href: "/hourly/MERE" },
    { name: "Copan Lake", href: "/hourly/COPA" },
    { name: "Hula Lake", href: "/hourly/HULA" },
  ],
  neches: [
    { name: "Altus Dam", href: "/hourly/ALTU" },
    { name: "Kemp", href: "/hourly/KEMP" },
    { name: "Tom Steed", href: "/hourly/TOMS" },
    { name: "Foss", href: "/hourly/FOSS" },
    { name: "Fort Cobb", href: "/hourly/FCOB" },
    { name: "Waurika", href: "/hourly/WAUR" },
    { name: "Arbuckle", href: "/hourly/ARBU" },
    { name: "Denison", href: "/hourly/DENI" },
  ],
  red: [
    { name: "Hugo", href: "/hourly/HUGO" },
    { name: "Pat Mayse", href: "/hourly/PATM" },
    { name: "Broken Bow", href: "/hourly/BROK" },
    { name: "Sardis", href: "/hourly/SARD" },
    { name: "Denison (Lake Texoma)", href: "/hourly/DENI" },
    { name: "Pine Creek Lake", href: "/hourly/PINE" },
    { name: "McGee Creek Reservoir", href: "/hourly/MCGE" },
  ],
  trinity: [
    { name: "Council Grove Lake", href: "/hourly/COUN" },
    { name: "Marion Lake", href: "/hourly/MARI" },
    { name: "John Redmond Lake", href: "/hourly/JOHN" },
    { name: "Pensacola (Grand Lake)", href: "/hourly/PENS" },
    { name: "Lake Hudson", href: "/hourly/HUDS" },
    { name: "Ft. Gibson Lake", href: "/hourly/FGIB" },
  ],
};

export {
  basinProjects,
  level_ids,
  timeseries_ids,
  BASIN_COLORS,
  labels,
  basinMap,
  poolDisplay,
  lookBackHours,
  CDA_HOST,
  TS_API_VERSION,
  CDA_RETRY_COUNT,
  CDA_RETRY_DELAY_MS,
};
