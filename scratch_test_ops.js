const key = 'c3b02f7a498f5091518dba21ca32e2deed39eeb7bf82f9466c3c209c5568d131';

async function probe(serviceName, opList, sampleParam) {
  const base = `https://apis.data.go.kr/6280000/${serviceName}`;
  console.log(`\n=== Probing ${serviceName} ===`);
  for (const op of opList) {
    const url = `${base}/${op}?serviceKey=${key}&${sampleParam}`;
    try {
      const res = await fetch(url);
      const txt = await res.text();
      const isNoService = txt.includes('NO_OPENAPI_SERVICE_ERROR');
      const isHttpError = txt.includes('HTTP_ERROR');
      const isSuccess = txt.includes('<response>') || txt.includes('<header>');
      console.log(`[${op}] =>`, isNoService ? 'NO_SERVICE' : (isSuccess ? '✅ SUCCESS!' : (isHttpError ? '⚠️ HTTP_ERROR' : txt.slice(0, 80))));
    } catch (e) {
      console.log(`[${op}] ERR:`, e.message);
    }
  }
}

async function run() {
  await probe('busStationService', [
    'getBusStation',
    'getBusStationList',
    'getBusStationAroundList',
    'getBusStationViaRouteList',
    'getBusStationItem',
    'getBusRouteStationList'
  ], 'bstopNm=%EC%9D%B8%ED%95%98%EB%8C%80');

  await probe('busArrivalService', [
    'getBusArrivalList',
    'getBusArrivalItem',
    'getAllRouteBusArrivalList',
    'getBusArrivalRouteList',
    'getBusArrivalInfo'
  ], 'bstopId=163000155');

  await probe('busRouteService', [
    'getBusRouteList',
    'getBusRouteItem',
    'getBusRouteSectionList',
    'getBusRouteInfo'
  ], 'routeNo=45');
}

run();
