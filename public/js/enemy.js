class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, id, position, name) {
        super(scene, 0, 0, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.depth = 5;

        this.scene = scene;
        this.id = id;
        this.position = position;
        this.name = name;

        this.hand = scene.physics.add.group();
        this.revealed = scene.physics.add.group();
        this.played = scene.physics.add.group();
        this.text = scene.physics.add.group();

        // image dimensions
        this.tile_width = 197;
        this.tile_height = 239;

        // graphics constants
        this.window_width = 1920;
        this.window_height = 1080;
        this.hand_tile_width = 65;
        this.hand_tile_height = this.hand_tile_width * this.tile_height / this.tile_width;
        this.revealed_tile_width = 65;
        this.revealed_tile_height = this.revealed_tile_width * this.tile_height / this.tile_width;
        this.played_tile_width = 65;
        this.played_tile_height = this.played_tile_width * this.tile_height / this.tile_width;
        this.overlap = 0.185;
        this.overlap_vertical = 0.165;
        this.margin = 10;
    }

    clearAll() {
        this.clearHand();
        this.clearRevealed();
        this.clearPlayed();
        this.clearText();
    }

    clearHand() {
        this.hand.clear(true, true);
    }

    clearRevealed() {
        this.revealed.clear(true, true);
    }

    clearPlayed() {
        this.played.clear(true, true);
    }

    clearText() {
        this.text.clear(true, true);
    }

    setHand(arr, scale_width, scale_height, hidden) {
        console.log('setHand', this.id, arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearHand();
        this.clearText();

        let total_width = arr.length * this.hand_tile_width * (1 - this.overlap) + this.hand_tile_width * this.overlap;

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t;
            if (this.position == 0) { // bottom
                t = new Tile(this.scene,
                    this.window_width / 2 * scale_width - (total_width / 2 - this.hand_tile_width / 2 - i * this.hand_tile_width * (1 - this.overlap)) * scale,
                    this.window_height * scale_height - (this.hand_tile_height / 2 + this.margin) * scale,
                    arr[i][0], arr[i][1], hidden);
                t.setAngle(0);
            } else if (this.position == 1) { // left
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
            t.setScale(this.hand_tile_width / this.tile_width * scale);
            this.hand.add(t);
        }

        // show player names
        let base_px = 48;
        let style = {
            font: base_px + 'px Arial',
            fill: '#ffffff',
            align: 'center',
        };
        let txt;
        if (this.position == 0) { // bottom
            txt = this.scene.add.text((this.margin + this.hand_tile_width / 2 * (1 - this.overlap)) * scale,
                this.window_height * scale_height - (this.margin + this.hand_tile_height / 2 * (1 - this.overlap_vertical)) * scale,
                this.name, style);
            txt.setAngle(0);
        } else if (this.position == 1) { // left
            txt = this.scene.add.text((this.margin + this.hand_tile_height / 2) * scale,
                this.window_height / 2 * scale_height,
                this.name, style);
            txt.setAngle(-90);
        } else if (this.position == 2) { // top
            txt = this.scene.add.text(this.window_width / 2 * scale_width,
                (this.margin + this.hand_tile_height / 2) * scale,
                this.name, style);
            txt.setAngle(0);
        } else if (this.position == 3) { // right
            txt = this.scene.add.text(this.window_width * scale_width - (this.margin + this.hand_tile_height / 2) * scale,
                this.window_height / 2 * scale_height,
                this.name, style);
            txt.setAngle(90);
        }
        txt.setDepth(6);
        txt.setOrigin(0.5);
        txt.setScale(this.hand_tile_width / 3 * scale / base_px);
        this.text.add(txt);
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
            if (this.position == 0) { // bottom
                t = new Tile(this.scene,
                    this.window_width / 2 * scale_width - (total_width / 2 - this.revealed_tile_width / 2 - i * this.revealed_tile_width * (1 - this.overlap)) * scale,
                    this.window_height * scale_height - (this.hand_tile_height + this.revealed_tile_height / 2 + this.margin * 2) * scale,
                    arr[i][0], arr[i][1], false);
                t.setAngle(0);
            } else if (this.position == 1) { // left
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
            t.setScale(this.revealed_tile_width / this.tile_width * scale);
            this.revealed.add(t);
        }
    }

    setPlayed(arr, scale_width, scale_height, num_players) {
        console.log('setPlayed', this.id, arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearPlayed();

        let mid_rows = 3;
        let mid_columns = Math.ceil(((136 - 13 * num_players) / num_players + num_players) / mid_rows);
        let mid_width = mid_columns * this.played_tile_width * (1 - this.overlap) + this.played_tile_width * this.overlap;

        // add new tiles
        if (this.position == 0) { // bottom
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
                        this.window_width / 2 * scale_width - (mid_width / 2 - this.played_tile_width / 2 - c * this.played_tile_width * (1 - this.overlap)) * scale,
                        this.window_height / 2 * scale_height + (this.played_tile_height + r * this.played_tile_height * (1 - this.overlap_vertical) - this.played_tile_height) * scale,
                        arr[i][0], arr[i][1], false);
                    t.setAngle(0);
                    t.setScale(this.played_tile_width / this.tile_width * scale);
                    this.played.add(t);
                }
            }
        } else if (this.position == 1) { // left
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
                    t.setScale(this.played_tile_width / this.tile_width * scale);
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
                    t.setScale(this.played_tile_width / this.tile_width * scale);
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
                    t.setScale(this.played_tile_width / this.tile_width * scale);
                    this.played.add(t);
                }
            }
        }
    }
}
