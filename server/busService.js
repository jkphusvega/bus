import { XMLParser } from "fast-xml-parser";
import { MOCK_STATIONS, getMockArrivalList } from "./mockData.js";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

/**
 * 인천 버스 실시간 도착정보 조회
 */
export async function fetchBusArrivals(bstopId, apiKey) {
  // API Key가 없으면 Mock 반환
  if (!apiKey || apiKey.trim() === "") {
    return getMockArrivalList(bstopId);
  }

  // 공공데이터포털 키 처리: 이미 인코딩된 키인 경우 중복 인코딩 방지
  let cleanKey = apiKey.trim();
  try {
    // 이미 인코딩되어 있으면 decode 후 안전하게 encode
    if (cleanKey.includes("%")) {
      cleanKey = decodeURIComponent(cleanKey);
    }
  } catch (e) {}
  const encodedKey = encodeURIComponent(cleanKey);

  const endpoint = `http://apis.data.go.kr/6280000/busArrivalService/getAllRouteBusArrivalList`;
  const url = `${endpoint}?serviceKey=${encodedKey}&bstopId=${bstopId}&pageNo=1&numOfRows=30`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5초 타임아웃

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[BusAPI] HTTP error ${res.status}, falling back to mock`);
      return { ...getMockArrivalList(bstopId), apiWarning: `HTTP_${res.status}` };
    }

    const xmlText = await res.text();
    const parsed = xmlParser.parse(xmlText);

    // 공공데이터 에러 응답 체크 (SERVICE_KEY_IS_NOT_REGISTERED_ERROR 등)
    const header = parsed?.response?.header || parsed?.OpenAPI_ServiceResponse?.cmmMsgHeader;
    const resultCode = header?.resultCode || header?.returnReasonCode;
    
    if (resultCode && resultCode !== "0" && resultCode !== "00" && resultCode !== 0) {
      const errMsg = header?.resultMsg || header?.returnAuthMsg || "API Error";
      console.warn(`[BusAPI] Public API Error: ${errMsg} (Code: ${resultCode}) - using mock fallback`);
      return { 
        ...getMockArrivalList(bstopId), 
        isMock: true, 
        apiWarning: `공공데이터 API 응답: ${errMsg}` 
      };
    }

    const rawItems = parsed?.response?.body?.items?.item;
    let items = [];
    if (Array.isArray(rawItems)) {
      items = rawItems;
    } else if (rawItems) {
      items = [rawItems];
    }

    const matchedStation = MOCK_STATIONS.find(s => s.bstopId === bstopId) || {
      bstopId,
      bstopNm: "지정 정류소 (" + bstopId + ")",
      arsId: ""
    };

    // 정규화된 도착 버스 목록 포맷팅
    const arrivals = items.map(item => ({
      ROUTE_NO: String(item.ROUTE_NO || item.routeNo || ""),
      ROUTE_ID: String(item.ROUTE_ID || item.routeId || ""),
      REST_STOP_COUNT: Number(item.REST_STOP_COUNT || item.restStopCount || 0),
      ARRIVALESTIMATETIME: Number(item.ARRIVALESTIMATETIME || item.arrivalEstimateTime || 0),
      LATEST_STOP_NAME: String(item.LATEST_STOP_NAME || item.latestStopName || "이전 정류장"),
      BUS_NUM_PLATE: String(item.BUS_NUM_PLATE || item.busNumPlate || ""),
      CONGESTION: Number(item.CONGESTION || item.congestion || 3),
      LOW_TP_CD: Number(item.LOW_TP_CD || item.lowTpCd || 0),
      DIR_DESC: String(item.DIR_DESC || item.dirDesc || "")
    })).filter(bus => bus.ROUTE_NO !== "");

    return {
      station: matchedStation,
      timestamp: new Date().toISOString(),
      isMock: false,
      arrivals
    };
  } catch (err) {
    console.error("[BusAPI] Fetch error:", err.message);
    return { 
      ...getMockArrivalList(bstopId), 
      isMock: true, 
      apiWarning: `통신 장애로 시뮬레이션 모드 작동 (${err.message})` 
    };
  }
}

/**
 * 정류소 목록 검색 (키워드 또는 기본 목록)
 */
export async function searchBusStations(query, apiKey) {
  if (!query || query.trim() === "") {
    return MOCK_STATIONS;
  }

  const q = query.trim().toLowerCase();
  const filteredMock = MOCK_STATIONS.filter(s => 
    s.bstopNm.toLowerCase().includes(q) || s.arsId.includes(q) || s.routes.some(r => r.includes(q))
  );

  if (!apiKey || apiKey.trim() === "") {
    return filteredMock;
  }

  // 실 API 검색 시도
  const endpoint = `http://apis.data.go.kr/6280000/busStationService/getBusStationList`;
  const url = `${endpoint}?serviceKey=${encodeURIComponent(apiKey.trim())}&bstopNm=${encodeURIComponent(query)}&pageNo=1&numOfRows=10`;

  try {
    const res = await fetch(url);
    if (!res.ok) return filteredMock;
    const xml = await res.text();
    const parsed = xmlParser.parse(xml);
    const rawItems = parsed?.response?.body?.items?.item;
    let list = [];
    if (Array.isArray(rawItems)) list = rawItems;
    else if (rawItems) list = [rawItems];

    if (list.length === 0) return filteredMock;

    return list.map(item => ({
      bstopId: String(item.BSTOP_ID || item.bstopId),
      bstopNm: String(item.BSTOP_NM || item.bstopNm),
      arsId: String(item.SHORT_BSTOP_ID || item.shortBstopId || ""),
      lat: Number(item.GPS_Y || item.gpsY || 0),
      lng: Number(item.GPS_X || item.gpsX || 0),
      routes: []
    }));
  } catch (err) {
    return filteredMock;
  }
}
