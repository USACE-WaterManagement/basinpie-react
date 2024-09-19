import { useQuery } from "@tanstack/react-query";
import { useConnect } from "redux-bundler-hook";
import { useEffect, useState } from "react";
import { capitalize } from "../../utils";
import BasinPie from "./components/BasinPie";
import { CDA_DATE_FORMAT, ts_api } from "../../utils/api";
import {
  office,
  basinProjects,
  level_ids,
  timeseries_ids,
  labels,
  lookBackHours,
} from "./config";
import dayjs from "dayjs";
import { level_api } from "../../utils/api";
import { getLatestEntry } from "../../utils/cda";

export default function BasinPie({ basin, begin, end }) {
  const TODAY = dayjs().format("YYYY-MM-DD");
  const [progress, setProgress] = useState(0);
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
        for (let l_key in level_ids) {
          const lid = level_ids[l_key];
          level_promises.push(
            level_api
              .getCwmsDataLevels({
                levelIdMask: `*${proj}${lid}*`,
                office: office,
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
              office: office,
              name: `${proj}${tsid}`,
              begin: dayjs()
                .subtract(lookBackHours, "hour")
                .format(CDA_DATE_FORMAT),
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
  });
  useEffect(() => {
    if (routeParams?.basin) {
      document.title = `${capitalize(routeParams?.basin)} Basin`;
    }
  }, [routeParams]);

  return (
    <BasinPie
      isPending={levelIsPending || tsIsPending}
      error={levelError || tsIsError}
      levelData={levelData}
      tsData={tsData}
      basin={basin}
      progress={progress}
      pool={"cons_pool"}
      className="m-auto"
      labels={labels}
      viewBoxWidth={600} // Expand the viewbox width to prevent clipping
      viewBoxHeight={600 + 100}
      cx={600 / 2} // Center the pie in the new viewport
      cy={600 / 2 + 10}
    />
  );
}
