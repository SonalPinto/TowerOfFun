// The main Game Object
// The Game!
// It shall hold all the Phaser game states
var Game = {};

// Preloader state. This where the loading screen and stuff would go... if I had one.
// Load all the assets into the cache, and onLoadComplete, run this.loadComplete
// and head to the next state.
Game.Preloader = function (){};
Game.Preloader.prototype = {
	preload: function () {
		this.game.stage.backgroundColor = '#000000';

		var style = { font: "24px Arial", fill: "white", align: "center" };
	    this.add.text(game.world.centerX, game.world.centerY, "Preloading...", style);

		this.load.spritesheet('tileSheet', '../../assets/tiles_3_final.png',32,32);
	    this.load.spritesheet('player','../../assets/player.png',32,32);
	    this.load.spritesheet('playerShadow','../../assets/playerShadow2.png',32,16);

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
Game.Play = function() {};
Game.Play.prototype = {

	// Set some defaults and vars when this state starts
	preload: function() {
		// Game engine objects
		this.tileMap = null;
		this.marker = null;
		this.layer0 = null;
		this.cursors = null;
		this.player = null;
		this.playerShadow = null;
		this.playerGroup = null;

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
	    this.tileMap.setCollision([
	    	tileLibrary.blank,
	    	tileLibrary.wallface,tileLibrary.wallface_e,tileLibrary.wallface_w, tileLibrary.wallface_cntr,
	    	tileLibrary.walltop,tileLibrary.walltop_e,tileLibrary.walltop_w, tileLibrary.walltop_cntr]);

	    // Create new Dungeon and generate it
	    this.dungeon = new Dungeon();
	    this.dungeon.generate(this.MAP_SIZE);
		this.map = this.dungeon.getMap();
		this.rooms = this.dungeon.getRooms();
	    this.stats = this.dungeon.getStats();

	    // Translate the map into a spriteMap (check tiler.js)
	    this.tileSpriteMap = tileMapTranslate(this.map);

	    // Assign the tileSprite indices to the actual tileMap object
	   	for (var i=0; i<this.MAP_SIZE; i++) {
			for(var j=0; j<this.MAP_SIZE; j++) {
				this.tileMap.putTile(this.tileSpriteMap[i][j], i, j, this.layer0);
			}
		}

		
		// Create Player Sprite at the center of the first room in the room list (it could be anywhere)
		this.player = this.add.sprite(this.rooms[0].center.x*32, this.rooms[0].center.y*32, 'player');
		// Create a shadow sprite.
		this.playerShadow = this.add.sprite(this.player.x, this.player.y+19,'playerShadow');

	    //  Assign Player Animations
	    this.player.animations.add('left', [8, 9, 10, 11], this.PLAYERFRAME_SPEED, true);
	    this.player.animations.add('right', [12, 13, 14, 15], this.PLAYERFRAME_SPEED, true);
	    this.player.animations.add('up', [4, 5, 6, 7], this.PLAYERFRAME_SPEED, true);
	    this.player.animations.add('down', [0, 1, 2, 3], this.PLAYERFRAME_SPEED, true);    

	    // Create a Player group. This will include the Player and sub-objects.
		this.playerGroup = game.add.group();
		this.playerGroup.enableBody = true;
		this.playerGroup.physicsBodyType = Phaser.Physics.ARCADE;

		// Assign Objects in the order you'd like to have them rendered
		this.playerGroup.add(this.playerShadow);
		this.playerGroup.add(this.player);

		// Reasses the bounding box of the group to be the same for each of the sub-Objects
		this.player.body.setSize(32,35,0,0);
		this.playerShadow.body.setSize(32,35,0,-19);
		

	    // Other Game constraints
	    // Have the camera (Viewport) follow the Player sprite
	    this.camera.follow(this.player);

	    // A GFX marker object for drawing simple graphics such as lines and rects
		this.marker = this.add.graphics();

		// A four-directional cursor object that polls the keyboard
		this.cursors = this.input.keyboard.createCursorKeys();

		// CLick to re-gen the dungeon (basically restart this state)
		this.game.input.onDown.add(this.restartGame, this);	
	},

	render: function() {
		// this.game.debug.body(this.player);
		// this.game.debug.body(this.playerShadow);
		// Print some debug info in the corner
		var ttile = {};
		this.layer0.getTileXY(this.player.x,this.player.y,ttile);
		var ttext = ttile.x+", "+ttile.y+" :: "+this.tileSpriteMap[ttile.x][ttile.y];
		this.game.debug.text(ttext,16,16,"white");
	},

	update: function() {
		// Check collisions on Player Group vs tilemap
		this.physics.arcade.collide(this.playerGroup, this.layer0);

		// INPUT HANDLING
	    // Reset the players velocity (movement)
	    this.playerGroup.setAll('body.velocity.x',0);
	    this.playerGroup.setAll('body.velocity.y',0);
	    var moving=0;

	    // Move Up/Down
	    if (this.cursors.up.isDown) {
	    	this.playerGroup.setAll('body.velocity.y', -this.PLAYER_SPEED);
	       this.player.animations.play('up');
	       moving++;
	    } else if (this.cursors.down.isDown) {
	       this.playerGroup.setAll('body.velocity.y', this.PLAYER_SPEED);
	       this.player.animations.play('down');
	       moving++;
	    }

	    // Move Left/Right
	    if (this.cursors.left.isDown) {
	    	this.playerGroup.setAll('body.velocity.x', -this.PLAYER_SPEED);
	        if(!moving) this.player.animations.play('left');
	        moving++;
	    } else if (this.cursors.right.isDown) {
	    	this.playerGroup.setAll('body.velocity.x', this.PLAYER_SPEED);
	        if(!moving) this.player.animations.play('right');
	        moving++;
	    }

	    // Diagonal movement should be slower. Like... duh.
	    if(moving>1){
	    	this.playerGroup.setAll('body.velocity.x', 0.7*this.player.body.velocity.x);
	    	this.playerGroup.setAll('body.velocity.y', 0.7*this.player.body.velocity.y);
	    }

	    //  Standing still
	    if(!moving){
	        this.player.animations.stop(null,true);
    	}
	},

	// Restart this state. Phaser handles everything!
	restartGame: function() {
		this.game.state.start('Play');
	},

	// draw grid
	drawGrid: function() {
		this.marker.lineStyle(1, 0x000000, 1);
		for (var i=0; i<this.MAP_SIZE; i++) {
			for(var j=0; j<this.MAP_SIZE; j++) {
				this.marker.drawRect(i*this.TILE_SIZE, j*this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
			}
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
