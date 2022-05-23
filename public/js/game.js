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
    // load tile images
    for (let i = 1; i < 10; i++) {
        this.load.image('tong' + i, 'public/img/tiles_png/740px-MJt' + i + '-.svg.png');
        this.load.image('tiao' + i, 'public/img/tiles_png/740px-MJs' + i + '-.svg.png');
        this.load.image('wan' + i, 'public/img/tiles_png/740px-MJw' + i + '-.svg.png');
    }
    for (let i = 1; i < 4; i++) {
        this.load.image('wind' + i, 'public/img/tiles_png/740px-MJf' + i + '-.svg.png');
    }
    for (let i = 1; i < 3; i++) {
        this.load.image('dragon' + i, 'public/img/tiles_png/740px-MJd' + i + '-.svg.png');
    }
    this.load.image('back', 'public/img/tiles_png/back.png');

    this.load.image('player', 'public/img/blank.png');
    this.load.image('enemy', 'public/img/blank.png');
}

function create() {
    this.io = io();
    self = this;
    this.enemies = this.physics.add.group();

    createPlayer(this);

    // update game info
    this.io.on('game_info', function(players, player_ids, num_players, mid, started) {
        // if these values are falsy, assume game has been reset
        if (!players || !player_ids || !num_players) {
            // clear hand
            if (self.player_init) {
                self.player.setHand([], window_width / 1920, window_height / 1080);
            }

            // clear enemies
            self.enemies.getChildren().forEach(function(enemy) {
                enemy.setHand([], window_width / 1920, window_height / 1080, true);
            });
            for (let i = self.enemies.getLength() - 1; i >= 0; i--) {
                self.enemies.remove(self.enemies.getChildren()[i], true);
            }

            return;
        }

        if (self.player_init) {
            // update player hand
            let player_hand = players.hasOwnProperty(self.io.id) ? players[self.io.id].hand : [];
            self.player.setHand(player_hand, window_width / 1920, window_height / 1080);

            let player_index = player_ids.indexOf(self.io.id);
            if (player_index < 0 || player_index >= num_players) {
                return;
            }

            // update enemies group
            for (let pos = 1; pos < num_players; pos++) {
                let enemy_index = (player_index + pos) % num_players;
                let enemy_id = player_ids[enemy_index];

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
                    self.enemies.remove(self.enemies.getChildren()[i], true);
                }
            }

            // update enemy hands
            self.enemies.getChildren().forEach(function(enemy) {
                let enemy_hand = players.hasOwnProperty(enemy.id) ? players[enemy.id].hand : [];
                enemy.setHand(enemy_hand, window_width / 1920, window_height / 1080, true);
            });
        }
    });

    enemies_ref = this.enemies;
    // on player disconnect
    this.io.on('player_disconnect', function(player_id) {
        console.log(player_id, 'disconnected');
        enemies_ref.getChildren().forEach(function(enemy) {
            if (enemy.id == player_id) {
                enemies_ref.remove(enemy, true);
            }
        })
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
