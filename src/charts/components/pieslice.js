import * as d3 from "d3";

export const pieSlice = (
  svg,
  textGroup,
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
