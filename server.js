const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { fileURLToPath } = require('url');
const { dirname } = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {path:'/screeniverse-socket-io'});

const port = 5733;


var cameraViews = [];

app.get('/screeniverse', (req, res) => {
    res.sendFile(__dirname + '/client/screens.html');
});

app.use('/screeniverse/wipe', (req, res) => {
    cameraViews = [];
    // redirect to screens.html
    res.redirect('/screeniverse');
});

// serve static files
app.use('/screeniverse',express.static('client'));

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

io.on('connection', (socket) => {
    // emit all camera views to the new client
    cameraViews.forEach(view => {
        socket.emit('newCameraView', view);
    });
    
    socket.on('synchWithMe', (msg) => {
        console.log('synchWithMe: ' + msg);
        socket.broadcast.emit('synchWithMe', msg);
    });

    socket.on('newCameraView', (msg) => {
        console.log('newCameraView: ' + msg);
        cameraViews.push(msg);
        socket.broadcast.emit('newCameraView', msg);
    });

    socket.on('wipeAllViews', () => {
        cameraViews = [];
        socket.broadcast.emit('wipeAllViews');
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});








