class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, id) {
        super(scene, 0, 0, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.depth = 5;
        this.id = id;
    }
}
