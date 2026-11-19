const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const CLAVE_ADMIN = "tu_clave_secreta_123";

app.use(express.static('public'));

let estadoVideo = {
    url: "",
    tiempo: 0,
    reproduciendo: false
};

io.on('connection', (socket) => {
    socket.emit('sincronizar', estadoVideo);

    socket.on('accion_admin', (datos) => {
        if (datos.clave !== CLAVE_ADMIN) return;

        if (datos.tipo === 'cambiar_video') {
            estadoVideo.url = datos.url;
            estadoVideo.tiempo = 0;
            estadoVideo.reproduciendo = true;
            io.emit('sincronizar', estadoVideo);
        } else if (datos.tipo === 'play') {
            estadoVideo.tiempo = datos.tiempo;
            estadoVideo.reproduciendo = true;
            io.emit('sincronizar', estadoVideo);
        } else if (datos.tipo === 'pause') {
            estadoVideo.tiempo = datos.tiempo;
            estadoVideo.reproduciendo = false;
            io.emit('sincronizar', estadoVideo);
        } else if (datos.tipo === 'tiempo_actual') {
            // Actualiza el minuto en vivo sin forzar salto a los demás
            estadoVideo.tiempo = datos.tiempo;
            socket.broadcast.emit('actualizar_reloj', estadoVideo.tiempo);
        }
    });

    // Cuando un espectador aprieta el botón de sincronizar
    socket.on('pedir_sincronizacion', () => {
        socket.emit('sincronizar', estadoVideo);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
