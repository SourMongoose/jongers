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

    createPlayer(self);

    // update players
    //io_ref = this.io;
    this.io.on('players', function(players) {
        //console.log(io_ref.id);
        if (self.player_init) {
            self.player.setHand(players[self.io.id].hand, window_width / 1920, window_height / 1080);
        }
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
