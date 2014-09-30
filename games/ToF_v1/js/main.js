

// var dungeon = new Dungeon();
// dungeon.generate(32);
// dungeon.print();

var Game = {};

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
		// var style = { font: "24px Arial", fill: "white", align: "center" };
		// this.add.text(game.world.centerX, game.world.centerY, "Playing now\n"+MAP_SIZE, style);

		//  Creates a blank tilemap
	    this.tileMap = this.add.tilemap();

	    //  Add a Tileset image to the map
	    this.tileMap.addTilesetImage('tileSheet');

	    //  Creates a new blank layer and sets the map dimensions.
	    this.layer0 = this.tileMap.create('layer0',this.MAP_SIZE,this.MAP_SIZE,32,32);
	    this.layer0.resizeWorld();

	    // Set collision on walls
	    this.tileMap.setCollision(0);

	    this.dungeon = new Dungeon();
	    this.dungeon.generate(this.MAP_SIZE);
		// this.dungeon.print();
		this.map = this.dungeon.getMap();
		this.rooms = this.dungeon.getRooms();
	    this.stats = this.dungeon.getStats();
		for (var i=0; i<this.MAP_SIZE; i++) {
			for(var j=0; j<this.MAP_SIZE; j++) {
				this.tileMap.putTile(this.map[i][j],i,j,this.layer0);
			}
		}

		// this.tileMap.setCollision([0],true,this.layer0,true);

		this.player = this.add.sprite(this.rooms[0].center.x*32, this.rooms[0].center.y*32, 'player');
		this.physics.arcade.enable(this.player);
	    this.player.body.collideWorldBounds = true;

	    this.camera.follow(this.player);

		this.marker = this.add.graphics();

		this.cursors = this.input.keyboard.createCursorKeys();

		for(var i in this.rooms){
			this.rooms[i].text = this.add.text(
				this.rooms[i].center.x*32, 
				this.rooms[i].center.y*32, 
				this.rooms[i].w+"x"+this.rooms[i].h, 
	    	{ font: "12px Arial", fill: "white", align: "center" });
		}

	},

	render: function() {
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
	       this.player.body.velocity.y = -this.PLAYER_SPEED;
	    } else if (this.cursors.down.isDown) {
	       this.player.body.velocity.y = this.PLAYER_SPEED;
	    }
	}
};


var game = new Phaser.Game(800, 480, Phaser.AUTO, 'phaserCanvas');
game.state.add('Preloader' , Game.Preloader);
game.state.add('MainMenu' , Game.MainMenu);
game.state.add('Play' , Game.Play);
game.state.start('Preloader');
