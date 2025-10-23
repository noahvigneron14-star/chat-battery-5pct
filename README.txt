README - Chat protégé par niveau de batterie (<=5%)
-----------------------------------------------------
Description :
Projet Node.js minimal qui sert une page web. Le chat temps-réel est activé uniquement si la batterie du client est <= 5%.
Le client envoie son niveau au serveur via Socket.IO et le serveur refuse les messages si le niveau est > 5%.

Comment lancer :
1. Node.js (>=14) installé.
2. Décompresse l'archive.
3. Dans le dossier du projet :
   npm install
   npm start
4. Ouvre http://localhost:3000 dans ton navigateur (note : l'API Batterie n'est pas disponible partout — iOS Safari la limite).

Remarques de sécurité :
- Ce projet est une démo : la vérification principale est côté client, mais le serveur effectue aussi un contrôle simple en se fiant au message 'auth' envoyé par le client.
- Pour une vraie application, il faudrait ajouter authentification, filtrage de contenu, persistance, etc.

Fichiers :
 - server.js
 - package.json
 - /public/index.html
 - /public/styles.css
 - /public/script.js
