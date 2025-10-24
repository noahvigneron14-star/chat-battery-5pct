// Chat v2 - violet theme - affiche pseudo + batterie dans les messages
const locked = document.getElementById('locked');
const content = document.getElementById('content');
const batteryText = document.getElementById('battery-text');
const retryBtn = document.getElementById('retry');
const forceBtn = document.getElementById('force');
const finalInfo = document.getElementById('final-info');

const nameInputTop = document.getElementById('name');
const form = document.getElementById('form');
const input = document.getElementById('input');
const msgName = document.getElementById('msg-name');
const messages = document.getElementById('messages');
const logoutBtn = document.getElementById('logout');

let socket = null;
let batteryObj = null;
let lastLevel = null;

function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }

function setBatteryVisual(level){
  batteryText.textContent = `Niveau de batterie : ${level}%`;
}

function showLocked(levelText){
  locked.classList.remove('hidden');
  content.classList.add('hidden');
  batteryText.textContent = levelText;
  finalInfo.textContent = 'Le chat n\'est accessible que si la batterie est ≤ 10%';
  retryBtn.classList.remove('hidden');
}

function showContent(level, charging){
  locked.classList.add('hidden');
  content.classList.remove('hidden');
  finalInfo.textContent = 'Chat actif — ton niveau est affiché aux autres.';
  setBatteryVisual(level !== null ? level : '?');
  initSocket(level);
}

function addMessage(msg){
  const li = document.createElement('li');
  const time = new Date(msg.ts).toLocaleTimeString();
  const batt = (msg.battery !== null && msg.battery !== undefined) ? `${msg.battery}%` : '?%';
  li.innerHTML = `<div class="message-meta"><strong>${escapeHtml(msg.name)}</strong> <span class="muted">[${batt}]</span> <span class="muted">[${time}]</span></div><div>${escapeHtml(msg.text)}</div>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function initSocket(levelSent){
  if(socket) return;
  socket = io();
  socket.on('connect', ()=>{
    const nm = (msgName.value || nameInputTop.value || 'Anonyme').slice(0,30);
    // send auth with level and name
    socket.emit('auth',{ level: levelSent !== null ? levelSent : (lastLevel !== null ? lastLevel : 100), name: nm, forced: false });
  });
  socket.on('auth_result', d=>{
    if(!d.allowed){
      alert('Accès refusé par le serveur (batterie >10%)');
      socket.disconnect(); socket=null;
      showLocked('Accès refusé (batterie >10%)');
    }
  });
  socket.on('chat message', msg=> addMessage(msg));
  socket.on('not_allowed', d=> alert(d.reason || 'Accès non autorisé'));
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const text = input.value.trim();
    const nm = (msgName.value || nameInputTop.value || 'Anonyme').slice(0,30);
    if(!text || !socket) return;
    socket.emit('chat message',{ name: nm, text });
    input.value='';
  });
}

// battery check with fallback and force button
function checkBattery(){
  if(!navigator.getBattery){
    // API not available -> show controls and let user force access
    showLocked('API Batterie non disponible — utilisez "Forcer accès"');
    return;
  }
  navigator.getBattery().then(bat=>{
    batteryObj = bat;
    function update(){
      const level = Math.round(bat.level*100);
      lastLevel = level;
      if(level <= 10 && !bat.charging){
        showContent(level, bat.charging);
      } else {
        showLocked('Batterie trop haute ('+level+'%)');
      }
    }
    bat.addEventListener('levelchange', update);
    bat.addEventListener('chargingchange', update);
    update();
  }).catch(err=>{
    console.error(err);
    showLocked('Erreur lecture batterie — utilisez "Forcer accès"');
  });
}

forceBtn.addEventListener('click', ()=>{
  // force access: send forced=true to server
  showContent(lastLevel !== null ? lastLevel : 100, false);
  if(socket){ socket.emit('auth',{ level: lastLevel !== null ? lastLevel : 100, name: msgName.value || nameInputTop.value || 'Anonyme', forced: true }); }
  else {
    // init socket and set forced on connect
    initSocket(lastLevel !== null ? lastLevel : 100);
    // after connect, re-emit auth with forced flag
    setTimeout(()=>{ if(socket) socket.emit('auth',{ level: lastLevel !== null ? lastLevel : 100, name: msgName.value || nameInputTop.value || 'Anonyme', forced: true }); }, 300);
  }
});

retryBtn.addEventListener('click', ()=>{ retryBtn.classList.add('hidden'); checkBattery(); });
logoutBtn.addEventListener('click', ()=>{ if(socket){socket.disconnect(); socket=null;} location.reload(); });

// start
checkBattery();
