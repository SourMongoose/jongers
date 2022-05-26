var window_height = window.innerHeight;
var window_width = window.innerWidth;

var config = {
    type: Phaser.AUTO,
    width: window_width,
    height: window_height,
    backgroundColor: '#37a064',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0,
            },
            fps: 60,
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update,
    },
}

var game = new Phaser.Game(config);
var player;
var player_init = false;

function preload() {
    let res = '197px'; // options: 740px, 197px

    // load tile images
    for (let i = 1; i < 10; i++) {
        this.load.image('tong' + i, 'public/img/tiles_png/' + res + '-MJt' + i + '-.svg.png');
        this.load.image('tiao' + i, 'public/img/tiles_png/' + res + '-MJs' + i + '-.svg.png');
        this.load.image('wan' + i, 'public/img/tiles_png/' + res + '-MJw' + i + '-.svg.png');
    }
    for (let i = 1; i < 4; i++) {
        this.load.image('wind' + i, 'public/img/tiles_png/' + res + '-MJf' + i + '-.svg.png');
    }
    for (let i = 1; i < 3; i++) {
        this.load.image('dragon' + i, 'public/img/tiles_png/' + res + '-MJd' + i + '-.svg.png');
    }
    this.load.image('back', 'public/img/tiles_png/' + res + '-back.png');

    // load button images
    let buttons = ['draw', 'play', 'triple', 'quad', 'eat', 'win'];
    for (let i = 0; i < buttons.length; i++) {
        this.load.image(buttons[i] + '_chinese', 'public/img/buttons/' + buttons[i] + '_chinese.png');
        this.load.image(buttons[i] + '_english', 'public/img/buttons/' + buttons[i] + '_english.png');
    }

    this.load.image('arrow', 'public/img/arrow.png');

    this.load.image('player', 'public/img/blank.png');
    this.load.image('enemy', 'public/img/blank.png');
}

function create() {
    this.io = io();
    self = this;
    this.enemies = this.physics.add.group();

    createPlayer(this);

    // update game info
    this.io.on('game_info', function(players, player_ids, num_players, pov, started, fishy) {
        // if these values are falsy, assume game has been reset
        if (!players || !player_ids || !num_players) {
            // clear hand
            if (self.player_init) {
                self.player.clearAll();
            }

            // clear enemies
            self.enemies.getChildren().forEach(function(enemy) {
                enemy.clearAll();
            });
            for (let i = self.enemies.getLength() - 1; i >= 0; i--) {
                self.enemies.remove(self.enemies.getChildren()[i], true);
            }

            return;
        }

        if (self.player_init) {
            let player_index = player_ids.indexOf(self.io.id);

            let player_pov = (player_index < 0 || player_index >= num_players) ? 0 : player_index;
            let pov_position = 0;
            while (player_pov != pov) {
                player_pov = (player_pov + 1) % num_players;
                pov_position++;
            }

            // update player hand
            if (players.hasOwnProperty(self.io.id)) {
                self.player.setRevealed(players[self.io.id].revealed, window_width / 1920, window_height / 1080);
                self.player.setHand(players[self.io.id].hand, window_width / 1920, window_height / 1080);
                self.player.setPlayed(players[self.io.id].played, window_width / 1920, window_height / 1080, num_players, pov_position);
                if (player_index >= 0 && player_index < num_players) {
                    self.player.setButtons(fishy, players[self.io.id].delay, window_width / 1920, window_height / 1080);
                } else {
                    self.player.clearButtons();
                }
            } else {
                self.player.clearAll();
            }

            // update enemies group
            for (let pos = 0; pos < num_players; pos++) {
                let enemy_index = (player_index + pos) % num_players;
                let enemy_id = player_ids[enemy_index];

                if (enemy_id == self.io.id) {
                    continue;
                }

                console.log('updating enemy ' + pos + ':', player_ids[enemy_index]);

                // make sure enemy is present
                let found = false;
                for (let i = 0; i < self.enemies.getLength(); i++) {
                    if (self.enemies.getChildren()[i].id == enemy_id) {
                        found = true;
                        self.enemies.getChildren()[i].position = pos;
                        break;
                    }
                }

                // if not, add enemy to group
                if (!found) {
                    createEnemy(self, enemy_id, pos);
                }
            }

            // remove enemies that are no longer playing
            for (let i = self.enemies.getLength() - 1; i >= 0; i--) {
                let enemy_index = player_ids.indexOf(self.enemies.getChildren()[i].id);
                if (enemy_index < 0 || enemy_index >= num_players) {
                    self.enemies.getChildren()[i].clearAll();
                    self.enemies.remove(self.enemies.getChildren()[i], true);
                }
            }

            // update enemy hands
            self.enemies.getChildren().forEach(function(enemy) {
                if (players.hasOwnProperty(enemy.id)) {
                    let hide_enemy = (player_index >= 0 && player_index < num_players) && started && !players[self.io.id].won;
                    enemy.setHand(players[enemy.id].hand, window_width / 1920, window_height / 1080, hide_enemy);
                    enemy.setRevealed(players[enemy.id].revealed, window_width / 1920, window_height / 1080);
                    enemy.setPlayed(players[enemy.id].played, window_width / 1920, window_height / 1080, num_players);
                } else {
                    enemy.clearAll();
                }
            });
        }
    });

    enemies_ref = this.enemies;
    // on player disconnect
    this.io.on('player_disconnect', function(player_id) {
        console.log(player_id, 'disconnected');
        /*
        enemies_ref.getChildren().forEach(function(enemy) {
            if (enemy.id == player_id) {
                enemy.clearAll();
                enemies_ref.remove(enemy, true);
            }
        })
        */
    });
}

function update() {
    if (this.player_init) {
        this.player.update();
    }
}

function createPlayer(scene) {
    scene.player_init = true;
    scene.player = new Player(scene);
}

function createEnemy(scene, id, position) {
    const enemy = new Enemy(scene, id, position);
    scene.enemies.add(enemy);
}
