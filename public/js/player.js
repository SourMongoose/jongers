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
        this.played = scene.physics.add.group();
        this.buttons = scene.physics.add.group();
        this.images = scene.physics.add.group();

        // graphics constants
        this.window_width = 1920;
        this.window_height = 1080;
        this.hand_tile_width = 115;
        this.hand_tile_height = this.hand_tile_width * 899 / 740;
        this.revealed_tile_width = 75;
        this.revealed_tile_height = this.revealed_tile_width * 899 / 740;
        this.played_tile_width = 65;
        this.played_tile_height = this.played_tile_width * 899 / 740;
        this.overlap = 0.185;
        this.overlap_vertical = 0.165;
        this.margin = 10;
        this.button_width = 115;
        this.button_height = this.button_width * 757 / 1513;

        // input handling
        this.keyStart = scene.input.keyboard.addKey('S');
        this.keyFishy = scene.input.keyboard.addKey('F');
    }

    clearAll() {
        this.clearHand();
        this.clearRevealed();
        this.clearPlayed();
        this.clearButtons();
        this.clearImages();
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

    clearButtons() {
        for (let i = this.buttons.getLength() - 1; i >= 0; i--) {
            this.buttons.remove(this.buttons.getChildren()[i], true);
        }
    }

    clearImages() {
        for (let i = this.images.getLength() - 1; i >= 0; i--) {
            this.images.remove(this.images.getChildren()[i], true);
        }
    }

    setHand(arr, scale_width, scale_height) {
        console.log('setHand player', arr);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearHand();

        let total_width = arr.length * this.hand_tile_width * (1 - this.overlap) + this.hand_tile_width * this.overlap;

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t = new Tile(this.scene,
                this.window_width / 2 * scale_width - (total_width / 2 - this.hand_tile_width / 2 - i * this.hand_tile_width * (1 - this.overlap)) * scale,
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

        let total_width = arr.length * this.revealed_tile_width * (1 - this.overlap) + this.revealed_tile_width * this.overlap;

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t = new Tile(this.scene,
                this.window_width / 2 * scale_width - (total_width / 2 - this.revealed_tile_width / 2 - i * this.revealed_tile_width * (1 - this.overlap)) * scale,
                this.window_height * scale_height - (this.hand_tile_height + this.revealed_tile_height / 2 + this.margin * 2) * scale,
                arr[i][0], arr[i][1], false);
            t.setScale(this.revealed_tile_width / 740 * scale);
            this.revealed.add(t);
        }
    }

    setPlayed(arr, scale_width, scale_height, num_players, pov_position) {
        console.log('setPlayed player', arr, pov_position);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearPlayed();
        this.clearImages();

        let num_rows = 3;
        let num_columns = Math.ceil(((136 - 13 * num_players) / num_players + num_players) / num_rows);

        let total_width = num_columns * this.played_tile_width * (1 - this.overlap) + this.played_tile_width * this.overlap;

        // add new tiles
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
                    this.window_width / 2 * scale_width - (total_width / 2 - this.played_tile_width / 2 - c * this.played_tile_width * (1 - this.overlap)) * scale,
                    this.window_height / 2 * scale_height + (this.played_tile_height + r * this.played_tile_height * (1 - this.overlap_vertical) - this.played_tile_height) * scale,
                    arr[i][0], arr[i][1], false);
                t.setScale(this.played_tile_width / 740 * scale);
                t.setAngle(0);
                this.played.add(t);
            }
        }

        // add pov arrow
        let a = new SimpleImage(this.scene,
            this.window_width / 2 * scale_width,
            this.window_height / 2 * scale_height - this.played_tile_height * scale,
            'arrow');
        a.setScale(this.played_tile_height / 2 / 1067 * scale);
        a.setAngle((pov_position + 1) * 90);
        this.images.add(a);
    }

    setButtons(is_fishy, scale_width, scale_height) {
        console.log('setButtons');

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearButtons();

        let buttons = is_fishy ? ['draw', 'play', 'eat', 'triple', 'quad', 'win'] : ['draw', 'play', 'triple', 'quad', 'win'];

        let total_width = buttons.length * this.button_width + (buttons.length - 1) * this.margin;

        // add buttons
        for (let i = 0; i < buttons.length; i++) {
            let b = new Button(this.scene,
                this.window_width / 2 * scale_width - (total_width / 2 - this.button_width / 2 - i * (this.button_width + this.margin)) * scale,
                this.window_height * scale_height - (this.hand_tile_height + this.revealed_tile_height + this.button_height / 2 + this.margin * 3) * scale,
                buttons[i]);
            b.setScale(this.button_width / 1513 * scale);

            b.setInteractive();
            let self = this;
            b.on('pointerdown', function() {
                if (buttons[i] == 'draw') {
                    self.scene.io.emit('draw_tile');
                } else if (buttons[i] == 'play') {
                    // make sure one tile is selected
                    let selected_tiles = [];
                    self.hand.getChildren().forEach(function(tile) {
                        if (tile.selected) {
                            selected_tiles.push([tile.suit, tile.num]);
                        }
                    });

                    if (selected_tiles.length == 1) {
                        self.scene.io.emit('play_tile', selected_tiles[0][0], selected_tiles[0][1]);
                    }
                } else if (buttons[i] == 'eat') {
                    // make sure two other tiles are selected
                    let selected_tiles = [];
                    self.hand.getChildren().forEach(function(tile) {
                        if (tile.selected) {
                            selected_tiles.push([tile.suit, tile.num]);
                        }
                    });

                    if (selected_tiles.length == 2) {
                        self.scene.io.emit('take_chi', selected_tiles[0][1], selected_tiles[1][1]);
                    }
                } else if (buttons[i] == 'triple') {
                    self.scene.io.emit('take_triple');
                } else if (buttons[i] == 'quad') {
                    self.scene.io.emit('take_quad');
                    self.scene.io.emit('show_quad');
                } else if (buttons[i] == 'win') {
                    self.scene.io.emit('win');
                }
            });

            this.buttons.add(b);
        }
    }

    update() {
        if (this.keyStart.isDown) {
            if (!this.keyDown) {
                this.keyDown = true;
                this.scene.io.emit('game_start', false);
            }
            return;
        } else if (this.keyFishy.isDown) {
            if (!this.keyDown) {
                this.keyDown = true;
                this.scene.io.emit('game_start', true);
            }
        } else {
            this.keyDown = false;
        }
    }
}
