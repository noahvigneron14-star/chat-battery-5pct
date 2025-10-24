import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  console.log('Nouvelle connexion', socket.id);
  socket.allowed = false;
  socket.userBattery = null;
  socket.userName = 'Anonyme';

  socket.on('auth', data => {
    try {
      const level = Number(data.level);
      const forced = !!data.forced;
      socket.userBattery = isNaN(level) ? null : level;
      socket.userName = data.name ? String(data.name).slice(0,30) : 'Anonyme';
      socket.allowed = (!isNaN(level) && level <= 10) || forced;
      socket.emit('auth_result', { allowed: socket.allowed });
      console.log(`auth ${socket.id} name=${socket.userName} level=${socket.userBattery} => allowed=${socket.allowed}`);
    } catch(e) {
      socket.allowed = false;
      socket.emit('auth_result', { allowed: false });
    }
  });

  socket.on('chat message', msg => {
    if (!socket.allowed) {
      socket.emit('not_allowed', { reason: 'Accès non autorisé (batterie >10%)' });
      return;
    }
    const payload = {
      id: socket.id,
      name: String(msg.name || socket.userName || 'Anonyme'),
      text: String(msg.text || ''),
      battery: socket.userBattery !== null ? Number(socket.userBattery) : null,
      ts: Date.now()
    };
    io.emit('chat message', payload);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
