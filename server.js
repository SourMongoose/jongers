let express = require('express');
let http = require('http');
let path =  require('path');
let socket_io = require('socket.io');

let port = 8080;

let players = {};
let player_ids = [];

// game variables
let mid = [];
let deck = [];
let pov = 0;
let num_players = 0;
let started = false;

let app = express();
let server = http.Server(app);
let io = socket_io(server);
app.set('port', port);

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
        hand: [],
        revealed: [],
        won: false,
        score: 0,
    };
    player_ids.push(socket.id);

    socket.emit('players', players);
    socket.broadcast.emit('new_player', players[socket.id]);

    // start a game
    socket.on('game_start', function() {
        console.log('game_start');
        
        // check if a game is already running
        if (started) {
            return;
        }

        started = true;
        num_players = Math.min(4, player_ids.length);

        mid = [];
        for (let i = 0; i < num_players; i++) {
            players[player_ids[i]].hand = [];
            players[player_ids[i]].revealed = [];
            players[player_ids[i]].won = false;
            players[player_ids[i]].score = 0;
        }
        
        // create deck
        deck = [];
        for (let suit = 0; suit < 3; suit++) {
            for (let num = 0; num < 9; num++) {
                for (let _ = 0; _ < 4; _++) {
                    deck.push([suit, num]);
                }
            }
        }
        deck = shuffle(deck);
        
        pov = 0;

        // add tiles to hands
        for (let _ = 0; _ < 13; _++) {
            for (i = 0; i < num_players; i++) {
                players[player_ids[i]].hand.push(deck.pop());
            }
            
        }
        players[player_ids[pov]].hand.push(deck.pop());

        // sort hands
        for (let i = 0; i < num_players; i++) {
            players[player_ids[i]].hand.sort(function(a, b) {
                return (a[0] * 9 + a[1]) - (b[0] * 9 + b[1]);
            });
        }

        // send updated player data
        io.sockets.emit('players', players);
    });

    // when player moves, send data to others
    socket.on('player_move', function(move_data) {
        players[socket.id].x = move_data.x;
        players[socket.id].y = move_data.y;

        socket.broadcast.emit('enemy_move', players[socket.id]);
    });

    socket.on('disconnect', function() {
        console.log('disconnect', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('player_disconnect', socket.id);
    });
});

// shuffle an array
function shuffle(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}
