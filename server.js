// dependencies
var express = require('express');
var http = require('http');
var path =  require('path');
var socket_io = require('socket.io');

// port
var port = 8080;

// initialize framework
var players = {};

// instancing
var app = express();
var server = http.Server(app);
var io = socket_io(server);
app.set('port', port);

// use /public for external CSS/JS
app.use('/public', express.static(__dirname + '/public'));

// port listening
server.listen(port, function() {
    console.log('listening');
});

// handle requests/responses
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

io.on('connection', function(socket) {
    console.log('new connection', socket.id);
    players[socket.id] = {
        player_id: socket.id,
        x: 500,
        y: 500,
    };

    socket.emit('players', players);
    socket.broadcast.emit('new_player', players[socket.id]);

    // when player moves, send data to others
    socket.on('player_move', function(move_data) {
        players[socket.id].x = move_data.x;
        players[socket.id].y = move_data.y;

        console.log(socket.id, 'moved');

        socket.broadcast.emit('enemy_move', players[socket.id]);
    });

    socket.on('disconnect', function() {
        console.log('disconnect');
        delete players[socket.id];
        socket.broadcast.emit('player_disconnect', socket.id);
    });
});
