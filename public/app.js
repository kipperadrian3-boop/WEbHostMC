// WebHostMC Frontend Interaktivität

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const btnLogout = document.getElementById('btn-logout');
const loggedUserName = document.getElementById('logged-user-name');

// 1. Session Prüfung
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

// 2. Login Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim() || 'Admin';
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('webhostmc_user', data.user);
      checkAuth();
    }
  } catch (err) {
    // Offline / Demo Fallback
    localStorage.setItem('webhostmc_user', username);
    checkAuth();
  }
});

// 3. Logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('webhostmc_user');
  checkAuth();
});

// 4. Dashboard Logik
let isDashboardInit = false;
let players = [
  { name: "Steve", role: "OP / Admin", ping: "18 ms", skin: "https://mc-heads.net/avatar/Steve/32" },
  { name: "Alex", role: "Spieler", ping: "24 ms", skin: "https://mc-heads.net/avatar/Alex/32" }
];

function initDashboard() {
  if (isDashboardInit) return;
  isDashboardInit = true;

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

  // Controls
  document.getElementById('btn-start').addEventListener('click', async () => {
    setStatusDisplay('STARTET...', '#f59e0b');
    await fetch('/api/start', { method: 'POST' }).catch(() => {});
    fetchStatus();
    fetchLogs();
  });

  document.getElementById('btn-stop').addEventListener('click', async () => {
    setStatusDisplay('STOPPT...', '#ef4444');
    await fetch('/api/stop', { method: 'POST' }).catch(() => {});
    fetchStatus();
    fetchLogs();
  });

  document.getElementById('btn-restart').addEventListener('click', async () => {
    await fetch('/api/stop', { method: 'POST' }).catch(() => {});
    setTimeout(() => fetch('/api/start', { method: 'POST' }).catch(() => {}), 1500);
  });

  // Konsole
  document.getElementById('console-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('console-input');
    const command = input.value.trim();
    if (!command) return;

    input.value = '';
    await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    }).catch(() => {});

    fetchLogs();
  });

  document.getElementById('clear-console').addEventListener('click', () => {
    document.getElementById('mini-console-log').innerHTML = '';
    document.getElementById('full-console-log').innerHTML = '';
  });

  // IP Kopieren
  document.getElementById('copy-ip-btn').addEventListener('click', () => {
    const ip = document.getElementById('server-ip').textContent;
    navigator.clipboard.writeText(ip).then(() => {
      const btn = document.getElementById('copy-ip-btn');
      btn.textContent = '✅ Kopiert!';
      setTimeout(() => btn.textContent = '📋 Kopieren', 2000);
    });
  });

  // Plugins
  document.querySelectorAll('.btn-install-plugin').forEach(btn => {
    btn.addEventListener('click', function() {
      this.textContent = '⏳ Installiere...';
      setTimeout(() => {
        this.textContent = '✅ Installiert';
        this.className = 'btn btn-installed';
      }, 1500);
    });
  });

  renderPlayers();

  setInterval(fetchStatus, 1500);
  setInterval(fetchLogs, 1200);
  fetchStatus();
  fetchLogs();
}

function setStatusDisplay(text, color) {
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  statusText.textContent = text;
  if (color) {
    statusPill.style.color = color;
    statusPill.style.borderColor = color;
  }
}

// Logs Abrufen
let lastLogLen = 0;
async function fetchLogs() {
  try {
    const res = await fetch('/api/logs');
    if (!res.ok) return;
    const data = await res.json();
    if (data.logs.length !== lastLogLen) {
      lastLogLen = data.logs.length;
      const mini = document.getElementById('mini-console-log');
      const full = document.getElementById('full-console-log');
      mini.innerHTML = '';
      full.innerHTML = '';

      data.logs.forEach(log => {
        let color = '#a7f3d0';
        if (log.startsWith('>')) color = '#38bdf8';
        else if (log.includes('Stopping') || log.includes('banned') || log.includes('kicked')) color = '#f87171';
        else if (log.includes('CLOUD') || log.includes('SERVER')) color = '#facc15';

        const d1 = document.createElement('div');
        d1.textContent = log;
        d1.style.color = color;
        mini.appendChild(d1);

        const d2 = document.createElement('div');
        d2.textContent = log;
        d2.style.color = color;
        full.appendChild(d2);
      });

      mini.scrollTop = mini.scrollHeight;
      full.scrollTop = full.scrollHeight;
    }
  } catch (e) {}
}

// Status Abrufen
async function fetchStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return;
    const data = await res.json();

    const statusPill = document.getElementById('status-pill');
    const statusText = document.getElementById('status-text');
    statusText.textContent = data.status;

    if (data.status === 'ONLINE') {
      statusPill.className = 'status-pill';
      statusPill.style.color = '';
      statusPill.style.borderColor = '';
      document.getElementById('ram-text').textContent = `${data.ramUsage} / ${data.maxRam} GB`;
      document.getElementById('ram-bar').style.width = `${(data.ramUsage / data.maxRam) * 100}%`;
      document.getElementById('cpu-text').textContent = `${data.cpuUsage} %`;
      document.getElementById('cpu-bar').style.width = `${data.cpuUsage}%`;
    } else if (data.status === 'STARTET...') {
      statusPill.className = 'status-pill';
      statusPill.style.color = '#f59e0b';
      statusPill.style.borderColor = '#f59e0b';
    } else {
      statusPill.className = 'status-pill offline';
      statusPill.style.color = '';
      statusPill.style.borderColor = '';
      document.getElementById('ram-text').textContent = `0.0 / ${data.maxRam} GB`;
      document.getElementById('ram-bar').style.width = `0%`;
      document.getElementById('cpu-text').textContent = `0 %`;
      document.getElementById('cpu-bar').style.width = `0%`;
    }
  } catch (e) {}
}

// Spieler Render
function renderPlayers() {
  const tbody = document.getElementById('player-table-body');
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
};

window.banPlayer = function(i) {
  const name = players[i].name;
  players.splice(i, 1);
  renderPlayers();
};

// Start
checkAuth();
