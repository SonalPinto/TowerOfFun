// The main Game Object
// The Game!
// It shall hold all the Phaser game states
var Game = {};

// Preloader state. This where the loading screen and stuff would go... if I had one.
// Load all the assets into the cache, and onLoadComplete, run this.loadComplete
// and head to the next state.
Game.Preloader = function(){};
Game.Preloader.prototype = {
	preload: function() {
		this.game.stage.backgroundColor = '#000000';

		var style = { font: "24px Arial", fill: "white", align: "center" };
	    this.add.text(game.world.centerX, game.world.centerY, "Preloading...", style);

		this.load.spritesheet('tileSheet', '../../assets/tiles1.png',32,32);
	    this.load.image('player','../../assets/player_solo.png',32,32);

	    this.load.onLoadComplete.add(this.loadComplete, this)
	},
	loadComplete: function() {
		this.game.state.start('MainMenu');
	}
};

// The state that states itself after the Preloader. The formidable MainMenu.
// There is nothing here now. Just click to Play, rendered via text
Game.MainMenu = function(){};
Game.MainMenu.prototype = {
	preload: function() {
	},
	create: function() {
		var style = { font: "24px Arial", fill: "white", align: "center" };
		this.add.text(game.world.centerX, game.world.centerY, "MainMenu\nPlay", style);
		// Click to go to the next state (Play)
		this.game.input.onDown.add(this.startGame, this);
	},
	update: function() {
	},
	startGame: function() {
		this.game.state.start('Play');
	}
};

// The Main Game state
Game.Play = function() {
	// Game engine objects
	this.tileMap = null;
	this.marker = null;
	this.layer0 = null;
	this.cursors = null;

	// Game Logic Objects
	this.WORLD_SIZE = null;
	this.MAP_SIZE = null;
	this.TILE_SIZE = null;

	this.dungeon =null;
	this.map = null;
	this.stats = null;
	this.rooms = null;
	this.tree = null;

	// Game Entities
	this.player = null;
}
Game.Play.prototype = {

	// Set some defaults and vars when this state starts
	preload: function() {
		this.MAP_SIZE = 32;
		this.TILE_SIZE = 32;
		this.WORLD_SIZE = this.MAP_SIZE*this.TILE_SIZE;
		this.PLAYER_SPEED = 200;
	},

	create: function() {
		// Physics and World Bounds
		this.physics.startSystem(Phaser.Physics.ARCADE);
    	this.world.setBounds(0, 0, this.WORLD_SIZE, this.WORLD_SIZE);

		//  Creates a blank tilemap
	    this.tileMap = this.add.tilemap();

	    //  Add a Tileset image to the map
	    this.tileMap.addTilesetImage('tileSheet');

	    //  Creates a new blank layer and sets the map dimensions.
	    this.layer0 = this.tileMap.create('layer0',this.MAP_SIZE,this.MAP_SIZE,32,32);
	    this.layer0.resizeWorld();

	    // Set collision on walls
	    this.tileMap.setCollision(0);

	    // Add a Dungeon to the Game
	    this.dungeon = new Dungeon();
	    this.dungeon.generate(this.MAP_SIZE);
		this.map = this.dungeon.getMap();
		this.rooms = this.dungeon.getRooms();
	    this.stats = this.dungeon.getStats();
		for (var i=0; i<this.MAP_SIZE; i++) {
			for(var j=0; j<this.MAP_SIZE; j++) {
				this.tileMap.putTile(this.map[i][j],i,j,this.layer0);
			}
		}

		// Add the Player sprite at the center of the first room in the room list (it could be anywhere)
		this.player = this.add.sprite(this.rooms[0].center.x*32, this.rooms[0].center.y*32, 'player');
		this.physics.arcade.enable(this.player);

		// Have the Viewport follow the Player. See how easy this is?
	    this.camera.follow(this.player);

	    // Graphics object. Maybe I'll need it if I want to draw things. Dunno.
		this.marker = this.add.graphics();

		// Have an object to track keyboard cursor input
		this.cursors = this.input.keyboard.createCursorKeys();

		// Print out room dimensions at their centers
		for(var i in this.rooms){
			this.rooms[i].text = this.add.text(
				this.rooms[i].center.x*32, 
				this.rooms[i].center.y*32, 
				this.rooms[i].w+"x"+this.rooms[i].h, 
	    	{ font: "12px Arial", fill: "white", align: "center" });
		}

	},

	render: function() {
		// Draw dungeon stats in the top left corner
		var i=0;
		for (var key in this.stats) {
			this.game.debug.text(key+": "+this.stats[key], 16, 16+(i*16));
			i++;
		}
	},

	update: function() {
		this.physics.arcade.collide(this.player, this.layer0);

		// INPUT HANDLING
	    // Reset the players velocity (movement)
	    this.player.body.velocity.x = 0;
	    this.player.body.velocity.y = 0;
	 
	    if (this.cursors.left.isDown) {
	        //  Move to the left
	        this.player.body.velocity.x = -this.PLAYER_SPEED;
	    } else if (this.cursors.right.isDown) {
	        //  Move to the right
	        this.player.body.velocity.x = this.PLAYER_SPEED;
	    }

	    if (this.cursors.up.isDown) {
	    	// Move up
	       this.player.body.velocity.y = -this.PLAYER_SPEED;
	    } else if (this.cursors.down.isDown) {
	    	// Move down
	       this.player.body.velocity.y = this.PLAYER_SPEED;
	    }
	}
};

// Finally, instantiate Phaser with canvas dimensions of 800x480
// Assing the states to Phaser and start on the Preloader
var game = new Phaser.Game(800, 480, Phaser.AUTO, 'phaserCanvas');
game.state.add('Preloader' , Game.Preloader);
game.state.add('MainMenu' , Game.MainMenu);
game.state.add('Play' , Game.Play);
game.state.start('Preloader');
