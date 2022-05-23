class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.depth = 5;

        this.keyDown = false;

        this.scene = scene;

        this.hand = scene.physics.add.group();
        this.revealed = scene.physics.add.group();

        // graphics constants
        this.window_width = 1920;
        this.window_height = 1080;
        this.hand_tile_width = 135;
        this.hand_tile_height = this.hand_tile_width * 899 / 740;
        this.revealed_tile_width = 105;
        this.revealed_tile_height = this.revealed_tile_width * 899 / 740;
        this.overlap = 0.185;
        this.margin = 10;

        // input handling
        this.keyStart = scene.input.keyboard.addKey('S');
        this.keyWin = scene.input.keyboard.addKey('W');
    }

    clearAll() {
        this.clearHand();
        this.clearRevealed();
    }

    clearHand() {
        for (let i = this.hand.getLength() - 1; i >= 0; i--) {
            this.hand.remove(this.hand.getChildren()[i], true);
        }
    }

    clearRevealed() {
        for (let i = this.revealed.getLength() - 1; i >= 0; i--) {
            this.revealed.remove(this.revealed.getChildren()[i], true);
        }
    }

    setHand(arr, scale_width, scale_height) {
        console.log('setHand player', arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearHand();

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t = new Tile(this.scene,
                (this.margin + this.hand_tile_width / 2 + i * this.hand_tile_width * (1 - this.overlap)) * scale,
                this.window_height * scale_height - (this.hand_tile_height / 2 + this.margin) * scale,
                arr[i][0], arr[i][1], false);
            t.setScale(this.hand_tile_width / 740 * scale);

            t.setInteractive();
            let dy = this.hand_tile_width * 0.25 * scale;
            t.on('pointerdown', function() {
                if (t.selected) { // deselect
                    t.selected = false;
                    t.setY(t.y + dy);
                } else { // select
                    t.selected = true;
                    t.setY(t.y - dy);
                }
            });

            this.hand.add(t);
        }
    }

    setRevealed(arr, scale_width, scale_height) {
        console.log('setRevealed player', arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearRevealed();

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t = new Tile(this.scene,
                (this.margin + this.revealed_tile_width / 2 + i * this.revealed_tile_width * (1 - this.overlap)) * scale,
                this.window_height * scale_height - (this.hand_tile_height + this.revealed_tile_height / 2 + this.margin * 2) * scale,
                arr[i][0], arr[i][1], false);
            t.setScale(this.revealed_tile_width / 740 * scale);
            this.revealed.add(t);
        }
    }

    update() {
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
