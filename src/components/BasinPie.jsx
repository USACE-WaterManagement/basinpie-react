import { useEffect, useMemo, useRef } from "react"
import * as d3 from "d3"
import { Skeleton } from "@usace/groundwork"

import { basinProjects} from "../config"
import {createBasinPie} from "../charts/basinpie"
const DASH_GAP_LENGTH = "16, 16"
const STROKE_WIDTH = 2





export default function BasinPie({
  levelData,
  tsData,
  isPending,
  error,
  className = "",
  labels = [],
  progress = 0,
  basin = "upperark",
  pool = "cons_pool",
  id = "basin-pie",
  width = 480,
  height = 480,
  fontSize = "1.1em",
  cx = null,
  cy = null,
  viewBoxWidth = null,
  viewBoxHeight = null,
}) {
  const ref = useRef()

  const radius = Math.min(width, height) / 2
  // Setup defaults if the user does not provide them
  // Origin of pie / center of circle
  cx = cx ? cx : radius + (radius * 1) / 7
  cy = cy ? cy : radius + (radius * 1) / 7
  // parent svg viewbox
  viewBoxWidth = viewBoxWidth ? viewBoxWidth : width + (width * 1) / 3
  viewBoxHeight = viewBoxHeight ? viewBoxHeight : height + (width * 1) / 3
  useEffect(() => {
    if (!levelData || !tsData) return
    try {
      if (!levelData || !tsData) return // Ensure data is loaded
      const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width + 120} ${height + 120}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("aria-hidden", true)
      .attr("class", className)
      const options = { radius, basin, pool, viewBoxHeight, viewBoxWidth, levelData, tsData, labels, cx, cy, fontSize }
      createBasinPie(
        svg,
        basinProjects,
        options
        )
        // svg, basinProjects, basin, pool, levelData, tsData, progress, labels, viewBoxWidth, viewBoxHeight, cx, cy, fontSize)
    } catch (err) {
      console.error(err)
    }
  }, [ref, levelData, tsData, basin, pool, radius, cx, cy, labels, width, height, isPending, error])
  if (isPending)
    return (
      <Skeleton
        type="card"
        style={{
          borderRadius: width,
          height: height + "px",
          width: width + "px",
        }}
        className="m-auto"
      >
        <div
        className="bg-slate-50 text-black font-semibold text-center relative left-1/2 top-1/2 rounded-xl -translate-x-1/2 -translate-y-1/2 text-2xl w-1/5"
        >
          {progress}%
        </div>
      </Skeleton>
    )
  if (!basinProjects?.[basin]) return <div>Basin not found</div>
  if (error) return <div>Error: {error}</div>
  return (
    <svg
      id={id}
      ref={ref}
      aria-hidden={true}
      style={{height: height + "px", width: width + "px"}}
      preserveAspectRatio="xMinYMin meet"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={className}
    />
  )
}
