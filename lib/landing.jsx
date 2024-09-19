import { useState } from "react";
import BasinPie from "./components/BasinPie";
import SaveSvgButton from "../components/SaveSvgButton";
import BasinPieList from "./components/BasinList";
import { capitalize } from "../../utils";
import { Badge } from "@usace/groundwork";
// import ContactUs from "../components/ContactUs"
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ts_api, level_api, CDA_DATE_FORMAT } from "../../utils/api.js";
import { getLatestEntry } from "../../utils/cda";
import Config from "../../utils/config.js";
const { OFFICE } = Config;
import { basinProjects, level_ids, timeseries_ids, labels, lookBackHours } from "./config";

import basinToProjectMap from "./components/BasinMap";

const basins = Object.keys(basinProjects).map((b) => capitalize(b));
export default function BasinTestPage() {
  const [basin, setBasin] = useState(basins[0].toLowerCase());
  const [pool, setPool] = useState("cons_pool");
  const [progress, setProgress] = useState(0);
  const TODAY = dayjs().format("YYYY-MM-DD");

  const {
    data: levelData,
    isPending: levelIsPending,
    error: levelError,
  } = useQuery({
    queryKey: [basin + "-levels", TODAY],
    queryFn: async () => {
      let level_promises = [];
      let _data = {};
      const projects = basinProjects[basin];
      const total_ids =
        Object.keys(projects).length * Object.keys(level_ids).length;
      let l_count = 0;
      for (let p_idx in projects) {
        const proj = projects[p_idx];
        for (let l_idx in level_ids) {
          const lid = level_ids[l_idx];
          level_promises.push(
            level_api
              .getCwmsDataLevels({
                levelIdMask: `*${proj}${lid}*`,
                office: OFFICE,
                format: "json",
                unit: "EN",
                begin: TODAY,
                end: TODAY,
              })
              .then((levelData) => {
                setProgress(Math.round((l_count / total_ids) * 100));
                l_count += 1;
                if (l_count == total_ids) {
                  setProgress(100);
                  setTimeout(() => {
                    setProgress(0);
                  }, 100);
                }
                return levelData;
              })
          );
        }
      }
      await Promise.all(level_promises).then((results) => {
        results.forEach((levelData) => {
          const locationLevels =
            levelData?.["location-levels"]?.["location-levels"];
          if (locationLevels && locationLevels.length > 0) {
            const name = locationLevels[0]?.name;
            const level = locationLevels[0]?.values?.segments[0]?.values[0];
            if (name && level !== undefined) {
              _data[name] = level;
            }
          }
        });
      });
      return _data;
    },
    retryOnMount: true,
    retry: 2,
    retryDelay: 300,
    enabled: !!basin,
  });
  const {
    data: tsData,
    isPending: tsIsPending,
    error: tsIsError,
  } = useQuery({
    queryKey: [basin + "-timeseries", dayjs().format("YYYY-MM-DDTHH")],
    queryFn: async () => {
      let timeseries_promises = [];
      let _data = {};
      const projects = basinProjects[basin];
      for (let p_idx in projects) {
        const proj = projects[p_idx];
        for (let ts_idx in timeseries_ids) {
          const tsid = timeseries_ids[ts_idx];
          timeseries_promises.push(
            ts_api.getCwmsDataTimeseries({
              office: OFFICE,
              name: `${proj}${tsid}`,
              begin: dayjs().subtract(lookBackHours, "hour").format(CDA_DATE_FORMAT),
            })
          );
        }
      }
      await Promise.all(timeseries_promises).then((results) => {
        results.forEach((timeseriesData) => {
          _data[timeseriesData?.name] = getLatestEntry(timeseriesData);
        });
      });
      return _data;
    },
    retryOnMount: true,
    retry: 2,
    retryDelay: 300,
    enabled: !!basin,
    timeout: 10000,
  });

  return (
    <>
      <div className="grid grid-cols-2">
        {/* Basin selector */}
        <div className="w-full">
          <div className="flex justify-center items-center w-2/4 mx-auto my-2">
            <select
              id="basin-selector"
              name="basin-selector"
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => {
                setBasin(
                  e.target.value
                    .replaceAll("-", "")
                    .replace(" ", "")
                    .toLowerCase()
                );
              }}
            >
              {basins.map((basin) => {
                return (
                  <option key={basin} value={basin}>
                    {basin}
                  </option>
                );
              })}
            </select>
            {/* Pool Selector */}
          </div>
          <div className="flex justify-center items-center w-2/4 mx-auto my-2">
            <select
              id="pool-selector"
              name="pool-selector"
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => {
                setPool(e.target.value);
              }}
            >
              <option value="cons_pool">Conservation Pool</option>
              <option value="flood_pool">Flood Pool</option>
            </select>
          </div>
        </div>
        <div className="text-center">
          <SaveSvgButton dom="#basin-pie" fileName={`${basin}.${pool}.svg`} />
        </div>
      </div>

      <h1 className="text-center text-4xl font-bold">Basin Pie Chart</h1>
      <div className="w-full text-center">
        <Badge color="red" className="m-auto mb-2">
          This page is currently in testing!
        </Badge>
      </div>

      <div className="flex my-5 mx-auto w-max">
        <BasinPie
          basin={basin}
          pool={pool}
          levelData={levelData}
          tsData={tsData}
          progress={progress}
          isPending={levelIsPending || tsIsPending}
          error={levelError || tsIsError}
          labels={labels}
          height={600}
          viewBoxWidth={480} // Expand the viewbox width to prevent clipping
          viewBoxHeight={700}
          cx={600 / 2} // Center the pie in the new viewport
          cy={600 / 2 + 10}
        />
      </div>
      {/* <Badge color="yellow" className="mb-2">
        *Taper: Arkansas River Basin Flood Release Plan as defined by Arkansas River Basin master
        manual.
      </Badge> */}
      <BasinPieList
        basins={Object.keys(basinToProjectMap).map((b) => {
          return { title: capitalize(b), href: `/basin/${b}` };
        })}
      />
      {/* <ContactUs /> */}
    </>
  );
}
