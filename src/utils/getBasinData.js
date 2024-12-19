// Fetch level data
const fetchLevelData = async (
  basin,
  basinProjects,
  level_ids,
  cdaParams,
  level_api
) => {
  try {
    let levelPromises = [];
    let _data = {};
    const projects = basinProjects[basin];
    const total_ids =
      Object.keys(projects).length * Object.keys(level_ids).length;
    let l_count = 0;

    for (let p_idx in projects) {
      const proj = projects[p_idx];
      for (let l_key in level_ids) {
        const lid = level_ids[l_key];
        const params = {
          ...cdaParams,
          levelIdMask: cdaParams?.levelIdMask
            ? cdaParams?.levelIdMask
            : `${proj}${lid}*`,
          format: "json",
          unit: "EN",
        };
        console.log("params", params);
        levelPromises.push(
          level_api
            .getCwmsDataLevels(params)
            .then((levelData) => {
              l_count += 1;
              if (l_count === total_ids) {
                console.log("All level data fetched");
              }
              return levelData;
            })
            .catch((e) => {
              console.log("ERROR", e?.message);
              return { error: e?.message };
            })
        );
      }
    }

    const results = await Promise.all(levelPromises);
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
    return _data;
  } catch (error) {
    console.error("Failed to fetch level data", error);
    return null;
  }
};

// Fetch timeseries data
const fetchTimeseriesData = async (
  basin,
  basinProjects,
  timeseries_ids,
  cdaParams,
  ts_api
) => {
  try {
    let timeseriesPromises = [];
    let _data = {};
    const projects = basinProjects[basin];

    for (let p_idx in projects) {
      const proj = projects[p_idx];
      for (let ts_idx in timeseries_ids) {
        const tsid = timeseries_ids[ts_idx];
        const params = {
          ...cdaParams,
          name: cdaParams?.name ? cdaParams?.name : `${proj}${tsid}`,
        };
        console.log(params);
        timeseriesPromises.push(ts_api.getCwmsDataTimeseries(params));
      }
    }

    const results = await Promise.all(timeseriesPromises);
    results.forEach((timeseriesData) => {
      _data[timeseriesData?.name] = getLatestEntry(timeseriesData);
    });
    return _data;
  } catch (error) {
    console.error("Failed to fetch timeseries data", error);
    return null;
  }
};

// Helper function to get the latest entry in timeseries
const getLatestEntry = (cdaTimeSeries) => {
  return cdaTimeSeries.values.filter((entry) => entry[1] !== null).slice(-1)[0];
};

export { fetchLevelData, fetchTimeseriesData, getLatestEntry };
