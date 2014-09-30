
// Main Game Object
// it holds all the Phaser Game states

var Game = {};

Game.Preloader = function (){};
Game.Preloader.prototype = {
	preload: function () {
		this.game.stage.backgroundColor = '#000000';

		var style = { font: "24px Arial", fill: "white", align: "center" };
	    this.add.text(game.world.centerX, game.world.centerY, "Preloading...", style);

		this.load.spritesheet('tileSheet', '../../assets/tiles.png',32,32);
	    this.load.spritesheet('player','../../assets/player.png',32,32);

	    this.load.onLoadComplete.add(this.loadComplete, this)
	},
	loadComplete: function() {
		this.game.state.start('MainMenu');
	}
};


Game.MainMenu = function(){};
Game.MainMenu.prototype = {
	preload: function() {
	},
	create: function() {
		var style = { font: "24px Arial", fill: "white", align: "center" };
		this.add.text(game.world.centerX, game.world.centerY, "MainMenu\nPlay", style);
		this.game.input.onDown.add(this.startGame, this);
	},
	update: function() {
	},
	startGame: function() {
		this.game.state.start('Play');
	}
};


Game.Play = function() {};
Game.Play.prototype = {

	preload: function() {
		// Game engine objects
		this.tileMap = null;
		this.marker = null;
		this.layer0 = null;
		this.cursors = null;
		this.player = null;

		// Game Logic Objects
		this.dungeon = null;
		this.map = null;
		this.stats = null;
		this.rooms = null;
		this.tree = null;
		this.tileSpriteMap = null;

		// Game constants
		this.MAP_SIZE = 32;
		this.TILE_SIZE = 32;
		this.WORLD_SIZE = this.MAP_SIZE*this.TILE_SIZE;
		this.PLAYER_SPEED = 180;
		this.PLAYERFRAME_SPEED = Math.floor(this.PLAYER_SPEED/15);
	},

	create: function() {
		console.clear();
		// Physics and World Bounds
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
    	this.world.setBounds(0, 0, this.WORLD_SIZE, this.WORLD_SIZE);

		//  Creates a blank tilemap
	    this.tileMap = this.add.tilemap();

	    //  Add a Tileset image to the map
	    this.tileMap.addTilesetImage('tileSheet');

	    //  Creates a new blank layer and sets the map dimensions.
	    this.layer0 = this.tileMap.create('layer0',this.MAP_SIZE,this.MAP_SIZE,32,32);
	    this.layer0.resizeWorld();

	    // Set collision on walls
	    this.tileMap.setCollision([0,1]);

	    // Create new Dungeon and generate it
	    this.dungeon = new Dungeon();
	    this.dungeon.generate(this.MAP_SIZE);
		this.map = this.dungeon.getMap();
		this.rooms = this.dungeon.getRooms();
	    this.stats = this.dungeon.getStats();
	    // this.dungeon.print();

	    // Translate the map into a spriteMap (check tiler.js)
	    this.tileSpriteMap = tileMapTranslate(this.map);

	    // Assign the tileSprite indices to the actual tileMap object
	   	for (var i=0; i<this.MAP_SIZE; i++) {
			for(var j=0; j<this.MAP_SIZE; j++) {
				this.tileMap.putTile(this.tileSpriteMap[i][j], i, j, this.layer0);
			}
		}

		// Create Player Sprite and enable Physics on it
		this.player = this.add.sprite(this.rooms[0].center.x*32, this.rooms[0].center.y*32, 'player');
		this.physics.enable(this.player,Phaser.Physics.ARCADE);

	    //  Assign Player Animations
	    this.player.animations.add('left', [8, 9, 10, 11], this.PLAYERFRAME_SPEED, true);
	    this.player.animations.add('right', [12, 13, 14, 15], this.PLAYERFRAME_SPEED, true);
	    this.player.animations.add('up', [4, 5, 6, 7], this.PLAYERFRAME_SPEED, true);
	    this.player.animations.add('down', [0, 1, 2, 3], this.PLAYERFRAME_SPEED, true);

	    // Other Game constraints
	    // Have the camera (Viewport) follow the Player sprite
	    this.camera.follow(this.player);

	    // A GFX marker object for drawing simple graphics such as lines and rects
		this.marker = this.add.graphics();

		// A four-directional cursor object that polls the keyboard
		this.cursors = this.input.keyboard.createCursorKeys();

		// Write the room dimensions for debug
		for(var i in this.rooms){
			var r = this.rooms[i];
			this.rooms[i].text1 = this.add.text(
				r.center.x*32, 
				r.center.y*32, 
				r.w+"x"+r.h, 
	    	{ font: "12px Arial", fill: "white", align: "center" });
		}


		this.game.input.onDown.add(this.restartGame, this);
	},

	render: function() {
		var ttile = {};
		this.layer0.getTileXY(this.player.x,this.player.y,ttile);
		var ttext = ttile.x+", "+ttile.y+" :: "+this.tileSpriteMap[ttile.x][ttile.y];
		this.game.debug.text(ttext,16,16,"white");
	},

	update: function() {
		this.physics.arcade.collide(this.player, this.layer0);

		// INPUT HANDLING
	    // Reset the players velocity (movement)
	    this.player.body.velocity.x = 0;
	    this.player.body.velocity.y = 0;
	    var moving=0;

	    // Move Up/Down
	    if (this.cursors.up.isDown) {
	       this.player.body.velocity.y = -this.PLAYER_SPEED;
	       this.player.animations.play('up');
	       moving++;
	    } else if (this.cursors.down.isDown) {
	       this.player.body.velocity.y = this.PLAYER_SPEED;
	       this.player.animations.play('down');
	       moving++;
	    }

	    // Move Left/Right
	    if (this.cursors.left.isDown) {
	        this.player.body.velocity.x = -this.PLAYER_SPEED;
	        if(!moving) this.player.animations.play('left');
	        moving++;
	    } else if (this.cursors.right.isDown) {
	        this.player.body.velocity.x = this.PLAYER_SPEED;
	        if(!moving) this.player.animations.play('right');
	        moving++;
	    }

	    // diagonal movement should be slower
	    if(moving>1){
	    	this.player.body.velocity.x *= 0.7;
	    	this.player.body.velocity.y *= 0.7;
	    }
	    //  Standing still
	    if(!moving){
	        this.player.animations.stop(null,true);
	        // this.player.frame = 0;
    	}
	},

	restartGame: function() {
		this.game.state.start('Play');
	}
};


var game = new Phaser.Game(800, 480, Phaser.AUTO, 'phaserCanvas');
game.state.add('Preloader' , Game.Preloader);
game.state.add('MainMenu' , Game.MainMenu);
game.state.add('Play' , Game.Play);
game.state.start('Preloader');
