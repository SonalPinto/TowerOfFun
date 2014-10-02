
var MAP_SIZE = 32;
Dungeon.generate(MAP_SIZE);
Dungeon.print();
var map = Dungeon.getMap();
var rooms = Dungeon.getRooms();
var tree = Dungeon.getTree();
var stats;
var gmap;
var layer0;
var marker;
var state_toggleBox = 0;

var game = new Phaser.Game(640, 384, Phaser.AUTO, 'phaserCanvas', { 
	preload: preload, 
    create: create,  
    update: update,
    render: render
});

function preload() {
	game.load.image('wall', '../../assets/wall.png');
	game.load.image('floor', '../../assets/floor.png');
    game.load.image('corridor', '../../assets/corridor.png');
    game.load.spritesheet('button', '../../assets/flixel-button.png', 80, 20);
}
 
function create() {
    //  Creates a blank tilemap
    gmap = game.add.tilemap();

    //  Add a Tileset image to the map
    gmap.addTilesetImage('wall','wall',12,12,null,null,0);
    gmap.addTilesetImage('floor','floor',12,12,null,null,1);
    gmap.addTilesetImage('corridor','corridor',12,12,null,null,2);

    //  Creates a new blank layer and sets the map dimensions.
    layer0 = gmap.create('layer0',MAP_SIZE,MAP_SIZE,12,12);
    layer0.resizeWorld();

    stats = Dungeon.getStats();
	for (var i=0; i<MAP_SIZE; i++) {
		for(var j=0; j<MAP_SIZE; j++) {
			gmap.putTile(map[i][j],i,j,layer0);
		}
	}

	game.add.button( 400, 256, 'button', genMap,this, 0, 1, 2);
	game.add.button( 400, 300, 'button', toggleBox,this, 0, 1, 2);
	marker = game.add.graphics();
	drawBox();
}

function update() {
    
}

function render() {
	game.debug.text("gen", 400+16, 256+12,'#F00');
	game.debug.text("box: "+state_toggleBox, 400+5, 300+14, '#000');

	var i=0;
	for (var key in stats) {
		game.debug.text(key+": "+stats[key], 400, 48+(i*16));
		i++;
	}

	for (var i=0; i<rooms.length; i++) {
        var r = rooms[i];
        game.debug.text(r.w+"x"+r.h, r.center.x*12, r.center.y*12);
    }
}

function genMap() {
	console.clear();
	Dungeon.generate(MAP_SIZE);
	// Dungeon.print();
	map = Dungeon.getMap();
	stats = Dungeon.getStats();
	rooms = Dungeon.getRooms();

	for (var i=0; i<MAP_SIZE; i++) {
		for(var j=0; j<MAP_SIZE; j++) {
			gmap.putTile(map[i][j],i,j,layer0);
		}
	}

	drawBox();
}

function toggleBox() {
	state_toggleBox = state_toggleBox? 0: 1 ;
	drawBox();
}


// Draws the Boxes
function drawBox() {
	if(state_toggleBox){
		marker.clear();
	    marker.lineStyle(4, 0x000000, 1);

	    tree = Dungeon.getTree();
		for (var node in tree) {
	        var t = tree[node];
	        marker.drawRect(t.x*12, t.y*12, t.w*12, t.h*12);
	    }
	} else {
		marker.clear();
	}
}


