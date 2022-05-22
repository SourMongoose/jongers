class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player_speed = 600;
        this.depth = 5;
        this.down = false;

        this.scene = scene;
        this.setInteractive();
        this.setCollideWorldBounds();
        self = this;

        // input handling
        this.keyStart = scene.input.keyboard.addKey('S');
    }

    update() {
        this.setVelocity(0, 0);

        if (this.keyStart.isDown) {
            if (!this.down) {
                this.down = true;
                console.log('key down');
                this.scene.io.emit('game_start');
            }
        } else {
            this.down = false;
        }
    }
}
