var window_height = window.innerHeight;
var window_width = window.innerWidth;

var config = {
    type: Phaser.AUTO,
    width: window_width,
    height: window_height,
    backgroundColor: '#32c832',

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
    for (var i = 1; i < 10; i++) {
        this.load.image('tong' + i, 'public/img/pin' + i + '.png');
        this.load.image('tiao' + i, 'public/img/bamboo' + i + '.png');
        this.load.image('wan' + i, 'public/img/man' + i + '.png');
    }
    this.load.image('back', 'public/img/facedown.png');

    this.load.image('player', 'public/img/player.png');
    this.load.image('enemy', 'public/img/enemy.png');
}

function create() {
    this.io = io();
    self = this;
    this.enemies = this.physics.add.group();

    createPlayer(self);

    // update players
    this.io.on('players', function(players) {
        Object.keys(players).forEach(function(id) {
            console.log(id, players[id]);
        });
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

function createEnemy(scene, enemy_info) {
    const enemy = new Enemy(scene, enemy_info.player_id);
    scene.enemies.add(enemy);
}
