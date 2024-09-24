import { useQuery } from "react-query";
import dayjs from "dayjs";
import { CDA_DATE_FORMAT } from "../utils/api";

const useTimeseriesData = ({
  basin,
  office,
  lookBackHours,
  basinProjects,
  timeseries_ids,
  ts_api,
  cda_date_format,
}) => {
  if (!cda_date_format) cda_date_format = CDA_DATE_FORMAT;
  const queryKey = [basin + "-timeseries", dayjs().format("YYYY-MM-DDTHH")];

  const fetchTimeseriesData = async () => {
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
  };

  const {
    data: tsData,
    isPending: tsIsPending,
    error: tsIsError,
  } = useQuery({
    queryKey,
    queryFn: fetchTimeseriesData,
    retryOnMount: true,
    retry: CDA_RETRY_COUNT,
    retryDelay: CDA_RETRY_DELAY_MS,
    enabled: !!basin,
  });

  return { tsData, tsIsPending, tsIsError };
};

export default useTimeseriesData;
