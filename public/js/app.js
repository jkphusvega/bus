/**
 * Galaxy Transit Companion - Frontend Application Logic
 */

// 로컬 스토리지에서 저장된 설정 복원
const savedStation = localStorage.getItem("galaxy_bus_station");
const savedStationId = localStorage.getItem("galaxy_bus_station_id");
const savedTarget = localStorage.getItem("galaxy_bus_target_id");
const savedSchedules = localStorage.getItem("galaxy_bus_schedules");

const state = {
  currentMode: "wake",
  currentStationId: savedStationId || "163000155", // 인하대후문 (기본값)
  targetStationId: savedTarget || "164000301",     // 인천대학교자연과학대학 (목적지)
  currentStation: savedStation ? JSON.parse(savedStation) : {
    bstopId: "163000155",
    bstopNm: "인하대후문",
    arsId: "37155",
    dirDesc: "주안역 방면"
  },
  schedules: savedSchedules ? JSON.parse(savedSchedules) : null,
  arrivals: [],
  heroBus: null,
  soundEnabled: localStorage.getItem("galaxy_bus_sound") !== "false",
  timerInterval: null,
  countdownInterval: null,
  heroSecondsRemaining: 165,
  heroTotalSeconds: 240,
  wakeLock: null,
  hasApiKey: false
};

// ==========================================
// 2. 사운드 신시사이저 (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // 상쾌한 아침 기상 차임
  playMorningChime() {
    if (!state.soundEnabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.45);
    });
  }

  // 하차 알림 차임
  playArrivalChime() {
    if (!state.soundEnabled) return;
    this.init();
    const notes = [783.99, 880.00, 1046.50]; // G5, A5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.15);
      osc.stop(this.ctx.currentTime + idx * 0.15 + 0.55);
    });
  }
}

const sfx = new SoundFX();

// ==========================================
// 3. UI 유틸리티 (진동, 토스트, WakeLock)
// ==========================================
function vibrateDevice(pattern = [100, 50, 150]) {
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.log("Vibration not allowed", e);
    }
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast-msg");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// 화면 꺼짐 방지 (Wake Lock API)
async function requestWakeLock() {
  if ("wakeLock" in navigator && !state.wakeLock) {
    try {
      state.wakeLock = await navigator.wakeLock.request("screen");
      console.log("Screen Wake Lock active");
      state.wakeLock.addEventListener("release", () => {
        state.wakeLock = null;
      });
    } catch (err) {
      console.log("WakeLock error:", err);
    }
  }
}

// 상단 디지털 시계 업데이트
function updateLiveClock() {
  const clockEl = document.getElementById("status-clock");
  if (!clockEl) return;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  clockEl.textContent = `${hours}:${mins}`;
}
setInterval(updateLiveClock, 1000);
updateLiveClock();

// ==========================================
// 4. 모드 전환 & 딥링크 라우팅
// ==========================================
function setTabMode(mode, triggerFromDeepLink = false) {
  state.currentMode = mode;

  // 탭 버튼 active 클래스 갱신
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === mode);
  });

  // 섹션 뷰 active 클래스 갱신
  document.querySelectorAll(".view-section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === `view-${mode}`);
  });

  // 모드별 진입 액션
  if (mode === "wake") {
    requestWakeLock();
    if (triggerFromDeepLink) {
      sfx.playMorningChime();
      vibrateDevice([120, 80, 200]);
      showToast("⏰ 알람 해제 감지! 오늘의 버스 도착 시간입니다.");
    }
    loadBusArrivals();
    startAutoRefresh();
  } else if (mode === "transit") {
    stopAutoRefresh();
    showToast("🚌 등교 버스 탑승 모드로 전환되었습니다.");
  } else if (mode === "arrival") {
    stopAutoRefresh();
    sfx.playArrivalChime();
    vibrateDevice([200, 100, 200, 100, 300]);
    loadCampusBriefing();
    showToast("🎓 학교 도착! 오늘의 강의 일정을 브리핑합니다.");
  } else if (mode === "routine") {
    stopAutoRefresh();
    checkApiKeyStatus();
  }

  // URL 쿼리 파라미터 업데이트 (히스토리 유지)
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("mode", mode);
  window.history.replaceState({}, "", currentUrl.toString());

  // 루틴 복사창 URL 업데이트
  const hostBase = window.location.origin;
  const copyWake = document.getElementById("copy-url-wake");
  const copyArrival = document.getElementById("copy-url-arrival");
  if (copyWake) copyWake.value = `${hostBase}/?mode=wake`;
  if (copyArrival) copyArrival.value = `${hostBase}/?mode=arrival`;
}

