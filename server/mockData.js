// 인천광역시 전역 주요 정류소 및 실시간 버스 도착 정보 데이터베이스
export const MOCK_STATIONS = [
  // 1. 인하대학교 거점
  {
    bstopId: "163000155",
    bstopNm: "인하대후문",
    arsId: "37155",
    lat: 37.453316,
    lng: 126.657682,
    routes: ["511", "8", "5", "516", "9", "27"],
    dirDesc: "주안역 / 용현시장 방면"
  },
  {
    bstopId: "163000156",
    bstopNm: "인하대정문",
    arsId: "37156",
    lat: 37.449850,
    lng: 126.654810,
    routes: ["511", "8", "9200", "111-2", "3001"],
    dirDesc: "학익사거리 / 송도 방면"
  },
  {
    bstopId: "163000142",
    bstopNm: "인하대역1번출구",
    arsId: "37142",
    lat: 37.447820,
    lng: 126.653490,
    routes: ["511", "9200", "8", "65-1", "16-1"],
    dirDesc: "수인분당선 인하대역"
  },
  {
    bstopId: "163000143",
    bstopNm: "인하대역2번출구",
    arsId: "37143",
    lat: 37.447510,
    lng: 126.652880,
    routes: ["511", "8", "9200"],
    dirDesc: "용현동 / 옹진군청 방면"
  },
  {
    bstopId: "163000150",
    bstopNm: "인하공업전문대학",
    arsId: "37150",
    lat: 37.451200,
    lng: 126.655900,
    routes: ["511", "5", "27"],
    dirDesc: "정석항공고 방면"
  },

  // 2. 인천대학교 송도캠퍼스 거점
  {
    bstopId: "164000301",
    bstopNm: "인천대학교자연과학대학",
    arsId: "38301",
    lat: 37.375210,
    lng: 126.632120,
    routes: ["8", "6-1", "908", "909"],
    dirDesc: "송도공영차고지 방면"
  },
  {
    bstopId: "164000300",
    bstopNm: "인천대학교정문",
    arsId: "38300",
    lat: 37.376800,
    lng: 126.634500,
    routes: ["8", "908", "909", "순환41"],
    dirDesc: "송도국제도시 방면"
  },
  {
    bstopId: "164000302",
    bstopNm: "인천대학교공과대학",
    arsId: "38302",
    lat: 37.374100,
    lng: 126.631200,
    routes: ["8", "6-1", "908"],
    dirDesc: "캠퍼스 순환 방면"
  },
  {
    bstopId: "164000215",
    bstopNm: "인천대입구역",
    arsId: "38215",
    lat: 37.385540,
    lng: 126.642190,
    routes: ["8", "6-1", "909", "순환41", "1301"],
    dirDesc: "인천 1호선 인천대입구역"
  },
  {
    bstopId: "164000217",
    bstopNm: "테크노파크역",
    arsId: "38217",
    lat: 37.382100,
    lng: 126.656500,
    routes: ["6-1", "908", "909", "8"],
    dirDesc: "현대프리미엄아울렛 송도점"
  },
  {
    bstopId: "164000218",
    bstopNm: "지식정보단지역",
    arsId: "38218",
    lat: 37.378900,
    lng: 126.644100,
    routes: ["8", "908", "6-1"],
    dirDesc: "인천 1호선"
  },

  // 3. 연세대학교 국제캠퍼스 송도 거점
  {
    bstopId: "164000880",
    bstopNm: "연세대송도캠퍼스입구",
    arsId: "38880",
    lat: 37.381400,
    lng: 126.668100,
    routes: ["9201", "순환41", "M6724", "6-1"],
    dirDesc: "신촌 / 강남역 광역버스 환승"
  },
  {
    bstopId: "164000881",
    bstopNm: "연세대학교",
    arsId: "38881",
    lat: 37.383200,
    lng: 126.669800,
    routes: ["9201", "M6724", "순환41"],
    dirDesc: "국제캠퍼스 기숙사 방면"
  },
  {
    bstopId: "164000220",
    bstopNm: "캠퍼스타운역",
    arsId: "38220",
    lat: 37.388100,
    lng: 126.664200,
    routes: ["9201", "M6724", "순환41", "6-1", "909"],
    dirDesc: "연세대 학생 도보 5분"
  },

  // 4. 주안역 거점
  {
    bstopId: "163000521",
    bstopNm: "주안역환승정류장",
    arsId: "37521",
    lat: 37.464730,
    lng: 126.680620,
    routes: ["511", "5", "65-1", "8", "28", "62"],
    dirDesc: "1호선 · 인천2호선 주안역 남광장"
  },
  {
    bstopId: "163000520",
    bstopNm: "주안역북광장",
    arsId: "37520",
    lat: 37.466500,
    lng: 126.681100,
    routes: ["28-1", "510", "512"],
    dirDesc: "주안북부역 방면"
  },

  // 5. 부평역 거점
  {
    bstopId: "165000100",
    bstopNm: "부평역",
    arsId: "39100",
    lat: 37.489500,
    lng: 126.724100,
    routes: ["1", "12", "30", "45", "88", "551", "579"],
    dirDesc: "부평역광장 / 부평지하상가"
  },
  {
    bstopId: "165000101",
    bstopNm: "부평역지하상가",
    arsId: "39101",
    lat: 37.491200,
    lng: 126.723500,
    routes: ["1", "12", "30", "45", "88"],
    dirDesc: "부평시장 방면"
  },
  {
    bstopId: "165000105",
    bstopNm: "부평시장역",
    arsId: "39105",
    lat: 37.498100,
    lng: 126.722800,
    routes: ["1", "12", "30", "551", "584"],
    dirDesc: "인천1호선 부평시장역"
  },

  // 6. 구월동 & 인천터미널 거점
  {
    bstopId: "164000120",
    bstopNm: "인천터미널",
    arsId: "38120",
    lat: 37.441200,
    lng: 126.700100,
    routes: ["4", "11", "21", "27", "34", "38", "1300"],
    dirDesc: "구월동 롯데백화점 · 터미널"
  },
  {
    bstopId: "164000110",
    bstopNm: "예술회관역",
    arsId: "38110",
    lat: 37.449800,
    lng: 126.701200,
    routes: ["11", "22", "45", "82", "1400"],
    dirDesc: "구월동 로데오거리"
  },
  {
    bstopId: "164000100",
    bstopNm: "인천시청역",
    arsId: "38100",
    lat: 37.457800,
    lng: 126.702500,
    routes: ["8", "11", "22", "33", "45", "82"],
    dirDesc: "인천1·2호선 환승역"
  },

  // 7. 동암역 & 백운역 & 제물포역
  {
    bstopId: "165000200",
    bstopNm: "동암역남광장",
    arsId: "39200",
    lat: 37.471500,
    lng: 126.703100,
    routes: ["7", "42", "62", "532", "535"],
    dirDesc: "1호선 동암역 남부"
  },
  {
    bstopId: "165000201",
    bstopNm: "동암역북광장",
    arsId: "39201",
    lat: 37.472800,
    lng: 126.702800,
    routes: ["7", "42", "62", "532", "592"],
    dirDesc: "십정동 방면"
  },
  {
    bstopId: "163000200",
    bstopNm: "제물포역",
    arsId: "37200",
    lat: 37.466800,
    lng: 126.656900,
    routes: ["4", "15", "21", "22", "33", "62"],
    dirDesc: "인천대 제물포캠퍼스 / 청운대"
  },
  {
    bstopId: "161000100",
    bstopNm: "동인천역",
    arsId: "36100",
    lat: 37.475100,
    lng: 126.632800,
    routes: ["2", "9", "10", "15", "28", "306"],
    dirDesc: "신포동 / 차이나타운 방면"
  },

  // 8. 계양 & 작전 & 청라 & 검암
  {
    bstopId: "166000100",
    bstopNm: "작전역",
    arsId: "40100",
    lat: 37.530500,
    lng: 126.722500,
    routes: ["80", "88", "300", "111", "770-1"],
    dirDesc: "인천1호선 작전역"
  },
  {
    bstopId: "166000200",
    bstopNm: "계산역",
    arsId: "40200",
    lat: 37.540100,
    lng: 126.728900,
    routes: ["80", "88", "111", "300", "588"],
    dirDesc: "경인교대 / 계양산 방면"
  },
  {
    bstopId: "166000300",
    bstopNm: "계양역",
    arsId: "40300",
    lat: 37.571500,
    lng: 126.736100,
    routes: ["770-1", "81", "87", "841", "583"],
    dirDesc: "공항철도 · 인천1호선 환승역"
  },
  {
    bstopId: "167000100",
    bstopNm: "검암역",
    arsId: "41100",
    lat: 37.568900,
    lng: 126.673500,
    routes: ["1", "66", "70", "700-1", "순환83"],
    dirDesc: "공항철도 · 인천2호선 검암역"
  },
  {
    bstopId: "167000200",
    bstopNm: "청라국제도시역",
    arsId: "41200",
    lat: 37.555800,
    lng: 126.626100,
    routes: ["70", "700-1", "701", "702"],
    dirDesc: "청라 GRT 환승"
  },
  {
    bstopId: "167000300",
    bstopNm: "가정역(루원시티)",
    arsId: "41300",
    lat: 37.527900,
    lng: 126.674900,
    routes: ["1", "2-1", "7", "13", "80", "904"],
    dirDesc: "루원시티 중심상업지구"
  },
  {
    bstopId: "167000400",
    bstopNm: "석남역",
    arsId: "41400",
    lat: 37.506500,
    lng: 126.676100,
    routes: ["1", "7", "13", "14-1", "103"],
    dirDesc: "서울 7호선 · 인천 2호선 환승"
  },

  // 9. 기타 대학교 캠퍼스
  {
    bstopId: "166000150",
    bstopNm: "경인교육대학교",
    arsId: "40150",
    lat: 37.538500,
    lng: 126.717500,
    routes: ["80", "88", "111", "584"],
    dirDesc: "경인교대입구역 방면"
  },
  {
    bstopId: "163000250",
    bstopNm: "청운대학교인천캠퍼스",
    arsId: "37250",
    lat: 37.468500,
    lng: 126.661200,
    routes: ["13", "21", "28", "62"],
    dirDesc: "도화역 방면"
  },
  {
    bstopId: "164000180",
    bstopNm: "가천대메디컬캠퍼스",
    arsId: "38180",
    lat: 37.433100,
    lng: 126.709500,
    routes: ["21", "27", "38", "534"],
    dirDesc: "신연수역 방면"
  },
  {
    bstopId: "161000300",
    bstopNm: "인천재능대학교",
    arsId: "36300",
    lat: 37.472100,
    lng: 126.649500,
    routes: ["15", "22", "28", "62"],
    dirDesc: "송림동 방면"
  }
];

