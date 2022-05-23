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

        let window_width = 1920;
        let window_height = 1080;
        let tile_width = 135;
        let overlap = 0.185;
        let hand_width = arr.length * tile_width * (1 - overlap) + tile_width * overlap;
        let margin = (window_width * scale_width - hand_width * scale) / 2;

        // remove previous elements
        this.clearHand();

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t = new Tile(this.scene,
                margin + (tile_width / 2 + i * tile_width * (1 - overlap)) * scale,
                window_height * scale_height - tile_width * scale,
                arr[i][0], arr[i][1], false);
            t.setScale(tile_width / 740 * scale);

            t.setInteractive();
            t.on('pointerdown', function() {
                if (t.selected) { // deselect
                    t.selected = false;
                    t.setY(t.y + tile_width * 0.25 * scale);
                } else { // select
                    t.selected = true;
                    t.setY(t.y - tile_width * 0.25 * scale);
                }
            });

            this.hand.add(t);
        }
    }

    setRevealed(arr, scale_width, scale_height) {
        console.log('setRevealed player', arr);

        let scale = Math.min(scale_width, scale_height);

        let window_width = 1920;
        let window_height = 1080;
        let tile_width = 105;
        let overlap = 0.185;
        let hand_width = arr.length * tile_width * (1 - overlap) + tile_width * overlap;
        let margin = (window_width * scale_width - hand_width * scale) / 2;

        // remove previous elements
        this.clearRevealed();

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t = new Tile(this.scene,
                margin + (tile_width / 2 + i * tile_width * (1 - overlap)) * scale,
                window_height * scale_height - tile_width * scale * 3,
                arr[i][0], arr[i][1], false);
            t.setScale(tile_width / 740 * scale);
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
