// 인천 주요 정류소 및 실시간 버스 도착 정보 Mock 데이터
export const MOCK_STATIONS = [
  {
    bstopId: "163000155",
    bstopNm: "인하대후문",
    arsId: "37155",
    lat: 37.453316,
    lng: 126.657682,
    routes: ["511", "8", "5", "516", "9"]
  },
  {
    bstopId: "163000142",
    bstopNm: "인하대역1번출구",
    arsId: "37142",
    lat: 37.447820,
    lng: 126.653490,
    routes: ["511", "9200", "8", "65-1"]
  },
  {
    bstopId: "163000521",
    bstopNm: "주안역환승정류장",
    arsId: "37521",
    lat: 37.464730,
    lng: 126.680620,
    routes: ["511", "5", "65-1", "8"]
  },
  {
    bstopId: "164000301",
    bstopNm: "인천대학교자연과학대학",
    arsId: "38301",
    lat: 37.375210,
    lng: 126.632120,
    routes: ["8", "6-1", "908"]
  },
  {
    bstopId: "164000215",
    bstopNm: "인천대입구역",
    arsId: "38215",
    lat: 37.385540,
    lng: 126.642190,
    routes: ["8", "6-1", "909", "순환41"]
  },
  {
    bstopId: "164000880",
    bstopNm: "연세대송도캠퍼스입구",
    arsId: "38880",
    lat: 37.381400,
    lng: 126.668100,
    routes: ["9201", "순환41", "M6724"]
  }
];

// 실시간 도착 모의 시뮬레이터 (매 호출마다 현실적인 초 단위 시간 흐름 반영)
let mockOffsetSeconds = 0;
setInterval(() => {
  mockOffsetSeconds = (mockOffsetSeconds + 2) % 3600;
}, 2000);

export function getMockArrivalList(bstopId) {
  const station = MOCK_STATIONS.find(s => s.bstopId === bstopId) || MOCK_STATIONS[0];
  
  // 가상의 실시간 버스 목록 생성
  const mockBuses = [
    {
      ROUTE_NO: "511",
      ROUTE_ID: "165000112",
      REST_STOP_COUNT: Math.max(1, 4 - Math.floor((mockOffsetSeconds % 300) / 75)),
      ARRIVALESTIMATETIME: Math.max(25, 240 - (mockOffsetSeconds % 240)),
      LATEST_STOP_NAME: "인하대병원",
      BUS_NUM_PLATE: "인천70바 1284",
      CONGESTION: 4, // 3:여유, 4:보통, 5:혼잡
      LOW_TP_CD: 1, // 저상버스
      DIR_DESC: "주안역 방면"
    },
    {
      ROUTE_NO: "511",
      ROUTE_ID: "165000112",
      REST_STOP_COUNT: 8,
      ARRIVALESTIMATETIME: 580 - (mockOffsetSeconds % 300),
      LATEST_STOP_NAME: "용현시장",
      BUS_NUM_PLATE: "인천70바 1290",
      CONGESTION: 3,
      LOW_TP_CD: 0,
      DIR_DESC: "주안역 방면"
    },
    {
      ROUTE_NO: "8",
      ROUTE_ID: "165000008",
      REST_STOP_COUNT: Math.max(1, 2 - Math.floor((mockOffsetSeconds % 180) / 90)),
      ARRIVALESTIMATETIME: Math.max(30, 160 - (mockOffsetSeconds % 160)),
      LATEST_STOP_NAME: "정석항공고",
      BUS_NUM_PLATE: "인천70사 5512",
      CONGESTION: 5, // 혼잡
      LOW_TP_CD: 1,
      DIR_DESC: "송도공영차고지 방면"
    },
    {
      ROUTE_NO: "5",
      ROUTE_ID: "165000005",
      REST_STOP_COUNT: 6,
      ARRIVALESTIMATETIME: 420 - (mockOffsetSeconds % 200),
      LATEST_STOP_NAME: "학익사거리",
      BUS_NUM_PLATE: "인천70바 3421",
      CONGESTION: 3,
      LOW_TP_CD: 1,
      DIR_DESC: "가좌동 방면"
    },
    {
      ROUTE_NO: "9200",
      ROUTE_ID: "165000920",
      REST_STOP_COUNT: 11,
      ARRIVALESTIMATETIME: 750,
      LATEST_STOP_NAME: "송도풍림아이원",
      BUS_NUM_PLATE: "인천74사 8819",
      CONGESTION: 4,
      LOW_TP_CD: 0,
      DIR_DESC: "강남역 방면"
    }
  ];

  return {
    station,
    timestamp: new Date().toISOString(),
    isMock: true,
    arrivals: mockBuses
  };
}
