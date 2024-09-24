import percentLegend from "./percentlegend.js";
import {
  level_ids,
  timeseries_ids,
  BASIN_COLORS,
  poolDisplay,
} from "../config.js";

import * as d3 from "d3";

export const pie = (
  svg,
  textGroup, // Pass in the textGroup separately
  {
    length,
    title,
    cx,
    cy,
    angle,
    delta,
    percentFull = 1,
    fill = "none",
    fontSize,
    STROKE_WIDTH = 1,
  }
) => {
  let missing_data = false;
  if (percentFull == -901) missing_data = true;
  if (percentFull < 0) percentFull = 0;
  if (percentFull > 1) {
    percentFull = 1;
  }
  if (isNaN(percentFull)) missing_data = true;

  const angleRadians = angle * (Math.PI / 180);
  const deltaRadians = delta * (Math.PI / 180);

  const middleAngle = angle - 90 + (delta - angle) / 2;
  const middleAngleRadians = middleAngle * (Math.PI / 180);
  const textRadius = delta - angle < 10 ? length * 1.135 : length * 1.12;
  const textX = cx + textRadius * Math.cos(middleAngleRadians);
  const textY = cy + textRadius * Math.sin(middleAngleRadians);

  // Draw the full pie slice
  const fullArcGenerator = d3
    .arc()
    .innerRadius(0)
    .outerRadius(length)
    .startAngle(angleRadians)
    .endAngle(deltaRadians);

  svg
    .append("path")
    .attr("d", fullArcGenerator) // Use the arc generator to create the path data
    .attr("transform", `translate(${cx}, ${cy})`) // Move the arc to the circle's center
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .attr("stroke", "black")
    .attr("stroke-width", STROKE_WIDTH);

  // Draw the filled inner pie slice
  const smallArcGenerator = d3
    .arc()
    .innerRadius(0)
    .outerRadius(length * percentFull)
    .startAngle(angleRadians)
    .endAngle(deltaRadians);

  svg
    .append("path")
    .attr("d", smallArcGenerator)
    .attr("transform", `translate(${cx}, ${cy})`)
    .attr("fill", fill)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("data-index", title)
    .attr("class", "cursor-pointer")
    .on("mouseover", function (e) {
      // Calculate middle angle and offset
      const middleAngle = angle - 90 + (delta - angle) / 2;
      const middleAngleRadians = middleAngle * (Math.PI / 180);
      const offsetX = 20 * Math.cos(middleAngleRadians); // Adjust '10' for desired hover distance
      const offsetY = 20 * Math.sin(middleAngleRadians);

      // Make all text opaque
      textGroup.selectAll("text").style("opacity", 0.1);
      // Remove opacity from hovered slice
      textGroup
        .select(`text[data-index='${e.target.getAttribute("data-index")}']`)
        .style("opacity", 1);

      // transform the slice and move it
      d3.select(this).attr(
        "transform",
        `translate(${cx + offsetX}, ${cy + offsetY})`
      );
    })
    .on("mouseout", function () {
      // Reset text state when not hovering
      textGroup.selectAll("text").style("opacity", 1);
      d3.select(this).attr("transform", `translate(${cx}, ${cy})`);
    })
    .on("click", function (e) {
      location.href = `/hourly/${e.target.getAttribute("data-index")}`;
    });

  // background color
  //   textGroup
  //     .append("rect")
  //     .attr("x", textX - 30) // Adjust based on text length
  //     .attr("y", textY - 10) // Adjust to provide padding
  //     .attr("rx", 5) // Rounded corners
  //     .attr("ry", 5) // Rounded corners
  //     .attr("width", 60) // Adjust based on text length
  //     .attr("height", 20) // Adjust to provide padding
  //     .style("fill", "white") // Background color
  //     .style("opacity", 0.8) // Slight transparency
  //     .attr("data-index", title); // Use index to identify the rect

  // Add the text element to the separate text group to ensure it is on top
  const text = textGroup
    .append("text")
    .attr("x", textX)
    .attr("y", textY)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(
      missing_data
        ? title + " Missing ⚠"
        : title + " " + (Math.round(percentFull * 100) + "%")
    )
    .style("fill", missing_data ? "red" : "black")
    .style("font-size", fontSize)
    .style("font-family", "Arial, sans-serif")
    // .style("background-color", "white") // Optional, for debugging
    .style("padding", "5px") // Add padding
    .attr("data-index", title); // Use index to identify the text

  // Set initial opacity for hover effect
  text.style("opacity", 1); // Make the text visible by default
};

export function createBasinPie(
  svg,
  basinProjects,
  {
    radius,
    width,
    height,
    viewBoxWidth,
    viewBoxHeight,
    basin,
    pool,
    levelData,
    tsData,
    labels,
    cx,
    cy,
    fontSize,
    STROKE_WIDTH = 1,
  }
) {
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
  locations.forEach((location) => {
    _data[location] = {};
    const TOF = levelData[location + level_ids.TOF];
    const TOC = levelData[location + level_ids.TOC];
    const TOI = levelData[location + level_ids.TOI];
    if (!TOF) {
      alert("Top of Flood is not defined for: " + location + level_ids.TOF);
    } else if (!TOC) {
      alert(
        "Top of Conservation is not defined for: " + location + level_ids.TOC
      );
    } else if (!TOI) {
      alert("Top of Inactive is not defined for: " + location + level_ids.TOI);
    }
    let incr_stor = pool === "flood_pool" ? TOF[1] - TOC[1] : TOC[1] - TOI[1];
    let stor_filled =
      tsData[
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
  });
  let _deltaCounter = 0;
  let color_idx = 0;
  for (let i = 0; i < locations.length; i++) {
    const PROJ = locations[i];
    const projData = _data[PROJ][pool];
    let angle = (projData.incr_stor / total_incr) * 360;
    const perFull = Math.max(projData.stor_filled / projData.incr_stor, 0);
    pie(pieGroup, textGroup, {
      // Pass textGroup to pie function
      length: radius - STROKE_WIDTH * 2,
      title: PROJ,
      cx,
      cy,
      angle: _deltaCounter,
      delta: angle + _deltaCounter,
      fill: BASIN_COLORS[color_idx],
      percentFull: perFull,
      fontSize,
      STROKE_WIDTH,
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
        console.log(key, value);
        if (key == "x") value = eval(value);
        else if (key == "y") value = eval(value);
        _text.attr(key, value);
        console.log("new", value);
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
