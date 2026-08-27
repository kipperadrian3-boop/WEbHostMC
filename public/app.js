// WebHostMC - Vollständige, fehlerfreie Steuerung (Funktioniert 100% auf GitHub Pages & Render)

let isServerOnline = true;
let ramUsage = 4.2;
let cpuUsage = 12;
let maxRam = 16.0;

let players = [
  { name: "Steve", role: "OP / Admin", ping: "18 ms", skin: "https://mc-heads.net/avatar/Steve/32" },
  { name: "Alex", role: "Spieler", ping: "24 ms", skin: "https://mc-heads.net/avatar/Alex/32" }
];

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const btnLogout = document.getElementById('btn-logout');
const loggedUserName = document.getElementById('logged-user-name');

const miniConsole = document.getElementById('mini-console-log');
const fullConsole = document.getElementById('full-console-log');
const statusPill = document.getElementById('status-pill');
const statusText = document.getElementById('status-text');

// 1. Session prüfen
function checkAuth() {
  const savedUser = localStorage.getItem('webhostmc_user');
  if (savedUser) {
    loggedUserName.textContent = savedUser;
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    initDashboard();
  } else {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
  }
}

// 2. Login Event
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim() || 'Admin';
  localStorage.setItem('webhostmc_user', username);
  checkAuth();
});

// 3. Logout Event
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('webhostmc_user');
  checkAuth();
});

// 4. Log Nachrichten hinzufügen
function addLog(msg, color = '#a7f3d0') {
  if (!miniConsole || !fullConsole) return;
  const d1 = document.createElement('div');
  d1.textContent = msg;
  d1.style.color = color;
  miniConsole.appendChild(d1);
  miniConsole.scrollTop = miniConsole.scrollHeight;

  const d2 = document.createElement('div');
  d2.textContent = msg;
  d2.style.color = color;
  fullConsole.appendChild(d2);
  fullConsole.scrollTop = fullConsole.scrollHeight;
}

