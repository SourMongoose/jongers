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
    }

    setHand(arr, scale_width, scale_height, hidden) {
        console.log('setHand', this.id, arr);

        let scale = Math.min(scale_width, scale_height);

        let window_width = 1920;
        let window_height = 1080;
        let tile_width = 75;
        let overlap = 0.185;
        let hand_width = arr.length * tile_width * (1 - overlap) + tile_width * overlap;
        let margin = ((this.position == 2 ? window_width * scale_width : window_height * scale_height) - hand_width * scale) / 2;

        // remove previous elements
        for (let i = this.hand.getLength() - 1; i >= 0; i--) {
            this.hand.remove(this.hand.getChildren()[i], true);
        }

        // add new tiles
        for (let i = 0; i < arr.length; i++) {
            let t;
            if (this.position == 1) { // left
                t = new Tile(this.scene,
                    tile_width * scale, 
                    window_height * scale_height - margin - (tile_width / 2 + i * tile_width * (1 - overlap)) * scale,
                    arr[i][0], arr[i][1], hidden);
                t.setAngle(-90);
            } else if (this.position == 2) { // top
                t = new Tile(this.scene,
                    margin + (tile_width / 2 + i * tile_width * (1 - overlap)) * scale, 
                    tile_width * scale,
                    arr[i][0], arr[i][1], hidden);
                t.setAngle(0);
            } else if (this.position == 3) { // right
                t = new Tile(this.scene,
                    window_width * scale_width - tile_width * scale, 
                    margin + (tile_width / 2 + i * tile_width * (1 - overlap)) * scale,
                    arr[i][0], arr[i][1], hidden);
                t.setAngle(90);
            }
            t.setScale(tile_width / 740 * scale);
            this.hand.add(t);
        }
    }
}
