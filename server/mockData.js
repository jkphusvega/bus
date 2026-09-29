// 인천광역시 전역 주요 정류소 및 제물포고등학교 통학 버스 데이터베이스
export const MOCK_STATIONS = [
  // =========================================================================
  // 🏫 제물포고등학교 통학 핵심 정류소 (중구 전동 / 자유공원로 인근)
  // =========================================================================
  {
    bstopId: "161000193",
    bstopNm: "송월아파트(제물포고교)",
    arsId: "35193",
    lat: 37.478200,
    lng: 126.623100,
    routes: ["45", "인천e음11"],
    dirDesc: "제물포고등학교 정문 도보 3분"
  },
  {
    bstopId: "161000197",
    bstopNm: "개항동어울터(송월아파트)",
    arsId: "35197",
    lat: 37.477900,
    lng: 126.622800,
    routes: ["45", "인천e음11"],
    dirDesc: "제물포고등학교 뒷길 방면"
  },
  {
    bstopId: "161000101",
    bstopNm: "동인천역북광장",
    arsId: "36101",
    lat: 37.476100,
    lng: 126.633500,
    routes: ["15", "28", "12", "62", "72", "306", "517"],
    dirDesc: "1호선 동인천역 · 제물포고 도보 8분"
  },
  {
    bstopId: "161000100",
    bstopNm: "동인천역남광장",
    arsId: "36100",
    lat: 37.474500,
    lng: 126.632900,
    routes: ["2", "9", "10", "15", "28", "45", "306"],
    dirDesc: "신포동 / 대한서림 방면"
  },
  {
    bstopId: "161000120",
    bstopNm: "자유공원입구",
    arsId: "36120",
    lat: 37.473500,
    lng: 126.624100,
    routes: ["15", "28", "306"],
    dirDesc: "자유공원 / 제물포구락부 방면"
  },
  {
    bstopId: "161000118",
    bstopNm: "송월동동화마을",
    arsId: "35118",
    lat: 37.479500,
    lng: 126.621200,
    routes: ["45", "인천e음11", "인천시티투어"],
    dirDesc: "차이나타운 / 동화마을 입구"
  },
  {
    bstopId: "161000130",
    bstopNm: "신포역(수인분당선)",
    arsId: "36130",
    lat: 37.469100,
    lng: 126.623800,
    routes: ["15", "28", "45", "306"],
    dirDesc: "수인분당선 신포역 2번출구"
  },

  {
    bstopId: "161000130",
    bstopNm: "신포역(수인분당선)",
    arsId: "36130",
    lat: 37.469100,
    lng: 126.623800,
    routes: ["15", "28", "45", "306"],
    dirDesc: "수인분당선 신포역 2번출구"
  },

  // =========================================================================
  // 🚌 제물포고 통학생들의 주요 출발 거점 (집 앞 정류소 예시)
  // =========================================================================
  {
    bstopId: "163000521",
    bstopNm: "주안역환승정류장",
    arsId: "37521",
    lat: 37.464730,
    lng: 126.680620,
    routes: ["511", "5", "65-1", "8", "28", "62"],
    dirDesc: "1호선 · 인천2호선 주안역 남광장 (28번 타면 동인천역 직통)"
  },
  {
    bstopId: "163000200",
    bstopNm: "제물포역",
    arsId: "37200",
    lat: 37.466800,
    lng: 126.656900,
    routes: ["4", "15", "21", "22", "33", "62"],
    dirDesc: "1호선 제물포역 (15번 타면 동인천역 직통)"
  },
  {
    bstopId: "163000155",
    bstopNm: "인하대후문",
    arsId: "37155",
    lat: 37.453316,
    lng: 126.657682,
    routes: ["511", "8", "5", "516", "9", "27"],
    dirDesc: "용현동 일대 거주 학생 출발지"
  },
  {
    bstopId: "163000142",
    bstopNm: "인하대역1번출구",
    arsId: "37142",
    lat: 37.447820,
    lng: 126.653490,
    routes: ["511", "9200", "8", "65-1", "16-1"],
    dirDesc: "수인분당선 환승"
  },
  {
    bstopId: "165000100",
    bstopNm: "부평역",
    arsId: "39100",
    lat: 37.489500,
    lng: 126.724100,
    routes: ["1", "12", "30", "45", "88", "551"],
    dirDesc: "부평역 (45번 타면 제물포고 앞 송월아파트 직통!)"
  },
  {
    bstopId: "165000101",
    bstopNm: "부평역지하상가",
    arsId: "39101",
    lat: 37.491200,
    lng: 126.723500,
    routes: ["1", "12", "30", "45", "88"],
    dirDesc: "45번 버스 승차 (제물포고 직통)"
  },
  {
    bstopId: "165000200",
    bstopNm: "동암역남광장",
    arsId: "39200",
    lat: 37.471500,
    lng: 126.703100,
    routes: ["7", "42", "62", "532", "535"],
    dirDesc: "62번 타면 동인천역 직행"
  },
  {
    bstopId: "164000120",
    bstopNm: "인천터미널",
    arsId: "38120",
    lat: 37.441200,
    lng: 126.700100,
    routes: ["4", "11", "21", "27", "34", "38"],
    dirDesc: "구월동 터미널 앞"
  },
  {
    bstopId: "166000100",
    bstopNm: "작전역",
    arsId: "40100",
    lat: 37.530500,
    lng: 126.722500,
    routes: ["80", "88", "300", "111", "770-1"],
    dirDesc: "계양구 작전동"
  },
  {
    bstopId: "166000200",
    bstopNm: "계산역",
    arsId: "40200",
    lat: 37.540100,
    lng: 126.728900,
    routes: ["80", "88", "111", "300", "588"],
    dirDesc: "계양산 방면"
  },
  {
    bstopId: "167000100",
    bstopNm: "검암역",
    arsId: "41100",
    lat: 37.568900,
    lng: 126.673500,
    routes: ["1", "66", "70", "700-1"],
    dirDesc: "서구 검암동"
  },
  {
    bstopId: "167000200",
    bstopNm: "청라국제도시역",
    arsId: "41200",
    lat: 37.555800,
    lng: 126.626100,
    routes: ["70", "700-1", "701", "702"],
    dirDesc: "청라국제도시"
  },
  {
    bstopId: "167000400",
    bstopNm: "석남역",
    arsId: "41400",
    lat: 37.506500,
    lng: 126.676100,
    routes: ["1", "7", "13", "14-1", "103"],
    dirDesc: "7호선 · 인천2호선"
  },
  {
    bstopId: "164000300",
    bstopNm: "인천대학교정문",
    arsId: "38300",
    lat: 37.376800,
    lng: 126.634500,
    routes: ["8", "908", "909", "순환41"],
    dirDesc: "송도국제도시"
  },
  {
    bstopId: "164000215",
    bstopNm: "인천대입구역",
    arsId: "38215",
    lat: 37.385540,
    lng: 126.642190,
    routes: ["8", "6-1", "909", "순환41"],
    dirDesc: "인천1호선 송도"
  }
];