// 실시간 도착 모의 시뮬레이터 (매 호출마다 현실적인 초 단위 시간 흐름 반영)
let mockOffsetSeconds = 0;
setInterval(() => {
  mockOffsetSeconds = (mockOffsetSeconds + 2) % 3600;
}, 2000);

export function getMockArrivalList(bstopId) {
  const station = MOCK_STATIONS.find(s => s.bstopId === bstopId) || MOCK_STATIONS[0];
  const routeList = station.routes || ["511", "8", "5"];

  // 해당 정류소의 노선들을 반영한 실시간 도착 버스 생성
  const mockBuses = routeList.map((routeNo, idx) => {
    const baseTime = (idx * 160 + 120) - (mockOffsetSeconds % 360);
    const estTime = Math.max(30, (baseTime + 720) % 720);
    const restStops = Math.max(1, Math.ceil(estTime / 75));

    let crowd = 3;
    if (idx === 0) crowd = 4;
    else if (idx === 1) crowd = 5;

    return {
      ROUTE_NO: routeNo,
      ROUTE_ID: `165000${String(idx).padStart(3, "0")}`,
      REST_STOP_COUNT: restStops,
      ARRIVALESTIMATETIME: estTime,
      LATEST_STOP_NAME: `${restStops}번째 전 정류소`,
      BUS_NUM_PLATE: `인천70바 ${1000 + (parseInt(routeNo.replace(/[^0-9]/g, "")) || 10) * 17 % 8999}`,
      CONGESTION: crowd,
      LOW_TP_CD: idx % 2 === 0 ? 1 : 0,
      DIR_DESC: station.dirDesc || "운행 방면"
    };
  }).sort((a, b) => a.ARRIVALESTIMATETIME - b.ARRIVALESTIMATETIME);

  return {
    station,
    timestamp: new Date().toISOString(),
    isMock: true,
    arrivals: mockBuses
  };
}
