<<<<<<< HEAD
// client-side: vérifie batterie, si <=5% active le chat (Socket.IO).
// envoie 'auth' au serveur pour validation côté serveur.
// fallback si API non disponible.

=======
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
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
<<<<<<< HEAD
=======
const forceBtn = document.getElementById('forceAccess');
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)

let socket = null;
let batteryObj = null;

<<<<<<< HEAD
=======
function addMessage(msg) {
  const li = document.createElement('li');
  const levelDisplay = batteryObj ? Math.round(batteryObj.level*100) : '?';
  li.innerHTML = `<strong>${escapeHtml(msg.name)}</strong> <span class="muted">[${levelDisplay}%]</span><div>${escapeHtml(msg.text)}</div>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(s) {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
}

>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
function setBatteryVisual(levelPercent) {
  batteryText.textContent = `Niveau de batterie : ${levelPercent}%`;
  batteryIcon.style.width = levelPercent + '%';
}

<<<<<<< HEAD
function showLocked(levelPercent) {
  locked.classList.remove('hidden');
  content.classList.add('hidden');
  setBatteryVisual(levelPercent);
  unsupported.classList.add('hidden');
  retryBtn.classList.remove('hidden');
}

=======
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
function showContent(levelPercent, charging) {
  locked.classList.add('hidden');
  content.classList.remove('hidden');
  content.setAttribute('aria-hidden','false');
<<<<<<< HEAD
  finalInfo.innerHTML = `Niveau mesuré : <strong>${levelPercent}%</strong> — En charge : <strong>${charging ? 'Oui' : 'Non'}</strong>`;
=======
  finalInfo.textContent = "Chat actif ! Niveau batterie masqué aux autres.";
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
  setBatteryVisual(levelPercent);
  initSocket(levelPercent);
}

<<<<<<< HEAD
=======
function showLocked(levelPercent) {
  locked.classList.remove('hidden');
  content.classList.add('hidden');
  setBatteryVisual(levelPercent);
}

>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
function showUnsupported() {
  unsupported.classList.remove('hidden');
  batteryText.textContent = 'API Batterie non disponible — impossible de vérifier.';
  retryBtn.classList.remove('hidden');
}

<<<<<<< HEAD
// initial check + listener
=======
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
function checkBattery() {
  if (!navigator.getBattery) {
    showUnsupported();
    return;
  }

  navigator.getBattery().then(bat => {
    batteryObj = bat;
    function update() {
<<<<<<< HEAD
      const levelPercent = Math.round(bat.level * 100);
      const charging = !!bat.charging;
      // afficher niveau AVANT de décider
      setBatteryVisual(levelPercent);

      if (levelPercent <= 5) {
=======
      const levelPercent = Math.round(bat.level*100);
      const charging = !!bat.charging;
      setBatteryVisual(levelPercent);
      if(levelPercent <= 10){
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
        showContent(levelPercent, charging);
      } else {
        showLocked(levelPercent);
      }
    }
<<<<<<< HEAD

=======
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
    bat.addEventListener('levelchange', update);
    bat.addEventListener('chargingchange', update);
    update();
  }).catch(err => {
    console.error(err);
    showUnsupported();
  });
}

<<<<<<< HEAD
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
=======
retryBtn.addEventListener('click', checkBattery);
logoutBtn.addEventListener('click', () => {
  if(socket){socket.disconnect();socket=null;}
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
  locked.classList.remove('hidden');
  content.classList.add('hidden');
});

<<<<<<< HEAD
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
=======
function initSocket(levelPercent){
  if(socket) return;
  socket = io();

  socket.on('connect', () => {
    console.log('Connecté socket', socket.id);
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
    socket.emit('auth', { level: levelPercent, charging: batteryObj ? !!batteryObj.charging : false });
  });

  socket.on('auth_result', (data) => {
<<<<<<< HEAD
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
=======
    if(!data.allowed){
      alert('Accès refusé : batterie > 10%');
      socket.disconnect(); socket=null;
      showLocked(levelPercent);
    } else {
      console.log('Autorisé par le serveur.');
    }
  });

  socket.on('chat message', (msg)=>addMessage(msg));

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const text=input.value.trim();
    const name=nameInput.value.trim()||'Anonyme';
    if(!text || !socket) return;
    socket.emit('chat message',{text,name});
    input.value='';
>>>>>>> 27263f9 (🔄 Mise à jour des fichiers du chat avec batterie ≤10%)
  });
}

// démarrage
checkBattery();
