class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.depth = 5;
        this.keyDown = false;

        this.scene = scene;
        this.setInteractive();
        this.setCollideWorldBounds();

        this.hand = [];
        this.revealed = [];

        // input handling
        this.keyStart = scene.input.keyboard.addKey('S');
        this.keyWin = scene.input.keyboard.addKey('W');
    }

    setHand(arr, scale_width, scale_height) {
        console.log('setHand', arr, scale_width, scale_height);

        let window_width = 1920;
        let window_height = 1080;
        let tile_width = 135;
        let overlap = 0.185;
        let hand_width = arr.length * tile_width * (1 - overlap) + tile_width * overlap;
        let margin = (window_width - hand_width) / 2;

        this.hand = [];
        for (let i = 0; i < arr.length; i++) {
            let t = new Tile(this.scene, (margin + tile_width / 2 + i * tile_width * (1 - overlap)) * scale_width,
                window_height * scale_height - tile_width * scale_width, arr[i][0], arr[i][1]);
            t.scale = tile_width / 740 * scale_width;
            this.hand.push(t);
        }
    }

    update() {
        this.setVelocity(0, 0);

        if (this.keyStart.isDown) {
            if (!this.keyDown) {
                this.keyDown = true;
                this.scene.io.emit('game_start', false);
            }
            return;
        } else if (this.keyWin.isDown) {
            if (!this.keyDown) {
                this.keyDown = true;
                this.scene.io.emit('win');
            }
        } else {
            this.keyDown = false;
        }
    }
}
