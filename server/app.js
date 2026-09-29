import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { fetchBusArrivals, searchBusStations } from "./busService.js";
import { MOCK_STATIONS } from "./mockData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

let runtimeApiKey = process.env.DATA_GO_KR_API_KEY || "";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// 정류소 목록 / 검색
app.get("/api/stations", async (req, res) => {
  const query = req.query.q || "";
  const apiKey = req.query.apiKey || runtimeApiKey || process.env.DATA_GO_KR_API_KEY;
  try {
    const stations = await searchBusStations(query, apiKey);
    res.json({ success: true, stations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stations: MOCK_STATIONS });
  }
});

// 실시간 버스 도착 정보
app.get("/api/arrivals", async (req, res) => {
  const bstopId = req.query.bstopId || "163000155"; // 기본: 인하대후문
  const apiKey = req.query.apiKey || runtimeApiKey || process.env.DATA_GO_KR_API_KEY;

  try {
    const data = await fetchBusArrivals(bstopId, apiKey);
    res.json({
      success: true,
      hasApiKey: !!(apiKey && apiKey.trim() !== ""),
      ...data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API 상태 확인 및 키 업데이트
app.get("/api/status", (req, res) => {
  const key = runtimeApiKey || process.env.DATA_GO_KR_API_KEY || "";
  res.json({
    hasApiKey: !!(key && key.trim() !== ""),
    maskedKey: key ? `${key.slice(0, 6)}...${key.slice(-4)}` : null,
    serverTime: new Date().toISOString()
  });
});

app.post("/api/update-key", (req, res) => {
  const { apiKey } = req.body;
  if (typeof apiKey === "string") {
    runtimeApiKey = apiKey.trim();
    console.log(`[Server] API Key updated in memory: ${runtimeApiKey ? "Registered" : "Cleared"}`);
    return res.json({ success: true, hasApiKey: !!runtimeApiKey });
  }
  res.status(400).json({ success: false, message: "Invalid key format" });
});

// 제물포고등학교 하차 브리핑 (날씨, 시간표, 급식 메뉴)
app.get("/api/campus-briefing", (req, res) => {
  const today = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[today.getDay()];

  res.json({
    success: true,
    schoolName: "제물포고등학교",
    date: `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")} (${dayName})`,
    weather: {
      temp: "18°C",
      condition: "맑음 / 쾌적",
      icon: "☀️",
      pop: "10%",
      dust: "좋음 (15㎍/㎥)",
      umbrellaNotice: "자유공원 언덕길 도보 3분! 우산 불필요"
    },
    meal: {
      lunch: "🍱 오늘의 점심: 치킨마요덮밥, 미소장국, 떡볶이, 깍두기, 미니츄러스",
      cal: "740 Kcal"
    },
    defaultSchedules: [
      { id: 1, time: "08:40 - 09:30 (1교시)", title: "문학", room: "본관 2학년 3반", professor: "이선생님", badge: "국어" },
      { id: 2, time: "09:40 - 10:30 (2교시)", title: "수학 I", room: "수학전용실 201호", professor: "김선생님", badge: "수학" },
      { id: 3, time: "10:40 - 11:30 (3교시)", title: "영어 회화", room: "어학실 B", professor: "박선생님", badge: "영어" },
      { id: 4, time: "11:40 - 12:30 (4교시)", title: "물리학 I", room: "과학실험실", professor: "최선생님", badge: "탐구" },
      { id: 5, time: "13:30 - 14:20 (5교시)", title: "한국사", room: "본관 2학년 3반", professor: "정선생님", badge: "사회" },
      { id: 6, time: "14:30 - 15:20 (6교시)", title: "체육 (농구)", room: "운동장 / 체육관", professor: "강선생님", badge: "체육" },
      { id: 7, time: "15:30 - 16:20 (7교시)", title: "동아리 활동", room: "컴퓨터실", professor: "담당교사", badge: "창체" }
    ],
    notices: [
      "📌 제물포고 2학기 중간고사 D-12 (자습실 22:00까지 개방)",
      "🍱 점심 급식: 4교시 종료 후 12:30부터 3층 급식실 이용",
      "👟 6교시 체육 수업 시 실내 체육관 운동화 필수 착용"
    ]
  });
});
