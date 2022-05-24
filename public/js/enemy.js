class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, id, position) {
        super(scene, 0, 0, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.depth = 5;

        this.scene = scene;
        this.id = id;
        this.position = position;

        this.hand = scene.physics.add.group();
        this.revealed = scene.physics.add.group();

        // graphics constants
        this.window_width = 1920;
        this.window_height = 1080;
        this.hand_tile_width = 65;
        this.hand_tile_height = this.hand_tile_width * 899 / 740;
        this.revealed_tile_width = 65;
        this.revealed_tile_height = this.revealed_tile_width * 899 / 740;
        this.overlap = 0.185;
        this.margin = 10;
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

    setHand(arr, scale_width, scale_height, hidden) {
        console.log('setHand', this.id, arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearHand();

        let total_width = arr.length * this.hand_tile_width * (1 - this.overlap) + this.hand_tile_width * this.overlap;

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t;
            if (this.position == 1) { // left
                t = new Tile(this.scene,
                    (this.margin + this.hand_tile_height / 2) * scale,
                    this.window_height / 2 * scale_height + (total_width / 2 - this.hand_tile_width / 2 - i * this.hand_tile_width * (1 - this.overlap)) * scale,
                    arr[i][0], arr[i][1], hidden);
                t.setAngle(-90);
            } else if (this.position == 2) { // top
                t = new Tile(this.scene,
                    this.window_width / 2 * scale_width - (total_width / 2 - this.hand_tile_width / 2 - i * this.hand_tile_width * (1 - this.overlap)) * scale,
                    (this.margin + this.hand_tile_height / 2) * scale,
                    arr[i][0], arr[i][1], hidden);
                t.setAngle(0);
            } else if (this.position == 3) { // right
                t = new Tile(this.scene,
                    this.window_width * scale_width - (this.margin + this.hand_tile_height / 2) * scale,
                    this.window_height / 2 * scale_height - (total_width / 2 - this.hand_tile_width / 2 - i * this.hand_tile_width * (1 - this.overlap)) * scale,
                    arr[i][0], arr[i][1], hidden);
                t.setAngle(90);
            }
            t.setScale(this.hand_tile_width / 740 * scale);
            this.hand.add(t);
        }
    }

    setRevealed(arr, scale_width, scale_height) {
        console.log('setRevealed', this.id, arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearRevealed();

        let total_width = arr.length * this.revealed_tile_width * (1 - this.overlap) + this.revealed_tile_width * this.overlap;

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t;
            if (this.position == 1) { // left
                t = new Tile(this.scene,
                    (this.margin * 2 + this.hand_tile_height + this.revealed_tile_height / 2) * scale,
                    this.window_height / 2 * scale_height + (total_width / 2 - this.revealed_tile_width / 2 - i * this.revealed_tile_width * (1 - this.overlap)) * scale,
                    arr[i][0], arr[i][1], false);
                t.setAngle(-90);
            } else if (this.position == 2) { // top
                t = new Tile(this.scene,
                    this.window_width / 2 * scale_width - (total_width / 2 - this.revealed_tile_width / 2 - i * this.revealed_tile_width * (1 - this.overlap)) * scale,
                    (this.margin * 2 + this.hand_tile_height + this.revealed_tile_height / 2) * scale,
                    arr[i][0], arr[i][1], false);
                t.setAngle(0);
            } else if (this.position == 3) { // right
                t = new Tile(this.scene,
                    this.window_width * scale_width - (this.margin * 2 + this.hand_tile_height + this.revealed_tile_height / 2) * scale,
                    this.window_height / 2 * scale_height - (total_width / 2 - this.revealed_tile_width / 2 - i * this.revealed_tile_width * (1 - this.overlap)) * scale,
                    arr[i][0], arr[i][1], false);
                t.setAngle(90);
            }
            t.setScale(this.revealed_tile_width / 740 * scale);
            this.revealed.add(t);
        }
    }
}
