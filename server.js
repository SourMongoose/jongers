let express = require('express');
let http = require('http');
let path =  require('path');
let socket_io = require('socket.io');
const { isNull } = require('util');

let port = 8080;

let players = {};
let player_ids = [];

// game variables
let mid = ['', null];
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
        played: [],
        won: false,
        score: 0,
    };
    player_ids.push(socket.id);

    socket.emit('game_info', players);
    //socket.broadcast.emit('new_player', players[socket.id]);

    socket.on('game_start', function(is_fishy) {
        console.log('game_start', socket.id);
        game_start(socket, is_fishy);
    });

    socket.on('win', function() {
        console.log('win', socket.id);
        win(socket);
    });

    socket.on('take_quad', function() {
        console.log('take_quad', socket.id);
        take_quad(socket);
    });

    socket.on('take_triple', function() {
        console.log('take_triple', socket.id);
        take_triple(socket);
    });

    socket.on('take_chi', function(num1, num2) {
        console.log('take_chi', socket.id);
        take_chi(socket, low);
    });

    socket.on('show_quad', function() {
        console.log('show_quad', socket.id);
        show_quad(socket);
    });

    socket.on('draw_tile', function() {
        console.log('draw_tile', socket.id);
        draw_tile(socket);
    });

    socket.on('play_tile', function(suit, num) {
        console.log('play_tile', socket.id);
        play_tile(socket, suit, num);
    });

    socket.on('disconnect', function() {
        console.log('disconnect', socket.id);

        let i = player_ids.indexOf(socket.id);
        if (i != -1) {
            // if a player leaves an ongoing game
            if (started && i < num_players) {
                started = false;
                broadcast_update();
            }

            player_ids.splice(i, 1);
        }

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

// update all players with current game state
function broadcast_update() {
    io.sockets.emit('game_info', players, player_ids, num_players, pov, started, fishy);
}

// start a game
function game_start(socket, is_fishy) {
    // check if a game is already running
    if (started) {
        return;
    }

    started = true;
    fishy = is_fishy;
    num_players = Math.min(4, player_ids.length);

    mid = ['', null];
    for (let i = 0; i < num_players; i++) {
        players[player_ids[i]].hand = [];
        players[player_ids[i]].revealed = [];
        players[player_ids[i]].played = [];
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
        for (let i = 0; i < num_players; i++) {
            players[player_ids[i]].hand.push(deck.pop());
        }
    }
    players[player_ids[pov]].hand.push(deck.pop());

    // sort hands
    for (let i = 0; i < num_players; i++) {
        players[player_ids[i]].hand.sort((a, b) => v(a) - v(b));
    }

    // send updated player data
    broadcast_update();
}

// rotate to the next player
function next_player() {
    do {
        pov = (pov + 1) % num_players;
    } while (players[player_ids[pov]].won); // skip over players who have already won
}

// return mid tile
function get_mid_tile() {
    return mid[1];
}

// take the tile that was just played
function take_mid() {
    if (get_mid_tile() == null) {
        return;
    }

    let mid_player_id = mid[0];
    mid = ['', null];
    return players[mid_player_id].played.pop();
}

// check if a hand is winning
function winning_hand(hand) {
    if (hand.length % 3 != 2) {
        return false;
    }

    hand.sort((a, b) => v(a) - v(b));

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
        // make sure no one else has drawn
        for (let i = 0; i < num_players; i++) {
            if (players[player_ids[i]].hand.length % 3 != 1) {
                return;
            }
        }

        if (get_mid_tile() == null) {
            return;
        }

        // two-suit rule
        const suits = new Set();
        players[socket.id].hand.forEach(function(tile) {
            suits.add(tile[0]);
        });
        players[socket.id].revealed.forEach(function(tile) {
            suits.add(tile[0]);
        });
        suits.add(get_mid_tile()[0]);
        if (!fishy && suits.size > 2) {
            return;
        }

        if (winning_hand(players[socket.id].hand.concat([get_mid_tile()]))) {
            players[socket.id].won = true;
            players[socket.id].revealed.push(take_mid());
        }
    }

    // if the player wins, update
    if (players[socket.id].won) {
        next_player();
        broadcast_update();
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

// count the number of times `tile` appears in `hand`
function count_occurences(hand, tile) {
    let count = 0;
    hand.forEach(function(t) {
        if (v(t) == v(tile)) {
            count++;
        }
    })
    return count;
}

// attempt to take a quad from the middle
function take_quad(socket) {
    // cannot quad if deck is empty
    if (deck.length == 0) {
        return;
    }

    take_n(socket, 4);
}

// attempt to take a triple from the middle
function take_triple(socket) {
    take_n(socket, 3);
}

// attempt to take a set of size x from the middle
function take_n(socket, x) {
    // sanity checks
    if (!started || get_mid_tile() == null) {
        return;
    }

    // make sure no one else has drawn
    for (let i = 0; i < num_players; i++) {
        if (players[player_ids[i]].hand.length % 3 != 1) {
            return;
        }
    }

    // check that player has enough copies
    if (count_occurences(players[socket.id].hand, get_mid_tile()) >= x - 1) {
        let n = 0;
        for (let i = players[socket.id].hand.length - 1; i >= 0; i--) {
            if (v(players[socket.id].hand[i]) == v(get_mid_tile())) {
                players[socket.id].revealed.push(players[socket.id].hand.splice(i, 1)[0]);
                n++;
            }
            if (n >= x - 1) {
                break;
            }
        }
        players[socket.id].revealed.push(take_mid());

        pov = player_ids.indexOf(socket.id);
        broadcast_update();
    }
}

function take_chi(socket, num1, num2) {
    // sanity checks
    if (!started || get_mid_tile() == null) {
        return;
    }

    // make sure it is your turn
    if (socket.id != player_ids[pov] || players[socket.id].hand.length % 3 != 1) {
        return;
    }

    let low = Math.min(get_mid_tile()[1], num1, num2);

    let suit = get_mid_tile()[0];

    // keep track of which numbers are in hand
    let in_hand = [false, false, false, false, false, false, false, false, false];
    players[socket.id].hand.forEach(function(tile) {
        if (tile[0] == suit) {
            in_hand[tile[1]] = true;
        }
    });

    // check that all three numbers of the straight are present
    if ([low, low + 1, low + 2].every((value) => in_hand[value] || get_mid_tile()[1] == value)) {
        let took_mid = false;
        for (let x = low; x < low + 3; x++) {
            if (!took_mid && get_mid_tile()[1] == x) {
                players[socket.id].revealed.push(take_mid());
                took_mid = true;
            } else {
                for (let i = 0; i < players[socket.id].hand.length; i++) {
                    if (players[socket.id].hand[i][0] == suit && players[socket.id].hand[i][1] == x) {
                        players[socket.id].revealed.push(players[socket.id].hand.splice(i, 1)[0]);
                        break;
                    }
                }
            }
        }

        broadcast_update();
    }
}

function show_quad(socket) {
    // sanity checks
    if (!started) {
        return;
    }

    // cannot quad if deck is empty
    if (deck.length == 0) {
        return;
    }

    // make sure it is your turn and you have drawn
    if (socket.id != player_ids[pov] || players[socket.id].hand.length % 3 != 2) {
        return;
    }

    let freq = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    let in_hand = [
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false]
    ];

    players[socket.id].hand.forEach(function(tile) {
        freq[tile[0]][tile[1]]++;
        in_hand[tile[0]][tile[1]] = true;
    });
    players[socket.id].revealed.forEach(function(tile) {
        freq[tile[0]][tile[1]]++;
    });

    for (let suit = 0; suit < 3; suit++) {
        for (let num = 0; num < 9; num++) {
            if (freq[suit][num] >= 4 && in_hand[suit][num]) {
                for (let i = players[socket.id].hand.length - 1; i >= 0; i--) {
                    if (players[socket.id].hand[i][0] == suit && players[socket.id].hand[i][1] == num) {
                        players[socket.id].revealed.push(players[socket.id].hand.splice(i, 1)[0]);
                    }
                }
                broadcast_update();
                return;
            }
        }
    }
}

function draw_tile(socket) {
    // sanity checks
    if (!started) {
        return;
    }

    // make sure it is your turn
    if (socket.id != player_ids[pov] || players[socket.id].hand.length % 3 != 1) {
        return;
    }

    mid = ['', null];

    // no more tiles left
    if (deck.length == 0) {
        started = false;
        broadcast_update();
        return;
    }

    players[socket.id].hand.push(deck.pop());
    broadcast_update();
}

function play_tile(socket, suit, num) {
    // sanity checks
    if (!started) {
        return;
    }

    // make sure it is your turn
    if (socket.id != player_ids[pov] || players[socket.id].hand.length % 3 != 2) {
        return;
    }

    // search hand for a matching tile, and remove it
    for (let i = players[socket.id].hand.length - 1; i >= 0; i--) {
        if (players[socket.id].hand[i][0] == suit && players[socket.id].hand[i][1] == num) {
            let tile = players[socket.id].hand.splice(i, 1)[0];
            mid = [socket.id, tile];
            players[socket.id].played.push(tile);
            players[socket.id].hand.sort((a, b) => v(a) - v(b));
            next_player();
            broadcast_update();
            return;
        }
    }
}
