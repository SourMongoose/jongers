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
let fishy = false;

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
    socket.on('game_start', function(is_fishy) {
        console.log('game_start', socket.id);
        game_start(socket, is_fishy);
    });

    socket.on('win', function() {
        console.log('win', socket.id);
        win(socket);
    })

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

// convert to a numeric value to compare tiles
function v(tile) {
    if (tile == null) return -1;
    return tile[0] * 9 + tile[1];
}

// get next tile
function next(tile) {
    if (tile[1] == 8 || tile[0] > 2) return null;
    return [tile[0], tile[1] + 1];
}

function game_start(socket, is_fishy) {
    // check if a game is already running
    if (started) {
        return;
    }

    started = true;
    fishy = is_fishy;
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
    if (fishy) {
        for (let suit = 3; suit < 5; suit++) {
            for (let num = 0; num < 4; num++) {
                if (suit == 4 && num > 2) {
                    break;
                }
                for (let _ = 0; _ < 4; _++) {
                    deck.push([suit, num]);
                }
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
            return v(a) - v(b);
        });
    }

    // send updated player data
    io.sockets.emit('players', players);
}

// rotate to the next player
function next_player() {
    do {
        pov = (pov + 1) % num_players;
    } while (players[player_ids[pov]].won); // skip over players who have already won
}

// check if a hand is winning
function winning_hand(hand) {
    if (hand.length % 3 != 2) {
        return false;
    }

    hand.sort(function(a, b) {
        return v(a) - v(b);
    });

    // 7 pairs
    if (hand.length == 14) {
        let works = true;
        for (let i = 0; i < 14; i += 2) {
            if (v(hand[i]) != v(hand[i + 1])) {
                works = false;
                break;
            }
        }
        if (works) {
            return true;
        }
    }

    // otherwise, just check for 4 triples and a pair
    return check(hand, 0, [], [], [], [], []);
}

// recursive helper function
function check(hand, i, p, t1, t2, t3, t4) {
    if (i == hand.length) {
        // check all possibilities as some triples may already be revealed
        switch (i) {
            case 2:
                return p.length == 2;
            case 5:
                return p.length + t1.length == 5;
            case 8:
                return p.length + t1.length + t2.length == 8;
            case 11:
                return p.length + t1.length + t2.length + t3.length == 11;
            case 14:
                return p.length + t1.length + t2.length + t3.length + t4.length == 14;
            default:
                return false;
        }
    }

    let curr = hand[i];

    // add to pair
    if (p.length == 0 || (p.length == 1 && v(p[0]) == v(curr))) {
        if (check(hand, i + 1, p.concat([curr]), t1, t2, t3, t4)) {
            return true;
        }
    }
    // add to triple #1
    if (t1.length == 0
    || t1.length == 1 && (v(curr) == v(t1[0]) || v(curr) == v(next(t1[0])))
    || t1.length == 2 && (v(curr) == v(t1[0]) && v(curr) == v(t1[1]) || v(curr) == v(next(t1[1])) && v(t1[1]) == v(next(t1[0])))) {
        if (check(hand, i + 1, p, t1.concat([curr]), t2, t3, t4)) {
            return true;
        }
    }
    if (t1.length > 0) {
        // add to triple #2
        if (t2.length == 0
        || t2.length == 1 && (v(curr) == v(t2[0]) || v(curr) == v(next(t2[0])))
        || t2.length == 2 && (v(curr) == v(t2[0]) && v(curr) == v(t2[1]) || v(curr) == v(next(t2[1])) && v(t2[1]) == v(next(t2[0])))) {
            if (check(hand, i + 1, p, t1, t2.concat([curr]), t3, t4)) {
                return true;
            }
        }
        if (t2.length > 0) {
            // add to triple #3
            if (t3.length == 0
            || t3.length == 1 && (v(curr) == v(t3[0]) || v(curr) == v(next(t3[0])))
            || t3.length == 2 && (v(curr) == v(t3[0]) && v(curr) == v(t3[1]) || v(curr) == v(next(t3[1])) && v(t3[1]) == v(next(t3[0])))) {
                if (check(hand, i + 1, p, t1, t2, t3.concat([curr]), t4)) {
                    return true;
                }
            }
            if (t3.length > 0) {
                // add to triple #4
                if (t4.length == 0
                || t4.length == 1 && (v(curr) == v(t4[0]) || v(curr) == v(next(t4[0])))
                || t4.length == 2 && (v(curr) == v(t4[0]) && v(curr) == v(t4[1]) || v(curr) == v(next(t4[1])) && v(t4[1]) == v(next(t4[0])))) {
                    if (check(hand, i + 1, p, t1, t2, t3, t4.concat([curr]))) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function win(socket) {
    // sanity checks
    if (!started || players[socket.id].won || players[socket.id].hand.length % 3 != 1) {
        return;
    }

    // check if they have just drawn
    if (player_ids[pov] == socket.id && players[socket.id].hand.length % 3 == 2) {
        // two-suit rule
        const suits = new Set();
        players[socket.id].hand.forEach(function(tile) {
            suits.add(tile[0]);
        });
        players[socket.id].revealed.forEach(function(tile) {
            suits.add(tile[0]);
        });
        if (!fishy && suits.size > 2) {
            return;
        }

        if (winning_hand(players[socket.id].hand)) {
            players[socket.id].won = true;
            players[socket.id].revealed.push(players[socket.id].hand.pop())
        }
    } else { // taking from middle
        // make sure no one else has played
        for (let i = 0; i < num_players; i++) {
            if (players[player_ids[i]].hand.length % 3 != 1) {
                return;
            }
        }

        // two-suit rule
        const suits = new Set();
        players[socket.id].hand.forEach(function(tile) {
            suits.add(tile[0]);
        });
        players[socket.id].revealed.forEach(function(tile) {
            suits.add(tile[0]);
        });
        suits.add(mid[mid.length - 1][0]);
        if (!fishy && suits.size > 2) {
            return;
        }
    }

    // if the player wins, update
    if (players[socket.id].won) {
        next_player();
        io.sockets.emit('players', players);
    }

    // check if all players (but 1) have won
    let count = 0;
    for (let i = 0; i < num_players; i++) {
        if (players[player_ids[i]].won) {
            count++;
        }
    }
    if (count + 1 >= num_players) {
        started = false;
    }
}
