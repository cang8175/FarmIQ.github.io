// ========== 倉庫設定 ==========
var warehouses = [
    { id: "A", name: "水果倉庫" },
    { id: "B", name: "綜合倉庫" },
    { id: "C", name: "穀物倉庫" },
    { id: "D", name: "冷藏倉庫" }

];

// ========== 工具 ==========
function readSaved(key) {
    try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function save(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
}

// ========== 初始化畫面 ==========
var grid = document.getElementById("warehouseGrid");
warehouses.forEach(function(w) {
    grid.innerHTML +=
        '<section class="card" id="card-' + w.id + '">' +
        '  <h2>' + w.name + ' <span id="status-' + w.id + '" class="status-pill status-ok">模擬中</span></h2>' +
        '  <div class="metric">🌡️ 溫度：<span id="temp-' + w.id + '" class="value">--</span> °C</div>' +
        '  <div class="metric">💧 濕度：<span id="hum-' + w.id + '" class="value">--</span> %</div>' +
        '  <canvas id="chart-' + w.id + '"></canvas>' +
        '</section>';
});

// ========== 狀態物件 ==========
var state = {};
warehouses.forEach(function(w) {
    var saved = readSaved('data_' + w.id);
    var baseTemp = (saved && typeof saved.temp === 'number') ? saved.temp : (22 + Math.random() * 3);
    var baseHum = (saved && typeof saved.hum === 'number') ? saved.hum : (58 + Math.random() * 4);
    var baseStatus = (saved && saved.status) ? saved.status : 'ok';

    state[w.id] = {
        temp: baseTemp,
        hum: baseHum,
        chart: null,
        status: baseStatus
    };
});

// ========== 初始化圖表 ==========
warehouses.forEach(function(w) {
    var ctx = document.getElementById('chart-' + w.id).getContext('2d');
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
            scales: {
                x: { ticks: { color: '#94a3b8' } },
                y: { ticks: { color: '#94a3b8' } }
            }
        }
    });
});

// ========== 模擬感測器 ==========
function simulateData(wid) {
    var s = state[wid];
    s.temp += (Math.random() - 0.5) * 0.5;
    s.hum += (Math.random() - 0.5) * 1.0;
    return { temp: s.temp, hum: s.hum };
}

// ========== 更新畫面 ==========
function updateWarehouse(wid, temp, hum) {
    var t = document.getElementById('temp-' + wid);
    var h = document.getElementById('hum-' + wid);
    var st = document.getElementById('status-' + wid);
    var card = document.getElementById('card-' + wid);

    t.textContent = temp.toFixed(1);
    h.textContent = hum.toFixed(1);

    var status = 'ok';
    if (temp < 15 || temp > 25 || hum < 55 || hum > 65) status = 'warn';
    if (temp < 12 || temp > 28 || hum < 45 || hum > 75) status = 'bad';

    st.className = 'status-pill status-' + status;
    st.textContent = (status === 'ok') ? '正常' : (status === 'warn' ? '警告' : '危險');

    card.classList.remove('warn', 'bad');
    if (status === 'warn') card.classList.add('warn');
    if (status === 'bad') card.classList.add('bad');

    // 永續化當前數值（回首頁/重整仍保留）
    save('data_' + wid, { temp: temp, hum: hum, status: status });

    // 更新圖表
    var chart = state[wid].chart;
    var label = new Date().toLocaleTimeString('zh-TW', { hour12: false });
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

// ========== 2 秒一次模擬 ==========
setInterval(function() {
    warehouses.forEach(function(w) {
        var d = simulateData(w.id);
        updateWarehouse(w.id, d.temp, d.hum);
    });
}, 2000);

// ========== 點擊跳詳情（附帶數據） ==========
warehouses.forEach(function(w) {
    var card = document.getElementById('card-' + w.id);
    card.addEventListener('click', function() {

        // 存 ID（用來讀取溫濕度資料）
        localStorage.setItem('currentWarehouseId', w.id);

        // 🔥 多存一個「顯示名稱」
        localStorage.setItem('currentWarehouseName', w.name);

        // 如果你有存 currentData，就照舊：
        localStorage.setItem('currentData', JSON.stringify({
            temp: state[w.id].temp,
            hum: state[w.id].hum,
            status: state[w.id].status
        }));

        window.location.href = 'detail.html';
    });
});
