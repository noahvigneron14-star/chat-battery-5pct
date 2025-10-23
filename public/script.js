// client-side: chat avec contrôle batterie ≤10% et fallback
const locked = document.getElementById('locked');
const content = document.getElementById('content');
const batteryText = document.getElementById('battery-text');
const batteryIcon = document.getElementById('battery-icon');
const unsupported = document.getElementById('unsupported');
const retryBtn = document.getElementById('retry');
const finalInfo = document.getElementById('final-info');
const forceBtn = document.getElementById('forceAccess');

const form = document.getElementById('form');
const input = document.getElementById('input');
const nameInput = document.getElementById('name');
const messages = document.getElementById('messages');
const logoutBtn = document.getElementById('logout');

let socket = null;
let batteryObj = null;

function setBatteryVisual(levelPercent) {
  batteryText.textContent = `Niveau de batterie : ${levelPercent}%`;
  batteryIcon.style.width = levelPercent + '%';
}

function showLocked(levelPercent) {
  locked.classList.remove('hidden');
  content.classList.add('hidden');
  setBatteryVisual(levelPercent);
  unsupported.classList.add('hidden');
  retryBtn.classList.remove('hidden');
}

function showContent(levelPercent, charging) {
  locked.classList.add('hidden');
  content.classList.remove('hidden');
  content.setAttribute('aria-hidden', 'false');
  finalInfo.innerHTML = `Chat actif ! Niveau mesuré : <strong>${levelPercent}%</strong> — En charge : <strong>${charging ? 'Oui' : 'Non'}</strong>`;
  setBatteryVisual(levelPercent);
  initSocket(levelPercent);
}

function showUnsupported() {
  unsupported.classList.remove('hidden');
  batteryText.textContent = 'API Batterie non disponible — accès activé en fallback.';
  retryBtn.classList.remove('hidden');
}

// Ajouter message dans la liste
function addMessage(msg) {
  const li = document.createElement('li');
  const levelDisplay = batteryObj ? Math.round(batteryObj.level * 100) : '?';
  li.innerHTML = `<strong>${escapeHtml(msg.name)}</strong> <span class="muted">[${levelDisplay}%]</span><div>${escapeHtml(msg.text)}</div>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Initial check batterie
function checkBattery() {
  if (!navigator.getBattery) {
    console.warn("API Batterie non disponible, accès fallback activé");
    showContent(10, false); // fallback pour tester le chat
    return;
  }

  navigator.getBattery().then(bat => {
    batteryObj = bat;

    function update() {
      const levelPercent = Math.round(bat.level * 100);
      const charging = !!bat.charging;
      setBatteryVisual(levelPercent);

      if (levelPercent <= 10) {
        showContent(levelPercent, charging);
      } else {
        showLocked(levelPercent);
      }
    }

    bat.addEventListener('levelchange', update);
    bat.addEventListener('chargingchange', update);
    update();
  }).catch(err => {
    console.error(err);
    showUnsupported();
    showContent(10, false); // fallback
  });
}

// Bouton retry
retryBtn.addEventListener('click', () => {
  retryBtn.classList.add('hidden');
  checkBattery();
});

// Bouton forcer accès
forceBtn.addEventListener('click', () => {
  showContent(10, false);
});

// Déconnexion
logoutBtn.addEventListener('click', () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  locked.classList.remove('hidden');
  content.classList.add('hidden');
});

// Socket
function initSocket(levelPercent) {
  if (socket) return;
  socket = io();

  socket.on('connect', () => {
    console.log('connecté socket', socket.id);
    socket.emit('auth', { level: levelPercent, charging: batteryObj ? !!batteryObj.charging : false });
  });

  socket.on('auth_result', (data) => {
    if (!data.allowed) {
      alert('Accès refusé : batterie > 10%');
      socket.disconnect();
      socket = null;
      showLocked(levelPercent);
    } else {
      console.log('Autorisé par le serveur. Vous pouvez chatter.');
    }
  });

  socket.on('not_allowed', (data) => {
    alert(data.reason || 'Accès non autorisé.');
  });

  socket.on('chat message', (msg) => {
    addMessage(msg);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    const name = nameInput.value.trim() || 'Anonyme';
    if (!text) return;
    if (!socket) return alert('Non connecté au serveur.');
    socket.emit('chat message', { text, name });
    input.value = '';
  });
}

// Démarrage
checkBattery();