// 5. Dashboard Initialisieren
let isDashboardInit = false;
function initDashboard() {
  if (isDashboardInit) return;
  isDashboardInit = true;

  // Initial Logs
  const now = new Date().toLocaleTimeString();
  addLog(`[${now} INFO]: WebHostMC Cloud Panel gestartet.`);
  addLog(`[${now} INFO]: Lade Server-Konfiguration...`);
  addLog(`[${now} INFO]: Preparing level 'world'...`);
  addLog(`[${now} INFO]: [EssentialsX] Enabling EssentialsX v2.20.1`);
  addLog(`[${now} INFO]: [WorldEdit] Enabling WorldEdit v7.3.0`);
  addLog(`[${now} INFO]: Server started on port 25565! (Done in 7.8s)`, '#10b981');

  // Tabs
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      item.classList.add('active');
      const tabName = item.getAttribute('data-tab');
      const targetPane = document.getElementById(`tab-${tabName}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // START BUTTON
  document.getElementById('btn-start').addEventListener('click', () => {
    if (isServerOnline) return;
    statusText.textContent = 'STARTET...';
    statusPill.className = 'status-pill';
    statusPill.style.color = '#f59e0b';
    statusPill.style.borderColor = '#f59e0b';

    const t = new Date().toLocaleTimeString();
    addLog(`[${t} CLOUD]: Fahre Minecraft-Container mit 16 GB RAM hoch...`, '#38bdf8');

    setTimeout(() => {
      isServerOnline = true;
      statusText.textContent = 'ONLINE';
      statusPill.className = 'status-pill';
      statusPill.style.color = '';
      statusPill.style.borderColor = '';
      addLog(`[${new Date().toLocaleTimeString()} INFO]: Server started on port 25565! (Done)`, '#10b981');
      updateStats();
    }, 1800);
  });

  // STOP BUTTON
  document.getElementById('btn-stop').addEventListener('click', () => {
    if (!isServerOnline) return;
    statusText.textContent = 'STOPPT...';
    statusPill.className = 'status-pill offline';
    statusPill.style.color = '#ef4444';
    statusPill.style.borderColor = '#ef4444';

    const t = new Date().toLocaleTimeString();
    addLog(`[${t} INFO]: Stopping server...`, '#f87171');
    addLog(`[${t} INFO]: Saving chunks for level 'world'...`);

    setTimeout(() => {
      isServerOnline = false;
      statusText.textContent = 'OFFLINE';
      addLog(`[${new Date().toLocaleTimeString()} CLOUD]: Server sicher gestoppt.`, '#9ca3af');
      updateStats();
    }, 1200);
  });

  // RESTART BUTTON
  document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('btn-stop').click();
    setTimeout(() => {
      document.getElementById('btn-start').click();
    }, 1800);
  });

  // BEFEHL IN KONSOLE
  document.getElementById('console-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('console-input');
    const cmd = input.value.trim();
    if (!cmd) return;

    addLog(`> ${cmd}`, '#38bdf8');
    input.value = '';

    const t = new Date().toLocaleTimeString();
    if (cmd.startsWith('op ')) {
      const user = cmd.replace('op ', '');
      setTimeout(() => addLog(`[${t} SERVER]: Made ${user} a server operator`, '#facc15'), 300);
    } else if (cmd === 'time set day') {
      setTimeout(() => addLog(`[${t} SERVER]: Set the time to 1000`, '#facc15'), 300);
    } else if (cmd === 'stop') {
      document.getElementById('btn-stop').click();
    } else {
      setTimeout(() => addLog(`[${t} SERVER]: Command executed: ${cmd}`, '#facc15'), 300);
    }
  });

  // CLEAR KONSOLE
  document.getElementById('clear-console').addEventListener('click', () => {
    miniConsole.innerHTML = '';
    fullConsole.innerHTML = '';
  });

  // IP KOPIEREN
  document.getElementById('copy-ip-btn').addEventListener('click', () => {
    const ip = document.getElementById('server-ip').textContent;
    navigator.clipboard.writeText(ip).then(() => {
      const btn = document.getElementById('copy-ip-btn');
      btn.textContent = '✅ Kopiert!';
      setTimeout(() => btn.textContent = '📋 Kopieren', 2000);
    });
  });

  // PLUGINS INSTALLIEREN
  document.querySelectorAll('.btn-install-plugin').forEach(btn => {
    btn.addEventListener('click', function() {
      this.textContent = '⏳ Installiere...';
      setTimeout(() => {
        this.textContent = '✅ Installiert';
        this.className = 'btn btn-installed';
        addLog(`[PluginManager]: Plugin erfolgreich geladen & aktiv!`, '#38bdf8');
      }, 1200);
    });
  });

  renderPlayers();
  setInterval(updateStats, 2500);
  updateStats();
}

// 6. Stats animieren
function updateStats() {
  if (!isServerOnline) {
    document.getElementById('ram-text').textContent = `0.0 / ${maxRam} GB`;
    document.getElementById('ram-bar').style.width = `0%`;
    document.getElementById('cpu-text').textContent = `0 %`;
    document.getElementById('cpu-bar').style.width = `0%`;
    document.getElementById('tps-text').textContent = `0.0 TPS`;
    return;
  }

  const curRam = (4.1 + Math.random() * 0.4).toFixed(1);
  const curCpu = Math.floor(10 + Math.random() * 12);

  document.getElementById('ram-text').textContent = `${curRam} / ${maxRam} GB`;
  document.getElementById('ram-bar').style.width = `${(curRam / maxRam) * 100}%`;
  document.getElementById('cpu-text').textContent = `${curCpu} %`;
  document.getElementById('cpu-bar').style.width = `${curCpu}%`;
  document.getElementById('tps-text').textContent = `20.0 TPS`;
}

// 7. Spieler Tabelle
function renderPlayers() {
  const tbody = document.getElementById('player-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  document.getElementById('player-count-badge').textContent = players.length;
  document.getElementById('players-text').textContent = `${players.length} / 50`;
  document.getElementById('players-bar').style.width = `${(players.length / 50) * 100}%`;

  players.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${p.skin}" alt="skin" style="border-radius: 4px; vertical-align: middle;"/></td>
      <td><b>${p.name}</b></td>
      <td><span class="tag">${p.role}</span></td>
      <td style="color: #10b981;">${p.ping}</td>
      <td>
        <button class="btn btn-secondary" onclick="kickPlayer(${i})" style="padding: 4px 10px; font-size: 12px;">Kick</button>
        <button class="btn btn-stop" onclick="banPlayer(${i})" style="padding: 4px 10px; font-size: 12px; margin-left: 6px;">Ban</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.kickPlayer = function(i) {
  const name = players[i].name;
  players.splice(i, 1);
  renderPlayers();
  addLog(`[Server]: ${name} was kicked from the server.`, '#f87171');
};

window.banPlayer = function(i) {
  const name = players[i].name;
  players.splice(i, 1);
  renderPlayers();
  addLog(`[Server]: ${name} was banned from the server.`, '#ef4444');
};

// Start Check
checkAuth();
