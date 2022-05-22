class Tile extends Phaser.Physics.Arcade.Image {
    suits = ['tong', 'tiao', 'wan']
    back = 'back'

    constructor(scene, suit, num) {
        super(scene, 0, 0, suits[suit] + (num + 1));

        this.scene = scene;
        this.suit = suit;
        this.num = num;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.depth = 5;

        this.setCrop(23, 0, 104, 127);
    }

    copy() {
        return new Tile(this.scene, this.suit, this.num);
    }

    next() {
        if (this.num == 8 || this.suit > 2) {
            return null;
        }
        return new Tile(this.scene, this.suit, this.num + 1);
    }
}
