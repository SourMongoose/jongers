class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player_speed = 600;
        this.depth = 5;
        this.prev_x = 0;
        this.prev_y = 0;

        this.scene = scene;
        this.setInteractive();
        this.setCollideWorldBounds();
        self = this;

        // input handling
        this.keyUp = scene.input.keyboard.addKey('W');
        this.keyLeft = scene.input.keyboard.addKey('A');
        this.keyDown = scene.input.keyboard.addKey('S');
        this.keyRight = scene.input.keyboard.addKey('D');
    }

    update() {
        this.setVelocity(0, 0);

        if (this.keyUp.isDown) {
            this.setVelocityY(-this.player_speed);
        } else if (this.keyDown.isDown) {
            this.setVelocityY(this.player_speed);
        }
        if (this.keyLeft.isDown) {
            this.setVelocityX(-this.player_speed);
        } else if (this.keyRight.isDown) {
            this.setVelocityX(this.player_speed);
        }

        // if player moves
        if (this.x != this.prev_x || this.y != this.prev_y) {
            this.scene.io.emit('player_move', {x: this.x, y: this.y});

            this.prev_x = this.x;
            this.prev_y = this.y;
        }
    }
}