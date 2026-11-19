const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Contraseña secreta para que SOLO TÚ puedas controlar el video
const CLAVE_ADMIN = "tu_clave_secreta_123";

app.use(express.static('public'));

let estadoVideo = {
    url: "",
    tiempo: 0,
    reproduciendo: false
};

io.on('connection', (socket) => {
    // Enviar el estado actual al espectador que acaba de entrar
    socket.emit('sincronizar', estadoVideo);

    // Recibir órdenes del administrador (tú)
    socket.on('accion_admin', (datos) => {
        if (datos.clave !== CLAVE_ADMIN) return;

        if (datos.tipo === 'cambiar_video') {
            estadoVideo.url = datos.url;
            estadoVideo.tiempo = 0;
            estadoVideo.reproduciendo = true;
        } else if (datos.tipo === 'play') {
            estadoVideo.tiempo = datos.tiempo;
            estadoVideo.reproduciendo = true;
        } else if (datos.tipo === 'pause') {
            estadoVideo.tiempo = datos.tiempo;
            estadoVideo.reproduciendo = false;
        }

        // Enviar la orden a todos los espectadores conectados
        io.emit('sincronizar', estadoVideo);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
