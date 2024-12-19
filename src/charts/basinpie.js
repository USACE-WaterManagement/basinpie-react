import percentLegend from "./percentlegend.js";
import { pieSlice } from "./components/pieslice.js";

export function createBasinPie({
  svg,
  basinProjects,
  basin,
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
}) {
  // Remove all elements from previous draw
  svg.selectAll("*").remove();
  // Create a group for pie slices
  const pieGroup = svg.append("g").attr("class", "pie-layer");

  // Create a separate group for text
  const textGroup = svg.append("g").attr("class", "text-layer");
  // Create Pie Chunks
  const locations = Array.from(basinProjects?.[basin]);
  let total_stor = 0.0;
  let total_incr = 0.0;
  let _data = {};
  for (let location of locations) {
    _data[location] = {};
    const TOF = levelData[location + level_ids.TOF];
    const TOC = levelData[location + level_ids.TOC];
    const TOI = levelData[location + level_ids.TOI];
    console.log(levelData);
    if (!TOF) {
      console.warn(
        "Top of Flood is not defined for: " + location + level_ids.TOF
      );
    } else if (!TOC) {
      console.warn(
        "Top of Conservation is not defined for: " + location + level_ids.TOC
      );
    } else if (!TOI) {
      console.warn(
        "Top of Inactive is not defined for: " + location + level_ids.TOI
      );
    }
    console.log({ timeseriesData });
    let incr_stor;
    try {
      incr_stor = pool === "flood_pool" ? TOF[1] - TOC[1] : TOC[1] - TOI[1];
    } catch (e) {
      console.error(e);
      continue;
    }
    let stor_filled =
      timeseriesData[
        pool == "flood_pool"
          ? location + timeseries_ids.FCP
          : location + timeseries_ids.Cons
      ]?.[1];

    if (stor_filled > 0) total_stor += stor_filled;
    total_incr += incr_stor;

    _data[location][pool] = {
      stor_filled,
      incr_stor,
    };
  }
  let _deltaCounter = 0;
  let color_idx = 0;
  for (let i = 0; i < locations.length; i++) {
    const PROJ = locations[i];
    const projData = _data[PROJ][pool];
    if (!projData) {
      console.warn("No data for " + PROJ);
      continue;
    }
    let angle = (projData.incr_stor / total_incr) * 360;
    const perFull = Math.max(projData.stor_filled / projData.incr_stor, 0);
    pieSlice(pieGroup, textGroup, {
      // Pass textGroup to pie function
      length: radius - strokeWidth * 2,
      title: PROJ,
      cx,
      cy,
      angle: _deltaCounter,
      delta: angle + _deltaCounter,
      fill: BASIN_COLORS[color_idx],
      percentFull: perFull,
      fontSize,
      strokeWidth,
    });
    _deltaCounter += angle;
    color_idx += 1;
    color_idx >= BASIN_COLORS.length && (color_idx = 0);
  }

  // Add the legend
  const percentRanges = [0.75];
  const strokeColor = "gray";
  percentLegend(svg, { radius, cx, cy, fontSize, percentRanges, strokeColor });

  /* Add provided labels to the pie */
  if (labels.length > 0) {
    labels.forEach((label) => {
      const _text = textGroup.append("text");
      // Retrieve the key and value out of the attr

      Object.keys(label?.attr).forEach((key) => {
        let value = label.attr[key];
        if (key == "x") value = eval(value);
        else if (key == "y") value = eval(value);
        _text.attr(key, value);
      });

      Object.keys(label?.style).forEach((key) => {
        _text.style(key, label.style[key]);
      });
      // Handle replacing text with string variables
      label.text &&
        _text.text(
          label.text
            .replace(
              "%total_stor",
              Number(parseInt(total_stor).toFixed(0)).toLocaleString()
            )
            .replace(
              "%percent_full",
              Math.round((total_stor / total_incr) * 100)
            )
            .replace("%pool", poolDisplay[pool])
            .replace(
              "%total_incr",
              Number(parseInt(total_incr).toFixed(0)).toLocaleString()
            )
        );
    });
  }
  return svg;
}
