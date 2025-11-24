// ========== 倉庫資訊 ==========
var wid = localStorage.getItem("currentWarehouse") || "A";
var nameMap = { A: "倉庫 A", B: "倉庫 B", C: "倉庫 C" };

// 顯示倉庫名稱
var titleEl = document.getElementById("warehouseName");
if (titleEl) titleEl.textContent = nameMap[wid] || ("倉庫 " + wid);

// 嘗試讀取儲存資料
function readSaved(key) {
    try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

var saved = readSaved("currentData") || readSaved("data_" + wid);
var temp = (saved && typeof saved.temp === "number") ? saved.temp : (22 + Math.random() * 3);
var hum = (saved && typeof saved.hum === "number") ? saved.hum : (58 + Math.random() * 4);

var realtime = document.getElementById("realtime");
var events = document.getElementById("events");

// 預設的事件紀錄（2 個溫度異常、1 個濕度異常）
var presetEvents = [
    { time: "08:47:33", level: "警告", type: "濕度", text: "濕度 45.0% 低於下限 55%" },
    { time: "08:58:10", level: "警告", type: "溫度", text: "溫度 25.8°C 接近上限 26°C" },
    { time: "09:05:21", level: "危險", type: "溫度", text: "溫度 28.9°C 超過上限 26°C" }
];

// 建立事件項目
function addEvent(level, text, type, timeLabel) {
    if (!events) return;

    var li = document.createElement("li");
    var tone = (level === "危險") ? "is-danger" : (level === "警告" ? "is-warn" : "is-ok");
    li.className = "event-item " + tone;

    var header = document.createElement("div");
    header.className = "event-header";

    var time = document.createElement("span");
    time.className = "event-time";
    time.textContent = timeLabel || new Date().toLocaleTimeString("zh-TW", { hour12: false });
    header.appendChild(time);

    var levelBadge = document.createElement("span");
    levelBadge.className = "event-badge level";
    levelBadge.textContent = level;
    header.appendChild(levelBadge);

    var typeBadge = document.createElement("span");
    typeBadge.className = "event-badge type";
    typeBadge.textContent = type || "環境";
    header.appendChild(typeBadge);

    var desc = document.createElement("div");
    desc.className = "event-text";
    desc.textContent = text;

    li.appendChild(header);
    li.appendChild(desc);
    events.prepend(li);

    // 保持列表乾淨
    while (events.childNodes.length > 50) {
        events.removeChild(events.lastChild);
    }
}

// ========== 初始化圖表 ==========
var ctx = document.getElementById("chart");
var chart = null;
if (ctx && ctx.getContext) {
    chart = new Chart(ctx.getContext("2d"), {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "溫度", data: [], borderWidth: 2, tension: 0.25 },
                { label: "濕度", data: [], borderWidth: 2, tension: 0.25 }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "#94a3b8" } },
                y: { ticks: { color: "#94a3b8" } }
            }
        }
    });
}

// ========== 先展示預設事件 ==========
if (events) {
    events.innerHTML = "";
    presetEvents.forEach(function(ev) {
        addEvent(ev.level, ev.text, ev.type, ev.time);
    });
}

// ========== 模擬更新 ==========
function simulate() {
    temp += (Math.random() - 0.5) * 0.5;
    hum += (Math.random() - 0.5) * 1.0;

    var level = "正常";
    if (temp < 15 || temp > 25 || hum < 55 || hum > 65) level = "警告";
    if (temp < 12 || temp > 28 || hum < 45 || hum > 75) level = "危險";

    if (realtime) {
        realtime.innerHTML =
            "<p>目前溫度 <strong>" + temp.toFixed(1) + "°C</strong></p>" +
            "<p>目前濕度 <strong>" + hum.toFixed(1) + "%</strong></p>" +
            "<p>狀態：<strong>" + level + "</strong></p>";
    }

    if (level !== "正常") {
        addEvent(level, "溫度 " + temp.toFixed(1) + "°C 濕度 " + hum.toFixed(1) + "%", "即時");
    }

    // 同步儲存
    try {
        localStorage.setItem("data_" + wid, JSON.stringify({
            temp: temp,
            hum: hum,
            status: level
        }));
    } catch (e) {}

    // 更新圖表
    if (chart) {
        var label = new Date().toLocaleTimeString("zh-TW", { hour12: false });
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(temp);
        chart.data.datasets[1].data.push(hum);
        if (chart.data.labels.length > 120) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }
        chart.update();
    }
}

// 每 2 秒模擬更新一次
setInterval(simulate, 2000);
