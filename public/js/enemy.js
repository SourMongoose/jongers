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
        this.played = scene.physics.add.group();

        // graphics constants
        this.window_width = 1920;
        this.window_height = 1080;
        this.hand_tile_width = 65;
        this.hand_tile_height = this.hand_tile_width * 899 / 740;
        this.revealed_tile_width = 65;
        this.revealed_tile_height = this.revealed_tile_width * 899 / 740;
        this.played_tile_width = 65;
        this.played_tile_height = this.played_tile_width * 899 / 740;
        this.overlap = 0.185;
        this.overlap_vertical = 0.165;
        this.margin = 10;
    }

    clearAll() {
        this.clearHand();
        this.clearRevealed();
        this.clearPlayed();
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

    clearPlayed() {
        for (let i = this.played.getLength() - 1; i >= 0; i--) {
            this.played.remove(this.played.getChildren()[i], true);
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
                    this.window_height / 2 * scale_height + (total_width / 2 - this.revealed_tile_width / 2 - (arr.length - i - 1) * this.revealed_tile_width * (1 - this.overlap)) * scale,
                    arr[i][0], arr[i][1], false);
                t.setAngle(90);
            } else if (this.position == 2) { // top
                t = new Tile(this.scene,
                    this.window_width / 2 * scale_width - (total_width / 2 - this.revealed_tile_width / 2 - i * this.revealed_tile_width * (1 - this.overlap)) * scale,
                    (this.margin * 2 + this.hand_tile_height + this.revealed_tile_height / 2) * scale,
                    arr[i][0], arr[i][1], false);
                t.setAngle(0);
            } else if (this.position == 3) { // right
                t = new Tile(this.scene,
                    this.window_width * scale_width - (this.margin * 2 + this.hand_tile_height + this.revealed_tile_height / 2) * scale,
                    this.window_height / 2 * scale_height - (total_width / 2 - this.revealed_tile_width / 2 - (arr.length - i - 1) * this.revealed_tile_width * (1 - this.overlap)) * scale,
                    arr[i][0], arr[i][1], false);
                t.setAngle(-90);
            }
            t.setScale(this.revealed_tile_width / 740 * scale);
            this.revealed.add(t);
        }
    }

    setPlayed(arr, scale_width, scale_height, num_players, pov_id) {
        console.log('setPlayed', this.id, arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearPlayed();

        let mid_rows = 3;
        let mid_columns = Math.ceil(((136 - 13 * num_players) / num_players + num_players) / mid_rows);
        let mid_width = mid_columns * this.played_tile_width * (1 - this.overlap) + this.played_tile_width * this.overlap;

        // add new tiles
        if (this.position == 1) { // left
            let num_rows = 4;
            let num_columns = Math.ceil(((136 - 13 * num_players) / num_players + num_players) / num_rows);
    
            let total_width = num_columns * this.played_tile_width * (1 - this.overlap) + this.played_tile_width * this.overlap;

            for (let r = num_rows - 1; r >= 0; r--) {
                for (let c = 0; c < num_columns; c++) {
                    if (r * num_columns >= arr.length) {
                        continue;
                    }
                    let i = r * num_columns + c;
                    if (i >= arr.length) {
                        continue;
                    }
    
                    let t = new Tile(this.scene,
                        this.window_width / 2 * scale_width - (mid_width / 2 + this.played_tile_height + this.played_tile_height / 2 + r * this.played_tile_height * (1 - this.overlap_vertical)) * scale,
                        this.window_height / 2 * scale_height - (total_width / 2 - this.played_tile_width / 2 - c * this.played_tile_width * (1 - this.overlap) + this.played_tile_height) * scale,
                        arr[i][0], arr[i][1], false);
                    t.setAngle(90);
                    t.setScale(this.played_tile_width / 740 * scale);
                    this.played.add(t);
                }
            }
        } else if (this.position == 2) { // top
            for (let r = mid_rows - 1; r >= 0; r--) {
                for (let c = 0; c < mid_columns; c++) {
                    if (r * mid_columns >= arr.length) {
                        continue;
                    }
                    let i = r * mid_columns + c;
                    if (i >= arr.length) {
                        continue;
                    }
    
                    let t = new Tile(this.scene,
                        this.window_width / 2 * scale_width + (mid_width / 2 - this.played_tile_width / 2 - c * this.played_tile_width * (1 - this.overlap)) * scale,
                        this.window_height / 2 * scale_height - (this.played_tile_height + r * this.played_tile_height * (1 - this.overlap_vertical) + this.played_tile_height) * scale,
                        arr[i][0], arr[i][1], false);
                    t.setAngle(180);
                    t.setScale(this.played_tile_width / 740 * scale);
                    this.played.add(t);
                }
            }
        } else if (this.position == 3) { // right
            let num_rows = 4;
            let num_columns = Math.ceil(((136 - 13 * num_players) / num_players + num_players) / num_rows);
    
            let total_width = num_columns * this.played_tile_width * (1 - this.overlap) + this.played_tile_width * this.overlap;

            for (let r = num_rows - 1; r >= 0; r--) {
                for (let c = 0; c < num_columns; c++) {
                    if (r * num_columns >= arr.length) {
                        continue;
                    }
                    let i = r * num_columns + c;
                    if (i >= arr.length) {
                        continue;
                    }
    
                    let t = new Tile(this.scene,
                        this.window_width / 2 * scale_width + (mid_width / 2 + this.played_tile_height + this.played_tile_height / 2 + r * this.played_tile_height * (1 - this.overlap_vertical)) * scale,
                        this.window_height / 2 * scale_height + (total_width / 2 - this.played_tile_width / 2 - c * this.played_tile_width * (1 - this.overlap) - this.played_tile_height) * scale,
                        arr[i][0], arr[i][1], false);
                    t.setAngle(-90);
                    t.setScale(this.played_tile_width / 740 * scale);
                    this.played.add(t);
                }
            }
        }
    }
}
