import dayjs from "dayjs";
// these imports expand the format functionality of dayjs
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);
import advancedFormat from "dayjs/plugin/advancedFormat.js"; // ES 2015
// https://day.js.org/docs/en/plugin/advanced-format
dayjs.extend(advancedFormat);

const basinProjects = {
  upperred: ["DENI", "ARBU", "WAUR", "FCOB", "FOSS", "TOMS", "KEMP", "ALTU"],
  lowerark: ["WIST", "TENK", "EUFA", "FGIB", "HUDS", "KEYS", "OOLO", "PENS"],
  verdigris: [
    "SKIA",
    "BIRC",
    "HULA",
    "COPA",
    "BIGH",
    "ELKC",
    "FALL",
    "TORO",
    "OOLO",
  ],
  grandneosho: ["FGIB", "HUDS", "PENS", "JOHN", "MARI", "COUN"],
  upperark: ["HEYB", "GSAL", "ELDR", "CHEN", "KAWL", "KEYS"],
  canadian: ["MERE", "THUN", "FSUP", "CANT", "ARCA", "EUFA"],
  lowerred: ["MCGE", "PINE", "DENI", "SARD", "BROK", "PATM", "HUGO"],
  taper: [
    "WIST",
    "SKIA",
    "BIRC",
    "PENS",
    "COPA",
    "HULA",
    "HUDS",
    "FGIB",
    "TENK",
    "EUFA",
    "KEYS",
    "KAWL",
    "OOLO",
  ],
};
const level_ids = {
  TOF: ".Stor.Inst.0.Top of Flood",
  TOC: ".Stor.Inst.0.Top of Conservation",
  TOI: ".Stor.Inst.0.Top of Inactive",
};
const timeseries_ids = {
  FCP: ".Stor-Flood Pool.Inst.1Hour.0.Ccp-Rev",
  Cons: ".Stor-Conservation Pool.Inst.1Hour.0.Ccp-Rev",
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
      x: "viewBoxWidth / 2",
      y: "20",
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
    text: `THE FULL PIE IS %total_stor ACRE-FEET OR %percent_full%`,
  },
  {
    attr: {
      x: "viewBoxWidth / 2",
      y: "viewBoxHeight - 20",
      "text-anchor": "middle",
      "font-size": "1em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    style: {
      "font-size": "1em",
      "font-weight": "bold",
      "font-family": "Arial, sans-serif",
    },
    text: `IMAGE DATE: ${dayjs().format("ddd MMM DD HH:mm:ss z YYYY")}`,
  },
];

const basinMap = {
  upperark: [
    { name: "Keystone", href: "/hourly/KEYS" },
    { name: "Kaw Lake", href: "/hourly/KAWL" },
    { name: "Cheney", href: "/hourly/CHEN" },
    { name: "El Dorado", href: "/hourly/ELDR" },
    { name: "Great Salt Plains", href: "/hourly/GSAL" },
    { name: "Heyburn Lake", href: "/hourly/HEYB" },
  ],
  lowerark: [
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
  canadian: [
    { name: "Eufaula Lake", href: "/hourly/EUFA" },
    { name: "Arcadia Lake", href: "/hourly/ARCA" },
    { name: "Canton Lake", href: "/hourly/CANT" },
    { name: "Ft. Supply Lake", href: "/hourly/FSUP" },
    { name: "Lake Thunderbird", href: "/hourly/THUN" },
    { name: "Lake Meredith", href: "/hourly/MERE" },
    { name: "Copan Lake", href: "/hourly/COPA" },
    { name: "Hula Lake", href: "/hourly/HULA" },
  ],
  upperred: [
    { name: "Altus Dam", href: "/hourly/ALTU" },
    { name: "Kemp", href: "/hourly/KEMP" },
    { name: "Tom Steed", href: "/hourly/TOMS" },
    { name: "Foss", href: "/hourly/FOSS" },
    { name: "Fort Cobb", href: "/hourly/FCOB" },
    { name: "Waurika", href: "/hourly/WAUR" },
    { name: "Arbuckle", href: "/hourly/ARBU" },
    { name: "Denison", href: "/hourly/DENI" },
  ],
  lowerred: [
    { name: "Hugo", href: "/hourly/HUGO" },
    { name: "Pat Mayse", href: "/hourly/PATM" },
    { name: "Broken Bow", href: "/hourly/BROK" },
    { name: "Sardis", href: "/hourly/SARD" },
    { name: "Denison (Lake Texoma)", href: "/hourly/DENI" },
    { name: "Pine Creek Lake", href: "/hourly/PINE" },
    { name: "McGee Creek Reservoir", href: "/hourly/MCGE" },
  ],
  grandneosho: [
    { name: "Council Grove Lake", href: "/hourly/COUN" },
    { name: "Marion Lake", href: "/hourly/MARI" },
    { name: "John Redmond Lake", href: "/hourly/JOHN" },
    { name: "Pensacola (Grand Lake)", href: "/hourly/PENS" },
    { name: "Lake Hudson", href: "/hourly/HUDS" },
    { name: "Ft. Gibson Lake", href: "/hourly/FGIB" },
  ],
  verdigris: [
    { name: "Oologah Lake", href: "/hourly/OOLO" },
    { name: "Toronto Lake", href: "/hourly/TORO" },
    { name: "Fall River Lake", href: "/hourly/FALL" },
    { name: "Elk City Lake", href: "/hourly/ELKC" },
    { name: "Big Hill Lake", href: "/hourly/BIGH" },
    { name: "Copan Lake", href: "/hourly/COPA" },
    { name: "Hulah Lake", href: "/hourly/HULA" },
    { name: "Birch Lake", href: "/hourly/BIRC" },
    { name: "Skiatook Lake", href: "/hourly/SKIA" },
  ],
  taper: [
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
};

export {
  basinProjects,
  level_ids,
  timeseries_ids,
  BASIN_COLORS,
  labels,
  basinMap,
};
