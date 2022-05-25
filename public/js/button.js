class Button extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, name) {
        super(scene, x, y, name + '_chinese');

        this.scene = scene;
        this.name = name;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.depth = 5;

        let self = this;
        this.on('pointerover', function() {
            self.setTexture(self.name + '_english');
        });
        this.on('pointerout', function() {
            self.setTexture(self.name + '_chinese');
        })
        this.on('pointerdown', function() {
            self.setTint(0xe0e0e0);
        })
        this.on('pointerup', function() {
            self.clearTint();
        })
    }
}
