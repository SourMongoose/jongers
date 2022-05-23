class Tile extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, suit, num, hidden) {
        let suits = ['tong', 'tiao', 'wan', 'wind', 'dragon'];
        let back = 'back';

        super(scene, x, y, hidden ? back : suits[suit] + (num + 1));

        this.scene = scene;
        this.suit = suit;
        this.num = num;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.depth = 5;
    }
}
