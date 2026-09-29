import { XMLParser } from "fast-xml-parser";
import { MOCK_STATIONS, getMockArrivalList } from "./mockData.js";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

/**
 * 키 인코딩 안전 처리 (이중 인코딩 방지)
 */
function getSafeServiceKey(apiKey) {
  let cleanKey = (apiKey || "").trim();
  try {
    if (cleanKey.includes("%")) {
      cleanKey = decodeURIComponent(cleanKey);
    }
  } catch (e) {}
  return {
    rawKey: cleanKey,
    encodedKey: encodeURIComponent(cleanKey)
  };
}

/**
 * 1. 국토교통부 TAGO 버스 도착 정보 조회 (1613000)
 * 전국 표준, 지자체 다운 방지 1순위
 */
async function fetchTagoArrivals(nodeId, safeKey) {
  const cleanId = String(nodeId || "").trim();
  const candidateIds = [];
  if (cleanId.startsWith("ICB")) {
    candidateIds.push(cleanId, cleanId.replace(/^ICB/, ""));
  } else {
    candidateIds.push(`ICB${cleanId}`, cleanId);
  }

  const endpoint = "https://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList";

  for (const tagoNodeId of candidateIds) {
    const url = `${endpoint}?serviceKey=${safeKey.encodedKey}&cityCode=23&nodeId=${encodeURIComponent(tagoNodeId)}&pageNo=1&numOfRows=30&_type=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) continue;

      const data = await res.json();
      const header = data?.response?.header;
      if (header?.resultCode !== "00" && header?.resultCode !== "0") {
        continue;
      }

      const rawItems = data?.response?.body?.items?.item;
      let items = [];
      if (Array.isArray(rawItems)) items = rawItems;
      else if (rawItems) items = [rawItems];

      if (items.length > 0) {
        return items.map(item => ({
          ROUTE_NO: String(item.routeno || ""),
          ROUTE_ID: String(item.routeid || ""),
          REST_STOP_COUNT: Number(item.arrprevstationcnt || 0),
          ARRIVALESTIMATETIME: Number(item.arrtime || 0),
          LATEST_STOP_NAME: `${item.arrprevstationcnt || 1}정류소 전`,
          BUS_NUM_PLATE: "",
          CONGESTION: 3,
          LOW_TP_CD: (item.vehicletp && item.vehicletp.includes("저상")) ? 1 : 0,
          DIR_DESC: `${item.routetp || "간선"} · TAGO 실시간`,
          NODE_NAME: item.nodenm || ""
        })).filter(b => b.ROUTE_NO !== "");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      continue;
    }
  }

  return null;
}

/**
 * 2. 인천광역시 자체 BIS 버스 도착 정보 조회 (6280000)
 */
async function fetchIncheonArrivals(bstopId, safeKey) {
  // 숫자만 추출
  const cleanBstopId = bstopId.replace(/[^0-9]/g, "");
  if (!cleanBstopId) return null;

  const endpoint = `http://apis.data.go.kr/6280000/busArrivalService/getAllRouteBusArrivalList`;
  const url = `${endpoint}?serviceKey=${safeKey.encodedKey}&bstopId=${cleanBstopId}&pageNo=1&numOfRows=30`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const xmlText = await res.text();
    const parsed = xmlParser.parse(xmlText);

    const header = parsed?.response?.header || parsed?.OpenAPI_ServiceResponse?.cmmMsgHeader;
    const resultCode = header?.resultCode || header?.returnReasonCode;
    if (resultCode && resultCode !== "0" && resultCode !== "00" && resultCode !== 0) {
      return null;
    }

    const rawItems = parsed?.response?.body?.items?.item;
    let items = [];
    if (Array.isArray(rawItems)) items = rawItems;
    else if (rawItems) items = [rawItems];

    return items.map(item => ({
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
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * 통합 실시간 도착정보 조회 (TAGO -> 인천 BIS -> 스마트 시뮬레이션 Fallback)
 */
export async function fetchBusArrivals(bstopId, apiKey, customMeta = {}) {
  // API Key가 없으면 Mock 반환
  if (!apiKey || apiKey.trim() === "") {
    return getMockArrivalList(bstopId, customMeta);
  }

  const safeKey = getSafeServiceKey(apiKey);
  let matchedStation = MOCK_STATIONS.find(s => s.bstopId === bstopId);
  if (!matchedStation) {
    matchedStation = {
      bstopId,
      bstopNm: customMeta.bstopNm || "지정 정류소",
      arsId: customMeta.arsId || "",
      dirDesc: customMeta.dirDesc || "등교 정류소"
    };
  }

  try {
    // 1순위: 국토교통부 TAGO 시도
    const tagoArrivals = await fetchTagoArrivals(bstopId, safeKey);
    if (tagoArrivals && tagoArrivals.length > 0) {
      return {
        station: matchedStation,
        timestamp: new Date().toISOString(),
        isMock: false,
        source: "TAGO (국토교통부 표준)",
        arrivals: tagoArrivals
      };
    }

    // 2순위: 인천광역시 BIS 시도
    const incheonArrivals = await fetchIncheonArrivals(bstopId, safeKey);
    if (incheonArrivals && incheonArrivals.length > 0) {
      return {
        station: matchedStation,
        timestamp: new Date().toISOString(),
        isMock: false,
        source: "INCHEON_BIS (인천광역시)",
        arrivals: incheonArrivals
      };
    }

    // 두 API 모두 실패 시: 스마트 폴백 시뮬레이션
    console.warn(`[BusAPI] Public APIs returned no data for ${bstopId}. Using zero-glitch fallback.`);
    return {
      ...getMockArrivalList(bstopId, customMeta),
      isMock: true,
      apiWarning: "공공데이터 포털 연계 점검 중으로 실시간 안전 모의 모드로 동작합니다."
    };
  } catch (err) {
    console.error("[BusAPI] Fatal fetch error:", err.message);
    return {
      ...getMockArrivalList(bstopId, customMeta),
      isMock: true,
      apiWarning: `통신 장애 대비 시뮬레이션 모드 (${err.message})`
    };
  }
}

/**
 * 정류소 목록 검색 (국토교통부 TAGO + 인천 BIS + 검증된 로컬 데이터)
 */
export async function searchBusStations(query, apiKey) {
  if (!query || query.trim() === "") {
    return MOCK_STATIONS;
  }

  const q = query.trim().toLowerCase();
  const filteredLocal = MOCK_STATIONS.filter(s =>
    s.bstopNm.toLowerCase().includes(q) || s.arsId.includes(q) || (s.routes && s.routes.some(r => r.includes(q)))
  );

  if (!apiKey || apiKey.trim() === "") {
    return filteredLocal;
  }

  const safeKey = getSafeServiceKey(apiKey);

  // 1. 국토교통부 TAGO 정류소 검색 시도 (BusSttnInfoInqireService)
  try {
    const isArsNumber = /^\d{5}$/.test(q);
    const paramKey = isArsNumber ? "nodeNo" : "nodeNm";
    const tagoUrl = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnNoList?serviceKey=${safeKey.encodedKey}&cityCode=23&${paramKey}=${encodeURIComponent(query.trim())}&_type=json`;

    const tagoRes = await fetch(tagoUrl);
    if (tagoRes.ok) {
      const tagoData = await tagoRes.json();
      const raw = tagoData?.response?.body?.items?.item;
      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (raw) list = [raw];

      if (list.length > 0) {
        return list.map(item => ({
          bstopId: String(item.nodeid || "").replace(/^ICB/, ""),
          bstopNm: String(item.nodenm || ""),
          arsId: String(item.nodeno || ""),
          lat: Number(item.gpslati || 0),
          lng: Number(item.gpslong || 0),
          routes: []
        }));
      }
    }
  } catch (e) {}

  // 2. 인천 BIS 검색 시도
  try {
    const incheonUrl = `http://apis.data.go.kr/6280000/busStationService/getBusStationList?serviceKey=${safeKey.encodedKey}&bstopNm=${encodeURIComponent(query)}&pageNo=1&numOfRows=15`;
    const res = await fetch(incheonUrl);
    if (res.ok) {
      const xml = await res.text();
      const parsed = xmlParser.parse(xml);
      const rawItems = parsed?.response?.body?.items?.item;
      let list = [];
      if (Array.isArray(rawItems)) list = rawItems;
      else if (rawItems) list = [rawItems];

      if (list.length > 0) {
        return list.map(item => ({
          bstopId: String(item.BSTOP_ID || item.bstopId),
          bstopNm: String(item.BSTOP_NM || item.bstopNm),
          arsId: String(item.SHORT_BSTOP_ID || item.shortBstopId || ""),
          lat: Number(item.GPS_Y || item.gpsY || 0),
          lng: Number(item.GPS_X || item.gpsX || 0),
          routes: []
        }));
      }
    }
  } catch (err) {}

  return filteredLocal;
}
