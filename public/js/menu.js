class Menu {
    constructor(scene) {
        this.scene = scene;

        this.buttons = scene.physics.add.group();
        this.images = scene.physics.add.group();
        this.text = scene.physics.add.group();

        // graphics constants
        this.window_width = 1920;
        this.window_height = 1080;
        this.textbox_height = 50;
        this.button_width = 115;
        this.button_height = this.button_width * 91 / 182;
    }

    clearAll() {
        this.clearButtons();
        this.clearImages();
        this.clearText();
    }

    clearButtons() {
        this.buttons.clear(true, true);
    }

    clearImages() {
        this.images.clear(true, true);
    }

    clearText() {
        this.text.clear(true, true);
    }

    mainMenu(scale_width, scale_height) {
        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearAll();

        // name input
        let name_input = this.scene.add.dom(this.window_width / 2 * scale_width,
            this.window_height / 2 * scale_height,
            'input',
            {
                id: 'nameinput',
                name: 'nameinput',
                height: Math.round(this.textbox_height * scale) + 'px',
                fontSize: Math.round(this.textbox_height * scale) + 'px',
                textAlign: 'center',
            });
        name_input.setOrigin(0.5);
        this.text.add(name_input);

        // enter button
        let b = new Button(this.scene,
            this.window_width / 2 * scale_width,
            this.window_height / 2 * scale_height + (this.button_height + this.textbox_height / 2) * scale,
            'enter');
        b.setScale(this.button_width / 182 * scale);
        b.setInteractive();
        let self = this;
        b.on('pointerdown', function() {
            let str = name_input.node.value;
            let filtered_str = '';
            for (let i = 0; i < str.length; i++) {
                if (str[i] >= '0' && str[i] <= '9' || str[i] >= 'a' && str[i] <= 'z' || str[i] >= 'A' && str[i] <= 'Z') {
                    filtered_str += str[i];
                }
            }
            self.scene.io.emit('game_enter', filtered_str ? filtered_str : '[no name]');
        });
        this.buttons.add(b);
    }

    lobbyMenu(players, player_ids, scale_width, scale_height) {
        console.log('lobby menu', players, player_ids);

        let scale = Math.min(scale_width, scale_height);

        // remove previous elements
        this.clearAll();

        // players in lobby
        let base_px = 48;
        let style = {
            font: base_px + 'px Arial',
            fill: '#ffffff',
            align: 'center',
        };
        let str = 'Players in lobby:';
        player_ids.forEach(function(id) {
            str += '\n' + players[id].name;
        });
        let player_text = this.scene.add.text(this.window_width / 2 * scale_width,
            this.window_height / 2 * scale_height,
            str, style);
        player_text.setDepth(6);
        player_text.setOrigin(0.5);
        player_text.setScale(scale);
        this.text.add(player_text);

        // start button
        let b = new Button(this.scene,
            this.window_width / 2 * scale_width,
            this.window_height * scale_height - (this.button_height * 1.5) * scale,
            'start');
        b.setScale(this.button_width / 182 * scale);
        b.setInteractive();
        let self = this;
        b.on('pointerdown', function() {
            self.scene.io.emit('game_start');
        });
        this.buttons.add(b);
    }
}
