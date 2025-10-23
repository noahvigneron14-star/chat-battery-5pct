const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket', socket.id);

  // état d'autorisation initial : false
  socket.allowed = false;

  // le client doit envoyer un événement 'auth' avec { level: number, charging: bool }
  socket.on('auth', (data) => {
    try {
      const level = Number(data.level);
      // autorisation ≤10%
      socket.allowed = !isNaN(level) && level <= 10;
      socket.emit('auth_result', { allowed: socket.allowed });
      console.log(`Socket ${socket.id} auth level=${level} => allowed=${socket.allowed}`);
    } catch (err) {
      socket.allowed = false;
      socket.emit('auth_result', { allowed: false });
    }
  });

  socket.on('chat message', (msg) => {
    // sécurité côté serveur : n'accepte que si socket.allowed === true
    if (!socket.allowed) {
      socket.emit('not_allowed', { reason: 'Accès non autorisé.' });
      return;
    }
    const payload = {
      id: socket.id,
      text: String(msg.text || ''),
      ts: Date.now(),
      name: String(msg.name || 'Anonyme')
    };
    io.emit('chat message', payload);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion socket', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
