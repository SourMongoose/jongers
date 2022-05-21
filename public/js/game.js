var window_height = window.innerHeight;
var window_width = window.innerWidth;

var config = {
    type: Phaser.AUTO,
    width: window_width,
    height: window_height,
    backgroundColor: '#000000',

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
    this.load.image('player', 'public/img/player.png');
    this.load.image('enemy', 'public/img/enemy.png');
}

function create() {
    this.io = io();
    self = this;
    this.enemies = this.physics.add.group();
    this.io.on('players', function(players) {
        Object.keys(players).forEach(function(id) {
            if (players[id].player_id == self.io.id) {
                createPlayer(self, players[id].x, players[id].y);
            } else {
                createEnemy(self, players[id]);
            }
        });
    });
    this.io.on('new_player', function(pInfo) {
        createEnemy(self.scene, pInfo);
    });

    enemies_ref = this.enemies;
    this.io.on('enemy_move', function(player_data) {
        enemies_ref.getChildren().forEach(function(enemy) {
            if (player_data.player_id == enemy.id) {
                enemy.setPosition(player_data.x, player_data.y);
            }
        });
    });

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

function createPlayer(scene, x, y) {
    scene.player_init = true;
    scene.player = new Player(scene, x, y);
}

function createEnemy(scene, enemy_info) {
    const enemy = new Enemy(scene, enemy_info.x, enemy_info.y, enemy_info.player_id);
    scene.enemies.add(enemy);
}