// 실시간 도착 모의 시뮬레이터 (현실적인 초 단위 흐름)
let mockOffsetSeconds = 0;
setInterval(() => {
  mockOffsetSeconds = (mockOffsetSeconds + 2) % 3600;
}, 2000);

export function getMockArrivalList(bstopId) {
  const station = MOCK_STATIONS.find(s => s.bstopId === bstopId) || MOCK_STATIONS[0];
  const routeList = station.routes || ["45", "15", "28"];

  const mockBuses = routeList.map((routeNo, idx) => {
    const baseTime = (idx * 150 + 90) - (mockOffsetSeconds % 300);
    const estTime = Math.max(25, (baseTime + 600) % 600);
    const restStops = Math.max(1, Math.ceil(estTime / 70));

    let crowd = 3;
    if (idx === 0) crowd = 4;
    else if (idx === 1) crowd = 5;

    return {
      ROUTE_NO: routeNo,
      ROUTE_ID: `161000${String(idx).padStart(3, "0")}`,
      REST_STOP_COUNT: restStops,
      ARRIVALESTIMATETIME: estTime,
      LATEST_STOP_NAME: `${restStops}정거장 전 (${idx === 0 ? "차이나타운 입구" : "동인천역 지하도"})`,
      BUS_NUM_PLATE: `인천70바 ${3100 + (parseInt(routeNo.replace(/[^0-9]/g, "")) || 10) * 23 % 6000}`,
      CONGESTION: crowd,
      LOW_TP_CD: idx % 2 === 0 ? 1 : 0,
      DIR_DESC: station.dirDesc || "제물포고 방면"
    };
  }).sort((a, b) => a.ARRIVALESTIMATETIME - b.ARRIVALESTIMATETIME);

  return {
    station,
    timestamp: new Date().toISOString(),
    isMock: true,
    arrivals: mockBuses
  };
}
