const wid = localStorage.getItem('currentWarehouse') || "A";
const nameMap = { A: "倉庫 A", B: "倉庫 B", C: "倉庫 C" };
document.getElementById('warehouseName').textContent = nameMap[wid] || `倉庫 ${wid}`;

const realtime = document.getElementById('realtime');
const events = document.getElementById('events');

let temp = 22 + Math.random() * 3;
let hum = 58 + Math.random() * 4;

const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: '溫度', data: [], borderWidth: 2, tension: 0.25 },
            { label: '濕度', data: [], borderWidth: 2, tension: 0.25 }
        ]
    },
    options: { responsive: true, animation: false }
});

function addEvent(level, text) {
    const li = document.createElement('li');
    li.textContent = `[${new Date().toLocaleTimeString('zh-TW',{hour12:false})}] ${level} - ${text}`;
    events.prepend(li);
}

function simulate() {
    temp += (Math.random() - 0.5) * 0.5;
    hum += (Math.random() - 0.5) * 1.0;

    let level = "正常";
    if (temp < 15 || temp > 25 || hum < 55 || hum > 65) level = "⚠️ 警告";
    if (temp < 12 || temp > 28 || hum < 45 || hum > 75) level = "🚨 危險";

    realtime.innerHTML = `
    <p>🌡️ 溫度：<strong>${temp.toFixed(1)}°C</strong></p>
    <p>💧 濕度：<strong>${hum.toFixed(1)}%</strong></p>
    <p>狀態：<strong>${level}</strong></p>
  `;

    if (level !== "正常") addEvent(level, `溫度 ${temp.toFixed(1)}°C 濕度 ${hum.toFixed(1)}%`);

    const label = new Date().toLocaleTimeString('zh-TW', { hour12: false });
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

setInterval(simulate, 2000);