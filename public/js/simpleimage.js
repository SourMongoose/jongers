class SimpleImage extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, name) {
        super(scene, x, y, name);

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.depth = 5;
    }
}
