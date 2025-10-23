// client-side: vérifie batterie, si <=5% active le chat (Socket.IO).
// envoie 'auth' au serveur pour validation côté serveur.
// fallback si API non disponible.

const locked = document.getElementById('locked');
const content = document.getElementById('content');
const batteryText = document.getElementById('battery-text');
const batteryIcon = document.getElementById('battery-icon');
const unsupported = document.getElementById('unsupported');
const retryBtn = document.getElementById('retry');
const finalInfo = document.getElementById('final-info');

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
  content.setAttribute('aria-hidden','false');
  finalInfo.innerHTML = `Niveau mesuré : <strong>${levelPercent}%</strong> — En charge : <strong>${charging ? 'Oui' : 'Non'}</strong>`;
  setBatteryVisual(levelPercent);
  initSocket(levelPercent);
}

function showUnsupported() {
  unsupported.classList.remove('hidden');
  batteryText.textContent = 'API Batterie non disponible — impossible de vérifier.';
  retryBtn.classList.remove('hidden');
}

// initial check + listener
function checkBattery() {
  if (!navigator.getBattery) {
    showUnsupported();
    return;
  }

  navigator.getBattery().then(bat => {
    batteryObj = bat;
    function update() {
      const levelPercent = Math.round(bat.level * 100);
      const charging = !!bat.charging;
      // afficher niveau AVANT de décider
      setBatteryVisual(levelPercent);

      if (levelPercent <= 5) {
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
  });
}

retryBtn.addEventListener('click', () => {
  retryBtn.classList.add('hidden');
  checkBattery();
});

logoutBtn.addEventListener('click', () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  // retour écran locked (mais on laisse la valeur de batterie visible)
  locked.classList.remove('hidden');
  content.classList.add('hidden');
});

function addMessage(msg) {
  const li = document.createElement('li');
  const time = new Date(msg.ts).toLocaleTimeString();
  li.innerHTML = `<strong>${escapeHtml(msg.name)}</strong> <span class="muted">[${time}]</span><div>${escapeHtml(msg.text)}</div>`;
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

function initSocket(levelPercent) {
  if (socket) return; // déjà connecté
  socket = io();

  socket.on('connect', () => {
    console.log('connecté socket', socket.id);
    // envoi du niveau pour validation côté serveur
    socket.emit('auth', { level: levelPercent, charging: batteryObj ? !!batteryObj.charging : false });
  });

  socket.on('auth_result', (data) => {
    if (!data.allowed) {
      alert('Accès refusé par le serveur : batterie supérieure à 5%.');
      socket.disconnect();
      socket = null;
      // reafficher écran locked
      showLocked(data.level !== undefined ? data.level : 100);
    } else {
      // autorisé, ok
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

// démarrage
checkBattery();
