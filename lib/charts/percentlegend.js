export default function percentLegend(
  svg,
  {
    radius,
    cx,
    cy,
    fontSize,
    strokeWidth = 1,
    strokeColor= "black",
    percentRanges = [1, 0.75, 0.5, 0.25],
    DASH_GAP_LENGTH = "16, 16",
  }
) {
  for (let per of percentRanges) {
    svg
      .append("text")
      .attr("x", cx - 15)
      .attr("y", cy - radius * per - strokeWidth * 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(per * 100 + "%")
      .style("font-size", fontSize)
      .style("font-family", "Arial, sans-serif");
    // Skip the outer most dash draw
    if (per != 1) {
      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", radius * per)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", DASH_GAP_LENGTH)
        .attr("fill", "none");
    }
  }
}
