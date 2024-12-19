import {
  TimeSeriesApi,
  LevelsApi,
  CatalogApi,
  Configuration,
  LocationsApi,
} from "cwmsjs";

const CDA_DATE_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";

// Function to initialize the APIs with a dynamic CDA_HOST
function initializeAPIs(CDA_HOST) {
  const base_only = new Configuration({
    basePath: CDA_HOST,
  });

  const config_v2 = new Configuration({
    basePath: CDA_HOST,
    headers: {
      accept: `application/json;version=2`,
    },
  });

  const ts_api = new TimeSeriesApi(config_v2);
  const level_api = new LevelsApi(base_only);
  const cata_api = new CatalogApi(config_v2);
  const locations_api = new LocationsApi(config_v2);

  return { ts_api, level_api, cata_api, locations_api, config_v2 };
}

export { initializeAPIs, CDA_DATE_FORMAT };