// ==========================================
// 5. 버스 도착정보 로드 및 카운트다운
// ==========================================
async function loadBusArrivals() {
  const syncInd = document.getElementById("live-sync-indicator");
  if (syncInd) syncInd.textContent = "🔄 갱신 중...";

  try {
    const res = await fetch(`/api/arrivals?bstopId=${state.currentStationId}`);
    const data = await res.json();

    if (data.success && data.arrivals) {
      state.arrivals = data.arrivals;
      if (data.station) {
        state.currentStation = data.station;
        updateStationCard(data.station);
      }
      renderArrivals(data.arrivals);

      const lastClock = document.getElementById("last-updated-clock");
      if (lastClock) {
        const now = new Date();
        lastClock.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} 갱신`;
      }
    }
  } catch (err) {
    console.error("Arrival fetch error:", err);
    showToast("도착 정보 갱신 실패 (오프라인 모드 유지)");
  } finally {
    if (syncInd) syncInd.textContent = "🟢 15초 자동갱신";
  }
}

function updateStationCard(station) {
  const nameEl = document.getElementById("current-station-name");
  const arsEl = document.getElementById("current-station-ars");
  const dirEl = document.getElementById("current-station-dir");

  if (nameEl) nameEl.textContent = station.bstopNm || "정류소";
  if (arsEl) arsEl.textContent = station.arsId ? `ARS ${station.arsId}` : station.bstopId;
  if (dirEl) dirEl.textContent = `${station.dirDesc || "운행 방면"} · 인천광역시`;
}

function renderArrivals(arrivals) {
  if (!arrivals || arrivals.length === 0) {
    renderEmptyArrivals();
    return;
  }

  // 1순위: 가장 빨리 도착하는 버스 (Hero)
  const hero = arrivals[0];
  state.heroBus = hero;
  state.heroSecondsRemaining = hero.ARRIVALESTIMATETIME || 180;
  state.heroTotalSeconds = Math.max(state.heroSecondsRemaining, 300);

  // Hero 카드 업데이트
  const heroNo = document.getElementById("hero-bus-no");
  const heroTime = document.getElementById("hero-time-text");
  const heroStops = document.getElementById("hero-stops-text");
  const heroPlate = document.getElementById("hero-bus-plate");
  const heroLow = document.getElementById("hero-bus-lowfloor");
  const heroCrowd = document.getElementById("hero-bus-crowd");
  const heroStatus = document.getElementById("hero-bus-status");

  if (heroNo) heroNo.textContent = `${hero.ROUTE_NO}번`;
  if (heroPlate) heroPlate.textContent = hero.BUS_NUM_PLATE || "차량번호 조회 중";
  if (heroLow) heroLow.textContent = hero.LOW_TP_CD ? "♿ 저상버스" : "일반버스";
  
  // 혼잡도
  let crowdText = "👥 보통 (여유)";
  if (hero.CONGESTION === 5) crowdText = "⚠️ 혼잡";
  else if (hero.CONGESTION === 3) crowdText = "✨ 매우 여유";
  if (heroCrowd) heroCrowd.textContent = crowdText;

  updateHeroCountdownDisplay();

  // 기타 도착 버스 리스트 렌더링
  const otherBuses = arrivals.slice(1);
  const countLabel = document.getElementById("bus-count-label");
  if (countLabel) countLabel.textContent = `${arrivals.length}개 노선 운행 중`;

  const listContainer = document.getElementById("other-buses-list");
  if (!listContainer) return;

  if (otherBuses.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">추가 도착 예정 버스가 없습니다.</div>`;
    return;
  }

  listContainer.innerHTML = otherBuses.map((bus) => {
    const mins = Math.floor(bus.ARRIVALESTIMATETIME / 60);
    const secs = bus.ARRIVALESTIMATETIME % 60;
    const timeDisplay = mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;

    return `
      <div class="bus-card-item" data-route="${bus.ROUTE_NO}">
        <div class="item-left">
          <div class="bus-badge-sm">${bus.ROUTE_NO}</div>
          <div class="item-info-route">
            <span class="item-route-title">${bus.DIR_DESC || bus.ROUTE_NO + "번"}</span>
            <span class="item-route-pos">${bus.LATEST_STOP_NAME} 위치</span>
          </div>
        </div>
        <div class="item-right">
          <div class="item-time">${timeDisplay}</div>
          <div class="item-stops">${bus.REST_STOP_COUNT}번째 전 정류소</div>
        </div>
      </div>
    `;
  }).join("");

  // 리스트 클릭 시 해당 버스를 Hero로 교체
  document.querySelectorAll(".bus-card-item").forEach((card, idx) => {
    card.addEventListener("click", () => {
      const selected = otherBuses[idx];
      // 순서 swap
      const newArrivals = [selected, hero, ...otherBuses.filter((_, i) => i !== idx)];
      renderArrivals(newArrivals);
      vibrateDevice([50]);
      showToast(`${selected.ROUTE_NO}번 버스를 메인 추적으로 변경했습니다.`);
    });
  });

  // 카운트다운 타이머 시작
  startHeroTimer();
}

function renderEmptyArrivals() {
  const heroTime = document.getElementById("hero-time-text");
  const heroStops = document.getElementById("hero-stops-text");
  if (heroTime) heroTime.textContent = "도착 정보 없음";
  if (heroStops) heroStops.textContent = "현재 운행 중인 차량이 없습니다";
  const listContainer = document.getElementById("other-buses-list");
  if (listContainer) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">
        운행 대기 중이거나 첫차 출발 전입니다. 새로고침을 눌러보세요.
      </div>
    `;
  }
}

function startHeroTimer() {
  if (state.countdownInterval) clearInterval(state.countdownInterval);

  state.countdownInterval = setInterval(() => {
    if (state.heroSecondsRemaining > 0) {
      state.heroSecondsRemaining--;
      updateHeroCountdownDisplay();
    } else {
      // 0초 도달 시 자동 리로드
      clearInterval(state.countdownInterval);
      loadBusArrivals();
    }
  }, 1000);
}

function updateHeroCountdownDisplay() {
  const heroTime = document.getElementById("hero-time-text");
  const heroStops = document.getElementById("hero-stops-text");
  const circleBar = document.getElementById("hero-circle-bar");
  const circlePct = document.getElementById("hero-circle-pct");

  const totalSec = state.heroSecondsRemaining;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;

  if (heroTime) {
    heroTime.textContent = mins > 0 ? `${mins}분 ${String(secs).padStart(2, "0")}초` : `${secs}초`;
  }

  if (heroStops && state.heroBus) {
    heroStops.textContent = `${state.heroBus.REST_STOP_COUNT}번째 전 정류장 (${state.heroBus.LATEST_STOP_NAME})`;
  }

  // SVG 원형 프로그레스 계산 (둘레: 2 * PI * 38 ≈ 238.76)
  const circumference = 2 * Math.PI * 38;
  const ratio = Math.max(0, Math.min(1, totalSec / state.heroTotalSeconds));
  const offset = circumference * (1 - ratio);

  if (circleBar) {
    circleBar.style.strokeDasharray = `${circumference}`;
    circleBar.style.strokeDashoffset = `${offset}`;
    if (totalSec < 60) {
      circleBar.style.stroke = "var(--accent-red)";
    } else if (totalSec < 180) {
      circleBar.style.stroke = "var(--accent-yellow)";
    } else {
      circleBar.style.stroke = "var(--accent-green)";
    }
  }

  if (circlePct) {
    circlePct.textContent = totalSec <= 30 ? "곧도착" : `${Math.round(ratio * 100)}%`;
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  state.timerInterval = setInterval(() => {
    loadBusArrivals();
  }, 15000); // 15초마다 최신 BIS 동기화
}

function stopAutoRefresh() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  if (state.countdownInterval) {
    clearInterval(state.countdownInterval);
    state.countdownInterval = null;
  }
}

// ==========================================
// 6. 캠퍼스 브리핑 및 일정표 로드
// ==========================================
async function loadCampusBriefing() {
  const listWrap = document.getElementById("schedule-list-wrap");
  const dateEl = document.getElementById("arrival-today-date");

  try {
    const res = await fetch("/api/campus-briefing");
    const data = await res.json();

    if (data.success) {
      if (dateEl) dateEl.textContent = `${data.date} · 오늘의 캠퍼스 브리핑`;

      // 사용자가 직접 저장한 시간표가 있으면 우선 사용
      const activeSchedules = state.schedules && state.schedules.length > 0 
        ? state.schedules 
        : data.defaultSchedules;

      if (!state.schedules) {
        state.schedules = data.defaultSchedules;
      }

      if (listWrap && activeSchedules) {
        listWrap.innerHTML = activeSchedules.map((item, idx) => `
          <div class="schedule-card ${idx === 0 ? "active-class" : ""}">
            <div class="schedule-time-row">
              <span class="schedule-time">⏰ ${item.time}</span>
              <span class="schedule-badge">${item.badge || "수업"}</span>
            </div>
            <div class="schedule-title">${item.title}</div>
            <div class="schedule-room">📍 ${item.room || "강의실"} · ${item.professor || ""}</div>
          </div>
        `).join("");
      }
    }
  } catch (err) {
    console.error("Campus briefing load error:", err);
  }
}

// 시간표 편집 모달 오픈 및 렌더링
function openScheduleModal() {
  const modal = document.getElementById("modal-schedule");
  const listEl = document.getElementById("schedule-edit-list");
  if (!modal || !listEl) return;

  const currentList = state.schedules || [];
  renderScheduleEditRows(currentList);
  modal.showModal();
}

function renderScheduleEditRows(schedules) {
  const listEl = document.getElementById("schedule-edit-list");
  if (!listEl) return;

  listEl.innerHTML = schedules.map((item, idx) => `
    <div class="schedule-edit-row" data-idx="${idx}" style="background:#182236; border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; font-weight:700; color:#00F5FF;">수업 #${idx + 1}</span>
        <button type="button" class="btn-delete-row" data-idx="${idx}" style="background:none; border:none; color:#FF5C8A; font-size:12px; cursor:pointer; font-weight:700;">삭제</button>
      </div>
      <input type="text" class="copy-input edit-title" placeholder="과목명 (예: 컴퓨터구조)" value="${item.title || ""}" style="font-size:13px; padding:6px 10px;">
      <div style="display:flex; gap:6px;">
        <input type="text" class="copy-input edit-time" placeholder="시간 (예: 10:00 - 11:15)" value="${item.time || ""}" style="flex:1; font-size:12px; padding:6px 8px;">
        <input type="text" class="copy-input edit-room" placeholder="강의실 (예: 5남 302호)" value="${item.room || ""}" style="flex:1; font-size:12px; padding:6px 8px;">
      </div>
    </div>
  `).join("");

  listEl.querySelectorAll(".btn-delete-row").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      schedules.splice(idx, 1);
      renderScheduleEditRows(schedules);
    });
  });
}

function saveEditedSchedule() {
  const listEl = document.getElementById("schedule-edit-list");
  if (!listEl) return;

  const rows = listEl.querySelectorAll(".schedule-edit-row");
  const newSchedules = [];

  rows.forEach((row, idx) => {
    const title = row.querySelector(".edit-title")?.value.trim();
    const time = row.querySelector(".edit-time")?.value.trim();
    const room = row.querySelector(".edit-room")?.value.trim();

    if (title) {
      newSchedules.push({
        id: idx + 1,
        title,
        time: time || "시간 미정",
        room: room || "강의실 미정",
        professor: "",
        badge: "수업"
      });
    }
  });

  state.schedules = newSchedules;
  localStorage.setItem("galaxy_bus_schedules", JSON.stringify(newSchedules));
  document.getElementById("modal-schedule").close();
  loadCampusBriefing();
  showToast("내 시간표가 스마트폰에 영구 저장되었습니다!");
}

// ==========================================
// 7. API 키 검사 및 저장
// ==========================================
async function checkApiKeyStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    const statusMsg = document.getElementById("key-status-msg");
    const input = document.getElementById("input-api-key");
    if (statusMsg) {
      if (data.hasApiKey) {
        statusMsg.textContent = `✅ 등록 완료 (${data.maskedKey}) - 실시간 인천 BIS 직접 통신 활성화`;
        statusMsg.style.color = "var(--accent-green)";
      } else {
        statusMsg.textContent = "ℹ️ 인증키 미등록 (스마트 시뮬레이션 모드로 정상 작동 중)";
        statusMsg.style.color = "var(--text-secondary)";
      }
    }
  } catch (e) {}
}

async function saveApiKey() {
  const input = document.getElementById("input-api-key");
  if (!input) return;
  const key = input.value.trim();

  try {
    const res = await fetch("/api/update-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: key })
    });
    const data = await res.json();
    if (data.success) {
      showToast("공공데이터 API 키가 저장되었습니다.");
      checkApiKeyStatus();
      loadBusArrivals();
    }
  } catch (err) {
    showToast("키 저장 중 오류 발생");
  }
}

// ==========================================
// 8. 정류소 선택 모달 로직
// ==========================================
function openStationModal() {
  const modal = document.getElementById("modal-station");
  if (modal) {
    modal.showModal();
    searchStations("");
  }
}

async function searchStations(q) {
  const resContainer = document.getElementById("modal-station-results");
  if (!resContainer) return;

  try {
    const res = await fetch(`/api/stations?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.success && data.stations) {
      if (data.stations.length === 0) {
        resContainer.innerHTML = `<div style="text-align:center; padding:24px; color:#94A3B8; font-size:13px;">일치하는 정류소가 없습니다.</div>`;
        return;
      }

      resContainer.innerHTML = data.stations.map((st) => `
        <div class="station-result-item" data-id="${st.bstopId}" style="display:flex; justify-content:space-between; align-items:center; background:#182236; border:1px solid rgba(255,255,255,0.18); border-radius:12px; padding:14px 16px; margin-bottom:8px; cursor:pointer; transition:all 0.2s ease;">
          <div>
            <div style="font-size:15px; font-weight:800; color:#FFFFFF;">${st.bstopNm}</div>
            <div style="font-size:11px; color:#00F5FF; margin-top:3px; font-weight:600;">ARS ${st.arsId || st.bstopId} · <span style="color:#CBD5E1;">${st.dirDesc || (st.routes && st.routes.length ? st.routes.slice(0, 5).join(', ') + '번 등' : '')}</span></div>
          </div>
          <button class="btn-secondary" style="font-size:11px; padding:6px 12px; background:rgba(0,245,255,0.12); color:#00F5FF !important; border:1px solid rgba(0,245,255,0.3); font-weight:700;">선택</button>
        </div>
      `).join("");

      resContainer.querySelectorAll(".station-result-item").forEach((card) => {
        card.addEventListener("click", () => {
          const id = card.dataset.id;
          state.currentStationId = id;
          const found = data.stations.find(s => s.bstopId === id);
          if (found) {
            state.currentStation = found;
            localStorage.setItem("galaxy_bus_station_id", id);
            localStorage.setItem("galaxy_bus_station", JSON.stringify(found));
          }
          document.getElementById("modal-station").close();
          loadBusArrivals();
          showToast(`정류장이 [${found.bstopNm}]로 변경 및 영구 저장되었습니다.`);
        });
      });
    }
  } catch (e) {}
}

