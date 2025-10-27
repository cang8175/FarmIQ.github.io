const warehouses = [
    { id: "A", name: "倉庫 A" },
    { id: "B", name: "倉庫 B" },
    { id: "C", name: "倉庫 C" }
];

const grid = document.getElementById("warehouseGrid");

warehouses.forEach(w => {
    grid.innerHTML += `
  <section class="card" id="card-${w.id}">
    <h2>${w.name} <span id="status-${w.id}" class="status-pill status-ok">模擬中</span></h2>
    <div class="metric">🌡️ <span id="temp-${w.id}" class="value">--</span> °C</div>
    <div class="metric">💧 <span id="hum-${w.id}" class="value">--</span> %</div>
    <canvas id="chart-${w.id}"></canvas>
  </section>`;
});

const state = {};
warehouses.forEach(w => {
    state[w.id] = {
        temp: 22 + Math.random() * 3,
        hum: 58 + Math.random() * 4,
        chart: null,
        status: "ok"
    };
});

// Chart.js 初始化
warehouses.forEach(w => {
    const ctx = document.getElementById(`chart-${w.id}`).getContext("2d");
    state[w.id].chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: '溫度', data: [], borderWidth: 2, tension: 0.25 },
                { label: '濕度', data: [], borderWidth: 2, tension: 0.25 }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: { legend: { display: false } },
            scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } }
        }
    });
});

// 模擬資料
function simulateData(wid) {
    let s = state[wid];
    s.temp += (Math.random() - 0.5) * 0.5;
    s.hum += (Math.random() - 0.5) * 1.0;
    return { temp: s.temp, hum: s.hum };
}

// 更新顯示
function updateWarehouse(wid, temp, hum) {
    const t = document.getElementById(`temp-${wid}`);
    const h = document.getElementById(`hum-${wid}`);
    const st = document.getElementById(`status-${wid}`);
    const card = document.getElementById(`card-${wid}`);

    t.textContent = temp.toFixed(1);
    h.textContent = hum.toFixed(1);

    let status = "ok";
    if (temp < 15 || temp > 25 || hum < 55 || hum > 65) status = "warn";
    if (temp < 12 || temp > 28 || hum < 45 || hum > 75) status = "bad";

    st.className = "status-pill status-" + status;
    st.textContent = status === "ok" ? "正常" : (status === "warn" ? "警告" : "危險");

    card.classList.remove("warn", "bad");
    if (status === "warn") card.classList.add("warn");
    if (status === "bad") card.classList.add("bad");

    const chart = state[wid].chart;
    const label = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(temp);
    chart.data.datasets[1].data.push(hum);
    if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
    }
    chart.update();
}

// 模擬每2秒更新
setInterval(() => {
    warehouses.forEach(w => {
        const { temp, hum } = simulateData(w.id);
        updateWarehouse(w.id, temp, hum);
    });
}, 2000);

// 點擊卡片 → 詳細頁
warehouses.forEach(w => {
    const card = document.getElementById(`card-${w.id}`);
    card.addEventListener('click', () => {
        localStorage.setItem('currentWarehouse', w.id);
        window.location.href = 'detail.html';
    });
});