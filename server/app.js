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

// 캠퍼스 브리핑 (날씨 및 학사/시간표)
app.get("/api/campus-briefing", (req, res) => {
  const today = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[today.getDay()];

  res.json({
    success: true,
    date: `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")} (${dayName})`,
    weather: {
      temp: "19°C",
      condition: "맑음 / 쾌적",
      icon: "☀️",
      pop: "10%",
      dust: "좋음 (18㎍/㎥)",
      umbrellaNotice: "우산이 필요 없는 맑은 날씨입니다."
    },
    defaultSchedules: [
      { id: 1, time: "09:30 - 10:45", title: "알고리즘 및 문제해결", room: "공학관 402호", professor: "김교수", badge: "전공필수" },
      { id: 2, time: "11:00 - 12:15", title: "모바일 클라우드 시스템", room: "IT융합관 205호", professor: "박교수", badge: "전공선택" },
      { id: 3, time: "13:30 - 15:00", title: "팀 프로젝트 멘토링", room: "학술정보관 스터디룸 B", professor: "이멘토", badge: "연구" }
    ],
    notices: [
      "📌 알고리즘 2차 과제 마감: 오늘 23:59까지 (LMS 제출)",
      "☕ 학생회관 카페 텀블러 할인 데이 (300원 할인)"
    ]
  });
});
