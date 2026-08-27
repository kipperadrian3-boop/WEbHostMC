const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Server-Status und Logs im Speicher
let isRunning = true;
let serverLogs = [
  `[${new Date().toLocaleTimeString()} INFO]: WebHostMC Cloud Panel gestartet.`,
  `[${new Date().toLocaleTimeString()} INFO]: Lade Server-Konfiguration...`,
  `[${new Date().toLocaleTimeString()} INFO]: Preparing level 'world'...`,
  `[${new Date().toLocaleTimeString()} INFO]: [EssentialsX] Enabling EssentialsX v2.20.1`,
  `[${new Date().toLocaleTimeString()} INFO]: [WorldEdit] Enabling WorldEdit v7.3.0`,
  `[${new Date().toLocaleTimeString()} INFO]: Server started on port 25565! (Done in 8.4s)`
];

let serverStats = {
  status: 'ONLINE',
  ramUsage: 4.2,
  maxRam: 16.0,
  cpuUsage: 12,
  playersOnline: 2,
  maxPlayers: 50,
  tps: 20.0,
  ip: 'play.webhostmc.cloud:25565'
};

// API: Login-Prüfung
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Standard-Zugangsdaten (Können angepasst werden)
  if ((username === 'admin' || username === 'adrian') && (password === 'admin' || password === '123456')) {
    return res.json({ success: true, token: 'auth-token-12345', user: username });
  }
  
  // Auch jeder andere Login wird im Demo-Modus als Erfolg gewertet
  return res.json({ success: true, token: 'auth-token-12345', user: username || 'Admin' });
});

// API: Status abfragen
app.get('/api/status', (req, res) => {
  if (isRunning) {
    serverStats.ramUsage = parseFloat((4.1 + Math.random() * 0.4).toFixed(1));
    serverStats.cpuUsage = Math.floor(10 + Math.random() * 15);
    serverStats.status = 'ONLINE';
  } else {
    serverStats.ramUsage = 0.0;
    serverStats.cpuUsage = 0;
    serverStats.status = 'OFFLINE';
  }
  res.json(serverStats);
});

// API: Logs abrufen
app.get('/api/logs', (req, res) => {
  res.json({ logs: serverLogs });
});

// API: Server Starten
app.post('/api/start', (req, res) => {
  if (isRunning) {
    return res.json({ success: false, message: 'Server läuft bereits!' });
  }

  const now = new Date().toLocaleTimeString();
  serverLogs.push(`[${now} CLOUD]: Starte Minecraft Server Container (16 GB RAM)...`);
  serverLogs.push(`[${now} INFO]: Preparing level 'world'...`);

  setTimeout(() => {
    isRunning = true;
    serverStats.status = 'ONLINE';
    serverLogs.push(`[${new Date().toLocaleTimeString()} INFO]: Server started on port 25565! (Done)`);
  }, 2000);

  res.json({ success: true, message: 'Server wird gestartet!' });
});

// API: Server Stoppen
app.post('/api/stop', (req, res) => {
  if (!isRunning) {
    return res.json({ success: false, message: 'Server ist bereits offline!' });
  }

  const now = new Date().toLocaleTimeString();
  serverLogs.push(`[${now} INFO]: Stopping server...`);
  serverLogs.push(`[${now} INFO]: Saving world chunks...`);

  setTimeout(() => {
    isRunning = false;
    serverStats.status = 'OFFLINE';
    serverLogs.push(`[${new Date().toLocaleTimeString()} CLOUD]: Server sicher gestoppt.`);
  }, 1200);

  res.json({ success: true, message: 'Server wird gestoppt!' });
});

// API: Befehl in Konsole ausführen
app.post('/api/command', (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Kein Befehl angegeben' });

  const now = new Date().toLocaleTimeString();
  serverLogs.push(`> ${command}`);

  if (command.startsWith('op ')) {
    const user = command.replace('op ', '');
    serverLogs.push(`[${now} SERVER]: Made ${user} a server operator`);
  } else if (command === 'time set day') {
    serverLogs.push(`[${now} SERVER]: Set the time to 1000`);
  } else if (command === 'stop') {
    isRunning = false;
    serverStats.status = 'OFFLINE';
    serverLogs.push(`[${now} SERVER]: Server stopped.`);
  } else {
    serverLogs.push(`[${now} SERVER]: Command executed: ${command}`);
  }

  res.json({ success: true });
});

// Fallback für Single Page App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 WebHostMC lauscht auf Port ${PORT}`);
  console.log(`🌐 Öffne: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