// ==========================================
// 9. 초기화 및 이벤트 리스너 등록
// ==========================================
function initApp() {
  // 1. Service Worker 등록
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }

  // 2. URL 파라미터 확인 (갤럭시 루틴 딥링크 파싱)
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get("mode") || "wake";
  const hasTrigger = urlParams.has("mode");
  setTabMode(modeParam, hasTrigger);

  // 3. 탭 네비게이션 이벤트
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTabMode(btn.dataset.tab);
    });
  });

  // 4. 헤더 액션
  const btnRefresh = document.getElementById("btn-refresh");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      btnRefresh.style.transform = "rotate(360deg)";
      setTimeout(() => (btnRefresh.style.transform = "none"), 400);
      loadBusArrivals();
      vibrateDevice([40]);
      showToast("실시간 도착 정보를 새로고침했습니다.");
    });
  }

  const btnSettings = document.getElementById("btn-settings-open");
  if (btnSettings) {
    btnSettings.addEventListener("click", () => {
      setTabMode("routine");
    });
  }

  // 5. 정류소 모달
  const btnChangeStation = document.getElementById("btn-change-station");
  if (btnChangeStation) btnChangeStation.addEventListener("click", openStationModal);

  const btnModalClose = document.getElementById("btn-modal-close");
  if (btnModalClose) {
    btnModalClose.addEventListener("click", () => {
      document.getElementById("modal-station").close();
    });
  }

  const searchInput = document.getElementById("modal-station-search");
  if (searchInput) {
    let debounce;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => searchStations(e.target.value), 300);
    });
  }

  // 6. 탑승 버튼 (Hero -> 탑승 모드 전환)
  const btnBoardHero = document.getElementById("btn-board-hero");
  if (btnBoardHero) {
    btnBoardHero.addEventListener("click", () => {
      setTabMode("transit");
    });
  }

  // 7. 하차 시뮬레이션
  const btnSimulateArrive = document.getElementById("btn-simulate-arrive");
  if (btnSimulateArrive) {
    btnSimulateArrive.addEventListener("click", () => {
      setTabMode("arrival");
    });
  }

  // 8. 진동 테스트
  const btnTestVibrate = document.getElementById("btn-test-vibrate");
  if (btnTestVibrate) {
    btnTestVibrate.addEventListener("click", () => {
      vibrateDevice([200, 100, 200]);
      showToast("📳 하차 진동 피드백 테스트 완료");
    });
  }

  // 9. 루틴 복사 버튼
  document.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        input.select();
        navigator.clipboard.writeText(input.value);
        showToast("갤럭시 루틴 연동 URL이 클립보드에 복사되었습니다!");
      }
    });
  });

  // 10. API 키 저장 버튼
  const btnSaveKey = document.getElementById("btn-save-key");
  if (btnSaveKey) btnSaveKey.addEventListener("click", saveApiKey);

  // 11. 사운드 토글
  const btnSound = document.getElementById("btn-sound-toggle");
  if (btnSound) {
    btnSound.addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem("galaxy_bus_sound", String(state.soundEnabled));
      btnSound.textContent = state.soundEnabled ? "🔊 소리 켜짐" : "🔇 소리 꺼짐";
      showToast(state.soundEnabled ? "알림 사운드가 켜졌습니다." : "알림 사운드가 꺼졌습니다.");
    });
  }

  // 12. 알람 끄기 시뮬레이션 버튼
  const btnQuickAlarm = document.getElementById("btn-quick-alarm");
  if (btnQuickAlarm) {
    btnQuickAlarm.addEventListener("click", () => {
      setTabMode("wake", true);
    });
  }

  // 13. 웹 푸시 알림 발송 버튼
  const btnTriggerPush = document.getElementById("btn-trigger-push");
  if (btnTriggerPush) {
    btnTriggerPush.addEventListener("click", async () => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification("🎓 학교 도착 완료!", {
            body: "오늘의 시간표와 과제 마감 현황이 준비되었습니다.",
            icon: "/manifest.json"
          });
          showToast("푸시 알림을 발송했습니다.");
        } else {
          showToast("알림 권한이 필요합니다.");
        }
      } else {
        showToast("이 브라우저는 알림을 지원하지 않습니다.");
      }
    });
  }

  // 14. 시간표 편집 모달 이벤트
  const btnEditSchedule = document.getElementById("btn-edit-schedule");
  if (btnEditSchedule) {
    btnEditSchedule.addEventListener("click", openScheduleModal);
  }

  const btnCloseSchedule = document.getElementById("btn-modal-schedule-close");
  if (btnCloseSchedule) {
    btnCloseSchedule.addEventListener("click", () => {
      document.getElementById("modal-schedule").close();
    });
  }

  const btnSaveSchedule = document.getElementById("btn-save-schedule");
  if (btnSaveSchedule) {
    btnSaveSchedule.addEventListener("click", saveEditedSchedule);
  }

  const btnAddRow = document.getElementById("btn-add-schedule-row");
  if (btnAddRow) {
    btnAddRow.addEventListener("click", () => {
      const currentList = state.schedules || [];
      currentList.push({
        id: currentList.length + 1,
        title: "",
        time: "",
        room: "",
        badge: "수업"
      });
      renderScheduleEditRows(currentList);
    });
  }
}

// DOM 로드 완료 후 실행
document.addEventListener("DOMContentLoaded", initApp);
